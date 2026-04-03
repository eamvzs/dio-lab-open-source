import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export const ROLE_LABELS: Record<string, string> = {
  "frontend-jr": "Desenvolvedor Frontend Júnior",
  "backend-jr": "Desenvolvedor Backend Júnior",
  "fullstack-jr": "Desenvolvedor Full Stack Júnior",
  "data-jr": "Analista de Dados Júnior",
  "mobile-jr": "Desenvolvedor Mobile Júnior",
};

export const COMPANY_LABELS: Record<string, string> = {
  startup: "Startup",
  enterprise: "Empresa Grande / Corporação",
  "big-tech": "Big Tech (estilo Google/Meta/Amazon)",
  fintech: "Fintech",
};

export const LEVEL_LABELS: Record<string, string> = {
  junior: "Júnior (0-1 ano)",
  "junior-advanced": "Júnior Avançado (1-2 anos)",
};

function getRoleContext(role: string): string {
  const contexts: Record<string, string> = {
    "frontend-jr": `
      Tecnologias esperadas: HTML, CSS, JavaScript, React, TypeScript básico, Git.
      Conceitos: DOM manipulation, componentes, props/state, hooks básicos (useState, useEffect),
      responsividade, requisições HTTP (fetch/axios), noções de acessibilidade.
      Pontos de avaliação: clareza de código, componentização, lógica básica de UI.
    `,
    "backend-jr": `
      Tecnologias esperadas: Node.js ou Python, REST APIs, SQL básico, Git.
      Conceitos: HTTP métodos, CRUD, autenticação básica (JWT), ORM básico, estrutura de projeto,
      tratamento de erros, variáveis de ambiente, noções de banco de dados.
      Pontos de avaliação: organização de código, segurança básica, design de API.
    `,
    "fullstack-jr": `
      Tecnologias esperadas: React/Next.js, Node.js ou similar, SQL, Git.
      Conceitos: integração front-back, autenticação end-to-end, deploy básico,
      variáveis de ambiente, CORS, estado global básico.
      Pontos de avaliação: visão sistêmica, capacidade de integrar camadas.
    `,
    "data-jr": `
      Tecnologias esperadas: Python, SQL, pandas, noções de visualização (matplotlib/seaborn).
      Conceitos: limpeza de dados, queries SQL, análise exploratória, estatística básica,
      Jupyter notebooks, noções de machine learning.
      Pontos de avaliação: raciocínio analítico, SQL, Python para dados.
    `,
    "mobile-jr": `
      Tecnologias esperadas: React Native ou Flutter, Git, noções de estado.
      Conceitos: componentes nativos, navegação, estado local, consumo de APIs,
      ciclo de vida de app mobile, responsividade em telas diferentes.
      Pontos de avaliação: lógica mobile, UX básica, integração com APIs.
    `,
  };
  return contexts[role] || contexts["frontend-jr"];
}

function getCompanyContext(companyType: string): string {
  const contexts: Record<string, string> = {
    startup: `
      Estilo: informal, direto, valoriza proatividade e capacidade de aprender rápido.
      Foco em: adaptabilidade, iniciativa, entrega rápida, MVP mindset.
      Perguntas comportamentais: trabalho com incerteza, autonomia, multitarefa.
    `,
    enterprise: `
      Estilo: formal, estruturado, valoriza processos e trabalho em equipe.
      Foco em: seguir padrões, documentação, trabalho em times grandes, comunicação.
      Perguntas comportamentais: trabalho em equipe, processos, hierarquia.
    `,
    "big-tech": `
      Estilo: técnico e rigoroso, valoriza raciocínio lógico e resolução de problemas.
      Foco em: lógica de programação, algoritmos básicos, system design simplificado.
      Perguntas comportamentais: situações de pressão, método STAR, impacto.
    `,
    fintech: `
      Estilo: técnico com atenção especial a segurança e confiabilidade.
      Foco em: segurança de dados, validações, LGPD básico, confiabilidade de sistemas.
      Perguntas comportamentais: atenção a detalhes, responsabilidade, compliance.
    `,
  };
  return contexts[companyType] || contexts["startup"];
}

export function buildInterviewSystemPrompt(
  role: string,
  level: string,
  companyType: string
): string {
  return `Você é um entrevistador técnico experiente conduzindo uma entrevista de emprego real para a vaga de ${ROLE_LABELS[role]} em uma ${COMPANY_LABELS[companyType]}.

PERFIL DO CANDIDATO:
- Nível: ${LEVEL_LABELS[level]}
- Vaga: ${ROLE_LABELS[role]}

CONTEXTO TÉCNICO DA VAGA:
${getRoleContext(role)}

PERFIL DA EMPRESA:
${getCompanyContext(companyType)}

INSTRUÇÕES DE CONDUTA:
1. Conduza a entrevista de forma natural e humana, como um entrevistador real faria
2. Comece com uma apresentação breve e uma pergunta de aquecimento sobre o candidato
3. Faça de 6 a 8 perguntas ao longo da entrevista, misturando técnicas e comportamentais
4. Uma pergunta por vez — espere a resposta antes de continuar
5. Reaja às respostas de forma contextual (elogie brevemente o que foi bom, explore pontos fracos com follow-up)
6. Ajuste a dificuldade ao nível ${LEVEL_LABELS[level]} — não exija o que está além do esperado
7. Seja profissional mas acolhedor — o objetivo é avaliar, não intimidar
8. NÃO revele a pontuação ou feedback durante a entrevista
9. Quando o candidato indicar que quer encerrar ou após 8 perguntas respondidas, encerre com uma mensagem de despedida profissional e informe que o feedback estará disponível em breve
10. Responda SEMPRE em português brasileiro

FORMATO DAS MENSAGENS:
- Seja conciso — máximo 3-4 parágrafos por mensagem
- Use linguagem natural, não robotizada
- Para perguntas técnicas de código, use blocos de código quando necessário`;
}

export function buildFeedbackPrompt(
  role: string,
  level: string,
  companyType: string,
  messages: Array<{ role: string; content: string }>
): string {
  const conversation = messages
    .map(
      (m) =>
        `${m.role === "interviewer" ? "ENTREVISTADOR" : "CANDIDATO"}: ${m.content}`
    )
    .join("\n\n");

  return `Você é um avaliador técnico sênior. Analise a seguinte entrevista e forneça um feedback detalhado.

VAGA: ${ROLE_LABELS[role]} - ${COMPANY_LABELS[companyType]}
NÍVEL: ${LEVEL_LABELS[level]}

TRANSCRIÇÃO DA ENTREVISTA:
${conversation}

Retorne um JSON válido com EXATAMENTE esta estrutura (sem markdown, apenas JSON puro):
{
  "score": <número de 0 a 100>,
  "summary": "<resumo geral da performance em 2-3 frases>",
  "strengths": [
    "<ponto forte 1>",
    "<ponto forte 2>",
    "<ponto forte 3>"
  ],
  "improvements": [
    {
      "area": "<área de melhoria>",
      "description": "<descrição do problema>",
      "suggestion": "<sugestão específica de como melhorar>"
    }
  ],
  "studyPlan": [
    {
      "topic": "<tópico para estudar>",
      "priority": "alta" | "média" | "baixa",
      "resources": ["<recurso 1>", "<recurso 2>"]
    }
  ],
  "verdict": "aprovado" | "em_desenvolvimento" | "precisa_evoluir",
  "verdictMessage": "<mensagem personalizada de 1-2 frases sobre o veredicto>"
}

Seja honesto mas construtivo. Foque no que é realista para o nível ${LEVEL_LABELS[level]}.`;
}
