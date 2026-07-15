# Story ADR015-F3: Persistência de múltiplas categorias por curso

## Status
Draft

## Executor Assignment
executor: "@dev"
quality_gate: "@architect"
data_owner: "@data-engineer"
quality_gate_tools:
  - npm run typecheck
  - npm run lint
  - npm run test:unit
  - npm run build
  - npm run test:e2e:smoke

## Story
**As a** operador do admin da RH Cursos,
**I want** que um curso possa ter e persistir **várias** categorias, não só a primeira,
**so that** o catálogo reflita todas as categorias que cadastrei, sem perder as demais no round-trip de salvamento.

## 🤖 CodeRabbit Integration
> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> A validação de qualidade usará revisão manual (@architect quality gate) e os quality gates declarados nesta story.

## Contexto e escopo
Esta é a **Fase 3 da ADR-015** e o complemento natural da Fase 2 (categorias dinâmicas). A F2 travou explicitamente a cardinalidade em array-somente-na-UI, persistindo apenas `categories[0]` em `curso.categoria` (`varchar(120)`), **sem migration** (ver AC4/AC5 e "Fronteira sem migration" da story F2). Esta fase remove essa limitação: passa a persistir o array completo, o que **exige migration** e envolve o **@data-engineer** (Article: Schema design → @data-engineer).

**Fora de escopo:** UI de sugestões (entregue na F2); a UI de multi-input já existe (`type: "array"`).

## Acceptance Criteria
1. **Migration (@data-engineer):** nova coluna `categorias jsonb` (ou `text[]`) em `public.curso`, mantendo `curso.categoria` populada com `categorias[0]` para compatibilidade e para o índice parcial `curso_categoria_idx` existente. Backfill de `categorias` a partir da `categoria` atual para linhas existentes.
2. **Mapper de leitura** (`src/lib/supabase/mappers.ts:320`): `categories` passa a ser lido de `row.categorias` (com fallback `[row.categoria]` quando `categorias` for nulo/legado). `category` continua sendo `categories[0]` para compat.
3. **Edge function de escrita** (`supabase/functions/_shared/admin-mappers.ts:126`): passa a persistir `categorias` (array completo) além de `categoria: p.categories?.[0]`. O payload do admin já envia `categories` (array) — confirmar o mapeamento de ida.
4. **Round-trip fiel:** cadastrar um curso com N categorias no admin, salvar e recarregar preserva as N categorias (não só a primeira). Coberto por teste.
5. **Sem regressão de UI:** o formulário de curso não muda visualmente (já é `type: "array"` com sugestões da F2); apenas o path de persistência passa a preservar o array.
6. **Qualidade:** `npm run typecheck`, `npm run lint`, `npm run test:unit`, `npm run build` passam; `npm run test:e2e:smoke` executado ou risco aceito no gate. RLS/policies da tabela `curso` revisadas para a nova coluna (sem exposição indevida).

## Tasks / Subtasks
- [ ] Migration (@data-engineer) (AC: 1)
  - [ ] Adicionar coluna `categorias` em `public.curso` + backfill a partir de `categoria`.
  - [ ] Manter `categoria = categorias[0]` (trigger/aplicação) e o índice `curso_categoria_idx`.
  - [ ] Revisar RLS/policies para a nova coluna.
- [ ] Mapper de leitura (AC: 2)
  - [ ] `mapCourse` lê `categorias` com fallback `[categoria]`.
- [ ] Edge de escrita (AC: 3)
  - [ ] `admin-mappers.ts` persiste `categorias` + `categoria`.
- [ ] Testes (AC: 4, 5, 6)
  - [ ] Round-trip multi-categoria (persistência + releitura).
  - [ ] Não regressão do form (path de escrita continua enviando array).

## Dev Notes

### Grounding no código/schema
- **`supabase/migrations/20260512193000_initial_rh_cursos_schema.sql:130`** — `categoria varchar(120)` (única).
- **`supabase/migrations/20260513300000_sprint3_performance.sql:10-12`** — índice parcial `curso_categoria_idx on curso(categoria)`; manter válido após a migration.
- **`src/lib/supabase/mappers.ts:320`** — hoje `categories: row.categoria ? [row.categoria] : []` (perde as demais na leitura).
- **`supabase/functions/_shared/admin-mappers.ts:126`** — hoje `categoria: p.category ?? p.categories?.[0]` (persiste só a primeira).
- **`src/lib/admin-resource-configs.tsx:326,339,374`** — form já monta `categories` (array) e `category = categories[0]`; nenhuma mudança de UI necessária aqui.

### Fronteira (Article Schema design → @data-engineer)
- A DDL é de responsabilidade do @data-engineer; @dev integra mapper/edge/testes. Não inventar DDL fora desta story.

### Relevant Source Tree
```
supabase/migrations/ (nova migration — @data-engineer)
src/lib/supabase/mappers.ts
supabase/functions/_shared/admin-mappers.ts
src/lib/admin-resource-configs.tsx (confirmar payload de ida)
src/__tests__/ (round-trip multi-categoria)
```

### Testing
- Unit (Vitest) + E2E smoke. Gate (@architect): typecheck, lint, test:unit, build, test:e2e:smoke.

## Change Log
| Date | Version | Description | Author |
|---|---|---|---|
| 2026-07-14 | 0.1 | Story criada como ADR-015 Fase 3 (persistência multi-categoria), separada da F2 por exigir migration e envolver @data-engineer. Decisão de produto ③ travada: curso passa a persistir várias categorias. Draft aguardando validação @po. | @architect (Aria) |
