# Story 18.3: Restaurar gates automatizados e fechar a consolidação

## Status

Done

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [architecture_review, code_review, pattern_validation]
assignment_basis: "executor-assignment: code_general"
```

## Épica e rastreabilidade

- **Épica:** [Épica 18 — Consolidação de Produto, Redesign e Governança](../epics/epic-18-consolidacao-produto-redesign-governanca.md)
- **Prioridade:** P1
- **Tipo:** correção brownfield de contratos, harnesses e gates
- **Valor:** restaurar evidência executável no contrato vigente e emitir um fechamento consolidado confiável.
- **Dependências bloqueantes:** Stories 18.1 e 18.2 concluídas e com outputs consumíveis.
- **Quality gate arquitetural:** `@architect`; verdict final da épica continua responsabilidade de `@qa`, e transição para Done continua decisão do `@po`.

## Story

**As a** equipe responsável pela confiabilidade da entrega RH Cursos,
**I want** atualizar os harnesses obsoletos, reconciliar a OpenAPI e executar todos os gates no mesmo SHA,
**so that** o fechamento do portfólio e do redesign reflita a autenticação Supabase SSR e a superfície publicada atuais sem reintroduzir mecanismos legados.

## Contexto e valor

A suíte da Épica 15 ainda importa `SESSION_COOKIE` e `encodeSession` de `@/lib/auth`, APIs removidas pelo cutover Supabase SSR. Ao mesmo tempo, a documentação OpenAPI pode publicar `/functions/v1/auth-session` apesar de a Edge Function correspondente ter sido removida. Corrigir os sintomas reintroduzindo HMAC, `localStorage`, `x-rh-session` ou demo-auth violaria o ADR-016 e o objetivo da Épica 18. Esta story atualiza os testes para o contrato vigente, torna o inventário OpenAPI derivado da superfície real e executa os gates como um conjunto único. [Fonte: `docs/epics/epic-18-consolidacao-produto-redesign-governanca.md#gates-gerais-quebrados-no-worktree`]

## Acceptance Criteria

1. **Dependências de consolidação consumidas**
   **Given** os outputs das Stories 18.1 e 18.2,
   **when** esta story inicia,
   **then** a matriz de rastreabilidade, os gaps, o decision log visual, a matriz rota/referência e os findings são referenciados no plano de correção; a story não fecha antes de consumir ambos os conjuntos.

2. **Harness da Épica 15 usa Supabase SSR vigente**
   **Given** `tests/epic15-admin-dashboard-fidelity.spec.ts` e `tests/epic15-blog-pages.spec.ts`,
   **when** a autenticação de teste é atualizada,
   **then** os specs deixam de importar/usar `SESSION_COOKIE` e `encodeSession`, autenticam pelo contrato SSR vigente com fixtures seguras e determinísticas, e não persistem tokens em `localStorage` nem enviam `x-rh-session`.

3. **Nenhuma autoridade legada é reintroduzida**
   **Given** o cutover definido pelo ADR-016,
   **when** código e testes são revisados,
   **then** nenhum HMAC próprio, demo-auth, fallback permissivo, cookie legado ou Edge Function `auth-session` é recriado para fazer a suíte passar; configuração ou autenticação ausente falha fechado.

4. **Suítes de fidelidade executam casos reais**
   **Given** os scripts `test:epic14:fidelity` e `test:epic15:fidelity`,
   **when** são executados,
   **then** cada comando executa quantidade maior que zero, propaga exit code de falha, usa o harness vigente e registra a contagem/resultados no fechamento.

5. **OpenAPI reconciliada com a superfície publicada**
   **Given** a remoção de `supabase/functions/auth-session/index.ts`,
   **when** código, spec e documentação são comparados,
   **then** `/functions/v1/auth-session` não permanece publicado; restaurar o endpoint só é permitido por decisão arquitetural explícita e separada — código e spec nunca podem divergir ou coexistir em estados contraditórios.

6. **Inventário anti-drift derivado, não fixo**
   **Given** `scripts/check-openapi-drift.mjs` e seus testes,
   **when** rotas são adicionadas ou removidas,
   **then** o expected deriva do inventário verificável do código/spec, cobre path e métodos, e nenhuma asserção depende de uma contagem histórica fixa como 13 sem recalcular a superfície atual.

