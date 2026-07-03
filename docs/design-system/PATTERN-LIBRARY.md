# Pattern Library — Canonical RH Cursos

**Status:** Active reference for implementation handoff  
**Last Updated:** 2026-07-03  
**Primary source of truth:** [docs/design-system/trust-keith/INVENTORY.md](./trust-keith/INVENTORY.md)

---

## Purpose

Este documento substitui a pattern library legada como guia operacional curto.
Ele não redefine tokens nem componentes fora do que já foi inventariado no épico 14.

## Canonical Design Foundations

### Tokens

Use apenas as famílias abaixo como source of truth:

- `--tk-*` para tokens base do design system Trust Keith já remapeados para RH
- `--rh-*` para extensões exclusivas da marca RH

Regra crítica:

- `#235875` pertence ao DS base original e **não pode** aparecer como cor final de marca no produto RH
- o valor final de marca é `#0c6a83` via `--tk-brand` / `--tk-cta`

### Typography

- Display: `--tk-font-display`
- Serif editorial: `--tk-font-serif`
- Body/UI: `--tk-font-body`
- Escalas e aliases devem seguir a seção 2.2 do inventário Trust Keith RH

### Surfaces and Effects

- Superfícies padrão: `--tk-surface`, `--tk-surface-2`
- Paper surface RH: gradiente com `--rh-paper-a`, `--rh-paper-b` e borda `--rh-paper-line`
- Sombras sempre dark-tinted
- `backdrop-filter` não faz parte da linguagem visual

## Canonical Components

### Atoms

- `Button`
- `Input`
- `Textarea`
- `Select`
- `Checkbox`
- `Switch`
- `Badge`
- `Avatar`

### Molecules

- `FormField`
- `Card`
- `Dialog`
- `AlertDialog`
- `Table`

### RH Composite Patterns

- `rh-chip`: chip informativo
- `rh-fchip`: chip de filtro togglável
- `rh-coursecard`: card de curso
- `rh-paper`: card editorial com gradiente paper
- `rh-nav`: header público

Regra de consolidação:

- não criar variantes paralelas se um padrão composto já cobre o caso
- `.rh-jchip` permanece classificado como código morto e não deve ser promovido

## Variant Policy

Manter somente a menor superfície semântica necessária:

- `Button`: `primary`, `outline`, `danger`, `ghost` ou `tertiary` apenas se usado de fato
- `Card`: `surface`, `glass`, `paper`
- `FormField`: uma única anatomia com label, hint, erro e estado inválido

## Accessibility Baseline

- conformidade alvo: WCAG 2.1 AA
- foco usa `--tk-focus`
- motion respeita `prefers-reduced-motion`
- labels visíveis são obrigatórias em formulários

Observação:

- o foco atual está documentado como AA, não AAA, em [docs/design/A11Y-FINDINGS.md](../design/A11Y-FINDINGS.md)

## Legacy Status

O conteúdo anterior desta library refletia uma fase pré-épico-14 com taxonomia diferente de cores e componentes.
Essa taxonomia deve ser tratada como histórica, não normativa.

Artefatos legados que não devem mais dirigir implementação:

- nomes genéricos como `primary`, `secondary`, `surface-light`
- associação de marca final a `#235875`
- descrições baseadas em wrappers Mantine como modelo de longo prazo

## Implementation References

- Canonical inventory: [docs/design-system/trust-keith/INVENTORY.md](./trust-keith/INVENTORY.md)
- Token stories: [src/stories/design-tokens.stories.tsx](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/stories/design-tokens.stories.tsx)
- Token source: [src/design-tokens/tokens.css](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/design-tokens/tokens.css)
- Tailwind mapping: [src/design-tokens/tokens.tailwind.js](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/design-tokens/tokens.tailwind.js)

## Next Documentation Step

Se houver nova consolidação, ela deve acontecer no inventário Trust Keith RH ou em documentação derivada explicitamente alinhada a ele, nunca em paralelo.
