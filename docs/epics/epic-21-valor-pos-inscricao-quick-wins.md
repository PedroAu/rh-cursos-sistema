# Épica 21 — Valor Pós-Inscrição: Quick Wins (Onda A)

**Status:** Draft — aguardando `@sm` para desmembrar em stories formais
**Fonte:** [`docs/brainstorming/2026-08-12-valor-pos-inscricao-e-conta-corporativa.md`](../brainstorming/2026-08-12-valor-pos-inscricao-e-conta-corporativa.md) — Onda A (§6), ideias 10, 15 e 5 (§5.4 Quick wins)
**Prioridade:** P1 (ROI ≥ 2,0, sem modelagem de dados nova)
**Esforço estimado:** ~1 sprint (esforço somado ≈ 6-8 pontos, incluindo o desmembramento da EP-21.2)
**Owner:** `@pm` (Morgan)

---

## 🎯 Objetivo

Capturar o valor imediato identificado na sessão de brainstorming de 2026-08-12: três melhorias de baixo esforço e alto ROI que usam dados e infraestrutura já existentes no modelo (`TrainingClass.totalSeats/availableSeats`, `TrainingClass.startDate/time/location/modality`) sem exigir decisão estratégica ou modelagem nova.

Este epic cobre exclusivamente a **Onda A**. As Ondas B (ciclo de reputação: NPS → prova social → certificado → badge) e C (reposicionamento B2B: multi-participante, portal corporativo) permanecem fora de escopo — ver §6 "Decisões e Bloqueios Registrados" abaixo.

---

## 📋 Acceptance Criteria (AC) da Épica

- [ ] **AC-1** — Badge de vagas restantes exibido na agenda pública e no catálogo, replicando o padrão já existente em `CourseDetail.tsx:126`
- [ ] **AC-2** — Exportação `.ics` disponível para cada turma com data confirmada, sem dependência de infraestrutura de e-mail transacional
- [ ] **AC-3** — Isca de captura de e-mail (ementa em PDF) disponível na página de curso, com formulário de e-mail antes do download
- [ ] **AC-4** — Nenhuma regressão nos testes existentes (`npm run test:unit`, `npm test`)
- [ ] **AC-5** — Lembrete automático de turma por e-mail (parte de ideia 15) **explicitamente fora deste epic** até decisão de infraestrutura de e-mail transacional (ver EP-21.2)

---

## 📂 Escopo

### IN SCOPE
- Componente de badge de escassez reutilizável (vagas restantes) aplicado à agenda (`app/agenda/page.tsx`) e ao catálogo (`src/views/public/Courses.tsx`)
- Geração de arquivo `.ics` (RFC 5545) por turma, download client-side, sem envio automático de e-mail
- Formulário de captura de e-mail + geração/servir PDF de ementa por curso
- Testes unitários para os três fluxos

### OUT OF SCOPE
- Lembretes automáticos por e-mail antes da turma (depende de decisão de ferramenta de e-mail transacional — ver EP-21.2 e §6)
- Lista de espera (ideia 9, Onda B)
- Prova social, NPS, certificado, badge LinkedIn (ideias 17→7→13→22, Onda B)
- Inscrição multi-participante, portal corporativo, proposta automática in-company (ideias 11, 19, 12, Onda C)

---

## 🎬 Stories da Épica

### Story EP-21.1: Badge de vagas restantes na agenda e no catálogo
**Fonte:** Ideia 10 (§4.3)
**Esforço:** 1
**Status:** Draft — a criar via `@sm *draft`
**AC:**
- [ ] Componente extraído/reutilizado a partir de `CourseDetail.tsx:126`
- [ ] Badge exibido na agenda pública (`app/agenda/page.tsx`) usando `TrainingClass.availableSeats`/`totalSeats`
- [ ] Badge exibido no catálogo (`src/views/public/Courses.tsx`)
- [ ] Teste unitário cobrindo turma cheia, quase cheia e com vagas abundantes

### Story EP-21.2: Exportação `.ics` por turma
**Fonte:** Ideia 15 (§4.4) — **desmembrada**: apenas a parte de exportação de calendário, sem lembrete automático
**Esforço:** 2
**Status:** Draft — a criar via `@sm *draft`
**AC:**
- [ ] Botão "Adicionar ao calendário" na página de detalhe da turma/agenda
- [ ] Arquivo `.ics` válido (RFC 5545) gerado com `startDate`, `time`, `location`, `modality` de `TrainingClass`
- [ ] Sem envio de e-mail automático nesta story — bloqueado por decisão de infraestrutura (ver §6, resposta 6)

