# Story EP-13.3: Swagger UI/ReDoc e gate anti-drift

## Status
Ready for Review

> Validação PO concluída em 2026-06-25: **GO (9/10)**. A entrega foi
> concretizada como ReDoc estático gerado pela Redocly CLI, alinhada ao
> tooling já usado na EP-13.2, com gate mínimo de inventário e lint.

## Executor Assignment

executor: "@devops"  
quality_gate: "@architect"  
quality_gate_tools:
- `npm run lint`
- docs/smoke validation
- manual UI check

## Épica
EP-13 — API Documentation  
Spec: `docs/epics/epic-13-api-documentation.md`

## Story

**As a** desenvolvedora integrando com a plataforma,  
**I want** uma UI navegável de documentação e um gate mínimo contra drift,  
**so that** o contrato publicado continue utilizável ao longo do tempo.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: N/A por configuração do projeto
>
> `.aiox-core/core-config.yaml` não define `coderabbit_integration.enabled`.
> Aplicam-se revisão manual e os quality gates declarados nesta story.

## Contexto

Mesmo com a spec pronta, a épica só fecha quando a documentação é navegável e o time tem um mecanismo mínimo para perceber divergência entre código e contrato.

### Decisão de refinamento

Usar ReDoc estático gerado a partir de `docs/api/openapi.yaml` pela Redocly
CLI. Essa opção está dentro do escopo aprovado ("Swagger UI ou ReDoc"),
reaproveita o validador usado na EP-13.2 e evita adicionar runtime de
documentação ao app.

## Acceptance Criteria

- [x] **AC1** — Swagger UI ou ReDoc roda a partir da spec versionada
- [x] **AC2** — O README/docs apontam para a UI de documentação
- [x] **AC3** — Existe validação mínima para detectar drift óbvio entre código e spec
- [x] **AC4** — A estratégia de manutenção da doc fica registrada

## Scope

### In Scope
- Swagger UI/ReDoc
- Links a partir do README/docs
- Gate mínimo anti-drift

### Out of Scope
- Portal externo completo
- SDK client

## Tasks / Subtasks

- [x] Criar comandos reproduzíveis para validar e gerar a documentação (AC: 1, 3)
  - [x] Adicionar `docs:api:lint` para executar Redocly lint sobre `docs/api/openapi.yaml`.
  - [x] Adicionar `docs:api:build` para gerar HTML estático em `public/api-docs.html`.
  - [x] Fixar a dependência/versão usada no projeto ou documentar explicitamente a estratégia de execução reproduzível.
- [x] Publicar a UI ReDoc estática (AC: 1)
  - [x] Gerar `public/api-docs.html` exclusivamente a partir da spec versionada.
  - [x] Confirmar carregamento local e compatibilidade com o deploy Cloudflare Workers.
- [x] Referenciar a UI navegável (AC: 2)
  - [x] Adicionar link em `README.md`.
  - [x] Adicionar link e comando de regeneração em `docs/api/README.md`.
- [x] Implementar gate mínimo anti-drift (AC: 3)
  - [x] Validar sintaxe/schema OpenAPI com Redocly.
  - [x] Comparar a superfície de `app/api/**/route.ts` e `supabase/functions/*/index.ts` com os paths da spec.
  - [x] Detectar ao menos método/path adicionado ou removido; equivalência semântica completa fica fora do escopo.
  - [x] Integrar o gate ao fluxo local e ao CI.
- [x] Registrar a estratégia de manutenção e executar smoke (AC: 4)
  - [x] Documentar: alterar código e spec na mesma mudança, regenerar UI e executar o gate.
  - [x] Validar resposta 200 e conteúdo básico da página gerada.
  - [x] Atualizar Dev Agent Record e File List.

## Dependencies

- Story EP-13.2
- `README.md`
- `docs/api/README.md`
- `docs/api/openapi.yaml`
- `app/api/`
- `supabase/functions/`
- `.github/workflows/ci.yml`

## Dev Notes

- A spec atual é OpenAPI 3.1 e já passou por
  `npx --yes @redocly/cli lint docs/api/openapi.yaml`.
- A Redocly CLI suporta lint e geração de HTML standalone com `build-docs`.
- Comando-base esperado para a implementação:
  `npx @redocly/cli build-docs docs/api/openapi.yaml -o public/api-docs.html`.
- O gate anti-drift deve ser CLI-first e executável sem abrir a UI.
- A UI é artefato observado/publicado; a fonte de verdade continua sendo
  `docs/api/openapi.yaml`.
- Não adicionar portal externo, SDK, autenticação nova ou editor interativo.
- O smoke pode ser uma verificação Playwright/request da rota estática gerada
  ou um check equivalente no build, desde que falhe quando o artefato não
  carregar.

## Testing

- `npm run docs:api:lint`
- `npm run docs:api:build`
- comando do gate anti-drift definido pela implementação
- smoke da UI gerada
- Quality gates:
  - `npm run lint`
  - `npm run typecheck`
  - `npm test`

## File List

- `README.md`
- `docs/api/README.md`
- `docs/api/openapi.yaml`
- `public/api-docs.html`
- `scripts/build-api-docs.mjs`
- `scripts/check-openapi-drift.mjs`
- `scripts/lint-openapi.mjs`
- `tests/api-docs.spec.ts`
- `package.json`
- `.github/workflows/ci.yml`
- `docs/stories/2026-06-24-epic13-story3-swagger-ui-drift-gate.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm run docs:api:lint` — passed
- `npm run docs:api:build` — passed
- `npm run docs:api:check-drift` — passed
- `npm run lint` — passed
- `npm run typecheck` — passed
- `npm run test:unit` — passed
- `npm test` — passed

### Completion Notes List

- Added reproducible API docs commands for lint, build, and drift detection.
- Published `public/api-docs.html` from the versioned OpenAPI spec and covered it with Playwright smoke.
- Reconciled the drift gate with the real code surface, including `/api/enrollments` and the actual Edge Function method detection.
- Linked the generated API docs and maintenance workflow from the main README and API docs catalog.

## Validação PO

### Resultado

- **Decisão:** GO
- **Implementation Readiness Score:** 9/10
- **Confiança:** Alta

### Evidências e ressalvas

- Executor `@devops` é coerente com publicação estática e integração ao CI;
  o quality gate `@architect` é distinto.
- A escolha ReDoc deriva do escopo da épica e do uso já comprovado da
  Redocly CLI na EP-13.2.
- O gate mínimo cobre inventário método/path e lint estrutural, sem prometer
  detecção semântica completa.
- A geração da UI não substitui a atualização da spec; a spec permanece fonte
  canônica.

## Change Log

- 2026-06-24 — @po (Pax) — Story refinada para fechar o último AC de D-4.2: documentação navegável e governada.
- 2026-06-25 — @po (Pax) — Validação GO 9/10; selecionado ReDoc estático, definidos comandos, gate anti-drift, smoke e File List.
- 2026-06-26 — @dev (Codex/Orion) — Gate anti-drift corrigido, spec reconciliada com `/api/enrollments`, smoke Playwright ajustado e quality gates verdes; status promovido para `Ready for Review`.
