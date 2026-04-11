import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Terminal,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  TrendingUp,
  Target,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { ROLE_LABELS, COMPANY_LABELS, LEVEL_LABELS } from "@/lib/gemini";
import { cn, getScoreColor, getScoreBg, getVerdictLabel, getVerdictColor } from "@/lib/utils";
import { FeedbackData } from "@/types";

interface SharedResult {
  role: string;
  level: string;
  companyType: string;
  score: number;
  endedAt: string;
  feedback: FeedbackData;
}

const priorityColors: Record<string, string> = {
  alta: "text-red-400 bg-red-500/10 border-red-500/20",
  média: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  baixa: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

async function getSharedResult(token: string): Promise<SharedResult | null> {
  try {
    // In Next.js App Router, server components can fetch from their own API
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/share/${token}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function SharePage({ params }: { params: { token: string } }) {
  const data = await getSharedResult(params.token);
  if (!data) notFound();

  const { feedback, role, level, companyType, score, endedAt } = data;

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
          <Button size="sm" asChild>
            <Link href="/login">Praticar também →</Link>
          </Button>
        </div>
      </header>

      <main className="container max-w-3xl py-10 space-y-8">
        {/* Public banner */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 text-sm text-muted-foreground flex items-center gap-3">
          <span className="text-primary font-semibold text-base">🔗</span>
          <span>
            Este é um resultado público compartilhado.{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Crie sua conta grátis
            </Link>{" "}
            para praticar também.
          </span>
        </div>

        {/* Score hero */}
        <div className="text-center space-y-4">
          <div className="inline-block">
            <div className={cn("text-7xl font-extrabold tabular-nums", getScoreColor(score))}>
              {score}
            </div>
            <div className="text-muted-foreground text-sm font-medium">/ 100 pontos</div>
          </div>

          <div
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold",
              getVerdictColor(feedback.verdict),
              "border-current/20 bg-current/5"
            )}
          >
            {feedback.verdict === "aprovado" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Target className="w-4 h-4" />
            )}
            {getVerdictLabel(feedback.verdict)}
          </div>

          <p className="text-muted-foreground max-w-xl mx-auto">{feedback.verdictMessage}</p>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge variant="info">{ROLE_LABELS[role]}</Badge>
            <Badge variant="outline">{COMPANY_LABELS[companyType]}</Badge>
            <Badge variant="outline">{LEVEL_LABELS[level]}</Badge>
            {endedAt && (
              <Badge variant="outline" className="text-xs">
                {new Date(endedAt).toLocaleDateString("pt-BR")}
              </Badge>
            )}
          </div>
        </div>

        {/* Score bar */}
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex justify-between text-sm mb-3">
              <span className="font-medium">Pontuação geral</span>
              <span className={cn("font-bold", getScoreColor(score))}>{score}/100</span>
            </div>
            <Progress value={score} className={cn("h-3 [&>div]:", getScoreBg(score))} />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Precisa evoluir</span>
              <span>Em desenvolvimento</span>
              <span>Aprovado</span>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Resumo da performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm leading-relaxed">{feedback.summary}</p>
          </CardContent>
        </Card>

        {/* Strengths */}
        <Card className="border-border/50 border-green-500/20 bg-green-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              Pontos fortes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedback.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span className="text-foreground/80">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Improvements */}
        {feedback.improvements.length > 0 && (
          <Card className="border-border/50 border-yellow-500/20 bg-yellow-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-yellow-400">
                <AlertTriangle className="w-4 h-4" />
                Áreas para melhorar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {feedback.improvements.map((item, i) => (
                <div key={i} className="space-y-1">
                  <p className="font-medium text-sm">{item.area}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <div className="flex items-start gap-2 mt-2 p-3 bg-background/50 rounded-lg border border-border/30">
                    <Lightbulb className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground/80">{item.suggestion}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Study Plan */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Plano de estudos recomendado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedback.studyPlan.map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{item.topic}</p>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full border font-medium",
                      priorityColors[item.priority]
                    )}
                  >
                    Prioridade {item.priority}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.resources.map((resource, j) => (
                    <span
                      key={j}
                      className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground border border-border/30"
                    >
                      {resource}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-4 pb-8">
          <p className="text-muted-foreground text-sm">
            Quer praticar e receber seu próprio feedback?
          </p>
          <Button size="lg" className="gap-2" asChild>
            <Link href="/login">
              Criar conta grátis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
