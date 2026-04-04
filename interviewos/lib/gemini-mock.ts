// Mock responses for demo mode (no Gemini API key needed)

const OPENER_TEMPLATES: Record<string, string> = {
  "frontend-jr": `Olá! Seja bem-vindo(a) à nossa entrevista. Sou o Ricardo, tech lead aqui da empresa. Fico feliz que você tenha chegado até aqui!

Para começar de forma mais descontraída: **me conta um pouco sobre você** — qual foi seu primeiro contato com desenvolvimento frontend e o que te motivou a seguir por esse caminho?`,

  "backend-jr": `Olá! Obrigado por participar do nosso processo seletivo. Meu nome é Ana, sou engenheira sênior aqui na empresa.

Antes de entrarmos nas perguntas técnicas, quero entender um pouco mais sobre você: **como você começou na área de desenvolvimento backend e quais projetos te deixam mais orgulhoso até agora?**`,

  "fullstack-jr": `Oi! Que bom ter você aqui. Meu nome é Carlos, sou CTO da empresa. Nossa stack é bastante variada e precisamos de alguém que consiga transitar bem entre front e back.

Para começar: **me fala um pouco sobre sua trajetória como desenvolvedor — como você chegou ao full stack e qual das duas pontas você se sente mais confortável hoje?**`,

  "data-jr": `Olá! Bem-vindo(a). Sou a Mariana, head de dados aqui. Adorei seu perfil e estou animada para conversar mais!

Para começar: **me conta um pouco sobre você — como surgiu seu interesse por dados e qual foi o projeto de análise que mais te ensinou até hoje?**`,

  "mobile-jr": `Oi! Tudo bem? Aqui é o Felipe, líder técnico do time mobile. Estamos expandindo bastante e precisamos de alguém com vontade de crescer com a gente.

Para esquentar: **me conta sua experiência com desenvolvimento mobile — você já publicou algum app? Como foi esse processo?**`,
};

const QUESTION_POOL: Record<string, string[]> = {
  "frontend-jr": [
    "Ótimo! Agora vamos para o técnico.\n\nVocê pode me explicar a diferença entre **`useEffect`** e **`useLayoutEffect`** no React? Em que situação você usaria um em vez do outro?",
    "Interessante! Mudando um pouco de assunto:\n\nComo você lida com **gerenciamento de estado** em aplicações React? Quando você usaria Context API versus uma biblioteca como Redux ou Zustand?",
    "Legal! Uma pergunta mais prática:\n\nSe uma página está carregando lentamente, **quais seriam seus primeiros passos para investigar e resolver o problema de performance?** Cite pelo menos 2-3 estratégias.",
    "Gostei da sua abordagem. Agora uma pergunta comportamental:\n\nMe conta sobre uma situação em que você recebeu um **feedback difícil** sobre seu código (numa revisão, por exemplo). Como você reagiu e o que aprendeu com isso?",
    "Última pergunta técnica:\n\nO que é **acessibilidade web** para você? Você tem o hábito de pensar nisso durante o desenvolvimento? Cite uma prática que você já aplicou ou aplicaria.",
  ],
  "backend-jr": [
    "Certo! Vamos para o técnico.\n\nMe explica a diferença entre **autenticação e autorização**. Como você implementaria um sistema de login seguro em uma API REST?",
    "Boa! Agora uma situação prática:\n\nImagine que uma rota da sua API está retornando erro 500 em produção mas funciona perfeitamente no seu ambiente local. **Quais seriam seus primeiros passos para investigar?**",
    "Interessante abordagem. Uma pergunta sobre banco de dados:\n\nQual a diferença entre **JOIN e subquery** no SQL? Quando você escolheria uma abordagem em vez da outra?",
    "Agora algo mais comportamental:\n\nMe conta um projeto ou feature que você construiu do zero. **Quais decisões técnicas você tomou e por quê?** O que faria diferente hoje?",
    "Última:\n\nComo você pensa sobre **segurança de APIs**? Cite pelo menos 3 vulnerabilidades comuns e como você as preveniria.",
  ],
  "fullstack-jr": [
    "Ótimo! Primeira técnica:\n\nComo você estrutura a **comunicação entre frontend e backend** num projeto full stack? Você prefere REST ou GraphQL, e por quê?",
    "Interessante. Agora sobre deploy:\n\nMe explica como você colocaria uma aplicação full stack no ar. Quais ferramentas usaria e **quais variáveis de ambiente precisariam ser configuradas?**",
    "Boa! Uma situação real:\n\nVocê está implementando um formulário de cadastro. **Onde você faria a validação dos dados** — só no frontend, só no backend, ou nos dois? Justifique.",
    "Agora algo comportamental:\n\nVocê já precisou aprender uma tecnologia nova rapidamente para entregar um projeto? **Me conta como foi esse processo.**",
    "Última técnica:\n\nO que é **CORS** e por que ele existe? Como você configuraria no backend para permitir requisições do seu frontend?",
  ],
  "data-jr": [
    "Ótimo! Vamos começar com SQL:\n\nMe escreve mentalmente uma query que **retorna os 5 clientes que mais compraram no último mês**, dado que você tem tabelas de 'clientes' e 'pedidos'. Como você estruturaria isso?",
    "Boa! Agora sobre Python:\n\nVocê tem um DataFrame do pandas com valores nulos em algumas colunas. **Quais são as estratégias possíveis para lidar com esses dados faltantes** e como você decide qual usar?",
    "Interessante. Uma pergunta mais conceitual:\n\nQual a diferença entre **média, mediana e moda**? Em que situação cada uma é mais adequada para representar um conjunto de dados?",
    "Agora algo prático:\n\nMe conta sobre uma análise que você fez que gerou um **insight não óbvio**. Qual foi o processo, do dado bruto à conclusão?",
    "Última:\n\nO que você sabe sobre **overfitting** em machine learning? Como você detectaria e evitaria esse problema num modelo?",
  ],
  "mobile-jr": [
    "Ótimo! Primeira técnica:\n\nQual a diferença entre **StatefulWidget e StatelessWidget** no Flutter (ou entre componentes com e sem estado no React Native)? Quando você usa cada um?",
    "Interessante. Sobre performance mobile:\n\nQuais técnicas você usa para evitar que um app mobile fique **lento ou com travamentos** durante a navegação?",
    "Boa! Uma situação prática:\n\nComo você lida com **chamadas de API** num app mobile? Como trata loading states, erros de rede e cache?",
    "Agora algo comportamental:\n\nMe conta sobre o app mais complexo que você já desenvolveu. **Qual foi o maior desafio técnico** e como você resolveu?",
    "Última:\n\nComo você **testa** um aplicativo mobile antes de publicar? Quais tipos de teste você faz e em quais dispositivos?",
  ],
};

