# Relatório de Contraste WCAG AA — Baseline (Story 1.1)

**Data:** 2026-06-09
**Ferramenta:** @axe-core/playwright (regra `color-contrast`)
**Escopo:** rotas públicas (/, /cursos, /agenda, /blog, /in-company, /contato, /login)

> Este é um relatório de **medição** do estado atual. Nenhum token foi
> alterado nesta story. As correções são responsabilidade das Stories 1.2-1.4.

## Resumo

Total de violações de contraste encontradas: **10**

## Detalhamento

| Rota | Seletor | Texto (fg) | Fundo (bg) | Razão atual | Esperado |
|------|---------|-----------|-----------|-------------|----------|
| /blog | `.text-white\/75` | #bfd9f2 | #0066cc | 3.82 | 4.5:1 |
| /blog | `.text-white\/70 > .flex.items-center.gap-2:nth-child(1)` | #b3d1f0 | #0066cc | 3.52 | 4.5:1 |
| /blog | `.text-white\/70 > .flex.items-center.gap-2:nth-child(2)` | #b3d1f0 | #0066cc | 3.52 | 4.5:1 |
| /blog | `.text-white\/70 > .flex.items-center.gap-2:nth-child(3)` | #b3d1f0 | #0066cc | 3.52 | 4.5:1 |
| /blog | `.bg-\[var\(--color-primary\)\]` | #ffffff | #0d78dc | 4.43 | 4.5:1 |
| /blog | `.h-full.rounded-md.border-border:nth-child(1) > .border-primary\/8.bg-secondary\/30.min-h-40 > .bg-accent\/12.text-accent.rounded` | #d4af37 | #ffffff | 2.1 | 4.5:1 |
| /blog | `.h-full.rounded-md.border-border:nth-child(2) > .border-primary\/8.bg-secondary\/30.min-h-40 > .bg-accent\/12.text-accent.rounded` | #d4af37 | #ffffff | 2.1 | 4.5:1 |
| /blog | `.h-full.rounded-md.border-border:nth-child(3) > .border-primary\/8.bg-secondary\/30.min-h-40 > .bg-accent\/12.text-accent.rounded` | #d4af37 | #ffffff | 2.1 | 4.5:1 |
| /blog | `.h-full.rounded-md.border-border:nth-child(4) > .border-primary\/8.bg-secondary\/30.min-h-40 > .bg-accent\/12.text-accent.rounded` | #d4af37 | #ffffff | 2.1 | 4.5:1 |
| /blog | `.h-full.rounded-md.border-border:nth-child(5) > .border-primary\/8.bg-secondary\/30.min-h-40 > .bg-accent\/12.text-accent.rounded` | #d4af37 | #ffffff | 2.1 | 4.5:1 |
