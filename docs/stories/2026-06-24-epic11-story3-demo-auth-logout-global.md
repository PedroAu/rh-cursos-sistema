# Story EP-11.3: Isolamento definitivo de demo auth e logout global

## Status
Done

> ACs reconciliados com a evidência de implementação e com o quality gate verde de 2026-06-25. Story encerrada como `Done`.

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

- [x] **AC1** — Demo auth legado deixa de participar do bundle/fluxo produtivo
- [x] **AC2** — A documentação de demo auth reflete o código real
- [x] **AC3** — Logout global e fallback local-only ficam explicitamente definidos em Next e Edge
- [x] **AC4** — A UI trata 429/rate limit e falhas de logout de forma distinguível onde fizer sentido
- [x] **AC5** — Testes cobrem logout global, fallback e isolamento do demo auth

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
- `src/lib/rate-limit.ts`
- `supabase/functions/auth-session/index.ts`
- `docs/api/auth-session.md`
- `docs/api/edge-functions.md`
- `src/__tests__/app/api/auth-session-route.test.ts`
- `src/__tests__/lib/app-store.test.ts`
- `src/__tests__/lib/auth.test.ts`
- `src/__tests__/lib/rate-limit.test.ts`
- `tests/login-errors.spec.ts`
- `docs/stories/2026-06-24-epic11-story3-demo-auth-logout-global.md`

## Change Log

- 2026-06-24 — @po (Pax) — Story refinada para atacar o maior risco residual identificado na auditoria de EP-11.
- 2026-06-24 — @dev (Dex) — Removido login simulado do `AppStore`, documentação de demo auth corrigida e contrato de logout padronizado com `mode: global|local-only`.
- 2026-06-24 — Codex — ACs reconciliados com `npm run lint`, `npm run typecheck` e `npm test` verdes; file list atualizada para incluir rate limiting e seus testes.

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

## QA Results

### Review Date: 2026-06-25

### Reviewed By: Quinn (Test Architect)

### Code Quality Assessment

O isolamento de demo auth e a semântica de logout ficaram consistentes com o comportamento validado em testes. A suíte atual confirma persistência de login, distinção de `local-only` no contrato e ausência de regressão no shell público/admin.

### Refactoring Performed

Nenhum. Revisão somente de evidência e gate.

### Compliance Check

- Coding Standards: ✓ Sem desvios detectados nesta revisão
- Project Structure: ✓ Cleanup e documentação permanecem alinhados ao escopo da story
- Testing Strategy: ✓ Evidência atual validada com `118 passed` em `npm test`
- All ACs Met: ✓ AC1-AC5 reconciliados com testes e documentação

### Improvements Checklist

- [x] Validado gate completo do branch em 2026-06-25
- [x] Confirmado o contrato determinístico de logout `global|local-only`
- [ ] Reavaliar futuramente telemetria/operator messaging para `429` e `503`

### Security Review

Sem bloqueio para fechamento desta story. O logout continua fail-safe localmente mesmo quando a revogação global não é confirmada.

### Performance Considerations

Sem regressão identificada na execução atual.

### Files Modified During Review

- `docs/stories/2026-06-24-epic11-story3-demo-auth-logout-global.md`
- `docs/qa/gates/epic11.3-demo-auth-logout-global.yml`

### Gate Status

Gate: PASS → `docs/qa/gates/epic11.3-demo-auth-logout-global.yml`

### Recommended Status

[✓ Ready for Done]

- 2026-06-25 — @devops (Gage/Codex) — Revisão final consumida; status promovido de `Ready for Review` para `Done`.
