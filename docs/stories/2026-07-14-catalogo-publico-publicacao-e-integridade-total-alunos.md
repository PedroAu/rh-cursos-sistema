# Story: Integridade de `total_alunos` no save administrativo de curso

## Status
Done

## Executor Assignment
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools:
  - npm run typecheck
  - npm run lint
  - npm run test:unit
  - npm run build

## Story
**As a** operador do admin da RH Cursos,
**I want** editar cursos sem corromper o contador agregado `total_alunos`,
**so that** o cadastro administrativo não sobrescreva métricas derivadas que pertencem ao fluxo de inscrições.

## 🤖 CodeRabbit Integration
> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> A validação de qualidade usará revisão manual e os quality gates declarados nesta story.

## Acceptance Criteria
1. O fluxo de cadastro/edição de curso não sobrescreve `curso.total_alunos` com `0` quando o formulário administrativo não envia `studentsCount`; ausência do campo no payload deixa o valor persistido intacto.
2. O contrato de escrita admin em `supabase/functions/_shared/admin-mappers.ts` e qualquer espelho local equivalente deixa explícito que `total_alunos` é métrica agregada do curso, derivada de inscrições, e não campo de edição manual do formulário de curso.
3. O formulário/admin de curso não passa a expor input manual para `studentsCount`/`total_alunos` como forma de resolver o bug.
4. O detail público do curso continua resolvendo corretamente `studentsCount` a partir do dado persistido, sem regressão visual ou de social proof.
5. Testes cobrem o save admin sem `studentsCount`, garantindo preservação do valor existente e ausência de overwrite silencioso.

## Tasks / Subtasks
- [x] Corrigir a escrita admin para não corromper `total_alunos` (AC: 1, 2, 3)
  - [x] Revisar `supabase/functions/_shared/admin-mappers.ts`.
  - [x] Revisar o caminho local/store se houver overwrite análogo.
- [x] Validar integridade do detail e consumo público do contador (AC: 4)
  - [x] Revisar `src/views/public/CourseDetail.tsx`.
- [x] Cobrir com testes (AC: 5)
  - [x] Testes unitários de mappers/save admin.
  - [x] Teste de regressão do detail consumindo `studentsCount` preservado.

## Dev Notes

### Contexto observado
- `supabase/functions/_shared/admin-mappers.ts` hoje envia `total_alunos: p.studentsCount ?? 0`, então um save administrativo de curso tende a zerar o contador se o payload não trouxer esse valor.
- O tipo `Course` ainda usa `studentsCount` em pontos públicos, especialmente no detail do curso.
- O schema do banco já trata `total_alunos` como contador do curso com trigger de sincronização por inscrição; isso confirma que o campo não deve ser entrada manual do form de curso.
- O problema de publicação pública do catálogo foi removido deste draft e desdobrado em story própria para reduzir blast radius e manter rastreabilidade.

### Referências relevantes
```
src/views/public/Courses.tsx
src/views/public/CourseDetail.tsx
supabase/functions/_shared/admin-mappers.ts
supabase/sql/create_all_rh_cursos_schema.sql
supabase/migrations/20260513300000_sprint3_performance.sql
supabase/migrations/20260711000001_inscricao_delete_counters.sql
```

### Testing
- `npm run typecheck`
- `npm run lint`
- `npm run test:unit`
- `npm run build`

## Change Log
| Date | Version | Description | Author |
|---|---|---|---|
| 2026-07-14 | 0.1 | Story criada a partir dos bugs de curso não publicado no catálogo público e da necessidade de preservar `total_alunos` como métrica agregada, não campo manual. | @sm (River) |
| 2026-07-14 | 0.2 | Validação @po: NO-GO. O draft está bem grounded no mapper admin e no catálogo público turma-driven, mas ainda mistura dois problemas relevantes em um único incremento (integridade de `total_alunos` + modelo de publicação pública do catálogo), além de faltar a seção `🤖 CodeRabbit Integration` e manter `quality_gate: @qa` fora da matriz dinâmica do template para stories de código. Também falta tornar objetiva a regra de elegibilidade/feedback do AC5 para evitar interpretação na implementação. | @po (Pax) |
| 2026-07-14 | 0.3 | Refinamento @sm pós-NO-GO: story reduzida para um único incremento focado em integridade de `total_alunos`, seção `🤖 CodeRabbit Integration` adicionada, `quality_gate` alinhado para `@architect` e todo o escopo de publicação pública do catálogo desdobrado em story separada. | @sm (River) |
| 2026-07-14 | 0.4 | Revalidação @po: GO. Draft agora está reduzido a um único contrato de integridade, com ACs objetivos, bom grounding técnico e blast radius controlado. Status: Draft → Ready. | @po (Pax) |
| 2026-07-14 | 0.5 | Revalidação técnica concluída com `src/__tests__/lib/admin-mappers.test.ts`, `src/__tests__/views/public/course-detail.test.tsx` e `npm run typecheck`, confirmando preservação de `total_alunos` e consumo público sem regressão. | @dev (Dex) |
| 2026-07-14 | 0.6 | Escrita endurecida para omitir `total_alunos` do save administrativo comum, eliminando também a janela de corrida de uma estratégia read-before-write. Testes cobrem omissão, caller explícito e consumo público. | @dev (Dex) |

## File List

- `supabase/functions/_shared/admin-mappers.ts`
- `src/__tests__/lib/admin-mappers.test.ts`
- `src/__tests__/views/public/course-detail.test.tsx`
- `docs/stories/2026-07-14-catalogo-publico-publicacao-e-integridade-total-alunos.md`