7. **Rastreabilidade de stories encerradas reconciliada**
   **Given** stories `Done` com ACs ainda abertos, incluindo 15.2–15.8,
   **when** a evidência das Stories 18.1/18.2 e os gates atuais são revisados,
   **then** cada checkbox é marcado somente quando sustentado por evidência executada; caso contrário permanece aberto com waiver explícito, owner e prazo, sem alterar o status automaticamente.

8. **Gate agregado verde no mesmo SHA**
   **Given** a implementação concluída,
   **when** os quality gates são executados no mesmo SHA,
   **then** `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build`, `npm run docs:api:lint`, `npm run docs:api:check-drift`, `npm run test:epic14:fidelity`, `npm run test:epic15:fidelity`, `npm run test:a11y`, `npm run purge:gate` e `npm run bundle:check` passam; qualquer não execução impede PASS.

9. **Fechamento consolidado e riscos residuais**
   **Given** todos os resultados e outputs das Stories 18.1–18.3,
   **when** o pacote é entregue ao gate final,
   **then** um QA gate consolidado registra `PASS`, `CONCERNS` ou `FAIL`, SHA/data, evidências, riscos residuais, owners e próximos passos; `devops:all`/pre-deployment permanece execução exclusiva do `@devops` e o status da épica é decidido pelo `@po`.

## Tasks / Subtasks

- [x] **Task 1 — Consumir findings e definir o menor diff corretivo** (AC: 1, 3)
  - [x] Ler os outputs aprovados das Stories 18.1 e 18.2 e relacionar cada mudança a um finding.
  - [x] Confirmar ADR-016/REC-202/REC-204 antes de alterar o harness e impedir expansão para regra de negócio, schema, RLS ou redesign.

- [x] **Task 2 — Migrar o harness da Épica 15 para SSR** (AC: 2, 3, 4)
  - [x] Criar/reutilizar helper de autenticação E2E que use o endpoint SSR vigente e ambiente isolado seguro.
  - [x] Atualizar os dois specs sem auth legado e cobrir sucesso, falha fechada e propagação de falha do runner.

- [x] **Task 3 — Reconciliar OpenAPI e o anti-drift** (AC: 5, 6)
  - [x] Remover da spec e documentação a Edge Function `auth-session` ausente, preservando rotas SSR/Next realmente publicadas.
  - [x] Comparar inventários por path/método sem número histórico fixo e só regenerar docs após lint/drift verdes.

- [x] **Task 4 — Reconciliar ACs/status documentais com evidência** (AC: 7)
  - [x] Revisar 15.2–15.8 contra gate histórico e resultados atuais, marcando ACs somente com evidência verificável.
  - [x] Registrar waiver/owner/prazo para lacunas; não mudar status automaticamente.

- [x] **Task 5 — Executar gates e produzir fechamento** (AC: 4, 8, 9)
  - [x] Executar todos os comandos do AC8 no mesmo SHA e registrar contagens/resultados.
  - [x] Entregar o diff ao `@architect` para `architecture_review`, `code_review` e `pattern_validation`.
  - [x] Encaminhar ao `@qa`; solicitar pre-deployment ao `@devops` só após gates verdes; atualizar o registro da story.

## Dev Notes

### Contratos arquiteturais obrigatórios

- ADR-016 define Supabase Auth como autoridade única e proíbe novos caminhos produtivos que emitam, verifiquem ou confiem em HMAC próprio. [Fonte: `docs/architecture/adr-016-identidade-bff-rec201.md#d1--supabase-auth-é-a-única-autoridade-de-identidade-browser-e-servidor-ratificada`]
- A sessão vigente usa cookies Supabase SSR `httpOnly`, `secure` e `SameSite=Lax`; tokens não podem voltar a `localStorage` nem ao corpo de login. [Fonte: `docs/architecture/adr-016-identidade-bff-rec201.md#d2--sessão-via-cookies-ssr-httponlysecure-não-localstorage-ratificada`]
- Rollback que restaure HMAC como autoridade é proibido; a migração é forward-only. [Fonte: `docs/architecture/adr-016-identidade-bff-rec201.md#d5--migração-incremental-strangler-forward-only-ratificada-sequência`]
- `app/` deve continuar como camada de entrada, `src/features/` como organização principal e `src/lib/` como infraestrutura compartilhada; helpers de teste não justificam duplicar lógica de produção. [Fonte: `docs/architecture/frontend-feature-first-architecture.md#decisions`]

