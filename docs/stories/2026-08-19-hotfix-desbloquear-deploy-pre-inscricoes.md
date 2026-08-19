# Hotfix: desbloquear deploy da correção de pré-inscrições

## Status

Approved

## Executor Assignment

```yaml
executor: "@devops"
quality_gate: "@architect"
quality_gate_tools:
  - production-pipeline
  - smoke-crawl
  - test
  - lint
  - typecheck
  - build
  - audit
  - secretlint
  - workflow-dispatch
  - cloudflare-deployments
  - sanitized-evidence-report
  - post-deploy-reload
assignment_basis: "executor-assignment: infra_ci_cd_deploy"
```

## Tracking

> ⚠️ **ClickUp não sincronizado:** a integração ClickUp não está disponível nesta sessão. Conforme a regra do workflow, esta story foi criada localmente sem bloquear o hotfix.

## Story

**As a** responsável pela operação administrativa da RH Cursos,
**I want** executar o pipeline e o deploy da correção de pré-inscrições com um smoke público que não dependa de slug mutável,
**so that** as três inscrições com status `Pendente` sejam exibidas no admin após reload, com validação de produção somente leitura e rollback seguro.

## Contexto

- A REC-303 está `Done`, e a correção funcional de hidratação das pré-inscrições após reload está no commit `8ea1e82`, já contido em `main`.
- O banco possui três inscrições com status `Pendente`, mas elas continuam sem aparecer na interface administrativa porque a correção ainda não chegou a produção.
- O run `32264880709` do Production Pipeline falhou porque `tests/smoke-crawl.spec.ts` usava um slug obsoleto que retornou `404`; por consequência, `deploy-frontend` foi pulado.
- O hotfix local `85161c8` remove a dependência desse slug por meio de descoberta dinâmica de curso publicado.
- O hotfix local já passou por `test` (184 cenários), lint, typecheck, build, smoke (12/12), audit e secretlint.
- A REC-409 AC4 determina que o smoke do pipeline de produção permaneça no ambiente `production`, limitado a rotas públicas e sem habilitar escritas no banco.
- O push/merge de alterações restritas a `tests/` e `docs/` dispara o Production Pipeline automático, mas a detecção de escopo existente não marca `frontend=true`; portanto, esse run executa CI sem publicar o frontend.
- Para efetivar o deploy, `@devops` deve acionar `workflow_dispatch` em `.github/workflows/production-pipeline.yml` no SHA final. Esse comportamento já existe no workflow: o dispatch força `database=true`, `functions=true` e `frontend=true`, preservando, sem bypass, a ordem CI → migrations convergentes → functions → frontend. A reexecução completa é um risco controlado pelos gates e dependências existentes.
- O rollback de frontend deve usar o deployment/version ID do Cloudflare e o procedimento verificado em `docs/DEPLOYMENT.md`: `wrangler deployments list` seguido de `wrangler rollback`. Restaurar apenas um SHA Git não é o procedimento de rollback desta story.

## Acceptance Criteria

1. O smoke de produção descobre dinamicamente um curso publicado sem depender de slug mutável e falha com mensagem explícita quando o catálogo publicado está vazio.
2. O smoke permanece público e estritamente read-only: não autentica, não habilita flags de escrita e não cria, altera ou remove dados, preservando a REC-409 AC4.
3. Os gates técnicos ficam verdes para o SHA candidato final: test com 184 cenários, lint, typecheck, build, smoke 12/12, audit e secretlint.
4. O push/merge do conjunto `tests/` + `docs/` gera o run automático esperado com CI e sem deploy de frontend; esse run não é tratado como a promoção final.
5. Depois do run automático, `@devops` executa `workflow_dispatch` de `.github/workflows/production-pipeline.yml` no SHA candidato final. O dispatch força `database/functions/frontend=true` e conclui, sem bypass, a ordem CI → migrations convergentes → functions → frontend; URL/ID do run, SHA e resultado de cada etapa ficam registrados.
6. O SHA candidato final não é igual a `8ea1e82` nem a `85161c8`: ele contém ambos na ancestralidade e também os novos commits documentais da story e da evidência sanitizada.
7. Antes do dispatch, um relatório sanitizado e versionado é criado em `docs/history/reports/2026-08-19-hotfix-pre-inscricoes-deploy.md`, contendo somente a evidência agregada da query read-only: `total=3`, `Pendente=3` e `latestCreatedAt=2026-08-18T16:53:00.088272+00:00`, sem PII.
8. Após o deploy, uma verificação administrativa com reload completo confirma a exibição das três pré-inscrições `Pendente`, sem depender de estado previamente hidratado no navegador.
9. Antes do deploy de frontend, `@devops` registra o deployment/version ID atual do Cloudflare usando `wrangler deployments list`. Se a verificação pós-deploy falhar, executa `wrangler rollback` para a versão anterior e registra o resultado; nenhum registro de inscrição é alterado ou removido durante o rollback.
10. A entrega não inclui alteração de schema, migration, RLS, dados de catálogo ou regra de negócio; qualquer falha que exija mudança funcional retorna para uma story de implementação separada.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled in `.aiox-core/core-config.yaml`.
> Quality validation will use the independent `@architect` gate and the technical checks listed in this story.

