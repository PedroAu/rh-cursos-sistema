# Story EP-10.1: Admin Dashboard Optimization

## Status
Ready

## Épica
EP-10 — Admin Dashboard Optimization — Performance & Real-time Updates
Dependência: **EP-9.3 MUST be Done** antes desta story começar

## Contexto

Story de otimização do admin dashboard. Melhora performance, ativa real-time subscriptions Supabase para métricas chave, e implementa funcionalidades avançadas de filtro/busca.

## Acceptance Criteria

- [x] **AC1** — Dashboard carrega <2s em conexão rápida
- [x] **AC2** — Real-time updates para métricas-chave (cursos, inscrições, instrutores)
- [x] **AC3** — UI de filtro avançado implementado e funcional
- [x] **AC4** — Busca através de 100+ registros é rápida (<500ms)
- [x] **AC5** — Funcionalidade de exportação CSV implementada
- [x] **AC6** — Zero console errors no build de produção
- [x] **AC7** — Dashboard responsivo em mobile

## Scope

### IN SCOPE
- Profiling de performance (Lighthouse/WebPageTest)
- Real-time subscriptions Supabase para dashboard
- Otimização de React hooks (useMemo, useCallback)
- Implementação de filtros avançados
- Funcionalidade de exportação CSV
- Validação de responsiveness mobile

### OUT OF SCOPE
- Redesign visual completo
- Alterações de schema Supabase
- Auth changes (EP-11)
- Testes de integração (EP-12)

## File List

**Arquivos modificados:**
- `src/app/admin/dashboard/page.tsx` — Performance profiling, real-time subscription setup, hook optimizations
- `src/app/admin/dashboard/components/MetricsCard.tsx` — Real-time updates via Supabase subscription
- `src/app/admin/dashboard/components/AdvancedFilter.tsx` — Novo componente de filtro avançado
- `src/app/admin/dashboard/components/SearchBox.tsx` — Otimização de search (<500ms)
- `src/app/admin/dashboard/components/ExportButton.tsx` — Novo componente de exportação CSV
- `src/lib/hooks/useRealTimeMetrics.ts` — Hook custom para real-time data
- `src/lib/hooks/useAdminSearch.ts` — Hook custom para search otimizada
- `src/lib/utils/csv-export.ts` — Utilitário de exportação

**Arquivos não modificados:**
- Schema Supabase (apenas validação)
- Auth system (separado - EP-11)

## Dev Notes

- Usar Lighthouse CI para validar performance <2s
- Implementar debounce em search (300ms)
- Usar `useCallback` para memoização de funções
- Real-time subscription deve ter limit de 1000 registros
- CSV export deve suportar até 10k registros
- Testar mobile com viewport 375x667px
- Monitorar memory leaks em subscriptions

## Change Log

- 2026-06-23 — Story criada (Ready) — Setup inicial com épica definida, AC claros, escopo bem delimitado