### Estado factual e arquivos relevantes

- `tests/epic15-admin-dashboard-fidelity.spec.ts` e `tests/epic15-blog-pages.spec.ts` importam `SESSION_COOKIE` e `encodeSession` de `@/lib/auth`; esses exports não existem no contrato atual.
- `app/api/auth/ssr-session/route.ts` expõe POST/GET/DELETE e delega a `src/lib/supabase/session.ts`; esse é o contrato SSR a reutilizar, não copiar.
- `tests/helpers/integration-env.ts` já centraliza ambiente Supabase e criação segura de usuários; reutilizá-lo com guarda de ambiente isolado.
- `scripts/check-openapi-drift.mjs` inventaria `app/api/**/route.ts` e `supabase/functions/*/index.ts`, compara paths/métodos e já normaliza `[name]` ↔ `{name}`.
- `src/__tests__/api/openapi-drift.test.ts` contém asserções da superfície real; elas devem provar reconciliação sem congelar uma contagem histórica que quebre após remoção legítima.
- `docs/api/openapi.yaml`, `docs/api/README.md` e `public/api-docs.html` formam o conjunto documental sincronizado; `package.json` já declara os scripts do AC8.

### Project Structure Notes

- Alterações esperadas: `tests/`, helper compartilhado se necessário, checker/testes OpenAPI, spec/README/ReDoc e fechamento.
- `src/lib/auth.ts` pode manter tipos vigentes; não restaurar `encodeSession`/`SESSION_COOKIE`.
- Não modificar schema, migrations, RLS ou `.aiox-core/**`.

## Testing

