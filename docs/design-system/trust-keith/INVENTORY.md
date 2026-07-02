# Trust Keith → RH Cursos — Inventário do Design System

**Story:** 14.0.1 (`docs/stories/2026-07-02-epic14-story0-1-trust-keith-inventory.md`)
**Épico:** 14 — Redesign Trust Keith: Fidelidade Total + Remoção do Mantine
**Data:** 2026-07-02
**Fontes:** `ds-package/_ds_manifest.json`, `ds-package/tokens/*.css`, `ds-package/readme.md`, `DESIGN.md`, canvases `public/*.dc.html`

---

## 1. Regra crítica de marca

O design system base "Trust Keith" usa a paleta original azul-navy (`--tk-brand: #235875`). Os canvases RH aplicam um **remap de marca** via classe `.rh2` que sobrescreve os tokens de brand/CTA/accent para o teal RH.

> **REGRA: os tokens finais do site RH = tokens base do ds-package + remap `.rh2`.**
> **`#235875` NÃO deve aparecer como cor de marca no site final.** Se um CTA renderizar azul-navy, o remap não foi aplicado — é regressão visual, mesmo com testes passando.

### Remap `.rh2` (extraído dos canvases — idêntico em todos)

| Token | Base Trust Keith | **Final RH** |
|---|---|---|
| `--tk-brand` | `#235875` | **`#0c6a83`** |
| `--tk-brand-hover` | `#194359` | **`#084f63`** |
| `--tk-cta` | `var(--tk-brand)` | **`#0c6a83`** |
| `--tk-cta-hover` | `var(--tk-brand-hover)` | **`#084f63`** |
| `--tk-accent` | `#4285f4` | **`#1791a9`** |
| `--tk-accent-strong` | `#2459b3` | **`#0c6a83`** |
| `--tk-accent-soft` | `#e0eeff` | **`#e0f2f6`** |

### Variáveis exclusivas RH (definidas nos canvases, sem equivalente no DS base)

| Variável | Valor | Uso nos canvases |
|---|---|---|
| `--rh-teal-deep` | `#0c6a83` | Destaques tipográficos (itálico no hero), dias de agenda, badges |
| `--rh-teal` | `#1791a9` | Accent intermediário |
| `--rh-teal-lt` | `#37b7cc` | Detalhes claros (onda do logo) |
| `--rh-gray` | `#7f8c94` | Tags/eyebrows (`.rh-tag`) |
| `--rh-paper-a` | `#f4f1e9` | Início do gradiente "paper" |
| `--rh-paper-b` | `#e9e4d8` | Fim do gradiente "paper" |
| `--rh-paper-line` | `#ded8c9` | Borda dos cards "paper" |
| Fundo hero (hardcoded) | `#F3F0E8` | Background da seção hero da Home |

---

## 2. Mapa de tokens finais por família

Origem: `ds-package/tokens/{colors,typography,spacing,effects,fonts}.css` (valores confirmados no `_ds_manifest.json`).

### 2.1 Cores (`tokens/colors.css`)

| Token | Valor final RH | Nota |
|---|---|---|
| `--tk-brand` / `--tk-cta` | `#0c6a83` | remap `.rh2` |
| `--tk-brand-hover` / `--tk-cta-hover` | `#084f63` | remap `.rh2` |
| `--tk-accent` | `#1791a9` | remap `.rh2` |
| `--tk-accent-strong` | `#0c6a83` | remap `.rh2` |
| `--tk-accent-soft` | `#e0f2f6` | remap `.rh2` |
| `--tk-focus` | `#4d65ff` | base (anel de foco azul intencional) |
| `--tk-ink` | `#222525` | texto — nunca preto puro |
| `--tk-ink-muted` | `#4f5057` | texto secundário |
| `--tk-line` | `#ebebeb` | bordas/divisores 1px |
| `--tk-surface` | `#ffffff` | fundo padrão |
| `--tk-surface-2` | `#fafafa` | fundo alternativo |
| `--tk-black-8` / `--tk-black-5` | `rgba(0,0,0,0.08)` / `rgba(0,0,0,0.05)` | fills sutis |
| `--tk-cream` | `#fffaf4` | blocos quentes (testimonials) |
| `--tk-cream-dark` | `#c3b6aa` | acento cream |
| `--tk-success` | `#068466` | feedback positivo |
| `--tk-error` | `#ea384c` | feedback de erro |
| Aliases | `--tk-text`, `--tk-text-muted`, `--tk-border`, `--tk-bg`, `--tk-bg-alt`, `--tk-bg-warm`, `--tk-link` | apontam para os tokens acima |

