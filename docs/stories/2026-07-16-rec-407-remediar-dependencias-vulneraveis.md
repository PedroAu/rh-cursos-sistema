# Story REC-407: Remediar dependências vulneráveis

## Status

Done

## Executor Assignment

executor: "@dev" + "@devops"
quality_gate: "@qa"
quality_gate_tools:
- `npm audit` / `npm audit --json` (antes e depois)
- `npm audit --omit=dev` (separação prod vs. dev)
- `npm outdated`
- `npm run lint`
- `npm run typecheck`
- `npx vitest run` (suíte completa)

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 5 — Qualidade e sustentabilidade
- **Prioridade:** P2
- **Estimativa:** S, menos de um dia de esforço focado
- **Finding:** FND-16 (parte de dependências)
- **Requisitos:** NFR-06
- **Critérios da épica:** entrega mensurável "Advisories tratados ou exceções temporárias justificadas e datadas"
- **Dependência:** REC-401 (Done)

## Story

**As a** responsável pela cadeia de suprimentos da RH Cursos,
**I want** que todo advisory conhecido em dependências npm seja corrigido quando existir correção segura, ou registrado como exceção temporária justificada e datada quando não existir,
**so that** a superfície de vulnerabilidade de dependências seja conhecida, rastreável e revisitada periodicamente, em vez de ignorada silenciosamente.

## Contexto e diagnóstico confirmado

`npm audit` no HEAD desta story reporta 8 advisories (6 low, 2 moderate, 0 high, 0 critical). Nenhum advisory possui correção não-destrutiva disponível hoje:

1. **Cadeia `elliptic` (6 low)** — `@storybook/nextjs@10.4.6` → `node-polyfill-webpack-plugin@2.0.1` → `crypto-browserify@3.12.1` → `browserify-sign@4.2.6` / `create-ecdh@4.0.4` → `elliptic@6.6.1`. O advisory [GHSA-848j-6mx2-7j84](https://github.com/advisories/GHSA-848j-6mx2-7j84) tem `range: *`, ou seja, **nenhuma versão publicada de `elliptic` (incluindo a mais recente, `6.6.1`) está fora do range afetado** — não existe versão corrigida upstream no momento desta análise. Confirmado com `npm audit --omit=dev`: **zero** dessas 6 vulnerabilidades aparecem na árvore de produção; a cadeia inteira vem de `@storybook/nextjs`, uma devDependency usada apenas para rodar o Storybook localmente, nunca empacotada no build de produção (`next build` / Cloudflare Worker).
2. **Cadeia `postcss`/`next` (2 moderate)** — [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93), XSS via `</style>` não escapado no stringify do PostCSS. A dependência vulnerável é `node_modules/next/node_modules/postcss@8.4.31`, **fixada internamente pelo próprio `package.json` do pacote `next`** (`"postcss": "8.4.31"`, dependência exata, não um range). O `postcss` de topo do projeto já está em `8.5.15` (>= `8.5.10`, fora do range vulnerável) e não é o afetado. `next@16.2.9` (instalado) e `next@16.2.10` (latest estável disponível) **pinam a mesma versão exata de `postcss@8.4.31`** — não há release estável de Next.js disponível hoje que already-bump essa dependência interna sem saltar para uma major futura (`16.3.0` só existe em canary/preview). O `postcss` afetado é consumido pelo pipeline de build (`next build`/dev server), não por uma rota HTTP de produção que processe CSS não confiável vindo de usuário final.

`npm outdated` confirma que não há bump de `next`, `@storybook/nextjs`, `postcss` (topo) ou `node-polyfill-webpack-plugin` capaz de eliminar essas 8 ocorrências sem depender de uma correção upstream ainda não publicada (`elliptic`) ou de uma major futura do Next.js (`postcss` interno).

`npm audit fix --force` foi avaliado e **rejeitado**: ele propõe rebaixar `@storybook/nextjs` para `7.0.14` e `next` para `9.3.3` — downgrades de major absurdos que quebrariam a aplicação e o Storybook sem de fato eliminar `elliptic` (que continua sem versão corrigida) nem trazer nenhuma garantia adicional sobre `postcss`.

## Escopo

### Incluído

- Executar `npm audit`, `npm audit --json`, `npm audit --omit=dev` e `npm outdated` para levantar o estado real de advisories.
- Avaliar, advisory a advisory, se existe bump seguro (mesma major, sem quebrar a suíte) disponível.
- Aplicar qualquer bump seguro encontrado e revalidar lint/typecheck/testes.
- Registrar exceções temporárias, datadas e justificadas para advisories sem correção segura disponível.
- Criar relatório sanitizado com o resultado antes/depois.

### Fora do escopo

- Rebaixar `next` ou `@storybook/nextjs` para versões antigas via `npm audit fix --force`.
- Saltar `next`/React para uma major futura só para tentar mitigar uma vulnerabilidade moderada em uma dependência interna do próprio Next.js.
- Alterar `vitest.config.ts` ou configuração de cobertura (escopo de REC-404, story paralela).
- Sincronizar OpenAPI (REC-406) ou CSP/cache/logs (REC-408).
- Criar gate QA formal (fica para revisão de `@qa` em iteração futura desta story).

## Acceptance Criteria

1. **Levantamento completo**
   **Given** o estado atual do lockfile,
   **when** `npm audit --json` é executado,
   **then** todos os advisories (severidade, pacote, cadeia `via`, range afetado) estão documentados na story e no relatório, sem omissão.

2. **Separação produção vs. desenvolvimento**
   **Given** os 8 advisories do audit completo,
   **when** `npm audit --omit=dev` é executado,
   **then** fica registrado quantos advisories afetam a árvore de produção e quantos são exclusivos de devDependencies.

3. **Correção segura aplicada quando disponível**
   **Given** um advisory com correção compatível (mesma major, sem quebrar build/lint/typecheck/testes),
   **when** o bump é aplicado,
   **then** o pacote é atualizado no `package.json`/lockfile e a suíte completa permanece verde.

4. **Exceção justificada e datada quando não há correção segura**
   **Given** um advisory sem correção não-destrutiva disponível,
   **when** a decisão de aceitar o risco é tomada,
   **then** existe registro com pacote, versão, severidade, motivo da exceção, data (2026-07-16) e prazo de reavaliação sugerido.

5. **Nenhuma regressão**
   **Given** qualquer mudança de dependência aplicada nesta story,
   **when** `npm run lint`, `npm run typecheck` e `npx vitest run` são executados,
   **then** todos passam sem novas falhas.

6. **Rastreabilidade**
   **Given** a story concluída,
   **then** `docs/history/reports/rec-407-dependencias-vulneraveis-2026-07-16.md` documenta o resultado `npm audit` antes e depois, e a story está com Tasks marcadas, File List e Change Log atualizados.

## Tasks / Subtasks

- [x] **Task 1 — Levantar advisories** (AC: 1, 2)
  - [x] Rodar `npm audit` e `npm audit --json`.
  - [x] Rodar `npm audit --omit=dev` para separar prod/dev.
  - [x] Rodar `npm outdated` para os pacotes envolvidos.

- [x] **Task 2 — Avaliar correção por advisory** (AC: 3, 4)
  - [x] Cadeia `elliptic` (6 low): confirmado `range: *` sem versão corrigida upstream (`elliptic@6.6.1` é a mais recente e ainda está no range vulnerável); cadeia exclusiva de `@storybook/nextjs` (devDependency), ausente em `npm audit --omit=dev`.
  - [x] Cadeia `postcss`/`next` (2 moderate): confirmado que a versão vulnerável é interna ao pacote `next` (`node_modules/next/node_modules/postcss@8.4.31`), fixada como dependência exata pelo próprio `next@16.2.9`/`16.2.10` (latest estável); nenhum bump de topo resolve.
  - [x] Confirmado que `npm audit fix --force` só oferece downgrades de major que não corrigem `elliptic` e quebrariam a aplicação.

- [x] **Task 3 — Aplicar correções seguras** (AC: 3, 5)
  - [x] Nenhum bump seguro disponível para os 8 advisories nesta análise; nenhuma mudança de dependência foi necessária.
  - [x] Gates constitucionais executados como baseline (lint, typecheck, vitest) — todos verdes sem alteração de dependências.

- [x] **Task 4 — Registrar exceções e relatório** (AC: 4, 6)
  - [x] Documentar as 8 exceções (pacote, severidade, motivo, data, prazo de reavaliação) nesta story e no relatório.
  - [x] Criar `docs/history/reports/rec-407-dependencias-vulneraveis-2026-07-16.md`.
  - [x] Atualizar Tasks, Dev Agent Record, Change Log e Status.

## Dev Notes

### Estado atual verificado (2026-07-16)

```
npm audit
8 vulnerabilities (6 low, 2 moderate)
```

| Pacote | Severidade | Cadeia (`via`) | Escopo | Fix seguro disponível? |
|---|---|---|---|---|
| `elliptic@6.6.1` | low | raiz da cadeia | dev (`@storybook/nextjs`) | Não — `range: *`, sem versão corrigida publicada |
| `create-ecdh@4.0.4` | low | `elliptic` | dev | Não — depende de `elliptic` |
| `browserify-sign@4.2.6` | low | `elliptic` | dev | Não — depende de `elliptic` |
| `crypto-browserify@3.12.1` | low | `browserify-sign`, `create-ecdh` | dev | Não — depende de `elliptic` |
| `node-polyfill-webpack-plugin@2.0.1` | low | `crypto-browserify` | dev | Não — fixado por `@storybook/nextjs` (mesmo na versão mais recente, `10.5.2`) |
| `@storybook/nextjs@10.4.6` | low | `node-polyfill-webpack-plugin` | dev | Não — `10.5.2` (latest) mantém a mesma dependência `node-polyfill-webpack-plugin@^2.0.1` |
| `next@16.2.9` | moderate | `postcss` (interno) | prod | Não — `16.2.10` (latest estável) mantém `postcss@8.4.31` fixo |
| `postcss@8.4.31` (interno ao `next`) | moderate | GHSA-qx2v-qp2m-jg93 | prod | Não — versão fixada pelo `package.json` do `next`, fora do controle deste projeto |

### Exceções temporárias registradas (2026-07-16)

**Exceção 1 — Cadeia `elliptic` (6 advisories low)**
- Pacotes: `elliptic@6.6.1`, `create-ecdh@4.0.4`, `browserify-sign@4.2.6`, `crypto-browserify@3.12.1`, `node-polyfill-webpack-plugin@2.0.1`, `@storybook/nextjs@10.4.6`.
- Severidade: low (6×).
- Advisory: [GHSA-848j-6mx2-7j84](https://github.com/advisories/GHSA-848j-6mx2-7j84) — "Elliptic Uses a Cryptographic Primitive with a Risky Implementation".
- Motivo da exceção: (a) não existe versão de `elliptic` corrigida publicada — o advisory cobre literalmente todas as versões (`range: *`), incluindo a mais recente instalada; (b) a cadeia inteira é uma devDependency transitiva de `@storybook/nextjs`, usada somente para rodar o Storybook em desenvolvimento local — confirmado ausente de `npm audit --omit=dev`, ou seja, não é empacotada no build de produção (`next build`/Cloudflare Worker) nem exposta a tráfego de usuário final.
- Data: 2026-07-16.
- Prazo de reavaliação sugerido: 2026-08-16 (30 dias) ou na próxima vez que `npm audit` for executado em CI, o que ocorrer primeiro — reavaliar se `elliptic` ou `@storybook/nextjs` publicaram correção.

**Exceção 2 — Cadeia `postcss`/`next` (2 advisories moderate)**
- Pacotes: `next@16.2.9` (dependência de topo, `postcss` interno em `node_modules/next/node_modules/postcss@8.4.31`).
- Severidade: moderate (2×).
- Advisory: [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93) — "PostCSS has XSS via Unescaped `</style>` in its CSS Stringify Output".
- Motivo da exceção: o `postcss` de topo do projeto já está em `8.5.15` (>= `8.5.10`, corrigido); a instância vulnerável é interna ao próprio pacote `next`, que fixa `postcss` em `8.4.31` como dependência exata no seu `package.json`. Nenhuma versão estável de `next` disponível hoje (até `16.2.10`, latest) atualiza essa dependência interna; a próxima linha (`16.3.0`) só existe em canary/preview, fora de política de estabilidade de produção. O uso de `postcss` afetado ocorre no pipeline de build (`next build`/dev server), processando CSS do próprio repositório, não input não confiável de requisição HTTP em produção.
- Data: 2026-07-16.
- Prazo de reavaliação sugerido: reavaliar no próximo `npm outdated`/`npm audit` de rotina, ou assim que uma versão estável de `next` >= `16.2.10` for publicada — o que ocorrer primeiro.

### Restrições de implementação

- Não usar `npm audit fix --force` (downgrades de major sem correção real).
- Não saltar major de `next`/React para tentar resolver uma vulnerabilidade moderada em dependência interna do próprio Next.js.
- Não tocar `vitest.config.ts` (escopo de REC-404 em paralelo).
- Não alterar lógica de aplicação.

### Referências

- [Fonte: `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md#onda-5--qualidade-e-sustentabilidade-semana-2`]
- [Fonte: `docs/stories/2026-07-14-rec-401-encadear-ci-deploy.md`]
- [GHSA-848j-6mx2-7j84](https://github.com/advisories/GHSA-848j-6mx2-7j84)
- [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93)

## Testing

### Gates executados

- `npm audit` / `npm audit --json` (antes)
- `npm audit --omit=dev`
- `npm outdated`
- `npm run lint`
- `npm run typecheck`
- `npx vitest run` (suíte completa, 56 arquivos / 601 testes)

Nenhuma mudança de dependência foi aplicada (nenhum bump seguro disponível), portanto o resultado `npm audit` "depois" é idêntico ao "antes": 8 vulnerabilidades (6 low, 2 moderate), todas cobertas por exceção documentada.

### Follow-up de remediação — 2026-07-30

- Atualizadas as cadeias de produção para `next@16.2.12` e `@opennextjs/cloudflare@1.20.2`; os overrides de `postcss` e `sharp` removem as cópias vulneráveis internas do Next.js.
- Atualizado o minificador transitivo do OpenNext para a linha corrigida; o patch versionado em `patches/@opennextjs+aws+4.1.0.patch` adapta os dois imports nomeados exigidos pela nova API e é reaplicado por `patch-package` a cada instalação.
- Migrado o Storybook do builder Webpack para `@storybook/nextjs-vite` via automigração oficial, com Vite 8 e imports de tipos atualizados.
- Atualizados `chrome-launcher` e `minimatch` por overrides compatíveis. O resultado final de `npm audit` e `npm audit --omit=dev` é zero vulnerabilidades em todas as severidades.
- Revalidados com sucesso: lint, typecheck, suíte `npm test`, build Cloudflare, build do Storybook e Lighthouse CI para `/`, `/cursos` e `/login`.

## Dependências

- **Entrada:** REC-401 (Done) — pipeline CI/CD encadeado, pré-requisito organizacional da Onda 5.
- **Não bloqueia:** REC-404, REC-405, REC-406, REC-408 (stories paralelas da mesma Onda).

## Roll-forward / Rollback

- **Roll-forward:** nenhuma mudança de dependência foi necessária; reavaliar nos prazos de reavaliação indicados nas exceções.
- **Rollback:** não aplicável — nenhum bump foi aplicado nesta iteração.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-16 | 0.1 | Draft criado a partir de FND-16/NFR-06, Onda 5, com levantamento completo de `npm audit` e avaliação de cada advisory. | @dev |
| 2026-07-16 | 1.0 | **Ready → InProgress → InReview.** Levantamento concluído: 8 advisories (6 low, 2 moderate), nenhum com correção segura disponível hoje. Ambas as cadeias documentadas como exceção temporária datada e justificada (elliptic sem versão corrigida upstream, dev-only; postcss interno fixado pelo próprio `next`, sem release estável disponível). Gates locais (lint, typecheck, vitest 601/601) executados como baseline sem alteração de dependências. Relatório sanitizado criado. | @dev |
| 2026-07-16 | 1.1 | **InReview → Done.** Gate PASS (90/100) com waiver formal até 2026-08-16 emitido por `@qa` após reexecução independente de `npm audit` (idêntico) e revisão da decisão de rejeitar `npm audit fix --force`. | @qa (Quinn) |
| 2026-07-30 | 1.2 | Follow-up concluído: atualização de dependências, migração oficial do Storybook para Vite e patch versionado do OpenNext eliminaram todos os advisories; `npm audit` e `npm audit --omit=dev` retornam zero vulnerabilidades. | @devops (Gage) |

## File List

### Criado

- `docs/stories/2026-07-16-rec-407-remediar-dependencias-vulneraveis.md`
- `docs/history/reports/rec-407-dependencias-vulneraveis-2026-07-16.md`

### Modificado

- `package.json` e `package-lock.json`
- `.storybook/main.ts` e `.storybook/preview.tsx`
- `src/**/*.stories.tsx` e `src/components/storybook/decorators.tsx`
- `docs/stories/2026-07-16-rec-407-remediar-dependencias-vulneraveis.md`

### Adicionado

- `patches/@opennextjs+aws+4.1.0.patch`

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 — persona `@dev`.

### Debug Log References

- `npm audit --json`: 8 vulnerabilidades (6 low, 2 moderate, 0 high, 0 critical).
- `npm audit --omit=dev`: 2 vulnerabilidades moderate (apenas `next`/`postcss`) — confirma que as 6 vulnerabilidades low da cadeia `elliptic` são exclusivas de devDependencies (`@storybook/nextjs`).
- `npm outdated`: confirmado que `next@16.2.10` (latest estável) e `@storybook/nextjs@10.5.2` (latest) não removem nenhum dos 8 advisories — ambos mantêm as mesmas dependências internas fixas/transitivas vulneráveis.
- `npm view elliptic versions`: `6.6.1` é a versão mais recente publicada e ainda está dentro do `range: *` do advisory GHSA-848j-6mx2-7j84 — não existe correção upstream disponível.
- `npm view next@16.2.10 dependencies.postcss` → `8.4.31`, confirmando que o Next.js fixa essa versão interna independentemente da versão de `next` instalada dentro da linha 16.x estável.
- `npm audit fix --force` avaliado e descartado: propunha rebaixar `@storybook/nextjs` para `7.0.14` e `next` para `9.3.3`, downgrades de major que quebrariam a aplicação sem eliminar `elliptic` (ainda sem correção) nem trazer garantia adicional sobre `postcss`.
- Gates baseline (sem alteração de dependências): `npm run lint` limpo, `npm run typecheck` limpo, `npx vitest run` → 56 arquivos / 601 testes verdes.

### Completion Notes

- Todos os 8 advisories foram investigados individualmente; nenhum possui bump seguro (mesma major, sem quebrar build) disponível no momento desta análise.
- As 6 vulnerabilidades low (cadeia `elliptic`) são de devDependency (`@storybook/nextjs`), confirmadas ausentes da árvore de produção via `npm audit --omit=dev`, e o pacote raiz (`elliptic`) não tem correção upstream publicada.
- As 2 vulnerabilidades moderate (`next`/`postcss`) afetam uma cópia interna de `postcss` fixada pelo próprio pacote `next` em todas as versões estáveis disponíveis (até `16.2.10`); o `postcss` de topo do projeto já está corrigido.
- Nenhuma alteração de `package.json`/lockfile foi necessária; nenhuma regressão foi introduzida porque nenhuma dependência mudou. Gates executados como baseline de confirmação.
- `npm test:db` (Docker) não foi executado — nenhuma dependência relacionada a banco/Supabase foi alterada.
- Não foi criado gate QA formal, conforme escopo desta execução; a story é entregue em `InReview` para veredito de `@qa`.

## QA Results

### Gate: PASS ✅ — @qa (Quinn), 2026-07-16

**Gate file:** [`docs/qa/gates/rec-407-remediar-dependencias-vulneraveis.yml`](../qa/gates/rec-407-remediar-dependencias-vulneraveis.yml) · **Quality score:** 90/100 · **Waiver ativo até 2026-08-16**

`npm audit` reexecutado de forma independente: `8 vulnerabilities (6 low, 2 moderate, 0 high, 0 critical)`, idêntico ao relatório. Decisão de rejeitar `npm audit fix --force` revisada e confirmada correta (downgrades destrutivos que não resolveriam o problema real). As 8 exceções ficam sob waiver formal com prazo de reavaliação em 2026-08-16 (cadeia `elliptic`) e monitoramento de releases estáveis do Next.js (cadeia `postcss`).

**Veredito:** PASS com waiver. Nenhuma ação bloqueante imediata; reavaliação agendada.

— Quinn, guardião da qualidade 🛡️
