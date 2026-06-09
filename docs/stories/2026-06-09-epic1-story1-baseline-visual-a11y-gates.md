# Story 1.1: Baseline Visual & Gates de Acessibilidade

## Status
Ready for Review

## Épica
Épica 1 — Fundação Visual & Baseline A11y (`docs/epics/epic-1-fundacao-visual-baseline-a11y.md`)
PRD: `docs/prd/modernizacao-ui-2026.md`

## Contexto

A Épica 1 vai alterar tokens, tipografia e superfícies. Antes de tocar no visual, é preciso capturar um **baseline** (visual + acessibilidade) para que qualquer mudança seja comprovadamente uma melhoria, não uma regressão. Esta é a primeira story da modernização e a base de medição para todas as seguintes.

Hoje o projeto tem Playwright configurado (`baseURL: 127.0.0.1:3100`, build de produção via `next start`) com 2 specs (`login-errors.spec.ts`, `route-auth.spec.ts`), mas **não há verificação automatizada de acessibilidade** nem matriz de contraste. O `apple-hig-application-plan-2026-05-26.md` (Fase 0) exige esse baseline como pré-condição.

## Business Value

Sem baseline, não há prova de que a modernização melhora a11y/legibilidade — risco mapeado no PRD (§7) e no Apple plan (P0: "mudança visual sem prova de melhoria"). Esta story instrumenta a medição que protege todas as épicas seguintes contra regressão.

## Acceptance Criteria

- [x] AC1 — Adicionar `@axe-core/playwright` como devDependency e integrá-lo ao Playwright existente, sem quebrar os specs atuais.
- [x] AC2 — Criar spec de acessibilidade cobrindo as rotas críticas públicas (`/`, `/cursos`, `/agenda`, `/blog`, `/in-company`, `/contato`, `/login`) + estado de redirect do `/admin`. **`/admin` autenticado movido para story 1.1b (ver Completion Notes).**
- [x] AC3 — Registrar relatório de contraste WCAG AA → `docs/diagnosis/contrast-baseline-2026-06-09.md` (70 violações reais capturadas com cores/razões exatas).
- [x] AC4 — Adicionar cenários Playwright de navegação por teclado: skip link, navegação tabável, busca do catálogo.
- [x] AC5 — Capturar screenshots de referência (baseline visual) de cada rota pública em mobile + desktop → `tests/baseline/` (14 screenshots). **D6: apenas captura, sem assertir diff.**
- [x] AC6 — Os specs novos rodam dentro do gate `npm test` (63/63 passando, sem flaky).
- [x] AC7 — Validar com `npm run lint` (limpo).
- [x] AC8 — Validar com `npm run typecheck` (limpo).
- [x] AC9 — Validar com `npm test` (63/63 verde).
- [x] AC10 — Atualizar File List e Change Log ao concluir.

## Scope

### In Scope

- Adição da dependência `@axe-core/playwright` (dev).
- Novo(s) spec(s) de acessibilidade e de teclado em `tests/`.
- Relatório de contraste WCAG AA das combinações atuais (apenas **medição**, sem alterar tokens).
- Captura de baseline visual (screenshots) das rotas críticas.
- Ajuste mínimo no `playwright.config.ts` se necessário para suportar screenshots/axe (ex.: projeto mobile + desktop).

### Out of Scope

- **Qualquer alteração de tokens, tipografia, cor ou superfície** — isso é Story 1.2/1.3/1.4. Esta story só **mede**.
- Correção dos problemas de a11y encontrados (vira backlog/stories seguintes).
- Dark mode / alto contraste (decisão D4: fora do ciclo).
- Mudança em qualquer componente de UI ou view.

## Tarefas / Subtarefas

- [ ] Adicionar `@axe-core/playwright` ao `package.json` (devDependencies).
- [ ] Configurar projetos mobile + desktop no `playwright.config.ts` (se necessário para screenshots responsivos).
- [ ] Criar helper de login de teste (autenticação programática via `POST /api/auth/session`) para acessar `/admin` autenticado nos specs de baseline.
- [ ] Criar `tests/a11y-baseline.spec.ts` rodando axe nas rotas críticas (nome acessível, landmarks, diálogos, campos).
- [ ] Criar `tests/keyboard-nav.spec.ts` cobrindo skip link, menu mobile, busca, checkout, CRUD admin.
- [ ] Criar `tests/visual-baseline.spec.ts` (ou usar screenshots) capturando referência mobile + desktop das rotas críticas.
- [ ] Gerar relatório de contraste WCAG AA das combinações de tokens atuais → `docs/diagnosis/contrast-baseline-2026-06-09.md`.
- [ ] Garantir que `npm test` roda tudo sem flaky.
- [ ] Rodar quality gates (lint, typecheck, test).
- [ ] Atualizar File List e Change Log.

## Dependencies

- **Pré-requisito:** nenhum (primeira story da modernização — por isso vem antes de qualquer mudança visual).
- **Bloqueia:** Stories 1.2, 1.3, 1.4 (tokens/tipografia/material), que precisam do baseline para comparação.

## Complexity Estimate

**M (Médio)** — A infra Playwright já existe; o esforço é integrar axe, escrever specs de a11y/teclado/visual e produzir a matriz de contraste. Risco baixo de regressão porque a story não toca em código de produção (só testes + relatório).