### 2.2 Tipografia (`tokens/typography.css`, `tokens/fonts.css`)

| Token | Valor |
|---|---|
| `--tk-font-display` | `"Quincy CF", "Iowan Old Style", "Palatino Linotype", Georgia, serif` — headlines, peso 700 |
| `--tk-font-serif` | `"Merriweather", Georgia, "Times New Roman", serif` — subheadings 300/400 |
| `--tk-font-body` | `"Inter", "Helvetica Neue", Arial, sans-serif` — corpo e UI 400/500/600 |
| `--tk-font-hand` | `"Caveat", "Segoe Script", cursive` — somente acentos pontuais |
| `--tk-text-display-hero` | `3.75rem` · `--tk-text-display-large`: `2.75rem` · `--tk-text-section`: `2rem` |
| `--tk-text-display` | **Alias → `var(--tk-text-display-large)` (2.75rem).** Usado 6× nos canvases (Quem Somos, Blog) mas ausente do DS base — inconsistência do canvas resolvida por decisão da 14.0.2; conferir visualmente na 14.2.5/14.2.6 |
| `--tk-text-subhead-lg` | `1.5rem` · `--tk-text-subhead`: `1.25rem` |
| `--tk-text-body-lg` | `1.0625rem` · `--tk-text-body`: `1rem` · `--tk-text-body-sm`: `0.875rem` |
| `--tk-text-caption` | `0.75rem` · `--tk-text-caption-sm`: `0.6875rem` |
| Pesos | light 300 / regular 400 / medium 500 / semibold 600 / bold 700 |
| Line-height | tight 1.1 / snug 1.25 / normal 1.4 / relaxed 1.5 |
| Tracking | display `-0.02em` / normal `0` / eyebrow `0.08em` |

Regras editoriais (readme): sentence case em tudo, **sem all-caps** exceto eyebrows pequenos; hierarquia por peso, não por estilo; sem emoji — o único glifo recorrente é a seta `→` em CTAs.

### 2.3 Espaçamento e containers (`tokens/spacing.css`)

| Token | Valor |
|---|---|
| `--tk-space-1..16` | `0.25 / 0.5 / 0.75 / 1 / 1.25 / 1.5 / 2 / 3 / 4 rem` (base 4px) |
| `--tk-pad-card` | `2rem` (32px) · `--tk-pad-button`: `1.25rem` (20px) |
| `--tk-gap-component` | `1.5rem` · `--tk-gap-section`: `4rem` (seções 48–64px) |
| `--tk-container` | `1200px` · `--tk-container-wide`: `1400px` |

### 2.4 Raios (`tokens/spacing.css`)

Escala cresce com o tamanho do elemento — assinatura visual do DS:

| Token | Valor | Uso |
|---|---|---|
| `--tk-radius-input` | `4px` | inputs |
| `--tk-radius-button` | `6px` | botões |
| `--tk-radius-md` | `8px` | elementos médios |
| `--tk-radius-glass` | `16px` | cards leves ("glass" = raio + sombra, **nunca** `backdrop-filter`) |
| `--tk-radius-card` | `24px` | **card padrão — assinatura do sistema** |
| `--tk-radius-pill` | `100rem` | badges, chips, switches |

### 2.5 Sombras e foco (`tokens/effects.css`)

Sombras **sempre dark-tinted, nunca coloridas**:

| Token | Valor |
|---|---|
| `--tk-shadow-hairline` | `inset 0 0 0 1px var(--tk-line)` |
| `--tk-shadow-glass` | `0 4px 16px rgba(0,0,0,0.08)` |
| `--tk-shadow-card` | `0 2px 16px rgba(0,0,0,0.02), 0 16px 64px rgba(0,0,0,0.12)` (dual-layer) |
| `--tk-shadow-pop` | `0 12px 36px -8px rgba(41,43,78,0.18)` |
| `--tk-focus-ring` | `0.125rem solid var(--tk-focus)` + offset `0.125rem` |

### 2.6 Motion (`tokens/effects.css`)

| Token | Valor |
|---|---|
| `--tk-ease` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (curva única do sistema) |
| `--tk-duration-fast/base/slow` | `200ms / 300ms / 500ms` |

Hover: cards sobem `translateY(-2px)`; botões escurecem (primary → hover token); sem bounces, sem scale-shrink.

### 2.7 Gradientes (`tokens/effects.css`)

