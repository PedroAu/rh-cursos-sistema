# Story 14.0.1: Inventario do Design System Trust Keith

## Status
Done

## Executor Assignment

executor: "@analyst"  
executor_model: "haiku" (tarefa documental reduzida — conforme alocação de modelos da Epic 14, seção 5)  
quality_gate: "@po"  
quality_gate_tools:
- review documental de `docs/design-system/trust-keith/INVENTORY.md`
- validacao de rastreabilidade contra `ds-package/_ds_manifest.json`
- checagem de cobertura dos tokens finais RH com remap `.rh2`

## Epic
EPIC 14 - Redesign Trust Keith: Fidelidade Total + Remocao do Mantine  
Source: `docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md`

## Story

**As a** time de redesign e implementacao,  
**I want** um inventario completo do Design System Trust Keith adaptado para RH Cursos,  
**so that** as stories de tokens, componentes e paginas possam implementar fidelidade visual sem reabrir os bundles de referencia a cada tarefa.

## Acceptance Criteria

1. `docs/design-system/trust-keith/INVENTORY.md` existe e lista todos os componentes declarados em `docs/design-system/trust-keith/ds-package/_ds_manifest.json`, incluindo nome, categoria, sourcePath e uso esperado no redesign RH.
2. O inventario documenta o mapa de tokens finais do site: tokens base `--tk-*` do `ds-package` + remap RH `.rh2` dos canvases (`--tk-brand/--tk-cta: #0c6a83`, `--tk-accent: #1791a9`, `--tk-accent-soft: #e0f2f6`) e explicita que `#235875` nao deve ser usado como brand final do site RH.
3. O inventario cobre as familias de tokens relevantes para implementacao: cores, tipografia, espacamento, raios, sombras, foco, motion/durations e containers, com referencias aos arquivos CSS de origem.
4. O inventario mapeia os canvases de referencia em `public/*.dc.html` para as rotas Next.js e views atuais listadas na epic, incluindo Home Sections como complemento da home.
5. O inventario registra assets definitivos e temporarios: `public/images/brand/logo-horizontal.png` como logo final, `public/uploads/logoHorizontal_800X600.png` e, historicamente, `_ds/`, `support.js` e `.dc.html` como apoio de renderizacao de referencia; apos a 14.3.3, esses artefatos de canvas foram preservados em `docs/design/redesign/reference/canvases/` e `docs/design/redesign/wireframes/`.
6. O inventario identifica os gaps que precisam de decisao posterior sem resolve-los nesta story: licenca/self-host de Fraunces, destino final dos canvases/bundles fora de deploy e eventual divergencia entre placeholders dos canvases e dados reais.
7. O conteudo e autossuficiente para alimentar as stories 14.0.3, 14.0.4 e 14.0.5, com uma secao "Handoff para proximas stories" contendo entradas objetivas para arquitetura, tokens e componentes.

## Scope

### In Scope

- Criar `docs/design-system/trust-keith/INVENTORY.md`.
- Ler e consolidar informacoes ja presentes no repositorio.
- Documentar componentes, tokens, canvases, assets e riscos/gaps.
- Citar as fontes locais usadas em cada bloco do inventario.

### Out of Scope

- Implementar tokens em `src/design-tokens/tokens.css`.
- Criar ou alterar componentes React.
- Remover Mantine.
- Mover, deletar ou editar canvases/bundles de `public/`.
- Tomar decisao arquitetural sobre fonte Fraunces; isso pertence a 14.0.3.

## Tasks / Subtasks

- [x] Inventariar fontes locais do DS (AC: 1, 3)
  - [x] Ler `docs/design-system/trust-keith/ds-package/_ds_manifest.json`.
  - [x] Ler `docs/design-system/trust-keith/ds-package/readme.md`.
  - [x] Ler `docs/design-system/trust-keith/DESIGN.md`.
  - [x] Ler `docs/design-system/trust-keith/ds-package/tokens/*.css`.
- [x] Criar mapa de componentes (AC: 1)
  - [x] Separar core, data e navigation conforme o manifest.
  - [x] Registrar sourcePath e funcao esperada no redesign RH.
  - [x] Marcar componentes que viram primitivas em `src/components/ui/` na 14.0.5.
- [x] Criar mapa de tokens finais RH (AC: 2, 3)
  - [x] Listar tokens base `--tk-*` por familia.
  - [x] Registrar remap `.rh2` aplicado pelos canvases.
  - [x] Destacar a regra: tokens finais do site = base Trust Keith + remap RH.
