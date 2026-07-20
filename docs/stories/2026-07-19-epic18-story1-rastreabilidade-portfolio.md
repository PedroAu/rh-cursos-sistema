# Story 18.1: Consolidar PRD e rastreabilidade do portfólio

## Status

Done

## Executor Assignment

```yaml
executor: "@analyst"
quality_gate: "@pm"
quality_gate_tools: [research_validation, findings_review]
assignment_basis: "executor-assignment: research / assessment"
```

## Épica e rastreabilidade

- **Épica:** [Épica 18 — Consolidação de Produto, Redesign e Governança](../epics/epic-18-consolidacao-produto-redesign-governanca.md)
- **Prioridade:** P1
- **Tipo:** brownfield documental e investigativo
- **Valor:** recuperar uma fonte de verdade auditável entre requisitos, entregas e evidências, sem alterar o produto por inferência.
- **Dependência de entrada:** Épica 18 validada como estrutura de produto; não depende da Story 18.2.
- **Habilita:** Story 18.3, que consumirá a matriz e os gaps confirmados.

## Story

**As a** responsável pela governança de produto da RH Cursos,
**I want** reconciliar os PRDs, as Épicas 1–17, as stories e os gates em uma matriz canônica de rastreabilidade,
**so that** o estado entregue possa ser auditado sem requisitos inventados, links quebrados ou fechamentos sustentados apenas por inferência.

## Contexto e valor

O PRD brownfield ainda descreve uma épica única com Stories 1.1–1.6, enquanto o portfólio evoluiu até a Épica 17. A Story 1.1 possui artefato formal; as entregas previstas em 1.2–1.6 aparecem distribuídas em stories posteriores ou permanecem como gaps sem uma matriz de substituição formal. O índice de stories, atualizado em 2026-07-05, também não representa as stories mais recentes. Esta story consolida o histórico sem apagar decisões, reabrir épicas automaticamente ou converter ausência de evidência em entrega presumida. [Fonte: `docs/epics/epic-18-consolidacao-produto-redesign-governanca.md#diagnóstico-factual-que-originou-a-épica`]

## Acceptance Criteria

1. **Matriz completa de requisitos**
   **Given** FR1–FR16, NFR1–NFR10 e CR1–CR4 do PRD brownfield,
   **when** a matriz canônica é revisada,
   **then** os 30 requisitos aparecem exatamente uma vez, classificados como `ATENDIDO`, `PARCIAL`, `DIFERIDO` ou `NÃO ATENDIDO`, com evidência versionada, owner e próximo passo quando o estado não for `ATENDIDO`.

2. **Rastreabilidade das Épicas 1–17**
   **Given** os documentos de épica, stories e QA gates existentes,
   **when** a cobertura do portfólio é consolidada,
   **then** cada Épica 1–17 aponta para requisitos, stories e evidências vigentes ou registra explicitamente a fonte como `histórica`, `supersedida` ou `ausente`, sem link silenciosamente quebrado.

3. **Mapeamento formal das Stories 1.2–1.6**
   **Given** a decomposição original do PRD brownfield,
   **when** as Stories 1.2–1.6 são comparadas às entregas posteriores,
   **then** cada uma possui mapeamento para stories e gates verificáveis ou permanece declarada como gap, com a Story 1.1 preservada como artefato existente e sem criar equivalências por semelhança de nome.

4. **PRD mestre reconciliado e histórico preservado**
   **Given** `docs/prd/prd.md`, `docs/prd/modernizacao-ui-2026.md` e a evolução posterior,
   **when** a documentação de produto é atualizada,
   **then** o PRD mestre informa o estado real do portfólio, referencia a matriz e registra a relação entre o PRD de modernização e as épicas posteriores sem apagar requisitos, changelogs ou decisões históricas.

5. **Índice de stories regenerado do estado real**
   **Given** os arquivos presentes em `docs/stories/`,
   **when** `docs/stories/index.md` é regenerado,
   **then** data, totais, status, agrupamentos por épica e links derivam dos arquivos existentes, incluem Épicas 15–18, REC-* e Custom, e não mantêm contagens fixas sem evidência reproduzível.

