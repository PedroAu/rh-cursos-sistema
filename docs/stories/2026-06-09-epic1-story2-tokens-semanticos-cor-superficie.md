# Story 1.2: Tokens Semânticos de Cor e Superfície

## Status
Ready for Review

## Épica
Épica 1 — Fundação Visual & Baseline A11y (`docs/epics/epic-1-fundacao-visual-baseline-a11y.md`)
PRD: `docs/prd/modernizacao-ui-2026.md`

## Contexto

A Story 1.1 capturou o baseline. O relatório de contraste registrou 70 violações — porém a investigação pré-draft provou que **as 70 são artefato de medição**: todas estão em `/cursos`, e as cores reprovadas (`#c2b085`, `#8397af`, `#a8a8ac`) **não existem no código** — são os tokens reais (`#8a6200`, `#002b5b`, `#1d1d1f`) capturados no meio da animação de entrada dos cards (`framer-motion` com `initial={{ opacity: 0 }}` em `src/components/courses/course-card.tsx:20`), que o axe mescla com o fundo. O spec `tests/contrast-report.baseline.spec.ts` espera apenas 500ms antes de analisar, e o framer-motion **não** respeita o bloco CSS `prefers-reduced-motion` do `globals.css` (anima `opacity` via inline style/JS).

As demais 6 rotas públicas tiveram **zero** violações. Ou seja: o estado real de contraste é melhor do que o relatório sugere, mas a medição é não-confiável e a paleta de tokens nunca foi auditada diretamente (o próprio relatório anota essa lacuna).

O sistema atual de tokens (`src/styles/globals.css` + `tailwind.config.ts`) usa nomes Material-like (`--ea-color-surface-container-low`, `text-muted`) misturados com nomes de marca (`prestige-gold`, `deep-navy`). A Épica 1 exige a camada semântica HIG-like (`label`, `secondary-label`, `separator`, `surface`, `surface-raised`, `control`, `accent`, `success`, `warning`, `danger`) estruturada para dark mode futuro (D4: só modo claro agora).

## Business Value

Tokens semânticos são a dependência raiz das Stories 1.3/1.4 e das Épicas 2-4: sem eles, FormField, admin polish e jornadas públicas continuam resolvendo cor página a página. A correção da medição devolve confiabilidade ao gate de contraste que protege todas as épicas seguintes (S5 do PRD).

## Acceptance Criteria

- [x] AC1 — Definir em `src/styles/globals.css` a camada de tokens semânticos exigida pela épica: `label`, `secondary-label`, `separator`, `surface`, `surface-raised`, `control`, `accent`, `success`, `warning`, `danger` — como variáveis CSS em `:root`, mapeadas sobre a paleta existente (sem inventar cores novas, exceto onde a auditoria de AA exigir ajuste de valor).
- [x] AC2 — Expor os tokens semânticos no `tailwind.config.ts` (ex.: `text-label`→cor, `bg-surface-raised`), mantendo os aliases atuais funcionando (mudança aditiva — nenhuma página quebra).
- [x] AC3 — Estruturar as variáveis para dark futuro: tokens semânticos referenciam a paleta por indireção (camada paleta → camada semântica), sem implementar dark agora (D4).
- [x] AC4 — Auditar a paleta diretamente: calcular a razão de contraste WCAG das combinações texto/fundo principais (label, secondary-label, accent, success, warning, danger sobre surface, surface-raised, control e primary) e documentar a matriz em `docs/design/tokens-cor-superficie.md`. Combinações de texto normal devem passar 4.5:1; texto grande 3:1. Valores que reprovarem são ajustados nesta story.
- [x] AC5 — Tornar a medição de contraste confiável: framer-motion deve respeitar reduced motion (`MotionConfig reducedMotion="user"` no provider raiz) e o spec `tests/contrast-report.baseline.spec.ts` deve emular `reducedMotion: "reduce"` e aguardar estabilização antes do axe. Regerar `docs/diagnosis/contrast-baseline-2026-06-09.md` — esperado: violações reais (não artefatos) = 0 ou corrigidas nesta story.
- [x] AC6 — Nenhuma regressão visual intencional: tokens semânticos mapeiam os valores atuais (exceto correções de AA documentadas na matriz).
- [x] AC7 — Validar com `npm run lint` (limpo).
- [x] AC8 — Validar com `npm run typecheck` (limpo).
- [x] AC9 — Validar com `npm test` (suite completa verde, sem flaky).
- [x] AC10 — Atualizar File List e Change Log ao concluir.