| Token | Valor |
|---|---|
| `--tk-gradient-soft` | `radial-gradient(circle, #f7f9fc 35%, #ebf3ff)` |
| `--tk-gradient-hero` | `linear-gradient(135deg, #ffffff 0%, var(--tk-cream) 52%, var(--tk-accent-soft) 100%)` |
| Gradiente "paper" RH (canvases) | `linear-gradient(158deg, var(--rh-paper-a), var(--rh-paper-b))` |

---

## 3. Mapa de componentes (`_ds_manifest.json` — 13 componentes)

Namespace do bundle: `TrustKeithDesignSystem_e3aaec`.

### Core (`components/core/`)

| Componente | sourcePath | Uso esperado no redesign RH | Primitiva 14.0.5? |
|---|---|---|---|
| Button | `components/core/Button.jsx` | CTAs (variants primary/secondary; sizes sm/lg nos canvases) | ✅ `src/components/ui/button.tsx` (reescrever) |
| Badge | `components/core/Badge.jsx` | Eyebrows/labels (`tone="accent" dot` no hero) | ✅ `src/components/ui/badge.tsx` (reescrever) |
| Card | `components/core/Card.jsx` | Base para course card / paper card | ✅ `src/components/ui/card.tsx` |
| Input | `components/core/Input.jsx` | Formulários (contato, in-company, login, admin) | ✅ substitui Mantine TextInput (14.1.2) |
| Checkbox | `components/core/Checkbox.jsx` | Formulários e filtros | ✅ |
| Switch | `components/core/Switch.jsx` | Admin/configurações | ✅ |
| Avatar | `components/core/Avatar.jsx` | Depoimentos, instrutores | ✅ |
| Logo | `components/core/Logo.jsx` | **Não usar** — logo RH próprio (`public/images/brand/logo-horizontal.png`) | ❌ |

### Data (`components/data/`)

| Componente | sourcePath | Uso esperado no redesign RH | Primitiva 14.0.5? |
|---|---|---|---|
| StatBlock | `components/data/StatBlock.jsx` | Números institucionais (Home, Quem Somos) | ✅ |
| Testimonial | `components/data/Testimonial.jsx` | Depoimentos de clientes | ✅ |
| FeatureListItem | `components/data/FeatureListItem.jsx` | Listas de benefícios (In-company) | ✅ |
| ProgressBar | `components/data/ProgressBar.jsx` | Portais aluno/instrutor | opcional |

### Navigation (`components/navigation/`)

| Componente | sourcePath | Uso esperado no redesign RH | Primitiva 14.0.5? |
|---|---|---|---|
| NavBar | `components/navigation/NavBar.jsx` | Referência para o header público (`.rh-nav` dos canvases: logo + links + CTA) | ✅ como `public-header` em `src/features/public-shell/` |

### Padrões compostos dos canvases (sem componente no DS — criar na 14.0.5)

| Padrão (classe no canvas) | Descrição |
|---|---|
| `.rh-chip` | Chip informativo (surface + border + radius-pill + shadow-glass) |
| `.rh-fchip` | Chip de filtro togglável usado em Catálogo/Agenda/Blog: `padding 9px 16px`, `radius-pill`, hover `border-color: var(--tk-accent)`, ativo `data-on="1"` → fundo `--tk-brand` texto branco, transição `all .2s var(--tk-ease)` |
| `.rh-jchip` | Variante de chip togglável (Home) — **referenciado só em script, nunca renderizado no markup (código morto)**; implementar apenas `.rh-fchip` como primitiva de filtro |
| `.rh-coursecard` | Card de curso (surface, radius-glass, shadow-glass, padding 20px) |
| `.rh-paper` | Card "paper" com gradiente RH e borda `--rh-paper-line` |
| `.rh-tag` | Eyebrow uppercase em `--rh-gray` |
| `.rh-nav` | Header público completo |

---

## 4. Canvases de referência → rotas → views

| Canvas (`public/`) | Rota | View atual | Nota |
|---|---|---|---|
| `RH Cursos Home.dc.html` | `/` | `src/views/public/Home.tsx` | Hero, próximas turmas, trilhas |
| `RH Home Sections.dc.html` | `/` | idem | **Complemento da Home** — seções adicionais |
| `RH Cursos Catálogo.dc.html` | `/cursos` | `src/views/public/Courses.tsx` | |
| `RH Cursos Agenda.dc.html` | `/agenda` | `src/views/public/Agenda.tsx` | Ver também `docs/design/redesign/reference/screenshots/agenda-cal*.png` |
| `RH Cursos In-company.dc.html` | `/in-company` | `src/views/public/InCompany.tsx` | |
| `RH Cursos Quem Somos.dc.html` | `/sobre` | `src/views/public/About.tsx` | |
| `RH Cursos Blog.dc.html` | `/blog` (+ `/blog/[slug]` na 14.2.6) | `src/views/public/Blog.tsx` | |

