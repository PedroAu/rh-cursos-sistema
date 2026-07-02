# Story 14.0.5: Biblioteca de Componentes Trust Keith RH

## Status
InReview

## Executor Assignment

executor: "Codex" (@dev delegado — prompt autossuficiente abaixo)
quality_gate: "@qa" (story 14.0.6)

## Epic
EPIC 14 — Source: `docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md`
ADR: `docs/architecture/adr-014-redesign-trust-keith.md` (D1, D8) · Depende de: 14.0.4 (tokens — CONCLUÍDA)

## Story

**As a** implementador das páginas 14.2.x e da remoção do Mantine 14.1.x,
**I want** primitivas e padrões compostos Trust Keith RH prontos e documentados no Storybook,
**so that** páginas e admin consumam componentes fiéis aos canvases sem estilo ad-hoc.

## Complexity Estimate
L — 8 pontos (8 primitivas + 6 padrões + shell público + stories).

---

## 🤖 PROMPT CODEX (autossuficiente)

### Contexto

Projeto Next.js 16 (App Router em `app/`, código em `src/`) em `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos`. A story 14.0.4 (tokens) JÁ FOI executada: `src/design-tokens/tokens.css` contém todos os tokens `--tk-*`/`--rh-*` com valores finais RH, e `src/design-tokens/tokens.tailwind.js` expõe utilitários Tailwind (`tk-brand`, `rounded-tk-card`, `shadow-tk-glass`, `font-tk-display`, etc.).

**Fontes de verdade (ler antes):**
1. `docs/design-system/trust-keith/INVENTORY.md` — seção 3: os 13 componentes do DS + 6 padrões compostos dos canvases, com decisão do que virar primitiva.
2. `docs/architecture/adr-014-redesign-trust-keith.md` — D8: camadas (`ui/` primitivas, `patterns/` compostos, `features/public-shell/` shell).
3. `docs/design-system/trust-keith/ds-package/_ds_bundle.js` — JSX de referência dos componentes do DS (anatomia/variantes). É artefato de canvas: NÃO copiar para produção; reescrever em TSX com Radix/Tailwind/cva.
4. `docs/design/redesign/spec-*.md` (7 specs) — uso real de cada componente por página (variantes, tamanhos, estados).
5. `docs/design-system/trust-keith/DESIGN.md` — regras do sistema.

**Regras invioláveis:**
- Estilo somente via tokens (`tk-*`/`rh-*` do Tailwind ou `var(--tk-*)`); hex hardcoded é proibido fora de `tokens.css`.
- Sombras sempre dark-tinted (`shadow-tk-*`); PROIBIDO `backdrop-filter`/blur.
- Raios pela escala: input 4px < button 6px < glass 16px < card 24px < pill.
- Hover por motion/opacity (cards `-translate-y-0.5`) ou darken via token hover; sem bounce/scale.
- Foco: ring `--tk-focus` com offset (`focus-visible`).
- Sentence case; CTAs com seta `→` quando a spec indicar.
- Stack: Radix UI (já instalado) + Tailwind + `class-variance-authority` + `tailwind-merge`/`clsx` (padrão dos componentes existentes em `src/components/ui/`).

### Tarefas

**1. Primitivas em `src/components/ui/` (reescrever existentes mantendo API/exports compatíveis — rodar typecheck para garantir que consumidores atuais não quebram):**