## Tasks / Subtasks

- [x] Preparar o candidato documental e a evidência sanitizada (AC: 1, 2, 6, 7)
  - [x] Confirmar que o SHA candidato final contém `8ea1e82` e `85161c8` na ancestralidade, sem confundi-lo com nenhum desses dois SHAs.
  - [x] Criar `docs/history/reports/2026-08-19-hotfix-pre-inscricoes-deploy.md` com a evidência agregada da query read-only: `total=3`, `Pendente=3`, `latestCreatedAt=2026-08-18T16:53:00.088272+00:00`.
  - [x] Sanitizar o relatório: não incluir nome, e-mail, telefone, documento, identificador individual ou qualquer outra PII.
  - [x] Versionar a story e o relatório antes de definir o SHA final do dispatch.
  - [x] Confirmar que a alteração do smoke está limitada à descoberta pública e read-only de curso publicado e à falha explícita para catálogo vazio.
- [ ] Publicar os commits pelos controles exclusivos de `@devops` e observar o run automático (AC: 4, 6)
  - [ ] Enviar o SHA candidato final e realizar PR/merge conforme a política vigente do repositório.
  - [ ] Registrar o run automático disparado pelo push/merge de `tests/` + `docs/`.
  - [ ] Confirmar que o CI passou e que o frontend não foi implantado nesse run por a detecção de escopo não marcar `frontend=true`.
- [ ] Acionar o deploy completo pelo workflow existente (AC: 3, 5, 6)
  - [ ] Em `.github/workflows/production-pipeline.yml`, acionar `workflow_dispatch` para o SHA candidato final somente depois do run automático.
  - [ ] Confirmar no run que o dispatch resolveu `database=true`, `functions=true` e `frontend=true`.
  - [ ] Confirmar a ordem sem bypass: CI → migrations convergentes → functions → frontend.
  - [ ] Registrar URL/ID do run manual, SHA executado e resultado de cada job, incluindo `deploy-frontend`.
- [ ] Validar os gates técnicos do SHA candidato final (AC: 3, 5)
  - [ ] Confirmar test 184, lint, typecheck, build, smoke 12/12, audit e secretlint no SHA candidato final.
  - [ ] Confirmar que a execução remota não reintroduz o `404` causado pelo slug obsoleto.
- [ ] Preparar e, se necessário, executar o rollback Cloudflare (AC: 9, 10)
  - [x] Antes do deploy de frontend, executar `wrangler deployments list` e registrar o deployment/version ID atual e o alvo anterior de rollback.
  - [ ] Se a verificação pós-deploy falhar, executar `wrangler rollback --message "Rollback hotfix pre-inscricoes"` para a versão anterior verificada.
  - [ ] Registrar o deployment/version ID restaurado e o resultado da verificação após rollback.
  - [ ] Não usar restauração de SHA Git como substituto para o rollback de deployment do Cloudflare.
- [ ] Executar a verificação pós-deploy (AC: 2, 7, 8, 9)
  - [ ] Fazer reload completo da área administrativa.
  - [ ] Confirmar e registrar a exibição das três inscrições `Pendente`.
  - [ ] Confirmar que o smoke acessou apenas rotas públicas e não escreveu no banco.
- [ ] Submeter evidências ao quality gate independente `@architect` (AC: 1-10)
  - [ ] Entregar os resultados dos gates, do pipeline/deploy, do reload e, se usado, do rollback.
  - [ ] Obter o veredito arquitetural independente antes de marcar a story como `Done`.
  - [ ] Encaminhar a evidência pós-deploy a `@qa` como revisão adicional, sem substituir o gate obrigatório de `@architect`.

## Dev Notes

### Evidências de entrada

