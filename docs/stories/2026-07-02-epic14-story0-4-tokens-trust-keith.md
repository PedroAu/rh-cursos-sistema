# Story 14.0.4: Migração de Tokens — Trust Keith RH

## Status
Done

## Executor Assignment

executor: "Codex" (@dev delegado — prompt autossuficiente abaixo)
quality_gate: "@qa" (story 14.0.6)

## Epic
EPIC 14 — Source: `docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md`
ADR: `docs/architecture/adr-014-redesign-trust-keith.md` (D5, D7)

## Story

**As a** implementador das páginas do redesign,
**I want** os tokens Trust Keith RH como fonte única de estilo (CSS vars + Tailwind + fontes via next/font),
**so that** componentes e páginas das stories seguintes usem exatamente os valores dos canvases.

## Complexity Estimate
M — 5 pontos (reescrita de tokens + compat com 3 camadas legadas + fontes).

---

## 🤖 PROMPT CODEX (autossuficiente)

### Contexto

Projeto Next.js 16 (App Router em `app/`, código em `src/`) em `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos`. Estamos migrando o design para o sistema "Trust Keith" adaptado à marca RH Cursos.

**Fontes de verdade (ler antes de começar):**
1. `docs/design-system/trust-keith/INVENTORY.md` — seções 1 e 2 têm TODOS os tokens com valores finais RH (tabelas completas: cores, tipografia, espaçamento, raios, sombras, foco, motion, gradientes, containers).
2. `docs/design-system/trust-keith/ds-package/tokens/*.css` — CSS original do DS (conferência).
3. `docs/architecture/adr-014-redesign-trust-keith.md` — decisões D5 (tokens) e D7 (fontes).

**REGRA CRÍTICA:** os valores finais RH já incorporam o remap de marca: `--tk-brand`/`--tk-cta` = `#0c6a83` (NUNCA `#235875`), `--tk-brand-hover`/`--tk-cta-hover` = `#084f63`, `--tk-accent` = `#1791a9`, `--tk-accent-strong` = `#0c6a83`, `--tk-accent-soft` = `#e0f2f6`. Não criar classe `.rh2` — valores finais direto no `:root`.

### Estado atual (3 camadas de tokens legadas)

- `src/design-tokens/tokens.css` — paleta ANTIGA (azul `#0066CC`, dourado `#d4af37`, navy `#001736`) com nomes `--color-*`. Importada por `src/styles/globals.css` (linha 2).
- `src/design-tokens/mantine-tokens.css` — vars `--mantine-color-*`. NÃO remover nesta story (morre na 14.1.x), mas nenhum token novo pode depender dela.
- `src/styles/globals.css` — contém bloco de tokens `--ea-*` (Executive Precision, Epic 7) promovidos a `:root`.
- `tailwind.config.ts` — importa `src/design-tokens/tokens.tailwind.js`; mapeia `primary`/`secondary` para `var(--color-primary)` + escalas `--mantine-*` + `--ea-*`.

### Tarefas

1. **Reescrever `src/design-tokens/tokens.css`:**
   - Bloco 1 `:root`: todos os tokens `--tk-*` (INVENTORY seção 2, valores finais RH) + variáveis `--rh-*` (INVENTORY seção 1: `--rh-teal-deep`, `--rh-teal`, `--rh-teal-lt`, `--rh-gray`, `--rh-paper-a`, `--rh-paper-b`, `--rh-paper-line`, e `--rh-hero-bg: #F3F0E8`).
   - Bloco 2 "compat legado" (comentado como temporário, remoção na 14.3.3): re-apontar os aliases existentes para os novos valores — `--color-primary: var(--tk-brand)`, `--color-primary-hover: var(--tk-brand-hover)`, `--color-accent: var(--tk-accent)`, `--color-focus-ring: var(--tk-focus)`, `--color-foreground: var(--tk-ink)`, `--color-background: var(--tk-surface)`, `--color-border: var(--tk-line)` e demais `--color-*` hoje definidos, mapeando para o token tk semanticamente equivalente. NENHUM hex antigo (`#0066CC`, `#0052A3`, `#003d99`, `#d4af37`, `#001736`) pode sobrar.
   - Manter os tokens de spacing/radius `--spacing-*`/`--radius-*` existentes APENAS como aliases dos `--tk-space-*`/`--tk-radius-*` equivalentes.
