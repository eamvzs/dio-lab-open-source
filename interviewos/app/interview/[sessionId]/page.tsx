"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Terminal, Send, Loader2, StopCircle, AlertCircle, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROLE_LABELS, COMPANY_LABELS, LEVEL_LABELS } from "@/lib/gemini";
import { MessageType } from "@/types";

interface SessionMeta {
  role: string;
  level: string;
  companyType: string;
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
        <span className="text-xs">🤖</span>
      </div>
      <div className="bg-card border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground/60" />
          <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground/60" />
          <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground/60" />
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: MessageType }) {
  const isInterviewer = message.role === "interviewer";
  return (
    <div
      className={cn(
        "flex items-end gap-3 message-animate",
        !isInterviewer && "flex-row-reverse"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs",
          isInterviewer
            ? "bg-primary/20 border border-primary/30"
            : "bg-secondary border border-border/50"
        )}
      >
        {isInterviewer ? "🤖" : "👤"}
      </div>
      <div
        className={cn(
          "max-w-[75%] px-4 py-3 rounded-2xl text-sm",
          isInterviewer
            ? "bg-card border border-border/50 rounded-bl-sm text-foreground"
            : "bg-primary text-primary-foreground rounded-br-sm"
        )}
      >
        {isInterviewer ? (
          <ReactMarkdown
            rehypePlugins={[rehypeSanitize]}
            components={{
              code: ({ children }) => (
                <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs font-mono text-primary">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-muted/50 rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono">
                  {children}
                </pre>
              ),
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
    </div>
  );
}

export default function InterviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [sessionMeta, setSessionMeta] = useState<SessionMeta | null>(null);
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [error, setError] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isGeminiActive, setIsGeminiActive] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Interview timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load initial message from sessionStorage (set by setup page via start API)
  useEffect(() => {
    const loadSession = async () => {
      try {
        // Usa sessionStorage como fallback imediato enquanto a API carrega
        const storedMsg = sessionStorage.getItem(`interview_${sessionId}`);
        if (storedMsg) {
          const { message, role, level, companyType } = JSON.parse(storedMsg);
          setMessages([{ id: "init", role: "interviewer", content: message, createdAt: new Date() }]);
          setSessionMeta({ role, level, companyType });
          sessionStorage.removeItem(`interview_${sessionId}`);
        }

        const res = await fetch(`/api/interview/session/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages?.length > 0) setMessages(data.messages);
          setSessionMeta({ role: data.role, level: data.level, companyType: data.companyType });
          setQuestionCount(data.messages.filter((m: MessageType) => m.role === "interviewer").length - 1);
          setIsGeminiActive(data.isGeminiActive ?? false);
          // Timer a partir do início real da sessão
          if (data.startedAt) startTimeRef.current = new Date(data.startedAt).getTime();
        } else if (!storedMsg) {
          setError("Sessão não encontrada. Inicie uma nova entrevista.");
        }
      } catch {
        setError("Erro ao carregar sessão.");
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, [sessionId]);

  async function handleSend() {
    if (!answer.trim() || isSending || isEnding) return;

    const userMessage: MessageType = {
      id: Date.now().toString(),
      role: "candidate",
      content: answer.trim(),
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setAnswer("");
    setIsSending(true);

    try {
      const res = await fetch("/api/interview/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, answer: answer.trim() }),
      });

      if (!res.ok) throw new Error("Erro ao enviar resposta");

      const data = await res.json();
      const botMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        role: "interviewer",
        content: data.message,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setQuestionCount((prev) => prev + 1);

      if (data.isEnding) {
        setIsEnding(true);
      }
    } catch {
      setError("Erro ao enviar resposta. Tente novamente.");
    } finally {
      setIsSending(false);
    }
  }

  async function handleEndInterview() {
    setIsGeneratingFeedback(true);
    try {
      const res = await fetch("/api/interview/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!res.ok) throw new Error("Erro ao gerar feedback");
      router.push(`/feedback/${sessionId}`);
    } catch {
      setError("Erro ao gerar feedback. Tente novamente.");
      setIsGeneratingFeedback(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function autoResize() {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Preparando sua entrevista...</p>
        </div>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
          <p className="text-muted-foreground">{error}</p>
          <Button asChild>
            <Link href="/setup">Nova entrevista</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 shrink-0">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            InterviewOS
          </Link>
          <div className="flex items-center gap-3">
            {sessionMeta && (
              <>
                <Badge variant="info" className="hidden sm:flex text-xs">
                  {ROLE_LABELS[sessionMeta.role]}
                </Badge>
                <Badge variant="outline" className="hidden sm:flex text-xs">
                  {COMPANY_LABELS[sessionMeta.companyType]}
                </Badge>
              </>
            )}
            <Badge variant="outline" className="text-xs">
              {questionCount} perguntas
            </Badge>
            <Badge variant="outline" className="text-xs gap-1 font-mono">
              <Clock className="w-3 h-3" />
              {formatTime(elapsedSeconds)}
            </Badge>
            <Badge variant={isGeminiActive ? "success" : "outline"} className="text-xs hidden sm:flex">
              {isGeminiActive ? "✦ Gemini ativo" : "⬡ Modo demo"}
            </Badge>
          </div>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-2xl py-6 space-y-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isSending && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-border/40 bg-background/80 backdrop-blur shrink-0">
        <div className="container max-w-2xl py-4">
          {error && (
            <p className="text-sm text-destructive mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}

          {isEnding ? (
            <div className="text-center space-y-3 py-2">
              <p className="text-sm text-muted-foreground">
                A entrevista foi encerrada. Pronto para ver seu feedback?
              </p>
              <Button
                size="lg"
                className="gap-2"
                onClick={handleEndInterview}
                disabled={isGeneratingFeedback}
              >
                {isGeneratingFeedback ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gerando feedback com IA...
                  </>
                ) : (
                  "Ver feedback detalhado →"
                )}
              </Button>
            </div>
          ) : (
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={answer}
                  maxLength={4000}
                  onChange={(e) => {
                    setAnswer(e.target.value);
                    autoResize();
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua resposta... (Enter para enviar, Shift+Enter para nova linha)"
                  disabled={isSending}
                  rows={1}
                  className="w-full resize-none rounded-xl border border-border/50 bg-card/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 transition-all"
                  style={{ minHeight: "48px", maxHeight: "160px" }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!answer.trim() || isSending}
                  className="h-12 w-12 rounded-xl shrink-0"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setIsEnding(true)}
                  className="h-12 w-12 rounded-xl shrink-0"
                  title="Encerrar entrevista"
                >
                  <StopCircle className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground/50 mt-2 text-center">
            IA pode cometer erros. Use como prática, não como avaliação definitiva.
          </p>
        </div>
      </div>
    </div>
  );
}
