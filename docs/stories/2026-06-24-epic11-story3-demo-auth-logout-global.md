# Story EP-11.3: Isolamento definitivo de demo auth e logout global

## Status
Ready for Review

## Executor Assignment

executor: "@dev"  
quality_gate: "@architect"  
quality_gate_tools:
- `npm run lint`
- `npm run typecheck`
- `npm test`
- targeted auth contract review

## Épica
EP-11 — Auth Enhancement  
Spec: `docs/epics/epic-11-auth-enhancement.md`

## Story

**As a** mantenedor da autenticação,  
**I want** remover o risco residual do demo auth legado e fechar a semântica de logout global,  
**so that** produção e desenvolvimento tenham comportamentos previsíveis e seguros.

## Contexto

O fluxo atual usa Supabase-only. O risco residual mapeado era a presença de artefatos demo no cliente e uma documentação divergente apontando para `src/lib/demo-auth.ts`, além do logout global depender de `accessToken` e `SUPABASE_SERVICE_ROLE_KEY`.

## Acceptance Criteria

- [ ] **AC1** — Demo auth legado deixa de participar do bundle/fluxo produtivo
- [ ] **AC2** — A documentação de demo auth reflete o código real
- [ ] **AC3** — Logout global e fallback local-only ficam explicitamente definidos em Next e Edge
- [ ] **AC4** — A UI trata 429/rate limit e falhas de logout de forma distinguível onde fizer sentido
- [ ] **AC5** — Testes cobrem logout global, fallback e isolamento do demo auth

## Scope

### In Scope
- Cleanup/isolamento de demo auth
- Semântica de logout
- Ajuste de documentação
- Testes de contrato/UX

### Out of Scope
- Session rotation
- RBAC completo
- OpenAPI/Swagger

## Tasks / Subtasks

- [x] Auditar referências demo ainda ativas
- [x] Remover ou encapsular artefatos residuais no cliente
- [x] Unificar a narrativa de logout entre Next e Edge
- [x] Atualizar docs e testes

## Dependencies

- `src/lib/app-store.tsx`
- `docs/DEMO-AUTH.md`
- `app/api/auth/session/route.ts`
- `supabase/functions/auth-session/index.ts`

## Testing

- `tests/login-errors.spec.ts`
- testes de logout com e sem `service_role`

## File List

- `src/lib/app-store.tsx`
- `src/lib/auth.ts`
- `src/lib/env-validation.ts`
- `src/types/index.ts`
- `docs/DEMO-AUTH.md`
- `app/api/auth/session/route.ts`
- `supabase/functions/auth-session/index.ts`
- `docs/api/auth-session.md`
- `docs/api/edge-functions.md`
- `src/__tests__/app/api/auth-session-route.test.ts`
- `src/__tests__/lib/app-store.test.ts`
- `src/__tests__/lib/auth.test.ts`
- `tests/login-errors.spec.ts`
- `docs/stories/2026-06-24-epic11-story3-demo-auth-logout-global.md`

## Change Log

- 2026-06-24 — @po (Pax) — Story refinada para atacar o maior risco residual identificado na auditoria de EP-11.
- 2026-06-24 — @dev (Dex) — Removido login simulado do `AppStore`, documentação de demo auth corrigida e contrato de logout padronizado com `mode: global|local-only`.

## Dev Agent Record

### Agent Model Used

- GPT-5 Codex

### Debug Log References

- `npx vitest run src/__tests__/lib/app-store.test.ts src/__tests__/app/api/auth-session-route.test.ts src/__tests__/lib/auth.test.ts src/__tests__/lib/session-token.test.ts src/__tests__/lib/authorize.test.ts`
- `npm run typecheck`
- `npm run lint`

### Completion Notes

- O cliente admin não expõe mais `demoAccessList` nem `login()` simulado.
- `DELETE /api/auth/session` e `DELETE /functions/v1/auth-session` agora retornam se o logout foi `global` ou `local-only`.
- A UI do logout continua encerrando a sessão local sempre, mas avisa quando a revogação global não pôde ser confirmada.