## Risks

| Risco | Mitigação |
|-------|-----------|
| Specs a11y flaky em rotas com dados dinâmicos | Usar seletores estáveis; aguardar estados de carregamento; rodar contra build de produção (já é o padrão do config). |
| `/admin` exige sessão autenticada para o baseline | **Atenção:** os specs atuais (`route-auth.spec.ts`) só testam o redirect de usuário NÃO autenticado — não há helper de login de teste. O @dev precisará criar autenticação programática de teste (login via `POST /api/auth/session`) para capturar o baseline a11y/visual DENTRO de `/admin`. Não assumir setup pronto. |
| Screenshots de baseline gerando diffs por fontes/ambiente | Fixar viewport e, se necessário, mascarar regiões voláteis; documentar ambiente de captura. |
| `@axe-core/playwright` adicionar peso ao gate | É devDependency, roda só em teste; aceitável. |

## Definition of Done

- Todos os AC marcados.
- `npm run lint`, `npm run typecheck`, `npm test` verdes.
- Baseline visual + relatório de contraste versionados.
- Specs a11y e de teclado rodando no gate sem flaky.
- File List e Change Log atualizados.

## File List

### Criados
- `tests/a11y.baseline.spec.ts` — baseline axe (WCAG 2.1 A/AA) nas 7 rotas públicas + redirect do /admin
- `tests/keyboard.baseline.spec.ts` — baseline de navegação por teclado (skip link, tab, busca)
- `tests/visual.baseline.spec.ts` — captura de baseline visual (D6: só captura, não compara)
- `tests/contrast-report.baseline.spec.ts` — gerador do relatório de contraste WCAG AA
- `docs/diagnosis/contrast-baseline-2026-06-09.md` — relatório com 70 violações reais (gerado)
- `tests/baseline/*.png` — 14 screenshots de referência (7 rotas × desktop/mobile)

### Modificados
- `playwright.config.ts` — projetos `functional`, `baseline-desktop`, `baseline-mobile`
- `package.json` / `package-lock.json` — devDependency `@axe-core/playwright@^4.11.3`

## Dev Agent Record

### Agent Model Used
Claude (dev/Dex) — modo Pre-Flight

### Completion Notes
- **Desvio de escopo (decisão do solicitante via @po):** baseline do `/admin` **autenticado** foi removido desta story por depender de Supabase real no ambiente de teste (fragilidade). Capturado apenas o estado de redirect (guard server-side). **Ação requerida:** @po deve criar a story **1.1b** para o baseline autenticado do `/admin` com helper de login dedicado.
- **D6 aplicada:** o baseline visual apenas CAPTURA screenshots (salvos em `tests/baseline/`), sem assertir diff — páginas dinâmicas como `/agenda` têm altura variável (8107px → 35417px entre renders) e quebrariam um diff estrito. Comparação estrita fica para a Épica 6.
- **Achado de baseline relevante:** 70 violações de contraste WCAG AA capturadas com cores/razões exatas (ex.: `#a7a7ab` sobre `#f8f8fb` = 2.26, exigido 4.5:1). Isso dá alvos concretos às Stories 1.2-1.4.
- **Achado técnico:** `networkidle` nunca resolve em `/blog` e `/agenda` (imagens remotas/conteúdo dinâmico) — confirma a lacuna de `<img>` apontada no Apple HIG plan. Specs ajustados para `domcontentloaded` + espera de body.
- Gate completo `npm test`: **63/63 passando**, sem flaky. Lint e typecheck limpos.

## Change Log

- 2026-06-09 — @sm (River) — Story criada em Draft a partir da Épica 1.
- 2026-06-09 — @po (Pax) — Validação 10-pontos: GO (9.5/10). Rotas críticas confirmadas em `app/`. Corrigida mitigação de risco do `/admin` (specs atuais não autenticam) + adicionada subtarefa de helper de login de teste. Status Draft → Ready.
- 2026-06-09 — @po (Pax) — Decisão D6 (solicitante): baseline visual apenas captura+commit nesta story, sem falhar gate por diff. Comparação estrita movida para Épica 6. AC5 atualizado.
- 2026-06-09 — @dev (Dex) — Implementação completa. Adicionado `@axe-core/playwright`; criados 4 specs de baseline (a11y, teclado, visual, contraste); config Playwright com projetos desktop/mobile; 14 screenshots + relatório de contraste (70 violações reais). Gate `npm test` 63/63 verde, lint+typecheck limpos. Desvio: baseline `/admin` autenticado → story 1.1b. Status Ready → Ready for Review.

## Dev Notes

- Playwright config atual: `baseURL: http://127.0.0.1:3100`, `webServer` usa `npx next start -p 3100` sobre o build de produção. Manter esse padrão.
- Specs existentes para referência de estilo e auth: `tests/login-errors.spec.ts`, `tests/route-auth.spec.ts`.
- `npm test` encadeia `typecheck && build && playwright test` — qualquer spec novo entra automaticamente no gate.
- Rotas críticas confirmadas a partir do Apple HIG plan (linha 104-106) e do escopo de publicação (público + admin; portal aluno/instrutor fora).

## QA Results

_(a preencher pelo @qa)_
