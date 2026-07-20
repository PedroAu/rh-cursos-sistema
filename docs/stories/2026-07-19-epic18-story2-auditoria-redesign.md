# Story 18.2: Auditar e restaurar a prova do redesign

## Status

Done

## Executor Assignment

```yaml
executor: "@ux-design-expert"
quality_gate: "@dev"
quality_gate_tools: [accessibility_check, design_review, component_validation]
assignment_basis: "executor-assignment: ui_ux"
```

## Épica e rastreabilidade

- **Épica:** [Épica 18 — Consolidação de Produto, Redesign e Governança](../epics/epic-18-consolidacao-produto-redesign-governanca.md)
- **Prioridade:** P1
- **Tipo:** auditoria UX/UI brownfield e restauração de evidência reproduzível
- **Valor:** distinguir implementação estrutural de fidelidade visual comprovada e tornar o verdict reproduzível.
- **Dependência de entrada:** ADR-014 e artefatos das Épicas 14 e 15; não depende da Story 18.1.
- **Habilita:** Story 18.3 e eventuais remediações visuais separadas, somente quando sustentadas por finding objetivo.

## Story

**As a** responsável pela qualidade visual e acessibilidade da RH Cursos,
**I want** consolidar o Trust Keith como baseline canônico e restaurar a comparação reproduzível entre rotas, canvases e specs,
**so that** fidelidade, responsividade e acessibilidade sejam avaliadas por evidência objetiva, e não por smoke tests ou declarações históricas.

## Contexto e valor

O Trust Keith está implementado estruturalmente por tokens `--tk-*`, componentes Radix/Tailwind/cva e purga de Mantine/Emotion. Entretanto, `scripts/capture-epic14-fidelity.mjs` mantém `canvasPaths: []` para todos os alvos e o manifesto atual aceita capturas de rota sem referência. Os canvases continuam presentes em `docs/design-system/`, mas as specs públicas prometidas pela Story 14.0.2 não estão disponíveis em `docs/design/redesign/`; apenas a spec do dashboard admin foi localizada. O objetivo é restaurar a prova, não iniciar um terceiro redesign. [Fonte: `docs/epics/epic-18-consolidacao-produto-redesign-governanca.md#evidência-atual-do-redesign`]

## Acceptance Criteria

1. **Decision log da linha visual canônica**
   **Given** a Épica 7, o ADR-014 e as Épicas 14–15,
   **when** a decisão visual é documentada,
   **then** Executive Precision aparece como histórico/supersedido, Trust Keith como baseline canônico, tokens legados apenas como compatibilidade quando comprovados, e não existem duas identidades declaradas simultaneamente como vigentes.

2. **Matriz completa rota × canvas × spec**
   **Given** todas as rotas cobertas pelas Épicas 14 e 15,
   **when** o inventário é concluído,
   **then** cada rota pública e administrativa possui canvas, spec ou referência identificada, viewport, estado de autenticação/dados e status de cobertura; ausência de referência possui exceção formal, owner e impacto no verdict.

3. **Captura lado a lado reproduzível**
   **Given** uma rota com referência disponível,
   **when** `npm run test:epic14:fidelity:capture` ou seu harness consolidado é executado,
   **then** ele gera screenshots de rota e referência no mesmo viewport, registra ambos no manifesto e não classifica como PASS um alvo com `canvasAvailable: false`, referência ilegível ou captura HTTP inválida.

4. **Manifesto com verdict explícito**
   **Given** as capturas geradas,
   **when** o manifesto é revisado,
   **then** cada alvo distingue `PASS`, `CONCERNS`, `FAIL` ou `NOT_ASSESSABLE`, inclui paths das evidências, adaptações permitidas e motivo; simples disponibilidade da página não equivale a fidelidade.

5. **Auditoria de risco visual e acessível**
   **Given** a matriz de cobertura,
   **when** a auditoria é executada,
   **then** a amostra de risco inclui superfícies públicas e admin em desktop e mobile, `prefers-reduced-motion`, teclado/foco e WCAG 2.1 A/AA por axe, com viewport e fixture determinísticos registrados.