### Pre-commit — `@dev`

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`

### Pre-PR — antes do handoff remoto

- `npm run build`
- `npm run docs:api:lint`
- `npm run docs:api:check-drift`
- `npm run test:epic14:fidelity`
- `npm run test:epic15:fidelity`
- `npm run test:a11y`
- `npm run purge:gate`
- `npm run bundle:check`

### Pre-deployment — exclusivo `@devops`

- `npm run devops:all`
- Registrar o mesmo SHA dos gates de fechamento; divergência de SHA exige reexecução.

- Testar autenticação SSR válida e falha fechada por configuração/credencial ausente.
- Provar ausência de auth legado na suíte, drift com fixture isolada, testes > 0 e exit code não zero em falha.

## Dependências

- **Bloqueantes:** 18.1 com matriz/gaps e 18.2 com decision log, matriz visual, manifesto e findings.
- **Arquitetura:** ADR-016, REC-202/REC-204 e REC-406 como referências históricas do contrato vigente.
- **Saída:** pacote para `@architect`, depois `@qa`, `@po` e, somente para operação remota/pre-deploy, `@devops`.

## Riscos e proibições

- **Proibido reintroduzir HMAC, demo-auth, `localStorage`, `x-rh-session` ou fallback permissivo.**
- **Proibido restaurar `/functions/v1/auth-session` sem decisão arquitetural explícita.**
- **Proibido reduzir/ignorar testes para obter verde:** runner deve executar casos reais e propagar falha.
- **Proibido declarar PASS com gate não executado ou em SHA diferente.**
- **Proibido alterar UI sem finding reproduzível da Story 18.2.**
- **Proibido executar push, PR, deploy ou release:** operações remotas são exclusivas do `@devops`.
- **Risco:** testes SSR exigirem ambiente real. **Mitigação:** guarda fail-closed e ambiente isolado; nunca usar produção como fallback.
- **Risco:** reconciliar spec removendo contrato ainda consumido. **Mitigação:** inventário de código/chamadores e gate arquitetural antes da remoção documental.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> A validação usará `architecture_review`, `code_review` e `pattern_validation` pelo `@architect`, além dos gates automatizados desta story.

## ClickUp Sync

- **Status:** indisponível nesta sessão; nenhum conector ClickUp callable foi fornecido.
- **Fonte canônica temporária:** este arquivo local em `docs/stories/`.
- **Impacto:** não bloqueia o Draft; a sincronização deverá ser realizada quando o conector estiver disponível.

## Story Draft Checklist — @sm

| Categoria | Resultado | Evidência |
|---|---|---|
| Goal & Context Clarity | PASS | Problema, dependências, valor e fluxo de fechamento explícitos. |
| Technical Implementation Guidance | PASS | Harness, contratos SSR/OpenAPI, paths e limites definidos. |
| Reference Effectiveness | PASS | ADR e arquivos vigentes resumidos com relevância. |
| Self-Containment | PASS | Autoridade de auth, edge cases, proibições e owners definidos. |
| Testing Guidance | PASS | Gates por fase, mesmo SHA e cenários negativos definidos. |
| CodeRabbit Integration | N/A | Integração não habilitada no core config; notice incluído. |

**Readiness histórico:** este snapshot registrava `READY` condicionado a 18.1/18.2. Estado vigente: `Done`; dependências concluídas, gates restaurados e fechamento `@architect`/`@qa`/`@po` registrado abaixo.

## PO Validation

**Data:** 2026-07-19  
**Validador:** `@po` (Pax)  
**Verdict histórico:** **GO — 9.5/10, execução condicionada**  
**Confiança:** Alta  
**Transição:** `Draft → Ready`

- Template, Executor Assignment e handoffs estão completos; `@dev → @architect` é consistente com correção de código, harness e contratos.
- Os 9 ACs cobrem dependências, SSR, proibição de auth legado, OpenAPI, propagação de falhas, rastreabilidade e gate agregado no mesmo SHA.
- ADR-016, rota SSR, helpers, testes e scripts citados existem e sustentam as decisões de segurança; nenhuma autoridade paralela foi inventada.
- Os cenários negativos e fail-closed estão explícitos; a story proíbe reintrodução de HMAC, demo-auth, `localStorage` e `x-rh-session`.
- A sequência de tarefas é lógica e todos os ACs possuem cobertura de execução/teste.

**Bloqueio de execução:** a story está pronta como especificação, porém `@dev` não pode iniciá-la antes de 18.1 e 18.2 estarem concluídas e seus outputs aprovados estarem disponíveis.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-19 | 0.1 | Draft criado a partir da Épica 18, com dependências, contratos SSR/OpenAPI e gates de fechamento. | `@sm` (River) |
| 2026-07-19 | 0.2 | Validação PO GO 9.5/10; story promovida de Draft para Ready, com execução condicionada a 18.1/18.2. | `@po` (Pax) |
| 2026-07-19 | 0.3 | Harness migrado para Supabase SSR e OpenAPI reconciliada; gates locais executados. Story bloqueada porque `test:epic15:fidelity` falhou fechado sem ambiente Supabase isolado e a stack local não iniciou Auth/Kong. | `@dev` (Dex) |
| 2026-07-19 | 0.4 | Follow-up removeu imports HMAC residuais de `route-auth` e `smoke-crawl`; `npm test` deixou de abortar na carga dos módulos e avançou para 179 casos, permanecendo bloqueado pelo ambiente de integração/contratos legados fora deste delta. | `@dev` (Dex) |
| 2026-07-19 | 0.5 | Supabase local/Docker restaurados; cookies SSR ajustados para E2E local HTTP, shell admin estabilizado contra hidratação, contratos/testes legados migrados e baseline visual do login atualizado. `npm test` passou 179/179 e gates AC8 passaram. | `@dev` (Dex) |
| 2026-07-19 | 0.6 | `@architect` PASS, `@qa` PASS e `@po` fechou a story como Done. Nenhum push/deploy executado. | `@po` (Pax) |

## Dev Agent Record

### Agent Model Used

Codex (GPT-5) — Dex (`@dev`).

### Debug Log References

- Baseline executado no SHA `b86d07e`, worktree `main`, em 2026-07-19.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run test:unit`: PASS — 75 arquivos, 757 testes.
- `npm run build`: PASS — 37 páginas geradas; 13 rotas HTTP inventariadas.
- `npm run docs:api:lint`: PASS.
- `npm run docs:api:check-drift`: PASS — 13 rotas derivadas/reconciliadas.
- `npm run test:epic14:fidelity`: PASS — 8/8 casos.
- `npm run test:epic15:fidelity`: FAIL — 9 casos executados, 1 passou e 8 falharam fechado pela guarda de ambiente isolado ausente; exit code não zero propagado pelo runner.
- `npm run test:a11y`: PASS — 9/9 casos.
- `npm run purge:gate`: PASS — 337 arquivos escaneados, zero Mantine/Emotion.
- `npm run bundle:check`: PASS — 625,5 KB gzip / 1000 KB; maior chunk 79,1 KB / 175 KB.
- `git diff --check`: PASS.
- `npx playwright test epic15-admin-dashboard-fidelity.spec.ts epic15-blog-pages.spec.ts --project=functional --list`: PASS — 9 casos em 2 arquivos (prova de quantidade maior que zero).
- `supabase status` antes da reparação: somente banco local ativo; Auth/Kong e demais serviços listados como parados.
- `supabase stop`: concluiu e preservou os dados no volume Docker.
- `supabase start` (CLI 2.105.0) e tentativa mínima: processo ficou pendurado sem criar Auth/Kong.
- `brew upgrade supabase/tap/supabase`: CLI atualizada para 2.109.1.
- `supabase start --debug`/stack mínima (CLI 2.109.1): reproduziu o travamento em `supabase-go --output json start`; processo foi encerrado sem remover volumes.
- `supabase status` final: `failed to inspect container health: Error response from daemon: No such container: supabase_db_site-rh-cursos`.
- Follow-up `npm run typecheck`: PASS após migrar `route-auth.spec.ts` e `smoke-crawl.spec.ts`.
- Follow-up dos specs afetados: 46 casos coletados/executados; os casos públicos e sem sessão avançaram normalmente, enquanto os casos autenticados falharam fechado em `assertSafeWritableIntegrationEnv` pela ausência das guardas `E2E_*`.
- Follow-up `npm test`: typecheck e build PASS; Playwright coletou **179 casos** e iniciou a execução normalmente (o abort por imports `SESSION_COOKIE`/`encodeSession` foi eliminado). O agregado permaneceu FAIL: primeira falha em `admin-crud.spec.ts` pela mesma guarda de ambiente isolado; também alcançou contratos antigos ainda presentes em `api-contract.spec.ts`, fora dos dois módulos atribuídos neste follow-up.
- Fechamento final `npm run lint`: PASS sem warnings.
- Fechamento final `npm run typecheck`: PASS.
- Fechamento final `npm run test:unit`: PASS — 75 arquivos, 757 testes.
- Fechamento final `npm run build`: PASS.
- Fechamento final `npm test`: PASS — 179/179 casos Playwright após typecheck/build.
- Fechamento final `npm run docs:api:lint`: PASS.
- Fechamento final `npm run docs:api:check-drift`: PASS — 13 rotas reconciliadas.
- Fechamento final `npm run test:epic14:fidelity`: PASS — 8/8.
- Fechamento final `npm run test:epic15:fidelity`: PASS — 9/9.
- Fechamento final `npm run test:a11y`: PASS — 9/9.
- Fechamento final `npm run purge:gate`: PASS — 337 arquivos, zero Mantine/Emotion.
- Fechamento final `npm run bundle:check`: PASS — 625.8 KB gzip / 1000 KB; maior chunk 79.3 KB / 175 KB.

