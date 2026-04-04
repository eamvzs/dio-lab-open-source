import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { geminiModel, buildInterviewSystemPrompt } from "@/lib/gemini";
import { getMockNextQuestion } from "@/lib/gemini-mock";

const isDemo =
  !process.env.GEMINI_API_KEY ||
  process.env.GEMINI_API_KEY === "your-gemini-api-key";

const MAX_ANSWER_LENGTH = 4000;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { sessionId, answer } = await req.json();

  if (
    !sessionId ||
    typeof sessionId !== "string" ||
    !answer?.trim() ||
    typeof answer !== "string"
  ) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  // FIX: limita tamanho da resposta para evitar payload abuse
  const sanitizedAnswer = answer.trim().slice(0, MAX_ANSWER_LENGTH);

  // Valida que a sessão pertence ao usuário autenticado
  const interviewSession = await prisma.interviewSession.findUnique({
    where: { id: sessionId, userId: session.user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!interviewSession) {
    return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
  }

  if (interviewSession.status !== "active") {
    return NextResponse.json({ error: "Entrevista encerrada" }, { status: 400 });
  }

  await prisma.message.create({
    data: { sessionId, role: "candidate", content: sanitizedAnswer },
  });

  let interviewerResponse: string;
  let isEnding = false;

  if (isDemo) {
    const questionCount =
      interviewSession.messages.filter((m) => m.role === "interviewer").length - 1;
    const result = getMockNextQuestion(interviewSession.role, questionCount, sanitizedAnswer);
    interviewerResponse = result.message;
    isEnding = result.isEnding;
  } else {
    try {
      const systemPrompt = buildInterviewSystemPrompt(
        interviewSession.role,
        interviewSession.level,
        interviewSession.companyType
      );

      const history = interviewSession.messages.map((msg) => ({
        role: msg.role === "interviewer" ? ("model" as const) : ("user" as const),
        parts: [{ text: msg.content }],
      }));

      // Embute system prompt no início do histórico — sem systemInstruction
      const fullHistory = [
        {
          role: "user" as const,
          parts: [{ text: systemPrompt + "\n\n---\n\nInicie a entrevista com uma apresentação breve e a primeira pergunta de aquecimento." }],
        },
        ...history,
      ];

      const chat = geminiModel.startChat({
        history: fullHistory.slice(0, -1),
      });

      const result = await chat.sendMessage(sanitizedAnswer);
      interviewerResponse = result.response.text();

      const endingSignals = [
        "encerramos", "encerrar a entrevista", "feedback estará disponível",
        "obrigado pela sua participação", "boa sorte", "foi um prazer", "até logo",
      ];
      isEnding = endingSignals.some((s) => interviewerResponse.toLowerCase().includes(s));
    } catch (err) {
      console.error("[Gemini] Erro na rota answer:", err);
      const questionCount =
        interviewSession.messages.filter((m) => m.role === "interviewer").length - 1;
      const fallback = getMockNextQuestion(interviewSession.role, questionCount, sanitizedAnswer);
      interviewerResponse = fallback.message;
      isEnding = fallback.isEnding;
    }
  }

  await prisma.message.create({
    data: { sessionId, role: "interviewer", content: interviewerResponse },
  });

  if (isEnding) {
    await prisma.interviewSession.update({
      where: { id: sessionId, userId: session.user.id },
      data: { status: "completing" },
    });
  }

  return NextResponse.json({ message: interviewerResponse, isEnding });
}
