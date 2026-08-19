# Hotfix: smoke com catálogo dinâmico

## Status

Ready for Review

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools:
  - diff-review
  - test
  - lint
  - typecheck
  - build
  - smoke-crawl
  - audit
  - secretlint
assignment_basis: "executor-assignment: code_general"
```

## Tracking

> ⚠️ **ClickUp não sincronizado:** a integração ClickUp não está disponível nesta sessão. Conforme a regra do workflow, esta story foi criada localmente sem bloquear o hotfix.

## Story

**As a** responsável pela confiabilidade do smoke público,
**I want** revisar e adotar constitucionalmente o hotfix emergencial que descobre no catálogo o link canônico de um curso publicado,
**so that** o incidente seja encerrado com evidência de qualidade, sem tratar um slug editorial obsoleto como indisponibilidade real do catálogo.

## Contexto

- A REC-409 AC4 exige que o smoke do pipeline de produção permaneça no Environment `production`, limitado a rotas públicas e sem habilitar escritas no banco.
- O Production Pipeline run `32264880709` falhou no smoke porque o slug de curso codificado em `tests/smoke-crawl.spec.ts` ficou obsoleto e retornou `404`.
- O diff `85161c8` substitui o slug mutável pela descoberta de uma rota canônica publicada a partir de `/cursos`, preserva os slugs controlados pelo baseline determinístico e adiciona falha explícita quando o catálogo não oferece um curso publicado.
- O hotfix emergencial `85161c8` já existe em `HEAD`, motivado pelo incidente do pipeline. Este Draft realiza sua adoção e revisão constitucional posterior, com foco em Story-Driven Development, No Invention e Quality First; não autoriza nova implementação de código.
- O commit `85161c8` altera dois arquivos: o único arquivo de código é `tests/smoke-crawl.spec.ts`; a segunda alteração é documental em `docs/stories/2026-08-03-rec-409-isolar-e2e-supabase-ci.md`.

## Acceptance Criteria

1. O smoke conectado ao catálogo real não contém slug mutável de curso como caminho fixo.
2. O smoke acessa `/cursos`, descobre um link canônico no formato `/cursos/{slug}` para um curso publicado e valida essa rota com o crawler público existente.
3. Se o catálogo publicado estiver vazio ou não expuser uma rota canônica de detalhe, o teste falha explicitamente com mensagem diagnóstica; o cenário não é pulado silenciosamente.
4. A descoberta e a validação permanecem públicas e estritamente read-only: sem autenticação, flags de escrita ou mutação de dados, preservando a REC-409 AC4.
5. No baseline determinístico, os slugs controlados de curso e blog permanecem inalterados e continuam sendo validados diretamente; a descoberta dinâmica não substitui esse baseline.
6. A adoção fecha somente se test com 184 cenários, lint, typecheck, build, smoke 12/12, audit e secretlint estiverem verdes. O smoke 12/12 comprova o caminho positivo com curso descoberto; os casos de catálogo vazio e link inadequado são comprovados por inspeção dos dois asserts diagnósticos do diff `85161c8`, sem alegar cobertura automatizada negativa inexistente.

## Escopo

### Incluído

- Adoção e revisão constitucional do hotfix emergencial `85161c8` já presente em `HEAD`.
- Revisão de `tests/smoke-crawl.spec.ts`, único arquivo de código alterado pelo commit.
- Reconhecimento da alteração documental do mesmo commit em `docs/stories/2026-08-03-rec-409-isolar-e2e-supabase-ci.md`.
- Separação entre slugs do baseline determinístico e descoberta do catálogo real.
- Descoberta e validação read-only de uma rota canônica de curso publicado.
- Inspeção dos asserts de erro explícito para catálogo vazio ou sem link canônico.
- Execução e documentação dos gates técnicos definidos nos ACs.

### Fora do escopo

- Push, merge, publicação remota ou operação de repositório remoto.
- Acionamento ou alteração de pipeline.
- Deploy, rollback ou verificação pós-deploy.
- Nova implementação ou ampliação da cobertura automatizada nesta regularização.
- Mudança de aplicação, regra de negócio, schema, migration, RLS, catálogo ou dados.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled in `.aiox-core/core-config.yaml`.
> Quality validation will use the independent `@architect` gate and the technical checks listed in this story.

## Tasks / Subtasks

- [x] Registrar a adoção constitucional do hotfix emergencial existente (AC: 1-6)
  - [x] Confirmar que `85161c8` já está em `HEAD` e foi motivado pela falha do run `32264880709`.
  - [x] Registrar que o commit altera dois arquivos: `tests/smoke-crawl.spec.ts` como único arquivo de código e `docs/stories/2026-08-03-rec-409-isolar-e2e-supabase-ci.md` como alteração documental.
  - [x] Revisar o hotfix pelos princípios Story-Driven Development, No Invention e Quality First, sem produzir novo diff de código.
- [x] Validar a remoção do slug mutável e a preservação do baseline (AC: 1, 5)
  - [x] Inspecionar que os caminhos dinâmicos determinísticos permanecem condicionados a `PLAYWRIGHT_TEST_BUILD === "1"`.
  - [x] Inspecionar que os slugs determinísticos de curso e blog permanecem inalterados no diff `85161c8`.
  - [x] Inspecionar que o caminho fixo obsoleto foi removido do smoke conectado ao catálogo real.
- [x] Validar a descoberta canônica e os diagnósticos existentes (AC: 2, 3)
  - [x] Inspecionar que `/cursos` deve responder abaixo de `400`.
  - [x] Inspecionar a seleção de links públicos iniciados por `/cursos/` e da rota canônica `/cursos/{slug}` sem query string ou fragmento.
  - [x] Inspecionar o primeiro assert diagnóstico, que exige ao menos um link para curso publicado.
  - [x] Inspecionar o segundo assert diagnóstico, que exige uma rota canônica de detalhe publicada.
  - [x] Confirmar que a rota descoberta reutiliza o crawler público existente.
- [x] Validar o contrato público e read-only no diff existente (AC: 4)
  - [x] Confirmar a ausência de autenticação, segredo, flag de escrita ou chamada de mutação.
  - [x] Confirmar que descoberta e crawl permanecem limitados a rotas públicas.
- [x] Reexecutar e documentar os gates técnicos (AC: 6)
  - [x] Confirmar test com 184 cenários, lint, typecheck e build.
  - [x] Confirmar smoke 12/12 como evidência do caminho positivo de descoberta e crawl.
  - [x] Documentar a inspeção dos dois asserts diagnósticos como evidência dos caminhos negativos; não registrar catálogo vazio ou link inadequado como cenários automatizados executados.
  - [x] Confirmar audit e secretlint sem bloqueadores.
- [x] Submeter o diff e as evidências ao quality gate independente `@architect` (AC: 1-6)
  - [x] Demonstrar que o único arquivo de código do commit é o smoke e que a segunda alteração é a documentação da REC-409.
  - [x] Obter veredito arquitetural independente, mantendo a story em `Ready for Review` para o gate pré-push.
- [x] Realizar handoff documental após aprovação (AC: 6)
  - [x] Encaminhar o SHA aprovado e as evidências dos gates para a story [Hotfix: desbloquear deploy da correção de pré-inscrições](./2026-08-19-hotfix-desbloquear-deploy-pre-inscricoes.md).
  - [x] Não executar nenhuma atividade de deploy dentro desta story.

## Dev Notes

### Evidências de entrada

- **REC-409 AC4:** smoke de produção limitado a rotas públicas e sem escrita no banco. [Fonte: `docs/stories/2026-08-03-rec-409-isolar-e2e-supabase-ci.md#acceptance-criteria`]
- **Run que revelou a regressão:** Production Pipeline `32264880709`, com `404` causado pelo slug obsoleto em `tests/smoke-crawl.spec.ts`.
- **Hotfix existente em HEAD:** `85161c8`, criado em resposta ao incidente do pipeline e submetido nesta story à adoção/revisão constitucional posterior.
- **Composição real do commit:** `85161c8` altera `tests/smoke-crawl.spec.ts` (único arquivo de código) e `docs/stories/2026-08-03-rec-409-isolar-e2e-supabase-ci.md` (documentação REC-409). Não é um commit exclusivo de um único arquivo.
- **Comportamento do código:** o diff adiciona descoberta via `/cursos`, dois asserts diagnósticos e preserva o baseline determinístico.

