# Story: Full CRUD para leads, students e enrollments no admin

## Status
In Progress

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
**I want** criar, editar e excluir leads, students e enrollments no painel administrativo,
**so that** eu consiga administrar a base operacional sem sair do fluxo do dashboard.

## Acceptance Criteria
1. `leads` possuem delete explícito no admin e a exclusão persiste no backend.
2. `students` podem ser criados e excluídos pelo admin, com atualização de estado local e persistência remota.
3. `enrollments` podem ser criados e excluídos pelo admin, com atualização de vagas/contadores coerente.
4. A UI do admin exibe botão de criação para `students` e `enrollments`.
5. O formulário de `enrollments` tem modo de criação e modo de edição/status.
6. A suíte de validação cobre o contrato dos recursos do admin.
7. O fluxo E2E `tests/admin-crud.spec.ts` passa.

## Tasks / Subtasks
- [x] Extender o store/contextos para suportar create/delete de students, delete de leads e create/delete de enrollments.
- [x] Atualizar `admin-resources` para aceitar create/delete no backend.
- [x] Atualizar `AdminResourcePage` e `buildResourceConfig` para os novos fluxos.
- [x] Ajustar validação de formulário para criação administrativa.
- [x] Atualizar testes unitários de contrato.
- [x] Fazer o spec Playwright `tests/admin-crud.spec.ts` passar.
- [x] Consolidar handoff para @devops.

## File List
- `src/lib/app-store.tsx`
- `src/lib/contexts/admin-context.tsx`
- `src/lib/contexts/student-context.tsx`
- `src/lib/contexts/store-types.ts`
- `src/lib/admin-form-validation.ts`
- `src/lib/admin-resource-configs.tsx`
- `src/lib/supabase/rh-cursos-api.ts`
- `src/views/admin/AdminResourcePage.tsx`
- `supabase/functions/_shared/admin-mappers.ts`
- `supabase/functions/_shared/admin-validation.ts`
- `supabase/functions/admin-resources/index.ts`
- `src/__tests__/lib/admin-resource-configs.test.ts`
- `src/__tests__/lib/rh-cursos-api.test.ts`
- `src/__tests__/lib/app-store.test.ts`
- `tests/admin-crud.spec.ts`

## Dev Notes
- Validação final concluída em 2026-07-11 com `npm run test:unit -- src/__tests__/lib/app-store.test.ts src/__tests__/lib/admin-resource-configs.test.ts`, `npm run typecheck`, `npm run build` e `node scripts/run-playwright.mjs tests/admin-crud.spec.ts --project=functional --reporter=line`.
- `npm run lint` permanece verde com warnings preexistentes fora do escopo do CRUD em `docs/design-system/_ds_bundle.js`, `src/views/public/CourseCheckout.tsx` e `src/views/public/CourseDetail.tsx`.
- A Edge Function `admin-resources` foi redeployada no projeto Supabase `hwpsrujkxjhmmwphqdlz` para alinhar o create de inscrições com resolução de turma real e erro explícito quando não houver turma aberta para o curso.

## Change Log
- 2026-07-09 - @dev - Story criada para formalizar o CRUD administrativo de leads, students e enrollments.
- 2026-07-11 - @dev - CRUD de leads/students/enrollments validado ponta a ponta; handoff preparado para @devops.
- 2026-07-14 - @dev - Leitura administrativa de leads passou a filtrar soft-deletes explicitamente, com regressão unitária do contrato de query.