- **REC-303:** status `Done`; o fix funcional relevante está em `8ea1e82`. [Fonte: `docs/stories/2026-07-17-rec-303-read-models-alunos-inscricoes.md#status`]
- **REC-409 AC4:** smoke de produção no ambiente `production`, limitado a rotas públicas e sem escritas no banco. [Fonte: `docs/stories/2026-08-03-rec-409-isolar-e2e-supabase-ci.md#acceptance-criteria`]
- **Falha operacional:** Production Pipeline run `32264880709`; `tests/smoke-crawl.spec.ts` encontrou `404` em slug obsoleto e `deploy-frontend` foi pulado.
- **Fix do bloqueio:** `85161c8` implementa descoberta dinâmica de curso publicado em `tests/smoke-crawl.spec.ts`.
- **Baseline funcional em produção:** três inscrições com status `Pendente` devem ser observadas após reload quando `8ea1e82` estiver implantado.
- **Evidência agregada read-only:** `total=3`, `Pendente=3`, `latestCreatedAt=2026-08-18T16:53:00.088272+00:00`; nenhuma PII pode ser registrada.
- **Validação local já concluída:** test 184, lint, typecheck, build, smoke 12/12, audit e secretlint.
- **Dispatch completo existente:** `.github/workflows/production-pipeline.yml` define `workflow_dispatch` com `database/functions/frontend=true` e dependências que mantêm a ordem CI → migrations convergentes → functions → frontend. [Fonte: `.github/workflows/production-pipeline.yml#L1-L105`]
- **Rollback verificado:** `docs/DEPLOYMENT.md` orienta listar deployments com `wrangler deployments list` e reverter com `wrangler rollback`. [Fonte: `docs/DEPLOYMENT.md#rollback`]

### Limites de implementação

- Esta é uma story de deploy; não autoriza nova alteração de código.
- O SHA candidato final deve conter `8ea1e82` e `85161c8` na ancestralidade, mais os commits documentais da story e do relatório sanitizado; ele não deve ser descrito como se fosse igual a um desses commits.
- O smoke não pode usar slug fixo nem realizar escrita em produção.
- Catálogo vazio é erro explícito do smoke, não motivo para pular silenciosamente o cenário.
- O run automático sem frontend é comportamento esperado para mudanças restritas a `tests/` e `docs/`; o deploy final depende do `workflow_dispatch` completo, sem bypass de CI ou dos estágios intermediários.
- O dispatch completo reexecuta migrations convergentes, functions e frontend usando o workflow existente. Esse risco é controlado pela ordem e pelos gates já declarados no pipeline, não por uma mudança emergencial no workflow.
- O rollback operacional é por deployment/version ID do Cloudflare, não por troca de SHA Git.
- Uma necessidade de mudança funcional ou de dados bloqueia esta story e exige encaminhamento ao agente competente em uma story separada.

### Project Structure Notes

- Arquivo de smoke relevante: `tests/smoke-crawl.spec.ts`.
- Workflow existente a acionar: `.github/workflows/production-pipeline.yml`.
- Guia de rollback: `docs/DEPLOYMENT.md#rollback`.
- Relatório sanitizado a criar: `docs/history/reports/2026-08-19-hotfix-pre-inscricoes-deploy.md`.
- Não há mudança de estrutura do projeto, banco ou contrato público nesta story.

## Testing

### Cenários obrigatórios

1. Catálogo com curso publicado: o smoke descobre o curso e valida a rota pública sem slug fixo.
2. Catálogo publicado vazio: o smoke falha explicitamente e impede o deploy.
3. Segurança operacional: o smoke não autentica nem realiza escrita.
4. Regressão técnica: test 184, lint, typecheck, build, smoke 12/12, audit e secretlint verdes no SHA candidato final.
5. Run automático: push/merge de `tests/` + `docs/` executa CI e não publica frontend.
6. Dispatch completo: `database/functions/frontend=true`, com CI → migrations convergentes → functions → frontend e sem bypass.
7. Rastreabilidade do candidato: o SHA do dispatch contém `8ea1e82`, `85161c8` e os commits documentais posteriores.
8. Evidência read-only: relatório sanitizado registra `total=3`, `Pendente=3` e `latestCreatedAt=2026-08-18T16:53:00.088272+00:00`, sem PII.
9. Pós-deploy: reload completo exibe exatamente as três inscrições `Pendente` existentes.
10. Rollback: deployment/version ID anterior é obtido com `wrangler deployments list` e pode ser restaurado com `wrangler rollback`, sem mutação de dados.

## Story Draft Checklist Result

**Readiness:** READY
**Clarity score:** 10/10
**Major gaps:** nenhum bloqueador; sincronização ClickUp pendente por indisponibilidade da integração.

