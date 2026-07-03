# Design System Mapping — Canonical Tokens → Components

**Status:** Active reference  
**Last Updated:** 2026-07-03  
**Primary source of truth:** [docs/design-system/trust-keith/INVENTORY.md](../design-system/trust-keith/INVENTORY.md)

---

## Overview

Este documento descreve o mapeamento canônico entre os tokens ativos do redesign RH e a implementação em componentes.
Ele substitui o mapeamento legado baseado em nomes como `primary`, `secondary` e `surface-light`.

## Token Families

### Brand and Accent

| Token | Final value | Usage |
|---|---:|---|
| `--tk-brand` | `#0c6a83` | marca principal RH |
| `--tk-brand-hover` | `#084f63` | hover de CTA primário |
| `--tk-cta` | `#0c6a83` | CTA primário |
| `--tk-cta-hover` | `#084f63` | hover de CTA primário |
| `--tk-accent` | `#1791a9` | acentos, links, controles secundários |
| `--tk-accent-strong` | `#0c6a83` | reforço de acento |
| `--tk-accent-soft` | `#e0f2f6` | fundos suaves de destaque |

### Neutral and Semantic

| Token | Final value | Usage |
|---|---:|---|
| `--tk-ink` | `#222525` | texto principal |
| `--tk-ink-muted` | `#4f5057` | texto secundário |
| `--tk-line` | `#ebebeb` | bordas |
| `--tk-surface` | `#ffffff` | superfície principal |
| `--tk-surface-2` | `#fafafa` | superfície alternativa |
| `--tk-success` | `#068466` | estados de sucesso |
| `--tk-error` | `#ea384c` | estados de erro |
| `--tk-focus` | `#4d65ff` | anel de foco AA |

### RH Extensions

| Token | Final value | Usage |
|---|---:|---|
| `--rh-teal-deep` | `#0c6a83` | destaque editorial |
| `--rh-teal` | `#1791a9` | teal intermediário |
| `--rh-teal-lt` | `#37b7cc` | detalhes claros |
| `--rh-gray` | `#7f8c94` | eyebrow/tag |
| `--rh-paper-a` | `#f4f1e9` | paper gradient start |
| `--rh-paper-b` | `#e9e4d8` | paper gradient end |
| `--rh-paper-line` | `#ded8c9` | paper border |

## Component Mapping

### Button

Canonical semantics:

- `primary` → background `--tk-cta`, hover `--tk-cta-hover`, text on `--tk-surface`
- `secondary` → border `--tk-line`, background `--tk-surface`, text `--tk-ink`
- `destructive` → background `--tk-error`, text on `--tk-surface`
- `ghost` or `link` → text/accent usage only when justified by interaction model

Implementation target:

- [src/components/ui/button.tsx](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/components/ui/button.tsx)

### Card

Canonical variants:

- `surface` → `--tk-surface` + `--tk-radius-card` + `--tk-shadow-card`
- `glass` → `--tk-surface` + `--tk-radius-glass` + `--tk-shadow-glass`
- `paper` → RH paper gradient + `--rh-paper-line`

Implementation targets:

- [src/components/ui/card.tsx](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/components/ui/card.tsx)
- [src/components/patterns/paper-card.tsx](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/components/patterns/paper-card.tsx)

### Form Controls

Canonical requirements:

- labels visíveis
- hint and error linked via `aria-describedby`
- invalid state via `aria-invalid`
- focus driven by `--tk-focus`

Implementation targets:

- [src/components/ui/form-field.tsx](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/components/ui/form-field.tsx)
- [src/components/ui/input.tsx](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/components/ui/input.tsx)
- [src/components/ui/textarea.tsx](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/components/ui/textarea.tsx)
- [src/components/ui/select.tsx](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/components/ui/select.tsx)

### Chips and Tags

Canonical patterns:

- `rh-chip` → informational surface chip
- `rh-fchip` → toggle/filter chip
- `rh-tag` → eyebrow/tag text pattern

Rule:

- `.rh-jchip` is not canonical and should not receive new implementation work

## Typography Mapping

| Token family | Component usage |
|---|---|
| `--tk-font-display` + display scale | hero, section headers, editorial titles |
| `--tk-font-serif` + subhead/body large | supporting editorial copy |
| `--tk-font-body` + body/caption scales | UI, forms, cards, navigation |

## Legacy Mapping Status

Os nomes abaixo devem ser tratados como legados e não devem orientar novas implementações:

- `primary`
- `secondary`
- `surface-white`
- `surface-light`
- `text-primary`
- `text-secondary`
- `bright-blue` como sinônimo de cor de marca

Motivo:

- esses nomes refletem a fase pré-remap RH ou abstrações intermediárias
- a taxonomia ativa agora está explicitamente capturada em `--tk-*` e `--rh-*`

## Validation Rules

- nenhum CTA final deve renderizar `#235875` como cor de marca
- toda nova variante deve mapear para token existente antes de criar novo alias
- documentação derivada deve apontar para o inventário Trust Keith RH, não duplicar a definição

## Implementation References

- Inventory: [docs/design-system/trust-keith/INVENTORY.md](../design-system/trust-keith/INVENTORY.md)
- Token story: [src/stories/design-tokens.stories.tsx](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/stories/design-tokens.stories.tsx)
- Token CSS: [src/design-tokens/tokens.css](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/design-tokens/tokens.css)
- Tailwind tokens: [src/design-tokens/tokens.tailwind.js](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/design-tokens/tokens.tailwind.js)
