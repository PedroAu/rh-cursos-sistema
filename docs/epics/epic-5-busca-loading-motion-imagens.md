# Épica 5 — Busca, Loading, Motion & Imagens

**Status:** COMPLETE — stories 5.1 a 5.5 `Done`

**PRD:** `docs/prd/modernizacao-ui-2026.md`
**Prioridade:** P3
**Depende de:** Épicas 1, 2 (tokens + componentes)
**Fonte:** Apple HIG plan Fase 3; plano original Fase 5

---

## Objetivo

Reduzir esforço cognitivo nos fluxos de descoberta e decisão: unificar busca, padronizar loading/empty/motion e migrar imagens para fluxo previsível.

## Decisões aplicadas

- **D5:** Busca do header **conecta ao catálogo** com termo aplicado (`/cursos?q=termo`), virando ação real.

---

## Stories propostas (para @sm *draft)

### Story 5.1 — Busca global do header conectada
- Header encaminha para catálogo com termo aplicado.
- Manter header como camada funcional translúcida; validar contraste sobre Home e páginas internas.
- Remover `apple-material` de blocos de conteúdo remanescentes.
- **Arquivos:** `public-layout.tsx`, `search-input.tsx`.
- **Aceite:** S7 — busca sempre inicia operação real e informa resultado.

### Story 5.2 — Busca local unificada
- Cursos, Agenda, Blog, Admin: placeholder específico, botão limpar, contagem de resultados, empty state, filtro anunciado por tecnologias assistivas.
- **Aceite:** comportamento de busca consistente entre as 4 áreas (S6).

### Story 5.3 — Loading e submissão padronizados
- Skeleton para conteúdo carregando; indicador no botão para submissão de formulário/inscrição.
- Progresso determinado só quando houver progresso real.
- **Arquivos:** `loading-blocks.tsx`, forms.

### Story 5.4 — Motion com prefers-reduced-motion (JS)
- Substituir deslocamento/escala por fade ou estado estático quando `prefers-reduced-motion` ativo, inclusive em Framer Motion.
- **Arquivos:** `section-title.tsx`, `course-card.tsx`, `Home.tsx`.
- **Aceite:** S8 — nenhum movimento essencial ativo sob preferência reduzida.

### Story 5.5 — Migração de imagens para next/image
- Migrar as 7 `<img>` apontadas pelo lint; dimensões, prioridade só no hero, alt correto.
- **Aceite:** S9 — warnings de `<img>` eliminados.

---

## Critérios de aceite da épica

- [x] S7 — busca real e informativa.
- [x] S8 — motion respeita preferência reduzida.
- [x] S9 — sem warnings de `<img>`.
- [x] Busca consistente entre as 4 áreas.

## Gates

`npm run lint` · `npm run typecheck` · `npm test` · revisão visual · checklist a11y.
