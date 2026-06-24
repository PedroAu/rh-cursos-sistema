# Épica 11 — Auth Enhancement

**Status:** PROPOSED (ready for refinement)  
**PRD Source:** `docs/PHASE-B-PLAN.md` (D-1.4)  
**Prioridade:** P1  
**Duração:** 2-3 dias  
**Fonte:** Phase B Strategic Plan + artefatos atuais de autenticação

---

## Objetivo

Endurecer a autenticação da plataforma para o próximo ciclo, unificando sessão SSR, Edge Functions e autorização por papel sem reativar escopos que a publicação atual removeu.

**Impacto esperado:**
- Sessão com expiração e rotação consistentes
- RBAC alinhado entre app e Supabase
- Logout global previsível
- Demo auth definitivamente isolado
- Fluxos de autenticação cobertos por testes e auditáveis

---

## Acceptance Criteria da Épica

### Fase 0: Contrato e superfície atual
- [ ] **AC-0.1** — Superfície de auth inventariada: `app/api/auth/session`, `supabase/functions/auth-session`, `src/lib/auth.ts`, `src/lib/server-session.ts`, `src/lib/authorize.ts`, `src/lib/app-store.tsx`
- [ ] **AC-0.2** — Papel fonte-de-verdade definido e documentado entre `app_metadata.role`, `profiles.role` e sessão HMAC
- [ ] **AC-0.3** — Escopo da publicação atual preservado: `/admin` continua protegido, `/aluno` e `/instrutor` não são habilitados por acidente

### Fase 1: Hardening de sessão
- [ ] **AC-1.1** — Sessões rotacionam por atividade com TTL deslizante e sem regressão no SSR
- [ ] **AC-1.2** — Login e logout têm paridade entre Route Handler do Next e Edge Function equivalente
- [ ] **AC-1.3** — Logout global revoga sessões Supabase quando houver `service_role`, com fallback explícito e documentado

### Fase 2: RBAC
- [ ] **AC-2.1** — Tipos e utilitários do app suportam `admin`, `instructor` e `student` de forma fail-closed
- [ ] **AC-2.2** — Operações admin rejeitam acessos fora do papel permitido
- [ ] **AC-2.3** — Contrato app ↔ Supabase fica alinhado com os helpers `is_admin`, `is_instructor`, `is_student`

### Fase 3: Segurança operacional
- [ ] **AC-3.1** — Demo auth legado não participa do bundle/fluxo produtivo e não pode ser ativado silenciosamente
- [ ] **AC-3.2** — Rate limiting do login (5 tentativas / 15 min) tem UX e testes explícitos
- [ ] **AC-3.3** — Riscos de fallback in-memory e dependência de `SUPABASE_SERVICE_ROLE_KEY` ficam documentados

### Fase 4: Verificação
- [ ] **AC-4.1** — Fluxos de auth críticos têm testes automatizados
- [ ] **AC-4.2** — Security audit dedicado de autenticação aprovado

---

## Escopo

### IN SCOPE
- Sessão admin SSR/Edge
- Rotação e expiração de token/cookie
- Logout global e local
- RBAC no app e contrato com Supabase
- Isolamento de demo auth
- Testes e auditoria de segurança de auth

### OUT OF SCOPE
- Reativar portais `/aluno` ou `/instrutor`
- Reescrever toda a camada de auth para outro provedor
- Alterar regras de negócio fora de autenticação/autorização

---

## Stories da Épica

### Story EP-11.1: Sessão admin com rotação deslizante e expiração consistente
**Objetivo:** introduzir sliding session rotation sem quebrar SSR, cookie e token HMAC  
**Esforço:** 1 dia

### Story EP-11.2: RBAC unificado no app e no Supabase
**Objetivo:** alinhar tipos, guards e contrato de papéis entre app e banco  
**Esforço:** 0.5-1 dia

### Story EP-11.3: Isolamento definitivo de demo auth e logout global
**Objetivo:** remover risco residual de credenciais demo no cliente e fechar semântica de sign-out  
**Esforço:** 0.5 dia

### Story EP-11.4: Testes de auth e security audit
**Objetivo:** provar os fluxos críticos e fechar a épica com evidência de segurança  
**Esforço:** 0.5-1 dia

---

## Dependências

- `EP-9.3` concluída
- `EP-10.1` concluída
- Story base: `docs/stories/2026-06-09-admin-ssr-auth-foundation.md`
- Helpers SQL existentes: `supabase/migrations/20260623144035_rbac_authorization_helpers.sql`

---

## Riscos Conhecidos

- Conflito entre o escopo publicado hoje e o RBAC triplo pedido pelo plano
- Rotação de sessão pode quebrar o contrato atual entre SSR cookie e `x-rh-session`
- Logout global depende de `SUPABASE_SERVICE_ROLE_KEY`
- Demo auth legado ainda aparece em artefatos do cliente

---

## Referências

- `docs/PHASE-B-PLAN.md`
- `docs/DEMO-AUTH.md`
- `docs/api/auth-session.md`
- `docs/stories/2026-06-09-admin-ssr-auth-foundation.md`