const ENDINGS = [
  `Muito obrigado(a) pela conversa! Foi um prazer conhecer você e entender mais sobre sua trajetória.

Suas respostas foram bastante reveladoras. Nossa equipe vai analisar com atenção e entrar em contato em breve.

O feedback detalhado da entrevista estará disponível logo mais — inclui pontuação, pontos fortes e um plano de estudos personalizado. Boa sorte! 🚀`,
];

const REACTIONS = [
  "Entendi! ",
  "Faz sentido. ",
  "Boa perspectiva! ",
  "Interessante abordagem. ",
  "Legal que você mencionou isso. ",
];

export function getMockOpener(role: string): string {
  return OPENER_TEMPLATES[role] || OPENER_TEMPLATES["frontend-jr"];
}

export function getMockNextQuestion(
  role: string,
  questionIndex: number,
  lastAnswer: string
): { message: string; isEnding: boolean } {
  const questions = QUESTION_POOL[role] || QUESTION_POOL["frontend-jr"];
  const safeIndex = Math.max(0, questionIndex);

  if (safeIndex >= questions.length) {
    return { message: ENDINGS[0], isEnding: true };
  }

  const reaction = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
  const nextQuestion = questions[safeIndex];

  return {
    message: reaction + nextQuestion,
    isEnding: false,
  };
}

export function getMockFeedback(role: string, score?: number): object {
  const s = score ?? Math.floor(Math.random() * 30) + 55; // 55–85

  return {
    score: s,
    summary: `Você demonstrou boa base conceitual para o nível ${role.includes("advanced") ? "Júnior Avançado" : "Júnior"}. Suas respostas mostraram raciocínio lógico e vontade de aprender, com algumas lacunas técnicas que são completamente esperadas para quem está começando.`,
    strengths: [
      "Comunicação clara e objetiva nas respostas",
      "Boa compreensão dos fundamentos da área",
      "Demonstrou pensamento crítico ao resolver problemas",
    ],
    improvements: [
      {
        area: "Profundidade técnica",
        description: "Algumas respostas ficaram na superfície sem explorar os detalhes de implementação.",
        suggestion: "Tente sempre explicar o 'como' além do 'o quê'. Pratique implementar os conceitos em projetos reais.",
      },
      {
        area: "Casos de borda",
        description: "Em perguntas sobre problemas, nem sempre foram considerados cenários de erro ou edge cases.",
        suggestion: "Ao resolver qualquer problema, pergunte-se: 'O que acontece se der errado? Quais são os limites dessa solução?'",
      },
    ],
    studyPlan: [
      {
        topic: "Fundamentos aprofundados da stack principal",
        priority: "alta",
        resources: ["Documentação oficial", "freeCodeCamp", "The Odin Project"],
      },
      {
        topic: "Projetos práticos com deploy real",
        priority: "alta",
        resources: ["GitHub", "Vercel", "Railway"],
      },
      {
        topic: "Testes unitários básicos",
        priority: "média",
        resources: ["Jest docs", "Testing Library", "Vitest"],
      },
    ],
    verdict: s >= 75 ? "aprovado" : s >= 55 ? "em_desenvolvimento" : "precisa_evoluir",
    verdictMessage:
      s >= 75
        ? "Ótima performance! Você está pronto para encarar vagas júnior com confiança."
        : s >= 55
        ? "Você está no caminho certo. Com mais prática e estudo focado, estará pronto em breve."
        : "Continue praticando! Revise os fundamentos e volte para mais simulações.",
  };
}