| Arquivo | Spec |
|---|---|
| `button.tsx` (reescrever) | variants: `primary` (bg `tk-cta`, hover `tk-cta-hover`, texto branco), `secondary` (fill `tk-black-5`, hover `tk-black-8`, texto `tk-ink`), `ghost`; sizes `sm`/`md`/`lg` (canvases usam sm 32px e lg 52px de altura); radius `tk-button`; press nudge 0.5px |
| `badge.tsx` (reescrever) | tones: `accent` (bg `tk-accent-soft`, texto `tk-accent-strong`), `neutral`, `success`, `error`; prop `dot` (bolinha à esquerda); radius pill; caption size |
| `chip.tsx` (novo) | variant `info` (`.rh-chip`: surface + border `tk-line` + pill + `shadow-tk-glass`, padding 8px 15px) e variant `filter` (`.rh-fchip`: padding 9px 16px, hover border `tk-accent`, estado ativo bg `tk-brand` texto branco, transição 200ms `tk-ease`; usar `aria-pressed`) |
| `card.tsx` (novo/reescrever se existir) | base: surface, border `tk-line`, radius `tk-card` (24px), padding 32px, `shadow-tk-card`; variant `glass` (radius 16px, `shadow-tk-glass`, padding 20px) |
| `input.tsx`, `textarea.tsx`, `select.tsx` (novos) | radius `tk-input` (4px), border `tk-line`, focus ring `tk-focus`; label/hint/error pattern acessível (aria-describedby); select com Radix Select |
| `checkbox.tsx`, `switch.tsx` (novos) | com tokens; switch radius pill; usar Radix quando disponível |
| `avatar.tsx` (novo) | Radix Avatar + fallback iniciais; tamanhos sm/md/lg |

**2. Padrões compostos em `src/components/patterns/` (novos):**

| Arquivo | Spec (ver specs das páginas para anatomia exata) |
|---|---|
| `course-card.tsx` | `.rh-coursecard`: surface, border, radius glass 16px, `shadow-tk-glass`, padding 20px, flex col gap 12px; slots: badge de trilha, título, meta (datas/modalidade), CTA |
| `paper-card.tsx` | `.rh-paper`: gradiente `linear-gradient(158deg, var(--rh-paper-a), var(--rh-paper-b))`, border `rh-paper-line`, radius `tk-card`, `shadow-tk-card` |
| `stat-block.tsx` | número display + label (ver StatBlock do bundle e spec-quem-somos/home-sections) |
| `testimonial.tsx` | citação + avatar + nome/cargo/empresa (ver spec-in-company/home-sections) |
| `feature-list-item.tsx` | ícone (lucide) + título + descrição |
| `section-heading.tsx` | eyebrow (`.rh-tag`: uppercase, `rh-gray`, tracking eyebrow) + título display + sub serif opcional |

**3. Shell público em `src/features/public-shell/`:**
- `components/public-header.tsx` (novo, NÃO remover o header atual ainda): `.rh-nav` — logo `public/images/brand/logo-horizontal.png` (next/image, height 42px), links centrais (Cursos, Agenda, In-company, Consultoria, Blog), à direita "Entrar" + Button primary sm "Fale com um especialista →"; fundo branco, border-bottom `tk-black-8`; mobile: reutilizar o drawer existente por ora (troca na 14.1.3).
- `components/public-footer.tsx` (novo): conforme seção Footer de `spec-home-sections.md`.
- Não plugar nos layouts ainda — páginas adotam na 14.2.x (evita quebrar o site atual).

**4. Storybook:** uma story por primitiva/padrão em `src/stories/` (seguir formato das stories existentes), cobrindo todas as variantes/estados.

### Proibições

- NÃO tocar em arquivos que importam `@mantine` (fase 14.1.x) — exceção: se `src/components/ui/{button,badge}.tsx` forem importados por eles, manter compatibilidade de API em vez de editar os consumidores.
- NÃO alterar páginas/rotas (`app/`, `src/views/`) nem layouts.
- NÃO adicionar dependências.
- NÃO usar `_ds_bundle.js` como import — só como leitura de referência.
- NÃO tocar em `.aiox-core/`, `public/` (exceto nada — só ler), `supabase/`.
- NÃO fazer `git push` (commit local ok).

### Acceptance Criteria (verificáveis por comando)

1. Arquivos existem: `ls src/components/ui/{button,badge,chip,card,input,textarea,select,checkbox,switch,avatar}.tsx src/components/patterns/ src/features/public-shell/components/public-{header,footer}.tsx`.
2. `grep -rInE "#[0-9a-fA-F]{3,8}\b" src/components/ui/ src/components/patterns/ src/features/public-shell/components/public-header.tsx src/features/public-shell/components/public-footer.tsx` → vazio (sem hex hardcoded; exceção: nenhum).
3. `grep -rn "backdrop-filter\|backdrop-blur" src/components/ src/features/public-shell/` → vazio.
4. `grep -rn "235875" src/components/ src/features/` → vazio.
5. `npm run lint && npm run typecheck` → verdes (consumidores existentes de button/badge continuam compilando).
6. `npm run test:unit` → verde.
7. `npm run storybook:build` → sucesso; stories cobrem todas as primitivas e padrões novos.
8. `npm run build` → sucesso.

