# Story REC-403: Recuperar suíte agregada e estabelecer baseline constitucional verde

## Status

In Progress

## Executor Assignment

executor: "@dev"
quality_gate: "@qa"
quality_gate_tools:
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm test`
- `npm run build`
- `node scripts/run-playwright.mjs tests/admin-crud.spec.ts --project=functional --reporter=line`
- `node scripts/run-playwright.mjs tests/ui-governance.spec.ts --project=functional --reporter=line`
- `node scripts/run-playwright.mjs tests/visual.baseline.spec.ts --project=baseline-desktop --project=baseline-mobile --reporter=line`
- comparação de `git status --short` antes/depois de cada gate que produza artefatos

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 0 — Restaurar o gate constitucional
- **Prioridade:** P0 bloqueante para qualquer merge de código/migration da recuperação
- **Estimativa:** M, entre um e dois dias de esforço focado
- **Finding:** FND-15
- **Requisitos:** NFR-06, NFR-09, CON-01 e CON-06
- **Critérios da épica:** AC-17.21; prepara REC-404 e REC-405 sem absorver seus escopos
- **Gate relacionado:** pré-condição de G4 e baseline constitucional da Onda 0

## Story

**As a** mantenedor responsável pela recuperação da RH Cursos,
**I want** inventariar e corrigir as falhas reais da suíte agregada até que todos os gates constitucionais passem no mesmo commit,
**so that** nenhum hotfix de segurança ou integridade seja mergeado sobre uma linha de base já vermelha ou mascarada por testes enfraquecidos.

## Contexto e valor

A Constitution exige `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` sem falhas antes de merge. A execução completa de `npm test` reproduzida em 2026-07-14 terminou com typecheck/build PASS, **168 testes Playwright aprovados e 6 falhos em aproximadamente 5,8 minutos**. O inventário inicial observado é:

| ID | Local | Falha observada |
|---|---|---|
| REC-403-F01 | `tests/admin-crud.spec.ts:784` | `students: cria cadastro manual e exclui`: timeout; `findStudentByEmail(email)` não localizou o registro e `expect(...).not.toBeNull()` recebeu `null` |
| REC-403-F02 | `tests/ui-governance.spec.ts:80` | diff visual no hero da home |
| REC-403-F03 | `tests/ui-governance.spec.ts:97` | diff visual na home mobile |
| REC-403-F04 | `tests/ui-governance.spec.ts:108` | painel de filtros de cursos excede o limite esperado: diferença de 16 px para tolerância de 12 px |
| REC-403-F05 | `tests/visual.baseline.spec.ts:68` — `baseline-desktop` | timeout na captura de `/cursos` aguardando texto correspondente a `/turmas na agenda/i` |
| REC-403-F06 | `tests/visual.baseline.spec.ts:68` — `baseline-mobile` | mesmo timeout de `/cursos` aguardando `/turmas na agenda/i` no projeto mobile |

As causas raiz dos seis failures ainda não estão confirmadas e não podem ser inventadas nesta story. O executor deve anexar logs/artefatos sanitizados da execução e corrigir cada causa, sem obter verde por exclusão de spec, aumento arbitrário de timeout, atualização de baseline ou relaxamento de assert.

## Escopo

### Incluído

- Capturar o baseline integral e reproduzível de todos os failures de `npm test`.
- Classificar cada failure como defeito de aplicação, teste, fixture, ambiente/harness ou flake comprovado.
- Corrigir somente as causas necessárias para restaurar os gates constitucionais.
- Preservar o valor semântico dos cenários de integração, especialmente criação/persistência/exclusão administrativa.
- Produzir log sanitizado por comando com commit, ambiente, duração, resultado e failures.
- Executar a sequência final completa no mesmo commit candidato.

### Fora do escopo

- Remover a allowlist artificial de cobertura ou ampliar cobertura elegível: REC-404.
- Separar baseline capture de visual compare no pipeline: REC-405.
- Encadear CI/deploy: REC-401.
- Ordenar migrations/deploy: REC-402.
- Corrigir bugs de produto não exercitados por failures do baseline, salvo se forem causa raiz direta e receberem teste de regressão.
- Reescrever o harness inteiro ou trocar Playwright/Vitest.
- Atualizar snapshots, screenshots ou relatórios versionados para “aceitar” regressão.
- Executar testes reais contra produção sem cleanup e autorização explícitos.

## Acceptance Criteria

1. **Inventário integral da linha de base**
   **Given** o commit candidato e o ambiente documentado,
   **when** `npm test` é executado pela primeira vez,
   **then** REC-403-F01 a REC-403-F06 são registrados com comando, projeto, arquivo/linha, nome do cenário, mensagem, camada, reprodutibilidade, artefato e hipótese marcada como confirmada ou pendente; a contagem de 168 PASS/6 FAIL e a duração aproximada de 5,8 minutos são preservadas como baseline.

2. **Falha conhecida reproduzida e diagnosticada**
   O cenário `tests/admin-crud.spec.ts:784` é reproduzido isoladamente ou a impossibilidade de reprodução é demonstrada em múltiplas execuções. A conclusão identifica se a criação falhou, se a consulta de confirmação falhou, se houve problema de auth/fixture/cleanup ou outro root cause baseado em evidência.

3. **Correção causal, sem maquiagem**
   **Given** um failure confirmado,
   **when** a correção é aplicada,
   **then** existe teste que falha antes/passa depois ou evidência equivalente, sem `test.skip`, `test.fixme`, filtro que omita o cenário, remoção de assert, catch silencioso, mock que substitua integração real ou timeout aumentado como única mudança.

4. **Sem atualização oportunista de baseline**
   A execução de comparação não atualiza screenshots, snapshots, relatórios de contraste ou artefatos versionados. O delta de arquivos antes/depois de cada gate é conferido; qualquer mudança automática é tratada como comportamento a documentar para REC-405, não como evidência de PASS.

5. **Harness e dados controlados**
   Testes que criam dados utilizam identificadores únicos, confirmam persistência e executam cleanup em `finally` ou mecanismo equivalente. Quando um ambiente externo for obrigatório, a dependência é explícita e a falha não é convertida em falso sucesso.

6. **Gates constitucionais verdes no mesmo commit**
   A sequência abaixo termina com exit code 0 no mesmo commit e ambiente reproduzível:
   - `npm run lint`;
   - `npm run typecheck`;
   - `npm run test:unit`;
   - `npm test`;
   - `npm run build`.

7. **Sem regressão da suíte direcionada**
   O gate final não reduz a quantidade de cenários coletados por remoção, rename excludente, mudança de `testMatch/testIgnore` ou projeto omitido. Alteração intencional de contrato de teste deve ser justificada no relatório e aprovada por `@qa`.

8. **Worktree preservado**
   A execução registra o conjunto de arquivos já modificados antes dos testes e não sobrescreve mudanças alheias à story. Artefatos gerados recebem destino ignorado ou são removidos apenas quando criados pela própria execução e comprovadamente descartáveis.

9. **Evidência sanitizada e gate independente**
   O relatório não contém senha, token, cookie, e-mail real, telefone ou PII de registros criados. `@qa` reexecuta ou amostra os gates e emite PASS/CONCERNS/FAIL; `@dev` não autoaprova o baseline.

## Tasks / Subtasks

- [x] **Task 1 — Registrar pre-flight reprodutível** (AC: 1, 4, 8, 9)
  - [x] Registrar commit/branch, Node/npm, sistema operacional e variáveis apenas por nome/presença, nunca valor.
  - [x] Capturar `git status --short` e hashes dos baselines versionados que a suíte pode tocar.
  - [x] Confirmar scripts reais em `package.json`, `playwright.config.ts`, `vitest.config.ts` e `scripts/run-playwright.mjs`.
  - [x] Definir diretório de artefatos não versionado para logs da execução.

- [x] **Task 2 — Executar e classificar o baseline completo** (AC: 1, 9)
  - [x] Executar `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm test` e `npm run build` sem alterar os comandos.
  - [x] Criar uma entrada de inventário para cada failure observado.
  - [x] Registrar dependência externa, tempo e artefatos de cada failure.
  - [x] Anexar o baseline completo ao Dev Agent Record e ao gate da story.

- [x] **Task 3 — Diagnosticar `admin-crud` de students** (AC: 2, 3, 5)
  - [x] Reexecutar o cenário `tests/admin-crud.spec.ts:784` isoladamente no projeto `functional`.
  - [x] Verificar resposta da UI sem expor credenciais.
  - [x] Verificar a mutação `students:create` e o contrato de persistência em `admin-resources`.
  - [x] Verificar a consulta `findStudentByEmail` e o cleanup de dados `[E2E]`.
  - [x] Confirmar causa raiz antes de editar aplicação/teste.
  - [x] Adicionar ou ajustar regressão preservando a intenção “criar, confirmar persistência e excluir”.

- [x] **Task 4 — Corrigir os demais failures inventariados** (AC: 3, 5, 7)
  - [x] Diagnosticar REC-403-F02 (hero home) sem atualizar snapshot antes de confirmar regressão ou mudança intencional previamente aprovada.
  - [x] Diagnosticar REC-403-F03 (home mobile) com viewport/fixtures determinísticos.
  - [x] Diagnosticar REC-403-F04 (16 px versus tolerância de 12 px) sem ampliar tolerância como única correção.
  - [x] Diagnosticar REC-403-F05/F06 em conjunto, distinguindo conteúdo público ausente, seletor desatualizado, demora real e diferença por viewport.
  - [x] Trabalhar um root cause por vez e registrar evidência antes/depois.
  - [x] Corrigir aplicação quando o comportamento violar o contrato.
  - [x] Corrigir fixture/teste somente quando o contrato estiver comprovadamente desatualizado.
  - [x] Reexecutar o menor gate relevante após cada mudança.

- [x] **Task 5 — Proteger os baselines contra alteração durante a prova** (AC: 4, 8)
  - [x] Comparar status/hashes antes e depois de `npm test`.
  - [x] Não aceitar `--update-snapshots`, `--update`, captura manual ou commit de PNG como correção desta story.
  - [x] Registrar a escrita preexistente de `tests/visual.baseline.spec.ts` e `tests/contrast-report.baseline.spec.ts` como dívida encaminhada a REC-405, sem ampliar o escopo.

- [ ] **Task 6 — Executar o gate final sequencial** (AC: 6, 7, 9)
  - [ ] Rodar todos os cinco comandos no mesmo commit.
  - [ ] Registrar exit code, duração, contagem de testes e artefatos.
  - [x] Confirmar ausência de novos skips/fixmes/omissões.
  - [ ] Solicitar revisão e veredito de `@qa`.

## Dev Notes

### Estado técnico observado

- `package.json` define `npm test` como `npm run typecheck && npm run build && node scripts/run-playwright.mjs`; portanto o gate agregado executa build de produção e Playwright, não a suíte Vitest.
- `npm run test:unit` executa `vitest run` separadamente.
- `scripts/run-playwright.mjs` inicia `scripts/start-test-server.mjs`, escolhe uma porta livre e executa Playwright com `--workers=1`.
- `playwright.config.ts` declara três projetos: `functional`, `baseline-desktop` e `baseline-mobile`.
- `tests/visual.baseline.spec.ts` grava PNGs em `tests/baseline/`; `tests/contrast-report.baseline.spec.ts` grava um relatório em `docs/diagnosis/`. Essa escrita é preexistente e deve ser observada, não expandida nesta story.
- `vitest.config.ts` mede cobertura sobre uma allowlist manual. Isso é FND-15, mas a remoção da allowlist pertence exclusivamente a REC-404.
- O resultado local disponível em `test-results/admin-crud-admin-CRUD-—-ci-071d6-ia-cadastro-manual-e-exclui-functional/error-context.md` registra a falha de `students` em `tests/admin-crud.spec.ts:784`.
- `tests/admin-crud.spec.ts` informa que usa integração real quando `SUPABASE_SERVICE_ROLE_KEY` está disponível e cria registros marcados `[E2E]`, removendo-os depois. O cenário conhecido não localizou o aluno pela consulta de confirmação.
- A execução agregada observada terminou com 168 PASS/6 FAIL. Além de `admin-crud`, os failures estão em `tests/ui-governance.spec.ts:80`, `:97`, `:108` e em `tests/visual.baseline.spec.ts:68` nos projetos `baseline-desktop`/`baseline-mobile`.

### Referências arquiteturais

- Next.js 16, React 19, Playwright 1.60, TypeScript estrito e deploy Cloudflare Workers são a stack ativa. [Fonte: `docs/architecture/system-architecture.md#1-stack-tecnológico`]
- O projeto usa App Router e `src/lib/` para infraestrutura compartilhada; testes de regressão devem respeitar os limites atuais em vez de mover arquitetura durante a recuperação. [Fonte: `docs/architecture/system-architecture.md#2-architecture-layers`; `docs/architecture/frontend-feature-first-architecture.md#5-shared-infrastructure`]
- A dívida anterior já documenta necessidade de testes unitários e expansão E2E, mas REC-403 tem objetivo menor: restaurar o baseline existente antes de ampliar cobertura. [Fonte: `docs/architecture/technical-debt-assessment.md#category-3-testing-debt`]