Os canvases usam `sc-for`/`{{ placeholders }}` para dados dinâmicos (ex.: próximas turmas) — o contrato de dados real (Supabase) é definido por página nas specs da story 14.0.2. Canvases são desktop **1180px** (`.rh-page`); breakpoints mobile serão definidos na 14.0.2.

---

## 5. Assets

### Definitivos (permanecem no site)

| Asset | Uso |
|---|---|
| `public/images/brand/logo-horizontal.png` | **Logo oficial** do header/footer |
| `public/images/brand/rh-cursos-logo-azul.png` | Legado — avaliar remoção na 14.3.3 |

### Temporários (apoio de desenvolvimento — remover na story 14.3.3, antes do deploy)

| Asset | Função |
|---|---|
| `public/*.dc.html` (7 canvases) + `public/RH Cursos Home.html` / `RH Cursos Agenda.html` | Referência visual renderizável |
| `public/_ds/` | Bundle do DS que os canvases importam |
| `public/support.js` | Runtime dos canvases |
| `public/uploads/logoHorizontal_800X600.png` | Path que os canvases esperam para o logo |

**Atenção (limite Cloudflare Free < 3 MiB):** esses arquivos ficam em `public/` (assets estáticos, fora do worker bundle), mas não devem ir ao deploy final — a limpeza é AC da 14.3.3.

---

## 6. Gaps e decisões pendentes (NÃO resolvidos nesta story)

| # | Gap | Dono | Story |
|---|---|---|---|
| G1 | **Fonte Quincy CF é comercial** (carregada remota no DS; `fonts.css` referencia `remoteSrc`). Decidir: licenciar/self-host vs fallback `Iowan Old Style/Georgia` (já embutido no token) | @architect | 14.0.3 |
| G2 | Destino final dos canvases/bundles (mover para `docs/design/redesign/reference/` vs deletar) | @dev | 14.3.3 |
| G3 | Divergência placeholders dos canvases (`sc-for`, `{{ c.day }}`) vs dados reais Supabase — contrato de dados por seção | @ux-design-expert | 14.0.2 |
| G4 | Merriweather/Inter/Caveat: confirmar self-host via `next/font` (Google Fonts) para não depender de CDN | @architect | 14.0.3 |

---

## 7. Handoff para próximas stories

### → 14.0.3 (@architect — ADR)
- Decidir G1 e G4 (estratégia de fontes com `next/font`).
- Ratificar D1–D6 do épico; estrutura: primitivas em `src/components/ui/`, padrões compostos (`rh-chip`, `rh-coursecard`, `rh-paper`) em `src/components/` ou `src/features/`.
- Insumo: seções 2 e 3 deste inventário.

### → 14.0.4 (@dev/Codex — tokens)
- Reescrever `src/design-tokens/tokens.css` com **todos os tokens da seção 2, já com valores finais RH** (base + remap aplicado — não gerar a classe `.rh2`, os valores finais entram direto no `:root`).
- Incluir as variáveis exclusivas RH (`--rh-*`) da seção 1.
- Atualizar `src/design-tokens/tokens.tailwind.js` e `tailwind.config.ts` com o mapeamento Tailwind (cores, fontes, raios, sombras, espaçamentos, containers 1200/1400).
- Remover paleta antiga (`#0066CC`, dourado `#d4af37`, navy `#001736`) e `mantine-tokens.css` (na 14.1.x).
- Fonte de verdade para conferência: `ds-package/tokens/*.css` + seção 1 deste arquivo.

### → 14.0.5 (@dev/Codex — componentes)
- Reescrever/criar as primitivas marcadas ✅ na seção 3 com Radix + Tailwind + cva, consumindo exclusivamente tokens `--tk-*`/`--rh-*`.
- Referência de anatomia/variantes: `ds-package/_ds_bundle.js` (JSX dos 13 componentes) e uso real nos canvases (`x-import ... variant/size/tone`).
- Criar os padrões compostos da seção 3 (chips, course card, paper card, nav).
- Regras invioláveis: sombras dark-tinted, sem `backdrop-filter`, radius conforme escala 2.4, hover por motion/opacity, foco com `--tk-focus-ring`.
