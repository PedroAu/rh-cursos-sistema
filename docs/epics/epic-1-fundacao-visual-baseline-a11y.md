# Épica 1 — Fundação Visual & Baseline A11y

**PRD:** `docs/prd/modernizacao-ui-2026.md`
**Prioridade:** P0 (pré-requisito de tudo — destrava certificados/portal)
**Rollout:** Big Bang (entra junto com Épica 2 como fundação atômica)
**Fonte:** Apple HIG plan Fase 0+1; plano original Fase 1

---

## Objetivo

Consolidar fundações visuais coerentes — tokens semânticos, escala tipográfica, camada material e baseline de acessibilidade — para que páginas não resolvam design individualmente. Capturar baseline **antes** de alterar o visual (prova de melhoria).

## Por que primeiro

Sem tokens/tipografia consistentes, qualquer FormField (Épica 2), polish de admin (Épica 3) ou jornada pública (Épica 4) nasce inconsistente. Esta é a dependência técnica raiz.

## Decisões aplicadas

- **D4:** Só modo claro; tokens estruturados para dark/alto-contraste futuro (incremento barato depois).

---

## Stories propostas (para @sm *draft)

### Story 1.1 — Baseline visual e gates de a11y
- Capturar screenshots de referência (`/`, `/cursos`, `/agenda`, `/blog`, `/in-company`, `/contato`, `/login`, `/admin`) em mobile + desktop.
- Incorporar verificação automatizada de a11y (nome acessível, landmarks, diálogos, campos) nas rotas críticas.
- Criar matriz de contraste WCAG AA para tokens (texto, botões, badges, header translúcido, painéis).
- Cenários Playwright de teclado: skip link, menu mobile, busca, checkout, CRUD admin.
- **Arquivos:** `tests/`, `playwright.config.ts`.
- **Aceite:** rotas críticas sem falha a11y de alta gravidade; navegação essencial só por teclado; relatório de contraste registrado.

### Story 1.2 — Tokens semânticos de cor e superfície
- Organizar tokens: `label`, `secondary-label`, `separator`, `surface`, `surface-raised`, `control`, `accent`, `success`, `warning`, `danger`.
- Estruturar para dark futuro (variáveis CSS preparadas, sem implementar dark agora).
- Documentar combinações contrastadas (passam WCAG AA).
- **Arquivos:** `src/styles/globals.css`, `tailwind.config.ts`.
- **Aceite:** combinações textuais principais passam WCAG AA; uso de material documentado por camada.

### Story 1.3 — Escala tipográfica responsiva
- Definir escala; elevar texto funcional atualmente em 10-11px preservando hierarquia por peso/espaçamento.
- Migrar títulos, labels, metadata e badges para variantes de token/componente (eliminar tamanhos hardcoded).
- **Arquivos:** `src/components/ui/badge.tsx`, `card.tsx`, `section-title.tsx`, views.
- **Aceite:** nenhum texto funcional abaixo do mínimo definido (S4).

### Story 1.4 — Camada material formalizada
- Translucidez (`apple-material`) reservada à camada funcional: header, sheets, dialogs, menus.
- Conteúdo e cards usam superfícies sólidas/legíveis.
- **Arquivos:** `public-layout.tsx`, `Home.tsx`, `InCompany.tsx`, `card.tsx`.
- **Aceite:** uso de material documentado por camada; cards de conteúdo estáveis e legíveis.

---

## Critérios de aceite da épica

- [ ] Baseline visual + a11y capturado antes de qualquer mudança de token (mitiga risco "mudança sem prova").
- [ ] S4 — nenhum texto funcional abaixo do mínimo.
- [ ] S5 — combinações textuais principais passam WCAG AA.
- [ ] S6 (parcial) — tokens compartilháveis entre público e admin.
- [ ] Material documentado por camada.

## Gates

`npm run lint` · `npm run typecheck` · `npm test` · revisão visual desktop/mobile · checklist a11y.
