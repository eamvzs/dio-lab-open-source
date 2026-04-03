# InterviewOS

Simulador de entrevistas técnicas com IA para desenvolvedores júniors.

Pratique antes da entrevista que importa — escolha a vaga, o nível e o estilo da empresa. A IA conduz a entrevista, avalia suas respostas e entrega feedback detalhado com plano de estudos personalizado.

## Demo

> Deploy: [interviewos.vercel.app](https://interviewos.vercel.app) _(configure após deploy)_

![InterviewOS Preview](./docs/preview.png)

## Funcionalidades

- **5 vagas simuladas**: Frontend JR, Backend JR, Full Stack JR, Dados JR, Mobile JR
- **2 níveis**: Júnior (0-1 ano) e Júnior Avançado (1-2 anos)
- **4 estilos de empresa**: Startup, Empresa Grande, Big Tech, Fintech
- **Chat natural com IA**: perguntas técnicas e comportamentais adaptadas ao contexto
- **Feedback cirúrgico**: score 0-100, pontos fortes, gaps identificados
- **Plano de estudos**: tópicos priorizados com recursos para cada gap
- **Histórico e progresso**: dashboard com evolução ao longo do tempo
- **Auth via GitHub**: login seguro e rápido

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 + TypeScript + TailwindCSS |
| UI Components | shadcn/ui (Radix UI) |
| IA | Google Gemini 1.5 Flash |
| Banco de dados | SQLite (dev) / PostgreSQL (prod) |
| ORM | Prisma |
| Auth | NextAuth.js v5 |
| Deploy | Vercel |

## Como rodar localmente

### 1. Clone e instale as dependências

```bash
git clone https://github.com/seu-usuario/interviewos.git
cd interviewos
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Preencha o `.env`:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."          # openssl rand -base64 32

GITHUB_CLIENT_ID="..."         # github.com/settings/developers
GITHUB_CLIENT_SECRET="..."

GEMINI_API_KEY="..."           # aistudio.google.com/app/apikey
```

### 3. Configure o banco de dados

```bash
npm run db:push
```

### 4. Rode o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Deploy na Vercel

1. Fork este repositório
2. Importe na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente no painel
4. Mude `DATABASE_URL` para uma URL PostgreSQL (Neon, Supabase ou Railway — todos gratuitos)
5. Mude `NEXTAUTH_URL` para a URL do seu deploy
6. Deploy automático a cada push

## Estrutura do projeto

```
interviewos/
├── app/
│   ├── api/
│   │   ├── auth/          # NextAuth handlers
│   │   ├── interview/     # start, answer, end, session
│   │   └── history/       # histórico e stats
│   ├── dashboard/         # dashboard com histórico
│   ├── feedback/          # página de feedback pós-entrevista
│   ├── interview/         # chat da entrevista
│   ├── login/             # página de login
│   └── setup/             # configuração da entrevista
├── components/ui/          # componentes base (shadcn/ui)
├── lib/
│   ├── auth.ts            # config NextAuth
│   ├── gemini.ts          # engine de IA + prompts
│   ├── prisma.ts          # cliente Prisma
│   └── utils.ts           # helpers
├── prisma/
│   └── schema.prisma      # schema do banco
└── types/                 # tipos TypeScript
```

## Como a IA funciona

O Gemini recebe um **system prompt** construído dinamicamente com:
- Contexto técnico da vaga (stack esperada, conceitos avaliados)
- Perfil da empresa (tom, foco, estilo de perguntas)
- Instruções de conduta (uma pergunta por vez, reagir contextualmente)

O histórico completo de mensagens é reconstruído a cada request para manter o contexto da conversa.

Para o feedback, um segundo prompt analisa a transcrição completa e retorna um JSON estruturado com score, pontos fortes, gaps e plano de estudos.

## Contribuindo

Contribuições são bem-vindas! Veja as [issues abertas](https://github.com/seu-usuario/interviewos/issues) ou abra uma nova.

```bash
git checkout -b feature/minha-feature
git commit -m "feat: adiciona minha feature"
git push origin feature/minha-feature
```

## Licença

MIT
