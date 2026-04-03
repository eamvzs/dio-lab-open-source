"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const roles = [
  { value: "frontend-jr", label: "Frontend JR", icon: "⚛️", description: "React, TypeScript, CSS, HTML" },
  { value: "backend-jr", label: "Backend JR", icon: "🔧", description: "Node.js, APIs REST, SQL, Git" },
  { value: "fullstack-jr", label: "Full Stack JR", icon: "🚀", description: "React + Node, deploy, integração" },
  { value: "data-jr", label: "Dados JR", icon: "📊", description: "Python, SQL, Pandas, análise" },
  { value: "mobile-jr", label: "Mobile JR", icon: "📱", description: "React Native ou Flutter" },
];

const levels = [
  { value: "junior", label: "Júnior", description: "0–1 ano de experiência", badge: "Iniciante" },
  { value: "junior-advanced", label: "Júnior Avançado", description: "1–2 anos de experiência", badge: "Intermediário" },
];

const companies = [
  { value: "startup", label: "Startup", icon: "⚡", description: "Informal, veloz, valoriza proatividade" },
  { value: "enterprise", label: "Empresa Grande", icon: "🏢", description: "Estruturada, processos, trabalho em equipe" },
  { value: "big-tech", label: "Big Tech", icon: "🔬", description: "Técnico, rigoroso, resolução de problemas" },
  { value: "fintech", label: "Fintech", icon: "💳", description: "Segurança, confiabilidade, atenção a detalhes" },
];

type Step = "role" | "level" | "company";

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("role");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const steps: Step[] = ["role", "level", "company"];
  const currentStepIndex = steps.indexOf(step);

  async function handleStart() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          level: selectedLevel,
          companyType: selectedCompany,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(err.error || "Erro ao iniciar entrevista");
      }

      const { sessionId } = await res.json();
      router.push(`/interview/${sessionId}`);
    } catch (error) {
      console.error(error);
      alert("Erro ao iniciar entrevista. Tente novamente.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40">
        <div className="container flex h-14 items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            InterviewOS
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">Nova entrevista</span>
        </div>
      </header>

      <main className="container max-w-2xl py-12">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-10">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                  i < currentStepIndex
                    ? "bg-primary text-primary-foreground"
                    : i === currentStepIndex
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {i < currentStepIndex ? "✓" : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={cn("h-0.5 w-12 transition-all", i < currentStepIndex ? "bg-primary" : "bg-muted")} />
              )}
            </div>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            Passo {currentStepIndex + 1} de 3
          </span>
        </div>

        {/* Step: Role */}
        {step === "role" && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold mb-2">Qual vaga você quer simular?</h1>
            <p className="text-muted-foreground mb-6">Cada vaga tem contexto técnico e perguntas específicas</p>
            <div className="grid gap-3">
              {roles.map((role) => (
                <Card
                  key={role.value}
                  className={cn(
                    "cursor-pointer border-2 transition-all hover:border-primary/50",
                    selectedRole === role.value
                      ? "border-primary bg-primary/5"
                      : "border-border/50 bg-card/30"
                  )}
                  onClick={() => setSelectedRole(role.value)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <span className="text-2xl">{role.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium">{role.label}</p>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                    {selectedRole === role.value && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground text-xs">✓</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button
              className="mt-6 w-full gap-2"
              size="lg"
              disabled={!selectedRole}
              onClick={() => setStep("level")}
            >
              Próximo
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Step: Level */}
        {step === "level" && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold mb-2">Qual é o seu nível atual?</h1>
            <p className="text-muted-foreground mb-6">As perguntas serão ajustadas para o que é esperado do seu nível</p>
            <div className="grid gap-3">
              {levels.map((level) => (
                <Card
                  key={level.value}
                  className={cn(
                    "cursor-pointer border-2 transition-all hover:border-primary/50",
                    selectedLevel === level.value
                      ? "border-primary bg-primary/5"
                      : "border-border/50 bg-card/30"
                  )}
                  onClick={() => setSelectedLevel(level.value)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{level.label}</p>
                        <Badge variant="outline" className="text-xs">{level.badge}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{level.description}</p>
                    </div>
                    {selectedLevel === level.value && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground text-xs">✓</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep("role")} className="flex-1">
                Voltar
              </Button>
              <Button
                className="flex-1 gap-2"
                disabled={!selectedLevel}
                onClick={() => setStep("company")}
              >
                Próximo
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Company */}
        {step === "company" && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold mb-2">Qual estilo de empresa?</h1>
            <p className="text-muted-foreground mb-6">O tom e foco das perguntas variam muito dependendo da empresa</p>
            <div className="grid gap-3">
              {companies.map((company) => (
                <Card
                  key={company.value}
                  className={cn(
                    "cursor-pointer border-2 transition-all hover:border-primary/50",
                    selectedCompany === company.value
                      ? "border-primary bg-primary/5"
                      : "border-border/50 bg-card/30"
                  )}
                  onClick={() => setSelectedCompany(company.value)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <span className="text-2xl">{company.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium">{company.label}</p>
                      <p className="text-sm text-muted-foreground">{company.description}</p>
                    </div>
                    {selectedCompany === company.value && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground text-xs">✓</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep("level")} className="flex-1">
                Voltar
              </Button>
              <Button
                className="flex-1 gap-2"
                disabled={!selectedCompany || isLoading}
                onClick={handleStart}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Iniciando entrevista...
                  </>
                ) : (
                  <>
                    Começar entrevista
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
