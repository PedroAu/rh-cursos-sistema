# Story EP-9.0: AppStore Foundation Setup

## Status
Done

## Épica
EP-9 — AppStore Refactoring — Supabase as Single Source of Truth  
Spec: `docs/epics/epic-9-appstore-refactoring.md`

## Contexto

O AppStore **já lê 100% de Supabase** para dados públicos (cursos, turmas, instrutores, blog). Porém, a implementação atual é:
- Fetch inicial apenas (sem real-time listeners)
- Queries não otimizadas para performance
- Falta de subscriptions para data updates

Esta story audita o estado atual e **documenta a estratégia de real-time refactoring** para as 3 stories seguintes. É bloqueante — nenhuma outra pode começar sem seu completion.

## Acceptance Criteria

- [x] **AC1** — Auditoria de `src/lib/mock-data/*`: lista completa de arquivos, estruturas de dados, campos
- [x] **AC2** — Mapeamento mock data → Supabase: tabelas necessárias vs. existentes (verificação de gap)
- [x] **AC3** — Schema Supabase validado: `supabase migration list` mostra todas as migrations, `schema.sql` tem courses/students/instructors/enrollments
- [x] **AC4** — Decisão arquitetural documentada: client-side hooks vs. server actions vs. RLS policies
- [x] **AC5** — Plan executável: 3 stories seguintes com acceptance criteria específicas, dependências, esforço estimado
- [x] **AC6** — Nenhum código de produção alterado nesta story (preparação pura)
- [x] **AC7** — `npm run lint`, `npm run typecheck`, `npm test` continuam verdes

## Scope

### IN SCOPE
- Auditoria de mock data files
- Mapeamento para schema Supabase
- Validação de schema
- Decisão arquitetural (documentada)
- Plano de implementação das próximas stories

### OUT OF SCOPE
- Alteração de código de produção
- Criação de novas tabelas Supabase
- Migração de dados
- Implementação de refactoring

## File List

**Arquivos consultados (leitura):**
- `src/lib/mock-data/*` — estrutura de dados mock
- `src/lib/app-store.ts` — implementação atual
- `supabase/migrations/*` — schema existente
- `.env.local` — config Supabase

**Arquivos criados/modificados:**
- `docs/epics/epic-9-appstore-refactoring.md` — épica documentada
- `docs/stories/appstore-setup-audit.md` — auditoria detalhada (output desta story)
- `docs/stories/appstore-refactoring-plan.md` — plano de implementação

## Dev Notes

- Revisar `src/lib/mock-data/` com `find src/lib/mock-data -type f -name "*.ts"`
- Validar schema com `npx supabase db list-tables` ou via Supabase dashboard
- Documentar qualquer gap entre mock data e Supabase schema
- Definir decisão: vamos usar RLS ou vamos fazer server-side validation?

## Change Log

- 2026-06-22 — Story criada (Draft) — Orion/aiox-master
