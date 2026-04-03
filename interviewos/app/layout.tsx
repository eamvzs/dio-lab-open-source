import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InterviewOS — Simule entrevistas técnicas com IA",
  description:
    "Pratique entrevistas técnicas reais com IA. Escolha a vaga, o nível e o estilo da empresa. Receba feedback detalhado e um plano de estudos personalizado.",
  keywords: ["entrevista técnica", "desenvolvedor júnior", "portfólio", "IA", "simulador"],
  authors: [{ name: "InterviewOS" }],
  openGraph: {
    title: "InterviewOS — Simule entrevistas técnicas com IA",
    description: "Pratique entrevistas técnicas e receba feedback real com IA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>{children}</body>
    </html>
  );
}