### Project Structure Notes

- Arquivos principais do harness: `package.json`, `vitest.config.ts`, `playwright.config.ts`, `scripts/run-playwright.mjs`, `scripts/start-test-server.mjs`.
- Fixtures e integrações: `tests/fixtures/admin-store.ts`, `tests/helpers/integration-env.ts`, `tests/admin-crud.spec.ts`.
- Aplicação potencialmente afetada pelo failure conhecido: `src/lib/app-store.tsx`, `src/lib/admin-resource-configs.tsx`, `supabase/functions/admin-resources/index.ts` e `supabase/functions/_shared/admin-mappers.ts`. São candidatos para investigação, não autorização para alteração sem causa raiz.
- Testes unitários ficam em `src/__tests__/`; Playwright fica em `tests/`.

### Restrições de implementação

- Não utilizar `git checkout --`, `git reset`, limpeza destrutiva ou atualização massiva de snapshots para lidar com o worktree já modificado.
- Não executar cleanup por busca ampla sem marcador único.
- Não registrar secrets da integração ou credenciais de admin no relatório.
- Se um failure revelar uma correção funcional independente e grande, abrir nova story; REC-403 não vira um epic disfarçado.

## Testing

### Sequência durante o desenvolvimento

1. Reproduzir o cenário específico.
2. Executar o teste unitário/integração mais próximo do root cause.
3. Executar `npm run test:unit`.
4. Executar o Playwright direcionado.
5. Executar a sequência constitucional completa.