### Contrato derivado do diff `85161c8`

- Quando `PLAYWRIGHT_TEST_BUILD === "1"`, o baseline continua validando diretamente:
  - `/cursos/introducao-as-licitacoes-e-contratos-administrativos-nocoes-essenciais-para-o-setor-publico`
  - `/blog/3-alertas-para-revisar-antes-de-enviar-eventos-do-esocial`
- Fora do baseline determinístico, não existe slug fixo de curso: a rota é obtida dos links públicos de `/cursos`.
- Uma rota canônica aceita segue `/cursos/{slug}`, sem query string nem fragmento.
- Catálogo vazio e ausência de rota canônica são falhas explícitas e distintas.
- A rota descoberta passa pelo mesmo helper de crawl das demais páginas públicas.
- O smoke 12/12 comprova o caminho positivo. Os caminhos negativos são evidenciados nesta story por inspeção do assert de ausência de link publicado e do assert de ausência de rota canônica; o diff não adiciona testes automatizados que materializem catálogo vazio ou link inadequado.

### Adoção constitucional

- O código emergencial antecedeu esta story por causa do incidente no Production Pipeline run `32264880709`.
- Esta story não transforma a exceção em fluxo padrão: ela registra a motivação, valida o escopo contra REC-409 AC4, reexecuta os gates Quality First e exige revisão independente de `@architect`.
- Nenhuma nova implementação de código é autorizada. Uma divergência encontrada na validação deve gerar trabalho separado, sem ampliar este hotfix.

