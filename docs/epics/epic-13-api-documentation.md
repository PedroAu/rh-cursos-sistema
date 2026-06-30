# Épica 13 — API Documentation

**Status:** COMPLETE — EP-13.1, EP-13.2, EP-13.3 all `Done`
**PRD Source:** `docs/PHASE-B-PLAN.md` (D-4.2)  
**Prioridade:** P2  
**Duração:** 1-2 dias  
**Fonte:** Phase B Strategic Plan + baseline atual de documentação manual

---

## Objetivo

Transformar a documentação manual já existente em um contrato canônico OpenAPI com publicação navegável, reduzindo deriva entre código, exemplos e operação.

**Impacto esperado:**
- Spec OpenAPI versionada
- Swagger UI/ReDoc rodando
- Contratos de request/response verificáveis
- Auth, rate limits e erros documentados de forma canônica

---

## Acceptance Criteria da Épica

### Fase 0: Inventário e contrato
- [x] **AC-0.1** — Superfície híbrida inventariada: Route Handlers do Next + Edge Functions do Supabase
- [x] **AC-0.2** — Fonte de verdade definida para exemplos, erros, auth e rate limits

### Fase 1: Spec OpenAPI
- [x] **AC-1.1** — Spec OpenAPI 3.x gerada e versionada no repositório
- [x] **AC-1.2** — Todos os endpoints atuais documentados
- [x] **AC-1.3** — Exemplos de request/response e códigos de erro presentes

### Fase 2: Publicação
- [x] **AC-2.1** — Métodos de autenticação documentados
- [x] **AC-2.2** — Rate limits documentados
- [x] **AC-2.3** — Swagger UI ou ReDoc rodando e referenciado no README/docs

### Fase 3: Governança
- [x] **AC-3.1** — Processo mínimo para evitar drift entre código e spec definido
- [x] **AC-3.2** — Endpoint `DELETE /functions/v1/auth-session` e demais gaps do catálogo atual reconciliados

---

## Escopo

### IN SCOPE
- Inventário de endpoints
- OpenAPI 3.x
- Swagger UI/ReDoc
- Exemplos, erros, auth e rate limit
- Referências cruzadas a `docs/api/*`

### OUT OF SCOPE
- SDK client completo
- Portal externo de developer relations
- Documentação de componentes UI

---

## Stories da Épica

### Story EP-13.1: Catálogo canônico da API híbrida e fundação OpenAPI
**Objetivo:** consolidar a superfície real e decidir o modelo do contrato  
**Esforço:** 0.5 dia
**Status:** Done

### Story EP-13.2: Spec OpenAPI completa com exemplos, auth e rate limits
**Objetivo:** gerar a spec versionada cobrindo todos os endpoints atuais  
**Esforço:** 0.5-1 dia
**Status:** Done

### Story EP-13.3: Swagger UI/ReDoc e gate anti-drift
**Objetivo:** publicar a documentação navegável e impedir divergência óbvia  
**Esforço:** 0.5 dia
**Status:** Approved — implementação pendente

---

## Dependências

- `EP-11` definida o suficiente para congelar métodos de autenticação
- `docs/api/README.md`, `docs/api/auth-session.md`, `docs/api/edge-functions.md`
- Superfície atual em `app/api/` e `supabase/functions/`

---

## Riscos Conhecidos

- A documentação manual atual é boa, mas não é canônica
- `admin-resources` é endpoint multiplexado e mais difícil de modelar
- Churn de auth pode invalidar a spec se `EP-11` mudar depois

---

## Referências

- `docs/PHASE-B-PLAN.md`
- `docs/api/README.md`
- `docs/api/auth-session.md`
- `docs/api/edge-functions.md`
