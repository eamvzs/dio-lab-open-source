import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { geminiModel, buildFeedbackPrompt } from "@/lib/gemini";

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

  // Generate feedback with Gemini
  const feedbackPrompt = buildFeedbackPrompt(
    interviewSession.role,
    interviewSession.level,
    interviewSession.companyType,
    interviewSession.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }))
  );

  const result = await geminiModel.generateContent(feedbackPrompt);
  let feedbackText = result.response.text();

  // Clean potential markdown code blocks
  feedbackText = feedbackText
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  let feedback;
  try {
    feedback = JSON.parse(feedbackText);
  } catch {
    // Fallback feedback if JSON parsing fails
    feedback = {
      score: 60,
      summary: "Entrevista concluída. Não foi possível gerar feedback detalhado automaticamente.",
      strengths: ["Participou da entrevista até o fim", "Demonstrou interesse na vaga"],
      improvements: [
        {
          area: "Revisão manual",
          description: "O feedback automático não pôde ser gerado.",
          suggestion: "Revise suas respostas e identifique pontos a melhorar.",
        },
      ],
      studyPlan: [
        {
          topic: "Fundamentos da área",
          priority: "alta",
          resources: ["MDN Web Docs", "Documentação oficial"],
        },
      ],
      verdict: "em_desenvolvimento",
      verdictMessage: "Continue praticando para melhorar seus resultados.",
    };
  }

  // Save feedback and mark as completed
  await prisma.interviewSession.update({
    where: { id: sessionId },
    data: {
      status: "completed",
      score: feedback.score,
      feedback: JSON.stringify(feedback),
      endedAt: new Date(),
    },
  });

  return NextResponse.json({ feedback });
}