- [x] Mapear canvases, rotas e views (AC: 4)
  - [x] Home: `RH Cursos Home.dc.html` e `RH Home Sections.dc.html` -> `/` -> `src/views/public/Home.tsx`.
  - [x] Catalogo: `RH Cursos Catálogo.dc.html` -> `/cursos` -> `src/views/public/Courses.tsx`.
  - [x] Agenda: `RH Cursos Agenda.dc.html` -> `/agenda` -> `src/views/public/Agenda.tsx`.
  - [x] In-company: `RH Cursos In-company.dc.html` -> `/in-company` -> `src/views/public/InCompany.tsx`.
  - [x] Quem Somos: `RH Cursos Quem Somos.dc.html` -> `/sobre` -> `src/views/public/About.tsx`.
  - [x] Blog: `RH Cursos Blog.dc.html` -> `/blog` -> `src/views/public/Blog.tsx`.
- [x] Registrar assets e temporarios (AC: 5)
  - [x] Confirmar logo final em `public/images/brand/logo-horizontal.png`.
  - [x] Separar assets temporarios de referencia dos assets finais do site.
- [x] Documentar gaps e handoff (AC: 6, 7)
  - [x] Criar secao de decisoes pendentes para 14.0.3.
  - [x] Criar handoff para 14.0.4 tokens.
  - [x] Criar handoff para 14.0.5 componentes.
- [x] Validar o inventario (AC: 1-7)
  - [x] Conferir que todos os componentes do manifest aparecem no markdown.
  - [x] Conferir que todas as rotas/canvases da epic aparecem no markdown.
  - [x] Executar uma revisao de links/paths locais.

## Complexity Estimate

**XS — 1 ponto.** Tarefa documental de consolidação: todas as fontes já estão no repo (ds-package, DESIGN.md, canvases); nenhuma alteração de código.

## Dependencies

- `docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md`
- `docs/design-system/trust-keith/DESIGN.md`
- `docs/design-system/trust-keith/ds-package/_ds_manifest.json`
- `docs/design-system/trust-keith/ds-package/readme.md`
- `docs/design-system/trust-keith/ds-package/tokens/colors.css`
- `docs/design-system/trust-keith/ds-package/tokens/typography.css`
- `docs/design-system/trust-keith/ds-package/tokens/spacing.css`
- `docs/design-system/trust-keith/ds-package/tokens/effects.css`
- `docs/design-system/trust-keith/ds-package/tokens/fonts.css`
- `public/*.dc.html`
- `public/images/brand/logo-horizontal.png`

## Dev Notes

- Esta story e documental e deve ser executada por @analyst; nao deve alterar codigo de app.
- A epic declara que o DS ja foi extraido e copiado para o repo; o trabalho restante e gerar `INVENTORY.md`.
- O DS base usa `--tk-brand: #235875`, mas os canvases RH aplicam remap de marca via `.rh2`: `--tk-brand` e `--tk-cta` para `#0c6a83`, `--tk-accent` para `#1791a9`, `--tk-accent-soft` para `#e0f2f6`. Essa regra e critica para evitar regressao visual azul Trust Keith no site RH.
- `docs/design-system/trust-keith/ds-package/_ds_manifest.json` lista 13 componentes: Avatar, Badge, Button, Card, Checkbox, Input, Logo, Switch, FeatureListItem, ProgressBar, StatBlock, Testimonial e NavBar.
- Os canvases grandes em `public/*.dc.html` sao referencia temporaria de desenvolvimento. A story 14.3.3 sera responsavel pela limpeza/movimentacao para fora do deploy.
- O projeto usa Next.js 16, React 19, Tailwind 3, Radix UI, cva, lucide-react, framer-motion, sonner e zod. Mantine ainda existe no codigo atual e sera removido nas stories 14.1.x.
- Arquivos esperados pelo core config em `docs/framework/*` nao existem nesta instalacao; use os fallbacks/documentos reais: `docs/architecture/system-architecture.md`, `docs/design-system/trust-keith/*` e a epic 14.
- ClickUp nao foi sincronizado nesta sessao porque nao ha ferramenta ClickUp ativa no ambiente atual. A story local permanece valida.

## Project Structure Notes

- O output desta story fica em `docs/design-system/trust-keith/INVENTORY.md`, alinhado ao pacote DS ja existente.
- Nao criar arquivos em `.aiox-core/`.
- Nao modificar `public/` nesta story; apenas referenciar os canvases e assets existentes.
- Nao modificar `src/`; implementacao em app comeca nas stories 14.0.4 e 14.0.5.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: N/A por configuracao do projeto
>
> `.aiox-core/core-config.yaml` nao define `coderabbit_integration.enabled`.
> Aplicam-se revisao manual e os quality gates declarados nesta story.

## Testing

- Conferencia documental: todos os componentes de `_ds_manifest.json` aparecem em `INVENTORY.md`.
- Conferencia documental: todos os arquivos `public/*.dc.html` relevantes aparecem mapeados para rota/view.
- Conferencia documental: remap RH `.rh2` aparece explicitamente e com os valores corretos.
- Conferencia de paths locais: os arquivos citados existem no repositorio.
- Quality gate recomendado:
  - `rg "Avatar|Badge|Button|Card|Checkbox|Input|Logo|Switch|FeatureListItem|ProgressBar|StatBlock|Testimonial|NavBar" docs/design-system/trust-keith/INVENTORY.md`
  - `rg "#0c6a83|#1791a9|#e0f2f6|#235875" docs/design-system/trust-keith/INVENTORY.md`

