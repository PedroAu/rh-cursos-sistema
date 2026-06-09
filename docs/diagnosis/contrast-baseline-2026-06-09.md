# Relatório de Contraste WCAG AA — Baseline (Story 1.1)

**Data:** 2026-06-09
**Ferramenta:** @axe-core/playwright (regra `color-contrast`)
**Escopo:** rotas públicas (/, /cursos, /agenda, /blog, /in-company, /contato, /login)

> Este é um relatório de **medição** do estado atual. Nenhum token foi
> alterado nesta story. As correções são responsabilidade das Stories 1.2-1.4.

## Resumo

Total de violações de contraste encontradas: **70**

## Detalhamento

| Rota | Seletor | Texto (fg) | Fundo (bg) | Razão atual | Esperado |
|------|---------|-----------|-----------|-------------|----------|
| /cursos | `div:nth-child(1) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .border-b.p-6.bg-white > .space-y-2 > .bg-accent.tracking-\[0\.16em\].text-xs` | #f8f8fb | #c2b085 | 2.01 | 4.5:1 |
| /cursos | `div:nth-child(1) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .border-b.p-6.bg-white > .space-y-2 > .bg-primary\/12.min-h-7.py-1\.5` | #8397af | #f8f8fb | 2.82 | 4.5:1 |
| /cursos | `div:nth-child(1) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .space-y-3 > h3` | #8397af | #f8f8fa | 2.82 | 3:1 |
| /cursos | `div:nth-child(1) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .space-y-3 > .line-clamp-3.leading-7` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(1) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .flex.gap-2.items-center:nth-child(1)` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(1) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .flex.gap-2.items-center:nth-child(2)` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(1) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .flex.gap-2.items-center:nth-child(3)` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(1) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .text-accent.font-bold` | #c2b085 | #f8f8fa | 2.01 | 4.5:1 |
| /cursos | `div:nth-child(1) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .border-border\/70.pt-6.border-t > .sm\:grid-cols-2.grid.gap-2 > .border-primary\/20.hover\:bg-surface-muted.min-w-0` | #8397af | #f8f8fb | 2.82 | 4.5:1 |
| /cursos | `div:nth-child(1) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .border-border\/70.pt-6.border-t > .sm\:grid-cols-2.grid.gap-2 > .text-primary-foreground.hover\:bg-deep-navy.bg-primary` | #f8f8fb | #8397af | 2.82 | 4.5:1 |
| /cursos | `div:nth-child(2) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .border-b.p-6.bg-white > .space-y-2 > .bg-accent.tracking-\[0\.16em\].text-xs` | #f8f8fb | #c2b085 | 2.01 | 4.5:1 |
| /cursos | `div:nth-child(2) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .border-b.p-6.bg-white > .space-y-2 > .bg-muted.min-h-7.py-1\.5` | #a8a8ac | #f8f8fb | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(2) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .space-y-3 > h3` | #8397af | #f8f8fa | 2.82 | 3:1 |
| /cursos | `div:nth-child(2) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .space-y-3 > .line-clamp-3.leading-7` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(2) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .flex.gap-2.items-center:nth-child(1)` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(2) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .flex.gap-2.items-center:nth-child(2)` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(2) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .flex.gap-2.items-center:nth-child(3)` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(2) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .text-accent.font-bold` | #c2b085 | #f8f8fa | 2.01 | 4.5:1 |
| /cursos | `div:nth-child(2) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .border-border\/70.pt-6.border-t > .sm\:grid-cols-2.grid.gap-2 > .border-primary\/20.hover\:bg-surface-muted.min-w-0` | #8397af | #f8f8fb | 2.82 | 4.5:1 |
| /cursos | `div:nth-child(2) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .border-border\/70.pt-6.border-t > .sm\:grid-cols-2.grid.gap-2 > .text-primary-foreground.hover\:bg-deep-navy.bg-primary` | #f8f8fb | #8397af | 2.82 | 4.5:1 |
| /cursos | `div:nth-child(3) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .border-b.p-6.bg-white > .space-y-2 > .bg-accent.tracking-\[0\.16em\].text-xs` | #f8f8fb | #c2b085 | 2.01 | 4.5:1 |
| /cursos | `div:nth-child(3) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .border-b.p-6.bg-white > .space-y-2 > .bg-primary\/12.min-h-7.py-1\.5` | #8397af | #f8f8fb | 2.82 | 4.5:1 |
| /cursos | `div:nth-child(3) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .space-y-3 > h3` | #8397af | #f8f8fa | 2.82 | 3:1 |
| /cursos | `div:nth-child(3) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .space-y-3 > .line-clamp-3.leading-7` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(3) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .flex.gap-2.items-center:nth-child(1)` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(3) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .flex.gap-2.items-center:nth-child(2)` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(3) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .flex.gap-2.items-center:nth-child(3)` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(3) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .text-accent.font-bold` | #c2b085 | #f8f8fa | 2.01 | 4.5:1 |
| /cursos | `div:nth-child(3) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .border-border\/70.pt-6.border-t > .sm\:grid-cols-2.grid.gap-2 > .border-primary\/20.hover\:bg-surface-muted.min-w-0` | #8397af | #f8f8fb | 2.82 | 4.5:1 |
| /cursos | `div:nth-child(3) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .border-border\/70.pt-6.border-t > .sm\:grid-cols-2.grid.gap-2 > .text-primary-foreground.hover\:bg-deep-navy.bg-primary` | #f8f8fb | #8397af | 2.82 | 4.5:1 |
| /cursos | `div:nth-child(4) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .border-b.p-6.bg-white > .space-y-2 > .bg-accent.tracking-\[0\.16em\].text-xs` | #f8f8fb | #c2b085 | 2.01 | 4.5:1 |
| /cursos | `div:nth-child(4) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .border-b.p-6.bg-white > .space-y-2 > .bg-primary\/12.min-h-7.py-1\.5` | #8397af | #f8f8fb | 2.82 | 4.5:1 |
| /cursos | `div:nth-child(4) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .space-y-3 > h3` | #8397af | #f8f8fa | 2.82 | 3:1 |
| /cursos | `div:nth-child(4) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .space-y-3 > .line-clamp-3.leading-7` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(4) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .flex.gap-2.items-center:nth-child(1)` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(4) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .flex.gap-2.items-center:nth-child(2)` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(4) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .flex.gap-2.items-center:nth-child(3)` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(4) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .text-accent.font-bold` | #c2b085 | #f8f8fa | 2.01 | 4.5:1 |
| /cursos | `div:nth-child(4) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .border-border\/70.pt-6.border-t > .sm\:grid-cols-2.grid.gap-2 > .border-primary\/20.hover\:bg-surface-muted.min-w-0` | #8397af | #f8f8fb | 2.82 | 4.5:1 |
| /cursos | `div:nth-child(4) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .border-border\/70.pt-6.border-t > .sm\:grid-cols-2.grid.gap-2 > .text-primary-foreground.hover\:bg-deep-navy.bg-primary` | #f8f8fb | #8397af | 2.82 | 4.5:1 |
| /cursos | `div:nth-child(5) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .border-b.p-6.bg-white > .space-y-2 > .bg-accent.tracking-\[0\.16em\].text-xs` | #f8f8fb | #c2b085 | 2.01 | 4.5:1 |
| /cursos | `div:nth-child(5) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .border-b.p-6.bg-white > .space-y-2 > .bg-primary\/12.min-h-7.py-1\.5` | #8397af | #f8f8fb | 2.82 | 4.5:1 |
| /cursos | `div:nth-child(5) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .space-y-3 > h3` | #8397af | #f8f8fa | 2.82 | 3:1 |
| /cursos | `div:nth-child(5) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .space-y-3 > .line-clamp-3.leading-7` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(5) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .flex.gap-2.items-center:nth-child(1)` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(5) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .flex.gap-2.items-center:nth-child(2)` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(5) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .flex.gap-2.items-center:nth-child(3)` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(5) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .text-accent.font-bold` | #c2b085 | #f8f8fa | 2.01 | 4.5:1 |
| /cursos | `div:nth-child(5) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .border-border\/70.pt-6.border-t > .sm\:grid-cols-2.grid.gap-2 > .border-primary\/20.hover\:bg-surface-muted.min-w-0` | #8397af | #f8f8fb | 2.82 | 4.5:1 |
| /cursos | `div:nth-child(5) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .border-border\/70.pt-6.border-t > .sm\:grid-cols-2.grid.gap-2 > .text-primary-foreground.hover\:bg-deep-navy.bg-primary` | #f8f8fb | #8397af | 2.82 | 4.5:1 |
| /cursos | `div:nth-child(6) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .border-b.p-6.bg-white > .space-y-2 > .bg-accent.tracking-\[0\.16em\].text-xs` | #f8f8fb | #c2b085 | 2.01 | 4.5:1 |
| /cursos | `div:nth-child(6) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .border-b.p-6.bg-white > .space-y-2 > .bg-muted.min-h-7.py-1\.5` | #a8a8ac | #f8f8fb | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(6) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .space-y-3 > h3` | #8397af | #f8f8fa | 2.82 | 3:1 |
| /cursos | `div:nth-child(6) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .space-y-3 > .line-clamp-3.leading-7` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(6) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .flex.gap-2.items-center:nth-child(1)` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(6) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .flex.gap-2.items-center:nth-child(2)` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(6) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .flex.gap-2.items-center:nth-child(3)` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(6) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .text-accent.font-bold` | #c2b085 | #f8f8fa | 2.01 | 4.5:1 |
| /cursos | `div:nth-child(6) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .border-border\/70.pt-6.border-t > .sm\:grid-cols-2.grid.gap-2 > .border-primary\/20.hover\:bg-surface-muted.min-w-0` | #8397af | #f8f8fb | 2.82 | 4.5:1 |
| /cursos | `div:nth-child(6) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .border-border\/70.pt-6.border-t > .sm\:grid-cols-2.grid.gap-2 > .text-primary-foreground.hover\:bg-deep-navy.bg-primary` | #f8f8fb | #8397af | 2.82 | 4.5:1 |
| /cursos | `div:nth-child(7) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .border-b.p-6.bg-white > .space-y-2 > .bg-accent.tracking-\[0\.16em\].text-xs` | #f8f8fb | #c2b085 | 2.01 | 4.5:1 |
| /cursos | `div:nth-child(7) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .border-b.p-6.bg-white > .space-y-2 > .bg-primary\/12.min-h-7.py-1\.5` | #8397af | #f8f8fb | 2.82 | 4.5:1 |
| /cursos | `div:nth-child(7) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .space-y-3 > h3` | #8397af | #f8f8fa | 2.82 | 3:1 |
| /cursos | `div:nth-child(7) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .space-y-3 > .line-clamp-3.leading-7` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(7) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .flex.gap-2.items-center:nth-child(1)` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(7) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .flex.gap-2.items-center:nth-child(2)` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(7) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .flex.gap-2.items-center:nth-child(3)` | #a8a8ac | #f8f8fa | 2.23 | 4.5:1 |
| /cursos | `div:nth-child(7) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .grid-cols-2.border-surface-container.gap-4 > .text-accent.font-bold` | #c2b085 | #f8f8fa | 2.01 | 4.5:1 |
| /cursos | `div:nth-child(7) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .border-border\/70.pt-6.border-t > .sm\:grid-cols-2.grid.gap-2 > .border-primary\/20.hover\:bg-surface-muted.min-w-0` | #8397af | #f8f8fb | 2.82 | 4.5:1 |
| /cursos | `div:nth-child(7) > .surface-card.hover\:-translate-y-1.bg-white\/95 > .space-y-6.p-6 > .border-border\/70.pt-6.border-t > .sm\:grid-cols-2.grid.gap-2 > .text-primary-foreground.hover\:bg-deep-navy.bg-primary` | #f8f8fb | #8397af | 2.82 | 4.5:1 |