| Category | Status | Issues |
|---|---|---|
| 1. Goal & Context Clarity | PASS | Objetivo, valor, dependências e evidência da falha estão explícitos. |
| 2. Technical Implementation Guidance | PASS | Run automático sem frontend, dispatch completo, ordem dos estágios, relatório sanitizado e rollback Cloudflare estão delimitados. |
| 3. Reference Effectiveness | PASS | REC-303, REC-409 AC4, workflow de produção e procedimento de rollback apontam para fontes específicas; fatos críticos foram resumidos. |
| 4. Self-Containment Assessment | PASS | A story contém baseline, limites read-only, erro de catálogo vazio, semântica do SHA final, dispatch e rollback por deployment/version ID. |
| 5. Testing Guidance | PASS | Cenários locais, run automático, dispatch, evidência agregada, pós-deploy e rollback são mensuráveis. |
| 6. CodeRabbit Integration (conditional) | N/A | Integração não habilitada no `core-config.yaml`; gate independente `@architect` definido para Infra/CI/CD/Deploy. |

### Developer/Executor Perspective

- `@devops` consegue executar a story sem decisão funcional adicional: versionar story/relatório, observar o run automático sem frontend, acionar o dispatch completo, verificar produção e usar rollback Cloudflare se necessário.
- Evidências obrigatórias para fechamento: SHA final e sua ancestralidade, runs automático e manual, ordem dos jobs, resultado de `deploy-frontend`, gates técnicos, relatório agregado sem PII, prova do reload, deployment/version IDs e veredito de `@architect`; `@qa` realiza revisão pós-deploy adicional.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-08-19 | 0.1 | Draft local do hotfix para desbloquear pipeline/deploy da correção de pré-inscrições; checklist executado. | River (@sm) |
| 2026-08-19 | 0.2 | Quality gate ajustado para `@architect`, conforme o mapeamento de Infra/CI/CD/Deploy; `@qa` mantido somente como revisão pós-deploy adicional; checklist reexecutado. | River (@sm) |
| 2026-08-19 | 0.3 | NO-GO provisório incorporado: dispatch completo, rollback Cloudflare, relatório sanitizado, SHA final e seções obrigatórias do template; checklist reexecutado. | River (@sm) |
| 2026-08-19 | 0.4 | Validação PO estrita: GO. Story aprovada após confirmar dispatch canônico sem bypass, ordem CI → migrations → functions → frontend, rollback por deployment/version ID, evidência sanitizada versionada e conformidade com o template. | Pax (@po) |

## Dev Agent Record

### Agent Model Used

GPT-5 (Codex), persona Gage (`@devops`).

### Debug Log References

- `git merge-base --is-ancestor 8ea1e82 HEAD` e `git merge-base --is-ancestor 85161c8 HEAD` → PASS.
- `wrangler deployments list --json` → deployment sanitizado `e50133ef-d168-4987-a9b6-c39d3f34deb5`, versão ativa `fc2f8175-66cd-4736-b3de-9ed20218afe4`.
- Evidência agregada read-only registrada em `docs/history/reports/2026-08-19-hotfix-pre-inscricoes-deploy.md`, sem PII.
- IDs/URLs dos runs automático e manual serão registrados após execução real.

### Completion Notes List

- `8ea1e82` e `85161c8` foram confirmados na ancestralidade do candidato local.
- O ponto de rollback anterior ao deploy foi capturado antes de qualquer operação remota.
- A ordem efetiva dos jobs, o resultado pós-deploy e o novo deployment/version ID permanecem pendentes de execução real.

### File List

- `docs/stories/2026-08-19-hotfix-desbloquear-deploy-pre-inscricoes.md`
- `docs/history/reports/2026-08-19-hotfix-pre-inscricoes-deploy.md`

### Candidate SHA

O candidato local contém `8ea1e82`, `85161c8` e `dbf8c5f`. O SHA final será o merge commit em `main` que também contenha este relatório e será registrado antes do `workflow_dispatch`.

### Production Pipeline

_A preencher por `@devops` com os runs automático e `workflow_dispatch`, seus SHAs, jobs, scopes e resultados._

### Post-Deploy Evidence

_A preencher por `@devops` sem PII._

### Rollback Evidence

- Deployment anterior: `e50133ef-d168-4987-a9b6-c39d3f34deb5`.
- Versão ativa anterior: `fc2f8175-66cd-4736-b3de-9ed20218afe4` (100%).
- Rollback ainda não acionado; somente será executado se a verificação pós-deploy falhar.

## QA Results

_Revisão pós-deploy adicional a preencher por `@qa`. O quality gate obrigatório permanece com `@architect`._