### Story EP-21.3: Ementa em PDF com captura de e-mail
**Fonte:** Ideia 5 (§4.2)
**Esforço:** 3
**Status:** Draft — a criar via `@sm *draft`
**AC:**
- [ ] Formulário de e-mail na página de curso antes de liberar o PDF
- [ ] Geração ou servir PDF de ementa por curso
- [ ] Lead capturado registrado no mesmo pipeline de leads existente (`admin-resource-configs.tsx` / `leads`)
- [ ] Evento de analytics (`trackEvent`) disparado na captura, alinhado ao padrão de `inscricao_cta`/`lead_enviado`

---

## 🔗 Decisões e Bloqueios Registrados (respostas às perguntas do §8 do brainstorm)

Registrado em 2026-08-12, respostas do solicitante de negócio/produto às 6 perguntas abertas do documento de brainstorm:

| # | Pergunta | Resposta | Impacto |
|---|---|---|---|
| 1 | Há volume suficiente no GA4 para priorizar por dado real? | **Sim** | Backlog pós-Onda A pode ser reordenado com dados reais de `trackEvent`, não só hipótese |
| 2 | Há requisito legal/credenciamento que condicione o formato do certificado (ideia 13)? | **Não** | Desbloqueia liberdade de design do certificado na Onda B (fora deste epic) |
| 3 | Inscrição múltipla (ideia 11) exige nota fiscal por CNPJ/empenho? | **Sim** | Onda C (ideia 11/12, fora deste epic) precisa incluir emissão fiscal por CNPJ no escopo — aumenta esforço da aposta estrutural |
| 4 | Há depoimentos/logos/casos disponíveis para prova social (ideia 7)? | **Sim** | Desbloqueia a ideia 7 para a Onda B — sem essa resposta, ela ficaria bloqueada por falta de conteúdo |
| 5 | Instrutores têm material padronizado e direitos definidos para distribuição (ideia 14)? | **Sim** | Desbloqueia ideia 14 (materiais para download) no backlog pós-Onda A |
| 6 | A ferramenta de e-mail do squad suporta gatilhos transacionais? | **Não** | **Bloqueia diretamente parte da ideia 15** (lembrete automático) — por isso EP-21.2 foi desmembrada para cobrir só o `.ics`; o lembrete automático fica fora deste epic até decisão de ferramenta/infra de e-mail transacional |

**Ação de acompanhamento (fora deste epic):** decisão de infraestrutura de e-mail transacional (squad de e-mail marketing atual vs. novo provedor) é pré-requisito para reabrir o lembrete automático de turma (parte da ideia 15) e para o NPS pós-curso (ideia 17, Onda B). Recomendo tratar como spike técnico do `@architect` antes de planejar a Onda B.

---

## 📈 Métricas de Sucesso

| Métrica | Target | Validação |
|---------|--------|-----------|
| Badge de vagas visível | 100% das turmas com `totalSeats` definido | QA visual em agenda + catálogo |
| Downloads `.ics` sem erro | 0 arquivos malformados | Teste unitário de geração RFC 5545 |
| Leads capturados via PDF de ementa | > 0 no primeiro mês pós-deploy | GA4 / `trackEvent` |
| Regressão de testes | 0 | `npm run test:unit`, `npm test` |

---

## 🔄 Workflow (Story Development Cycle)

1. **@sm** — `*draft` para EP-21.1, EP-21.2, EP-21.3 (Draft)
2. **@po** — `*validate-story-draft` em cada uma (Ready)
3. **@dev** — `*develop` (InProgress → Done)
4. **@qa** — `*qa-gate` (InReview → Done)
5. **@devops** — push/PR

---

## 📝 Referências

- Brainstorm de origem: [`docs/brainstorming/2026-08-12-valor-pos-inscricao-e-conta-corporativa.md`](../brainstorming/2026-08-12-valor-pos-inscricao-e-conta-corporativa.md)
- Sessão anterior relacionada: `docs/brainstorming/2026-06-27-descoberta-conversao-visibilidade.md`
- PRD canônico: `docs/prd/prd.md`
- Matriz de rastreabilidade: `docs/prd/traceability-matrix.md`
