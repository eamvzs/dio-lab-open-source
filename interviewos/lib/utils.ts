import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getScoreColor(score: number): string {
  if (score >= 75) return "text-green-500";
  if (score >= 50) return "text-yellow-500";
  return "text-red-500";
}

export function getScoreBg(score: number): string {
  if (score >= 75) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

export function getVerdictLabel(verdict: string): string {
  const labels: Record<string, string> = {
    aprovado: "Aprovado",
    em_desenvolvimento: "Em Desenvolvimento",
    precisa_evoluir: "Precisa Evoluir",
  };
  return labels[verdict] || verdict;
}

export function getVerdictColor(verdict: string): string {
  const colors: Record<string, string> = {
    aprovado: "text-green-500",
    em_desenvolvimento: "text-yellow-500",
    precisa_evoluir: "text-red-500",
  };
  return colors[verdict] || "text-gray-500";
}
