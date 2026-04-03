"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Terminal,
  Plus,
  Trophy,
  Target,
  TrendingUp,
  Clock,
  ChevronRight,
  Loader2,
  BarChart3,
} from "lucide-react";
import { DashboardStats } from "@/types";
import { ROLE_LABELS, COMPANY_LABELS, LEVEL_LABELS } from "@/lib/gemini";
import { cn, formatDate, getScoreColor, getVerdictLabel } from "@/lib/utils";

interface SessionSummary {
  id: string;
  role: string;
  level: string;
  companyType: string;
  status: string;
  score: number | null;
  startedAt: string;
  endedAt: string | null;
  _count: { messages: number };
}

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "outline" | "info" }> = {
  completed: { label: "Concluída", variant: "success" },
  active: { label: "Em andamento", variant: "info" },
  completing: { label: "Encerrando", variant: "warning" },
  abandoned: { label: "Abandonada", variant: "outline" },
};

export default function DashboardPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/history");
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions);
          setStats(data.stats);
        }
      } catch {
        console.error("Erro ao carregar histórico");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            InterviewOS
          </Link>
          <Button asChild size="sm" className="gap-2">
            <Link href="/setup">
              <Plus className="w-4 h-4" />
              Nova entrevista
            </Link>
          </Button>
        </div>
      </header>

      <main className="container max-w-4xl py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Seu progresso</h1>
          <p className="text-muted-foreground text-sm">Histórico de entrevistas e evolução ao longo do tempo</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                      <BarChart3 className="w-3.5 h-3.5" />
                      Total de sessões
                    </div>
                    <p className="text-3xl font-bold">{stats.totalSessions}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.completedSessions} concluídas
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Média de score
                    </div>
                    <p className={cn("text-3xl font-bold", stats.averageScore > 0 ? getScoreColor(stats.averageScore) : "text-muted-foreground")}>
                      {stats.averageScore > 0 ? stats.averageScore : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">de 100 pontos</p>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                      <Trophy className="w-3.5 h-3.5" />
                      Melhor score
                    </div>
                    <p className={cn("text-3xl font-bold", stats.bestScore > 0 ? getScoreColor(stats.bestScore) : "text-muted-foreground")}>
                      {stats.bestScore > 0 ? stats.bestScore : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">recorde pessoal</p>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                      <Target className="w-3.5 h-3.5" />
                      Mais praticado
                    </div>
                    <p className="text-sm font-bold leading-tight">
                      {stats.mostPracticedRole
                        ? ROLE_LABELS[stats.mostPracticedRole]?.split(" ")[0] || "—"
                        : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.mostPracticedRole
                        ? ROLE_LABELS[stats.mostPracticedRole]?.split(" ").slice(1).join(" ")
                        : "nenhuma sessão ainda"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Sessions list */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Histórico de entrevistas</h2>

              {sessions.length === 0 ? (
                <Card className="border-border/50 border-dashed">
                  <CardContent className="py-16 text-center">
                    <Terminal className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-40" />
                    <p className="font-medium mb-2">Nenhuma entrevista ainda</p>
                    <p className="text-sm text-muted-foreground mb-6">
                      Faça sua primeira simulação e veja seu progresso aqui
                    </p>
                    <Button asChild>
                      <Link href="/setup">Começar primeira entrevista</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => {
                    const status = statusConfig[session.status] || statusConfig.abandoned;
                    return (
                      <Card
                        key={session.id}
                        className="border-border/50 hover:border-border transition-colors"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-medium text-sm">
                                  {ROLE_LABELS[session.role]}
                                </span>
                                <Badge variant={status.variant} className="text-xs">
                                  {status.label}
                                </Badge>
                                {session.score !== null && (
                                  <span className={cn("text-sm font-bold", getScoreColor(session.score))}>
                                    {session.score} pts
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>{COMPANY_LABELS[session.companyType]}</span>
                                <span>·</span>
                                <span>{LEVEL_LABELS[session.level]}</span>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(session.startedAt)}
                                </span>
                              </div>
                            </div>

                            {session.status === "completed" ? (
                              <Button variant="ghost" size="sm" asChild className="gap-1 shrink-0">
                                <Link href={`/feedback/${session.id}`}>
                                  Ver feedback
                                  <ChevronRight className="w-3 h-3" />
                                </Link>
                              </Button>
                            ) : session.status === "active" || session.status === "completing" ? (
                              <Button size="sm" asChild className="shrink-0">
                                <Link href={`/interview/${session.id}`}>
                                  Continuar
                                </Link>
                              </Button>
                            ) : null}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
