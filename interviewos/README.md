# InterviewOS

Simulador de entrevistas técnicas com IA para desenvolvedores júniors.

Pratique antes da entrevista que importa — escolha a vaga, o nível e o estilo da empresa. A IA conduz a entrevista, avalia suas respostas e entrega feedback detalhado com plano de estudos personalizado.

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

> **Modo demo ativo por padrão** — funciona 100% sem GitHub OAuth nem chave Gemini.

### 1. Clone e instale as dependências

```bash
git clone https://github.com/seu-usuario/interviewos.git
cd interviewos/interviewos
npm install
```

### 2. Configure as variáveis de ambiente

Crie o arquivo `.env` (no Windows PowerShell):

```powershell
@"
DATABASE_URL="file:./dev.db"
DIRECT_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="FRcGN6cWDrgeltAH7ZIsHRDXu5deUJAyGtv4Zw/LXvc="
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GEMINI_API_KEY="your-gemini-api-key"
"@ | Out-File -FilePath .env -Encoding utf8
```

Ou no Linux/Mac:
```bash
cp .env.example .env
```

> GitHub OAuth e Gemini API são **opcionais** — sem eles o app roda em modo demo com IA simulada.

### 3. Crie o banco de dados

```bash
npm run setup:dev
```

### 4. Rode o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Deploy na Vercel

1. Importe o repositório em [vercel.com/new](https://vercel.com/new)
2. Configure o **Root Directory** como `interviewos`
3. Adicione as variáveis de ambiente no painel da Vercel:
   - `DATABASE_URL` → URL PostgreSQL do [Neon](https://neon.tech) (gratuito)
   - `DIRECT_URL` → mesma URL do Neon
   - `NEXTAUTH_URL` → `https://seu-app.vercel.app`
   - `NEXTAUTH_SECRET` → string segura (`openssl rand -base64 32`)
   - `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET` → [github.com/settings/developers](https://github.com/settings/developers)
   - `GEMINI_API_KEY` → [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
4. Clique em Deploy — a partir daí, cada `git push` dispara deploy automático

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