6. **Findings acionáveis e sem remediação especulativa**
   **Given** qualquer divergência encontrada,
   **when** o relatório é publicado,
   **then** cada finding possui severidade, rota, referência, screenshot/diff, impacto, recomendação e owner; nenhuma UI é alterada nesta story sem diff objetivo e aprovação de escopo posterior pelo `@po`.

7. **Contratos funcionais do redesign preservados**
   **Given** os invariantes das Épicas 5 e 14,
   **when** o harness é alterado e executado,
   **then** busca local, reduced-motion, imagens, forms, rotas e ausência de Mantine/Emotion continuam cobertos; a suíte executa quantidade maior que zero e propaga falhas.

8. **Gates técnicos do redesign registrados**
   **Given** a auditoria concluída,
   **when** `accessibility_check`, `design_review` e `component_validation` são executados,
   **then** os resultados de a11y, responsividade, tokens `--tk-*`, `npm run purge:gate` e `npm run bundle:check` ficam anexados ao relatório com SHA/data e sem declarar PASS para check não executado.

## Tasks / Subtasks

- [x] **Task 1 — Registrar a sucessão de identidade visual** (AC: 1)
  - [x] Comparar a documentação da Épica 7 com ADR-014 e Épicas 14–15.
  - [x] Criar decision log em `docs/history/decisions/` preservando o histórico e declarando Trust Keith como baseline.
  - [x] Listar tokens legados ainda presentes e classificá-los como compatibilidade ou finding, sem removê-los nesta story.

- [x] **Task 2 — Inventariar superfícies e referências** (AC: 2, 5)
  - [x] Mapear rotas públicas da Épica 14 para os `.dc.html` em `docs/design-system/` e specs realmente existentes.
  - [x] Mapear Dashboard, Cursos, Turmas, Matrículas, Alunos, Instrutores, Leads, Blog, Páginas e Configurações da Épica 15 para o canvas admin e `spec-admin-dashboard.md`.
  - [x] Registrar viewport, autenticação, fixture/dados, estado e exceções por alvo.

- [x] **Task 3 — Restaurar o harness rota × referência** (AC: 3, 4, 7)
  - [x] Atualizar `scripts/capture-epic14-fidelity.mjs` ou consolidar um harness único sem duplicar infraestrutura existente.
  - [x] Capturar rota e canvas no mesmo viewport, com fontes/espera estáveis e resposta HTTP validada.
  - [x] Tornar `canvasAvailable: false` incompatível com PASS e emitir verdict/razão por alvo.
  - [x] Manter artefatos de referência fora do deploy público.

- [x] **Task 4 — Executar auditoria visual, responsiva e a11y** (AC: 4, 5, 8)
  - [x] Executar amostra desktop/mobile em público e admin com fixtures determinísticas.
  - [x] Verificar teclado, foco, reduced-motion e axe WCAG 2.1 A/AA.
  - [x] Verificar consumo dos tokens `--tk-*`, `npm run purge:gate` e `npm run bundle:check`.

- [x] **Task 5 — Publicar findings e passar o gate técnico** (AC: 6, 7, 8)
  - [x] Versionar matriz, manifesto e relatório de auditoria em `docs/design/redesign/` e `artifacts/epic14-fidelity/`, conforme natureza do artefato.
  - [x] Executar `npm run test:epic14:fidelity` e confirmar testes reais > 0 com falha propagada.
  - [x] Entregar ao `@dev` para `accessibility_check`, `design_review` e `component_validation`.
  - [x] Atualizar checkboxes, Change Log e File List somente durante a execução autorizada.

## Dev Notes

### Arquitetura visual vigente

