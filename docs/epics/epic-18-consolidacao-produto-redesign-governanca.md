# Épica 18 — Consolidação de Produto, Redesign e Governança

**Status:** Done (2026-07-19) — Stories 18.1–18.3 concluídas; bloqueios de 18.3 removidos após restauração dos gates e fechamento `@qa`/`@po`  
**Tipo:** Brownfield — consolidação documental, auditoria visual e restauração de gates  
**Owner de produto:** `@pm` (Morgan)  
**Prioridade:** P1 — o produto está funcional, mas a rastreabilidade e os gates atuais não sustentam todos os fechamentos declarados  
**Data:** 2026-07-19  
**Fontes:** `docs/prd/`, `docs/epics/epic-1..17`, `docs/stories/`, `docs/qa/gates/`, Épicas 7, 13, 14, 15 e 17, canvases Trust Keith e verificação direta do worktree

---

## Objetivo

Restabelecer uma fonte de verdade auditável para o produto entregue, reconciliando os PRDs com as épicas e stories implementadas, comprovando objetivamente o estado do redesign Trust Keith e restaurando os quality gates atualmente quebrados, sem reconstruir funcionalidades nem alterar regras de negócio.

## Contexto do sistema existente

- **Produto:** plataforma RH Cursos com jornadas públicas, consultoria/in-company, checkout, portais de aluno e instrutor, painel administrativo e backend Supabase.
- **Stack:** Next.js 16, React 19, TypeScript, Tailwind, Radix UI, Supabase, Cloudflare Workers/OpenNext, Vitest e Playwright.
- **Arquitetura visual vigente:** tokens e componentes Trust Keith (`--tk-*`), com remoção de Mantine/Emotion concluída.
- **Governança:** desenvolvimento orientado a stories, gates AIOX, QA por story e documentação OpenAPI.
- **Integrações afetadas:** PRDs, índice de stories, documentos de épica, QA gates, scripts Playwright, capturas de fidelidade, OpenAPI e autenticação SSR.

## Diagnóstico factual que originou a épica

### 1. Portfólio e PRD

1. O PRD de modernização (`docs/prd/modernizacao-ui-2026.md`) mapeia diretamente as Épicas 1–6, todas declaradas completas.
2. O PRD brownfield (`docs/prd/prd.md`) continua descrevendo uma abordagem de épica única com stories 1.1–1.6, enquanto o produto evoluiu até a Épica 17.
3. Somente a Story 1.1 possui artefato formal equivalente em `docs/stories/`; as entregas previstas em 1.2–1.6 aparecem distribuídas no código e em épicas posteriores sem matriz de substituição formal.
4. O índice de stories foi atualizado pela última vez em 2026-07-05 e não representa as stories posteriores das Épicas 15–17 e REC-*.
5. Épicas 9–13 referenciam `docs/PHASE-B-PLAN.md`, ausente no repositório atual; outras fontes de baseline também foram movidas ou removidas sem redirecionamento documental.

### 2. Linha canônica do redesign

| Camada | Estado verificado | Decisão desta épica |
|---|---|---|
| Épica 7 — Executive Precision | Declarada completa, mas suas fontes canônicas `docs/design/executive-precision/` não existem mais no worktree; tokens legados `--ea-*`/`--m3-*` ainda aparecem como compatibilidade | Tratar como redesign histórico supersedido e registrar explicitamente sua relação com o Trust Keith |
| Épica 14 — Trust Keith público | Tokens/componentes `--tk-*` implementados, zero Mantine/Emotion, rotas públicas funcionais e smoke específico verde | Manter implementação; restaurar prova visual reproduzível contra os canvases |
| Épica 15 — Trust Keith admin | Conteúdo admin implementado e gate histórico 100/100, mas a suíte específica atual não carrega após o cutover de autenticação | Atualizar o harness para sessão Supabase SSR e revalidar todas as superfícies |

### 3. Evidência atual do redesign

Verificação executada em 2026-07-19:

| Gate | Resultado atual | Observação |
|---|---|---|
| `npm run purge:gate` | PASS | Zero import/pacote Mantine ou Emotion em `app/`, `src/` e `package.json` |
| `npm run bundle:check` | PASS | 625,3 KB gzip de 1.000 KB; maior chunk 79,0 KB de 175 KB |
| `npm run test:epic14:fidelity` | PASS, 8/8 | Prova comportamento, busca, reduced-motion, forms e ausência de regressão Mantine; não mede pixel fidelity |
| Capturador da Épica 14 | CONCERNS | Todos os `canvasPaths` estão vazios; captura apenas as rotas e não produz comparação rota × canvas |
| Specs públicas prometidas pela 14.0.2 | CONCERNS | Não estão presentes; somente `docs/design/redesign/spec-admin-dashboard.md` foi localizado |
| `npm run test:epic15:fidelity` | FAIL | Os specs importam `SESSION_COOKIE` e `encodeSession` de `@/lib/auth`, removidos pelo cutover Supabase SSR |
| Stories 15.2–15.8 | CONCERNS | Status `Done`, mas acceptance criteria permanecem desmarcados (`[ ]`) |

**Conclusão:** o redesign Trust Keith está implementado em nível estrutural e funcional, mas a afirmação de **fidelidade total** não é reproduzível com o harness atual. Esta épica deve recuperar a prova; não deve substituir o design entregue sem um finding objetivo.

### 4. Gates gerais quebrados no worktree

- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run test:unit`: FAIL — 746/748; duas falhas no inventário/drift OpenAPI.
- `npm run docs:api:check-drift`: FAIL — a spec ainda declara `/functions/v1/auth-session`, removida do código.
- `supabase/functions/auth-session/index.ts` está removido no worktree, coerente com o cutover SSR, mas a documentação e os testes dependentes ainda não foram reconciliados.

---

## Escopo

### IN SCOPE

1. Matriz de rastreabilidade `FR/NFR/CR → épica → story → código → teste/gate`.
2. Atualização do PRD mestre e dos índices para representar o produto entregue, preservando o histórico.
3. Registro explícito de supersessão entre Executive Precision e Trust Keith.
4. Inventário de canvases, specs e rotas do redesign público e administrativo.
5. Restauração da comparação visual rota × canvas, com evidência versionada ou manifesto reproduzível.
6. Atualização dos testes da Épica 15 para o contrato de autenticação Supabase SSR vigente.
7. Correção do drift OpenAPI decorrente da remoção de `auth-session`.
8. Reconciliação de checkboxes/status somente quando sustentada por evidência executada.
9. Reexecução dos gates de qualidade e emissão de verdict final do portfólio/redesign.

### OUT OF SCOPE

- Novo redesign ou troca da identidade Trust Keith.
- Alteração de regras de negócio, schema, RLS ou conteúdo editorial.
- Reimplementação das funcionalidades das Épicas 1–17 sem finding reproduzível.
- Gestão editorial da página de consultoria, que permanece no backlog `[1.2-F1]`.
- Deploy, push, PR ou release dentro das stories de análise/implementação; operações remotas continuam exclusivas do `@devops`.
- Saneamento destrutivo de histórico Git.

## Critérios de sucesso da épica

- [x] 100% de FR1–FR16, NFR1–NFR10 e CR1–CR4 classificados como `ATENDIDO`, `PARCIAL`, `DIFERIDO` ou `NÃO ATENDIDO`, sempre com evidência e owner.
- [x] Toda épica 1–17 aponta para uma fonte vigente ou registra explicitamente que a fonte é histórica/ausente.
- [x] Stories 1.2–1.6 possuem mapeamento formal para stories entregues ou permanecem declaradas como gaps, sem inferência silenciosa.
- [x] Executive Precision está documentado como histórico/supersedido, sem duas identidades visuais concorrentes declaradas canônicas.
- [x] Todas as rotas cobertas pelas Épicas 14 e 15 possuem canvas/spec/referência identificada ou exceção formal justificada.
- [x] A auditoria de fidelidade gera, no mínimo, pares rota × referência no mesmo viewport e um manifesto que não aceite `canvasAvailable: false` como PASS de fidelidade.
- [x] `test:epic14:fidelity` e `test:epic15:fidelity` executam testes reais, reportam quantidade maior que zero e propagam falha corretamente.
- [x] `docs:api:check-drift`, lint, typecheck, unit, build, a11y, purge e bundle passam no mesmo commit de fechamento.
- [x] Nenhuma story permanece `Done` com ACs abertos sem waiver explícito e justificativa verificável.
- [x] O índice de stories e o PRD informam data de atualização e escopo coerentes com o repositório atual.

> Reconciliação documental: os critérios acima foram marcados a partir das
> Stories 18.1–18.3 `Done` e do fechamento `GO 9.5/10` registrado na 18.3. A
> marcação representa a evidência daquele fechamento; não afirma nova execução
> de gates nesta revisão documental.

---

## Stories propostas para sharding pelo `@sm`

> As entradas abaixo são a estrutura de produto da épica. O `@sm` deve criar os arquivos completos em `docs/stories/`; o `@po` deve validar cada draft antes da execução.

### Story 18.1 — Consolidar PRD e rastreabilidade do portfólio

**Descrição:** pesquisar, comparar e reconciliar os dois PRDs, as Épicas 1–17, stories e gates, produzindo a matriz de rastreabilidade canônica e atualizando os índices documentais sem inventar requisitos.

**Arquivo:** `docs/stories/2026-07-19-epic18-story1-rastreabilidade-portfolio.md` — `Done` (`GO 9.5/10`, fechado por `@pm`)

```yaml
executor: "@analyst"
quality_gate: "@pm"
quality_gate_tools: [research_validation, findings_review]
assignment_basis: "executor-assignment: research / assessment"
```

**Aceite resumido:**

- Matriz FR/NFR/CR completa, com links e estado normalizado.
- Mapeamento formal das stories 1.2–1.6.
- Fontes ausentes ou supersedidas identificadas.
- `docs/stories/index.md` regenerado a partir do estado real.
- Nenhuma mudança funcional ou de status sem evidência.

**Gates:** revisão de findings pelo `@pm`, validação de links/caminhos e checagem Article IV — No Invention.

### Story 18.2 — Auditar e restaurar a prova do redesign

**Descrição:** consolidar o Trust Keith como identidade canônica, inventariar todas as rotas/canvases/specs, restaurar a comparação visual reproduzível e produzir findings objetivos de fidelidade, responsividade e acessibilidade.

**Arquivo:** `docs/stories/2026-07-19-epic18-story2-auditoria-redesign.md` — `Done` (`GO 9.0/10`, QA PASS)

```yaml
executor: "@ux-design-expert"
quality_gate: "@dev"
quality_gate_tools: [accessibility_check, design_review, component_validation]
assignment_basis: "executor-assignment: ui_ux"
```

**Aceite resumido:**

- Decision log Executive Precision → Trust Keith.
- Matriz canvas/spec/rota para site público e admin.
- Captura lado a lado restaurada; ausência de canvas não conta como PASS.
- Auditoria desktop/mobile/reduced-motion/WCAG por amostragem de risco.
- Findings classificados por severidade; remediação de UI só entra quando sustentada por diff objetivo.

**Gates:** revisão visual, axe/WCAG, responsividade, verificação de tokens `--tk-*`, purge e bundle.

### Story 18.3 — Restaurar gates automatizados e fechar a consolidação

**Descrição:** corrigir contratos e harnesses obsoletos após o cutover SSR, reconciliar a OpenAPI com a superfície publicada e executar o gate agregado de fechamento da épica.

**Arquivo:** `docs/stories/2026-07-19-epic18-story3-restaurar-gates.md` — `Done` (`GO 9.5/10`, gates restaurados)

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [architecture_review, code_review, pattern_validation]
assignment_basis: "executor-assignment: code_general"
```

**Aceite resumido:**

- Testes da Épica 15 autenticam pelo mecanismo SSR vigente e executam casos reais.
- OpenAPI não publica o endpoint removido, ou o endpoint é restaurado somente se houver decisão arquitetural explícita — nunca ambos.
- Contagem fixa de 13 rotas é substituída por inventário verificável quando aplicável.
- Gates completos verdes no mesmo SHA.
- QA gate consolidado registra PASS/CONCERNS/FAIL e riscos residuais.

