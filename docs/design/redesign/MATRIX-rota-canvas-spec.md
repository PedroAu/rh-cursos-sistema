# Matriz rota × canvas × spec — Épicas 14 (público) e 15 (admin)

**Story:** 18.2 · **Executor:** `@ux-design-expert` · **Data:** 2026-07-19 · **SHA base:** `b86d07e`

Inventário de cobertura de fidelidade de todas as rotas cobertas pelas Épicas 14 e 15.
Fonte dos canvases: `docs/design-system/*.dc.html`. Fonte de specs de página:
`docs/design/redesign/`. Verdicts do harness: `artifacts/epic14-fidelity/manifest.json`.

**Legenda de status de cobertura**
- `COBERTO*` — canvas de referência existe e foi renderizado pelo harness; **CONCERNS** por exigir revisão visual manual (o harness não afirma PASS pixel-a-pixel).
- `NOT_ASSESSABLE` — sem referência utilizável para a rota (canvas ou auth ausente).
- `EXCEÇÃO` — rota sem canvas por decisão de escopo (reskin de coerência, sem canvas dedicado); registrada com owner.

**Viewports de referência**
- Público: **1180px** (ADR-014 §D6).
- Admin: **1360px** (`spec-admin-dashboard.md`, largura `.adm` de referência).

---

## 1. Rotas públicas — Épica 14

| # | Rota | Canvas de referência | Spec de página | Viewport | Auth | Estado/dados | Cobertura | Verdict harness | Exceção / owner |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `/` | `RH Cursos Home.dc.html` (+ `RH Home Sections.dc.html`) | ausente | 1180 | pública | SSR conteúdo público | COBERTO* | CONCERNS | Spec pública ausente → **F-SPEC-01** (`@po`) |
| 2 | `/cursos` | `RH Cursos Catálogo.dc.html` | ausente | 1180 | pública | catálogo público | COBERTO* | CONCERNS | F-SPEC-01 (`@po`) |
| 3 | `/cursos/[slug]` | `RH Cursos Curso.dc.html` | ausente | 1180 | pública | **slug dinâmico** — proxy `/cursos` na captura | COBERTO* (canvas) / rota parcial | CONCERNS | Fixture de slug ausente → **F-CAP-02** (`@po`) |
| 4 | `/cursos/[slug]/checkout` | `RH Cursos Checkout.dc.html` | ausente | 1180 | pública | **slug dinâmico** — proxy `/cursos` na captura | COBERTO* (canvas) / rota parcial | CONCERNS | Fixture de checkout ausente → F-CAP-02 (`@po`) |
| 5 | `/agenda` | `Agenda export.dc.html` | ausente | 1180 | pública | agenda pública | COBERTO* | CONCERNS | F-SPEC-01 (`@po`) |
| 6 | `/in-company` | `RH Cursos In-company.dc.html` | ausente | 1180 | pública | form in-company | COBERTO* | CONCERNS | F-SPEC-01 (`@po`) |
| 7 | `/sobre` | `RH Cursos Quem Somos.dc.html` | ausente | 1180 | pública | estático | COBERTO* | CONCERNS | F-SPEC-01 (`@po`) |
| 8 | `/blog` | `RH Cursos Blog.dc.html` | ausente | 1180 | pública | lista de posts | COBERTO* | CONCERNS | F-SPEC-01 (`@po`) |
| 9 | `/login` | `RH Cursos Login.dc.html` | ausente | 1180 | pública | card centralizado | COBERTO* | CONCERNS | F-SPEC-01 (`@po`) |
| 10 | `/blog/[slug]` | — | ausente | 1180 | pública | post individual | EXCEÇÃO | — | Sem canvas dedicado; reskin de coerência (story 14.2.7). Owner `@po` |
| 11 | `/consultoria` | — | ausente | 1180 | pública | estático | EXCEÇÃO | — | Sem canvas; reskin coerência 14.2.7. Owner `@po` |
| 12 | `/contato` | — | ausente | 1180 | pública | form contato | EXCEÇÃO | — | Sem canvas; reskin coerência 14.2.7. Owner `@po` |
| 13 | `/falar-com-especialista` | — | ausente | 1180 | pública | form | EXCEÇÃO | — | Sem canvas (rota nova Épica 7 §dec.5). Owner `@po` |
| 14 | `/inscricao-confirmada` | — | ausente | 1180 | pública | confirmação | EXCEÇÃO | — | Sem canvas. Owner `@po` |
| 15 | `/aluno` | — | ausente | 1180 | autenticada (aluno) | portal do aluno | EXCEÇÃO | — | Sem canvas; portal fora do escopo dos canvases públicos. Owner `@po` |
| 16 | `/instrutor` | — | ausente | 1180 | autenticada (instrutor) | portal do instrutor | EXCEÇÃO | — | Sem canvas. Owner `@po` |

---

## 2. Rotas administrativas — Épica 15

