# Checklist UI & A11y Review

Use este checklist em toda story que altere interface, fluxo visual ou componente compartilhado.

## Contrato visual

- [ ] O layout usa tokens semânticos existentes (`surface`, `surface-raised`, `control`, `label-*`, `accent`, `success`, `warning`, `danger`).
- [ ] Não há reintrodução de `apple-material`/`apple-surface` em conteúdo.
- [ ] A hierarquia tipográfica reaproveita a escala existente, sem tamanhos arbitrários.
- [ ] CTA principal, secundário e destrutivo seguem variantes existentes de `Button`.

## Formulários e busca

- [ ] Todo campo possui label visível.
- [ ] Hint, erro e estado inválido estão conectados por `aria-describedby` / `aria-invalid`.
- [ ] Busca usa `SearchInput` com resumo textual e ação de limpar quando aplicável.
- [ ] Submissão e carregamento exibem feedback textual, não apenas spinner.

## Executive Precision (Épico 7)

- [ ] Texto sobre fundo gold `#ffc641` usa o navy escuro validado em AA (nunca `#715300`).
- [ ] Fontes Montserrat/Inter vêm de `next/font/google` self-hosted, sem `@import` de CDN.
- [ ] Nenhuma variante `dark:` ou `[data-theme="dark"]` nova foi introduzida.
- [ ] O re-apontamento Executive Precision segue a base global definida pela auditoria final, sem reintroduzir scopes de tema por rota.

## Acessibilidade

- [ ] Contraste continua dentro do padrão WCAG AA para texto e controles.
- [ ] Fluxo é operável por teclado.
- [ ] Alertas, erros e confirmações usam `role`/`aria-live` adequados.
- [ ] Motion respeita `prefers-reduced-motion`.
- [ ] Imagens têm `alt` apropriado e usam `next/image` quando renderizadas no app.

## Gates obrigatórios

- [ ] Revisão visual desktop/mobile concluída.
- [ ] `npm run lint` verde.
- [ ] `npm run typecheck` verde.
- [ ] `npm test` verde.
- [ ] File List e Change Log da story atualizados.
