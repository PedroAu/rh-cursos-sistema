# Épica 9 — AppStore Refactoring — Supabase as Single Source of Truth

**Status:** PROPOSED (ready for assignment)  
**PRD Source:** `docs/PHASE-B-PLAN.md` (D-1.3)  
**Prioridade:** P0 (Foundation for Phase B)  
**Duração:** 3-4 dias  
**Fonte:** Phase B Strategic Plan — Consolidate Phase A's gains + establish platform foundations

---

## 🎯 Objetivo

Remover todas as dependências de dados mock (arquivos estáticos) e estabelecer **Supabase como single source of truth** para o AppStore. O site passa a consumir dados **100% em tempo real** das tabelas Supabase, preparando a plataforma para gerenciamento multi-tenant de cursos e escalabilidade.

**Impacto esperado:**
- Zero mock data files
- AppStore sincronizado com Supabase em tempo real
- Preparação para admin multiusuário
- Redução de debt técnico de dados

---

## 📋 Acceptance Criteria (AC) da Épica

### Fase 0: Preparação
- [ ] **AC-0.1** — Auditoria de mock data: identificar todas as importações de `src/lib/mock-data/*`
- [ ] **AC-0.2** — Mapeamento de dados mock → tabelas Supabase reais
- [ ] **AC-0.3** — Schema Supabase validado (todas as colunas necessárias presentes)

### Fase 1: Refactoring do AppStore
- [ ] **AC-1.1** — `src/lib/app-store.ts` refatorado para ler **exclusivamente** de Supabase
- [ ] **AC-1.2** — Todos os hooks (`useCourses`, `useStudents`, `useInstructors`) integrados com Supabase
- [ ] **AC-1.3** — Real-time listeners ativados (Supabase subscriptions)

### Fase 2: Migração de Dados
- [ ] **AC-2.1** — Dados de `mock-data/*` migrados para Supabase (seed automático ou manual)
- [ ] **AC-2.2** — Verificação de integridade: contagem e valores de cada tabela

### Fase 3: Validação e Cleanup
- [ ] **AC-3.1** — `src/lib/mock-data/*` deletado completamente
- [ ] **AC-3.2** — Nenhuma importação de `mock-data` no codebase
- [ ] **AC-3.3** — `npm run lint` e `npm run build` zero warnings
- [ ] **AC-3.4** — **Nenhuma regressão de performance** — LCP < 3s no catálogo

### Fase 4: Testes e Entrega
- [ ] **AC-4.1** — Todos os testes passam (unit + e2e)
- [ ] **AC-4.2** — Lighthouse score mantido ou melhorado
- [ ] **AC-4.3** — Zero console errors no build de produção
- [ ] **AC-4.4** — Stories atualizadas com mudanças

---

## 📂 Escopo

### IN SCOPE
- Refactoring de `src/lib/app-store.ts` (remover mock data, adicionar Supabase queries)
- Hooks de dados (`useCourses`, `useStudents`, `useInstructors`, etc.)
- Seed/migração de dados mock → Supabase
- Remoção de `src/lib/mock-data/*`
- Real-time subscriptions (Supabase)
- Testes de integração com Supabase

### OUT OF SCOPE
- Alteração de regras de negócio
- Mudanças de schema Supabase (além de validação)
- Auth rewrite (separado - Epic 11)
- Admin dashboard polish (separado - Epic 10)

---

## 🎬 Stories da Épica

### Story EP-9.0: AppStore Foundation Setup
**Objetivo:** Preparar arquitetura para leitura 100% Supabase  
**Esforço:** 1 dia  
**AC:**
- [ ] Mapeamento completo de mock data → Supabase tables
- [ ] Schema Supabase validado
- [ ] Decisão arquitetural: Supabase queries vs RLS vs server actions
- [ ] Plan documentado para próximas stories

---

### Story EP-9.1: AppStore Refactoring — Courses
**Objetivo:** Remover mock data de cursos, ler 100% de Supabase  
**Esforço:** 1.5 dias  
**AC:**
- [ ] `useCourses()` hook integrado com `supabase.from('courses').select()`
- [ ] Real-time listener ativo
- [ ] Dados mock de cursos removidos
- [ ] Zero warnings, testes passam

---

### Story EP-9.2: AppStore Refactoring — Students & Enrollments
**Objetivo:** Remover mock data de alunos/inscrições, ler 100% de Supabase  
**Esforço:** 1 dia  
**AC:**
- [ ] `useStudents()`, `useEnrollments()` integrados
- [ ] Real-time subscriptions para inscrições
- [ ] Mock data removido
- [ ] Queries otimizadas (índices, joins)

---

### Story EP-9.3: AppStore Refactoring — Instructors & Cleanup
**Objetivo:** Finalizar refactoring, remover todos os mocks, validar  
**Esforço:** 1 dia  
**AC:**
- [ ] `useInstructors()` integrado
- [ ] `src/lib/mock-data/*` completamente removido
- [ ] `npm run lint` zero warnings
- [ ] Lighthouse + testes verdes
- [ ] File List atualizada

---

## 🔗 Dependências

- **Dependências externas:** Phase A completo ✅, Supabase schema validado ✅
- **Bloqueadores conhecidos:** Nenhum

---

## 📈 Métricas de Sucesso (Fase B)

| Métrica | Target | Validação |
|---------|--------|-----------|
| Mock data files | 0 | `find src/lib/mock-data -type f` retorna vazio |
| Supabase query errors | 0 | Logs de produção |
| Performance regression | ≤5% | Lighthouse LCP |
| Test coverage | ≥90% | `npm test` coverage report |
| Build warnings | 0 | `npm run build` output |

---

## 🔄 Workflow (Story Development Cycle)

Cada story seguirá:
1. **@sm** — Create story (Draft)
2. **@po** — Validate story (Ready)
3. **@dev** — Implement (InProgress → Done)
4. **@qa** — QA Gate (InReview → Done)
5. **@devops** — Push to staging

---

## 📝 Referências

- PRD: `docs/PHASE-B-PLAN.md` — D-1.3 AppStore Refactoring
- Supabase config: `.env.local` + `supabase/config.toml`
- Mock data atual: `src/lib/mock-data/*.ts`
- AppStore: `src/lib/app-store.ts`
