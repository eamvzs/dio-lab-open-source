import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const interviewSession = await prisma.interviewSession.findUnique({
    where: { id: params.sessionId, userId: session.user.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true, content: true, createdAt: true },
      },
    },
  });

  if (!interviewSession) {
    return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
  }

  return NextResponse.json({
    id: interviewSession.id,
    role: interviewSession.role,
    level: interviewSession.level,
    companyType: interviewSession.companyType,
    status: interviewSession.status,
    messages: interviewSession.messages,
  });
}