6. **Fontes ausentes e supersessão visual explícitas**
   **Given** referências históricas como `docs/PHASE-B-PLAN.md`, fontes de baseline ausentes e a sucessão Executive Precision → Trust Keith,
   **when** a documentação é revisada,
   **then** toda ausência é registrada com impacto e owner, e o Trust Keith é identificado como identidade canônica enquanto Executive Precision permanece histórico/supersedido.

7. **Article IV — No Invention verificável**
   **Given** a matriz e as atualizações documentais,
   **when** `@pm` executa `research_validation` e `findings_review`,
   **then** toda afirmação de atendimento possui link para código, story, gate ou decisão vigente; ausência de evidência resulta em `PARCIAL`, `DIFERIDO` ou `NÃO ATENDIDO`, nunca em `ATENDIDO`.

8. **Escopo documental preservado**
   **Given** que esta é uma story de pesquisa e reconciliação,
   **when** o diff é revisado,
   **then** nenhum código funcional, schema, RLS, API, comportamento visual ou status de épica/story é alterado sem a autoridade e a evidência previstas; gaps encontrados são documentados para decisão posterior do `@po`/`@pm`.

## Tasks / Subtasks

- [x] **Task 1 — Congelar o inventário de requisitos e artefatos** (AC: 1, 2, 3)
  - [x] Extrair os 30 requisitos de `docs/prd/prd.md` sem renomear ou fundir IDs.
  - [x] Inventariar Épicas 1–17, stories e gates existentes, preservando o caminho real de cada artefato.
  - [x] Registrar arquivos referenciados mas ausentes, incluindo impacto na rastreabilidade.

- [x] **Task 2 — Construir a matriz canônica** (AC: 1, 2, 3, 7)
  - [x] Criar `docs/prd/traceability-matrix.md` com colunas para requisito, estado, épica, story, código, teste/gate, evidência, owner e próximo passo.
  - [x] Mapear Stories 1.2–1.6 individualmente; não usar cobertura agregada como substituto de evidência por story.
  - [x] Identificar contradições e lacunas sem resolvê-las por inferência.

- [x] **Task 3 — Reconciliar os documentos de produto** (AC: 4, 6, 8)
  - [x] Atualizar `docs/prd/prd.md` para apontar à matriz e refletir a evolução real, preservando seu histórico.
  - [x] Atualizar `docs/prd/modernizacao-ui-2026.md` somente onde necessário para registrar fontes ausentes/supersessão, sem reescrever requisitos encerrados.
  - [x] Registrar Executive Precision como histórico/supersedido e Trust Keith como baseline canônico, sem modificar a implementação visual.

- [x] **Task 4 — Regenerar o índice de stories** (AC: 5)
  - [x] Derivar totais e status a partir de `docs/stories/` no momento da execução.
  - [x] Incluir links relativos válidos para todas as stories catalogadas.
  - [x] Documentar o método usado para tornar a regeneração reproduzível.

- [x] **Task 5 — Validar findings e entregar ao gate de produto** (AC: 6, 7, 8)
  - [x] Verificar existência dos paths e links internos citados na matriz e nos documentos alterados.
  - [x] Executar `git diff --check` e registrar o resultado.
  - [x] Submeter matriz, gaps e decisões de classificação ao `@pm` por `research_validation` e `findings_review`.
  - [x] Atualizar checkboxes, Change Log e File List somente durante a execução autorizada da story.

## Dev Notes

### Fontes da verdade e estado observado

