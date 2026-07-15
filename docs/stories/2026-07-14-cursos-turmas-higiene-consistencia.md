# Story: Higiene e consistência de cursos/turmas (código morto e campos órfãos)

## Status
In Progress (parcial — AC3/AC4 concluídos; AC1/AC2 bloqueados por decisão @po)

## Executor Assignment
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools:
  - npm run typecheck
  - npm run lint
  - npm run test:unit
  - npm run build

## Story
**As a** desenvolvedor mantendo o domínio de cursos/turmas,
**I want** eliminar campos capturados-mas-descartados, código morto e pareamentos frágeis,
**so that** o modelo de dados do formulário, da persistência e da página fique coerente e sem armadilhas de manutenção.

## 🤖 CodeRabbit Integration
> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> A validação de qualidade usará revisão manual (@architect quality gate) e os quality gates declarados nesta story.

## Acceptance Criteria
1. **`featured`/`featuredCourseIds`:** hoje o form captura ambos mas `mapCourse` devolve sempre `featuredCourseIds: []` (`src/lib/supabase/mappers.ts:330`), descartando o cadastro. Decidir por persistir de verdade **ou** remover os campos do form — a story implementa a decisão de forma que não sobre campo órfão (capturado e ignorado).
2. **`price`/`notes` de turma:** existem em `TrainingClass` (`src/types/index.ts:150-151`) mas não têm campo no form de turma e a página usa sempre `course.price`. Decidir por expor no form e usar na página **ou** remover do tipo — sem deixar campo do tipo sem origem/uso.
3. **Código morto de modalidade:** o ramo `"Ao vivo online"` de `formatModalityLabel` (`src/views/public/CourseDetail.tsx:58-61`) retorna a mesma string nos dois lados do ternário; simplificar.
4. **Pareamento de highlights:** `buildHighlightCards` (`CourseDetail.tsx:172-183`) pareia `benefits[i]` com `objectives[i]` por índice, desalinhando quando as listas têm tamanhos diferentes; corrigir para um pareamento que não produza descrições trocadas.
5. **Qualidade:** `npm run typecheck`, `npm run lint`, `npm run test:unit` e `npm run build` passam.

## Tasks / Subtasks
- [ ] Resolver `featured`/`featuredCourseIds` (AC: 1) — persistir ou remover. **Bloqueado: decisão @po pendente (mesma natureza de D1 da Épica 17).**
- [ ] Resolver `price`/`notes` de turma (AC: 2) — expor+usar ou remover do tipo. **Parcial:** `price` já foi exposto no form de turmas e passou a ser usado em `Courses.tsx`/`Agenda.tsx` como efeito colateral da Story 17.3 (Épica 17). `notes` continua órfão — decisão @po pendente.
- [x] Simplificar `formatModalityLabel` (AC: 3).
- [x] Corrigir `buildHighlightCards` (AC: 4).
- [x] Garantir gates verdes (AC: 5) — `lint`, `typecheck`, `test:unit` (574/574) e `build` passam.

## Dev Notes
- Itens de baixa urgência (Sprint 2, pós go-live). Cada AC 1 e 2 embute uma micro-decisão de produto (persistir vs. remover) que deve ser confirmada com @po antes da implementação, para não inventar comportamento.
- Depende conceitualmente das stories de divergências e ADR-015 F3 apenas para evitar conflito de merge nos mesmos arquivos (`mappers.ts`, `admin-resource-configs.tsx`, `CourseDetail.tsx`); executar por último.

### Relevant Source Tree
```
src/lib/supabase/mappers.ts
src/types/index.ts
src/lib/admin-resource-configs.tsx
src/views/public/CourseDetail.tsx
```

### Testing
- Unit (Vitest): `npm run test:unit`. Gate (@architect): typecheck, lint, test:unit, build.

## Change Log
| Date | Version | Description | Author |
|---|---|---|---|
| 2026-07-14 | 0.1 | Story de higiene criada a partir da análise de divergências (P2): campos órfãos `featured`/`featuredCourseIds` e `price`/`notes`, código morto de modalidade e pareamento frágil de highlights. Draft aguardando validação @po. | @architect (Aria) |
| 2026-07-15 | 0.2 | Implementação parcial (commit `231541e`): AC3 (dead code de modalidade) e AC4 (pareamento frágil benefits×objectives) corrigidos com teste de regressão explícito (fixture com 3 benefits/2 objectives). AC1 e AC2 permanecem bloqueados — ambos exigem micro-decisão de produto (persistir vs. remover campo) que a própria story reserva para @po, para não inventar comportamento (Constitution Art. IV). AC2 parcialmente resolvido de forma incidental pela Story 17.3 da Épica 17 (preço de turma). Status: Draft → In Progress (parcial). | @dev (sessão de fechamento) |
