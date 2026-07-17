# RH Cursos — Plataforma de Cursos

Plataforma SaaS de cursos corporativos da RH Cursos: catálogo público, fluxo de inscrição/checkout, área administrativa e captação de leads in-company. Aplicação fullstack com SSR, design system próprio e banco gerenciado no Supabase, publicada em Cloudflare Workers.

### Tech Stack Badges

[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript 5.8](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-green?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue?logo=tailwindcss)](https://tailwindcss.com/)
[![Mantine](https://img.shields.io/badge/Mantine-UI-7950f2)](https://mantine.dev/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-orange?logo=cloudflare)](https://workers.cloudflare.com/)

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| **Framework** | Next.js 16 (App Router, SSR) |
| **UI** | React 19, TypeScript 5.8 |
| **Estilo** | Tailwind CSS + Mantine + Radix UI (design tokens unificados via CSS custom properties) |
| **Estado** | AppStore (Supabase como fonte única de dados, real-time subscriptions) |
| **Validação** | Zod |
| **Backend** | Supabase (Postgres, Auth, Edge Functions, RLS) |
| **Deploy** | Cloudflare Workers via `@opennextjs/cloudflare` |
| **Testes** | Vitest + React Testing Library (unit) · Playwright + Axe-core (E2E/a11y) |
| **Analytics** | Google Analytics 4 (opcional, no-op sem `NEXT_PUBLIC_GA_MEASUREMENT_ID`) |

---

## Pré-requisitos

- **Node.js >= 24** (ver `engines` no `package.json`)
- **npm**
- Um projeto **Supabase** de teste (para desenvolvimento local — nunca use credenciais de produção no dev)

---

## Quick Start (30 minutos)

Novo no projeto? Siga o **[Guia de Quick Start](docs/guides/QUICK-START.md)** para fazer setup em 30 minutos:

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
#    Edite .env.local com credenciais Supabase

# 3. Rodar em modo desenvolvimento
npm run dev
#    App disponível em http://localhost:3000
```

Veja [**docs/guides/QUICK-START.md**](docs/guides/QUICK-START.md) para instruções detalhadas de setup.

### Variáveis de ambiente essenciais

Consulte `.env.example` para a lista completa e comentada. As principais:

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `AUTH_SESSION_SECRET` | Sim (produção) | Segredo de assinatura do cookie de sessão (mín. 32 chars) |
| `SSR_AUTH_ROLLOUT_ACCOUNTS` | Somente REC-204 Fase A | Allowlist server-only de contas de teste (e-mails separados por vírgula); vazio preserva o fluxo legado |
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | URL pública do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Sim | Anon key (segura para o frontend) |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim (scripts/migrations) | Service role key — **secreta**, nunca exposta no frontend |
| `SUPABASE_DB_URL` | Scripts locais | Connection string Postgres |
| `NEXT_PUBLIC_APP_URL` | Sim | URL pública do app (CORS, redirects) |
| `NEXT_PUBLIC_ENABLE_DEMO_AUTH` | Não | Feature flag do demo auth (**`false` por padrão**) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Não | ID do GA4 (sem ele, analytics fica inativo) |

> **Segurança:** o demo auth é desabilitado por padrão e jamais deve ser ativado em produção.

---

## Scripts npm

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento (Next.js) |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | `next typegen` + `tsc --noEmit` |
| `npm test` | Gate completo: typecheck + build + Playwright (E2E/visual/a11y) |
| `npm run test:unit` | Testes unitários (Vitest) |
| `npm run test:coverage` | Testes unitários com cobertura |
| `npm run docs:api:lint` | Validação estrutural da spec OpenAPI |
| `npm run docs:api:build` | Gera `public/api-docs.html` a partir da spec |
| `npm run docs:api:check-drift` | Compara a superfície do código com a spec |
| `npm run test:watch` | Vitest em modo watch |
| `npm run devops:all` | Fluxo local seguro pré-push (lint, typecheck, build, test, CodeRabbit) |
| `npm run build:workers` | Build para Cloudflare Workers (OpenNext) |
| `npm run preview:workers` | Build + preview local do bundle Workers |
| `npm run deploy:workers` | Build + deploy para Cloudflare Workers |
| `npm run verify:workers` | Verificação pós-deploy |
| `npm run seed:admin` | Seed de usuário admin (usa `.env.local`) |

---

## Estrutura do projeto

```
app/                    # Next.js App Router (rotas, layouts, páginas)
├── admin/              # Área administrativa (protegida)
├── api/                # Route Handlers (ex.: auth/session)
├── cursos/ curso/      # Catálogo e detalhe de curso
├── agenda/ blog/       # Conteúdo público
├── contato/ in-company/falar-com-especialista/  # Captação/leads
├── error.tsx           # Error boundary de rota
└── global-error.tsx    # Error boundary global

src/
├── components/         # Componentes de UI (design system)
├── features/           # Módulos por feature (clean architecture feature-first)
├── views/              # Composições de página
├── hooks/              # Custom hooks
├── lib/                # Utilitários, auth, rate-limit, Supabase clients
├── data/               # Acesso a dados / AppStore
├── design-tokens/      # Tokens de cor/superfície (Mantine ↔ Tailwind)
├── theme/ styles/      # Tema e estilos globais
├── types/              # Tipos TypeScript compartilhados
└── __tests__/          # Testes unitários (Vitest)

supabase/
├── functions/          # Edge Functions (auth-session, enrollments, leads, admin-resources)
└── migrations/         # 13 migrations versionadas

docs/                   # Documentação (arquitetura, database, design, API, stories)
tests/                  # Testes E2E/visual/a11y (Playwright)
scripts/                # Automação (deploy, devops, seed, runners)
```

---

## API

A documentação dos endpoints está em [`docs/api/README.md`](docs/api/README.md). A API é dividida em duas camadas:

- **Route Handlers (Next.js):** login/logout administrativo via `/api/auth/session`
- **Edge Functions (Supabase):** `enrollments`, `leads`, `admin-resources`, `auth-session`
- **UI navegável:** [`/api-docs.html`](./public/api-docs.html)

### Convenções Gerais

- **Formato:** todas as respostas são JSON com envelope `{ "ok": boolean, ... }`
- **Erro:** `{ "ok": false, "error": "descrição" }`
- **Autenticação:** cookie HttpOnly (`SESSION_COOKIE`) para rotas admin, JWT para Edge Functions
- **Rate limiting:** endpoints sensíveis limitam por IP e retornam `429` com header `Retry-After`
- **CORS:** Edge Functions validam header `Origin` contra allowlist

---

## Banco de dados

Schema, auditoria e políticas RLS documentados em:

- [`docs/database/SCHEMA.md`](docs/database/SCHEMA.md) — esquema completo
- [`docs/database/DB-AUDIT.md`](docs/database/DB-AUDIT.md) — auditoria de segurança (rating A+)

Migrations versionadas em `supabase/migrations/` (13 migrations estáveis, 100% de cobertura RLS).

---

## Deploy (Cloudflare Workers)

O projeto é publicado em Cloudflare Workers via `@opennextjs/cloudflare`.

**Guia completo:** [**docs/DEPLOYMENT.md**](docs/DEPLOYMENT.md)

```bash
# Validar o bundle localmente antes de publicar
npm run preview:workers

# Build + deploy
npm run deploy:workers

# Verificação pós-deploy
npm run verify:workers
```

Variáveis sensíveis em produção devem ser configuradas como **secrets** do Worker
(`wrangler secret put <NOME>`) ou no painel do Cloudflare — nunca commitadas.

Consulte [**docs/DEPLOYMENT.md**](docs/DEPLOYMENT.md) para:
- Configuração de GitHub secrets
- Setup de Cloudflare Workers
- Rollback de emergência
- Monitoramento pós-deploy

---

## Testes

```bash
npm run test:unit        # Unitários (Vitest + RTL) — ~91% de cobertura
npm run test:coverage    # Com relatório de cobertura
npm test                 # Gate completo (typecheck + build + Playwright E2E/visual/a11y)
```

A suíte E2E inclui gates de acessibilidade (Axe-core), regressão visual, navegação por
teclado e contraste de cores (WCAG 2.1 AA).

---

## Troubleshooting

Encontrou um problema? Consulte o **[Guia de Troubleshooting](docs/guides/TROUBLESHOOTING.md)** com soluções para:

- Erros de instalação & setup
- Problemas com desenvolvimento local
- Falhas em testes
- Problemas de build & deploy
- Autenticação
- Banco de dados
- Performance

**Problemas comuns:**

| Sintoma | Causa provável | Solução |
|---------|----------------|---------|
| `npm run dev` não inicia | Porta 3000 em uso | `npm run dev -- -p 3001` |
| `npm run build` falha | `.env.local` faltando | `cp .env.example .env.local` e preencha |
| Login retorna `503 Auth indisponivel` | Supabase não acessível | Verifique `NEXT_PUBLIC_SUPABASE_URL` |
| Login retorna `429` | Rate limit brute-force | Aguarde 60 segundos e tente novamente |
| Playwright instável | Testes paralelos | Execução já é sequencial (`--workers=1`) |

**Veja mais:** [**docs/guides/TROUBLESHOOTING.md**](docs/guides/TROUBLESHOOTING.md)

---

## Documentação

### Comece aqui

- **[docs/guides/QUICK-START.md](docs/guides/QUICK-START.md)** — Setup em 30 minutos para novos devs
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** — Guia completo de deploy para Cloudflare Workers
- **[docs/guides/TROUBLESHOOTING.md](docs/guides/TROUBLESHOOTING.md)** — Soluções para problemas comuns

### Arquitetura & Design

- [docs/architecture/system-architecture.md](docs/architecture/system-architecture.md) — Visão geral do sistema
- [docs/architecture/frontend-feature-first-architecture.md](docs/architecture/frontend-feature-first-architecture.md) — Organização feature-first
- [docs/design-system/](docs/design-system/) — Design tokens e componentes

### API & Backend

- [docs/api/README.md](docs/api/README.md) — Overview de endpoints
- [docs/api/openapi.json](docs/api/openapi.json) — Especificação OpenAPI (navegue em `/api-docs.html`)

### Banco de Dados

- [docs/database/SCHEMA.md](docs/database/SCHEMA.md) — Esquema completo
- [docs/database/DB-AUDIT.md](docs/database/DB-AUDIT.md) — Auditoria de segurança (rating A+)
- [docs/database/MIGRATIONS.md](docs/database/MIGRATIONS.md) — Histórico de migrations

### Epics & Stories

- [docs/epics/](docs/epics/) — Planejamento de features (EPICs)
- [docs/stories/](docs/stories/) — Histórias de desenvolvimento (Stories)

### Acessibilidade & Qualidade

- [docs/accessibility/](docs/accessibility/) — Checklist WCAG 2.1 AA
- [docs/qa/](docs/qa/) — Planos de teste e checklists
- [docs/architecture/TECHNICAL-DEBT-REPORT.md](docs/architecture/TECHNICAL-DEBT-REPORT.md) — Avaliação de dívida técnica

---

## Licença

Projeto proprietário — RH Cursos. Todos os direitos reservados.
