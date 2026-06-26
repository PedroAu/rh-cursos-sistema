# Story EP-13.2: Spec OpenAPI completa com exemplos, auth e rate limits

## Status
Done

## Executor Assignment

executor: "@dev"  
quality_gate: "@architect"  
quality_gate_tools:
- docs/spec review
- schema validation
- `npm run lint`

## Épica
EP-13 — API Documentation  
Spec: `docs/epics/epic-13-api-documentation.md`

## Story

**As a** consumidora da API,  
**I want** uma spec OpenAPI versionada e completa,  
**so that** eu consiga entender contratos, erros e autenticação sem inferir comportamento do código.

## Contexto

A documentação manual atual já traz payloads e respostas, mas ainda não existe artefato OpenAPI 3.x versionado cobrindo a superfície real do produto.

## Acceptance Criteria

- [x] **AC1** — Spec OpenAPI 3.x é gerada e versionada no repositório
- [x] **AC2** — Todos os endpoints atuais aparecem na spec
- [x] **AC3** — Exemplos de request/response e códigos de erro estão presentes
- [x] **AC4** — Métodos de autenticação e rate limits estão modelados na spec
- [x] **AC5** — A spec passa em validação de schema

## Scope

### In Scope
- OpenAPI 3.x
- Paths, schemas, examples
- Auth e rate limits

### Out of Scope
- UI navegável
- Geração de SDK

## Tasks / Subtasks

- [x] Criar a spec base
- [x] Modelar Next Route Handler e Edge Functions
- [x] Adicionar exemplos e erros
- [x] Validar a spec

## Dependencies

- Story EP-13.1
- `docs/api/README.md`
- `docs/api/auth-session.md`
- `docs/api/edge-functions.md`

## Testing

- validador OpenAPI
- revisão cruzada com `docs/api/*`

## File List

- `docs/api/` (novos arquivos de spec)
- `docs/api/README.md`
- `docs/api/openapi.yaml`
- `docs/stories/2026-06-24-epic13-story2-openapi-contract-completion.md`

## Change Log

- 2026-06-24 — @po (Pax) — Story refinada para materializar D-4.2 em contrato OpenAPI verificável.
- 2026-06-24 — @dev (Dex) — `docs/api/openapi.yaml` criada em OpenAPI 3.1 com todos os endpoints atuais, exemplos, autenticação e rate limits reconciliados com o código.

## QA Results

- 2026-06-24 — Spec `docs/api/openapi.yaml` reconciliada com `app/api/auth/session/route.ts` e `supabase/functions/*/index.ts`.
- 2026-06-24 — Validação estrutural executada localmente com parser YAML em Node e checagem dos paths obrigatórios da superfície HTTP atual.
- 2026-06-24 — `npx --yes @redocly/cli lint docs/api/openapi.yaml` executado com sucesso; lint válido com 2 warnings não bloqueantes (licença estrita e ausência de `4XX` em `DELETE /api/auth/session`, compatível com o comportamento real do handler).
