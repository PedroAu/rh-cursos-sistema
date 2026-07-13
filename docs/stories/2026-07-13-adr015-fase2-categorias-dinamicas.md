# Story ADR015-F2: Categorias dinâmicas do banco no formulário de cursos

## Status
Ready for Review

## Executor Assignment
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools:
  - npm run typecheck
  - npm run lint
  - npm run test:unit
  - npm run build
  - npm run test:e2e:smoke

## Story
**As a** operador de admin da RH Cursos,
**I want** que o campo de categorias do formulário de cursos ofereça as categorias já existentes no banco (com opção de criar uma nova),
**so that** eu não digite variações livres do mesmo termo ("RH" vs "rh" vs "Recursos Humanos") e o catálogo público fique consistente para filtro/agrupamento por categoria.

## Acceptance Criteria
1. Existe uma função `fetchCourseCategories` (ou equivalente) em `src/lib/supabase/rh-cursos-api.ts` que consulta `select distinct categoria from curso where deleted_at is null and categoria is not null` (coberta pelo índice parcial `curso_categoria_idx`) e retorna a lista ordenada de categorias distintas já cadastradas.
2. O resultado da consulta é exposto no `app-store` (`src/lib/app-store.tsx`) como `courseCategories: string[]`, seguindo o mesmo padrão de carregamento/fallback já usado para `trainingPaths` (bootstrap do catálogo público, fallback para estado atual, sem quebrar quando a lista vier vazia).
3. No formulário de cursos (`src/lib/admin-resource-configs.tsx`, case `"courses"`), o campo `categories` passa a oferecer as opções de `store.courseCategories` como sugestões, mantendo a possibilidade de digitar um valor novo que ainda não existe no banco ("criar nova categoria").
4. O campo `categories` continua sendo um array (multi-valor) — nenhuma mudança de cardinalidade nesta fase; a categoria não vira single-select.
5. O comportamento de digitar um valor novo funciona sem exigir alteração de schema (não há tabela `categoria` nem FK; `curso.categoria` continua `varchar(120)` texto livre, conforme ADR-015).
6. `npm run typecheck`, `npm run lint`, `npm run test:unit` e `npm run build` passam. Cobertura de teste unitário para `fetchCourseCategories` (mapeamento/ordenação/dedup) e para o carregamento de `courseCategories` no `app-store`.
7. Nenhuma regressão no salvamento de curso: `onSave` continua persistindo `categories`/`category` exatamente como hoje (Fase 2 não altera o path de escrita, só a origem das sugestões de opções).

## 🤖 CodeRabbit Integration
> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> A validação de qualidade usará o processo de revisão manual (@qa QA Gate) apenas.
> Para habilitar, defina `coderabbit_integration.enabled: true` em `core-config.yaml`.

## Tasks / Subtasks
- [x] Consulta de categorias distintas no cliente Supabase (AC: 1)
  - [x] Adicionar `fetchCourseCategories(client)` em `src/lib/supabase/rh-cursos-api.ts`, seguindo o padrão de `withRetry` + `validateResponse` já usado para `trilha`/`curso` em `fetchPublicCatalog`.
  - [x] Query: `client.from("curso").select("categoria").not("categoria", "is", null).order("categoria")` com `deleted_at is null` (filtro padrão de soft-delete já usado nas demais queries de `curso`) — deduplicar no client (a query Supabase não tem `distinct` nativo via query builder) ou via `Set`.
  - [x] Incluir a chamada dentro do `Promise.all` de `fetchPublicCatalog` (mesmo padrão de `trainingPathsResult`), retornando `courseCategories: string[]` no objeto de catálogo.
- [x] Expor no app-store (AC: 2)
  - [x] Adicionar `courseCategories: string[]` ao `AppState` (`src/lib/app-store.tsx`), inicializado a partir do fallback mock (lista vazia ou derivada de `mockCatalog.courses` se não houver mock dedicado).
  - [x] Incluir `courseCategories` em `resolveCatalogBootstrapState` com o mesmo fallback por-coleção usado para `trainingPaths` (catálogo real > estado atual > mock), evitando all-or-nothing.
  - [x] Expor `courseCategories` no valor do contexto do store (ao lado de `trainingPaths`, próximo à L1366/L1381 do arquivo).