- ADR-014 ratifica Radix + Tailwind + cva, `react-hook-form` + Zod, Sonner e tokens finais `--tk-*` em `src/design-tokens/tokens.css`; não há autorização para introduzir outra biblioteca de UI. [Fonte: `docs/architecture/adr-014-redesign-trust-keith.md#decisões`]
- A fidelidade definida pelo ADR exige screenshot Playwright da rota a 1180px comparado ao canvas renderizado, com divergências permitidas apenas quando documentadas na spec. [Fonte: `docs/architecture/adr-014-redesign-trust-keith.md#d6--fidelidade-comparação-playwright-vs-canvas-ratificada`]
- A estrutura canônica mantém primitivas em `src/components/ui/`, padrões em `src/components/patterns/`, shell público em `src/features/public-shell/` e shell admin em `src/features/admin-shell/`. [Fonte: `docs/architecture/adr-014-redesign-trust-keith.md#d8--estrutura-de-componentes-nova`]
- A arquitetura feature-first define `app/` apenas como routing e `src/features/` como organização principal; esta story não deve mover código sem necessidade do harness. [Fonte: `docs/architecture/frontend-feature-first-architecture.md#decisions`]

### Evidência existente e lacunas

- Os canvases versionados estão em `docs/design-system/`, incluindo Home, Catálogo, Agenda, In-company, Quem Somos, Blog, Login, Curso, Checkout e Admin Dashboard.
- `docs/design/redesign/spec-admin-dashboard.md` é a única spec de página localizada no diretório de redesign; a ausência das specs públicas deve resultar em finding/exceção, não em conteúdo inventado.
- `scripts/capture-epic14-fidelity.mjs` usa viewport `1180 × 2400`, mas todos os `canvasPaths` estão vazios e o manifesto registra `canvasAvailable: false`; esse estado não sustenta PASS de fidelidade.
- `artifacts/epic14-fidelity/manifest.json` e as screenshots atuais são evidência histórica reutilizável, porém precisam ser regeneradas pelo harness corrigido.
- `package.json` expõe `test:epic14:fidelity:capture`, `test:epic14:fidelity`, `test:epic15:fidelity`, `test:a11y`, `purge:gate` e `bundle:check`; reutilizar esses contratos em vez de criar comandos paralelos sem necessidade.
- A Épica 15 usa `docs/design-system/RH Cursos Admin Dashboard.dc.html` como fonte e declara `docs/qa/gates/epic15-complete-fidelity.yml` como gate histórico 100/100; esta story audita a reprodutibilidade atual sem apagar o gate. [Fonte: `docs/epics/epic-15-admin-dashboard-fidelidade-total.md#related-documents`]

### Project Structure Notes

- Artefatos de auditoria persistentes: `docs/design/redesign/` e `docs/history/decisions/`.
- Capturas geradas: `artifacts/epic14-fidelity/`; não mover `.dc.html` para `public/`.
- Alterações esperadas no harness: `scripts/capture-epic14-fidelity.mjs` e testes associados, se necessários.
- Código visual de `app/` e `src/` é somente leitura nesta story; qualquer remediação deve nascer de finding e escopo aprovado posterior.

## Testing

- `npm run test:epic14:fidelity:capture` — deve produzir pares rota/referência e manifesto com verdict por alvo.
- `npm run test:epic14:fidelity` — deve executar testes reais (> 0) e propagar falha.
- `npm run test:a11y` — WCAG automatizado nas superfícies selecionadas.
- `npm run purge:gate` — zero Mantine/Emotion.
- `npm run bundle:check` — budgets vigentes preservados.
- Validação manual lado a lado no mesmo viewport, com registro de viewport, data/SHA, fixture e adaptação permitida.
- Quality gate: `@dev` executa `accessibility_check`, `design_review` e `component_validation`.

## Dependências

- **Entrada:** ADR-014, Épicas 14 e 15, canvases em `docs/design-system/`, spec admin e harness atual.
- **Paralelismo:** pode executar em paralelo com 18.1.
- **Saída obrigatória para 18.3:** decision log, matriz rota/referência, manifesto reproduzível e findings classificados.

## Riscos e proibições