- O escopo exige a matriz `FR/NFR/CR → épica → story → código → teste/gate`, atualização do PRD mestre e do índice, e proíbe mudanças funcionais ou de status sem evidência. [Fonte: `docs/epics/epic-18-consolidacao-produto-redesign-governanca.md#escopo`]
- O PRD brownfield define FR1–FR16, NFR1–NFR10 e CR1–CR4; esses IDs são imutáveis para esta reconciliação. [Fonte: `docs/prd/prd.md#requirements` e `docs/prd/prd.md#compatibility-requirements`]
- O PRD de modernização mapeia as Épicas 1–6 e exige rastreabilidade ao baseline e gates comuns; ele deve ser preservado como origem histórica dessa frente. [Fonte: `docs/prd/modernizacao-ui-2026.md#roadmap-de-épicos` e `docs/prd/modernizacao-ui-2026.md#gates-de-qualidade-todos-os-épicos`]
- `docs/stories/index.md` declara atualização em 2026-07-05 e 35 stories; a Épica 18 registra que as stories posteriores não estão representadas. [Fonte: `docs/stories/index.md#stories-index`; `docs/epics/epic-18-consolidacao-produto-redesign-governanca.md#portfólio-e-prd`]
- `docs/PHASE-B-PLAN.md` e fontes históricas citadas no diagnóstico não estão presentes no worktree auditado; registrar a ausência, não recriar conteúdo desconhecido. [Fonte: `docs/epics/epic-18-consolidacao-produto-redesign-governanca.md#portfólio-e-prd`]
- A configuração define `docs/prd` como localização shardada de PRD e `docs/stories` como localização de stories; logs de decisão ficam em `docs/history/decisions/`. [Fonte: `.aiox-core/core-config.yaml#prd`, `.aiox-core/core-config.yaml#devStoryLocation` e `.aiox-core/core-config.yaml#decisionLogging`]

### Project Structure Notes

- A documentação canônica desta story permanece em `docs/prd/`, `docs/stories/`, `docs/epics/`, `docs/qa/gates/` e `docs/history/decisions/`.
- Não modificar `.aiox-core/**`, código em `app/`, `src/`, `supabase/` ou testes; referências a esses paths são evidências somente leitura.
- O output novo esperado é `docs/prd/traceability-matrix.md`; alterações nos demais documentos devem ser mínimas e rastreáveis.

## Testing

- Validar os 30 IDs sem duplicidade nem ausência.
- Validar que todos os links e paths citados existem ou estão marcados explicitamente como ausentes/históricos.
- Recontar stories e status diretamente dos arquivos; não copiar os totais antigos do índice.
- Revisar uma amostra de cada classificação contra o artefato de evidência e revisar 100% dos estados diferentes de `ATENDIDO`.
- Executar `git diff --check`.
- Gate obrigatório: `@pm` executa `research_validation` e `findings_review`, com veredito registrado.

## Dependências

- **Entrada:** Épica 18 em Draft, com estrutura aprovada pelo `@pm` para sharding.
- **Paralelismo:** pode executar em paralelo com 18.2.
- **Saída obrigatória para 18.3:** matriz canônica, lista de gaps/fontes ausentes e versão reconciliada do PRD/índice.

## Riscos e proibições

- **Proibido inventar evidência:** cobertura não demonstrada continua gap.
- **Proibido apagar histórico:** usar marcações `histórico`, `supersedido` ou `ausente`.
- **Proibido promover/reabrir status:** qualquer transição é decisão posterior do `@po`.
- **Proibido implementar remediação:** código, UI, API, auth, schema e RLS estão fora do escopo.
- **Risco:** contagens mudarem durante execução paralela. **Mitigação:** registrar data/SHA e derivar o índice no fechamento da story.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> A validação usará revisão manual por `@pm`, `research_validation` e `findings_review`.

## ClickUp Sync

- **Status:** indisponível nesta sessão; nenhum conector ClickUp callable foi fornecido.
- **Fonte canônica temporária:** este arquivo local em `docs/stories/`.
- **Impacto:** não bloqueia o Draft; a sincronização deverá ser realizada quando o conector estiver disponível.

## Story Draft Checklist — @sm

