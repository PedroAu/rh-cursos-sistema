# Story REC-404: Medir cobertura real

## Status

Done

## Executor Assignment

executor: "@dev"
quality_gate: "@qa"
quality_gate_tools:
- `npm run lint`
- `npm run typecheck`
- `npx vitest run`
- `npx vitest run --coverage`
- comparação de `git status --short` antes/depois de cada gate que produza artefatos

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 5 — Qualidade e sustentabilidade
- **Prioridade:** P1 — operação e UX
- **Estimativa:** S, esforço focado de meio dia
- **Finding:** FND-15
- **Requisitos:** NFR-06
- **Critérios da épica:** entrega mensurável "Allowlist artificial removida; baseline e ratchet documentados"
- **Gate relacionado:** não bloqueia G4 diretamente; sustenta a confiabilidade do sinal de qualidade sobre o qual REC-403 já apoia o baseline verde

## Story

**As a** mantenedor responsável pela recuperação da RH Cursos,
**I want** que a métrica de cobertura de testes represente o código elegível real do projeto em vez de uma allowlist manual pequena,
**so that** o sinal de qualidade reportado por `npx vitest run --coverage` reflita o sistema real e sirva de piso (ratchet) para não regredir, sem inventar uma meta arbitrária.

## Contexto e valor

FND-15 registra que "a cobertura mede um conjunto manual pequeno e a suíte agregada contém falhas — sinal de qualidade não representa o sistema real". REC-403 (Done) já restaurou o baseline constitucional verde (lint/typecheck/testes/build) mas explicitamente não tocou a allowlist de cobertura, encaminhando essa dívida para esta story: "`vitest.config.ts` mede cobertura sobre uma allowlist manual. Isso é FND-15, mas a remoção da allowlist pertence exclusivamente a REC-404."

Antes desta story, `vitest.config.ts` restringia `coverage.include` a 12 arquivos escolhidos manualmente sob `src/lib/` e `src/hooks/`, com thresholds fixos de 70% aplicados apenas a esse subconjunto. Qualquer outro arquivo do projeto (componentes, features, views, rotas do App Router testadas por unit) era invisível ao relatório de cobertura, mesmo quando exercitado por testes existentes.

## Escopo

### Incluído

- Remover a allowlist manual de `coverage.include` em `vitest.config.ts`.
- Ampliar `coverage.include` para o código elegível real (`src/**/*.{ts,tsx}`).
- Restringir `coverage.exclude` a artefatos gerados, tipos e configuração (não a arquivos de lógica por conveniência).
- Executar `npx vitest run --coverage` para medir o número real atual (statements/branches/functions/lines).
- Registrar esse número como baseline/ratchet em `coverage.thresholds`, sem inventar meta de 80%/90%.
- Documentar o baseline em relatório sanitizado.

### Fora do escopo

- Escrever testes novos para aumentar cobertura de funcionalidade (não é objetivo desta story).
- Corrigir causas raiz de features sem teste — apenas medir e documentar.
- Introduzir ferramenta de cobertura nova (Article IV — No Invention); usa apenas `@vitest/coverage-v8` já presente.
- Separar/gatear CI (REC-401/REC-402) ou capturar/comparar visual (REC-405).
- Alterar qualquer migration, endpoint ou lógica de aplicação.

## Acceptance Criteria

1. **Allowlist artificial removida**
   **Given** `vitest.config.ts` antes da mudança,
   **when** a story é concluída,
   **then** `coverage.include` não lista mais um conjunto manual de 12 arquivos; passa a cobrir `src/**/*.{ts,tsx}` com exclusões apenas de artefatos gerados/tipos/config/testes/stories.

2. **Baseline real medido e documentado**
   `npx vitest run --coverage` produz um número real de statements/branches/functions/lines sobre o código elegível ampliado, e esse número é registrado nesta story e em `docs/history/reports/rec-404-cobertura-real-2026-07-16.md`, sem meta arbitrária inventada.

3. **Ratchet configurado**
   `coverage.thresholds` em `vitest.config.ts` é ajustado para o baseline real medido (piso, não meta aspiracional), de forma que `npx vitest run --coverage` falhe se a cobertura cair abaixo do baseline registrado nesta execução.

4. **Sem regressão dos gates constitucionais**
   `npm run lint`, `npm run typecheck` e `npx vitest run` (sem coverage) continuam verdes com a mesma contagem de testes (601/601) observada em REC-403.

5. **Sem invenção de ferramenta nova**
   A mudança usa exclusivamente `@vitest/coverage-v8` e configuração nativa do Vitest já presentes no projeto; nenhuma dependência nova é adicionada.

## Tasks / Subtasks

