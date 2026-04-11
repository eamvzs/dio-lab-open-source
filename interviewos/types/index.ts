export interface InterviewConfig {
  role: string;
  level: string;
  companyType: string;
}

export interface MessageType {
  id: string;
  role: "interviewer" | "candidate";
  content: string;
  createdAt: Date;
}

export interface FeedbackData {
  score: number;
  summary: string;
  strengths: string[];
  improvements: Array<{
    area: string;
    description: string;
    suggestion: string;
  }>;
  studyPlan: Array<{
    topic: string;
    priority: "alta" | "média" | "baixa";
    resources: string[];
  }>;
  verdict: "aprovado" | "em_desenvolvimento" | "precisa_evoluir";
  verdictMessage: string;
}

export interface InterviewSessionData {
  id: string;
  role: string;
  level: string;
  companyType: string;
  status: string;
  score: number | null;
  feedback: string | null;
  startedAt: Date;
  endedAt: Date | null;
  messages: MessageType[];
}

export interface DashboardStats {
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  bestScore: number;
  mostPracticedRole: string;
}
