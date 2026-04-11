"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Terminal,
  Plus,
  Trophy,
  Target,
  TrendingUp,
  Clock,
  ChevronRight,
  BarChart3,
  Flame,
  Filter,
} from "lucide-react";
import { DashboardStats } from "@/types";
import { ROLE_LABELS, COMPANY_LABELS, LEVEL_LABELS } from "@/lib/gemini";
import { cn, formatDate, getScoreColor, getScoreBg } from "@/lib/utils";
import { OnboardingModal } from "@/components/onboarding-modal";

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

const BADGES = [
  { id: "first",   icon: "🎯", title: "Primeira entrevista", desc: "Completou a primeira entrevista" },
  { id: "five",    icon: "🔥", title: "5 entrevistas",        desc: "Completou 5 entrevistas" },
  { id: "score80", icon: "⭐", title: "Score 80+",            desc: "Atingiu score acima de 80" },
  { id: "perfect", icon: "💎", title: "Perfeição",            desc: "Score 100 em uma entrevista" },
  { id: "variety", icon: "🌟", title: "Explorador",           desc: "Praticou 3 vagas diferentes" },
  { id: "streak3", icon: "🏆", title: "Dedicado",             desc: "3 dias consecutivos praticando" },
];

function checkBadge(id: string, stats: DashboardStats, sessions: SessionSummary[], streak: number): boolean {
  const completed = sessions.filter((s) => s.status === "completed");
  switch (id) {
    case "first":   return stats.completedSessions >= 1;
    case "five":    return stats.completedSessions >= 5;
    case "score80": return stats.bestScore >= 80;
    case "perfect": return stats.bestScore >= 100;
    case "variety": return new Set(completed.map((s) => s.role)).size >= 3;
    case "streak3": return streak >= 3;
    default:        return false;
  }
}

function calculateStreak(sessions: SessionSummary[]): number {
  const days = [
    ...new Set(
      sessions
        .filter((s) => s.status === "completed")
        .map((s) => new Date(s.startedAt).toDateString())
    ),
  ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (days.length === 0) return 0;

  let streak = 0;
  let ref = new Date();
  ref.setHours(0, 0, 0, 0);

  for (const d of days) {
    const day = new Date(d);
    day.setHours(0, 0, 0, 0);
    const diff = Math.round((ref.getTime() - day.getTime()) / 86400000);
    if (diff <= 1) { streak++; ref = day; }
    else break;
  }
  return streak;
}

function SkeletonStatCard() {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="skeleton h-3 w-28 bg-muted rounded mb-3" />
        <div className="skeleton h-9 w-16 bg-muted rounded mb-2" />
        <div className="skeleton h-3 w-20 bg-muted rounded" />
      </CardContent>
    </Card>
  );
}