### Cenários mínimos

- `admin-crud` cria um aluno, confirma o registro no backend e o remove.
- Falha de criação mostra erro explícito; não espera 30 segundos por um registro impossível.
- Falha de consulta de confirmação é distinguida de falha de criação.
- Dados de teste recebem marcador único e cleanup seguro.
- Execução repetida não depende de cache de sessão expirado.
- `npm test` não gera delta de baselines que seja usado para converter FAIL em PASS.
- Nenhum teste novo contém segredo/PII real.

## Observabilidade

- Relatório por comando: timestamp, commit, ambiente, duração, exit code, total/pass/fail/skip e paths dos artefatos.
- Cada failure possui ID local `REC-403-Fxx`, owner, status e evidência de fechamento.
- Logs de E2E usam marcador opaco/`[E2E]`, nunca credencial ou PII real.
- Falhas de cleanup são reportadas separadamente e exigem remoção segura dos registros criados.
- A contagem final de testes é registrada para detectar redução silenciosa de escopo.

## Security Notes

- Os testes de integração atuais carregam `.env.local`; outputs precisam ser revisados antes de versionamento.
- Não imprimir `SUPABASE_SERVICE_ROLE_KEY`, senha admin, `AUTH_SESSION_SECRET`, cookies ou tokens de sessão.
- Não trocar integração real por mock apenas para obter verde.
- Não usar produção como banco de teste sem a autorização já prevista pelo harness; se a dependência não puder ser isolada com segurança, `@qa` deve bloquear e escalar.
- Artefatos Playwright podem conter conteúdo de tela; revisar/redigir antes de anexar.