### Project Structure Notes

- Único arquivo de código alterado por `85161c8`: `tests/smoke-crawl.spec.ts`.
- Arquivo documental também alterado por `85161c8`: `docs/stories/2026-08-03-rec-409-isolar-e2e-supabase-ci.md`.
- Story de adoção/revisão criada agora: `docs/stories/2026-08-19-hotfix-smoke-catalogo-dinamico.md`.
- Story companheira para o handoff operacional: `docs/stories/2026-08-19-hotfix-desbloquear-deploy-pre-inscricoes.md`.
- Não há mudança de estrutura, aplicação ou dados.

## Testing

### Cenários obrigatórios

1. **Caminho positivo automatizado:** smoke 12/12 comprova que `/cursos` expõe uma rota canônica e que o crawler valida o curso descoberto.
2. **Catálogo vazio por inspeção:** revisar o assert com a mensagem `O catálogo público deve expor ao menos um link para um curso publicado`; não alegar que um cenário automatizado esvaziou o catálogo.
3. **Link inadequado por inspeção:** revisar o assert com a mensagem `O catálogo público não expôs uma rota canônica de detalhe de curso publicada`; não alegar execução automatizada dessa condição.
4. **Baseline determinístico por inspeção e regressão:** confirmar que os slugs controlados de curso e blog permanecem inalterados e que a descoberta dinâmica é pulada no baseline.
5. **Segurança por inspeção:** confirmar que o diff não autentica, habilita escrita ou modifica dados.
6. **Regressão automatizada:** test 184, lint, typecheck, build, smoke 12/12, audit e secretlint verdes.

## Handoff

- **Próxima story:** [Hotfix: desbloquear deploy da correção de pré-inscrições](./2026-08-19-hotfix-desbloquear-deploy-pre-inscricoes.md).
- **Condição:** esta story está `Ready for Review`, o gate de `@architect` aprovou o diff e todas as evidências técnicas estão registradas.
- **Limite:** o handoff transfere somente SHA e evidências; toda atividade remota ou operacional pertence à story companheira.

## Story Draft Checklist Result

**Readiness:** READY
**Clarity score:** 10/10
**Major gaps:** nenhum bloqueador; sincronização ClickUp pendente por indisponibilidade da integração.

| Category | Status | Issues |
|---|---|---|
| 1. Goal & Context Clarity | PASS | Objetivo de adoção constitucional, emergência do run `32264880709`, REC-409 AC4 e handoff estão explícitos. |
| 2. Technical Implementation Guidance | PASS | O hotfix já existe em HEAD; validação separa o único arquivo de código da alteração documental REC-409 e não autoriza novo código. |
| 3. Reference Effectiveness | PASS | REC-409 AC4, run e composição real do diff `85161c8` são identificados e resumidos no contexto relevante. |
| 4. Self-Containment Assessment | PASS | A story contém slugs determinísticos, descoberta canônica, limites read-only, dois asserts diagnósticos e justificativa constitucional. |
| 5. Testing Guidance | PASS | Smoke 12/12 está limitado ao caminho positivo; os dois caminhos negativos estão corretamente classificados como inspeção, além dos demais gates mensuráveis. |
| 6. CodeRabbit Integration (conditional) | N/A | Integração não habilitada no `core-config.yaml`; gate independente `@architect` definido. |

