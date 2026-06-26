# Story: Cloudflare Workers Post-Deploy Verification Phase 3

## Status
Done

## Contexto

Após a migração para Cloudflare Workers e o hardening do runtime produtivo, a validação operacional ainda dependia de checagens manuais com `curl`. Isso deixava o pipeline cego para regressões no binding de rotas, redirect canônico, proteção do admin e emissão dos headers de segurança.

## Acceptance Criteria

- [x] Criar um verificador CLI reutilizável para o deploy produtivo em Workers
- [x] Validar automaticamente homepage canônica, redirect do apex e proteção do `/admin/`
- [x] Falhar o pipeline quando os headers de segurança esperados não estiverem presentes
- [x] Integrar a validação pós-deploy ao workflow do frontend
- [x] Atualizar documentação operacional da fase 3
- [x] Validar com `npm run lint`
- [x] Validar com `npm run typecheck`
- [x] Validar com `npm test`
- [x] Validar com `npm run build`
- [x] Validar com `npm run build:workers`
- [x] Executar `npm run verify:workers` contra produção

## Scope

### In Scope

- Script CLI de verificação pós-deploy
- Integração do script no workflow de deploy do frontend
- Documentação operacional do novo passo de validação

### Out of Scope

- Observabilidade via terceiros (Sentry, Logpush, APM)
- Smoke de fluxos autenticados com credenciais reais
- Rollback automatizado do Worker

## Tarefas / Subtarefas

- [x] Criar script de verificação para o Worker produtivo
- [x] Cobrir root canônico, apex redirect, `/admin/` e headers de segurança
- [x] Integrar a verificação ao `deploy-frontend.yml`
- [x] Atualizar documentação operacional
- [x] Rodar quality gates
- [x] Executar a verificação contra produção

## File List

- `package.json`
- `.github/workflows/deploy-frontend.yml`
- `scripts/verify-workers-deploy.js`
- `DEPLOYMENT.md`
- `docs/stories/2026-06-09-cloudflare-workers-post-deploy-verification-phase-3.md`