- [x] **Task 1 — Investigar configuração atual** (AC: 1)
  - [x] Ler `vitest.config.ts` e identificar a allowlist manual de `coverage.include`.
  - [x] Ler REC-403 e confirmar que a remoção da allowlist foi encaminhada explicitamente para REC-404.
  - [x] Mapear o código elegível real em `src/**` (arquivos de lógica vs. gerados/tipos/config/testes/stories).

- [x] **Task 2 — Remover allowlist e ampliar cobertura** (AC: 1, 5)
  - [x] Remover a lista manual de 12 arquivos de `coverage.include`.
  - [x] Definir `coverage.include: ['src/**/*.{ts,tsx}']`.
  - [x] Ajustar `coverage.exclude` para cobrir apenas `node_modules/`, `src/__tests__/`, arquivos `*.test.*`/`*.spec.*`/`*.stories.tsx`, `database.types.ts` (gerado), `src/design-tokens/**`, `src/types/**`, `src/graphify-out/**` (cache) e `*.d.ts`.
  - [x] Adicionar `json-summary` ao reporter para permitir leitura programática do total.

- [x] **Task 3 — Medir baseline real** (AC: 2)
  - [x] Executar `npx vitest run --coverage`.
  - [x] Registrar statements/branches/functions/lines totais reportados.
  - [x] Confirmar 601/601 testes ainda passam (nenhuma regressão de suíte).

- [x] **Task 4 — Configurar ratchet** (AC: 3)
  - [x] Definir `coverage.thresholds` com os valores medidos como piso.
  - [x] Reexecutar `npx vitest run --coverage` para confirmar que os thresholds passam com o baseline atual.
  - [x] Documentar que qualquer PR que reduza a cobertura abaixo desse piso falha o gate localmente (CI ainda não está encadeado — REC-401/402).

- [x] **Task 5 — Verificação final e relatório** (AC: 2, 4)
  - [x] Rodar `npm run lint`.
  - [x] Rodar `npm run typecheck`.
  - [x] Rodar `npx vitest run` (sem coverage) e confirmar 601/601.
  - [x] Escrever relatório sanitizado em `docs/history/reports/rec-404-cobertura-real-2026-07-16.md`.
  - [x] Atualizar Dev Agent Record, Change Log e File List desta story.

## Dev Notes

### Estado técnico observado (antes da mudança)

- `vitest.config.ts` restringia `coverage.include` a: `src/lib/validation.ts`, `src/lib/auth.ts`, `src/lib/utils.ts`, `src/lib/company.ts`, `src/lib/get-initials.ts`, `src/lib/debounce.ts`, `src/lib/admin-form-validation.ts`, `src/lib/analytics.ts`, `src/lib/utils/csv-export.ts`, `src/hooks/use-hotkey.ts`, `src/hooks/use-simulated-loading.ts`, `src/lib/hooks/useAdminSearch.ts`.
- `coverage.thresholds` era fixo em 70% para statements/branches/functions/lines, aplicado apenas a esse subconjunto — um gate "de bolso", não representativo do sistema real (FND-15).
- `@vitest/coverage-v8` (v4.1.9) tem `coverage.all` com default `true` desde Vitest 3.x, então ampliar `include` já é suficiente para reportar arquivos nunca importados por teste (cobertura 0%) e não apenas os tocados — essencial para o número real, não inflado.
- Existiam 159 arquivos `.ts`/`.tsx` de lógica real sob `src/` (excluindo `__tests__`, `.test.`, `.spec.`, `.stories.`) e 46 arquivos `.stories.tsx` de Storybook.
- `src/graphify-out/cache/` contém apenas JSON de cache do graphify, não código-fonte; foi excluído por não ser "código elegível".

### Baseline real medido em 2026-07-16

Execução de `npx vitest run --coverage` após a mudança, 601/601 testes PASS (56 arquivos):

| Métrica | Total | Cobertos | % |
|---|---:|---:|---:|
| Statements | 4512 | 2143 | 47.49% |
| Branches | 3714 | 1461 | 39.33% |
| Functions | 1462 | 648 | 44.32% |
| Lines | 4039 | 1973 | 48.84% |

Thresholds (ratchet) definidos em `vitest.config.ts` com margem conservadora abaixo do medido, para não quebrar por variação mínima entre execuções:

```
statements: 47
branches: 39
functions: 44
lines: 48
```

Este é um piso de não regressão, não uma meta de qualidade. Não foi definida meta de 80%/90% porque isso seria invenção sem base (Article IV).

### Referências arquiteturais