### Completion Notes List

- Outputs 18.1/18.2 consumidos: matriz de rastreabilidade, gaps, decision log visual, matriz rota/canvas/spec e findings F-AUTH-03/F-TK-01; diff limitado ao F-AUTH-03 e drift documental.
- Harness Epic15 usa exclusivamente `POST /api/auth/ssr-session`; cookies permanecem no `BrowserContext` e tokens não são persistidos/expostos ao browser.
- Caso de credencial inválida confirmou `401`, payload `{ ok: false }` e cookie jar vazio.
- Nenhuma ocorrência de `SESSION_COOKIE`, `encodeSession`, `localStorage` ou envio de `x-rh-session` permanece nos dois specs/helper migrados.
- OpenAPI, README, documentação de Edge Functions e ReDoc removem a função `auth-session` ausente; inventário compara paths e métodos sem contagem fixa.
- Snapshot histórico: Stories 15.2–15.8 inicialmente mantiveram ACs abertos/status intactos e receberam waiver explícito para provisionar ambiente isolado e reexecutar o gate. Estado vigente: waiver resolvido, ACs marcados como aceitos e `npm run test:epic15:fidelity` PASS 9/9.
- Bloqueio observado inicialmente: Docker foi iniciado, porém a stack Supabase local tinha somente o banco ativo; Auth/Kong estavam parados. O alvo configurado não satisfaz as guardas `E2E_*`, portanto criar/alterar fixture foi corretamente recusado.
- Após a tentativa de reparação, nem o container do banco foi recriado: o CLI fica bloqueado no subprocesso `supabase-go` antes de criar a stack. Não foi feita reconstrução manual sem artefato declarado.
- Nenhum verdict arquitetural/QA foi inventado; nenhum pre-deployment, push, PR ou deploy foi executado.
- Follow-up: `route-auth` agora valida autorização por papel e GET/DELETE de sessão usando somente `/api/auth/ssr-session`; `smoke-crawl` autentica admin/student/instructor pelo helper SSR compartilhado. Nenhum teste foi removido ou reduzido.

