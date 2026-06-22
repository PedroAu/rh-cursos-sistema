# Relatório de Contraste WCAG AA — Baseline (Story 1.1)

**Data:** 2026-06-09
**Ferramenta:** @axe-core/playwright (regra `color-contrast`)
**Escopo:** rotas públicas (/, /cursos, /agenda, /blog, /in-company, /contato, /login)

> Este é um relatório de **medição** do estado atual. Nenhum token foi
> alterado nesta story. As correções são responsabilidade das Stories 1.2-1.4.

## Resumo

Total de violações de contraste encontradas: **28**

## Detalhamento

| Rota | Seletor | Texto (fg) | Fundo (bg) | Razão atual | Esperado |
|------|---------|-----------|-----------|-------------|----------|
| /cursos | `div:nth-child(2) > .surface-card.p-6.group > .space-y-5.border-t-2.border-\[\#f6be39\] > .justify-between.flex.gap-2 > .border-transparent.bg-success\/12.text-success` | #22c55e | #ffffff | 2.27 | 4.5:1 |
| /cursos | `div:nth-child(3) > .surface-card.p-6.group > .space-y-5.border-t-2.border-\[\#f6be39\] > .justify-between.flex.gap-2 > .border-transparent.bg-success\/12.text-success` | #22c55e | #ffffff | 2.27 | 4.5:1 |
| /cursos | `div:nth-child(4) > .surface-card.p-6.group > .space-y-5.border-t-2.border-\[\#f6be39\] > .justify-between.flex.gap-2 > .border-transparent.bg-success\/12.text-success` | #22c55e | #ffffff | 2.27 | 4.5:1 |
| /cursos | `div:nth-child(9) > .surface-card.p-6.group > .space-y-5.border-t-2.border-\[\#f6be39\] > .justify-between.flex.gap-2 > .border-transparent.bg-success\/12.text-success` | #22c55e | #ffffff | 2.27 | 4.5:1 |
| /cursos | `div:nth-child(10) > .surface-card.p-6.group > .space-y-5.border-t-2.border-\[\#f6be39\] > .justify-between.flex.gap-2 > .border-transparent.bg-success\/12.text-success` | #22c55e | #ffffff | 2.27 | 4.5:1 |
| /cursos | `div:nth-child(11) > .surface-card.p-6.group > .space-y-5.border-t-2.border-\[\#f6be39\] > .justify-between.flex.gap-2 > .border-transparent.bg-success\/12.text-success` | #22c55e | #ffffff | 2.27 | 4.5:1 |
| /cursos | `div:nth-child(12) > .surface-card.p-6.group > .space-y-5.border-t-2.border-\[\#f6be39\] > .justify-between.flex.gap-2 > .border-transparent.bg-success\/12.text-success` | #22c55e | #ffffff | 2.27 | 4.5:1 |
| /cursos | `div:nth-child(13) > .surface-card.p-6.group > .space-y-5.border-t-2.border-\[\#f6be39\] > .justify-between.flex.gap-2 > .border-transparent.bg-success\/12.text-success` | #22c55e | #ffffff | 2.27 | 4.5:1 |
| /agenda | `.border-border.shadow-md.hover\:shadow-lg:nth-child(1) > .lg\:grid-cols-\[172px_minmax\(0\,1fr\)\].grid > .pt-5.lg\:p-6.space-y-5 > .pb-4.lg\:flex-row.lg\:items-start > .space-y-3 > .flex-wrap.gap-2.flex > .min-h-7.py-1\.5.tracking-\[0\.05em\]` | #22c55e | #ffffff | 2.27 | 4.5:1 |
| /agenda | `.border-border.shadow-md.hover\:shadow-lg:nth-child(2) > .lg\:grid-cols-\[172px_minmax\(0\,1fr\)\].grid > .pt-5.lg\:p-6.space-y-5 > .pb-4.lg\:flex-row.lg\:items-start > .space-y-3 > .flex-wrap.gap-2.flex > .min-h-7.py-1\.5.tracking-\[0\.05em\]` | #22c55e | #ffffff | 2.27 | 4.5:1 |
| /agenda | `.border-border.shadow-md.hover\:shadow-lg:nth-child(3) > .lg\:grid-cols-\[172px_minmax\(0\,1fr\)\].grid > .pt-5.lg\:p-6.space-y-5 > .pb-4.lg\:flex-row.lg\:items-start > .space-y-3 > .flex-wrap.gap-2.flex > .min-h-7.py-1\.5.tracking-\[0\.05em\]` | #22c55e | #ffffff | 2.27 | 4.5:1 |
| /agenda | `.border-border.shadow-md.hover\:shadow-lg:nth-child(4) > .lg\:grid-cols-\[172px_minmax\(0\,1fr\)\].grid > .pt-5.lg\:p-6.space-y-5 > .pb-4.lg\:flex-row.lg\:items-start > .space-y-3 > .flex-wrap.gap-2.flex > .min-h-7.py-1\.5.tracking-\[0\.05em\]` | #22c55e | #ffffff | 2.27 | 4.5:1 |
| /agenda | `.border-border.shadow-md.hover\:shadow-lg:nth-child(5) > .lg\:grid-cols-\[172px_minmax\(0\,1fr\)\].grid > .pt-5.lg\:p-6.space-y-5 > .pb-4.lg\:flex-row.lg\:items-start > .space-y-3 > .flex-wrap.gap-2.flex > .min-h-7.py-1\.5.tracking-\[0\.05em\]` | #22c55e | #ffffff | 2.27 | 4.5:1 |
| /agenda | `.border-border.shadow-md.hover\:shadow-lg:nth-child(6) > .lg\:grid-cols-\[172px_minmax\(0\,1fr\)\].grid > .pt-5.lg\:p-6.space-y-5 > .pb-4.lg\:flex-row.lg\:items-start > .space-y-3 > .flex-wrap.gap-2.flex > .min-h-7.py-1\.5.tracking-\[0\.05em\]` | #22c55e | #ffffff | 2.27 | 4.5:1 |
| /blog | `.text-white\/75` | #bfd9f2 | #0066cc | 3.82 | 4.5:1 |
| /blog | `.text-white\/70 > .flex.items-center.gap-2:nth-child(1)` | #b3d1f0 | #0066cc | 3.52 | 4.5:1 |
| /blog | `.text-white\/70 > .flex.items-center.gap-2:nth-child(2)` | #b3d1f0 | #0066cc | 3.52 | 4.5:1 |
| /blog | `.text-white\/70 > .flex.items-center.gap-2:nth-child(3)` | #b3d1f0 | #0066cc | 3.52 | 4.5:1 |
| /blog | `.h-full.border-primary\/10.rounded-md:nth-child(1) > .border-primary\/8.bg-secondary\/30.min-h-40 > .bg-accent\/12.text-accent.rounded` | #d4af37 | #ffffff | 2.1 | 4.5:1 |
| /blog | `.h-full.border-primary\/10.rounded-md:nth-child(2) > .border-primary\/8.bg-secondary\/30.min-h-40 > .bg-accent\/12.text-accent.rounded` | #d4af37 | #ffffff | 2.1 | 4.5:1 |
| /blog | `.h-full.border-primary\/10.rounded-md:nth-child(3) > .border-primary\/8.bg-secondary\/30.min-h-40 > .bg-accent\/12.text-accent.rounded` | #d4af37 | #ffffff | 2.1 | 4.5:1 |
| /blog | `.h-full.border-primary\/10.rounded-md:nth-child(4) > .border-primary\/8.bg-secondary\/30.min-h-40 > .bg-accent\/12.text-accent.rounded` | #d4af37 | #ffffff | 2.1 | 4.5:1 |
| /blog | `.h-full.border-primary\/10.rounded-md:nth-child(5) > .border-primary\/8.bg-secondary\/30.min-h-40 > .bg-accent\/12.text-accent.rounded` | #d4af37 | #ffffff | 2.1 | 4.5:1 |
| /blog | `.h-full.border-primary\/10.rounded-md:nth-child(6) > .border-primary\/8.bg-secondary\/30.min-h-40 > .bg-accent\/12.text-accent.rounded` | #d4af37 | #ffffff | 2.1 | 4.5:1 |
| /in-company | `.__m__-_r_1g_ > .m_6d731127.mantine-Stack-root > div:nth-child(1)` | #715300 | #f6be39 | 4.19 | 4.5:1 |
| /in-company | `.m_4081bf90.mantine-Group-root > button > .m_80f1301b.mantine-Button-inner > .m_811560b9.mantine-Button-label` | #715300 | #dd9100 | 2.76 | 4.5:1 |
| /in-company | `button[data-block="true"] > .m_80f1301b.mantine-Button-inner > .m_811560b9.mantine-Button-label` | #ffffff | #d9a300 | 2.28 | 4.5:1 |
| /in-company | `.__m__-_r_56_ > .m_e615b15f.mantine-Card-root.m_1b7284a3 > .m_6d731127.mantine-Stack-root > p` | #715300 | #f6be39 | 4.19 | 4.5:1 |
