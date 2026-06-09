# Story: Cloudflare Workers Deployment Migration

## Status
Done

## Contexto

O frontend deixou de ser compatível com Cloudflare Pages estático após a introdução de SSR para o admin. Era necessário atualizar a estrutura de deploy para um runtime que suportasse App Router, route handlers e renderização server-side sem trocar de provedor.

## Acceptance Criteria

- [x] Migrar o frontend de Cloudflare Pages estático para Cloudflare Workers com OpenNext
- [x] Adicionar configuração versionada de empacotamento e deploy do Worker
- [x] Atualizar scripts de build/preview/deploy para o runtime da Cloudflare
- [x] Atualizar CI para validar também o empacotamento do Worker
- [x] Atualizar documentação operacional do deploy
- [x] Validar com `npm run lint`
- [x] Validar com `npm run typecheck`
- [x] Validar com `npm run build`
- [x] Validar com `npm run build:workers`

## Scope

### In Scope

- Dependências do adapter OpenNext/Cloudflare
- `wrangler.jsonc` e `open-next.config.ts`
- Workflow de deploy do frontend
- Atualização da documentação de deploy

### Out of Scope

- Migração das Edge Functions do Supabase para o runtime da Cloudflare
- Configuração de domínio customizado no painel da Cloudflare
- Habilitação de cache ISR com R2

## Tarefas / Subtarefas

- [x] Instalar adapter OpenNext e Wrangler
- [x] Criar configuração versionada do Worker
- [x] Atualizar scripts do `package.json`
- [x] Atualizar workflow de deploy do frontend
- [x] Atualizar CI para validar o bundle do Worker
- [x] Atualizar documentação operacional
- [x] Rodar quality gates e empacotamento

## File List

- `package.json`
- `package-lock.json`
- `.gitignore`
- `next.config.mjs`
- `.github/workflows/deploy-frontend.yml`
- `.github/workflows/ci.yml`
- `DEPLOYMENT.md`
- `open-next.config.ts`
- `wrangler.jsonc`
- `docs/stories/2026-06-09-cloudflare-workers-deployment-migration.md`