## Dependências

- **Entrada:** REC-001 criada e freeze operacional ativo para impedir merge concorrente.
- **Bloqueia:** REC-101, REC-102, REC-301, REC-302 e todo merge de código/migration da recuperação.
- **Não depende de:** REC-401/REC-402 para execução local, mas publicação posterior deve respeitá-las.
- **Encaminha dívida para:** REC-404 (cobertura real) e REC-405 (captura/comparação visual).

## Roll-forward / Rollback

- **Rollback permitido:** reverter isoladamente uma correção causal que gere regressão, mantendo o gate vermelho até novo fix.
- **Roll-forward preferido:** corrigir aplicação/fixture para preservar o contrato dos cenários existentes.
- **Rollback proibido:** excluir teste, marcar skip/fixme, reduzir projeto coletado, relaxar assert, aumentar timeout como solução única ou atualizar baseline para aceitar regressão.
- Se a correção tocar schema/segurança, interromper e criar story sob autoridade apropriada; não improvisar migration em REC-403.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> A revisão usa análise manual de diff, gates constitucionais e veredito independente de `@qa`.

### Story Type Analysis

- **Primary Type:** Testing / Quality Recovery
- **Secondary Type:** Integration / Brownfield Debugging
- **Complexity:** Média; failures múltiplos são possíveis, mas cada um deve ter causa rastreada
- **Primary Agent:** `@dev`
- **Quality Gate:** `@qa`

