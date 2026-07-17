# Story REC-405: Separar comparação visual da atualização

## Status

Done

## Executor Assignment

executor: "@dev"
quality_gate: "@qa"
quality_gate_tools:
- teste automatizado (`visual-baseline-separation.test.ts`) que trava estruturalmente a separação comando de comparação vs. comando de atualização
- inspeção de `.github/workflows/*.yml` confirmando ausência de `--update-snapshots`/`test:visual:update`
- reexecução completa de `npm run lint`, `npm run typecheck`, `npx vitest run`

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 5 — Qualidade e sustentabilidade
- **Prioridade:** P1
- **Estimativa:** S
- **Findings:** FND-15 (parte "CI nunca atualiza baseline durante comparação")
- **Requisitos:** NFR-06
- **Gate relacionado:** G4 — Deploy normal

## Story

**As a** responsável por qualidade da RH Cursos,
**I want** que o comando de comparação visual usado em CI nunca seja capaz de atualizar o baseline de regressão visual,
**so that** uma regressão visual real nunca seja mascarada por uma atualização silenciosa da imagem de referência.

## Contexto e valor

A Épica 17 (FND-15) descreve o risco genérico de "suíte agregada contém falhas / sinal de qualidade não representa o sistema real". Um caso específico desse risco em suítes de regressão visual (Playwright `toHaveScreenshot`) é o comando de CI ter, acidental ou implicitamente, a capacidade de rodar com `--update-snapshots` — nesse caso, uma mudança visual real (bug de layout, CSS quebrado) passaria a atualizar o baseline em vez de falhar o build.

## Escopo

### Incluído

- Investigação honesta do estado real: o projeto já usa `test:e2e:smoke` (sem flag de update) como lane de CI (`.github/workflows/ci.yml`), e não havia, antes desta story, nenhum script `package.json` nomeado explicitamente para comparação visual (`test:visual`) nem para atualização (`test:visual:update`) — a suíte `ui-governance.spec.ts` (Playwright, `toHaveScreenshot`) não tinha comandos dedicados e nomeados, apenas o runner genérico.
- Dois scripts novos e explicitamente nomeados em `package.json`: `test:visual` (comparação, sem flag de update) e `test:visual:update` (atualização manual/local, com `--update-snapshots`).
- Teste automatizado `src/__tests__/ci/visual-baseline-separation.test.ts` (Vitest) que trava estruturalmente a garantia: `test:visual` nunca carrega flag de update; `test:visual:update` existe e é o único script que carrega a flag; nenhum outro script do `package.json` carrega `--update-snapshots`; nenhum workflow de CI referencia `test:visual:update` nem a flag `--update-snapshots`; a lane de CI usa `test:e2e:smoke` (comparação).
- Confirmação de que `.github/workflows/ci.yml` já estava correto (não usa nenhum comando de atualização) — nenhuma mudança necessária no workflow.

### Fora do escopo

- Qualquer alteração de lógica de aplicação, autenticação, migration ou endpoint.
- Regenerar ou revisar os 16 baselines PNG pendentes mencionados em REC-301 (decisão de produto separada, não desta story).
- Qualquer mudança em `.github/workflows/ci.yml` (já correto).

## Acceptance Criteria

1. **Script de comparação sem flag de update**
   `test:visual` existe, referencia `ui-governance.spec.ts`, e não contém `--update-snapshots` nem `-u`.

2. **Script de atualização separado e explícito**
   `test:visual:update` existe, referencia `ui-governance.spec.ts`, e contém `--update-snapshots`.

3. **Nenhum outro script carrega a flag de update**
   Todo script em `package.json`, exceto `test:visual:update`, não contém `--update-snapshots`.

4. **CI nunca invoca o comando de atualização**
   Nenhum workflow em `.github/workflows/` referencia `test:visual:update` ou a flag `--update-snapshots`.

5. **Lane de CI usa comparação, não atualização**
   `.github/workflows/ci.yml` usa `npm run test:e2e:smoke` (comparação) e não `test:visual:update`.

