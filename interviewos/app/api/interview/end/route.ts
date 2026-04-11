import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { geminiModel, buildFeedbackPrompt } from "@/lib/gemini";
import { getMockFeedback } from "@/lib/gemini-mock";
import { rateLimit } from "@/lib/rate-limit";

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

  // 20 gerações de feedback por hora por usuário
  if (!rateLimit(`end:${session.user.id}`, 20, 60 * 60 * 1000).allowed) {
    return NextResponse.json(
      { error: "Muitas requisições. Aguarde antes de gerar novo feedback." },
      { status: 429 }
    );
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

  let feedback: unknown = null;

  if (isDemo) {
    feedback = getMockFeedback(interviewSession.role);
  } else {
    const lang = (interviewSession.language ?? "pt-BR") as "pt-BR" | "en-US";
    const feedbackPrompt = buildFeedbackPrompt(
      interviewSession.role,
      interviewSession.level,
      interviewSession.companyType,
      interviewSession.messages.map((m) => ({ role: m.role, content: m.content })),
      lang
    );

    for (let attempt = 0; attempt < 3 && !feedback; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, attempt * 1500));
        }
        const result = await geminiModel.generateContent(feedbackPrompt);
        const text = result.response
          .text()
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        const parsed = JSON.parse(text);
        if (isValidFeedback(parsed)) feedback = parsed;
        else console.warn(`[Gemini] Tentativa ${attempt + 1}: JSON inválido, tentando novamente`);
      } catch (err) {
        console.error(`[Gemini] Tentativa ${attempt + 1} falhou:`, err);
      }
    }

    if (!feedback) {
      console.warn("[Gemini] Todas as tentativas falharam, usando mock");
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