- FND-15 e a exclusão explícita de escopo de REC-403: [Fonte: `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md`, linhas com FND-15 e tabela da Onda 5]
- Encaminhamento de dívida em REC-403: "Remover a allowlist artificial de cobertura ou ampliar cobertura elegível: REC-404." [Fonte: `docs/stories/2026-07-14-rec-403-suite-agregada-baseline-verde.md`]

### Project Structure Notes

- Arquivo alterado: `vitest.config.ts` (bloco `test.coverage`).
- Nenhum arquivo de aplicação, migration ou endpoint foi tocado.
- Nenhum teste novo foi criado; a mudança é de configuração de medição.

### Restrições de implementação

- Não introduzir ferramenta de cobertura nova; usar apenas `@vitest/coverage-v8` já presente (Article IV — No Invention).
- Não definir threshold acima do baseline real medido (isso quebraria o gate imediatamente e seria uma meta arbitrária, não um ratchet).
- Não excluir arquivos de lógica real por conveniência para inflar o percentual.
- Não tocar em migrations, endpoints ou arquivos de outras stories REC-* já concluídas.

## Testing

### Sequência durante o desenvolvimento

1. Ler configuração atual e confirmar a allowlist.
2. Editar `coverage.include`/`coverage.exclude`.
3. Rodar `npx vitest run --coverage` para obter o número real.
4. Ajustar `coverage.thresholds` ao número medido (piso).
5. Rerodar `npx vitest run --coverage` para confirmar que passa.
6. Rodar `npm run lint`, `npm run typecheck` e `npx vitest run` (sem coverage).

### Cenários mínimos

- `npx vitest run --coverage` conclui com exit code 0 após o ajuste de thresholds.
- `npx vitest run` (sem coverage) mantém 601/601 testes PASS, igual ao baseline de REC-403.
- Nenhum arquivo de lógica real (`src/components`, `src/features`, `src/views`, `src/hooks`, `src/lib`) foi excluído do relatório de cobertura.
- Apenas artefatos gerados/tipos/config/testes/stories permanecem excluídos.

## Observabilidade

- `coverage/unit/coverage-summary.json` (gerado, não versionado) contém o total exato usado nesta story.
- Relatório sanitizado documenta números, decisão de threshold e recomendação de follow-up para encadeamento no CI.

## Security Notes

- Nenhum dado sensível é gerado por esta mudança; a cobertura é medida sobre código-fonte já público no repositório.
- O relatório de cobertura (`coverage/`) não é versionado (`.gitignore` já cobre esse diretório).

## Dependências

- **Entrada:** REC-403 (Done) — baseline constitucional verde restaurado, dívida de allowlist explicitamente encaminhada para REC-404.
- **Bloqueia:** nenhuma story subsequente diretamente; é uma melhoria de sinal de qualidade.
- **Não implementa:** encadeamento do gate de cobertura no CI (REC-401/REC-402 tratam do pipeline); documentado como recomendação de follow-up.
- **Relacionado:** REC-405 (captura/comparação visual), fora de escopo desta story.

## Roll-forward / Rollback

- **Rollback permitido:** reverter `vitest.config.ts` para a allowlist anterior se o número real medido revelar necessidade de replanejamento (não esperado, mas possível).
- **Roll-forward preferido:** manter o ratchet e, em story futura, encadear o gate de cobertura no CI (fora de escopo aqui).
- **Rollback proibido:** reduzir `coverage.include` de volta a uma allowlist manual para "esconder" áreas com baixa cobertura.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> A revisão usa análise manual de diff, gates constitucionais e veredito independente de `@qa`.

### Story Type Analysis

- **Primary Type:** Testing / Quality Infrastructure
- **Secondary Type:** Configuration
- **Complexity:** Baixa; mudança isolada em um arquivo de configuração
- **Primary Agent:** `@dev`
- **Quality Gate:** `@qa`

### Manual review focus

- Confirmar que a allowlist manual foi de fato removida (não apenas ampliada e ainda seletiva).
- Confirmar que o número documentado bate com a execução real, não estimado.
- Confirmar que o threshold é um piso alcançável hoje, não uma meta aspiracional inventada.
- Confirmar ausência de regressão em lint/typecheck/testes.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-16 | 0.1 | Draft criado e implementado em sequência única: allowlist removida, cobertura ampliada para `src/**`, baseline real medido (47.49% statements / 39.33% branches / 44.32% functions / 48.84% lines) e ratchet configurado em `vitest.config.ts`. | @dev (Dex) |
| 2026-07-16 | 0.2 | Draft → Ready → InProgress → InReview. Gates de verificação executados: lint PASS, typecheck PASS, `npx vitest run` 601/601 PASS, `npx vitest run --coverage` PASS com thresholds do ratchet. Relatório sanitizado publicado em `docs/history/reports/rec-404-cobertura-real-2026-07-16.md`. Aguardando veredito independente de `@qa`. | @dev (Dex) |
| 2026-07-16 | 0.3 | **InReview → Done.** Gate PASS (92/100) emitido por `@qa` após reexecução independente de `npx vitest run --coverage` (601 passed, thresholds OK) e revisão do diff de `vitest.config.ts`. | @qa (Quinn) |