## Scope

### In Scope

- Camada semântica de tokens em `globals.css` + exposição no `tailwind.config.ts` (aditiva).
- Auditoria direta de contraste da paleta + matriz documentada.
- Ajuste de **valores** de tokens que reprovarem AA (com antes/depois documentado).
- `MotionConfig reducedMotion="user"` no provider raiz (pré-requisito da medição confiável; também é correção real de a11y).
- Hardening do spec de contraste (reduced motion + espera de estabilização) e regeração do relatório.

### Out of Scope

- Migrar componentes/páginas para os novos nomes semânticos em massa — Stories 1.3/1.4 e épicas seguintes consomem os tokens gradualmente.
- Tipografia (tamanhos, hierarquia) — Story 1.3.
- Regras de translucidez/material por camada — Story 1.4.
- Dark mode / alto contraste (D4: fora do ciclo; apenas estrutura preparada).
- Refazer screenshots de baseline visual (continuam válidos; mudança é aditiva).

## Tarefas / Subtarefas

- [x] Definir camada semântica em `src/styles/globals.css` (paleta → semântica, comentadas por uso).
- [x] Expor tokens no `tailwind.config.ts` sem remover aliases existentes.
- [x] Adicionar `MotionConfig reducedMotion="user"` no provider raiz da aplicação.
- [x] Endurecer `tests/contrast-report.baseline.spec.ts`: emular `reducedMotion`, aguardar estabilização das animações antes do axe.
- [x] Escrever script/cálculo da matriz de contraste das combinações principais e gerar `docs/design/tokens-cor-superficie.md`.
- [x] Ajustar valores de tokens reprovados na auditoria (se houver) e registrar antes/depois.
- [x] Regerar o relatório de contraste baseline e confirmar eliminação dos artefatos.
- [x] Rodar quality gates (lint, typecheck, test).
- [x] Atualizar File List e Change Log.

## Dependencies