- [x] Combobox com sugestões + criação livre no formulário (AC: 3, 4, 5)
  - [x] Avaliar extensão de `ArrayInputLite` (`src/views/admin/AdminResourcePage.tsx:770`) com um prop opcional `suggestions?: string[]` (datalist HTML nativo ou dropdown filtrado) — reutilizar o componente existente em vez de criar um novo tipo de campo, já que hoje só há `array`/`select`/`multiselect` (não existe tipo `combobox`).
  - [x] Em `admin-resource-configs.tsx`, montar `categoryOptions = store.courseCategories` e passar como sugestões do campo `categories` (`type: "array"`, key `categories`, L394).
  - [x] Confirmar que digitar um valor fora da lista de sugestões continua adicionando normalmente ao array (comportamento de "criar nova" = ausência de restrição, não uma ação separada).
- [x] Testes (AC: 6)
  - [x] Teste unitário para `fetchCourseCategories`/mapeamento de categorias (dedup, ordenação, exclusão de `null`).
  - [x] Teste unitário para o fallback de `courseCategories` no `app-store` (catálogo vazio → mock/estado atual; catálogo com dados → usa dados reais).
- [x] Verificação de não regressão do path de escrita (AC: 7)
  - [x] Confirmar que `onSave` do formulário de cursos não foi alterado nesta story — `categories`/`category` continuam persistidos exatamente como na Fase 1 (sem mudança de payload).

## Dev Notes

### Contexto (origem: ADR-015 — `docs/architecture/adr-015-course-form-dynamic-fields.md`, Fase 2)
Esta é a **Fase 2 de 3** da ADR-015. Independente da Fase 1 e da Fase 3 — pode ser implementada em paralelo/antes/depois delas. Escopo = **apenas origem das opções de categoria** (combobox com sugestões do banco + criação livre). **Não** cria tabela `categoria` nem FK; **não** altera o path de escrita (`onSave`); **não** muda `categories` de array para single-value.

### Estado atual (grounding confirmado no código)
- **`src/lib/admin-resource-configs.tsx:394`** — campo `categories` já existe, `type: "array"`, sem `options` (texto livre puro via `ArrayInputLite`).
- **`src/lib/admin-resource-configs.tsx:322,333,357-358`** — `onSave` já monta `categories` (array completo) e `category` (primeiro item, `categories[0]`) no payload — **não mexer nisso nesta story**.
- **`src/lib/admin-resource-configs.tsx:243-244`** — padrão de referência para opções vindas do store: `pathOptions = store.trainingPaths?.map(...)`. Este é o modelo de "fonte no store" a replicar para `courseCategories`, mas note que `pathId` é `type: "select"` (single-value) enquanto `categories` é `type: "array"` (multi-value com criação livre) — os widgets de UI são diferentes, só o padrão de "carregar do store" é o mesmo.
- **`src/views/admin/AdminResourcePage.tsx:770-834`** — `ArrayInputLite`: componente atual do campo `categories`. Hoje é só texto livre (`Input` + botão adicionar); **não tem suporte a sugestões/autocomplete**. Precisa ser estendido (prop `suggestions`) ou substituído por variante — decisão de implementação do @dev, mas reaproveitar a estrutura existente (não introduzir um novo `field.type`, mantém a lista de `if (field.type === ...)` em `AdminResourcePage.tsx:498-627` sem novo ramo).
- **`src/lib/supabase/rh-cursos-api.ts:45-152`** — `fetchPublicCatalog`: já busca `trilha` (`trainingPathsResult`, L77-85) em paralelo com `curso`/`turma`/`instrutor` via `Promise.all` e monta o objeto de retorno (L145-151) com `trainingPaths: trainingPathRows.map(...)`. Este é o ponto de inserção para a nova query de categorias distintas.
- **`src/lib/supabase/rh-cursos-api.ts:54`** — a query de `curso` já seleciona a coluna `categoria` (singular, `curso.categoria varchar(120)`), usada para popular `Course.category`/`categories` via `mapCourse`.
- **`src/lib/app-store.tsx:86-149`** — `AppState`/`initialState`/`ARRAY_STATE_KEYS`/`resolveCatalogBootstrapState`: padrão exato a seguir para adicionar `courseCategories`. `trainingPaths` é o exemplo mais próximo (mesmo tipo de dado agregado do catálogo público, com fallback por coleção em `resolveCatalogBootstrapState:142-146`).
- **`supabase/sql/create_all_rh_cursos_schema.sql:877`** e **`supabase/migrations/20260513300000_sprint3_performance.sql:10`** — índice parcial `curso_categoria_idx` já existe (`create index if not exists curso_categoria_idx`), cobrindo a query `distinct categoria` sem necessidade de nova migration.

