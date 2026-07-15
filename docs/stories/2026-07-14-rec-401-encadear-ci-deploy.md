# Story REC-401: Encadear CI e deploy de produção

## Status

Done

## Executor Assignment

executor: "@devops"
quality_gate: "@qa"
quality_gate_tools:
- validação estrutural dos workflows GitHub Actions
- teste unitário do grafo CI → deploy
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm test`
- `npm run build`
- inspeção sanitizada de execução GitHub Actions sem exibir secrets

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 3 — Identidade e entrega segura
- **Prioridade:** P0
- **Estimativa:** M, entre um e dois dias de esforço focado
- **Finding:** FND-14
- **Requisitos:** NFR-06, NFR-08, NFR-09, CON-03
- **Critérios da épica:** AC-17.20 e AC-17.21; prepara a cadeia exigida por AC-17.23
- **Gate relacionado:** G4 — pipeline normal

## Story

**As a** responsável pela entrega da RH Cursos,
**I want** que toda publicação produtiva dependa explicitamente de um CI bem-sucedido,
**so that** nenhum frontend ou Edge Function seja publicado a partir de um commit cujos gates falharam ou foram ignorados.

## Contexto e diagnóstico confirmado

O repositório possui três workflows independentes:

1. `.github/workflows/ci.yml` executa gates em `push` para `main`.
2. `.github/workflows/deploy-functions.yml` também executa diretamente em `push` para `main` quando paths de Supabase mudam.
3. `.github/workflows/deploy-frontend.yml` executa diretamente em `push` para `main` quando paths do app mudam.

Os dois workflows de deploy não possuem relação `needs`, `workflow_call` ou outra dependência verificável do resultado do CI. Assim, o GitHub pode iniciar publicação enquanto o CI ainda está executando ou mesmo quando um gate termina em falha. `workflow_dispatch` também permite acionar cada deploy isoladamente, contornando a prova agregada.

REC-401 corrige exclusivamente o encadeamento CI → deploy. A etapa obrigatória de migrations e a ordem migration → Functions → frontend pertencem a REC-402.

## Escopo

### Incluído

- Criar uma entrada canônica de produção para `push` em `main` e acionamento manual autorizado.
- Tornar o CI reutilizável pelo pipeline canônico sem duplicar a execução no mesmo commit.
- Tornar os workflows de frontend e Functions reutilizáveis e não acionáveis diretamente por `push`.
- Fazer os jobs de deploy dependerem do sucesso integral do CI.
- Preservar filtros de mudança ou substituí-los por detecção equivalente, fail-closed e testada.
- Quando frontend e Functions mudarem no mesmo commit, publicar Functions antes do frontend.
- Manter secrets somente em `secrets.*`, permissões mínimas e logs sem valores sensíveis.
- Adicionar teste automatizado que falhe se um deploy voltar a ter gatilho direto ou perder a dependência do CI.

### Fora do escopo

- Criar ou executar migrations: REC-402.
- Rotacionar credenciais, PATs, senhas ou HMAC: REC-002.
- Alterar branch protection ou executar deploy remoto sem autorização: REC-001/CON-03.
- Mudar a plataforma Cloudflare/Supabase ou a arquitetura da aplicação.
- Corrigir cobertura, OpenAPI, dependências ou CSP: REC-404, REC-406, REC-407 e REC-408.
- Declarar smoke pós-deploy completo: REC-402/REC-408 e gate G4.

## Acceptance Criteria

1. **Entrada canônica de produção**
   **Given** um `push` para `main` ou um acionamento manual autorizado,
   **when** o pipeline de produção inicia,
   **then** existe uma única cadeia versionada responsável por executar CI e decidir os deploys desse commit.

2. **CI falho bloqueia toda publicação**
   **Given** qualquer job obrigatório do CI com resultado diferente de sucesso,
   **when** o grafo de produção é avaliado,
   **then** nenhum job de deploy de Functions ou frontend pode iniciar.

3. **Deploys não possuem bypass direto**
   `.github/workflows/deploy-functions.yml` e `.github/workflows/deploy-frontend.yml` não podem manter gatilho `push` independente nem `workflow_dispatch` que publique sem passar pelo pipeline canônico. Eles devem ser chamados como workflows reutilizáveis.

4. **CI não duplica no mesmo push de main**
   **Given** um commit em `main`,
   **when** o pipeline canônico chama o CI,
   **then** o mesmo `push` não dispara uma segunda execução autônoma equivalente de `.github/workflows/ci.yml`.

5. **Detecção de mudança preservada**
   **Given** um commit que altera somente documentação ou arquivo fora dos escopos produtivos,
   **when** o CI passa,
   **then** os deploys permanecem omitidos; em acionamento manual, o comportamento explícito e documentado pode publicar ambos.

6. **Functions antecedem frontend quando ambos mudam**
   **Given** um commit com mudanças de backend e frontend,
   **when** o CI passa,
   **then** o deploy de frontend só inicia depois do deploy de Functions terminar com sucesso.

7. **Falha de Functions bloqueia frontend**
   **Given** que o deploy de Functions foi necessário e falhou,
   **when** o GitHub avalia o job de frontend,
   **then** o frontend não é publicado.

8. **Segredos e privilégios preservados**
   Nenhum valor de secret aparece no YAML, logs, summaries ou testes; tokens dos workflows usam permissões mínimas e secrets são recebidos somente pelo mecanismo do GitHub Actions.

9. **Regressão automatizada do grafo**
   Um teste versionado valida ao menos: gatilhos permitidos, `workflow_call`, dependência de CI, ordem Functions → frontend, comportamento de job ignorado e ausência de bypass direto.

10. **Gates constitucionais verdes**
    `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm test` e `npm run build` passam. A story não declara deploy remoto concluído apenas com teste local; a prova remota é sanitizada e executada por `@devops` quando autorizada.

## Tasks / Subtasks

- [x] **Task 1 — Congelar o contrato atual com teste estrutural** (AC: 1–9)
  - [x] Adicionar teste que reproduza os gatilhos independentes atuais.
  - [x] Validar que o teste falha antes da correção pelo motivo esperado.
  - [x] Cobrir CI reutilizável, deploys reutilizáveis, `needs` e ordem dos jobs.

- [x] **Task 2 — Tornar CI reutilizável sem duplicar main** (AC: 1, 2, 4)
  - [x] Adicionar `workflow_call` ao CI.
  - [x] Preservar PRs, `develop` e `feature/**`.
  - [x] Remover somente o gatilho autônomo redundante de `main`.

- [x] **Task 3 — Isolar workflows de deploy como componentes chamados** (AC: 2, 3, 8)
  - [x] Converter frontend para `workflow_call` com secrets declarados ou herança controlada.
  - [x] Converter Functions para `workflow_call` com secrets declarados ou herança controlada.
  - [x] Remover gatilhos diretos que contornem o pipeline canônico.

- [x] **Task 4 — Criar pipeline canônico e detecção de mudanças** (AC: 1–7)
  - [x] Criar workflow de produção para `main` e despacho manual.
  - [x] Chamar CI antes de qualquer deploy.
  - [x] Detectar escopos Functions/frontend sem imprimir diff sensível.
  - [x] Encadear frontend após Functions quando ambos forem necessários.
  - [x] Tratar job de Functions omitido sem transformar falha real em sucesso.

- [x] **Task 5 — Validar e documentar evidências** (AC: 8–10)
  - [x] Executar teste estrutural direcionado.
  - [x] Executar gates constitucionais completos.
  - [x] Atualizar File List e registrar resultado sanitizado.
  - [x] Solicitar veredito independente de `@qa`.

## Dev Notes

### Estado atual verificado

- `.github/workflows/ci.yml` possui `push.branches: [main, develop, feature/**]` e `pull_request` para `main/develop`.
- `.github/workflows/deploy-functions.yml` possui `push` em `main` com paths de `supabase/functions/**` e `workflow_dispatch`.
- `.github/workflows/deploy-frontend.yml` possui `push` em `main` com paths de app/frontend e `workflow_dispatch`.
- Nenhum deploy atual declara dependência do resultado do CI.
- O deploy de Functions configura secrets e publica quatro Functions.
- O deploy de frontend valida env, publica Cloudflare Worker e executa verificação de rotas.

### Restrições de implementação

- Não copiar valor de secret para teste, fixture, output ou summary.
- Não usar `continue-on-error` em CI/deploy/mutação de produção.
- Não usar `if: always()` sem também distinguir explicitamente `success`, `failure` e `skipped` dos jobs necessários.
- Não obter verde removendo jobs obrigatórios do CI.
- Não usar evento `workflow_run` sem fixar inequivocamente o SHA/branch testado; preferir chamada reutilizável no mesmo grafo.
- A migration obrigatória será inserida por REC-402 entre CI e Functions; REC-401 deve deixar ponto de extensão claro sem fingir que migration já existe.

### Estrutura sugerida

- `.github/workflows/ci.yml`
- `.github/workflows/deploy-functions.yml`
- `.github/workflows/deploy-frontend.yml`
- `.github/workflows/production-pipeline.yml` (nome final pode seguir convenção existente)
- `src/__tests__/ci/production-workflow.test.ts` ou local equivalente seguindo a suíte Vitest existente

### Referências

- [Fonte: `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md#onda-3--identidade-e-entrega-segura-t24-a-t72h`]
- [Fonte: `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md#acceptance-criteria-da-epica`]
- [Fonte: `.github/workflows/ci.yml`]
- [Fonte: `.github/workflows/deploy-functions.yml`]
- [Fonte: `.github/workflows/deploy-frontend.yml`]

## Testing

### Teste estrutural local

- Parsear ou inspecionar os workflows sem executar secrets.
- Provar que CI aceita `workflow_call` e não dispara autonomamente em `main`.
- Provar que deploys aceitam somente `workflow_call`.
- Provar que o pipeline canônico chama CI e depende de sucesso.
- Provar que frontend depende do resultado correto de Functions quando aplicável.
- Provar que mudança fora de escopo não publica.
- Provar que despacho manual é explícito e passa pelo CI.

### Gates finais

- teste Vitest direcionado do grafo
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm test`
- `npm run build`
- CodeRabbit sem findings CRITICAL/HIGH no delta

## Observabilidade e evidência remota

- Cada execução deve relacionar o mesmo `github.sha` entre CI e deploys.
- O summary pode registrar nomes de jobs, SHA e conclusão, nunca valores de secrets.
- A prova negativa deve mostrar deploys `skipped` quando CI falhar; não é necessário provocar publicação real para validar esse caminho.
- A prova de produção só ocorre sob autoridade de `@devops` e dentro do freeze/rollout definido por REC-001.

## Security Notes

- `permissions: contents: read` deve permanecer o default, elevando permissão somente no job que comprovar necessidade.
- Actions de terceiros devem ser fixadas em SHA ou manter o padrão de supply-chain aprovado pelo repositório.
- Secrets herdados por workflow reutilizável não podem ser passados para jobs que não publicam.
- Erro de secret/configuração deve falhar fechado antes de publicar.

## Dependências

- **Entrada operacional:** REC-001 com freeze/evidência ativa antes de alterar controles remotos.
- **Entrada de qualidade:** REC-403 Done e baseline constitucional verde.
- **Bloqueia:** REC-402 e o gate G4.
- **Não depende para preparação/teste local:** acesso a secrets ou permissão de deploy.

## Roll-forward / Rollback

- **Roll-forward preferido:** corrigir o grafo mantendo deploy suspenso até CI verde.
- **Rollback seguro:** desabilitar temporariamente o pipeline produtivo e preservar a indisponibilidade de deploy.
- **Rollback proibido:** restaurar deploy independente em `push`, usar `continue-on-error`, ignorar CI falho ou executar deploy manual direto.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> A validação usa revisão manual, teste estrutural, gates constitucionais e veredito independente de `@qa`.

### Story Type Analysis

- **Primary Type:** CI/CD / Security
- **Secondary Type:** Delivery orchestration
- **Complexity:** Média
- **Primary Agent:** `@devops`
- **Quality Gate:** `@qa`

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-14 | 0.1 | Draft criado a partir de FND-14/NFR-06/08/09, com separação explícita de REC-402 e teste estrutural do grafo CI → deploy. | @sm (River) |
| 2026-07-14 | 1.0 | **GO — 10/10; Draft → Ready.** Título/valor, rastreabilidade, escopo, dependências, dez ACs mensuráveis, tarefas, testes negativos, segurança e rollback estão completos. A separação REC-401/REC-402 impede antecipar migrations. `@qa` permanece quality gate por autoridade constitucional, apesar da tabela legada do validador. Bloqueadores documentais: 0. Implementação local autorizada; mudanças remotas continuam exclusivas de `@devops` e dependentes da REC-001. | @po (Pax) |
| 2026-07-14 | 1.1 | Pipeline canônico implementado com CI e deploys reutilizáveis, detecção fail-closed, ordem Functions → frontend, actions fixadas em SHA e regressão automatizada. Gates locais completos verdes; story enviada para revisão de QA sem executar deploy remoto. | @devops (Gage) |
| 2026-07-14 | 1.2 | **Story encerrada — Done.** Implementação nos commits `486a729` e `dda532c`; gate QA PASS em `docs/qa/gates/rec-401-encadear-ci-deploy.yml`, 5/5 contratos direcionados, 532/532 unitários e 174/174 Playwright. Execução remota permanece condicionada à REC-001 e não foi declarada. | @po (Pax) |
| 2026-07-15 | 1.3 | **Story fechada formalmente.** Encerramento do lifecycle `*close-story`: QA PASS confirmado (commits `486a729`/`dda532c`). Épica 17 (SEV-0) atualizada para refletir REC-401 fechada. | @po (Pax) |

## File List

### Criado

- `docs/stories/2026-07-14-rec-401-encadear-ci-deploy.md`
- `.github/workflows/production-pipeline.yml`
- `src/__tests__/ci/production-workflow.test.ts`
- `docs/qa/gates/rec-401-encadear-ci-deploy.yml`

### Modificado

- `.github/workflows/ci.yml`
- `.github/workflows/deploy-functions.yml`
- `.github/workflows/deploy-frontend.yml`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex — persona `@devops` (Gage).

### Debug Log References

- Test-first: o teste direcionado falhou inicialmente porque `.github/workflows/production-pipeline.yml` ainda não existia (`ENOENT`), confirmando a regressão.
- Regressão direcionada após a implementação: 4/4 testes verdes.
- Sintaxe YAML: quatro workflows carregados com sucesso pelo parser Ruby/Psych.
- Gates: `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build` e `npm test` verdes.
- Suíte unitária: 47 arquivos e 531 testes verdes.
- Suíte E2E agregada: 174 testes verdes em ambiente Supabase local isolado.

### Completion Notes

- Criada uma única entrada de produção para `main` e despacho manual; CI não possui mais execução autônoma duplicada em `main`.
- Workflows de deploy aceitam somente `workflow_call`, removendo publicação direta por `push` ou despacho isolado.
- CI é requisito explícito dos dois deploys; Functions antecedem frontend e uma falha real de Functions impede frontend.
- Detecção de mudanças preserva escopos e assume ambos os deploys quando a base de comparação é desconhecida, mantendo comportamento fail-closed.
- Actions externas e Supabase CLI estão fixadas em versões imutáveis; nenhum valor de secret foi adicionado ao repositório ou aos testes.
- Nenhum push, alteração de branch protection ou deploy remoto foi executado. A prova remota permanece dependente da autorização operacional da REC-001.

## QA Results

### Review Date: 2026-07-14

### Reviewed By: Quinn (Test Architect)

### Code Quality Assessment

O grafo implementa uma única entrada produtiva, impede deploy quando o CI falha,
preserva a detecção fail-closed e ordena Functions antes do frontend. A revisão
encontrou um compartilhamento excessivo de credenciais por `secrets: inherit`;
o delta QA substituiu a herança por mapas explícitos e adicionou uma regressão
que impede a reintrodução desse bypass de menor privilégio.

### Refactoring Performed

- **File**: `.github/workflows/production-pipeline.yml`
  - **Change**: substituição dos três usos de `secrets: inherit` pelos secrets estritamente necessários a CI, Functions e frontend.
  - **Why**: impedir que credenciais de deploy sejam disponibilizadas a workflows que não as consomem.
  - **How**: cada chamada reutilizável recebe somente os identificadores declarados no respectivo `workflow_call`.
- **File**: `src/__tests__/ci/production-workflow.test.ts`
  - **Change**: novo cenário estrutural para rejeitar herança ampla e validar os mapas de secrets por job.
  - **Why**: tornar o requisito de menor privilégio verificável e resistente a regressão.
  - **How**: o teste falhou contra o commit original e passou após a correção, elevando o contrato direcionado para 5/5 cenários.

### Requirements Traceability

- **AC 1–4**: teste estrutural comprova entrada canônica, `workflow_call`, bloqueio por CI e ausência de execução duplicada em `main`.
- **AC 5**: detecção de paths conserva escopos e assume ambos os deploys quando a base é desconhecida; despacho manual publica ambos explicitamente.
- **AC 6–7**: `deploy-frontend` depende de `deploy-functions` e aceita somente `success` ou `skipped`, nunca `failure`.
- **AC 8**: actions externas estão fixadas em SHA, permissões são de leitura e secrets são mapeados individualmente.
- **AC 9**: 5/5 cenários direcionados cobrem gatilhos, grafo, paths, ordem e menor privilégio.
- **AC 10**: lint, typecheck, 532/532 unitários, build e 174/174 Playwright passaram; nenhum deploy remoto foi alegado ou executado.

### Compliance Check

- Coding Standards: ✓ YAML e TypeScript legíveis, determinísticos e sem valor sensível.
- Project Structure: ✓ workflows e regressão permanecem nos diretórios canônicos.
- Testing Strategy: ✓ falha test-first reproduzida; regressão direcionada, suíte unitária e E2E verdes.
- All ACs Met: ✓ implementação local atende AC 1–10; prova operacional remota continua condicionada à REC-001.

### Improvements Checklist

- [x] Remover herança ampla de secrets do pipeline canônico.
- [x] Adicionar regressão de menor privilégio por workflow reutilizável.
- [x] Validar sintaxe dos quatro YAMLs com parser.
- [x] Executar CodeRabbit no delta `.github` sem findings.
- [x] Reexecutar lint, typecheck, unitários e build após o refactor.

### Security Review

PASS. Não há secret hardcoded, os tokens não são enviados ao CI por herança e
cada deploy recebe apenas seu conjunto declarado. A sintaxe de secrets nomeados
e o uso de `needs`/`if` estão de acordo com a documentação oficial do GitHub
Actions. A execução remota permanece suspensa até autorização operacional.

### Performance Considerations

Sem regressão de runtime da aplicação. O pipeline evita CI duplicado em `main` e
omite deploys quando o diff não toca escopos produtivos.

### Files Modified During Review

- `.github/workflows/production-pipeline.yml`
- `src/__tests__/ci/production-workflow.test.ts`
- `docs/qa/gates/rec-401-encadear-ci-deploy.yml`

Os dois primeiros arquivos já constam na File List da story; o gate é artefato
de QA e deve acompanhar o próximo commit atômico.

### Gate Status

Gate: PASS → docs/qa/gates/rec-401-encadear-ci-deploy.yml

### Recommended Status

✓ Ready for Done após commit do delta QA. Este veredito aprova o contrato local;
não substitui a prova remota sanitizada exigida antes de reabrir deploy produtivo.