**Gates:** pre-commit com lint/typecheck/unit; pre-PR com build, OpenAPI drift, Playwright de fidelidade e a11y; pre-deployment com `devops:all`, executado exclusivamente pelo `@devops`.

---

## Dependências e sequenciamento

```text
18.1 Rastreabilidade ──┐
                       ├──> 18.3 Gates e fechamento
18.2 Redesign ─────┘
```

- 18.1 e 18.2 podem ser executadas em paralelo após validação das stories.
- 18.3 depende dos findings e matrizes produzidos pelas duas primeiras.
- Nenhum status de épica anterior deve ser reaberto automaticamente; a decisão é do `@po` a partir do verdict consolidado.

## Compatibilidade

- APIs e schema permanecem inalterados, salvo reconciliação documental da rota já removida.
- A identidade Trust Keith e os componentes atuais permanecem como baseline.
- Os fluxos públicos, CRUD admin, portais, autenticação SSR e deploy Cloudflare devem permanecer funcionais.
- Nenhum fallback HMAC ou demo-auth pode ser reintroduzido para fazer testes passarem.
- O harness deve testar o contrato vigente, não restaurar comportamento legado.

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Transformar reconciliação documental em reescrita do produto | Congelar escopo funcional e exigir finding reproduzível antes de qualquer alteração de UI |
| Declarar fidelidade apenas por smoke test | Exigir par rota × referência e manifesto que diferencie disponibilidade de verdict |
| Reintroduzir HMAC para reaproveitar testes antigos | Atualizar fixtures/harness para Supabase SSR; gate de arquitetura bloqueia downgrade |
| Alterar documentos históricos apagando decisões | Usar marcação `superseded`/`historical`; preservar changelog e links |
| Fechar ACs por inferência | Somente marcar após evidência executada; caso contrário, waiver ou gap explícito |
| Capturas visuais instáveis por dados remotos | Usar fixtures determinísticas, viewport/fontes fixos e separar diferença de dados de diferença visual |

## Rollback

- Mudanças documentais: revert do commit da story, preservando os artefatos históricos.
- Harness/testes: revert isolado sem impacto no runtime de produção.
- Eventual remediação visual: commit separado por finding e rota, permitindo rollback granular.
- Nenhuma migração de banco ou operação destrutiva faz parte desta épica.

## Definition of Done

- [x] Stories 18.1–18.3 criadas pelo `@sm`, validadas pelo `@po` e concluídas por seus executores autorizados.
- [x] Critérios de sucesso desta épica atendidos ou formalmente waived com owner e prazo.
- [x] Matriz de rastreabilidade e relatório de redesign versionados.
- [x] Gates automatizados executados no mesmo SHA e evidência anexada ao QA gate.
- [x] PRD, índice de stories, épicas afetadas e documentação OpenAPI coerentes.
- [x] Nenhuma regressão funcional, de acessibilidade, segurança, bundle ou deploy.
- [x] Verdict final emitido pelo `@qa`; transição para `Done` decidida pelo `@po`.

## Handoff para `@sm`

> Criar três stories brownfield a partir das seções 18.1–18.3, preservando os executores e quality gates definidos. Cada story deve conter File List, acceptance criteria verificáveis, comandos de gate e proibição explícita de reintroduzir HMAC/demo-auth ou alterar UI sem finding reproduzível. A 18.3 só pode iniciar o fechamento após consumir os outputs de 18.1 e 18.2.

---

**Change Log**

| Data | Versão | Mudança | Autor |
|---|---:|---|---|
| 2026-07-19 | 0.1 | Criação da épica a partir da avaliação do portfólio e auditoria factual do redesign | `@pm` (Morgan) |
| 2026-07-19 | 0.2 | Sharding concluído: Stories 18.1–18.3 criadas em Draft pelo `@sm` e vinculadas à épica | `@pm` (Morgan) / `@sm` (River) |
| 2026-07-19 | 0.3 | Validação PO concluída: 18.1 GO 9.5, 18.2 GO 9.0 e 18.3 GO 9.5 condicionado; épica promovida para Ready | `@po` (Pax) |
| 2026-07-19 | 0.4 | Stories 18.1–18.3 concluídas; gates restaurados e épica fechada como Done. | `@po` (Pax) |
