# Relatório REC-407 — Remediar dependências vulneráveis

**Data:** 2026-07-16
**Executor:** @dev, via aiox-master (Orion)
**Story:** [`docs/stories/2026-07-16-rec-407-remediar-dependencias-vulneraveis.md`](../../stories/2026-07-16-rec-407-remediar-dependencias-vulneraveis.md)

## 1. Objetivo

Levantar todos os advisories conhecidos em dependências npm do projeto, aplicar correção segura onde disponível e registrar exceção temporária justificada e datada onde não houver correção sem breaking change, fechando a lacuna de FND-16/NFR-06 na Onda 5 da Épica 17.

## 2. `npm audit` — antes (2026-07-16)

```
# npm audit report

elliptic  *
Elliptic Uses a Cryptographic Primitive with a Risky Implementation
GHSA-848j-6mx2-7j84
node_modules/elliptic
  browserify-sign >=2.4.0 (depende de elliptic)
    crypto-browserify >=3.4.0 (depende de browserify-sign, create-ecdh)
      node-polyfill-webpack-plugin <=4.0.0 (depende de crypto-browserify)
        @storybook/nextjs <=0.0.0-pr-35482-sha-e0c7884d || >=7.0.15 (depende de node-polyfill-webpack-plugin)
  create-ecdh * (depende de elliptic)

postcss <8.5.10
Severity: moderate
PostCSS has XSS via Unescaped </style> in its CSS Stringify Output
GHSA-qx2v-qp2m-jg93
node_modules/next/node_modules/postcss
  next 9.3.4-canary.0 - 16.3.0-canary.5 (depende de postcss)

8 vulnerabilities (6 low, 2 moderate, 0 high, 0 critical)
```

`npm audit --omit=dev` (apenas árvore de produção):

```
2 vulnerabilities (2 moderate) — next, postcss
```

Confirma que as 6 vulnerabilidades low (cadeia `elliptic`) são exclusivas de devDependencies (`@storybook/nextjs`), ausentes do build de produção.

## 3. Advisories encontrados e classificação

| # | Pacote | Versão instalada | Severidade | Advisory | Escopo | Ação |
|---|---|---|---|---|---|---|
| 1 | `elliptic` | 6.6.1 | low | GHSA-848j-6mx2-7j84 | dev (Storybook) | Exceção |
| 2 | `create-ecdh` | 4.0.4 | low | herda de `elliptic` | dev (Storybook) | Exceção |
| 3 | `browserify-sign` | 4.2.6 | low | herda de `elliptic` | dev (Storybook) | Exceção |
| 4 | `crypto-browserify` | 3.12.1 | low | herda de `browserify-sign`/`create-ecdh` | dev (Storybook) | Exceção |
| 5 | `node-polyfill-webpack-plugin` | 2.0.1 | low | herda de `crypto-browserify` | dev (Storybook) | Exceção |
| 6 | `@storybook/nextjs` | 10.4.6 | low | herda de `node-polyfill-webpack-plugin` | dev (Storybook) | Exceção |
| 7 | `next` | 16.2.9 | moderate | GHSA-qx2v-qp2m-jg93 (via `postcss` interno) | produção | Exceção |
| 8 | `postcss` (interno ao `next`) | 8.4.31 | moderate | GHSA-qx2v-qp2m-jg93 | produção | Exceção |

## 4. Investigação por advisory

### 4.1 Cadeia `elliptic` (advisories 1–6, 6× low)

- `npm view elliptic versions` confirma `6.6.1` como a versão mais recente publicada; o advisory declara `range: *`, ou seja, **toda versão publicada do pacote está no range afetado** — não existe release corrigido no momento desta análise.
- A cadeia inteira é puxada por `node-polyfill-webpack-plugin@^2.0.1`, dependência do webpack-builder de `@storybook/nextjs`. `npm view @storybook/nextjs@latest` (10.5.2) mantém a mesma dependência `node-polyfill-webpack-plugin@^2.0.1` — o bump para a versão mais recente do Storybook não resolve o advisory.
- `npm audit --omit=dev` confirma que nenhuma dessas 6 ocorrências existe na árvore de produção: `@storybook/nextjs` é devDependency, usada apenas para rodar o Storybook localmente (`npm run storybook` ou equivalente), nunca incluída no `next build`/Cloudflare Worker publicado.
- **Decisão: exceção temporária.** Sem correção upstream disponível e sem exposição em runtime de produção.

### 4.2 Cadeia `postcss`/`next` (advisores 7–8, 2× moderate)

