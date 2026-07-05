# Story 14.0.2: Specs de Fidelidade por Página

## Status
Done

## Executor Assignment

executor: "@ux-design-expert"
executor_model: "sonnet" (trabalho visual detalhado — conforme alocação da Epic 14, seção 5)
quality_gate: "@po" (review documental de cobertura)

## Epic
EPIC 14 — Source: `docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md`

## Story

**As a** implementador (Codex) das stories 14.2.x,
**I want** uma spec de fidelidade por canvas documentando seções, grids, tokens, interações, contrato de dados e comportamento responsivo,
**so that** cada página seja implementada com fidelidade total sem reinterpretar os canvases.

## Acceptance Criteria

1. Existem specs em `docs/design/redesign/` para: home, home-sections, catalogo, agenda, in-company, quem-somos, blog (7 arquivos `spec-*.md`).
2. Cada spec documenta, por seção do canvas: estrutura/grid, tokens usados (cores, tipo, espaçamento, raio, sombra), conteúdo/copy, estados interativos (hover/focus/toggle) e componentes/padrões da 14.0.5 empregados.
3. Cada spec define o **contrato de dados** das seções dinâmicas (`sc-for`/`{{ placeholders }}`): campos, origem (Supabase/estático) e fallback para lista vazia.
4. Cada spec define comportamento responsivo (canvases são desktop 1180px): breakpoints e adaptação de grid por seção.
5. Divergências deliberadas do canvas (dados reais, responsivo, a11y) são listadas em seção "Adaptações" — tudo que não estiver ali deve ser idêntico ao canvas.

## Complexity Estimate
M — 5 pontos (7 specs, leitura detalhada de canvases).

## Dependencies
- `public/*.dc.html` (7 canvases)
- `docs/design-system/trust-keith/INVENTORY.md`
- `docs/design-system/trust-keith/DESIGN.md`

## Tasks / Subtasks

- [x] spec-home.md (inclui decidir integração das variantes de RH Home Sections) (AC: 1-5)
- [x] spec-home-sections.md (AC: 1-5)
- [x] spec-catalogo.md (AC: 1-5)
- [x] spec-agenda.md (AC: 1-5)
- [x] spec-in-company.md (AC: 1-5)
- [x] spec-quem-somos.md (AC: 1-5)
- [x] spec-blog.md (AC: 1-5)

## File List
- `docs/stories/2026-07-02-epic14-story0-2-specs-fidelidade-paginas.md`
- `docs/design/redesign/spec-home.md`
- `docs/design/redesign/spec-home-sections.md`
- `docs/design/redesign/spec-catalogo.md`
- `docs/design/redesign/spec-agenda.md`
- `docs/design/redesign/spec-in-company.md`
- `docs/design/redesign/spec-quem-somos.md`
- `docs/design/redesign/spec-blog.md`

## Change Log
- 2026-07-02 - @aiox-master (Orion) - Story criada e iniciada em modo YOLO; execução delegada a agente designer (sonnet) em background.

## QA Results

**Gate documental (2026-07-02) — PASS.** 7/7 specs existem; todas com secoes "Contrato de dados", "Responsivo" e "Adaptacoes"; 7/7 citam tokens por nome.

**Ambiguidades levantadas pelo executor e roteamento:**

| # | Ambiguidade | Resolucao |
|---|---|---|
| 1 | Canvas Home so tem variante "2a" (sem alternativas a descartar) | Documentado no spec-home; sem acao |
| 2 | `--tk-text-display` usado nos canvases mas ausente do DS | RESOLVIDO: alias -> `--tk-text-display-large` (2.75rem) em tokens.css + INVENTORY 2.2; conferir visual em 14.2.5/14.2.6 |
| 3 | Busca inconsistente (Input do DS vs markup custom) | DECISAO (ADR D8, coerencia): padronizar com primitiva Input em todas as paginas; registrar como Adaptacao |
| 4 | `.rh-fchip` nao catalogado; `.rh-jchip` e codigo morto | RESOLVIDO: INVENTORY 3 atualizado; 14.0.5 implementa fchip |
| 5 | Contraste de Button secondary sobre fundo brand (Quem Somos/Home Sections CTA) | Encaminhado para verificacao a11y na implementacao (14.2.1/14.2.5) + gate 14.3.1 |
| 6 | Nav cita "Consultoria" sem canvas dedicado | Rota `/consultoria` ja existe no app; re-skin coberto pela story 14.2.7 (paginas sem canvas) |
| 7 | `/blog/[slug]` sem canvas proprio | Gap registrado na 14.2.6: derivar do spec-blog + DS; @ux-design-expert define na propria story |
| 8 | Regras de negocio (poucas vagas, em alta, post destaque) propostas nos contratos de dados | PENDENTE VALIDACAO DO USUARIO antes das stories 14.2.x |

## Change Log (execucao)
- 2026-07-02 - designer (sonnet, background) - 7 specs criadas.
- 2026-07-02 - @aiox-master (Orion) - Gate PASS; ambiguidades 2/3/4/6/7 resolvidas/roteadas; 5 e 8 pendentes (a11y na implementacao; validacao de produto pelo usuario). Status: InProgress -> InReview.