- **Proibido iniciar novo redesign:** Trust Keith permanece baseline.
- **Proibido alterar UI sem finding reproduzível:** qualquer remediação funcional/visual exige story/escopo posterior.
- **Proibido declarar fidelidade por smoke:** rota carregada não equivale a comparação visual.
- **Proibido aceitar referência ausente como PASS:** usar `NOT_ASSESSABLE` ou `CONCERNS` com owner.
- **Proibido reintroduzir Mantine/Emotion ou hex duplicado fora da fonte de tokens.**
- **Proibido reintroduzir HMAC/demo-auth para acessar o admin:** a autenticação do harness deve seguir o contrato SSR vigente ou ser tratada na Story 18.3.
- **Risco:** dados dinâmicos e fontes causarem diffs instáveis. **Mitigação:** fixtures, viewport, fontes e espera determinísticos; separar diff de dados de diff visual.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> A validação usará revisão manual por `@dev` com `accessibility_check`, `design_review` e `component_validation`.

## ClickUp Sync

- **Status:** indisponível nesta sessão; nenhum conector ClickUp callable foi fornecido.
- **Fonte canônica temporária:** este arquivo local em `docs/stories/`.
- **Impacto:** não bloqueia o Draft; a sincronização deverá ser realizada quando o conector estiver disponível.

## Story Draft Checklist — @sm

| Categoria | Resultado | Evidência |
|---|---|---|
| Goal & Context Clarity | PASS | Baseline, problema de evidência e valor estão explícitos. |
| Technical Implementation Guidance | PASS | Canvases, specs, harness, outputs e limites definidos. |
| Reference Effectiveness | PASS | ADR, épicas e paths reais resumidos com finalidade. |
| Self-Containment | PASS | Verdicts, exceções, amostra de risco e proibições definidos. |
| Testing Guidance | PASS | Captura, Playwright, a11y, purge e bundle especificados. |
| CodeRabbit Integration | N/A | Integração não habilitada no core config; notice incluído. |

**Readiness histórico:** este snapshot registrava `READY` antes do gate `@po`. Estado vigente: `Done`, com QA PASS após remoção dos bloqueios pela Story 18.3.

## PO Validation

**Data:** 2026-07-19  
**Validador:** `@po` (Pax)  
**Verdict:** **GO — 9.0/10**  
**Confiança:** Alta  
**Transição:** `Draft → Ready`

- Template e Executor Assignment estão completos; `@ux-design-expert → @dev` é consistente com uma story primariamente visual, de acessibilidade e validação de componentes.
- Os 8 ACs distinguem corretamente disponibilidade, comportamento e fidelidade, impedindo que smoke test ou referência ausente seja tratado como PASS visual.
- A matriz rota/canvas/spec, o manifesto com verdict e a amostra desktop/mobile/a11y tornam a entrega verificável.
- ADR-014, canvases, scripts, comandos e lacunas citados foram confirmados no repositório; não foi encontrada biblioteca ou identidade visual inventada.
- As proibições impedem novo redesign, alteração especulativa de UI e reintrodução de Mantine/HMAC.

**Observações não bloqueantes:** o executor deve separar artefatos persistentes em `docs/` de capturas regeneráveis em `artifacts/`; qualquer mudança de código no harness passa obrigatoriamente por `@dev` no quality gate.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-19 | 0.1 | Draft criado a partir da Épica 18 e da evidência atual do redesign Trust Keith. | `@sm` (River) |
| 2026-07-19 | 0.2 | Validação PO GO 9.0/10; story promovida de Draft para Ready. | `@po` (Pax) |
| 2026-07-19 | 0.3 | Execução 18.2: decision log, matriz rota×canvas×spec, harness restaurado (par rota+canvas, verdict por alvo), auditoria de risco e gates rodados; 7 findings registrados. Tasks 1–5 concluídas. Status inalterado (gate `@dev`). | `@ux-design-expert` |
| 2026-07-19 | 0.4 | Gate `@dev`: checks específicos, lint, typecheck e build passaram; baseline a11y/teclado desktop e mobile 14/14. Regressão integral bloqueada por testes legados que importam `SESSION_COOKIE` (F-AUTH-03 / Story 18.3); status mantido em execução até o gate global passar. | `@dev` (Dex) |
| 2026-07-19 | 0.5 | Gate integral reexecutado após a 18.3: typecheck e build passam, mas `npm test` ainda aborta por imports legados de `SESSION_COOKIE` em `route-auth.spec.ts` e `smoke-crawl.spec.ts`. A 18.3 também permanece bloqueada no E2E pelo Supabase local indisponível. Story 18.2 marcada Blocked sem declarar Done/PASS. | `@dev` (Dex) |
| 2026-07-19 | 0.6 | Bloqueios removidos após correção da Story 18.3; `npm test` passou 179/179 e gates de redesign/API/bundle/purge passaram no mesmo worktree. QA PASS e PO fechou a story como Done. | `@po` (Pax) |

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (`@ux-design-expert`), modo executor autônomo.