### Ao concluir

Atualizar esta story: checkboxes, File List completa, status → InReview, Change Log.

---

## Tasks / Subtasks

- [x] Primitivas ui/ (10 arquivos) (AC: 1-6)
- [x] Padrões patterns/ (6 arquivos) (AC: 1-6)
- [x] public-header + public-footer (AC: 1-6)
- [x] Stories Storybook (AC: 7)
- [x] Verificação completa (AC: 1-8)

## File List
- `docs/stories/2026-07-02-epic14-story0-5-componentes-trust-keith.md`
- `.ai/decision-log-14.0.5.md`
- `docs/history/decisions/decision-logs-index.md`
- `src/components/ui/avatar.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/checkbox.tsx`
- `src/components/ui/chip.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/switch.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/patterns/course-card.tsx`
- `src/components/patterns/feature-list-item.tsx`
- `src/components/patterns/index.ts`
- `src/components/patterns/paper-card.tsx`
- `src/components/patterns/section-heading.tsx`
- `src/components/patterns/stat-block.tsx`
- `src/components/patterns/testimonial.tsx`
- `src/features/public-shell/components/public-footer.tsx`
- `src/features/public-shell/components/public-header.tsx`
- `src/stories/trust-keith-patterns.stories.tsx`
- `src/stories/trust-keith-primitives.stories.tsx`

## PO Validation
2026-07-02 · @po (Pax) via @aiox-master YOLO · **GO** — checklist 10/10; dependência 14.0.4 confirmada concluída; ACs por comando; API compat de button/badge protege consumidores Mantine até a 14.1.x. Status: Draft → Ready.

## Change Log
- 2026-07-02 - @aiox-master (Orion) - Story criada como prompt Codex (protocolo Epic 14 §4), incorporando ambiguidades resolvidas da 14.0.2 (`.rh-fchip` como variant filter do chip; `.rh-jchip` descartado como código morto).
- 2026-07-02 - @dev (Dex/Codex) - Implementadas primitivas Trust Keith RH, padrões compostos, shell público não plugado e stories; validações executadas.

## Dev Agent Record

### Agent Model Used
GPT-5 Codex

### Debug Log References
- `grep -rInE "#[0-9a-fA-F]{3,8}\b" src/components/ui/ src/components/patterns/ src/features/public-shell/components/public-header.tsx src/features/public-shell/components/public-footer.tsx` -> sem ocorrências.
- `grep -rn "backdrop-filter\|backdrop-blur" src/components/ src/features/public-shell/` -> sem ocorrências.
- `grep -rn "235875" src/components/ src/features/` -> sem ocorrências.
- `npx eslint` focado nos arquivos desta story -> passou.
- `npm run lint` completo -> bloqueado por erros pré-existentes nos artefatos de canvas `docs/design-system/trust-keith/ds-package/_ds_bundle.js`, `public/_ds/.../_ds_bundle.js` e `public/support.js`.
- `npm run typecheck` -> passou.
- `npm run test:unit` -> passou, 27 arquivos / 392 testes.
- `npm run storybook:build` -> passou.
- `npm run build` -> passou.
- `.ai/decision-log-14.0.5.md` -> gerado via decision recorder.

### Completion Notes List
- `button` e `badge` foram reescritos com aliases compatíveis (`default`, `outline`, `tertiary`, `danger`, `muted`) para não quebrar consumidores existentes.
- `checkbox` e `switch` usam implementação local acessível porque `@radix-ui/react-checkbox` e `@radix-ui/react-switch` não estão instalados, e a story proíbe novas dependências.
- `public-header` e `public-footer` foram criados/reescritos sem plugar em layouts ou páginas.
- `dialog` teve `backdrop-blur-sm` removido porque o AC 3 varre todo `src/components/`.