| Categoria | Resultado | Evidência |
|---|---|---|
| Goal & Context Clarity | PASS | Objetivo, valor e relação com a Épica 18 explícitos. |
| Technical Implementation Guidance | PASS | Outputs, paths, limites e método de classificação definidos. |
| Reference Effectiveness | PASS | Fontes específicas e relevância resumida em Dev Notes. |
| Self-Containment | PASS | Estados permitidos, assumptions, gaps e proibições definidos. |
| Testing Guidance | PASS | Validações quantitativas, links, diff e gate `@pm` definidos. |
| CodeRabbit Integration | N/A | Integração não habilitada no core config; notice incluído. |

**Readiness histórico:** este snapshot registrava `READY` antes do gate `@po`. Estado vigente: `Done`, após `research_validation` e `findings_review` PASS pelo `@pm`.

## PO Validation

**Data:** 2026-07-19  
**Validador:** `@po` (Pax)  
**Verdict:** **GO — 9.5/10**  
**Confiança:** Alta  
**Transição:** `Draft → Ready`

- Template, Executor Assignment e seções futuras de Dev/QA estão completos; `@analyst → @pm` respeita a matriz de autoridade.
- Os 8 ACs são mensuráveis, cobrem os 30 requisitos e possuem tarefas ligadas a todos os critérios.
- Paths, fontes e afirmações centrais foram confrontados com o PRD, a Épica 18 e o core config; não foi encontrada decisão técnica inventada.
- O escopo documental está bem cercado: não permite alteração funcional, promoção de status ou equivalência de requisitos sem evidência.
- CodeRabbit está corretamente tratado como N/A, com fallback manual explícito.

**Observação não bloqueante:** durante a execução, registrar data e SHA da geração da matriz/índice para impedir divergência causada por stories criadas em paralelo.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-19 | 0.1 | Draft criado a partir da Épica 18, com ACs testáveis, rastreabilidade e gates de pesquisa/produto. | `@sm` (River) |
| 2026-07-19 | 0.2 | Validação PO GO 9.5/10; story promovida de Draft para Ready. | `@po` (Pax) |
| 2026-07-19 | 0.3 | Execução da story: matriz canônica criada, PRDs e índice reconciliados, tasks concluídas, `git diff --check` limpo. Status inalterado (aguarda gate `@pm`). | `@analyst` |
| 2026-07-19 | 0.4 | Gate de produto concluído: `research_validation` e `findings_review` PASS; 30 requisitos e gaps validados sem invenção; story promovida de Ready para Done. | `@pm` (Morgan) |

> **Gate `@pm` concluído** — matriz, gaps e classificações aprovados em `research_validation` e `findings_review`; Story 18.1 concluída.

## Dev Agent Record

### Agent Model Used

`@analyst` (Opus 4.8) — execução documental/investigativa da Story 18.1.

### Debug Log References

- Geração da matriz/índice congelada no SHA `b86d07e` (branch `main`), data 2026-07-19.
- Estados de gate atuais reportados conforme Épica 18 §3/§4 (não reexecutados nesta story documental; reexecução é escopo da Story 18.3).
- `git diff --check`: **limpo (exit 0)**.
- Verificação de existência de paths/gates citados: OK. Exceção registrada: `rec-403` tem story `Done` mas **sem arquivo de gate dedicado** em `docs/qa/gates/` — corrigido na matriz para citar a story + gate `rec-404`.

### Completion Notes List

