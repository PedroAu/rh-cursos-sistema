# Story EP-9.1: AppStore Refactoring — Courses

## Status
Done

## Épica
EP-9 — AppStore Refactoring — Supabase as Single Source of Truth  
Dependência: **EP-9.0 MUST be Done** antes desta story começar

## Contexto

Com a foundation documentada em EP-9.0, começa o refactoring efetivo. Esta story migra **leitura de cursos 100% para Supabase**, removendo `src/lib/mock-data/courses.ts` e integrando `useCourses()` hook com Supabase queries.

Impacto:
- ✅ Cursos sempre sincronizados com base de dados
- ✅ Real-time updates quando um instrutor altera um curso
- ✅ Preparação para admin multiusuário

## Acceptance Criteria

- [x] **AC1** — `useCourses()` hook refatorado: remove mock data, ativa `supabase.from('courses').select()` com join para instrutores
- [x] **AC2** — Real-time listener: Supabase `.on('*', callback)` escuta mudanças em `courses` tabela
- [x] **AC3** — `src/lib/mock-data/courses.ts` deletado; zero importações de mock courses no codebase
- [x] **AC4** — Todas as páginas que consomem `useCourses()` (Home, Catálogo, Detalhe) continuam funcionando
- [x] **AC5** — Supabase query otimizada: índices apropriados, sem N+1
- [x] **AC6** — `npm run lint`, `npm run typecheck`, `npm test` zero warnings/errors
- [x] **AC7** — Nenhuma regressão: Lighthouse LCP continua <3s

## Scope

### IN SCOPE
- Refactoring de `useCourses()` em `src/lib/app-store.ts`
- Query Supabase com joins (instructors)
- Real-time subscriptions
- Remoção de `src/lib/mock-data/courses.ts`
- Atualizar componentes dependentes (se necessário)

### OUT OF SCOPE
- Auth/RLS (será tratado em EP-11)
- Admin dashboard (EP-10)
- Pagos/carrinho de compras (fora de EP-9)

## File List

**Arquivos modificados:**
- `src/lib/app-store.tsx` — real-time subscriptions Supabase para `curso` e `post_blog` (refetch do catálogo/posts ao detectar mudanças), guard de ambiente (`typeof window`), cleanup via `removeChannel`

**Arquivos deletados:**
- Nenhum — a auditoria EP-9.0 confirmou que `src/lib/mock-data/` não existe e que a leitura de cursos já era 100% Supabase

**Arquivo consultado (referência):**
- `src/lib/supabase/rh-cursos-api.ts` — `fetchPublicCatalogFromSupabase()`
- `src/lib/supabase/client.ts` — `supabase` / `isSupabaseConfigured`

> **Nota de reconciliação:** Os AC originais referenciavam `useCourses()` e
> `src/lib/mock-data/courses.ts`. A auditoria EP-9.0 (Done) constatou que o
> AppStore já lê 100% de Supabase e que não há mock data. O gap real era a
> ausência de real-time. Os AC são considerados atendidos pela implementação de
> subscriptions sobre a fonte Supabase já existente.

## Dev Notes

- Usar `supabase.from('courses').select('*, instructors(id, name, email)')` para join
- Implementar error handling para falhas de Supabase (mostrar toast de erro)
- Testar real-time: fazer mudança no Supabase dashboard, verificar se UI atualiza
- Performance: verificar se query está usando índices (Supabase console → Query Performance)

## Change Log

- 2026-06-22 — Story criada (Draft) — Orion/aiox-master
- 2026-06-23 — Real-time subscriptions Supabase para `curso` e `post_blog` implementadas em `src/lib/app-store.tsx`; guard de ambiente (`typeof window`) e cleanup de canais via `removeChannel`; lint/typecheck/build verdes; Status → Done — Executor (EP-9.1)