### Debug Log References

- `npm run test:epic14:fidelity:capture` — 10 alvos, 20 screenshots, `artifacts/epic14-fidelity/manifest.json` summary `{PASS:0, CONCERNS:10, FAIL:0, NOT_ASSESSABLE:0}`; verificação automatizada: 0 alvos `canvasAvailable:false && PASS`.
- `npm run test:epic14:fidelity` — 8 passed (0 fail), falha propagada (EXIT 0).
- `npm run test:a11y` — 9 passed (0 violações WCAG 2.1 A/AA em 7 rotas públicas).
- `node scripts/run-playwright.mjs a11y.baseline.spec.ts keyboard.baseline.spec.ts --project=baseline-desktop` — 14 passed.
- `node scripts/run-playwright.mjs a11y.baseline.spec.ts keyboard.baseline.spec.ts --project=baseline-mobile` — 14 passed (Pixel 5).
- `npm run purge:gate` — PASS (337 arquivos, zero `@mantine`/`@emotion`).
- `npm run bundle:check` — PASS (625.3 KB / 1000 KB; maior chunk 79.0 KB / 175 KB).
- `npm run lint` — PASS.
- `npm run typecheck` — PASS.
- `npm run build` — PASS (aviso não bloqueante de depreciação da convenção `middleware`).
- `npm test` (reexecução após Story 18.3) — BLOCKED após typecheck/build: `tests/route-auth.spec.ts` e `tests/smoke-crawl.spec.ts` ainda importam `SESSION_COOKIE`; a dependência E2E da 18.3 permanece bloqueada porque o Supabase local não inicia.
- `npm test` (fechamento final após correções 18.3) — PASS: 179/179 casos Playwright após typecheck e build.
- `npm run lint` — PASS sem warnings.
- `npm run typecheck` — PASS.
- `npm run test:unit` — PASS: 75 arquivos, 757 testes.
- `npm run docs:api:lint` — PASS.
- `npm run docs:api:check-drift` — PASS: 13 rotas reconciliadas.
- `npm run purge:gate` — PASS: 337 arquivos, zero Mantine/Emotion.
- `npm run bundle:check` — PASS: 625.8 KB gzip / 1000 KB; maior chunk 79.3 KB / 175 KB.
- SHA base de execução: `b86d07e` · data 2026-07-19.

### Completion Notes List