### Manual review focus

- Nenhuma redução silenciosa da suíte.
- Correção causal e regressão demonstrável.
- Baselines não atualizados durante comparação.
- Logs e artefatos sem secrets/PII.
- Mesmo commit aprovado por todos os gates.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-14 | 0.1 | Draft criado com etapa obrigatória de inventário integral e único failure reproduzido identificado nominalmente, sem inventar os demais resultados pendentes. | @sm (River) |
| 2026-07-14 | 0.2 | Baseline observado reconciliado com a execução real: typecheck/build PASS e Playwright com 168 PASS/6 FAIL em aproximadamente 5,8 minutos; REC-403-F01 a REC-403-F06 registrados sem atribuição inventada de causa raiz. Comandos direcionados de `ui-governance` e `visual.baseline` adicionados aos quality gate tools para tornar a reprodução executável. | @po (Pax) |
| 2026-07-14 | 1.0 | **GO — 10/10; Draft → Ready.** PASS em objetivo/contexto, rastreabilidade à Épica 17/AC-17.21, escopo e exclusões REC-404/405, executor/quality gate independentes, inventário reproduzível, acceptance criteria mensuráveis, tarefas mapeadas aos ACs, referências verificadas no harness, proteção do worktree/baselines, testes e evidências sanitizadas. `@qa` foi mantido como quality gate por autoridade constitucional; `@dev` não autoaprova. Bloqueadores documentais: 0. Condições de execução: REC-001 criada com freeze operacional ativo; diagnosticar antes de editar; não obter verde por skip/fixme, relaxamento de assert, timeout isolado ou atualização oportunista de baseline. A story está liberada para implementação local e continua bloqueando qualquer merge de código/migration enquanto o gate agregado permanecer vermelho. | @po (Pax) |
| 2026-07-14 | 1.1 | **Ready → In Progress; triagem QA NO-GO.** Os seis failures foram classificados: F01 provável falha de aplicação/integração na mutação de students; F02–F04 dependem de Supabase mutável e baseline visual não canônico; F05–F06 usam contrato de prontidão legado em `/cursos`. Nenhum flake foi comprovado. Reexecução com escrita foi bloqueada até existir ambiente de teste isolado e decisão formal sobre snapshots. | @qa (Quinn) |
| 2026-07-14 | 1.2 | Correção parcial implementada: F02–F04 passam com fixture pública opt-in em bundle exclusivo do Playwright; F05/F06 usam o contrato atual de catálogo e passaram em desktop/mobile sem gravar PNG; `students:create` agora exige e usa o ID canônico, e o E2E captura a resposta sanitizada com cleanup em `finally`. Story permanece In Progress até reprodução de F01 e gate agregado em Supabase isolado. | @dev (Dex) |
| 2026-07-14 | 1.3 | Hardening pós-revisão QA: mutações E2E agora falham fechado sem opt-in e project refs de teste/produção distintos; o skip global de `admin-crud` foi removido; o bundle determinístico foi isolado em `.next-playwright`; readiness valida separadamente `Ver turma` e `Ver detalhes`. | @dev (Dex) |
| 2026-07-14 | 1.4 | Isolamento SSR do baseline visual concluído com cookie restrito ao bundle Playwright; `/cursos`, detalhe de curso e artigo usam fixtures sem consultar o catálogo real, enquanto build normal e contextos sem cookie permanecem reais. | @dev (Dex) |
| 2026-07-14 | 1.5 | Supabase isolado local criado após indisponibilidade de cota remota; 24 migrations reaplicadas do zero, escrita E2E limitada a loopback com opt-in explícito, CSP local restrito à origem configurada e Edge Functions com secrets ignorados. O CRUD administrativo passou 10/10 e o agregado passou 174/174. A investigação adicional eliminou hidratação intermitente ao filtrar soft-deletes explicitamente no SSR service-role e hidratar o admin com catálogo inicial consistente. | @dev (Dex) |

## File List

