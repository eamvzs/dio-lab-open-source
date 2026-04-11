import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Terminal, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md px-6 animate-fade-in-up">
        {/* Terminal mock */}
        <div className="rounded-xl border border-border/50 bg-card/50 text-left overflow-hidden mb-8 shadow-xl">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-2 text-xs text-muted-foreground">interviewos — erro</span>
          </div>
          <div className="p-4 font-mono text-sm space-y-2">
            <div className="flex gap-2">
              <span className="text-primary">$</span>
              <span className="text-muted-foreground">GET /pagina-inexistente</span>
            </div>
            <div className="flex gap-2">
              <span className="text-red-400">✗</span>
              <span className="text-red-400">404 — Página não encontrada</span>
            </div>
            <div className="flex gap-2">
              <span className="text-primary">🤖</span>
              <span className="text-muted-foreground">
                Hmm, parece que essa rota não existe.{" "}
                <span className="text-primary">Boa tentativa</span>, mas mesmo
                em entrevistas precisamos respeitar os status HTTP.
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground/40 mt-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs">aguardando redirecionamento...</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 font-bold text-xl mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Terminal className="w-4 h-4 text-primary-foreground" />
          </div>
          InterviewOS
        </div>
        <p className="text-muted-foreground text-sm mb-6">
          Essa página não existe, mas sua próxima entrevista pode ser perfeita.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline">
            <Link href="/">Voltar ao início</Link>
          </Button>
          <Button asChild className="gap-2">
            <Link href="/setup">
              Começar entrevista
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
