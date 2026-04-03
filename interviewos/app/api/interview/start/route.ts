import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { geminiModel, buildInterviewSystemPrompt } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { role, level, companyType } = body;

  if (!role || !level || !companyType) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  // Create interview session in DB
  const interviewSession = await prisma.interviewSession.create({
    data: {
      userId: session.user.id,
      role,
      level,
      companyType,
      status: "active",
    },
  });

  // Build system prompt and get first message from Gemini
  const systemPrompt = buildInterviewSystemPrompt(role, level, companyType);

  const chat = geminiModel.startChat({
    history: [],
    systemInstruction: systemPrompt,
  });

  const result = await chat.sendMessage(
    "Inicie a entrevista com uma apresentação breve e a primeira pergunta de aquecimento."
  );

  const firstMessage = result.response.text();

  // Save first message to DB
  await prisma.message.create({
    data: {
      sessionId: interviewSession.id,
      role: "interviewer",
      content: firstMessage,
    },
  });

  return NextResponse.json({
    sessionId: interviewSession.id,
    message: firstMessage,
  });
}
