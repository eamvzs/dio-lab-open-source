import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { geminiModel, buildInterviewSystemPrompt } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { sessionId, answer } = await req.json();

  if (!sessionId || !answer?.trim()) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  // Load session
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

  // Save candidate answer
  await prisma.message.create({
    data: {
      sessionId,
      role: "candidate",
      content: answer.trim(),
    },
  });

  // Rebuild chat history for Gemini
  const systemPrompt = buildInterviewSystemPrompt(
    interviewSession.role,
    interviewSession.level,
    interviewSession.companyType
  );

  // Build history: all messages except the last (which we just added)
  const history = interviewSession.messages.map((msg) => ({
    role: msg.role === "interviewer" ? ("model" as const) : ("user" as const),
    parts: [{ text: msg.content }],
  }));

  // Add system trigger (first message from model was the opener)
  const fullHistory = [
    {
      role: "user" as const,
      parts: [{ text: "Inicie a entrevista com uma apresentação breve e a primeira pergunta de aquecimento." }],
    },
    ...history,
    {
      role: "user" as const,
      parts: [{ text: answer.trim() }],
    },
  ];

  const chat = geminiModel.startChat({
    history: fullHistory.slice(0, -1), // all but last
    systemInstruction: systemPrompt,
  });

  const result = await chat.sendMessage(answer.trim());
  const interviewerResponse = result.response.text();

  // Save interviewer response
  await prisma.message.create({
    data: {
      sessionId,
      role: "interviewer",
      content: interviewerResponse,
    },
  });

  // Check if interview is ending (heuristic: look for farewell signals)
  const endingSignals = [
    "encerramos",
    "encerrar a entrevista",
    "feedback estará disponível",
    "obrigado pela sua participação",
    "boa sorte",
    "foi um prazer",
    "até logo",
  ];
  const isEnding = endingSignals.some((signal) =>
    interviewerResponse.toLowerCase().includes(signal)
  );

  if (isEnding) {
    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { status: "completing" },
    });
  }

  return NextResponse.json({
    message: interviewerResponse,
    isEnding,
  });
}
