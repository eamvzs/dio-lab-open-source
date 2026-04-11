import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

function generateToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// POST /api/share — gera ou retorna token de compartilhamento para uma sessão
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (!rateLimit(`share:${session.user.id}`, 20, 60 * 60 * 1000).allowed) {
    return NextResponse.json({ error: "Muitas requisições." }, { status: 429 });
  }

  const { sessionId } = await req.json();
  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  const interviewSession = await prisma.interviewSession.findUnique({
    where: { id: sessionId, userId: session.user.id },
    select: { id: true, status: true, shareToken: true },
  });

  if (!interviewSession) {
    return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
  }

  if (interviewSession.status !== "completed") {
    return NextResponse.json({ error: "Sessão não concluída" }, { status: 400 });
  }

  // Reutiliza token existente ou gera novo
  let token = interviewSession.shareToken;
  if (!token) {
    // Tenta até encontrar um token único
    for (let i = 0; i < 5; i++) {
      const candidate = generateToken();
      const exists = await prisma.interviewSession.findUnique({ where: { shareToken: candidate } });
      if (!exists) { token = candidate; break; }
    }
    if (!token) {
      return NextResponse.json({ error: "Erro ao gerar token" }, { status: 500 });
    }
    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { shareToken: token },
    });
  }

  return NextResponse.json({ token, shareUrl: `/share/${token}` });
}
