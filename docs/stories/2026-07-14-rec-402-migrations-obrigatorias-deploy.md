# Story REC-402: Tornar migrations etapa obrigatória do deploy

## Status

In Progress

## Executor Assignment

executor: "@data-engineer + @devops"
quality_gate: "@qa"
quality_gate_tools:
- validação da cadeia completa de migrations em Supabase local isolado
- teste estrutural do grafo CI → migration → Functions → frontend
- parser YAML dos workflows GitHub Actions
- `npm run test:db`
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm test`
- `npm run build`
- CodeRabbit e inspeção sanitizada sem exibir secrets

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 3 — Identidade e entrega segura
- **Prioridade:** P0
- **Estimativa:** M, entre um e dois dias de esforço focado
- **Finding:** FND-14
- **Requisitos:** NFR-06, NFR-08, NFR-09, CON-03 e CON-05
- **Critérios da épica:** AC-17.20 e AC-17.21; prepara a execução integral do gate G4
- **Dependência:** REC-401 `Done`, gate QA PASS

## Story

**As a** responsável pela entrega da RH Cursos,
**I want** que a aplicação de migrations seja uma etapa obrigatória, serializada e auditável do pipeline produtivo,
**so that** Functions e frontend nunca sejam publicados contra um schema pendente, incompatível ou cuja migration tenha falhado.

## Contexto e diagnóstico confirmado

REC-401 criou uma única entrada produtiva e encadeou CI, Functions e frontend. A
cadeia ainda não possui um job de banco: `.github/workflows/production-pipeline.yml`
chama Functions imediatamente após o CI.

O repositório contém 24 migrations versionadas em `supabase/migrations/`. O gate
`npm run test:db` já inicia Supabase local, executa `db reset`, aplica a cadeia
cronológica, roda pgTAP em `supabase/tests/database/` e valida concorrência.
Entretanto, nenhuma etapa produtiva executa `supabase db push` antes de publicar
código.

A CLI local está fixada na versão `2.105.0`. Nessa versão, `supabase db push`
aplica somente migrations pendentes no projeto vinculado, registra cada versão
em `supabase_migrations.schema_migrations` e ignora versões já aplicadas. O modo
não interativo exige `SUPABASE_ACCESS_TOKEN`, referência do projeto e senha do
banco em secrets do GitHub Actions.

REC-402 corrige a orquestração. Ela não inventa alteração de schema nem cria uma
migration vazia: qualquer SQL novo precisa de requisito funcional próprio e da
autoridade de `@data-engineer`.

## Escopo

### Incluído

- Criar workflow reutilizável e não acionável diretamente para aplicar migrations.
- Fixar checkout, Supabase CLI e permissões mínimas.
- Receber somente `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF` e `SUPABASE_DB_PASSWORD` por secrets nomeados.
- Executar `supabase link` e `supabase db push --linked --yes` sem colocar senha em argumento ou log.
- Adicionar escopo `database` à detecção de mudanças do pipeline produtivo.
- Executar migrations quando houver mudança de banco, Functions ou frontend; despacho manual também exige migration.
- Encadear CI → migration → Functions → frontend no mesmo SHA.
- Bloquear toda publicação posterior se migration falhar, for cancelada ou não concluir com sucesso.
- Preservar deploy omitido para commits somente documentais.
- Executar a cadeia local completa e provar convergência/idempotência sem alterar histórico remoto.
- Adicionar regressão automatizada do grafo e do contrato de secrets.

### Fora do escopo

- Criar migration de schema sem requisito de domínio associado.
- Usar `--include-all`, `--include-seed` ou `migration repair` automaticamente para mascarar drift.
- Aplicar migration, configurar secret, alterar branch protection ou executar deploy remoto sem autorização REC-001.
- Executar rollback destrutivo de banco; correções seguem roll-forward.
- Alterar RLS, grants, RPCs ou dados produtivos — stories REC-101 a REC-107.
- Implementar smoke pós-deploy, alertas ou observabilidade completa — REC-408/G4.
- Habilitar ou desabilitar integração Supabase/GitHub externa sem inventário operacional autorizado.

## Acceptance Criteria

1. **Workflow de migration sem bypass direto**
   `.github/workflows/apply-migrations.yml` existe, aceita somente `workflow_call`
   e não possui `push`, `pull_request` ou `workflow_dispatch` capaz de alterar banco.

2. **Contrato mínimo de credenciais**
   O workflow declara como obrigatórios apenas `SUPABASE_ACCESS_TOKEN`,
   `SUPABASE_PROJECT_REF` e `SUPABASE_DB_PASSWORD`. O pipeline os mapeia
   individualmente, sem `secrets: inherit`, valor hardcoded, summary sensível ou
   senha interpolada na linha de comando.

3. **CLI e actions imutáveis**
   Actions externas estão fixadas em SHA, Supabase CLI permanece na versão
   `2.105.0`, `permissions` é `contents: read`, o job usa o environment protegido
   `production` e concorrência de migration não cancela uma execução produtiva
   já iniciada.

4. **Migration obrigatória antes de qualquer publicação**
   Quando database, Functions ou frontend exigirem entrega, o pipeline só pode
   avaliar os deploys depois de `migrate-database` concluir com `success`.

5. **Ordem canônica preservada**
   O grafo produtivo é CI → migration → Functions → frontend. Quando Functions
   não for necessária, frontend ainda depende de migration bem-sucedida e trata
   Functions apenas como `skipped`, nunca como sucesso artificial.

6. **Falha de migration bloqueia código**
   Resultado `failure`, `cancelled` ou ausência de `success` em migration impede
   tanto o deploy de Functions quanto o deploy de frontend; não existe
   `continue-on-error`, fallback ou reparo automático.

7. **Mudança somente de banco**
   Um commit que altera `supabase/migrations/**` executa CI e migration, mas não
   publica Functions nem frontend quando seus escopos não mudaram.

8. **Mudança somente documental**
   Um commit sem mudança de database, Functions ou frontend executa CI e mantém
   migration e deploys omitidos. Uma base de comparação desconhecida continua
   fail-closed, selecionando todos os escopos.

9. **Aplicação cronológica e convergente**
   O workflow vincula o projeto e executa `supabase db push --linked --yes`.
   Drift de histórico falha o job; o pipeline não usa `--include-all` nem
   `migration repair`. Uma segunda execução contra o mesmo estado termina sem
   reaplicar migrations registradas.

10. **Cadeia local validada por `@data-engineer`**
    `npm run test:db` passa do zero em Supabase local isolado, aplicando todas as
    migrations, os testes pgTAP e o teste de concorrência. Uma segunda aplicação
    local não encontra migration pendente nem produz alteração de schema.

11. **Regressão automatizada do pipeline**
    Teste versionado valida gatilhos, secrets, detecção `database`, dependências,
    ordem, bloqueio de falha, caso database-only, caso docs-only e actions fixadas.

12. **Gates constitucionais verdes e evidência honesta**
    `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm test` e
    `npm run build` passam, além de `npm run test:db`. A story registra prova
    local sanitizada e não declara migration/deploy remoto executado sem
    autorização operacional.

## Tasks / Subtasks

- [x] **Task 1 — Validar o contrato de migrations existente com `@data-engineer`** (AC: 9, 10)
  - [x] Inventariar migrations versionadas e confirmar ordem cronológica sem editar versões já aplicadas.
  - [x] Executar `npm run test:db` do zero no Supabase local isolado.
  - [x] Executar segunda aplicação local e registrar convergência sem migration pendente.
  - [x] Confirmar que REC-402 não requer novo SQL; se surgir delta de schema, interromper e criar requisito/story própria.

- [x] **Task 2 — Congelar o novo contrato com teste estrutural test-first** (AC: 1–9, 11)
  - [x] Adicionar teste que inicialmente falhe porque migration ainda não existe no grafo.
  - [x] Cobrir workflow reutilizável, secrets nomeados e ausência de bypass.
  - [x] Cobrir CI → migration → Functions → frontend e resultados `success`/`skipped`.
  - [x] Cobrir database-only, docs-only, despacho manual e base desconhecida fail-closed.

- [x] **Task 3 — Criar workflow reutilizável de migrations** (AC: 1–3, 9)
  - [x] Criar `.github/workflows/apply-migrations.yml` com `workflow_call` exclusivo.
  - [x] Fixar checkout e `supabase/setup-cli` em SHA e CLI `2.105.0`.
  - [x] Executar o job no environment protegido `production` com concorrência fail-closed.
  - [x] Vincular projeto usando secrets em `env`, sem ecoar ou passar senha em argumento.
  - [x] Executar `supabase db push --linked --yes` sem reparo ou seed implícito.
  - [x] Produzir summary apenas com SHA, nome do job e resultado não sensível.

- [x] **Task 4 — Inserir migration no pipeline canônico** (AC: 4–8)
  - [x] Adicionar output `database` à detecção de mudanças para `supabase/migrations/**`.
  - [x] Selecionar database, Functions e frontend no despacho manual e na estratégia fail-closed.
  - [x] Chamar migration após CI quando qualquer escopo produtivo exigir entrega.
  - [x] Fazer Functions depender de CI, changes e migration bem-sucedida.
  - [x] Fazer frontend depender de CI, changes, migration e Functions quando aplicável.
  - [x] Mapear somente os três secrets de banco ao workflow chamado.

- [ ] **Task 5 — Validar e documentar evidências** (AC: 10–12)
  - [x] Parsear todos os YAMLs de entrega.
  - [x] Executar teste estrutural direcionado e suíte unitária completa.
  - [x] Executar `npm run test:db` e gates constitucionais completos.
  - [ ] Executar CodeRabbit no delta sem findings CRITICAL/HIGH.
  - [x] Atualizar File List e Dev Agent Record sem incluir secrets ou PII.
  - [ ] Solicitar veredito independente de `@qa`.

## Dev Notes

### Insights da REC-401

- REC-401 está `Done` e criou o único gatilho `push main`/`workflow_dispatch` em `.github/workflows/production-pipeline.yml`.
- CI e deploys são workflows reutilizáveis; os deploys não possuem gatilho direto.
- O pipeline já trata base de diff desconhecida selecionando Functions e frontend, e já serializa Functions antes do frontend.
- QA removeu `secrets: inherit`; REC-402 deve manter mapas explícitos por workflow.
- Gate: `docs/qa/gates/rec-401-encadear-ci-deploy.yml`.

### Arquitetura e ferramentas confirmadas

- Migrations ficam em `supabase/migrations/` e são a autoridade versionada de schema. [Source: `docs/architecture/system-architecture.md#3-database-architecture-supabase`]
- O fluxo documentado usa `supabase migration create` e `supabase db push`. [Source: `docs/architecture/system-architecture.md#8-development-workflow`]
- A aplicação usa Cloudflare Workers para frontend e Supabase para banco/Functions. [Source: `docs/architecture/system-architecture.md#6-deployment-strategy`]
- O gate local de banco está em `scripts/test-db.mjs` e executa reset, pgTAP e concorrência.
- A CLI instalada e usada pelo CI é `2.105.0`; `db push` suporta `--linked`, `--yes` e `--dry-run`.
- A documentação oficial do Supabase recomenda migrations versionadas, `db reset` para teste local e `db push` serializado em CI para produção.

### Autoridade e separação de responsabilidades

- `@data-engineer` valida migrations, histórico, idempotência e segurança de banco; não opera push/deploy remoto.
- `@devops` altera workflows, configura o encadeamento e, quando autorizado, opera secrets e execução remota.
- `@qa` emite o gate independente e pode bloquear a story.
- REC-402 não autoriza mudança remota; CON-03 e CON-05 permanecem vigentes. [Source: `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md#requisitos-consolidados`]

### Restrições de segurança

- Nunca imprimir `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, connection string ou valor de secret.
- Não passar senha na linha de comando; usar variável de ambiente reconhecida pela CLI.
- Não executar `migration repair`, `--include-all`, reset remoto ou rollback destrutivo automaticamente.
- Não editar arquivo de migration já registrado; correções são novas migrations forward-only.
- Falha ou drift interrompe o pipeline antes de qualquer publicação.

### Alinhamento de estrutura

- Criar: `.github/workflows/apply-migrations.yml`.
- Modificar: `.github/workflows/production-pipeline.yml`.
- Criar preferencialmente: `src/__tests__/ci/production-migrations-workflow.test.ts`.
- Reutilizar sem alterar o contrato: `scripts/test-db.mjs`, `supabase/tests/database/` e `supabase/migrations/`.
- Não criar migration SQL, script de seed ou utilitário de reparo sem requisito adicional.

## Testing

### Teste estrutural local

- Provar que migration aceita somente `workflow_call`.
- Provar que secrets são nomeados e `secrets: inherit` não existe.
- Provar que `migrate-database` depende de CI e changes.
- Provar que Functions depende de migration `success`.
- Provar que frontend depende de migration `success` e Functions `success|skipped`.
- Provar que migration-only não publica código e docs-only não aplica banco.
- Provar que despacho manual e base desconhecida selecionam database.
- Provar que actions externas estão fixadas em SHA e CLI em versão exata.

### Banco local

1. Executar `npm run test:db` em Supabase local isolado.
2. Confirmar todas as migrations aplicadas em ordem e pgTAP/concurrency verdes.
3. Executar `supabase db push --local --yes` duas vezes no mesmo estado.
4. Confirmar segunda execução sem migration pendente e sem alteração de schema.
5. Não capturar dump contendo dado pessoal; registrar somente versão/contagem/resultados.

### Gates finais

- teste Vitest direcionado do grafo
- parser YAML dos workflows
- `npm run test:db`
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm test`
- `npm run build`
- CodeRabbit sem findings CRITICAL/HIGH

## Observabilidade e evidência remota

- Todos os jobs devem referenciar o mesmo `github.sha`.
- Summary pode registrar SHA, status e convergência, nunca secrets ou connection string.
- A prova negativa deve mostrar Functions/frontend omitidos quando migration falhar; não é necessário provocar publicação real.
- Homologação e produção só são executadas por `@devops` após autorização REC-001.
- Antes de habilitar a cadeia remota, `@devops` deve confirmar que nenhuma integração Supabase/GitHub externa publica migrations em paralelo.

## Roll-forward / Rollback

- **Roll-forward obrigatório:** migration corretiva nova, compatível e versionada.
- **Falha antes de aplicar:** manter deploy bloqueado, corrigir a migration e reexecutar o mesmo pipeline.
- **Falha após aplicação parcial:** preservar evidência sanitizada, interromper código e produzir migration corretiva; não usar rollback destrutivo automático.
- **Rollback seguro do workflow:** desabilitar o pipeline produtivo inteiro, nunca restaurar deploy de código sem gate de banco.

## Dependências

- **Concluída:** REC-401 `Done` e QA PASS.
- **Operacional:** REC-001 para secrets, homologação, produção e inventário de integração externa.
- **Qualidade:** REC-403/baseline constitucional verde.
- **Bloqueia:** conclusão de AC-17.20 e execução completa do gate G4.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> A validação usa CodeRabbit CLI disponível, revisão manual, testes estruturais,
> gate de banco e veredito independente de `@qa`.

### Story Type Analysis

- **Primary Type:** Deployment / CI/CD
- **Secondary Types:** Database, Security
- **Complexity:** Média — três sistemas ordenados e credenciais de produção, sem mudança de schema
- **Primary Agents:** `@data-engineer`, `@devops`
- **Quality Gate:** `@qa`

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-14 | 0.1 | Draft criado a partir de FND-14/AC-17.20, REC-401 e do contrato real da Supabase CLI 2.105.0; separado de qualquer migration de domínio. | @sm (River) |
| 2026-07-14 | 1.0 | **GO — 10/10; Draft → Ready.** Doze ACs testáveis cobrem workflow reutilizável, environment protegido, secrets mínimos, ordem CI → migration → Functions → frontend, drift fail-closed, convergência local, database-only/docs-only e gates completos. A dupla autoridade `@data-engineer + @devops` e o gate `@qa` derivam diretamente da épica/Constitution, apesar da matriz legada admitir apenas um executor e não listar QA. Bloqueadores documentais: 0. | @po (Pax) |
| 2026-07-14 | 1.1 | Workflow de migrations e encadeamento produtivo implementados; banco local, contratos CI/CD, actionlint, lint, tipos, unitários, build e E2E verdes. CodeRabbit/QA permanecem pendentes antes de `Ready for Review`. | @data-engineer (Dara) + @devops (Gage) |

## File List

### Criado

- `docs/stories/2026-07-14-rec-402-migrations-obrigatorias-deploy.md`
- `.github/workflows/apply-migrations.yml`
- `src/__tests__/ci/production-migrations-workflow.test.ts`

### Modificado

- `.github/workflows/production-pipeline.yml`
- `src/__tests__/ci/production-workflow.test.ts`

### Referências somente leitura

- `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md`
- `docs/stories/2026-07-14-rec-401-encadear-ci-deploy.md`
- `docs/qa/gates/rec-401-encadear-ci-deploy.yml`
- `docs/architecture/system-architecture.md`
- `.github/workflows/production-pipeline.yml`
- `.github/workflows/deploy-functions.yml`
- `.github/workflows/deploy-frontend.yml`
- `.github/workflows/ci.yml`
- `scripts/test-db.mjs`
- `supabase/config.toml`
- `supabase/migrations/`
- `supabase/tests/database/`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex — personas `@data-engineer` (Dara) e `@devops` (Gage).

### Debug Log References

- Test-first: o teste REC-402 falhou inicialmente com `ENOENT` para `.github/workflows/apply-migrations.yml`.
- Banco isolado: 24/24 migrations alinhadas, 25 testes pgTAP verdes e teste de concorrência verde.
- Convergência: duas execuções consecutivas de `supabase db push --local --yes` retornaram `Local database is up to date`.
- Contratos direcionados: 2 arquivos e 9/9 cenários verdes.
- YAML: cinco workflows carregados pelo parser Ruby/Psych; os cinco também passaram no actionlint 1.7.12.
- Gates: lint, typecheck, 48 arquivos/536 testes unitários, build e 174/174 Playwright verdes.
- CodeRabbit: duas tentativas receberam rate limit recuperável; nenhuma foi contabilizada como aprovação.

### Completion Notes

- Criado workflow reutilizável de migration com environment `production`, concorrência sem cancelamento, actions fixadas e CLI 2.105.0.
- Secrets de banco são mapeados individualmente; senha permanece somente em `env` e não aparece em comando ou summary.
- O pipeline detecta database, exige migration para qualquer escopo produtivo e preserva docs-only sem mutação.
- Functions e frontend exigem `migrate-database.result == 'success'`; database-only não publica código.
- Drift falha fechado: não há `--include-all`, `--include-seed`, `migration repair` ou `continue-on-error`.
- Nenhum SQL, secret remoto, migration remota ou deploy foi criado/executado.

## QA Results

_A preencher por `@qa`._