## File List

- `docs/stories/2026-07-02-epic14-story0-1-trust-keith-inventory.md`
- `docs/design-system/trust-keith/INVENTORY.md` (criado — 7 seções, ~250 linhas)

## Dev Agent Record

### Agent Model Used

@aiox-master (Orion) executando task do @analyst em modo YOLO — sessão Claude (Fable 5), 2026-07-02.

### Debug Log References

Quality gate executado inline (ver QA Results).

### Completion Notes List

- `INVENTORY.md` criado com: regra crítica de marca (base + remap `.rh2`), mapa completo de tokens por família (cores, tipografia, espaçamento, raios, sombras, foco, motion, gradientes, containers), 13 componentes do manifest classificados com decisão de primitiva para 14.0.5, 6 padrões compostos dos canvases (`rh-chip`, `rh-jchip`, `rh-coursecard`, `rh-paper`, `rh-tag`, `rh-nav`), mapa canvas→rota→view, assets definitivos vs temporários, 4 gaps (G1–G4) e handoff objetivo para 14.0.3/14.0.4/14.0.5.
- Componente `Logo` do DS marcado como **não usar** (logo RH próprio já disponível).
- Adicionados ao inventário 2 gaps além dos 3 previstos no AC6: G4 (self-host de Merriweather/Inter/Caveat via `next/font`).

## QA Results

**Gate documental (2026-07-02) — PASS.** Comandos da seção Testing executados:

- 13/13 componentes do manifest presentes no INVENTORY.md ✅
- 4/4 cores de referência presentes (`#0c6a83`, `#1791a9`, `#e0f2f6`, `#235875` — este último apenas como base a NÃO usar) ✅
- 7/7 canvases mapeados para rota/view ✅
- Paths citados existem no repo (tokens CSS, logo) ✅
- AC 1–7: todos atendidos.

## Story Draft Checklist Validation

| Category | Status | Issues |
| --- | --- | --- |
| 1. Goal & Context Clarity | PASS | Objetivo e relacao com Epic 14 estao explicitos. |
| 2. Technical Implementation Guidance | PASS | Paths, fontes e output esperados estao listados. |
| 3. Reference Effectiveness | PASS | Referencias apontam para arquivos locais especificos. |
| 4. Self-Containment Assessment | PASS | Regras criticas de remap, escopo e gaps foram incorporadas. |
| 5. Testing Guidance | PASS | Validacoes documentais e comandos `rg` foram definidos. |
| 6. CodeRabbit Integration (conditional) | N/A | `coderabbit_integration.enabled` nao esta configurado. |

**Final Assessment:** READY for @po validation, then @analyst execution.

## PO Validation (validate-story-draft)

**Data:** 2026-07-02 · **Validador:** @po (Pax) · **Veredito:** **GO — 10/10**

| # | Critério | Status | Evidência |
|---|---|---|---|
| 1 | Título claro e objetivo | PASS | Identifica story, épico e entregável |
| 2 | Descrição completa | PASS | User story com problema/necessidade explícitos |
| 3 | ACs testáveis | PASS | 7 ACs com verificação documental + comandos `rg` |
| 4 | Escopo IN/OUT definido | PASS | Out of Scope protege `src/`, `public/` e decisão Fraunces |
| 5 | Dependências mapeadas | PASS | 17 paths conferidos — todos existem no repo |
| 6 | Estimativa de complexidade | PASS | XS/1 ponto (adicionada nesta validação) |
| 7 | Valor de negócio | PASS | Evita reabrir bundles a cada story de implementação |
| 8 | Riscos documentados | PASS | AC6: Fraunces, destino dos canvases, placeholders vs dados reais |
| 9 | Criteria of Done | PASS | Seção Testing + quality gate com comandos objetivos |
| 10 | Alinhamento com PRD/Épico | PASS | Remap `.rh2`, 13 componentes e mapa rota/view idênticos à Epic 14 |

**Ação:** Status Draft → Ready. Liberada para execução por @analyst (modelo haiku).

## Change Log

- 2026-07-02 - @sm (River) - Draft inicial da story 14.0.1 criado a partir da Epic 14 e dos artefatos Trust Keith existentes.
- 2026-07-02 - @po (Pax) - Validação 10/10 GO. Adicionados Complexity Estimate (XS/1) e executor_model (haiku). Status: Draft → Ready.
- 2026-07-02 - @aiox-master (Orion) - Execução YOLO da task do @analyst: `INVENTORY.md` criado, gate documental PASS (13 componentes, remap, 7 canvases, paths). Status: Ready → InReview. Done pende de commit/push via @devops.
