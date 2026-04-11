import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { geminiModel, buildInterviewSystemPrompt, ROLE_LABELS, LEVEL_LABELS, COMPANY_LABELS } from "@/lib/gemini";
import { getMockOpener } from "@/lib/gemini-mock";
import { rateLimit } from "@/lib/rate-limit";

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

  // 10 entrevistas iniciadas por hora por usuário
  if (!rateLimit(`start:${session.user.id}`, 10, 60 * 60 * 1000).allowed) {
    return NextResponse.json(
      { error: "Muitas requisições. Aguarde antes de iniciar outra entrevista." },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { role, level, companyType, language } = body;
  const lang = language === "en-US" ? "en-US" : "pt-BR";

  // FIX ALTA: whitelist — rejeita qualquer valor fora do conjunto esperado
  if (
    !VALID_ROLES.includes(role) ||
    !VALID_LEVELS.includes(level) ||
    !VALID_COMPANIES.includes(companyType)
  ) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  const interviewSession = await prisma.interviewSession.create({
    data: { userId: session.user.id, role, level, companyType, language: lang, status: "active" },
  });

  let firstMessage: string;

  if (isDemo) {
    firstMessage = getMockOpener(role);
  } else {
    try {
      const systemPrompt = buildInterviewSystemPrompt(role, level, companyType, lang);
      const openingInstruction = lang === "en-US"
        ? "\n\n---\n\nNow start the interview with a brief introduction and the first warm-up question. Respond directly as the interviewer, without extra commentary."
        : "\n\n---\n\nAgora inicie a entrevista com uma apresentação breve e a primeira pergunta de aquecimento. Responda diretamente como o entrevistador, sem comentários extras.";
      const result = await geminiModel.generateContent(systemPrompt + openingInstruction);
      firstMessage = result.response.text();
    } catch (err) {
      console.error("[Gemini] Erro na rota start:", err);
      firstMessage = getMockOpener(role);
    }
  }

  await prisma.message.create({
    data: { sessionId: interviewSession.id, role: "interviewer", content: firstMessage },
  });

  return NextResponse.json({ sessionId: interviewSession.id, message: firstMessage });
}
