# Matriz Canônica de Rastreabilidade — RH Cursos

**Owner de produto:** `@pm` (Morgan)
**Autor da reconciliação:** `@analyst` (Story 18.1)
**Data de geração:** 2026-08-12
**Baseline Git (HEAD):** `06f9366` (branch `codex/hotfixes-no-payments`; snapshot dos paths antes das correções documentais deste PR)
**Working tree auditado:** alterações locais de SEO, JSON-LD de agenda, stories 12/08, migration editorial e ajustes de fidelidade; a migration ainda precisa ser aplicada ao projeto remoto Supabase via `supabase db push` antes do deploy. Nenhuma alteração remota foi aplicada por esta auditoria.
**Fontes primárias:** `docs/prd/prd.md`, `docs/prd/modernizacao-ui-2026.md`, `docs/epics/`, `docs/stories/`, `docs/qa/gates/`, verificação direta do worktree e gates executados em 2026-08-12.
**Regra de classificação (Article IV — No Invention):** só é `ATENDIDO` o requisito com link verificável para código, story ou gate real. Sem evidência verificável → `PARCIAL`, `DIFERIDO` ou `NÃO ATENDIDO`. Nunca `ATENDIDO` por inferência ou por semelhança de nome.

---

## 0. Resumo executivo

| Estado | Contagem | Requisitos |
|---|---:|---|
| `ATENDIDO` | 28 | FR1–FR11, FR13, FR15–FR16; NFR1–NFR10; CR1–CR4 |
| `PARCIAL` | 0 | — |
| `DIFERIDO` | 2 | FR12, FR14 |
| `NÃO ATENDIDO` | 0 | — |
| **Total** | **30** | FR1–FR16 (16) + NFR1–NFR10 (10) + CR1–CR4 (4) |

**Leitura de risco:** os cinco itens anteriormente `PARCIAL` foram reavaliados contra o estado atual. A suíte unitária (796 testes), o build, o drift OpenAPI (16 rotas), a acessibilidade/baselines e a suíte E2E isolada estão verdes; FR12 e FR14 continuam `DIFERIDO` por decisão explícita do MVP.

## Validação corrente — 2026-08-12

- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run test:unit`: PASS — 80 arquivos / 796 testes.
- `npm run build`: PASS.
- `npm run docs:api:check-drift`: PASS — 16 rotas reconciliadas.
- `npm test`: PASS em 2026-08-12 — 184/184 em 3,1 min, após a implementação do JSON-LD da agenda.
- Stories novas: [SEO de conteúdo de cursos](../stories/2026-08-12-seo-conteudo-cursos.md) e [JSON-LD de eventos da agenda](../stories/2026-08-12-event-jsonld-agenda.md), ambas `Done`.

---

## 1. Matriz FR/NFR/CR → épica → story → código → teste/gate

> Legenda de colunas: **Estado** normalizado · **Épica** de origem/entrega · **Story** com artefato formal (ou GAP) · **Código** verificado no worktree · **Teste/Gate** com evidência versionada · **Evidência** (nota curta) · **Owner** · **Próximo passo** (obrigatório quando ≠ `ATENDIDO`).

### 1.1 Requisitos Funcionais (FR1–FR16)

| Req | Estado | Épica | Story (artefato) | Código | Teste/Gate | Evidência | Owner | Próximo passo |
|---|---|---|---|---|---|---|---|---|
| **FR1** — site apresenta RH Cursos como empresa de cursos e consultoria p/ setor público e privado | `ATENDIDO` | PRD-brownfield Epic 1; Épica 14 | `docs/stories/1.1.story.md` (Done) | `app/page.tsx`, `app/consultoria/page.tsx`, `src/views/public/Home.tsx` | `docs/qa/gates/1.1-public-positioning-and-journey-clarity.yml` (PASS) | Posicionamento validado no gate 1.1; home e consultoria publicadas | `@pm` | — |
| **FR2** — comunica conhecimento prático aplicado a leis/regulação | `ATENDIDO` | PRD-brownfield Epic 1 | `docs/stories/1.1.story.md` (Done) | `src/views/public/Home.tsx`, `src/views/public/SpecialistContact.tsx` (`"Plano de adequação aplicável à realidade do seu órgão ou empresa"`) | gate 1.1 (AC2, PASS) | Copy de aplicabilidade legal presente e coberta pelo gate | `@pm` | — |
| **FR3** — três jornadas explícitas: cursos abertos, in-company, consultoria | `ATENDIDO` | PRD-brownfield Epic 1; Épica 4 | `docs/stories/1.1.story.md` (Done) | `app/cursos/`, `app/in-company/`, `app/consultoria/` | gate 1.1 (PASS) | Três rotas comerciais distintas existentes | `@pm` | — |
| **FR4** — agenda pública permite descobrir cursos e avançar p/ inscrição/contato | `ATENDIDO` | Épica 4; Épica 17 (REC-301) | `docs/stories/2026-07-14-rec-301-converter-checkout-pre-inscricao.md` (Done) | `app/agenda/`, `app/cursos/`, `src/views/public/Agenda.tsx`, `CourseDetail.tsx` | `docs/qa/gates/rec-301-converter-checkout-pre-inscricao.yml` | Descoberta + pré-inscrição real (checkout convertido em pré-inscrição) | `@pm` | — |
| **FR5** — in-company como caminho público de conversão | `ATENDIDO` | Épica 14 | `docs/stories/2026-07-05-epic14-story2-4-in-company-fidelidade-total.md` (Done) | `app/in-company/`, `src/views/public/InCompany.tsx` | `docs/qa/gates/14.2.4-in-company-publica-com-fidelidade-total-trust-keith.yml` | Página in-company com CTA de conversão | `@pm` | — |
| **FR6** — captura de lead de consultoria (contato, organização, área, mensagem) | `ATENDIDO` | PRD-brownfield Epic 1; Épica 17 (REC-302) | GAP formal (ver §3) + `docs/stories/2026-07-14-rec-302-remover-sucesso-falso-formularios.md` (Done) | `app/consultoria/page.tsx` → `<SpecialistContactPage leadOrigin="Consultoria" />`; `src/views/public/SpecialistContact.tsx` (campos `name`, `email`, `phone`, `organization`, `interestArea`, `message`) | `docs/qa/gates/rec-302-remover-sucesso-falso-formularios.yml` | Todos os 4 grupos de campos do FR6 presentes e com validação; persistência real garantida pela REC-302 | `@pm` | — |
| **FR7** — consultoria como oferta pública com página dedicada e CTAs de conversão | `ATENDIDO` | PRD-brownfield Epic 1 | GAP formal (ver §3) | `app/consultoria/page.tsx`; `src/views/public/SpecialistContact.tsx` | reskin coberto por `docs/stories/2026-07-05-epic14-story2-7-paginas-sem-canvas-reskin.md` (Done) | Página dedicada `/consultoria` existente | `@pm` | — |
| **FR8** — leads de consultoria visíveis/gerenciáveis no admin sem quebrar outras origens | `ATENDIDO` | Épica 17 (REC-206/303) | `docs/stories/2026-07-17-rec-303-read-models-alunos-inscricoes.md` (Done) | `src/types/index.ts` (`LeadType`, `LeadOrigin` com `"Consultoria"`); `src/lib/admin-resource-configs.tsx` (resource `leads`) | `docs/qa/gates/rec-303-read-models-alunos-inscricoes.yml` | Modelo de lead com origem/tipo e leitura administrativa consolidada | `@pm` | — |
| **FR9** — admin gerencia conteúdo e registros operacionais | `ATENDIDO` | Épica 15; Custom | `docs/stories/2026-07-09-admin-crud-leads-students-enrollments.md` (Done); `docs/stories/2026-07-13-epic15-story1-1-admin-dashboard-fidelidade-total.md` (Done) | `src/views/admin/AdminResourcePage.tsx`, `src/lib/admin-resource-configs.tsx` | `docs/qa/gates/epic15-complete-fidelity.yml` | CRUD admin completo para cursos/turmas/alunos/leads/inscrições/blog/config | `@pm` | — |
| **FR10** — admin distingue origem/interesse (curso, in-company, consultoria, contato, newsletter) | `ATENDIDO` | Épica 17 | `docs/stories/2026-07-17-rec-206-consolidar-bff-canonico.md` (Done) | `src/types/index.ts` (`LeadType = "Curso" \| "InCompany" \| "Consultoria" \| "Newsletter" \| "Orçamento" \| "Contato"`, `LeadOrigin`) | `docs/qa/gates/rec-206-consolidar-bff-canonico.yml` | Classificação de origem/tipo modelada e usada | `@pm` | — |
| **FR11** — área do aluno autenticada (identidade, matrículas, curso/turma) | `ATENDIDO` | PRD-brownfield Epic 1; Épica 14 | GAP formal (ver §3) + `docs/stories/2026-07-02-epic14-story1-4-portals-resign.md` (Done) | `app/aluno/page.tsx` → `src/views/portal/StudentPortal.tsx`; `src/lib/contexts/student-context.tsx`; `src/lib/supabase/portal-data.ts` | reskin/portal em `epic14-story1-4-portals-resign` (Done) | Portal do aluno implementado e roteado | `@pm` | — |
| **FR12** — certificados/materiais/pagamentos/suporte do aluno | `DIFERIDO` | PRD-brownfield Epic 1 (§Requirements MVP) | — | Sem evidência de implementação no worktree (fora do MVP por decisão do PRD) | — | PRD declara explicitamente fora do MVP até story dedicada com schema/API/RLS | `@po` | Abrir story dedicada com schema/API/RLS antes de qualquer implementação |
| **FR13** — área do instrutor autenticada (identidade, cursos/turmas, alunos autorizados) | `ATENDIDO` | PRD-brownfield Epic 1; Épica 14 | GAP formal (ver §3) + `docs/stories/2026-07-02-epic14-story1-4-portals-resign.md` (Done) | `app/instrutor/page.tsx` → `src/views/portal/InstructorPortal.tsx`; `src/lib/supabase/portal-data.ts` | reskin/portal em `epic14-story1-4-portals-resign` (Done) | Portal do instrutor implementado e roteado | `@pm` | — |
| **FR14** — ações operacionais do instrutor (presença, publicação, comunicação) | `DIFERIDO` | PRD-brownfield Epic 1 (§Requirements MVP) | — | Sem evidência de implementação (fora do MVP por decisão do PRD) | — | PRD declara fora do MVP até story dedicada com schema/API/RLS | `@po` | Abrir story dedicada antes de implementar |
| **FR15** — navegação pública expõe os caminhos-chave | `ATENDIDO` | PRD-brownfield Epic 1; Épica 4 | `docs/stories/1.1.story.md` (Done) | rotas `app/cursos`, `app/agenda`, `app/in-company`, `app/consultoria`, `app/blog`, `app/contato`, `app/login`, `app/falar-com-especialista`, `app/sobre` | gate 1.1 (PASS) | Todos os caminhos de negócio expostos na navegação | `@pm` | — |
| **FR16** — comportamento existente (catálogo, agenda, in-company, checkout, admin, auth) continua funcionando | `ATENDIDO` | Épica 16; Épica 17; Épica 18 | `docs/stories/2026-07-19-epic18-story3-restaurar-gates.md` (Done) + REC-* | fluxos preservados em `app/**`, `src/**` | `npm test` 184/184 em ambiente Supabase isolado; unitários, build e OpenAPI verdes | Regressão funcional e contratos reconciliados após o cutover SSR | `@dev` | — |

### 1.2 Requisitos Não Funcionais (NFR1–NFR10)

| Req | Estado | Épica | Story (artefato) | Código | Teste/Gate | Evidência | Owner | Próximo passo |
|---|---|---|---|---|---|---|---|---|
| **NFR1** — preservar Next.js 16 / React 19 / TS / Supabase / Cloudflare Workers | `ATENDIDO` | Épica 18 (contexto) | — | `package.json`, `app/`, `src/`, `supabase/`, `open-next.config.ts` | — | Stack confirmada no PRD e na Épica 18 §Contexto | `@architect` | — |
| **NFR2** — acesso fail-closed, sem vazamento entre papéis | `ATENDIDO` | Épica 11; Épica 17 | `docs/stories/2026-07-16-rec-202-sessao-supabase-ssr.md` (Done); `docs/stories/2026-07-16-rec-203-autorizacao-servidor.md` (Done) | `supabase/functions/_shared/auth.ts`, guards SSR | `docs/qa/gates/rec-202-sessao-supabase-ssr.yml`, `docs/qa/gates/rec-203-autorizacao-servidor.yml`, `docs/qa/gates/rec-003-fail-closed-indisponibilidade.yml` | AAL2 fail-closed + autorização no servidor | `@architect` | — |
| **NFR3** — captura pública preserva rate limit, validação, CORS, anti-abuso | `ATENDIDO` | Épica 17 | `docs/stories/2026-07-16-rec-107-endurecer-endpoints-publicos.md` (Done); `docs/stories/2026-07-17-rec-205-rate-limit-identidade-autenticada.md` (Done) | endpoints públicos endurecidos | `docs/qa/gates/rec-107-endurecer-endpoints-publicos.yml`, `docs/qa/gates/rec-205-rate-limit-identidade-autenticada.yml` | Rate limit e validação reforçados | `@architect` | — |
| **NFR4** — consultoria atende baseline de acessibilidade (teclado, labels, foco, WCAG) | `ATENDIDO` | Épica 1 (modernização); Épica 17 (REC-308); Épica 18 | `docs/stories/2026-07-17-rec-308-corrigir-acessibilidade-critica.md` (Done) | `SpecialistContact.tsx` e rotas públicas com labels, validação inline, foco e erros associados | `npm test` 184/184; `tests/ui-governance.spec.ts`; `tests/a11y.spec.ts`; `tests/keyboard.baseline.spec.ts`; `tests/contrast-report.baseline.spec.ts`; relatórios versionados em `docs/qa/` | Acessibilidade crítica e prova automatizada reproduzível confirmadas | `@ux-design-expert` | — |
| **NFR5** — novas telas seguem o design system existente | `ATENDIDO` | Épica 14; Épica 15 | `docs/stories/2026-07-13-epic15-story1-1-admin-dashboard-fidelidade-total.md` (Done) | tokens `--tk-*` em `src/styles/`, componentes `src/components/**` | `docs/qa/gates/epic14.1-5-mantine-purge.yml`; `npm run purge:gate` PASS (Épica 18 §3) | Design system Trust Keith unificado, zero Mantine/Emotion | `@ux-design-expert` | — |
| **NFR6** — verificação automatizada de fluxos críticos (conversão, leads, RBAC) | `ATENDIDO` | Épica 12; Épica 17; Épica 18 | `docs/stories/2026-06-24-epic12-story2-e2e-auth-checkout.md` (Done); `docs/stories/2026-07-19-epic18-story3-restaurar-gates.md` (Done) | `src/__tests__/**`, `tests/**` | `npm run test:unit` 796/796 e `npm test` 184/184 | Conversão, admin, auth, RBAC, acessibilidade e regressão pública automatizados | `@dev` | — |
| **NFR7** — políticas/migrations preservam RLS e têm cobertura de testes | `ATENDIDO` | Épica 12; Épica 17 | `docs/stories/2026-06-24-epic12-story4-db-transactions-rls.md` (Done); REC-101..106 (Done) | `supabase/migrations/**`, RLS policies | `docs/qa/gates/epic12.4-db-transactions-rls.yml`, `docs/qa/gates/rec-101..106-*.yml` | RLS endurecida e coberta por testes transacionais | `@data-engineer` | — |
| **NFR8** — site permanece deployável via Cloudflare Workers/OpenNext | `ATENDIDO` | Épica 17 | `docs/stories/2026-07-14-rec-401-encadear-ci-deploy.md` (Done); `docs/stories/2026-07-14-rec-402-migrations-obrigatorias-deploy.md` (Done) | `open-next.config.ts`, `.github/workflows/deploy-functions.yml` | `docs/qa/gates/rec-401-encadear-ci-deploy.yml`, `docs/qa/gates/rec-402-migrations-obrigatorias-deploy.yml` | CI encadeia deploy; migrations obrigatórias | `@devops` | — |
| **NFR9** — documentação/OpenAPI atualizada quando lead/auth/admin mudam | `ATENDIDO` | Épica 13; Épica 17 (REC-406); Épica 18 | `docs/stories/2026-07-19-epic18-story3-restaurar-gates.md` (Done) | `docs/api/openapi.yaml`, `docs/api/*.md` | `npm run docs:api:check-drift`: PASS — 16 rotas reconciliadas | Contrato publicado alinhado à superfície HTTP real | `@dev` | — |
| **NFR10** — sem reintroduzir demo-auth ou mock-only em produção | `ATENDIDO` | Épica 11; Épica 16; Épica 17 | `docs/stories/2026-07-13-epic16-story1-1-remover-fallback-mock-producao.md` (Done); `docs/stories/2026-07-17-rec-204-remover-hmac-localstorage-header.md` (Done) | remoção de fallback mock e HMAC legado | `docs/qa/gates/16.1-remover-fallback-mock-producao.yml`, `docs/qa/gates/epic11.3-demo-auth-logout-global.yml` | Mock e demo-auth removidos; cutover para Supabase SSR | `@architect` | — |

### 1.3 Requisitos de Compatibilidade (CR1–CR4)

| Req | Estado | Épica | Story (artefato) | Código | Teste/Gate | Evidência | Owner | Próximo passo |
|---|---|---|---|---|---|---|---|---|
| **CR1** — compatibilidade de API (public, admin, auth-session, enrollments, leads, admin-resources) | `ATENDIDO` | Épica 13; Épica 17; Épica 18 | `docs/stories/2026-07-19-epic18-story3-restaurar-gates.md` (Done) | route handlers em `app/api/**`, `docs/api/openapi.yaml` | OpenAPI drift PASS — 16 rotas; contratos e rotas atuais reconciliados | A remoção de `auth-session` foi refletida na documentação vigente sem reintroduzir endpoint legado | `@dev` | — |
| **CR2** — compatibilidade de schema (tabelas e helpers RLS) | `ATENDIDO` | Épica 17 | REC-101..106, `docs/stories/2026-07-17-rec-303-read-models-alunos-inscricoes.md` (Done) | `supabase/migrations/**`, `docs/database/SCHEMA.md` | gates REC-101..106; `docs/qa/gates/rec-303-read-models-alunos-inscricoes.yml` | Nenhuma alteração destrutiva de schema; tabelas base preservadas | `@data-engineer` | — |
| **CR3** — consistência UI/UX (identidade visual única) | `ATENDIDO` | Épica 14; Épica 15 | `docs/stories/2026-07-06-epic14-story3-1-auditoria-visual-final.md` (Done) | tokens `--tk-*`, componentes Trust Keith | `docs/qa/gates/14.3.1-auditoria-visual-final-a11y-e-lighthouse.yml`; `npm run purge:gate` PASS | Linguagem visual única Trust Keith (sem identidade concorrente ativa) | `@ux-design-expert` | — |
| **CR4** — compatibilidade de integração (Supabase SSR/Edge, OpenAPI, Playwright, Vitest, deploy CF) | `ATENDIDO` | Épica 12; Épica 17; Épica 18 | `docs/stories/2026-07-19-epic18-story3-restaurar-gates.md` (Done) | harness Vitest/Playwright, Edge Functions, OpenAPI, deploy CF | `npm run test:unit` 796/796; `npm run docs:api:check-drift` PASS; `npm test` 184/184; build PASS | Integrações atuais reconciliadas e verificadas em ambiente isolado | `@dev` | — |

---

## 2. Rastreabilidade das Épicas 1–17

> Existem **dois universos de numeração de épicas** no portfólio, e eles não devem ser confundidos:
> 1. **PRD brownfield (`docs/prd/prd.md`)** — define um **Epic 1 único** ("RH Cursos Platform Repositioning and Role-Based Experience Activation") com Stories 1.1–1.6. É a fonte dos FR/NFR/CR. Arquivo: `docs/prd/epic-1-rh-cursos-platform-repositioning-and-role-based-experience-activation.md`.
> 2. **PRD de modernização (`docs/prd/modernizacao-ui-2026.md`)** — define **Épicas 1–6** de UI/UX. As Épicas 7–17 evoluíram além desse PRD. Arquivos: `docs/epics/epic-{N}-*.md`.
>
> A tabela abaixo cobre as **Épicas 1–17 de `docs/epics/`** (universo de execução). O Epic 1 do PRD brownfield é rastreado na §3.

| Épica (`docs/epics/`) | Status declarado | PRD/Requisitos atendidos | Stories/evidência vigente | Classificação da fonte |
|---|---|---|---|---|
| **Épica 1** — Fundação Visual & Baseline A11y | COMPLETE (1.1–1.4 Done) | modernização O1/O4, NFR4/NFR5 | `docs/epics/epic-1-fundacao-visual-baseline-a11y.md`; baseline em `src/styles/globals.css` | **Vigente** |
| **Épica 2** — Form System & Acessibilidade | COMPLETE (2.1–2.5 Done) | modernização S3, NFR4 | `docs/epics/epic-2-form-system-a11y.md`; `src/components/admin/form-fields.tsx` | **Vigente** |
| **Épica 3** — Admin Polish | COMPLETE (3.1–3.4 Done) | modernização O3, FR9 | `docs/epics/epic-3-admin-polish.md` | **Vigente** |
| **Épica 4** — Jornadas Públicas | COMPLETE (4.1–4.4 Done) | FR3, FR4, FR5, FR15 | `docs/epics/epic-4-jornadas-publicas.md` | **Vigente** |
| **Épica 5** — Busca, Loading, Motion & Imagens | COMPLETE (5.1–5.5 Done) | modernização S7/S8/S9 | `docs/epics/epic-5-busca-loading-motion-imagens.md` | **Vigente** |
| **Épica 6** — Governança de Design | COMPLETE (6.1–6.3 Done) | modernização O4 | `docs/epics/epic-6-governanca-design.md` | **Vigente** |
| **Épica 7** — Redesign "Executive Precision" | COMPLETE (declarada) | superseded por Trust Keith | `docs/epics/epic-7-redesign-executive-precision.md`; **fontes canônicas `docs/design/executive-precision/` AUSENTES** (ver §4) | **HISTÓRICO / SUPERSEDIDO** (ver §5) |
| **Épica 8** — Brownfield Remediation | DONE | dívida técnica; NFR6 | `docs/epics/epic-8-brownfield-remediation.md`; `docs/stories/2026-06-26-epic8-finalization-governance.md` | **Vigente** (itens de serviço externo diferidos) |
| **Épica 9** — AppStore Refactoring | COMPLETE (EP-9.0–9.3 Done) | NFR1, NFR10 | `docs/epics/epic-9-appstore-refactoring.md`; stories `2026-06-22-epic9-*` | **Vigente**; **referencia `docs/PHASE-B-PLAN.md` AUSENTE** (§4) |
| **Épica 10** — Admin Dashboard Optimization | COMPLETE (EP-10.1 Done) | FR9 | `docs/epics/epic-10-admin-dashboard-optimization.md`; `docs/history/decisions/decision-log-ep-10.md` | **Vigente**; **referencia `docs/PHASE-B-PLAN.md` AUSENTE** (§4) |
| **Épica 11** — Auth Enhancement | COMPLETE (11.1–11.4 Done; audit WAIVED) | NFR2, NFR10 | `docs/epics/epic-11-auth-enhancement.md`; gates `epic11.1..4-*.yml` | **Vigente** |
| **Épica 12** — Integration Test Suite | COMPLETE (12.1–12.4 Done) | NFR6, NFR7, CR4 | `docs/epics/epic-12-integration-test-suite.md`; gates `epic12.2/12.4-*.yml` | **Vigente** |
| **Épica 13** — API Documentation | COMPLETE (13.1–13.3 Done) | NFR9, CR1 | `docs/epics/epic-13-api-documentation.md`; `docs/api/openapi.yaml`; gate `epic13.3-*.yml` | **Vigente**; **referencia `docs/PHASE-B-PLAN.md` AUSENTE** (§4) |
| **Épica 14** — Redesign Trust Keith (público) | Complete (22/22 Done, 2026-07-15) | NFR5, CR3, FR5, FR11, FR13 | `docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md`; 23 stories `epic14-*` | **Vigente — identidade canônica** (ver §5) |
| **Épica 15** — Admin Dashboard Fidelidade Total | Complete (15.1–15.8 Done, 2026-07-19) | NFR5, CR3, FR9 | `docs/epics/epic-15-admin-dashboard-fidelidade-total.md`; gate `epic15-complete-fidelity.yml`; `npm run test:epic15:fidelity` PASS 9/9 após Story 18.3 | **Vigente**; prova de fidelidade restaurada |
| **Épica 16** — Integridade de Catálogo em Produção | Complete (16.1 Done, 2026-07-15) | NFR10, FR16 | `docs/epics/epic-16-integridade-catalogo-producao.md`; gate `16.1-*.yml` | **Vigente** |
| **Épica 17** — Recuperação SEV-0 (REC-*) | **Encerrada (G5 CONCERNS, 2026-07-19)** | NFR2, NFR3, NFR7, NFR8, CR1, CR2, FR4, FR6, FR8, FR10 | `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md`; `docs/stories/2026-07-19-rec-502-encerrar-incidente-post-mortem.md`; 34 stories REC-* | **Vigente** (encerrada com 13 ações preventivas com prazo) |

**Nota sobre a Épica 18** (não incluída no intervalo 1–17): `docs/epics/epic-18-consolidacao-produto-redesign-governanca.md` está `Done`; Stories 18.1–18.3 foram concluídas e fecharam esta reconciliação. Vigente.

**Nota sobre "Épica 17 — Coerência de dados":** o arquivo `docs/stories/2026-07-14-epica17-coerencia-dados-admin-publico.md` (Draft) usa o rótulo "Épica 17" para uma frente de coerência de dados anterior ao rebranding SEV-0. Registrado aqui para evitar link silenciosamente ambíguo; a Épica 17 canônica em `docs/epics/` é a Recuperação SEV-0.

---

## 3. Mapeamento formal das Stories 1.2–1.6 (PRD brownfield)

> **Regra aplicada:** nenhuma equivalência por semelhança de nome. Uma capability encontrada no código **não** cria automaticamente uma story de substituição; ela é registrada como *entrega funcional em código* + *GAP de artefato formal* quando não há story numerada 1.x correspondente. A decisão de fechar/abrir o gap é do `@po`/`@pm`.

| Story PRD | Descrição original | Artefato formal 1.x? | Entrega funcional verificada (código) | Stories/gates relacionados (não substitutos) | Classificação |
|---|---|---|---|---|---|
| **1.1** — Public Positioning and Journey Clarity | Posicionamento e clareza de jornadas | **SIM** — `docs/stories/1.1.story.md` (Done) | `app/page.tsx`, navegação pública | `docs/qa/gates/1.1-public-positioning-and-journey-clarity.yml` (PASS) | **ARTEFATO EXISTENTE — ATENDIDO** |
| **1.2** — Consulting Offer and Conversion Flow | Página de consultoria + fluxo de conversão | **NÃO** | `app/consultoria/page.tsx` → `SpecialistContact.tsx` (`leadOrigin="Consultoria"`, campos completos FR6) | reskin visual: `2026-07-05-epic14-story2-7-paginas-sem-canvas-reskin.md`; persistência: `rec-302-*` | **ENTREGUE EM CÓDIGO; GAP de artefato formal.** Gestão editorial da página permanece backlog `[1.2-F1]` (Épica 18 §OUT OF SCOPE). Decisão do `@po` |
| **1.3** — Lead Classification and Admin Visibility | Classificação de leads e visibilidade admin | **NÃO** | `src/types/index.ts` (`LeadType`/`LeadOrigin` com `Consultoria`); `src/lib/admin-resource-configs.tsx` (resource `leads`) | `rec-206-consolidar-bff-canonico.md`; `rec-303-read-models-alunos-inscricoes.md` | **ENTREGUE EM CÓDIGO; GAP de artefato formal.** Decisão do `@po` |
| **1.4** — Student MVP Portal Activation | Portal MVP do aluno | **NÃO** | `app/aluno/page.tsx` → `src/views/portal/StudentPortal.tsx`; `src/lib/contexts/student-context.tsx`; `src/lib/supabase/portal-data.ts` | reskin: `2026-07-02-epic14-story1-4-portals-resign.md` (Done) | **ENTREGUE EM CÓDIGO; GAP de artefato formal.** Decisão do `@po` |
| **1.5** — Instructor MVP Portal Activation | Portal MVP do instrutor | **NÃO** | `app/instrutor/page.tsx` → `src/views/portal/InstructorPortal.tsx`; `src/lib/supabase/portal-data.ts` | reskin: `2026-07-02-epic14-story1-4-portals-resign.md` (Done) | **ENTREGUE EM CÓDIGO; GAP de artefato formal.** Decisão do `@po` |
| **1.6** — Regression, Access Control, and Compatibility Hardening | Regressão, controle de acesso e hardening | **NÃO** | cobertura de facto por Épica 11 (auth), Épica 12 (integração), Épica 17 (REC-* segurança) | `epic11.*`, `epic12.*`, `rec-*` (Done) | **COBERTO DE FACTO POR ÉPICAS POSTERIORES; GAP de artefato formal 1.6.** A suíte agregada está verde (184/184); permanece apenas o gap documental. Decisão do `@po`/`@dev` |

**Conclusão da §3:** apenas a Story 1.1 tem artefato formal. As capacidades de 1.2–1.6 existem no produto (código verificado) e foram tocadas por épicas posteriores, mas **não há stories de substituição numeradas 1.2–1.6**. Isso é um gap de rastreabilidade formal (não de funcionalidade), a ser resolvido por decisão explícita do `@po`/`@pm` — não por inferência desta story.

---

## 4. Fontes ausentes e referências quebradas

> Toda ausência registrada com impacto e owner; nenhum conteúdo desconhecido foi recriado (Article IV).

| Fonte referenciada | Referenciada por | Estado no worktree | Impacto | Owner |
|---|---|---|---|---|
| `docs/PHASE-B-PLAN.md` | Épicas 9, 10, 13 | **AUSENTE** | Baseline de planejamento das Épicas 9–13 sem redirecionamento; links quebrados nas épicas | `@pm` |
| `docs/design/executive-precision/` | Épica 7 | **AUSENTE** | Fontes canônicas do redesign Executive Precision não existem; sustenta a classificação histórico/supersedido (§5) | `@ux-design-expert` |
| `docs/diagnosis/form-audit-2026-06-04.md` | PRD modernização §1.3 | **AUSENTE** | Origem "Article IV" de requisitos de formulário do PRD de modernização não verificável | `@pm` |
| `docs/diagnosis/implementation-summary-2026-06-04.md` | PRD modernização §1.3 | **AUSENTE** | Registro de correções admin não verificável | `@pm` |
| `docs/design/apple-hig-application-plan-2026-05-26.md` | PRD modernização §1.3 | **AUSENTE** | Plano P0→P5 (auditoria de runtime) não verificável | `@ux-design-expert` |
| `docs/stories/2026-06-04-publication-readiness-portal-scope.md` | PRD modernização §1.3 e §4.1 | **AUSENTE** | Recorte de escopo de publicação (portais fora de escopo) não verificável como artefato | `@po` |
| `supabase/functions/auth-session/index.ts` | documentação histórica e contratos anteriores | **REMOVIDO POR DECISÃO ARQUITETURAL** | Endpoint legado não faz parte da superfície vigente; OpenAPI reconciliada (`docs/stories/2026-07-19-epic18-story3-restaurar-gates.md`; `npm run docs:api:check-drift` PASS) | `@dev` |

**Fontes citadas que EXISTEM** (confirmadas, sem ação): `docs/history/reports/BROWNFIELD-DISCOVERY-COMPLETE.md`, `docs/ARCHITECTURE.md`, `docs/architecture/system-architecture.md`, `docs/architecture/TECHNICAL-DEBT-REPORT.md`, `docs/database/SCHEMA.md`, `docs/api/openapi.yaml`, `docs/design/redesign/spec-admin-dashboard.md`, `docs/qa/gates/1.1-public-positioning-and-journey-clarity.yml`.

---

## 5. Supersessão do redesign (Executive Precision → Trust Keith)

| Camada | Estado verificado | Decisão desta reconciliação |
|---|---|---|
| **Épica 7 — Executive Precision** | Declarada COMPLETE, mas fontes canônicas `docs/design/executive-precision/` ausentes; tokens legados `--ea-*`/`--m3-*` aparecem apenas como compatibilidade | **HISTÓRICO / SUPERSEDIDO** — mantido como registro; **não** é identidade visual canônica |
| **Épicas 14–15 — Trust Keith** | Tokens/componentes `--tk-*` implementados, zero Mantine/Emotion (`purge:gate` PASS), rotas públicas e admin funcionais | **IDENTIDADE VISUAL CANÔNICA** do produto |

**Nota (escopo documental):** esta reconciliação **não altera a implementação visual**. A supersessão é uma decisão de documentação/governança. A restauração da prova visual reproduzível (canvas × rota) é objeto da **Story 18.2**.

---

## 6. Método de reprodução

- **Requisitos (30):** extraídos de `docs/prd/prd.md` §Requirements e §Compatibility Requirements sem renomear/fundir IDs.
- **Estados dos gates de qualidade atuais** (verificação 2026-08-12): `lint` PASS, `typecheck` PASS, `test:unit` 796/796 PASS, `build` PASS, `docs:api:check-drift` PASS em 16 rotas; `npm test` 184/184 PASS em ambiente Supabase isolado após a validação da agenda.
- **Existência de paths:** cada path citado como `ATENDIDO` foi confirmado por `find`/`ls`/`grep` no worktree (snapshot `06f9366`). Próximo passo operacional: `@data-engineer` executar `supabase db push` com credencial de projeto e registrar o resultado; esta matriz não declara o remoto como sincronizado.
- **Índice de stories:** ver `docs/stories/index.md`, regenerado do estado real de todos os arquivos `docs/stories/*.md`, incluindo as stories de 12/08.