- **Task 1:** decision log declara Trust Keith baseline canônico e Executive Precision histórico/supersedido; tokens `--ea-*`/`--m3-*` classificados como camada de compatibilidade (aliases → `--tk-*`), com hex literais residuais isolados como finding F-TK-01. Nenhum token removido.
- **Task 2:** matriz completa de 26 rotas (16 públicas + 10 admin) com canvas/spec/viewport/auth/estado/status; 7 exceções formais com owner.
- **Task 3:** harness `scripts/capture-epic14-fidelity.mjs` reescrito: renderiza o canvas `.dc.html` resolvendo o prefixo de assets hasheado para `docs/design-system/` (tokens `--tk-*` reais), captura rota+canvas no mesmo viewport (público 1180 / admin 1360), valida HTTP, auto-inicia o servidor de produção quando não há `EPIC14_FIDELITY_BASE_URL`, e emite verdict PASS/CONCERNS/FAIL/NOT_ASSESSABLE por alvo. `canvasAvailable:false` nunca é PASS; PASS só com `manualSignoff` explícito. Artefatos temporários de canvas são removidos; nenhum `.dc.html` movido para `public/`.
- **Task 4/5:** auditoria de risco (axe estrito em 7 rotas públicas, baseline a11y/teclado desktop e mobile com 14/14 em cada projeto, reduced-motion e estado do guard admin) e todos os gates registrados no relatório. Findings F-SPEC-01, F-CAP-02, F-AUTH-03, F-SPEC-04, F-CANVAS-05, F-TK-01, F-A11Y-06 publicados. **Nenhuma UI de produção alterada.** Auth SSR do admin encaminhada como F-AUTH-03 para a Story 18.3 (sem workaround HMAC/demo-auth).
- **Quality gate `@dev` histórico:** `accessibility_check` PASS para a amostra executável (axe desktop estrito + baseline desktop/mobile + teclado); `design_review` PASS com 10 pares reproduzíveis e nenhum PASS automático; `component_validation` PASS para tokens/purge/bundle/lint/typecheck/build. O verdict global ficou **BLOCKED** naquele snapshot pela regressão `npm test` ligada a F-AUTH-03/Story 18.3 e pela indisponibilidade do Supabase local. Estado vigente: bloqueio resolvido, `npm test` PASS 179/179 e QA PASS.
- **Fechamento final:** bloqueio F-AUTH-03 removido pela Story 18.3. O gate integral passou com `npm test` 179/179, Epic14/Epic15/a11y/ui-governance verdes, OpenAPI reconciliada, purge e bundle dentro dos limites. Nenhuma remediação visual especulativa foi introduzida; o snapshot do login foi atualizado para o baseline SSR atual.

### File List

**Criados:**
- `docs/history/decisions/decision-log-epic18-2-linha-visual-canonica.md`
- `docs/design/redesign/MATRIX-rota-canvas-spec.md`
- `docs/design/redesign/AUDIT-epic18-story2-fidelity.md`
- `artifacts/epic14-fidelity/{about,admin-dashboard,agenda,blog,checkout,course-detail,courses,home,in-company,login}-canvas.png`
- `artifacts/epic14-fidelity/{admin-dashboard,checkout,course-detail,login}-route.png`

**Modificados:**
- `scripts/capture-epic14-fidelity.mjs` (harness rota×canvas com verdicts)
- `artifacts/epic14-fidelity/manifest.json` (verdicts por alvo)
- `artifacts/epic14-fidelity/{about,agenda,blog,courses,home,in-company}-route.png` (regeneradas)
- `docs/stories/2026-07-19-epic18-story2-auditoria-redesign.md` (Dev Agent Record, Change Log, checkboxes)

## QA Results

### Review — 2026-07-19 — `@qa` (Quinn)

**Verdict:** PASS

**Resumo:** AC1–AC8 atendidos. A story produziu decision log, matriz rota×canvas×spec, manifesto com verdict explícito, auditoria visual/a11y e findings rastreáveis. O bloqueio técnico remanescente foi resolvido pela Story 18.3 sem reintroduzir HMAC/demo-auth, `x-rh-session` ou Mantine/Emotion.

**Evidência de gate:**
- `npm test` — PASS, 179/179.
- `npm run test:unit` — PASS, 75 arquivos / 757 testes.
- `npm run docs:api:lint` e `npm run docs:api:check-drift` — PASS.
- `npm run purge:gate` — PASS, zero Mantine/Emotion.
- `npm run bundle:check` — PASS, 625.8 KB / 1000 KB.

**Risco residual:** baixo. O gate `devops:all`, push e deploy permanecem exclusivos de `@devops`.

## Handoff

- **Fechamento:** `@po` fechou a Story 18.2 como Done após QA PASS e gates verdes.
- **Próximo agente:** `@devops`, somente se o usuário solicitar pre-deployment/push/deploy.
- **Condição:** nenhuma operação remota foi executada nesta story.
