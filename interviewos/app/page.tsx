import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Terminal,
  Zap,
  Target,
  TrendingUp,
  Brain,
  CheckCircle,
  ArrowRight,
  Github,
  Code2,
  MessageSquare,
  BarChart3,
  Star,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "IA que pensa como entrevistador",
    description:
      "O Gemini conduz entrevistas adaptadas ao cargo e estilo da empresa. Reage às suas respostas, faz follow-ups e ajusta a dificuldade ao seu nível.",
  },
  {
    icon: Target,
    title: "Contexto real de mercado",
    description:
      "Escolha entre startup, big tech, fintech ou empresa grande. Cada estilo tem abordagem diferente — e o simulador respeita isso.",
  },
  {
    icon: MessageSquare,
    title: "Chat natural, sem script",
    description:
      "Sem múltipla escolha. Você responde em texto, como em uma entrevista real. A IA lê, interpreta e responde de forma contextual.",
  },
  {
    icon: BarChart3,
    title: "Feedback cirúrgico",
    description:
      "Score de 0-100, pontos fortes, gaps técnicos identificados e plano de estudos personalizado gerado após cada sessão.",
  },
];

const roles = [
  { label: "Frontend JR", icon: "⚛️", stack: "React · TypeScript · CSS" },
  { label: "Backend JR", icon: "🔧", stack: "Node.js · APIs · SQL" },
  { label: "Full Stack JR", icon: "🚀", stack: "React · Node · Deploy" },
  { label: "Dados JR", icon: "📊", stack: "Python · SQL · Pandas" },
  { label: "Mobile JR", icon: "📱", stack: "React Native · Flutter" },
];

const steps = [
  { step: "01", title: "Escolha a vaga e empresa", desc: "Selecione o cargo, nível e estilo da empresa onde quer praticar" },
  { step: "02", title: "Entrevista com IA", desc: "Responda perguntas técnicas e comportamentais em um chat natural" },
  { step: "03", title: "Receba feedback real", desc: "Score, pontos fortes, lacunas e um plano de estudos personalizado" },
];

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/40 sticky top-0 z-50 bg-background/80 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            InterviewOS
          </Link>
          <nav className="flex items-center gap-3">
            {session ? (
              <Button asChild size="sm">
                <Link href="/dashboard">Métricas</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/login">Começar grátis</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-36">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="container relative z-10 text-center max-w-4xl mx-auto">
          <Badge variant="info" className="mb-6 text-xs px-3 py-1">
            <Zap className="w-3 h-3 mr-1" />
            Powered by Google Gemini
          </Badge>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Simule entrevistas técnicas{" "}
            <span className="text-primary">reais</span> com IA
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Pratique antes da entrevista que importa. Escolha a vaga, o nível e
            o estilo da empresa. Receba feedback detalhado e um plano de estudos
            personalizado — tudo com IA.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Button size="lg" className="gap-2" asChild>
              <Link href={session ? "/setup" : "/login"}>
                Fazer uma entrevista agora
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-4 h-4" />
                Ver no GitHub
              </a>
            </Button>
          </div>

          {/* Mock terminal */}
          <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur text-left overflow-hidden max-w-2xl mx-auto shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-2 text-xs text-muted-foreground">entrevista — Frontend JR @ Startup</span>
            </div>
            <div className="p-4 space-y-3 text-sm font-mono">
              <div className="flex gap-3">
                <span className="text-primary shrink-0">🤖</span>
                <p className="text-muted-foreground">
                  Olá! Vamos começar? Me conta um pouco sobre você — o que te
                  levou a querer trabalhar com desenvolvimento frontend?
                </p>
              </div>
              <div className="flex gap-3">
                <span className="text-green-400 shrink-0">👤</span>
                <p className="text-foreground/80">
                  Comecei com React há 8 meses, fiz alguns projetos pessoais e
                  um freelance. Adoro criar interfaces que as pessoas realmente
                  usam...
                </p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary shrink-0">🤖</span>
                <p className="text-muted-foreground">
                  Legal! Projetos reais fazem muita diferença no aprendizado.
                  Vamos para o técnico — você pode me explicar a diferença entre{" "}
                  <code className="text-primary bg-primary/10 px-1 rounded">
                    useMemo
                  </code>{" "}
                  e{" "}
                  <code className="text-primary bg-primary/10 px-1 rounded">
                    useCallback
                  </code>
                  ?
                </p>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground/50">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs">digitando...</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border/40">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Por que é diferente?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Não é questionário de múltipla escolha. É uma entrevista de
              verdade, com IA que pensa como um entrevistador experiente.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border/50 bg-card/30 hover:bg-card/60 transition-colors">
                <CardContent className="p-6 flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 border-t border-border/40 bg-muted/10">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Vagas disponíveis</h2>
            <p className="text-muted-foreground">Cada vaga tem contexto técnico específico e perguntas adequadas ao nível</p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {roles.map((role) => (
              <Card key={role.label} className="border-border/50 bg-card/30 hover:bg-card/80 transition-all hover:scale-105 cursor-default">
                <CardContent className="p-4 flex items-center gap-3">
                  <span className="text-2xl">{role.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{role.label}</p>
                    <p className="text-xs text-muted-foreground">{role.stack}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 border-t border-border/40">
        <div className="container max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Como funciona</h2>
            <p className="text-muted-foreground">Três passos para uma sessão completa de prática</p>
          </div>

          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={step.step} className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-sm">{step.step}</span>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-semibold mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border/40 bg-primary/5">
        <div className="container text-center max-w-2xl">
          <Code2 className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">
            Sua próxima entrevista pode ser diferente
          </h2>
          <p className="text-muted-foreground mb-8">
            Junte-se a outros devs que praticaram com o InterviewOS antes de
            conseguir sua primeira vaga.
          </p>
          <Button size="lg" className="gap-2" asChild>
            <Link href={session ? "/setup" : "/login"}>
              Começar agora — é grátis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <span>InterviewOS — Open Source</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              GitHub
            </a>
            <span>·</span>
            <span>Feito para devs JRs do Brasil 🇧🇷</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