### Developer Perspective

- `@dev` não deve implementar novo código: deve revisar e documentar o hotfix `85161c8` já em HEAD, reexecutar os gates e encaminhar o resultado ao `@architect`.
- Evidências obrigatórias para fechamento: composição real dos dois arquivos do commit, baseline preservado, inspeção dos dois asserts, contrato read-only, caminho positivo 12/12, demais gates verdes e veredito de `@architect`.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-08-19 | 0.1 | Draft local da implementação do smoke dinâmico; checklist executado. | River (@sm) |
| 2026-08-19 | 0.2 | NO-GO do PO sanado: adoção constitucional do hotfix em HEAD, composição real do commit e evidência negativa por inspeção; checklist reexecutado. | River (@sm) |
| 2026-08-19 | 0.3 | Validação PO estrita: GO. Aprovada a adoção/revisão do hotfix emergencial após confirmar a composição real de `85161c8`, aderência à REC-409 AC4, rastreabilidade do run `32264880709` e distinção entre smoke positivo automatizado e caminhos negativos por inspeção. | Pax (@po) |
| 2026-08-19 | 0.4 | Adoção documental concluída e movida para Ready for Review; diff, asserts diagnósticos, contrato read-only e gates verdes registrados. Gate independente de `@architect` e handoff operacional permanecem pendentes. | Dex (@dev) |
| 2026-08-19 | 0.5 | Gate arquitetural independente aprovado com concern não bloqueante: os ramos negativos têm asserts explícitos, mas ainda não possuem cenários automatizados isolados. | Aria (@architect) |

## Dev Agent Record

### Agent Model Used

GPT-5 (Codex), persona Dex (`@dev`).

### Debug Log References

- `git rev-parse HEAD` → `85161c8027d6161d653afa7aceca0578137204f7`.
- `git show --name-status 85161c8` → somente `tests/smoke-crawl.spec.ts` (código) e `docs/stories/2026-08-03-rec-409-isolar-e2e-supabase-ci.md` (documentação).
- Inspeção de `git diff 85161c8^ 85161c8 -- tests/smoke-crawl.spec.ts` → baseline determinístico preservado, slug mutável removido, descoberta canônica e dois asserts diagnósticos presentes; nenhuma autenticação ou mutação adicionada.
- Gates executados no mesmo HEAD antes desta regularização documental: `npm test` (184 passados, 1 skip esperado), `npm run lint` (PASS), `npm run typecheck` (PASS), `npm run build` (PASS), `npm run test:e2e:public` (12/12 PASS), `npm audit` (0 vulnerabilidades) e secretlint (PASS).
- Validação rápida nesta etapa: `git diff --check` (PASS).
- Logs registram apenas contagens, comandos, SHA e resultados; nenhum segredo ou dado pessoal foi incluído.

### Completion Notes List

- O commit emergencial `85161c8` foi confirmado em `HEAD` e adotado documentalmente em resposta à falha do Production Pipeline run `32264880709`.
- O slug editorial obsoleto foi removido apenas do smoke conectado ao catálogo real; os slugs controlados do curso e do blog continuam condicionados a `PLAYWRIGHT_TEST_BUILD === "1"` e permanecem inalterados.
- A descoberta abre `/cursos`, exige resposta abaixo de `400`, coleta links públicos iniciados por `/cursos/`, aceita somente `/cursos/{slug}` sem query string ou fragmento e reutiliza `crawl` para validar a rota descoberta.
- O caminho positivo foi comprovado pelo smoke 12/12. Os caminhos de catálogo vazio e ausência de rota canônica foram comprovados somente por inspeção dos dois asserts diagnósticos existentes; não há alegação de cenários negativos automatizados.
- O diff permanece público e read-only: não adiciona autenticação, segredo, flag de escrita nem chamada de mutação.
- Todos os gates técnicos exigidos no AC 6 estão verdes. Nenhum novo diff de código foi produzido nesta regularização.
- O gate independente de `@architect` foi aprovado sem bloqueadores e com o concern ARQ-01 não bloqueante. O handoff documental para a story operacional foi concluído, sem executar atividade remota ou deploy.

