import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/share/[token] — rota pública, sem auth
export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params;

  if (!token || typeof token !== "string" || token.length > 32) {
    return NextResponse.json({ error: "Token inválido" }, { status: 400 });
  }

  const session = await prisma.interviewSession.findUnique({
    where: { shareToken: token },
    select: {
      role: true,
      level: true,
      companyType: true,
      score: true,
      feedback: true,
      status: true,
      endedAt: true,
    },
  });

  if (!session || session.status !== "completed" || !session.feedback) {
    return NextResponse.json({ error: "Resultado não encontrado" }, { status: 404 });
  }

  let feedbackData: unknown;
  try {
    feedbackData = JSON.parse(session.feedback);
  } catch {
    return NextResponse.json({ error: "Erro ao carregar resultado" }, { status: 500 });
  }

  return NextResponse.json({
    role: session.role,
    level: session.level,
    companyType: session.companyType,
    score: session.score,
    endedAt: session.endedAt,
    feedback: feedbackData,
  });
}
