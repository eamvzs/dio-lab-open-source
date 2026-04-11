"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Share2,
  Check,
  RefreshCw,
  Download,
} from "lucide-react";
import { FeedbackData } from "@/types";
import { ROLE_LABELS, COMPANY_LABELS } from "@/lib/gemini";
import { cn, getScoreColor, getScoreBg, getVerdictLabel, getVerdictColor } from "@/lib/utils";

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#7c3aed", "#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#a855f7", "#ec4899"];
    const pieces = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      vx: (Math.random() - 0.5) * 5,
      vy: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vr: (Math.random() - 0.5) * 10,
      size: Math.random() * 9 + 4,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    }));

    let frame: number;
    let active = true;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.rotation += p.vr;
        const alpha = Math.max(0, 1 - p.y / (canvas.height * 1.1));
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        }
        ctx.restore();
      });
      if (active) frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    const t = setTimeout(() => { active = false; }, 4500);
    return () => { active = false; cancelAnimationFrame(frame); clearTimeout(t); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" style={{ width: "100vw", height: "100vh" }} />;
}

const priorityColors: Record<string, string> = {
  alta: "text-red-400 bg-red-500/10 border-red-500/20",
  média: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  baixa: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

interface SessionMeta {
  role: string;
  companyType: string;
  level: string;
}

export default function FeedbackPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [sessionMeta, setSessionMeta] = useState<SessionMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [displayScore, setDisplayScore] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isCopyingLink, setIsCopyingLink] = useState(false);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const sessionRes = await fetch(`/api/interview/session/${sessionId}`);
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          setSessionMeta({
            role: sessionData.role,
            companyType: sessionData.companyType,
            level: sessionData.level,
          });
        }

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

  // Animated score counter
  useEffect(() => {
    if (!feedback) return;
    const target = feedback.score;
    const duration = 1200;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * target));
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    const timeout = setTimeout(() => {
      animationRef.current = requestAnimationFrame(animate);
    }, 400);

    return () => {
      clearTimeout(timeout);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [feedback]);

  async function handleDownloadTranscript() {
    try {
      const res = await fetch(`/api/interview/session/${sessionId}`);
      if (!res.ok) return;
      const data = await res.json();
      const roleLabel = sessionMeta ? ROLE_LABELS[sessionMeta.role] ?? sessionMeta.role : "—";
      const companyLabel = sessionMeta ? COMPANY_LABELS[sessionMeta.companyType] ?? sessionMeta.companyType : "—";
      const header = [
        "InterviewOS — Transcrição da entrevista",
        `Vaga: ${roleLabel}`,
        `Empresa: ${companyLabel}`,
        `Data: ${new Date().toLocaleDateString("pt-BR")}`,
        feedback ? `Score: ${feedback.score}/100` : "",
        "",
        "=".repeat(50),
        "",
      ].join("\n");
      const lines = (data.messages as Array<{ role: string; content: string }>)
        .map(
          (m) =>
            `[${m.role === "interviewer" ? "Entrevistador" : "Você"}]\n${m.content}`
        )
        .join("\n\n---\n\n");
      const blob = new Blob([header + lines], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `entrevista-${(sessionId as string).slice(0, 8)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silently fail
    }
  }

  async function handleShare() {
    if (!feedback || !sessionMeta) return;
    const text =
      `🎯 InterviewOS — Resultado da entrevista\n\n` +
      `Vaga: ${ROLE_LABELS[sessionMeta.role]}\n` +
      `Empresa: ${COMPANY_LABELS[sessionMeta.companyType]}\n` +
      `Score: ${feedback.score}/100\n` +
      `Veredicto: ${getVerdictLabel(feedback.verdict)}\n\n` +
      `Pratique antes da entrevista que importa 👉 github.com/eamvzs/dio-lab-open-source`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // silently fail if clipboard not available
    }
  }

  async function handleCopyPublicLink() {
    setIsCopyingLink(true);
    try {
      let link = shareLink;
      if (!link) {
        const res = await fetch("/api/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        if (!res.ok) throw new Error("Erro ao gerar link");
        const data = await res.json();
        link = `${window.location.origin}${data.shareUrl}`;
        setShareLink(link);
      }
      await navigator.clipboard.writeText(link!);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // silently fail
    } finally {
      setIsCopyingLink(false);
    }
  }

  async function handleRepeat() {
    if (!sessionMeta) return;
    setIsRepeating(true);
    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: sessionMeta.role,
          level: sessionMeta.level,
          companyType: sessionMeta.companyType,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem(
          `interview_${data.sessionId}`,
          JSON.stringify({
            message: data.message,
            role: sessionMeta.role,
            level: sessionMeta.level,
            companyType: sessionMeta.companyType,
          })
        );
        router.push(`/interview/${data.sessionId}`);
      }
    } catch {
      setIsRepeating(false);
    }
  }

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
          <Button asChild><Link href="/dashboard">Ir para Métricas</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {feedback && feedback.score >= 75 && <Confetti />}
      {/* Header */}
      <header className="border-b border-border/40">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            InterviewOS
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleDownloadTranscript} className="gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Transcrição</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCopyPublicLink} disabled={isCopyingLink} className="gap-2">
              {isCopyingLink ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : copied && shareLink ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {copied && shareLink ? "Link copiado!" : "Link público"}
              </span>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">Métricas</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/setup">Nova entrevista</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl py-10 space-y-8">
        {/* Score hero */}
        <div className="text-center space-y-4 animate-scale-in">
          <div className="inline-block">
            <div className={cn("text-7xl font-extrabold tabular-nums", getScoreColor(feedback.score))}>
              {displayScore}
            </div>
            <div className="text-muted-foreground text-sm font-medium">/ 100 pontos</div>
          </div>

          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold",
            getVerdictColor(feedback.verdict),
            "border-current/20 bg-current/5"
          )}>
            {feedback.verdict === "aprovado"
              ? <CheckCircle2 className="w-4 h-4" />
              : <Target className="w-4 h-4" />}
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
        <Card className="border-border/50 animate-fade-in-up animate-delay-200">
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
        <Card className="border-border/50 animate-fade-in-up animate-delay-300">
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
        <Card className="border-border/50 border-green-500/20 bg-green-500/5 animate-fade-in-up animate-delay-400">
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
          <Card className="border-border/50 border-yellow-500/20 bg-yellow-500/5 animate-fade-in-up animate-delay-500">
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
        <Card className="border-border/50 animate-fade-in-up animate-delay-600">
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
        <div className="flex flex-col sm:flex-row gap-3 justify-center pb-8 animate-fade-in-up animate-delay-700">
          <Button variant="outline" asChild>
            <Link href="/dashboard">Ver histórico</Link>
          </Button>
          {sessionMeta && (
            <Button variant="outline" className="gap-2" onClick={handleRepeat} disabled={isRepeating}>
              {isRepeating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Repetir mesma configuração
            </Button>
          )}
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
