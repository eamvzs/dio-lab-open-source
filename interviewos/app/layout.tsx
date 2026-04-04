import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InterviewOS — Simule entrevistas técnicas com IA",
  description:
    "Pratique entrevistas técnicas reais com IA. Escolha a vaga, o nível e o estilo da empresa. Receba feedback detalhado e um plano de estudos personalizado.",
  keywords: ["entrevista técnica", "desenvolvedor júnior", "portfólio", "IA", "simulador", "React", "Node.js"],
  authors: [{ name: "InterviewOS" }],
  manifest: "/manifest.json",
  themeColor: "#7c3aed",
  openGraph: {
    title: "InterviewOS — Simule entrevistas técnicas com IA",
    description:
      "Pratique antes da entrevista que importa. IA conduz a entrevista, avalia suas respostas e entrega feedback com plano de estudos personalizado.",
    type: "website",
    locale: "pt_BR",
    siteName: "InterviewOS",
  },
  twitter: {
    card: "summary_large_image",
    title: "InterviewOS — Simule entrevistas técnicas com IA",
    description: "Pratique entrevistas técnicas e receba feedback real com IA — grátis para devs JR.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="InterviewOS" />
      </head>
      <body style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>{children}</body>
    </html>
  );
}