- O `postcss` de topo do projeto (`node_modules/postcss`) já está em `8.5.15` — acima do limiar `8.5.10` do advisory, portanto **não é a instância vulnerável**.
- A instância vulnerável é `node_modules/next/node_modules/postcss@8.4.31`, uma dependência interna do próprio pacote `next`, declarada como versão exata (`"postcss": "8.4.31"`) no `package.json` de `next`, fora do controle do lockfile deste projeto.
- `npm view next@16.2.10 dependencies.postcss` → `8.4.31`. `16.2.10` é a versão latest estável disponível (`npm view next dist-tags` → `"latest": "16.2.10"`); a próxima linha (`16.3.0`) só existe em `canary`/`preview`, fora de política de estabilidade para produção.
- **Decisão: exceção temporária.** Não há release estável de `next` disponível que atualize essa dependência interna sem depender de uma pré-release; saltar de major não é aplicável aqui pois `next` já está na major mais recente (16.x) e o pin problemático é interno ao próprio pacote, não sujeito a bump do consumidor.

### 4.3 `npm audit fix --force` (avaliado e descartado)

`npm audit fix --force` propôs rebaixar `@storybook/nextjs` para `7.0.14` (major inferior) e `next` para `9.3.3` (rebaixamento de 16.x para 9.x). Nenhuma das duas ações resolve de fato o problema: `elliptic` continuaria sem correção mesmo nesses grafos antigos (o advisory cobre toda a linha do pacote), e rebaixar `next` de 16.x para 9.x quebraria a aplicação inteira (App Router, Server Components, todas as features atuais) por uma vulnerabilidade moderada em uma dependência interna de build. Ação rejeitada.

## 5. Correções aplicadas

Nenhuma. Todos os 8 advisories foram avaliados individualmente e nenhum possui bump seguro (mesma major, sem quebrar build) disponível no momento desta análise. Nenhum arquivo `package.json`/`package-lock.json` foi alterado.

## 6. Exceções temporárias registradas

| Exceção | Pacotes | Severidade | Motivo | Data | Reavaliar até |
|---|---|---|---|---|---|
| 1 | `elliptic`, `create-ecdh`, `browserify-sign`, `crypto-browserify`, `node-polyfill-webpack-plugin`, `@storybook/nextjs` | low (6×) | Sem versão corrigida upstream publicada (`range: *`); cadeia exclusiva de devDependency, ausente do build de produção | 2026-07-16 | 2026-08-16 ou próxima execução de `npm audit` em CI |
| 2 | `next` (postcss interno) | moderate (2×) | `postcss@8.4.31` fixado internamente pelo `package.json` do próprio `next`; nenhuma versão estável de `next` (até `16.2.10`, latest) atualiza essa dependência interna | 2026-07-16 | Próxima release estável de `next` >= `16.2.10` ou próxima rotina de `npm audit`/`npm outdated` |

## 7. `npm audit` — depois (2026-07-16)

Idêntico ao "antes", pois nenhuma dependência foi alterada:

```
8 vulnerabilities (6 low, 2 moderate, 0 high, 0 critical)
```

## 8. Verificação de regressão

Nenhuma dependência foi alterada, portanto os gates abaixo foram executados como confirmação de baseline (não houve mudança a validar):

| Gate | Resultado |
|---|---|
| `npm run lint` | Limpo, sem findings |
| `npm run typecheck` | Limpo, `next typegen` + `tsc --noEmit` sem erros |
| `npx vitest run` | 56 arquivos / 601 testes, todos verdes |

`npm run test:db` (Docker/Supabase local) **não foi executado** — nenhuma dependência relacionada a banco/Supabase foi alterada nesta story, não havia necessidade.

## 9. Escopo não coberto por esta story

- Reavaliação futura das duas exceções nos prazos indicados (item 6), condicionada a novas versões upstream de `elliptic`/`next`.
- Gate QA formal (`docs/qa/gates/rec-407-*.yml`) — não criado nesta execução; a story segue em `InReview` para veredito de `@qa`.
- Push/commit — não executado, conforme escopo desta execução.

## 10. Conclusão

AC1–AC6 da story atendidos com evidência direta: levantamento completo (AC1), separação produção/dev (AC2), nenhuma correção segura disponível portanto nenhum bump aplicado (AC3 não aplicável neste ciclo), duas exceções justificadas e datadas cobrindo os 8 advisories (AC4), zero regressão pois zero dependência mudou (AC5), e rastreabilidade completa nesta story e neste relatório (AC6).
