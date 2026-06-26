# Story EP-11.1: Sessão admin com rotação deslizante e expiração consistente

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
- targeted auth tests

## Épica
EP-11 — Auth Enhancement  
Spec: `docs/epics/epic-11-auth-enhancement.md`

## Story

**As a** admin autenticado,  
**I want** que minha sessão SSR/HMAC seja renovada por atividade e expire de forma previsível,  
**so that** eu não perca acesso indevidamente e o sistema mantenha um contrato seguro entre Next e Supabase.

## Contexto

Hoje a sessão é emitida no login e expira apenas por TTL fixo. Não há rotação por atividade em `app/api/auth/session/route.ts`, `src/lib/auth.ts` e `src/lib/server-session.ts`, o que deixa o AC de session rotation aberto no plano da Fase B.

## Acceptance Criteria

- [x] **AC1** — Sessão HMAC/cookie adota rotação deslizante baseada em atividade autenticada
- [x] **AC2** — TTL e payload de sessão ficam consistentes entre `src/lib/auth.ts` e `src/lib/supabase/session-token.ts`
- [x] **AC3** — `/admin` continua protegido server-side sem regressão de SSR
- [x] **AC4** — O contrato de renovação de sessão é documentado para Next Route Handler e Edge Function
- [x] **AC5** — Testes cobrem expiração, renovação e falha segura

## Scope

### In Scope
- Rotação de sessão
- TTL/exp consistentes
- SSR guard preservado
- Testes unitários e/ou integração da sessão

### Out of Scope
- RBAC triplo completo
- Reativar novos portais
- Swagger/OpenAPI

## Tasks / Subtasks

- [x] Mapear os pontos de leitura e emissão de sessão
- [x] Definir regra de sliding expiration
- [x] Implementar renovação sem quebrar `/admin`
- [x] Atualizar docs e testes

## Dependencies

- `docs/stories/2026-06-09-admin-ssr-auth-foundation.md`
- `app/api/auth/session/route.ts`
- `src/lib/auth.ts`
- `src/lib/server-session.ts`
- `src/lib/supabase/session-token.ts`

## Testing

- `src/__tests__/lib/auth.test.ts`
- `src/__tests__/lib/execution-test.test.ts`
- fluxo autenticado em Playwright, se necessário

## File List

- `app/api/auth/session/route.ts`
- `src/lib/auth-session.ts`
- `src/lib/auth.ts`
- `src/lib/server-session.ts`
- `src/lib/supabase/session-token.ts`
- `supabase/functions/_shared/auth.ts`
- `src/__tests__/lib/auth.test.ts`
- `src/__tests__/lib/session-token.test.ts`
- `src/__tests__/lib/app-store.test.ts`
- `src/lib/app-store.tsx`
- `docs/api/auth-session.md`
- `docs/stories/2026-06-24-epic11-story1-session-rotation.md`

## Change Log

- 2026-06-24 — @po (Pax) — Story refinada a partir de `D-1.4` com foco exclusivo em session rotation, TTL e SSR safety.
- 2026-06-24 — @dev (Dex) — Implementada rotação deslizante via `GET /api/auth/session`, sincronização do token HMAC no cliente admin e cobertura de expiração/renovação.
- 2026-06-24 — Codex — ACs reconciliados com `npm run lint`, `npm run typecheck` e `npm test` verdes; file list atualizada com o shared auth da Edge Function.

## Dev Agent Record

### Agent Model Used

- GPT-5 Codex

### Debug Log References

- `npx vitest run src/__tests__/lib/auth.test.ts src/__tests__/lib/session-token.test.ts src/__tests__/lib/app-store.test.ts`
- `npm run typecheck`
- `npm run lint`

### Completion Notes

- Sessão HMAC agora expira e entra em janela de rotação com 5 minutos restantes.
- `GET /api/auth/session` sincroniza o cookie SSR e devolve o token atual ou renovado para manter o header `x-rh-session` consistente no cliente.
- `decodeSessionToken()` passou a rejeitar payloads expirados restaurados do `localStorage`, evitando sessão otimista inválida no admin.

## QA Results

### Review Date: 2026-06-25

### Reviewed By: Quinn (Test Architect)

### Code Quality Assessment

Implementação coerente com os ACs da story e com o contrato SSR/admin atual. A evidência local de 2026-06-25 confirma `npm run lint`, `npm run typecheck` e `npm test` verdes, com cobertura automatizada suficiente para expiração, renovação e fail-closed.

### Refactoring Performed

Nenhum. Revisão somente de evidência e gate.

### Compliance Check

- Coding Standards: ✓ Sem desvios detectados nesta revisão
- Project Structure: ✓ Artefatos e file list permanecem consistentes com o escopo
- Testing Strategy: ✓ Evidência atual validada com `118 passed` em `npm test`
- All ACs Met: ✓ AC1-AC5 reconciliados com código, docs e testes

### Improvements Checklist

- [x] Validado gate completo do branch em 2026-06-25
- [x] Confirmada cobertura para expiração, renovação e SSR guard
- [ ] Fortalecer futuramente a prova HTTP positiva do caminho de rotação fim a fim

### Security Review

Sem achado bloqueante nesta story. A renovação mantém direção segura ao rejeitar sessão expirada/tampered e preservar fail-closed.

### Performance Considerations

Sem regressão observável no gate atual. Build e suíte completa permaneceram estáveis.

### Files Modified During Review

- `docs/stories/2026-06-24-epic11-story1-session-rotation.md`
- `docs/qa/gates/epic11.1-session-rotation.yml`

### Gate Status

Gate: PASS → `docs/qa/gates/epic11.1-session-rotation.yml`

### Recommended Status

[✓ Ready for Done]

- 2026-06-25 — @devops (Gage/Codex) — Revisão final consumida; status promovido de `Ready for Review` para `Done`.