function SkeletonSessionRow() {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <div className="skeleton h-4 w-36 bg-muted rounded" />
              <div className="skeleton h-4 w-16 bg-muted rounded" />
            </div>
            <div className="skeleton h-3 w-52 bg-muted rounded" />
          </div>
          <div className="skeleton h-8 w-24 bg-muted rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreChart({ sessions }: { sessions: SessionSummary[] }) {
  const completed = sessions
    .filter((s) => s.status === "completed" && s.score !== null)
    .slice()
    .reverse();

  if (completed.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm gap-2">
        <BarChart3 className="w-6 h-6 opacity-30" />
        <span>Conclua pelo menos 2 entrevistas para ver a evolução</span>
      </div>
    );
  }

  const W = 600; const H = 160;
  const pad = { top: 16, right: 24, bottom: 32, left: 36 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;
  const scores = completed.map((s) => s.score as number);
  const lo = Math.max(0, Math.min(...scores) - 15);
  const hi = Math.min(100, Math.max(...scores) + 15);
  const px = (i: number) => pad.left + (i / (completed.length - 1)) * cW;
  const py = (v: number) => pad.top + cH - ((v - lo) / (hi - lo)) * cH;
  const pts = completed.map((s, i) => `${px(i)},${py(s.score as number)}`).join(" ");
  const area = `${px(0)},${pad.top + cH} ${pts} ${px(completed.length - 1)},${pad.top + cH}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
      {[0, 25, 50, 75, 100].filter((v) => v >= lo && v <= hi).map((v) => (
        <g key={v}>
          <line x1={pad.left} y1={py(v)} x2={W - pad.right} y2={py(v)}
            stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />
          <text x={pad.left - 6} y={py(v) + 4} textAnchor="end"
            fontSize={10} fill="currentColor" fillOpacity={0.35}>{v}</text>
        </g>
      ))}
      <polygon points={area} fill="hsl(var(--primary))" fillOpacity={0.12} />
      <polyline points={pts} fill="none" stroke="hsl(var(--primary))"
        strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {completed.map((s, i) => (
        <g key={i}>
          <circle cx={px(i)} cy={py(s.score as number)} r={5}
            fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth={2} />
          <text x={px(i)} y={pad.top + cH + 20} textAnchor="middle"
            fontSize={9} fill="currentColor" fillOpacity={0.4}>
            {new Date(s.startedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/history");
        if (res.status === 401) { window.location.href = "/login"; return; }
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions);
          setStats(data.stats);
        }
      } catch { console.error("Erro ao carregar histórico"); }
      finally { setIsLoading(false); }
    };
    load();
  }, []);

  const streak = useMemo(() => calculateStreak(sessions), [sessions]);

  const filteredSessions = useMemo(() =>
    sessions.filter((s) =>
      (filterRole === "all" || s.role === filterRole) &&
      (filterStatus === "all" || s.status === filterStatus)
    ), [sessions, filterRole, filterStatus]);

  const roleProgress = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    sessions.filter((s) => s.status === "completed" && s.score !== null).forEach((s) => {
      if (!map[s.role]) map[s.role] = { count: 0, total: 0 };
      map[s.role].count++;
      map[s.role].total += s.score as number;
    });
    return Object.entries(map)
      .map(([role, d]) => ({ role, count: d.count, avg: Math.round(d.total / d.count) }))
      .sort((a, b) => b.count - a.count);
  }, [sessions]);

  const availableRoles = useMemo(() =>
    [...new Set(sessions.map((s) => s.role))], [sessions]);

  return (
    <div className="min-h-screen bg-background">
      <OnboardingModal />
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
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[0,1,2,3].map((i) => <SkeletonStatCard key={i} />)}
            </div>
            <Card className="border-border/50"><CardContent className="p-6">
              <div className="skeleton h-4 w-40 bg-muted rounded mb-4" />
              <div className="skeleton h-40 w-full bg-muted rounded" />
            </CardContent></Card>
            <div className="space-y-3">{[0,1,2].map((i) => <SkeletonSessionRow key={i} />)}</div>
          </>
        ) : (
          <>
            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-border/50 animate-fade-in-up">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                      <BarChart3 className="w-3.5 h-3.5" />Total de sessões
                    </div>
                    <p className="text-3xl font-bold">{stats.totalSessions}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stats.completedSessions} concluídas</p>
                  </CardContent>
                </Card>
                <Card className="border-border/50 animate-fade-in-up animate-delay-100">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                      <TrendingUp className="w-3.5 h-3.5" />Média de score
                    </div>
                    <p className={cn("text-3xl font-bold", stats.averageScore > 0 ? getScoreColor(stats.averageScore) : "text-muted-foreground")}>
                      {stats.averageScore > 0 ? stats.averageScore : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">de 100 pontos</p>
                  </CardContent>
                </Card>
                <Card className="border-border/50 animate-fade-in-up animate-delay-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                      <Trophy className="w-3.5 h-3.5" />Melhor score
                    </div>
                    <p className={cn("text-3xl font-bold", stats.bestScore > 0 ? getScoreColor(stats.bestScore) : "text-muted-foreground")}>
                      {stats.bestScore > 0 ? stats.bestScore : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">recorde pessoal</p>
                  </CardContent>
                </Card>
                <Card className="border-border/50 animate-fade-in-up animate-delay-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />Streak atual
                    </div>
                    <p className={cn("text-3xl font-bold", streak > 0 ? "text-orange-400" : "text-muted-foreground")}>
                      {streak > 0 ? streak : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{streak === 1 ? "dia seguido" : streak > 1 ? "dias seguidos" : "nenhum ainda"}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Badges */}
            {stats && (
              <Card className="border-border/50 animate-fade-in-up animate-delay-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    Conquistas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {BADGES.map((badge) => {
                      const unlocked = checkBadge(badge.id, stats, sessions, streak);
                      return (
                        <div key={badge.id} title={badge.desc}
                          className={cn(
                            "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all",
                            unlocked
                              ? "border-primary/40 bg-primary/10"
                              : "border-border/30 bg-muted/20 opacity-40 grayscale"
                          )}>
                          <span className="text-2xl">{badge.icon}</span>
                          <span className="text-xs font-medium leading-tight">{badge.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Score chart */}
            <Card className="border-border/50 animate-fade-in-up animate-delay-400">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Evolução de score
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <ScoreChart sessions={sessions} />
              </CardContent>
            </Card>

            {/* Progress by role */}
            {roleProgress.length > 0 && (
              <Card className="border-border/50 animate-fade-in-up animate-delay-400">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Progresso por vaga
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {roleProgress.map((r) => (
                    <div key={r.role} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{ROLE_LABELS[r.role]}</span>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{r.count}x praticado</span>
                          <span className={cn("font-bold text-sm", getScoreColor(r.avg))}>{r.avg} pts</span>
                        </div>
                      </div>
                      <Progress value={r.avg} className={cn("h-2 [&>div]:", getScoreBg(r.avg))} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Sessions list */}
            <div>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h2 className="text-lg font-semibold">Histórico de entrevistas</h2>
                {sessions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="text-xs bg-card border border-border/50 rounded-lg px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="all">Todos os status</option>
                      <option value="completed">Concluídas</option>
                      <option value="active">Em andamento</option>
                      <option value="abandoned">Abandonadas</option>
                    </select>
                    {availableRoles.length > 1 && (
                      <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="text-xs bg-card border border-border/50 rounded-lg px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="all">Todas as vagas</option>
                        {availableRoles.map((r) => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>

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
              ) : filteredSessions.length === 0 ? (
                <Card className="border-border/50 border-dashed">
                  <CardContent className="py-10 text-center">
                    <p className="text-muted-foreground text-sm">Nenhuma entrevista encontrada com esses filtros</p>
                    <Button variant="ghost" size="sm" className="mt-3" onClick={() => { setFilterRole("all"); setFilterStatus("all"); }}>
                      Limpar filtros
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredSessions.map((session, i) => {
                    const status = statusConfig[session.status] || statusConfig.abandoned;
                    return (
                      <Card key={session.id}
                        className={cn("border-border/50 hover:border-border transition-colors animate-fade-in-up",
                          `animate-delay-${Math.min(i * 100, 700)}`)}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-medium text-sm">{ROLE_LABELS[session.role]}</span>
                                <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
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
                                <Link href={`/interview/${session.id}`}>Continuar</Link>
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