6. **Garantia travada por teste automatizado**
   As 5 garantias acima são verificadas por um teste automatizado (`visual-baseline-separation.test.ts`), não apenas por inspeção manual pontual — qualquer regressão futura (ex: alguém adicionar `--update-snapshots` a um script de CI) quebra o teste.

7. **Nenhuma regressão na suíte completa**
   `npm run lint`, `npm run typecheck` e `npx vitest run` permanecem 100% verdes.

## Tasks / Subtasks

- [x] **Task 1 — Investigar o estado real** (AC: 4, 5)
  - [x] Confirmado que `.github/workflows/ci.yml` já usava `npm run test:e2e:smoke` (sem flag de update) — nenhuma mudança necessária no workflow.
  - [x] Confirmado que não existiam scripts nomeados `test:visual`/`test:visual:update` antes desta story.

- [x] **Task 2 — Criar os dois scripts separados** (AC: 1, 2, 3)
  - [x] `test:visual` adicionado a `package.json`, sem flag de update.
  - [x] `test:visual:update` adicionado, com `--update-snapshots`, nome explícito de intenção manual.

- [x] **Task 3 — Travar a garantia por teste automatizado** (AC: 6)
  - [x] `src/__tests__/ci/visual-baseline-separation.test.ts` criado (5 asserções Vitest): script de comparação sem flag; script de atualização existe e tem a flag; nenhum outro script tem a flag; nenhum workflow referencia o comando/flag de atualização; CI usa a lane de comparação.

- [x] **Task 4 — Validar suíte completa** (AC: 7)
  - [x] `npx vitest run src/__tests__/ci/visual-baseline-separation.test.ts` isolado: 5/5 passing.
  - [x] `npm run lint`: limpo.
  - [x] `npm run typecheck`: limpo.
  - [x] `npx vitest run` (suíte completa): `606 passed (606)` em execução limpa (uma execução anterior teve 1 timeout de worker por sobrecarga do ambiente às 23:30 — flake de infraestrutura confirmado não-reprodutível na reexecução, documentado com transparência).

- [x] **Task 5 — Consolidar evidência**
  - [x] Relatório sanitizado em `docs/history/reports/rec-405-separar-comparacao-2026-07-16.md`.
  - [ ] Gate QA fica para criação por `@qa`.

## Dev Notes

### Fontes verificadas

- FND-15/NFR-06 fundamentam o risco de sinal de qualidade não confiável. [Fonte: `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md`]
- `.github/workflows/ci.yml` já usava `npm run test:e2e:smoke` para a lane de comparação — não usa nem usava nenhuma flag de atualização.
- `tests/ui-governance.spec.ts` é a suíte Playwright real de regressão visual (`toHaveScreenshot`), executada pelo runner `scripts/run-playwright.mjs`.
- REC-301 (Done) menciona 16 baselines PNG regenerados em `tests/baseline/` aguardando decisão de commitar/descartar — pendência de produto, não tocada por esta story.

### Project Structure Notes

- Alteração restrita a `package.json` (2 scripts novos) e um teste novo (`src/__tests__/ci/visual-baseline-separation.test.ts`).
- Nenhuma alteração em `.github/workflows/`, pois já estava correto.

## Testing e evidências

- `visual-baseline-separation.test.ts`: 5 asserções, todas passando.
- Suíte completa: `npx vitest run` → `606 passed (606)` (execução limpa, sem worker timeout).
- `npm run lint`/`npm run typecheck`: limpos.

## Observabilidade

- Nenhum log/métrica novo introduzido; garantia é puramente estrutural (script + teste), não runtime.

## Security Notes

- Nenhum dado sensível envolvido; escopo é puramente de configuração de CI/scripts.

## Dependências

- **Entrada:** REC-401 (`Done`, pipeline de CI já ordenado).
- **Não depende de:** nenhuma story de autenticação ou banco.

## Roll-forward / Rollback

