import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { geminiModel, buildFeedbackPrompt } from "@/lib/gemini";
import { getMockFeedback } from "@/lib/gemini-mock";

const isDemo =
  !process.env.GEMINI_API_KEY ||
  process.env.GEMINI_API_KEY === "your-gemini-api-key";

function isValidFeedback(obj: unknown): obj is {
  score: number;
  summary: string;
  strengths: string[];
  improvements: unknown[];
  studyPlan: unknown[];
  verdict: string;
  verdictMessage: string;
} {
  if (!obj || typeof obj !== "object") return false;
  const f = obj as Record<string, unknown>;
  return (
    typeof f.score === "number" &&
    f.score >= 0 &&
    f.score <= 100 &&
    typeof f.summary === "string" &&
    Array.isArray(f.strengths) &&
    Array.isArray(f.improvements) &&
    Array.isArray(f.studyPlan) &&
    typeof f.verdict === "string" &&
    ["aprovado", "em_desenvolvimento", "precisa_evoluir"].includes(f.verdict) &&
    typeof f.verdictMessage === "string"
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { sessionId } = await req.json();

  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  // FIX CRÍTICO: filtra por userId para impedir acesso cruzado entre usuários
  const interviewSession = await prisma.interviewSession.findUnique({
    where: { id: sessionId, userId: session.user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!interviewSession) {
    return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
  }

  if (interviewSession.status === "completed") {
    try {
      const stored = JSON.parse(interviewSession.feedback!);
      if (!isValidFeedback(stored)) throw new Error("Estrutura inválida");
      return NextResponse.json({ feedback: stored });
    } catch {
      // Se feedback armazenado for inválido, regenera
    }
  }

  let feedback: unknown;

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
    const feedbackText = result.response
      .text()
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    try {
      const parsed = JSON.parse(feedbackText);
      feedback = isValidFeedback(parsed) ? parsed : getMockFeedback(interviewSession.role, 60);
    } catch {
      feedback = getMockFeedback(interviewSession.role, 60);
    }
  }

  if (!isValidFeedback(feedback)) {
    return NextResponse.json({ error: "Erro ao gerar feedback" }, { status: 500 });
  }

  // FIX CRÍTICO: inclui userId no update para garantir que só o dono pode atualizar
  await prisma.interviewSession.update({
    where: { id: sessionId, userId: session.user.id },
    data: {
      status: "completed",
      score: feedback.score,
      feedback: JSON.stringify(feedback),
      endedAt: new Date(),
    },
  });

  return NextResponse.json({ feedback });
}