2. **`src/styles/globals.css`:** no bloco `--ea-*`, re-apontar as cores de marca (`--ea-*` que hoje valem azul/dourado/navy) para os tokens `--tk-*`/`--rh-*` equivalentes. Não alterar a estrutura do restante.
3. **`src/design-tokens/tokens.tailwind.js`:** adicionar namespace novo mapeando CSS vars (sem hex duplicado): cores `tk-brand`, `tk-brand-hover`, `tk-cta`, `tk-accent`, `tk-accent-strong`, `tk-accent-soft`, `tk-ink`, `tk-ink-muted`, `tk-surface`, `tk-surface-2`, `tk-line`, `tk-cream`, `tk-cream-dark`, `tk-success`, `tk-error`, `tk-focus`, `rh-teal-deep`, `rh-teal`, `rh-teal-lt`, `rh-gray`, `rh-paper-a`, `rh-paper-b`, `rh-paper-line`, `rh-hero-bg`; borderRadius `tk-input/tk-button/tk-md/tk-glass/tk-card/tk-pill`; boxShadow `tk-hairline/tk-glass/tk-card/tk-pop`; fontFamily `tk-display/tk-serif/tk-body/tk-hand` (referenciando as vars de fonte); maxWidth `tk-container: 1200px` / `tk-container-wide: 1400px`. Atualizar valor existente `trust-keith-teal` de `#235875` para `var(--tk-brand)`.
4. **Fontes (ADR D7):** em `app/layout.tsx` (ou onde o root layout carrega fontes hoje — verificar), configurar via `next/font/google`: Inter (400/500/600/700), Helvetica Neue (300/400 + itálicos). Expor como CSS vars e apontar `--tk-font-body`/`--tk-font-serif` para elas. `--tk-font-display` usa a stack de fallback `"Iowan Old Style", "Palatino Linotype", Georgia, serif` (Fraunces pendente de licença — NÃO tentar carregar Fraunces). Caveat NÃO carregar agora (uso raro, entra na página que precisar).
5. **Storybook:** atualizar `src/stories/design-tokens.stories.tsx` para exibir a nova paleta/escala (swatches de cores tk/rh, raios, sombras, tipografia).

### Proibições

- NÃO remover `mantine-tokens.css` nem tocar em arquivos com import `@mantine` (fase 14.1.x).
- NÃO alterar componentes/páginas além do necessário para o layout de fontes.
- NÃO adicionar dependências.
- NÃO tocar em `.aiox-core/`, `public/`, `supabase/`.
- NÃO fazer `git push` (commit local ok).

### Acceptance Criteria (verificáveis por comando)

1. `grep -rn "#0066CC\|#0052A3\|#003d99\|#d4af37\|#001736" src/design-tokens/ src/styles/` → vazio (case-insensitive).
2. `grep -c "tk-" src/design-tokens/tokens.css` → ≥ 80 (tokens completos).
3. `grep -n "0c6a83" src/design-tokens/tokens.css` → presente; `grep -rn "235875" src/design-tokens/ src/styles/ tailwind.config.ts` → vazio.
4. `grep -rn "next/font" app/layout.tsx` → presente (Inter + Helvetica Neue).
5. `npm run lint && npm run typecheck` → verdes.
6. `npm run build` → sucesso.
7. `npm run test:unit` → verde (ajustar snapshots/asserts de cor se existirem).
8. Homepage em dev mostra CTAs teal `#0c6a83` (conferência visual).

### Ao concluir

Atualizar esta story: checkboxes, File List (arquivos tocados), status → InReview, Change Log.

---

## Tasks / Subtasks

