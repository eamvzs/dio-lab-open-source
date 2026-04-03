import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const sessions = await prisma.interviewSession.findMany({
    where: { userId: session.user.id },
    orderBy: { startedAt: "desc" },
    take: 20,
    select: {
      id: true,
      role: true,
      level: true,
      companyType: true,
      status: true,
      score: true,
      startedAt: true,
      endedAt: true,
      _count: { select: { messages: true } },
    },
  });

  // Compute stats
  const completed = sessions.filter((s) => s.status === "completed");
  const scores = completed.map((s) => s.score).filter(Boolean) as number[];
  const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

  const roleCounts = sessions.reduce<Record<string, number>>((acc, s) => {
    acc[s.role] = (acc[s.role] || 0) + 1;
    return acc;
  }, {});
  const mostPracticedRole = Object.entries(roleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";

  return NextResponse.json({
    sessions,
    stats: {
      totalSessions: sessions.length,
      completedSessions: completed.length,
      averageScore,
      bestScore,
      mostPracticedRole,
    },
  });
}
