import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { geminiModel, buildInterviewSystemPrompt, ROLE_LABELS, LEVEL_LABELS, COMPANY_LABELS } from "@/lib/gemini";
import { getMockOpener } from "@/lib/gemini-mock";

const isDemo =
  !process.env.GEMINI_API_KEY ||
  process.env.GEMINI_API_KEY === "your-gemini-api-key";

// Whitelist explícita de valores aceitos
const VALID_ROLES = Object.keys(ROLE_LABELS);
const VALID_LEVELS = Object.keys(LEVEL_LABELS);
const VALID_COMPANIES = Object.keys(COMPANY_LABELS);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { role, level, companyType } = body;

  // FIX ALTA: whitelist — rejeita qualquer valor fora do conjunto esperado
  if (
    !VALID_ROLES.includes(role) ||
    !VALID_LEVELS.includes(level) ||
    !VALID_COMPANIES.includes(companyType)
  ) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  const interviewSession = await prisma.interviewSession.create({
    data: { userId: session.user.id, role, level, companyType, status: "active" },
  });

  let firstMessage: string;

  if (isDemo) {
    firstMessage = getMockOpener(role);
  } else {
    const systemPrompt = buildInterviewSystemPrompt(role, level, companyType);
    const chat = geminiModel.startChat({ history: [], systemInstruction: systemPrompt });
    const result = await chat.sendMessage(
      "Inicie a entrevista com uma apresentação breve e a primeira pergunta de aquecimento."
    );
    firstMessage = result.response.text();
  }

  await prisma.message.create({
    data: { sessionId: interviewSession.id, role: "interviewer", content: firstMessage },
  });

  return NextResponse.json({ sessionId: interviewSession.id, message: firstMessage });
}
