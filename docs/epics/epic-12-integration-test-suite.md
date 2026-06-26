# Épica 12 — Integration Test Suite

**Status:** IN PROGRESS — EP-12.1 e EP-12.3 `Done`; EP-12.2 `Ready for Review`; EP-12.4 `Approved`
**PRD Source:** `docs/PHASE-B-PLAN.md` (D-3.2)  
**Prioridade:** P1  
**Duração:** 2-3 dias  
**Fonte:** Phase B Strategic Plan + baseline atual de testes

---

## Objetivo

Expandir a suíte de testes para validar contratos reais entre UI, Next Route Handlers, Edge Functions e banco, em vez de depender majoritariamente de happy path e mocks.

**Impacto esperado:**
- Fluxos críticos cobertos ponta a ponta
- Contratos HTTP testados explicitamente
- Transações críticas verificadas
- Cobertura mínima defendável com escopo claro

---

## Acceptance Criteria da Épica

> Apenas stories `Done` podem encerrar AC da épica. EP-12.1 e EP-12.3
> concluídas; EP-12.2 aguarda revisão final e EP-12.4 ainda aguarda implementação.

### Fase 0: Harness e evidência
- [x] **AC-0.1** — Ambiente de integração reproduzível definido (seed, auth helper, reset)
- [x] **AC-0.2** — Cobertura reportada com escopo explícito, sem depender apenas do subset atual do Vitest

### Fase 1: Jornadas críticas
- [ ] **AC-1.1** — Checkout flow testado fim a fim
- [ ] **AC-1.2** — Login/logout testados com persistência de sessão
- [ ] **AC-1.3** — Matrícula em curso validada contra backend real

### Fase 2: Contratos
- [x] **AC-2.1** — `app/api/auth/session` coberto por contract/integration tests
- [x] **AC-2.2** — Edge Functions `enrollments`, `leads`, `admin-resources`, `auth-session` cobertas por contract tests
- [x] **AC-2.3** — Operações administrativas críticas testadas com autenticação válida e inválida

### Fase 3: Banco e confiabilidade
- [ ] **AC-3.1** — Casos transacionais críticos testados (duplicidade, concorrência, rollback)
- [ ] **AC-3.2** — RLS e auditoria admin têm evidência automatizada mínima
- [ ] **AC-3.3** — Cobertura total relevante para a épica permanece >= 70%

---

## Escopo

### IN SCOPE
- Harness de integração
- E2E com backend real onde fizer sentido
- Contract tests HTTP
- Testes transacionais / RLS
- Coverage gate e documentação de escopo

### OUT OF SCOPE
- Reescrever toda a suíte visual
- Testes de performance profundos fora do necessário para smoke/critical path
- Observabilidade/monitoramento de produção

---

## Stories da Épica

### Story EP-12.1: Harness de integração com seed, auth helper e coverage gate
**Objetivo:** estabilizar a base para testes reais e produzir cobertura auditável  
**Esforço:** 0.5-1 dia
**Status:** Done

### Story EP-12.2: Fluxos críticos E2E reais — login, logout e checkout
**Objetivo:** provar os journeys principais contra o backend real  
**Esforço:** 0.5-1 dia
**Status:** Ready for Review

### Story EP-12.3: Contract tests dos endpoints híbridos
**Objetivo:** validar formatos, códigos e auth dos endpoints Next + Supabase  
**Esforço:** 0.5-1 dia
**Status:** Done

### Story EP-12.4: Testes transacionais de banco e RLS
**Objetivo:** fechar o risco de concorrência, duplicidade e autorização em dados  
**Esforço:** 0.5-1 dia
**Status:** Approved — implementação pendente

---

## Dependências

- `EP-11` definida e estável o suficiente para auth flows
- `EP-9.3` e `EP-10.1` concluídas
- Artefatos existentes em `tests/`, `src/__tests__/`, `docs/api/`

---

## Riscos Conhecidos

- Suíte atual mistura intercepts/mocks com UI real
- Coverage atual do Vitest não mede o sistema todo
- Dados de teste e reset podem ficar frágeis sem harness explícito
- Contratos híbridos Next + Supabase elevam custo de manutenção

---

## Referências

- `docs/PHASE-B-PLAN.md`
- `tests/checkout.e2e.spec.ts`
- `tests/route-auth.spec.ts`
- `tests/login-errors.spec.ts`
- `docs/api/README.md`
