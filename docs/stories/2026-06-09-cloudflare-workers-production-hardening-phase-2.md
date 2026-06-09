# Story: Cloudflare Workers Production Hardening Phase 2

## Status
Done

## Contexto

Após a migração do frontend para Cloudflare Workers, o domínio público ainda não estava preso ao novo runtime e o Worker seguia exposto via `workers.dev`. Além disso, os headers de segurança não estavam sendo emitidos pelo runtime SSR, o que enfraquecia a postura de produção mesmo com o deploy funcional.

## Acceptance Criteria

- [x] Desabilitar `workers.dev` e Preview URLs no Worker de produção
- [x] Versionar os domínios produtivos no `wrangler.jsonc`
- [x] Redirecionar `rhcursos.com.br` para `www.rhcursos.com.br` dentro do runtime
- [x] Reaplicar headers de segurança no fluxo SSR/Workers
- [x] Atualizar documentação operacional da fase 2
- [x] Executar deploy produtivo da fase 2
- [x] Validar com `npm run lint`
- [x] Validar com `npm run typecheck`
- [x] Validar com `npm test`
- [x] Validar com `npm run build:workers`

## Scope

### In Scope

- Hardening do `wrangler.jsonc`
- `middleware.ts` para redirect canônico e security headers
- Atualização da documentação de deploy
- Publicação do Worker com os domínios de produção

### Out of Scope

- Reconfiguração de cache ISR com KV/R2
- Cloudflare Access para ambientes de preview
- Mudanças na arquitetura das Edge Functions do Supabase

## Tarefas / Subtarefas

- [x] Versionar rotas/domínios do Worker
- [x] Desabilitar `workers.dev` e preview públicos
- [x] Aplicar security headers no runtime Next
- [x] Implementar redirect do apex para `www`
- [x] Remover o projeto legado do Cloudflare Pages após liberar os domínios
- [x] Atualizar documentação operacional
- [x] Rodar quality gates
- [x] Publicar fase 2 e validar em produção

## File List

- `wrangler.jsonc`
- `middleware.ts`
- `public/_headers`
- `public/_redirects`
- `DEPLOYMENT.md`
- `eslint.config.mjs`
- `docs/stories/2026-06-09-cloudflare-workers-production-hardening-phase-2.md`