### File List

- `tests/smoke-crawl.spec.ts` — único arquivo de código alterado por `85161c8`.
- `docs/stories/2026-08-03-rec-409-isolar-e2e-supabase-ci.md` — arquivo documental também alterado por `85161c8`.
- `docs/stories/2026-08-19-hotfix-smoke-catalogo-dinamico.md` — story de adoção/revisão constitucional e registro dos gates.
- `docs/stories/2026-08-19-hotfix-desbloquear-deploy-pre-inscricoes.md` — handoff operacional aprovado pelo PO para a etapa exclusiva de `@devops`.

## QA Results

### Gate arquitetural independente — 2026-08-19

**Veredito:** PASS, com 1 concern não bloqueante.
**Escopo revisado:** commit `85161c8027d6161d653afa7aceca0578137204f7`, diff de `tests/smoke-crawl.spec.ts`, REC-409 AC4 e evidências técnicas desta story.
**Bloqueadores:** nenhum.

#### Decisão arquitetural

A descoberta dinâmica é adequada exclusivamente para o smoke conectado ao catálogo real: o caminho passa a derivar do contrato público observável em `/cursos`, sem acoplar a disponibilidade do deploy a um slug editorial mutável. O baseline determinístico continua com os dois slugs controlados e pula a descoberta dinâmica, preservando reprodutibilidade. Catálogo vazio ou sem rota canônica permanece uma falha operacional explícita, conforme AC3, e não um skip silencioso.

#### Avaliação por dimensão

| Dimensão | Resultado | Evidência |
|---|---|---|
| Arquitetura e escopo | PASS | O único código alterado é o smoke; a aplicação, o modelo de dados e o pipeline não mudam. A segunda alteração de `85161c8` é somente a File List da REC-409. |
| Determinismo | PASS | `deterministicDynamicPaths` preserva os slugs controlados sob `PLAYWRIGHT_TEST_BUILD === "1"`; produção descobre somente uma rota `/cursos/{slug}` do catálogo real. |
| Falha explícita | PASS | Resposta de `/cursos` abaixo de `400`, existência de link de curso e existência de rota canônica possuem asserts diagnósticos; nenhum caminho vazio é ignorado. |
| Segurança read-only | PASS | O bloco público adiciona apenas navegação GET e leitura de DOM. Não há autenticação, segredo, flag de escrita, chamada de mutação ou alteração de dados. A REC-409 AC4 é preservada. |
| Risco operacional | PASS | A rota descoberta reutiliza `crawl`, incluindo status HTTP, error boundary, `pageerror` e `console.error`. A página `/cursos` também permanece na lista pública regular. |
| Quality First | PASS | Reexecução independente: `npm test` = 184 passados e 1 skip esperado; `npm run test:e2e:public` = 12/12; `git diff --check` no worktree e em `85161c8^..85161c8` = PASS. Evidências registradas de lint, typecheck, build, audit e secretlint também estão verdes; nenhum finding CRITICAL do CodeRabbit. |

#### Concern não bloqueante

**ARQ-01 — cobertura automatizada dos ramos negativos (MEDIUM / CONCERNS).** O finding `major` do CodeRabbit é procedente quanto à ausência de cenários isolados que materializem catálogo vazio e links inadequados. O risco é de regressão futura das mensagens/condições sem detecção local específica; não é um defeito funcional ou de segurança comprovado no hotfix atual. Os dois asserts foram inspecionados, o caminho positivo passou em produção conectada e a AC6 declara explicitamente o limite dessa evidência. Recomenda-se abrir trabalho separado para extrair a seleção canônica para uma unidade testável ou adicionar fixtures Playwright negativas, sem ampliar este hotfix.

**Conclusão:** o diff está arquiteturalmente aprovado para o handoff documental à story de deploy. A story deve permanecer `Ready for Review`; promoção para `Done` pertence ao gate de ciclo posterior.
