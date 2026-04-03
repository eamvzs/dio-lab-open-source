import { auth, signIn, DEMO_MODE } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Terminal, Zap, Target, TrendingUp, FlaskConical } from "lucide-react";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Terminal className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">InterviewOS</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Simule entrevistas técnicas reais com feedback de IA
          </p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Entrar na plataforma</CardTitle>
            {DEMO_MODE && (
              <div className="flex justify-center mt-2">
                <Badge variant="warning" className="gap-1 text-xs">
                  <FlaskConical className="w-3 h-3" />
                  Modo Demo ativo
                </Badge>
              </div>
            )}
            <CardDescription className="mt-2">
              {DEMO_MODE
                ? "Entre com um clique para testar todas as funcionalidades"
                : "Use sua conta do GitHub para começar a praticar"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {DEMO_MODE ? (
              <form
                action={async () => {
                  "use server";
                  await signIn("credentials", {
                    name: "Dev Demo",
                    redirectTo: "/dashboard",
                  });
                }}
              >
                <Button className="w-full gap-2" size="lg" type="submit">
                  <FlaskConical className="w-5 h-5" />
                  Entrar em modo demo
                </Button>
              </form>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await signIn("github", { redirectTo: "/dashboard" });
                }}
              >
                <Button className="w-full gap-2" size="lg" type="submit">
                  <Github className="w-5 h-5" />
                  Entrar com GitHub
                </Button>
              </form>
            )}

            <div className="pt-4 border-t border-border/50 space-y-3">
              {[
                { icon: Zap, text: "Entrevistas adaptadas ao seu nível" },
                { icon: Target, text: "Feedback técnico detalhado com IA" },
                { icon: TrendingUp, text: "Plano de estudos personalizado" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Projeto open source para portfólio de desenvolvedores
        </p>
      </div>
    </div>
  );
}