O arquivo `RH Cursos Admin Dashboard.dc.html` contém **10 telas** (Dashboard + 9). Apenas a
tela **Dashboard** possui spec (`spec-admin-dashboard.md`) e é isolável como referência de
página. As demais 9 telas existem no mesmo arquivo mas **não foram exportadas como canvas
independente** e **não têm spec** — a própria spec declara que exigem specs próprias.

| # | Rota | Canvas de referência | Spec de página | Viewport | Auth | Estado/dados | Cobertura | Verdict harness | Exceção / owner |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `/admin` (Dashboard) | `RH Cursos Admin Dashboard.dc.html` (tela Dashboard) | `spec-admin-dashboard.md` | 1360 | admin (SSR) | KPIs/atividades | COBERTO* (canvas) / rota bloqueada | CONCERNS | Rota redireciona p/ `/login` sem auth SSR → **F-AUTH-03** (Story 18.3) |
| 2 | `/admin/cursos` | mesma `.dc.html` (tela Cursos) | ausente | 1360 | admin (SSR) | tabela cursos | NOT_ASSESSABLE | — | Sem canvas isolado nem spec → **F-SPEC-04** (`@po`); auth F-AUTH-03 |
| 3 | `/admin/turmas` | mesma `.dc.html` (tela Turmas) | ausente | 1360 | admin (SSR) | tabela turmas | NOT_ASSESSABLE | — | F-SPEC-04 (`@po`); F-AUTH-03 |
| 4 | `/admin/inscricoes` (Matrículas) | mesma `.dc.html` (tela Matrículas) | ausente | 1360 | admin (SSR) | tabela matrículas | NOT_ASSESSABLE | — | F-SPEC-04 (`@po`); F-AUTH-03 |
| 5 | `/admin/alunos` | mesma `.dc.html` (tela Alunos) | ausente | 1360 | admin (SSR) | tabela alunos | NOT_ASSESSABLE | — | F-SPEC-04 (`@po`); F-AUTH-03 |
| 6 | `/admin/instrutores` | mesma `.dc.html` (tela Instrutores) | ausente | 1360 | admin (SSR) | tabela instrutores | NOT_ASSESSABLE | — | F-SPEC-04 (`@po`); F-AUTH-03 |
| 7 | `/admin/leads` | mesma `.dc.html` (tela Leads) | ausente | 1360 | admin (SSR) | tabela leads | NOT_ASSESSABLE | — | F-SPEC-04 (`@po`); F-AUTH-03 |
| 8 | `/admin/blog` | mesma `.dc.html` (tela Blog) | ausente | 1360 | admin (SSR) | gestão blog | NOT_ASSESSABLE | — | F-SPEC-04 (`@po`); F-AUTH-03 |
| 9 | `/admin/paginas` | mesma `.dc.html` (tela Páginas) | ausente | 1360 | admin (SSR) | gestão páginas | NOT_ASSESSABLE | — | F-SPEC-04 (`@po`); F-AUTH-03 |
| 10 | `/admin/configuracoes` | mesma `.dc.html` (tela Configurações) | ausente | 1360 | admin (SSR) | settings | NOT_ASSESSABLE | — | F-SPEC-04 (`@po`); F-AUTH-03 |

> **Gate histórico:** `docs/qa/gates/epic15-complete-fidelity.yml` declarou 100/100 para o admin.
> Esta story **não apaga** esse gate, mas registra que a reprodutibilidade atual é
> **NOT_ASSESSABLE** para 9/10 telas admin (sem canvas isolado/spec) e **CONCERNS + F-AUTH-03**
> para o Dashboard (auth SSR bloqueia a captura da rota).

---

## 3. Resumo de cobertura

| Grupo | Total rotas | COBERTO* (CONCERNS) | NOT_ASSESSABLE | EXCEÇÃO |
|---|---:|---:|---:|---:|
| Público (Épica 14) | 16 | 9 | 0 | 7 |
| Admin (Épica 15) | 10 | 1 | 9 | 0 |
| **Total** | **26** | **10** | **9** | **7** |

**Nenhuma rota é classificada como PASS de fidelidade.** Toda rota com canvas resulta em
CONCERNS (pendente de sign-off visual manual) e toda rota sem referência é NOT_ASSESSABLE ou
EXCEÇÃO com owner — nenhum smoke test é tratado como prova visual.

## 4. Findings referenciados

Detalhados em `docs/design/redesign/AUDIT-epic18-story2-fidelity.md`:
- **F-SPEC-01** — specs públicas prometidas pela story 14.0.2 ausentes (owner `@po`).
- **F-CAP-02** — captura de rota de detalhe/checkout usa proxy por falta de fixture de slug (owner `@po`).
- **F-AUTH-03** — admin não capturável sem contrato de auth SSR (owner Story 18.3).
- **F-SPEC-04** — 9 telas admin sem canvas isolado nem spec (owner `@po`).