- **Pré-requisito:** Story 1.1 (baseline capturado — Done, mergeada em main via PR #8).
- **Bloqueia:** Stories 1.3 (tipografia consome tokens) e 1.4 (camada material consome `surface`/`surface-raised`); Épica 2 (FormField usa tokens semânticos).

## Complexity Estimate

**M (Médio)** — Trabalho concentrado em 2 arquivos de tokens + 1 provider + 1 spec. O risco não é volume, é semântica: mapear bem paleta→semântica para que 1.3/1.4 não precisem retrabalhar. A auditoria AA é determinística (cálculo de razão).

## Risks

| Risco | Mitigação |
|-------|-----------|
| Remapear aliases existentes mudar o visual sem querer | Mudança **aditiva**: tokens novos apontam para os valores atuais; aliases antigos intactos. Ajustes de valor só onde AA reprovar, documentados. |
| `MotionConfig reducedMotion="user"` alterar comportamento para usuários sem preferência | `"user"` só desativa animações quando o SO pede reduced motion — comportamento padrão inalterado para os demais. |
| Relatório regerado "zerar" e mascarar problemas reais | AC4 audita a paleta **diretamente** (independente do render), cobrindo combinações que o axe não vê em tela. |
| `next start` + Playwright em ambiente local divergir de CI | Mesmo padrão da Story 1.1 (build de produção, porta 3100); specs já estáveis. |

## Definition of Done

- Todos os AC marcados.
- `npm run lint`, `npm run typecheck`, `npm test` verdes.
- Matriz de contraste versionada em `docs/design/tokens-cor-superficie.md`.
- Relatório de contraste regerado sem artefatos de animação.
- File List e Change Log atualizados.

## File List

### Criados
- `src/components/providers/motion-provider.tsx` — `MotionConfig reducedMotion="user"` + `MotionGlobalConfig.skipAnimations` sob prefers-reduced-motion (leitura síncrona via matchMedia)
- `scripts/contrast-matrix.mjs` — gerador da matriz de contraste a partir dos valores reais do CSS
- `docs/design/tokens-cor-superficie.md` — matriz de contraste + documentação da camada semântica (gerado)

### Modificados
- `src/styles/globals.css` — camada semântica de tokens (paleta → semântica via `var()`); ajustes AA: success `#008a3d`→`#007a36`, warning `#d6aa45`→`#7a5600`
- `tailwind.config.ts` — exposição aditiva: `label-primary`, `label-secondary`, `separator`, `surface-raised`, `control`; `accent`/`success`/`warning`/`danger` repontados para tokens semânticos
- `app/layout.tsx` — wrap do `MotionProvider`
- `tests/contrast-report.baseline.spec.ts` — `page.emulateMedia({ reducedMotion: "reduce" })` + espera de `document.fonts.ready` + `waitForMotionSettle` (opacidades inline estabilizadas em 0/1)
- `src/views/public/Courses.tsx` — eyebrows dos botões de trilha: `opacity-70` → cor explícita por estado (`text-white/75` ativo / `text-text-muted` inativo)
- `docs/diagnosis/contrast-baseline-2026-06-09.md` — regenerado com medição confiável: **0 violações**

## Dev Agent Record

### Agent Model Used
Claude (dev/Dex)

### Completion Notes
- **Colisão de nomenclatura:** a cor `label` é exposta como `label-primary`/`label-secondary` no Tailwind porque `text-label` já é utilitário de fontSize — documentado na matriz.
- **Auditoria AA (AC4):** todas as combinações auditadas passam 4.5:1 após dois ajustes de valor: `success` (branco sobre `bg-success` era 4.47:1) e `warning` (branco sobre `hover:bg-warning` dos Buttons era 1.94:1). Antes/depois na matriz.
- `--ea-color-on-primary-container` (#6f8fca) reprovaria sobre `primary` (4.25:1) mas não é usado como texto — documentado como reservado.
- `--ea-color-secondary-fixed-dim` permanece na paleta (decorativo); deixou de ser o valor de `warning`.
- **Saga da medição (3 iterações até confiável):** (1) `test.use({ reducedMotion })` não chegou à página neste setup — trocado por `page.emulateMedia()`; (2) `MotionConfig reducedMotion="user"` preserva fades de opacity por design do framer — resolvido com `MotionGlobalConfig.skipAnimations`; (3) `useReducedMotion()` retorna `null` no 1º render (as animações de mount partiam antes do flag) — resolvido com leitura síncrona de `matchMedia` no corpo do provider.
- **Violação real encontrada e corrigida:** eyebrow `opacity-70` nos botões de trilha de `/cursos` (a opacidade de elemento confundia a detecção de fundo do axe e degradava o contraste de fato); cor explícita por estado resolve ambos.
- Relatório final: **70 (artefato) → 0 violações reais** nas 7 rotas públicas, com medição determinística.

## Change Log

- 2026-06-09 — @sm (River) — Story criada em Draft a partir da Épica 1. Investigação pré-draft (Article IV): as 70 violações do baseline são 100% artefato de animação framer-motion em `/cursos` (cores mescladas inexistentes no código); demais rotas zeradas. Story inclui correção da medição + auditoria direta da paleta.
- 2026-06-09 — @po (Pax) — Validação 10-pontos: **GO (9.5/10)**. Arquivos-alvo confirmados no repo; ACs testáveis e rastreáveis à Épica 1/PRD (S5, S6, D4); achado do artefato de medição verificado com evidência (blends calculados). Ressalva: `MotionConfig` toca provider raiz (fora dos 2 arquivos da épica) — desvio justificado e documentado, aprovado. Status Draft → Ready.
- 2026-06-09 — @dev (Codex) — Story consolidada no estado local retomado: tokens semânticos, provider de motion, matriz de contraste e relatório baseline verificados com `npm run lint`, `npm run typecheck` e `npm test` verdes. Status Ready → Ready for Review.

## Dev Notes

- Paleta atual em `src/styles/globals.css:20-73` (`--ea-color-*`); mapeamento Tailwind em `tailwind.config.ts:19-56`.
- Cores reprovadas no relatório são blends: `#c2b085` = `#8a6200` @ ~49% sobre `#f8f8fb`; `#8397af` = `#002b5b` @ ~47%; `#a8a8ac` = `#1d1d1f` @ ~36% — prova do artefato de opacidade.
- Atenção na auditoria: `--ea-color-on-primary-container: #6f8fca` sobre `--ea-color-primary: #002b5b` ≈ 4.2:1 — reprova para texto normal; verificar se é usado como texto e ajustar/documentar como large-text-only.
- O spec de contraste roda com `waitUntil: "domcontentloaded"` + 500ms (`tests/contrast-report.baseline.spec.ts:29-31`) — insuficiente; usar emulação de reduced motion + espera determinística.
- Playwright: build de produção via `next start -p 3100`; `npm test` = `typecheck && build && playwright test`.

## QA Results

_(a preencher pelo @qa)_