- Matriz canônica criada em `docs/prd/traceability-matrix.md` cobrindo os 30 requisitos (FR1–FR16, NFR1–NFR10, CR1–CR4) exatamente uma vez cada: **23 `ATENDIDO`, 5 `PARCIAL` (FR16, NFR4, NFR9, CR1, CR4), 2 `DIFERIDO` (FR12, FR14), 0 `NÃO ATENDIDO`**.
- Épicas 1–17 rastreadas com fonte vigente/histórica/ausente. Épica 7 (Executive Precision) marcada **histórico/supersedido**; Épicas 14–15 (Trust Keith) confirmadas como **identidade canônica**. Nenhuma implementação visual foi alterada.
- Stories 1.2–1.6 mapeadas individualmente: só a **1.1** tem artefato formal; 1.2–1.6 registradas como *entrega em código + GAP de artefato formal* (sem equivalência por nome), para decisão do `@po`/`@pm`.
- Fontes ausentes registradas com impacto e owner (§4 da matriz): `docs/PHASE-B-PLAN.md`, `docs/design/executive-precision/`, as 4 fontes do §1.3 do PRD de modernização, e o drift de `auth-session` na OpenAPI. Nenhum conteúdo recriado (Article IV).
- `docs/stories/index.md` regenerado do estado real: snapshot intermediário **104 stories** (98 Done, 4 Ready, 1 In Progress, 1 Draft); estado vigente após fechamento 18.2/18.3: **104 stories** (101 Done, 1 Ready, 1 In Progress, 1 Draft), com método de reprodução documentado. O índice anterior declarava 35 stories e data 2026-07-05.
- `docs/prd/prd.md` e `docs/prd/modernizacao-ui-2026.md` atualizados apenas com ponteiro à matriz, estado real e registro de ausências/supersessão; changelogs e requisitos históricos preservados.
- **Escopo documental preservado:** nenhum código funcional, schema, RLS, API ou comportamento visual foi alterado por esta story. O campo Status foi promovido de `Ready` para `Done` no fechamento registrado pelo gate `@pm`.

### File List

- **Criado:** `docs/prd/traceability-matrix.md`
- **Modificado:** `docs/prd/prd.md` (ponteiro à matriz + nota de estado + changelog 0.2)
- **Modificado:** `docs/prd/modernizacao-ui-2026.md` (registro de fontes ausentes §1.3 + nota de supersessão)
- **Modificado (regenerado):** `docs/stories/index.md`
- **Modificado:** `docs/stories/2026-07-19-epic18-story1-rastreabilidade-portfolio.md` (checkboxes, Dev Agent Record, Change Log)

## PM Quality Gate

**Data:** 2026-07-19  
**Validador:** `@pm` (Morgan)  
**Ferramentas:** `research_validation`, `findings_review`  
**Verdict:** **PASS**  
**Confiança:** Alta

### Research Validation

- Os 30 requisitos canônicos aparecem exatamente uma vez: FR1–FR16, NFR1–NFR10 e CR1–CR4; nenhuma ausência ou duplicidade foi encontrada.
- As 23 classificações `ATENDIDO` possuem referência verificável a código, story, gate ou decisão vigente.
- Os 5 itens `PARCIAL` e 2 `DIFERIDO` possuem owner e próximo passo explícitos; nenhuma lacuna foi promovida a atendimento por semelhança ou inferência.
- As Épicas 1–17, as Stories 1.2–1.6, as fontes ausentes e a supersessão Executive Precision → Trust Keith estão registradas com impacto e proveniência.

### Findings Review

- `docs/prd/prd.md` e `docs/prd/modernizacao-ui-2026.md` preservam requisitos, changelogs e decisões históricas, adicionando somente a reconciliação necessária.
- `docs/stories/index.md` foi derivado dos 104 arquivos presentes no baseline registrado e inclui Épicas 15–18, REC-* e Custom.
- Verificação dos links Markdown dos quatro documentos reconciliados: nenhum link quebrado.
- `git diff --check`: limpo (exit 0).
- Diff da story permanece exclusivamente documental; nenhuma remediação funcional, schema, RLS, API ou UI foi introduzida.

**Decisão:** AC1–AC8 atendidos. A matriz e os gaps estão aptos a serem consumidos pela Story 18.3.

## Handoff

- **Próximo agente:** `@dev` (Story 18.3, após a conclusão da Story 18.2)
- **Ação:** consumir a matriz canônica e os gaps confirmados ao restaurar os gates automatizados.
- **Condição:** manter as classificações desta story até que nova evidência executável justifique alteração.
