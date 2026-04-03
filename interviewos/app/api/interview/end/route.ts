import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { geminiModel, buildFeedbackPrompt } from "@/lib/gemini";
import { getMockFeedback } from "@/lib/gemini-mock";

const isDemo =
  !process.env.GEMINI_API_KEY ||
  process.env.GEMINI_API_KEY === "your-gemini-api-key";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { sessionId } = await req.json();

  if (!sessionId) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  const interviewSession = await prisma.interviewSession.findUnique({
    where: { id: sessionId, userId: session.user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!interviewSession) {
    return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
  }

  if (interviewSession.status === "completed") {
    return NextResponse.json({ feedback: JSON.parse(interviewSession.feedback!) });
  }

  let feedback: object;

  if (isDemo) {
    feedback = getMockFeedback(interviewSession.role);
  } else {
    const feedbackPrompt = buildFeedbackPrompt(
      interviewSession.role,
      interviewSession.level,
      interviewSession.companyType,
      interviewSession.messages.map((m) => ({ role: m.role, content: m.content }))
    );

    const result = await geminiModel.generateContent(feedbackPrompt);
    let feedbackText = result.response.text()
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    try {
      feedback = JSON.parse(feedbackText);
    } catch {
      feedback = getMockFeedback(interviewSession.role, 60);
    }
  }

  const feedbackData = feedback as { score: number };

  await prisma.interviewSession.update({
    where: { id: sessionId },
    data: {
      status: "completed",
      score: feedbackData.score,
      feedback: JSON.stringify(feedback),
      endedAt: new Date(),
    },
  });

  return NextResponse.json({ feedback });
}