- `package.json`
- `.gitignore`
- `eslint.config.mjs`
- `next.config.mjs`
- `tsconfig.json`
- `scripts/build-playwright-app.mjs`
- `scripts/run-playwright.mjs`
- `scripts/run-playwright-test-build.mjs`
- `src/lib/app-store.tsx`
- `src/lib/security-headers.ts`
- `src/lib/public-test-baseline.ts`
- `src/lib/supabase/rh-cursos-api.ts`
- `src/components/next-page-shell.tsx`
- `src/features/admin-shell/dashboard-shell.tsx`
- `src/features/public-shell/public-layout.tsx`
- `src/__tests__/lib/app-store.test.ts`
- `src/__tests__/lib/public-test-baseline.test.ts`
- `src/__tests__/lib/rh-cursos-api.test.ts`
- `src/__tests__/lib/security-headers.test.ts`
- `src/__tests__/helpers/integration-env.test.ts`
- `tests/admin-crud.spec.ts`
- `tests/helpers/integration-env.ts`
- `tests/helpers/safe-writable-env.ts`
- `tests/checkout.e2e.spec.ts`
- `tests/public-journeys.spec.ts`
- `tests/ui-governance.spec.ts`
- `tests/visual.baseline.spec.ts`
- `scripts/setup-local-supabase-e2e.mjs`
- `supabase/.gitignore`
- `supabase/config.toml`
- `app/admin/layout.tsx`
- `app/cursos/page.tsx`
- `app/cursos/[slug]/page.tsx`
- `app/blog/[slug]/page.tsx`
- `docs/stories/2026-07-14-rec-403-suite-agregada-baseline-verde.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex (`@dev` / Dex).

### Debug Log References

- Baseline agregado: typecheck PASS, build PASS e Playwright 168 PASS/6 FAIL em aproximadamente 5,8 minutos.
- F01: `tests/admin-crud.spec.ts:784`, registro sintético de student não encontrado; modal permaneceu aberto e falta capturar status/body sanitizado da mutação.
- F02/F03: home desktop/mobile divergem porque a execução recebeu três turmas onde o snapshot esperava duas.
- F04: filtro de cursos recebeu seis cursos onde o snapshot esperava três; a diferença visual de 16 px reflete o contador variável.
- F05/F06: `tests/visual.baseline.spec.ts` aguarda `/turmas na agenda/i`, mas o contrato atual renderiza `cursos no catálogo`.
- A execução regravou 12 PNGs de `tests/baseline/`; sete snapshots `ui-governance` já estavam alterados antes. Nenhum PNG foi aceito como novo baseline.
- Preflight: branch `main`, commit `cea25013099b8afbfd975f4643016e27b963ad0e`, Node 25.8.1, npm 11.16.0, macOS arm64. Variáveis foram inspecionadas somente por presença; `.env.local` está documentado como produção.
- F02–F04: bundle Playwright dedicado + opt-in por `localStorage`; `ui-governance` passou 8/8. Hashes de hero, home mobile e filtros permaneceram `457d4716…`, `b3c081e4…` e `49187869…`.
- F05/F06: readiness de `/cursos` passou em desktop 1280×720 e mobile 393×851 sem executar a captura que grava PNG versionado.
- Gates seguros pós-correção: lint PASS; typecheck PASS; unit 45 arquivos/511 testes PASS; build normal PASS após o build de teste; build Playwright isolado PASS; coleção Playwright preservada em 174 testes/20 arquivos.
- Gate pendente: `admin-crud` não pôde ultrapassar a nova guarda e `npm test` integral não foi executado porque terminaria no mesmo bloqueio obrigatório até existir Supabase exclusivo de testes.
- Prova fail-closed: o cenário F01 foi invocado contra a configuração atual e terminou antes da navegação com `Mutações E2E bloqueadas`, sem executar escrita; o antigo skip global foi removido.
- Prova fail-closed ampliada: a jornada pública de contato/in-company também foi invocada e bloqueada antes da navegação; cada override público/server-side de Edge Functions é validado independentemente contra o ref isolado ou uma origem custom explicitamente aprovada.
- Isolamento SSR: `ui-governance` permaneceu 8/8 sem logs `mapCourse`; navegação dirigida de detalhe de curso e artigo passou usando fixture, sem leitura observável do catálogo Supabase real.
- Provisionamento remoto não alterou estado: a organização já possuía dois projetos free ativos e a API recusou um terceiro. O fallback local foi adotado sem pausar projetos e o banco anterior foi preservado em snapshot privado `~/.local/share/rh-cursos-e2e/snapshots/pre-isolated-reset-20260714T163406.sql`.
- Ambiente isolado local: stack completa em loopback, porta de analytics deslocada para evitar conflito, `supabase db reset --local` reaplicou 24 migrations e restaurou o catálogo público mínimo. `supabase/functions/.env` contém apenas runtime local, possui modo restrito e é ignorado pelo Git.
- Guarda de escrita local: exige simultaneamente opt-in, target `isolated-test`, project ref `local`, ref de produção diferente e URL HTTP em host loopback/porta 54321; origem hospedada e hostname enganoso continuam recusados. Testes focados: 14/14 PASS.
- F01 reproduzido no ambiente isolado: o bloco `admin-crud` passou 10/10, incluindo criação de aluno com ID canônico, confirmação no backend e cleanup. Nenhum segredo, token ou credencial foi anexado.
- Diagnóstico CSP/toast: chamadas do navegador ao Supabase local eram bloqueadas pelo `connect-src`; a política agora adiciona somente a origem loopback configurada e seu WebSocket. O `AppToaster` raiz tornou-se o único mount global, eliminando notificações duplicadas.
- Diagnóstico de hidratação: uma primeira execução agregada passou 172/174 e revelou React #418 em `/cursos` e `/admin/instrutores`. Trace confirmou SSR service-role incluindo soft-deletes enquanto o cliente anon aplicava RLS; queries públicas receberam filtros explícitos e o admin passou a receber catálogo inicial no SSR. Repetição direcionada passou 10/10.
- Prova final em banco resetado: lint PASS; typecheck PASS; unit 46 arquivos/518 testes PASS; build PASS; Playwright 174/174 PASS em aproximadamente 2,9 minutos; CRUD administrativo 10/10 dentro do agregado; nenhum snapshot foi atualizado como correção.

### Completion Notes

- F02–F06 foram corrigidos sem aumentar timeout, relaxar tolerância, omitir cenário ou atualizar snapshots.
- A fixture determinística contém três cursos, incluindo um curso elegível sem turma, coerente com a story de catálogo já aprovada.
- `createStudent` usa o ID retornado por `admin-resources` e rejeita sucesso 2xx sem ID; regressões unitárias cobrem os dois contratos.
- O E2E de aluno agora distingue falha HTTP/mutação de falha de consulta, compara o ID persistido e executa cleanup em `finally` sem mascarar a falha primária.
- Toda chamada a `ensureAuthUser` também exige opt-in de escrita e target isolado; URL e project ref precisam concordar e o ref de produção precisa ser diferente.
- Inserção de curso, conclusão de checkout, envio de leads e cleanups públicos exercitados pelo agregado recebem a mesma guarda antes da primeira escrita.
- O bundle com capacidade de fixture vive em `.next-playwright`, ignorado por Git/ESLint; preview/deploy normal continua usando `.next`.
- O cookie de baseline SSR só é aceito quando `PLAYWRIGHT_TEST_BUILD=1` e `NEXT_PUBLIC_PLAYWRIGHT_TEST_BASELINE=1`; cookie isolado não ativa fixture em build normal.
- Próximo passo seguro: revisão independente de `@qa`, amostragem dos gates e veredito PASS/CONCERNS/FAIL; a alternativa remota continua bloqueada apenas pela cota do plano, não pela execução local.
- Merge continua bloqueado até o veredito independente de `@qa`, embora os gates técnicos tenham passado no ambiente isolado local sem aceitar deltas de baseline.

## QA Results

### 2026-07-14 — Triagem inicial

**Veredito:** NO-GO.

- F01: provável aplicação/integração; confiança média. A mutação `students:create` precisa expor resposta, toast e correlação antes de qualquer ajuste.
- F02–F04: fixture/harness; confiança alta. Screenshots consomem catálogo Supabase externo e mutável.
- F05–F06: contrato de teste desatualizado; confirmado. A condição de prontidão ainda procura texto removido pelo contrato atual do catálogo.
- Nenhuma falha foi classificada como flake.
- Proibido atualizar snapshots, relaxar asserts ou aumentar timeout para obter verde.
- Reexecução administrativa está bloqueada enquanto `.env.local` não apontar comprovadamente para um projeto Supabase exclusivo de testes.
