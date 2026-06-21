# RH Cursos

Aplicacao Next.js App Router para o site publico e backoffice administrativo da RH Cursos.

## O que este app faz

- Site publico de marketing, catalogo de cursos, agenda, inscricao e contato.
- Backoffice admin para cursos, turmas, leads, alunos, professores, usuarios e configuracoes.
- Supabase para Auth, Postgres, RLS, storage administrativo e operacoes server-side com service role.
- Asaas para criacao de cobrancas Pix/Boleto e reconciliacao por webhook.
- Deploy em Cloudflare Workers via OpenNext.

## Stack principal

- Next.js 16 App Router e React 19.
- Tailwind CSS 4 com tokens em `src/app/globals.css`.
- Supabase SSR/admin clients em `src/lib/supabase`.
- Asaas REST v3 em `src/lib/asaas`.
- OpenNext Cloudflare com `wrangler.jsonc`.

## Desenvolvimento local

```bash
npm ci
npm run dev
```

Abra `http://localhost:3000`.

Comandos de verificacao:

```bash
npm run lint
npm run typecheck
npm test
npm run build:cloudflare
```

`npm run build` executa o build Next.js puro. Ele e util para validar compilacao do app, mas nao e o artefato de producao no Cloudflare. Para validar o build de producao deste projeto, use `npm run build:cloudflare` ou `npm run deploy:check`.

## Variaveis de ambiente

Use `.env.example` como base. Variaveis principais:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ASAAS_BASE_URL`
- `ASAAS_API_KEY`
- `ASAAS_USER_AGENT`
- `ASAAS_WEBHOOK_AUTH_TOKEN`

Arquivos `.env*` locais nao devem ser versionados.

## Deploy

O deploy de producao e Cloudflare Workers com OpenNext. Nao use Vercel como alvo padrao, `next export`, nem Cloudflare Pages estatico: o app depende de Server Actions, rotas dinamicas, cookies de auth e integracoes server-side.

Fluxo recomendado:

```bash
npm ci
npm run deploy:check
npm run preview:cloudflare
```

Leia [docs/deploy.md](docs/deploy.md) para checklist de producao, variaveis de ambiente e comandos Cloudflare.

## Documentacao relevante

- [Arquitetura brownfield](docs/architecture/system-architecture.md)
- [Deploy Cloudflare/OpenNext](docs/deploy.md)
- [Auditoria do design system](docs/design-system-audit.md)
- [Design system proposto](docs/design-system.md)
