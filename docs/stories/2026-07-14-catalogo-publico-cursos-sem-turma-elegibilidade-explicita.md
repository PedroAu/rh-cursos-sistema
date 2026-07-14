# Story: Catálogo público deve listar curso elegível mesmo sem turma aberta

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
  - npm run test:e2e:smoke

## Story
**As a** operador do catálogo da RH Cursos,
**I want** cursos elegíveis aparecerem no catálogo público mesmo sem turma aberta, com regra de elegibilidade explícita,
**so that** um curso recém-cadastrado não suma silenciosamente da experiência pública por depender de conhecimento implícito do modelo turma-driven.

## 🤖 CodeRabbit Integration
> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> A validação de qualidade usará revisão manual e os quality gates declarados nesta story.

## Acceptance Criteria
1. A página pública de cursos em `src/views/public/Courses.tsx` deixa de depender exclusivamente de `classes` para montar o catálogo e passa a listar cursos com `status` elegível mesmo quando ainda não houver turma aberta.
2. A regra de elegibilidade fica objetiva e documentada no código e na story:
   - aparecem no catálogo: `Ativo`, `Destaque`, `Em breve`
   - não aparecem no catálogo: `Inativo`, `Rascunho`, `Arquivado`
3. Cursos elegíveis sem turma aberta aparecem no catálogo com estado explícito `Sem turma aberta` e CTA para ver detalhes/manifestar interesse, sem fingir disponibilidade imediata.
4. A agenda pública em `src/views/public/Agenda.tsx` continua turma-driven; cursos sem turma aberta não entram na agenda.
5. O admin passa a exibir feedback operacional explícito sobre a regra de publicação do status do curso, deixando claro quais status publicam no catálogo e quais não publicam.
6. O detail público do curso continua acessível por `slug` para cursos elegíveis, com compatibilidade preservada para `course_public_content`.
7. Testes cobrem: curso elegível sem turma aberta aparecendo no catálogo, curso não elegível ficando fora do catálogo, e agenda permanecendo restrita a turmas.

## Tasks / Subtasks
- [x] Ajustar o contrato do catálogo público (AC: 1, 2, 3)
  - [x] Revisar `src/views/public/Courses.tsx`, hoje derivado de turmas.
  - [x] Definir o estado visual/CTA para `Sem turma aberta`.
- [x] Preservar a agenda turma-driven (AC: 4)
  - [x] Validar que `src/views/public/Agenda.tsx` não muda de modelo.
- [x] Tornar a regra explícita no admin (AC: 5)
  - [x] Adicionar hint/copy operacional coerente sobre o campo `status`.
- [x] Validar resolução do detail e conteúdo público (AC: 6)
  - [x] Revisar `src/views/public/CourseDetail.tsx`.
  - [x] Confirmar compatibilidade com `course_public_content`.
- [x] Cobrir com testes (AC: 7)
  - [x] Testes unitários/integration de catálogo.
  - [x] Smoke E2E do cenário sem turma aberta.

## Dev Notes

### Contexto observado
- `src/views/public/Courses.tsx` hoje monta o catálogo exclusivamente a partir de `classes`, não de `courses`. Isso explica o relato de curso cadastrado no banco que não aparece na página pública.
- `src/views/public/Agenda.tsx` é orientada por turma e deve permanecer assim; esse comportamento não é bug.
- O campo `status` do curso já existe no admin, mas a regra de impacto público desse status não está suficientemente explícita para o operador.
- A story fecha a decisão de produto que estava implícita: curso elegível pode existir no catálogo sem turma aberta, mas deve aparecer com estado honesto e sem parecer “inscrição aberta”.

### Referências relevantes
```
src/views/public/Courses.tsx
src/views/public/Agenda.tsx
src/views/public/CourseDetail.tsx
src/lib/admin-resource-configs.tsx
src/lib/admin-form-validation.ts
supabase/functions/_shared/admin-validation.ts
supabase/migrations/20260710000000_course_public_content.sql
```

### Testing
- `npm run typecheck`
- `npm run lint`
- `npm run test:unit`
- `npm run build`
- `npm run test:e2e:smoke`

## Change Log
| Date | Version | Description | Author |
|---|---|---|---|
| 2026-07-14 | 0.1 | Story criada no refinamento @sm para desdobrar do draft anterior o problema específico de publicação pública do catálogo, com regra objetiva de elegibilidade e feedback operacional explícito no admin. | @sm (River) |
| 2026-07-14 | 0.2 | Smoke E2E adicionado em `tests/public-journeys.spec.ts` para validar curso elegível sem turma no catálogo e ausência na agenda; cenário validado com `npx playwright test tests/public-journeys.spec.ts -g "catalogo publica curso elegivel sem turma" --project=functional --reporter=line`. | @dev (Dex) |
| 2026-07-14 | 0.3 | Regressão unitária do catálogo PASS, smoke real isolado 1/1 PASS, typecheck e lint PASS. A montagem dos cards agora parte dos cursos elegíveis e usa a turma aberta mais próxima apenas quando disponível. | @dev (Dex) |

## File List

- `src/views/public/Courses.tsx`
- `src/__tests__/views/public/courses.test.tsx`
- `tests/public-journeys.spec.ts`
- `docs/stories/2026-07-14-catalogo-publico-cursos-sem-turma-elegibilidade-explicita.md`