## File List

- `vitest.config.ts`
- `docs/stories/2026-07-16-rec-404-medir-cobertura-real.md`
- `docs/history/reports/rec-404-cobertura-real-2026-07-16.md`

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (`@dev` / Dex, via Executor).

### Debug Log References

- Configuração anterior de `vitest.config.ts`: `coverage.include` restrito a 12 arquivos manuais sob `src/lib/` e `src/hooks/`, com `coverage.thresholds` fixo em 70% para as quatro métricas.
- REC-403 (Done) confirma explicitamente que a remoção da allowlist pertence a REC-404 e não foi tocada naquela story.
- Levantamento do código elegível: 159 arquivos `.ts`/`.tsx` de lógica sob `src/` (excluindo testes/specs/stories) e 46 arquivos `.stories.tsx` do Storybook, além de `src/lib/supabase/database.types.ts` (gerado), `src/design-tokens/tokens.tailwind.d.ts` (gerado) e `src/graphify-out/cache/` (cache JSON, não código-fonte).
- `coverage.include` alterado para `['src/**/*.{ts,tsx}']`; `coverage.exclude` ampliado para cobrir apenas gerados/tipos/config/testes/stories, sem excluir nenhum arquivo de lógica real.
- Primeira execução de `npx vitest run --coverage` (thresholds temporariamente baixos para não bloquear a medição) confirmou 601/601 testes PASS e reportou: statements 47.49% (2143/4512), branches 39.33% (1461/3714), functions 44.32% (648/1462), lines 48.84% (1973/4039).
- `coverage.thresholds` ajustado para `{ statements: 47, branches: 39, functions: 44, lines: 48 }` — piso ligeiramente abaixo do medido, evitando falso-negativo por variação mínima entre execuções.
- Reexecução de `npx vitest run --coverage` com os thresholds finais: exit code 0, mesmos números totais, sem erros de threshold.
- `npm run lint`: PASS, sem warnings/erros.
- `npm run typecheck` (`next typegen && tsc --noEmit`): PASS.
- `npx vitest run` (sem coverage): 56 arquivos / 601 testes PASS, idêntico ao baseline de REC-403 (nenhuma regressão de contagem).

### Completion Notes

- A allowlist artificial de 12 arquivos foi completamente removida; a cobertura agora é medida sobre `src/**/*.{ts,tsx}` real, incluindo arquivos com 0% de cobertura (rotas admin, views de portal, alguns componentes de shell) que antes eram invisíveis ao relatório.
- O número real de cobertura (47.49% statements / 39.33% branches / 44.32% functions / 48.84% lines) é significativamente mais baixo que os 70% anteriores porque o gate anterior media apenas um subconjunto já bem testado — confirma FND-15 diretamente: o sinal antigo não representava o sistema real.
- O ratchet foi implementado com a ferramenta já presente (`@vitest/coverage-v8` + `coverage.thresholds` nativo do Vitest), sem introduzir dependência nova, respeitando o Article IV.
- Encadear esse gate de cobertura no pipeline de CI (bloquear merge automaticamente) não foi feito nesta story porque pertence ao escopo de REC-401/REC-402 (pipeline); fica documentado como recomendação de follow-up no relatório.
- Nenhuma lógica de aplicação, migration ou endpoint foi alterada. Escopo restrito a `vitest.config.ts`.

## QA Results

### Gate: PASS ✅ — @qa (Quinn), 2026-07-16

**Gate file:** [`docs/qa/gates/rec-404-medir-cobertura-real.yml`](../qa/gates/rec-404-medir-cobertura-real.yml) · **Quality score:** 92/100

Diff de `vitest.config.ts` revisado: allowlist de 12 arquivos removida, `include` ampliado para `src/**/*.{ts,tsx}`, `exclude` restrito a artefatos gerados/tipos/cache/testes. `npx vitest run --coverage` reexecutado: `601 passed`, thresholds (47/39/44/48) OK. `npm run lint`/`npm run typecheck` limpos.

**Veredito:** PASS. FND-15 fechado com número real e honesto, sem meta inventada. Residual `low`: ratchet ainda só local, não encadeado no CI (PROC-103, follow-up recomendado).

— Quinn, guardião da qualidade 🛡️