- **Roll-forward obrigatório:** qualquer novo script de teste visual futuro deve seguir o mesmo padrão de nomenclatura (`*:update` explícito para qualquer comando com flag de atualização).
- **Rollback proibido:** remover o teste `visual-baseline-separation.test.ts` ou adicionar `--update-snapshots` a um script de CI.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> Validação usa revisão manual do teste e dos scripts por `@qa`.

### Story Type Analysis

- **Primary Type:** CI/Quality (separação comparação vs. atualização)
- **Complexity:** Baixa — dois scripts novos e um teste que trava a garantia estruturalmente.
- **Agentes:** executor `@dev`; quality gate independente `@qa`.

### Manual review focus

- Confirmar que o script de comparação nunca carrega flag de update.
- Confirmar que nenhum workflow de CI referencia o comando de atualização.
- Confirmar que o teste automatizado de fato falharia se a separação fosse violada no futuro.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-16 | 0.1 | Draft criado a partir de FND-15/NFR-06, Onda 5, com investigação de que `.github/workflows/ci.yml` já usava a lane de comparação corretamente (`test:e2e:smoke`), mas não existiam scripts nomeados dedicados de comparação/atualização visual. | @dev via aiox-master (Orion) |
| 2026-07-16 | 1.0 | **Draft → InReview.** Implementado: `test:visual`/`test:visual:update` adicionados a `package.json`; teste `visual-baseline-separation.test.ts` (5 asserções) criado para travar a garantia estruturalmente. Nenhuma mudança necessária em `.github/workflows/`. Nota de processo: o agente executor sofreu uma falha de conexão de API após concluir a implementação, mas antes de escrever a story/relatório — documentação final consolidada por `aiox-master` (Orion) a partir de inspeção direta do diff e do teste já criado, sem alterar código. | @dev via aiox-master (Orion) |
| 2026-07-16 | 1.1 | **InReview → Done.** Gate PASS emitido por `@qa` após reexecução independente: teste isolado 5/5, suíte completa `606 passed (606)` em execução limpa (um timeout de worker isolado em execução anterior, às 23:30, confirmado como flake de infraestrutura não-reprodutível, documentado com transparência). Lint/typecheck limpos. | @qa (Quinn) |

## File List

### Criado nesta execução

- `docs/stories/2026-07-16-rec-405-separar-comparacao-atualizacao.md`
- `src/__tests__/ci/visual-baseline-separation.test.ts`
- `docs/history/reports/rec-405-separar-comparacao-2026-07-16.md`

### Modificado nesta execução

- `package.json` (scripts `test:visual`, `test:visual:update`)

### Referências somente leitura

- `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md`
- `docs/stories/2026-07-14-rec-401-encadear-ci-deploy.md`
- `.github/workflows/ci.yml`
- `tests/ui-governance.spec.ts`

## Dev Agent Record

### Agent Model Used

Claude (persona `@dev` para esta story, executor assíncrono; documentação final consolidada por `aiox-master`/Orion após falha de conexão do agente original).

### Debug Log References

`npx vitest run` (execução limpa) → `606 passed (606)`; `npm run lint`/`npm run typecheck` limpos.

### Completion Notes

O problema descrito pelo AC não estava presente no workflow de CI (já usava a lane de comparação corretamente), mas não havia scripts nomeados explicitamente nem um teste que travasse essa garantia estruturalmente contra regressão futura. Esta story adiciona ambos.

## QA Results

### Gate: PASS ✅ — @qa (Quinn), 2026-07-16

**Gate file:** [`docs/qa/gates/rec-405-separar-comparacao-atualizacao.yml`](../qa/gates/rec-405-separar-comparacao-atualizacao.yml) · **Quality score:** 91/100

Verificação independente: teste `visual-baseline-separation.test.ts` reexecutado isoladamente (5/5) e como parte da suíte completa (`606 passed`, execução limpa). `npm run lint`/`npm run typecheck` limpos. Confirmado que `.github/workflows/ci.yml` já usava a lane de comparação corretamente antes desta story — a contribuição real é o teste que trava a garantia contra regressão futura.

**Veredito:** PASS. Nenhuma ação bloqueante.

— Quinn, guardião da qualidade 🛡️