### File List

- **Modificado:** `tests/helpers/integration-env.ts`
- **Modificado:** `tests/epic15-admin-dashboard-fidelity.spec.ts`
- **Modificado:** `tests/epic15-blog-pages.spec.ts`
- **Modificado:** `tests/route-auth.spec.ts`
- **Modificado:** `tests/smoke-crawl.spec.ts`
- **Modificado:** `tests/admin-crud.spec.ts`
- **Modificado:** `tests/api-contract.spec.ts`
- **Modificado:** `tests/login-errors.spec.ts`
- **Modificado:** `src/components/next-page-shell.tsx`
- **Modificado:** `src/lib/supabase/session.ts`
- **Regenerado:** `tests/ui-governance.spec.ts-snapshots/login-card-governance-functional-darwin.png`
- **Modificado:** `src/__tests__/api/openapi-drift.test.ts`
- **Modificado:** `docs/api/openapi.yaml`
- **Modificado:** `docs/api/README.md`
- **Modificado:** `docs/api/edge-functions.md`
- **Regenerado:** `public/api-docs.html`
- **Modificados (waiver):** `docs/stories/2026-07-17-epic15-story2-cursos-fidelidade-total.md` a `docs/stories/2026-07-17-epic15-story8-conteudo-configuracoes-fidelidade-total.md`
- **Modificado:** `docs/stories/2026-07-19-epic18-story3-restaurar-gates.md`

## Architecture Review

### Review — 2026-07-19 — `@architect` (Aria)

**Verdict:** PASS

**Rationale:** A correção preserva ADR-016/REC-204: Supabase SSR continua autoridade única, sem HMAC/demo-auth, sem `x-rh-session` e sem tokens no browser. O ajuste `Secure` é condicionado exclusivamente ao gate explícito `E2E_LOCAL_SUPABASE=1`, necessário para o bundle Playwright em modo production contra Supabase local, sem inferência por URL e sem relaxar produção real. O shell admin e o `AppStoreProvider` renderizam desde o primeiro render; conteúdo admin dinâmico usa fallback explícito até o mount, sem página vazia durante SSR/hidratação e sem alterar autorização server-side (`getServerSession` permanece no layout). OpenAPI deriva da superfície real e a remoção documental de `auth-session` reflete o código.

**Risco residual:** baixo. Pre-deployment e qualquer push/deploy seguem exclusivos de `@devops`.

## QA Results

### Review — 2026-07-19 — `@qa` (Quinn)

**Verdict:** PASS

**Resumo:** AC1–AC9 atendidos. A suíte usa SSR vigente, falha fechado para credenciais inválidas, não reintroduz autoridade legada, OpenAPI está reconciliada e o gate agregado passou.

**Evidência de gate:**
- `npm test` — PASS, 179/179.
- `npm run test:unit` — PASS, 75 arquivos / 757 testes.
- `npm run test:epic14:fidelity` — PASS, 8/8.
- `npm run test:epic15:fidelity` — PASS, 9/9.
- `npm run test:a11y` — PASS, 9/9.
- `npm run docs:api:lint` / `npm run docs:api:check-drift` — PASS.
- `npm run purge:gate` / `npm run bundle:check` — PASS.

**Risco residual:** baixo. `devops:all` e operação remota não foram executados por autoridade; devem ser feitos por `@devops` se o objetivo voltar a deploy.

## Handoff

- **Fechamento:** `@po` fechou a Story 18.3 como Done após `@architect` PASS, `@qa` PASS e gates verdes.
- **Próximo agente:** `@devops`, somente se o usuário solicitar pre-deployment/push/deploy.
- **Condição:** nenhum push, PR, release ou deploy foi executado nesta story.
