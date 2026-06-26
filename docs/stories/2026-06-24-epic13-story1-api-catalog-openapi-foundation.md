# Story EP-13.1: Catálogo canônico da API híbrida e fundação OpenAPI

## Status
Done

## Executor Assignment

executor: "@analyst"  
quality_gate: "@pm"  
quality_gate_tools:
- docs review
- API inventory review
- manual spec validation

## Épica
EP-13 — API Documentation  
Spec: `docs/epics/epic-13-api-documentation.md`

## Story

**As a** responsável pela documentação técnica,  
**I want** consolidar a superfície real da API em um catálogo canônico,  
**so that** a spec OpenAPI nasça alinhada com o código e não apenas com documentação manual.

## Contexto

Já existem `docs/api/README.md`, `auth-session.md` e `edge-functions.md`, mas ainda falta um inventário canônico da API híbrida que será a base da spec.

## Acceptance Criteria

- [x] **AC1** — Todos os endpoints atuais são inventariados com método, runtime e auth
- [x] **AC2** — Gaps do catálogo atual são reconciliados, incluindo `DELETE /functions/v1/auth-session`
- [x] **AC3** — Estrutura e local da spec OpenAPI são definidos
- [x] **AC4** — Fonte de verdade para exemplos, erros, auth e rate limits fica registrada

## Scope

### In Scope
- Inventário de endpoints
- Modelo do contrato
- Reconciliação entre docs e código

### Out of Scope
- Implementação da Swagger UI
- SDK client

## Tasks / Subtasks

- [x] Auditar `app/api/` e `supabase/functions/`
- [x] Comparar com `docs/api/*`
- [x] Definir a fundação da spec

## Dependencies

- `docs/api/README.md`
- `docs/api/auth-session.md`
- `docs/api/edge-functions.md`
- `app/api/auth/session/route.ts`
- `supabase/functions/`

## Testing

- validação manual do inventário
- lint/parse da spec inicial, se já existir

## File List

- `docs/api/README.md`
- `docs/api/auth-session.md`
- `docs/api/edge-functions.md`
- `docs/api/openapi.yaml`
- `docs/stories/2026-06-24-epic13-story1-api-catalog-openapi-foundation.md`

## Change Log

- 2026-06-24 — @po (Pax) — Story refinada para criar a fundação documental antes da geração da spec.
- 2026-06-24 — @devops (Gage) — Catálogo `docs/api/README.md` reconciliado com o código real, incluindo `DELETE /functions/v1/auth-session` e definição explícita das fontes canônicas para a futura spec OpenAPI.
- 2026-06-24 — @dev (Dex) — Catálogo atualizado com `GET /api/auth/session`, alinhamento do Route Handler e criação de `docs/api/openapi.yaml` como fundação versionada da spec 3.x.

## QA Results

- 2026-06-24 — Evidência verificada localmente em `app/api/auth/session/route.ts`, `supabase/functions/auth-session/index.ts`, `docs/api/auth-session.md` e `docs/api/edge-functions.md`.
- 2026-06-24 — ACs encerrados porque o inventário, o runtime de cada endpoint, os mecanismos de auth e a fundação documental da spec já existem e foram reconciliados no catálogo canônico.
- 2026-06-24 — `docs/api/openapi.yaml` criado e reconciliado com os handlers atuais do Next (`GET/POST/DELETE /api/auth/session`) e das Edge Functions (`enrollments`, `leads`, `admin-resources`, `auth-session`).
