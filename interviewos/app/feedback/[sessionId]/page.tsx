"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Terminal,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Loader2,
  TrendingUp,
  Target,
  Lightbulb,
} from "lucide-react";
import { FeedbackData } from "@/types";
import { ROLE_LABELS, COMPANY_LABELS } from "@/lib/gemini";
import { cn, getScoreColor, getScoreBg, getVerdictLabel, getVerdictColor } from "@/lib/utils";

const priorityColors: Record<string, string> = {
  alta: "text-red-400 bg-red-500/10 border-red-500/20",
  média: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  baixa: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

export default function FeedbackPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [sessionMeta, setSessionMeta] = useState<{ role: string; companyType: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        // First get session info
        const sessionRes = await fetch(`/api/interview/session/${sessionId}`);
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          setSessionMeta({ role: sessionData.role, companyType: sessionData.companyType });
        }

        // Then get/generate feedback
        const feedbackRes = await fetch("/api/interview/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        if (!feedbackRes.ok) throw new Error("Erro ao carregar feedback");
        const data = await feedbackRes.json();
        setFeedback(data.feedback);
      } catch {
        setError("Erro ao carregar feedback. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };
    loadFeedback();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <div>
            <p className="font-medium">Gerando seu feedback com IA...</p>
            <p className="text-sm text-muted-foreground mt-1">Analisando suas respostas e identificando padrões</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button asChild><Link href="/dashboard">Ir para o Dashboard</Link></Button>
        </div>
      </div>
    );
  }

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
          <div className="flex gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">Histórico</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/setup">Nova entrevista</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl py-10 space-y-8">
        {/* Score hero */}
        <div className="text-center space-y-4">
          <div className="inline-block">
            <div className={cn("text-7xl font-extrabold", getScoreColor(feedback.score))}>
              {feedback.score}
            </div>
            <div className="text-muted-foreground text-sm font-medium">/ 100 pontos</div>
          </div>

          <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold", getVerdictColor(feedback.verdict), "border-current/20 bg-current/5")}>
            {feedback.verdict === "aprovado" ? <CheckCircle2 className="w-4 h-4" /> : <Target className="w-4 h-4" />}
            {getVerdictLabel(feedback.verdict)}
          </div>

          <p className="text-muted-foreground max-w-xl mx-auto">{feedback.verdictMessage}</p>

          {sessionMeta && (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Badge variant="info">{ROLE_LABELS[sessionMeta.role]}</Badge>
              <Badge variant="outline">{COMPANY_LABELS[sessionMeta.companyType]}</Badge>
            </div>
          )}
        </div>

        {/* Score bar */}
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex justify-between text-sm mb-3">
              <span className="font-medium">Pontuação geral</span>
              <span className={cn("font-bold", getScoreColor(feedback.score))}>{feedback.score}/100</span>
            </div>
            <Progress value={feedback.score} className={cn("h-3 [&>div]:", getScoreBg(feedback.score))} />
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
                  <p className="font-medium text-sm text-foreground">{item.area}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <div className="flex items-start gap-2 mt-2 p-3 bg-background/50 rounded-lg border border-border/30">
                    <Lightbulb className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground/80">{item.suggestion}</p>
                  </div>
                  {i < feedback.improvements.length - 1 && <Separator className="mt-4 opacity-30" />}
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
              Plano de estudos personalizado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedback.studyPlan.map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{item.topic}</p>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", priorityColors[item.priority])}>
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
                {i < feedback.studyPlan.length - 1 && <Separator className="opacity-30" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex gap-3 justify-center pb-8">
          <Button variant="outline" asChild>
            <Link href="/dashboard">Ver histórico</Link>
          </Button>
          <Button asChild className="gap-2">
            <Link href="/setup">
              Praticar novamente
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