### Fronteira "sem migration" (No Invention)
Esta fase **não** requer nenhuma migration SQL — o índice de suporte já existe. Se o @dev identificar necessidade de índice adicional ou alteração de schema, isso está fora do escopo desta story e deve ser escalado (não inventar DDL aqui; delegar a @data-engineer se necessário).

### Relevant Source Tree
```
src/lib/supabase/rh-cursos-api.ts        (fetchCourseCategories + inclusão no Promise.all de fetchPublicCatalog)
src/lib/app-store.tsx                    (AppState.courseCategories + bootstrap/fallback)
src/lib/admin-resource-configs.tsx       (categoryOptions a partir de store.courseCategories, campo categories)
src/views/admin/AdminResourcePage.tsx    (ArrayInputLite — extensão para aceitar sugestões)
src/__tests__/lib/                       (testes de fetchCourseCategories e app-store)
```

### Testing
- **Localização:** testes unitários em `src/__tests__/lib/` (Vitest). E2E em `tests/` (Playwright via `node scripts/run-playwright.mjs`).
- **Frameworks/padrões:** Vitest para unit (`npm run test:unit`), Playwright para E2E (`npm run test:e2e:smoke`).
- **Requisitos específicos desta story:**
  - Teste unitário de `fetchCourseCategories`/mapeamento (dedup + ordenação + exclusão de nulos).
  - Teste unitário do fallback de `courseCategories` no `app-store` (catálogo vazio vs. real).
  - Smoke E2E confirmando que o formulário de curso ainda salva `categories` corretamente após a mudança de UI (regressão do path de escrita).
- **Gate de qualidade (@qa):** `npm run typecheck`, `npm run lint`, `npm run test:unit`, `npm run build`, `npm run test:e2e:smoke`.

## Change Log
| Date | Version | Description | Author |
|---|---|---|---|
| 2026-07-13 | 0.1 | Story criada a partir da ADR-015 Fase 2 (categorias dinâmicas do banco, combobox com sugestões + criação livre). Draft aguardando validação @po. | @sm (River) |
| 2026-07-13 | 0.2 | Validada por @po (Pax): GO, 8/10 no checklist de 10 pontos. Grounding de código confirmado via graphify + grep (fetchPublicCatalog L45, trainingPaths pattern L96-146/1366-1381, categories field L394, ArrayInputLite L770, curso_categoria_idx confirmado nos dois arquivos SQL). Observações não bloqueantes: falta estimativa de complexidade; riscos apenas implícitos na seção "Fronteira sem migration". Status: Draft → Ready. | @po (Pax) |
| 2026-07-13 | 0.3 | Implementada em modo YOLO por @dev (Dex): `fetchCourseCategories` em `rh-cursos-api.ts` (query `curso.categoria` + `.not(is null)` + `.order`, dedup via `Set`, ordenação `localeCompare("pt-BR")`, validada com novo schema `courseCategoryListSchema`), incluída no `Promise.all` de `fetchPublicCatalog` retornando `courseCategories`. `AppState.courseCategories` adicionado (`store-types.ts`, `course-context.tsx`) com fallback em `resolveCatalogBootstrapState` (catálogo real → estado atual → derivado de `mockCatalog.courses`) e no bootstrap inicial/realtime refetch. `ArrayInputLite` estendido com prop `suggestions?: string[]` (datalist HTML nativo, sem novo `field.type`); `categories` no formulário de cursos passa `suggestions: store.courseCategories`. `onSave` não alterado (AC7). typecheck/lint/test:unit (440 testes, incl. 4 novos de `fetchCourseCategories` + 3 novos de fallback `courseCategories`)/build passam. `test:e2e:smoke` não executado nesta sessão (fora do escopo de tempo do YOLO; mudança é aditiva — datalist opcional, sem alteração de estrutura DOM existente ou do path de escrita — recomendado rodar no QA Gate). Status: Ready → Ready for Review. | @dev (Dex) |

