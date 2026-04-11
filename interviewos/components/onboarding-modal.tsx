"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal, MessageSquare, BarChart3, X } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: Terminal,
    emoji: "🎯",
    title: "Escolha vaga e empresa",
    desc: "Selecione o cargo que você quer praticar (Frontend, Backend, Full Stack, Dados ou Mobile) e o estilo da empresa — startup, big tech, fintech ou empresa grande. Cada combinação gera uma entrevista diferente.",
  },
  {
    icon: MessageSquare,
    emoji: "💬",
    title: "Converse com a IA como em uma entrevista real",
    desc: "Sem múltipla escolha. Você digita suas respostas (ou usa o microfone) exatamente como faria com um entrevistador real. A IA reage ao que você diz, faz follow-ups e adapta as perguntas.",
  },
  {
    icon: BarChart3,
    emoji: "📊",
    title: "Receba feedback detalhado",
    desc: "Ao final, você recebe um score de 0-100, seus pontos fortes, as lacunas identificadas e um plano de estudos personalizado gerado com IA. Tudo salvo no seu histórico de Métricas.",
  },
];

const STORAGE_KEY = "interviewos_onboarding_done";

export function OnboardingModal() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // localStorage not available
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch { /* noop */ }
    setVisible(false);
  }

  function handleStart() {
    dismiss();
    router.push("/setup");
  }

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step indicators */}
        <div className="flex gap-1.5 px-6 pt-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 rounded-full flex-1 transition-all",
                i <= step ? "bg-primary" : "bg-border/50"
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="text-4xl mb-4">{current.emoji}</div>
          <h2 className="text-xl font-bold mb-3">{current.title}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">{current.desc}</p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-between gap-3">
          <button
            onClick={dismiss}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Pular tutorial
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={() => setStep((s) => s - 1)}>
                Voltar
              </Button>
            )}
            {isLast ? (
              <Button size="sm" className="gap-2" onClick={handleStart}>
                Começar agora
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button size="sm" className="gap-2" onClick={() => setStep((s) => s + 1)}>
                Próximo
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