- [x] tokens.css reescrito (tk/rh + compat) (AC: 1-3)
- [x] globals.css re-apontado (AC: 1)
- [x] tokens.tailwind.js com namespace tk/rh (AC: 3)
- [x] next/font Inter + Helvetica Neue no root layout (AC: 4)
- [x] Storybook design-tokens atualizado (AC: 5-7)
- [x] Verificação completa (AC: 1-8)

## File List
- `docs/stories/2026-07-02-epic14-story0-4-tokens-trust-keith.md`
- `app/layout.tsx`
- `src/design-tokens/tokens.css`
- `src/design-tokens/tokens.tailwind.js`
- `src/design-tokens/tokens.json`
- `src/design-tokens/tokens.dtcg.json`
- `src/design-tokens/tokens.yaml`
- `src/design-tokens/mantine-tokens.css`
- `src/styles/globals.css`
- `src/stories/design-tokens.stories.tsx`
- `tailwind.config.ts`

## Dev Agent Record

### Agent Model Used

Codex GPT-5 (@dev/Dex), 2026-07-02.

### Debug Log References

- `grep -rn "#0066CC\|#0052A3\|#003d99\|#d4af37\|#001736" src/design-tokens/ src/styles/` → PASS (vazio).
- `grep -c "tk-" src/design-tokens/tokens.css` → PASS (`182`).
- `grep -n "0c6a83" src/design-tokens/tokens.css` → PASS (presente em `--rh-teal-deep`, `--tk-brand`, `--tk-accent-strong`).
- `grep -rn "235875" src/design-tokens/ src/styles/ tailwind.config.ts` → PASS (vazio).
- `grep -rn "next/font" app/layout.tsx` → PASS.
- `npm run typecheck` → PASS.
- `npm run build` → PASS.
- `npm run test:unit` → PASS (27 arquivos, 392 testes).
- Render check via Chrome headless em `http://localhost:3001` → PASS: 12 elementos CTA/link com `rgb(12, 106, 131)`, incluindo "Fale com um especialista" e "Ver agenda de cursos".
- `npm run lint` → BLOCKED, na época, por arquivos de referência/canvas fora do escopo: `docs/design-system/trust-keith/ds-package/_ds_bundle.js`, `public/_ds/.../_ds_bundle.js`, `public/support.js`. Após a 14.3.3, esses artefatos foram removidos de `public/` e o diretório documental `docs/design/redesign/reference/canvases/**` passou a ser ignorado pela config ESLint.

### Completion Notes List

- `tokens.css` reescrito como fonte única TK/RH no `:root`, com remap RH aplicado diretamente e aliases legados temporários para `--color-*`, spacing, radius, sombras e componentes.
- `tokens.tailwind.js` agora expõe namespaces `tk-*`/`rh-*` referenciando CSS vars, incluindo fontes, raios, sombras e containers.
- `globals.css` mantém a estrutura legada/M3/EA, mas re-aponta marca, CTA, foco, chips, cards e footer para tokens TK/RH.
- `app/layout.tsx` carrega Inter e Helvetica Neue via `next/font/google`; Fraunces não é carregada e `--tk-font-display` usa fallback serif aprovado no ADR.
- Storybook `Design System / Tokens` atualizado para paleta TK/RH, tipografia, espaçamentos, raios, sombras e exemplos básicos.

## PO Validation
2026-07-02 · @po (Pax) via @aiox-master YOLO · **GO** — checklist 10/10: título, descrição, ACs por comando, escopo com proibições, dependências (INVENTORY/ADR existem), estimativa M/5, valor claro, riscos (3 camadas legadas documentadas), DoD (AC 1-8), alinhado à Epic 14/ADR-014. Status: Draft → Ready.

## Change Log
- 2026-07-02 - @aiox-master (Orion) - Story criada como prompt Codex autossuficiente (protocolo da Epic 14, seção 4) e validada GO em modo YOLO.
- 2026-07-02 - @dev (Dex/Codex) - Implementação YOLO concluída: tokens TK/RH migrados, Tailwind/fontes/Storybook atualizados, gates principais verdes; lint global bloqueado por bundles/canvas de referência fora do escopo.
