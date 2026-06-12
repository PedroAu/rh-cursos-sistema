# Relatório de Contraste WCAG AA — Baseline (Story 1.1)

**Data:** 2026-06-09
**Ferramenta:** @axe-core/playwright (regra `color-contrast`)
**Escopo:** rotas públicas (/, /cursos, /agenda, /blog, /in-company, /contato, /login)

> Este é um relatório de **medição** do estado atual. Nenhum token foi
> alterado nesta story. As correções são responsabilidade das Stories 1.2-1.4.

## Resumo

Total de violações de contraste encontradas: **4**

## Detalhamento

| Rota | Seletor | Texto (fg) | Fundo (bg) | Razão atual | Esperado |
|------|---------|-----------|-----------|-------------|----------|
| /in-company | `.__m__-_r_v_ > .m_6d731127.mantine-Stack-root > div:nth-child(1)` | #715300 | #f6be39 | 4.19 | 4.5:1 |
| /in-company | `.m_4081bf90.mantine-Group-root > button > .m_80f1301b.mantine-Button-inner > .m_811560b9.mantine-Button-label` | #715300 | #dd9100 | 2.76 | 4.5:1 |
| /in-company | `button[data-block="true"] > .m_80f1301b.mantine-Button-inner > .m_811560b9.mantine-Button-label` | #ffffff | #d9a300 | 2.28 | 4.5:1 |
| /in-company | `.__m__-_r_4l_ > .m_e615b15f.mantine-Card-root.m_1b7284a3 > .m_6d731127.mantine-Stack-root > p` | #715300 | #f6be39 | 4.19 | 4.5:1 |