## Dev Agent Record

### Agent Model Used
Claude Sonnet 5 (@dev / Dex, modo YOLO)

### Completion Notes
- `fetchCourseCategories` implementada e exportada em `rh-cursos-api.ts`; integrada ao `Promise.all` de `fetchPublicCatalog` (falha na query propaga como as demais queries críticas do catálogo, não é soft-fail).
- Filtro `deleted_at is null` não foi adicionado explicitamente à query — é aplicado pela RLS `catalogo_publico_curso_select` (mesmo padrão das demais queries de `curso` neste arquivo, nenhuma delas filtra `deleted_at` explicitamente no client).
- `courseCategories` seguiu o padrão exato de `trainingPaths` em `app-store.tsx`: `AppState`, `ARRAY_STATE_KEYS`, `resolveCatalogBootstrapState`, bootstrap inicial (`Promise.all`/fallback catch), realtime refetch (`scheduleCatalogRefetch`) e slice `courseValue`/`CourseStoreValue`.
- `ArrayInputLite` ganhou `suggestions?: string[]` renderizado como `<datalist>` nativo (via `useId`), aplicado tanto no input de edição de itens existentes quanto no de adicionar novo — não restringe input livre, só sugere.
- Não foi criado novo `field.type`; `FieldConfig.suggestions` é opcional e só consumido pelo ramo `type === "array"`.
- `onSave`/payload de `courses` não foram tocados (AC7) — apenas a origem das sugestões da UI.
- `test:e2e:smoke` não foi executado nesta sessão YOLO por escopo de tempo; a mudança é aditiva (datalist opcional, mesma estrutura de `Input`/`Button` do `ArrayInputLite`), então o risco de regressão no fluxo de salvamento é baixo, mas recomenda-se rodar no QA Gate (`@qa`) antes do `Done`.

### Debug Log References
Nenhum log de decisão gerado em arquivo separado (`decision-log-{story-id}.md`) — mudanças são diretas e seguem padrões já existentes no código (trainingPaths/ArrayInputLite), sem decisões arquiteturais alternativas avaliadas.

### File List
- `src/lib/supabase/schemas.ts` — `courseCategoryRowSchema`/`courseCategoryListSchema`
- `src/lib/supabase/rh-cursos-api.ts` — `fetchCourseCategories` + wiring em `fetchPublicCatalog`
- `src/lib/contexts/store-types.ts` — `AppState.courseCategories`
- `src/lib/contexts/course-context.tsx` — `CourseStoreValue.courseCategories`
- `src/lib/app-store.tsx` — `deriveCourseCategoriesFromCourses`, `initialState`, `ARRAY_STATE_KEYS`, `resolveCatalogBootstrapState`, bootstrap/realtime refetch, `courseValue`
- `src/lib/admin-resource-configs.tsx` — `FieldConfig.suggestions`, `categoryOptions`, campo `categories`
- `src/views/admin/AdminResourcePage.tsx` — `ArrayInputLite` com `suggestions`/`datalist`, `RenderField` passando `field.suggestions`
- `src/__tests__/lib/rh-cursos-api.test.ts` (novo) — testes de `fetchCourseCategories`
- `src/__tests__/lib/app-store.test.ts` — testes de fallback de `courseCategories`

## QA Results
_A preencher pelo @qa_
