# Relatório — REC-405: Separar comparação visual da atualização

Story: [`docs/stories/2026-07-16-rec-405-separar-comparacao-atualizacao.md`](../../stories/2026-07-16-rec-405-separar-comparacao-atualizacao.md) · Épica 17, Onda 5.

## 1. Estado real encontrado

`.github/workflows/ci.yml` já usava `npm run test:e2e:smoke` (sem flag de atualização) para a lane de teste — não havia risco real de CI atualizar baseline automaticamente. Porém, não existiam scripts `package.json` nomeados explicitamente para comparação (`test:visual`) nem atualização (`test:visual:update`) da suíte `tests/ui-governance.spec.ts` (Playwright, `toHaveScreenshot`), e nenhum teste automatizado travava essa separação contra regressão futura (ex: alguém adicionar `--update-snapshots` a um workflow por engano).

## 2. Mudança aplicada

`package.json`:
```
"test:visual": "node scripts/run-playwright.mjs ui-governance.spec.ts --project=functional",
"test:visual:update": "node scripts/run-playwright.mjs ui-governance.spec.ts --project=functional --update-snapshots",
```

Novo teste `src/__tests__/ci/visual-baseline-separation.test.ts` (5 asserções Vitest):
1. `test:visual` existe, referencia `ui-governance.spec.ts`, sem flag de update.
2. `test:visual:update` existe, referencia `ui-governance.spec.ts`, com `--update-snapshots`.
3. Nenhum outro script do `package.json` carrega `--update-snapshots`.
4. Nenhum workflow em `.github/workflows/` referencia `test:visual:update` ou a flag `--update-snapshots`.
5. `.github/workflows/ci.yml` usa `npm run test:e2e:smoke` (comparação), não `test:visual:update`.

Nenhuma alteração em `.github/workflows/` — já estava correto.

## 3. Validação

- `npx vitest run src/__tests__/ci/visual-baseline-separation.test.ts` → 5/5 passing.
- `npm run lint` → limpo.
- `npm run typecheck` → limpo.
- `npx vitest run` (suíte completa) → `606 passed (606)` em execução limpa. Uma execução anterior (23:30) teve 1 falha por `Timeout waiting for worker to respond` — erro de infraestrutura do pool de workers do Vitest sob carga do ambiente, não uma falha de asserção. Reexecutado imediatamente depois: 100% verde, confirmando flake não-reprodutível.

## 4. Nota de processo

O agente executor original sofreu uma falha de conexão de API (infraestrutura) imediatamente após concluir a implementação (script + teste), mas antes de escrever a story e este relatório. `aiox-master` (Orion) consolidou a documentação final e executou a validação completa a partir da inspeção direta do trabalho já produzido, sem alterar nenhuma linha de código.

## 5. AC → evidência

| AC | Evidência |
|---|---|
| 1-3 — scripts corretamente separados | Asserções 1-3 do teste novo |
| 4-5 — CI nunca invoca atualização | Asserções 4-5 do teste novo; leitura direta de `ci.yml` |
| 6 — garantia travada por teste automatizado | O próprio arquivo `visual-baseline-separation.test.ts` |
| 7 — suíte completa sem regressão | `606 passed (606)`, lint/typecheck limpos |
