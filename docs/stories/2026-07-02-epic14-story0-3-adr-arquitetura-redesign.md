# Story 14.0.3: ADR — Arquitetura do Redesign Trust Keith

## Status
InReview

## Executor Assignment

executor: "@architect"
executor_model: "opus" (decisões estruturais — conforme alocação da Epic 14, seção 5)
quality_gate: "@po" (review documental)

## Epic
EPIC 14 — Source: `docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md`

## Story

**As a** time de implementação (Codex),
**I want** as decisões arquiteturais D1–D6 ratificadas e os gaps G1/G4 de fontes resolvidos em um ADR,
**so that** as stories 14.0.4/14.0.5/14.1.x/14.2.x executem sem ambiguidade estrutural.

## Acceptance Criteria

1. ADR criado em `docs/architecture/` ratificando (ou revisando com justificativa) D1–D6 do épico.
2. Estratégia de fontes decidida: Quincy CF (G1) e Merriweather/Inter/Caveat (G4), com implementação via `next/font` especificada.
3. Estrutura de componentes definida: onde vivem primitivas e padrões compostos (`rh-chip`, `rh-coursecard`, `rh-paper`, `rh-nav`).
4. Estratégia de tokens confirmada: valores finais RH no `:root` (sem classe `.rh2`), mapeamento Tailwind.
5. Decisões que dependem do usuário (ex.: compra de licença) explicitamente sinalizadas com caminho de fallback que não bloqueia implementação.

## Complexity Estimate
S — 2 pontos (documental, decisões já pré-analisadas na epic e no INVENTORY).

## Dependencies
- `docs/design-system/trust-keith/INVENTORY.md` (seções 2, 3 e 6)
- `docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md` (seção 2)

## Tasks / Subtasks

- [x] Ratificar D1–D6 (AC: 1)
- [x] Decidir G1 (Quincy CF) e G4 (fontes Google) com plano `next/font` (AC: 2, 5)
- [x] Definir estrutura de componentes (AC: 3)
- [x] Confirmar estratégia de tokens (AC: 4)

## File List
- `docs/stories/2026-07-02-epic14-story0-3-adr-arquitetura-redesign.md`
- `docs/architecture/adr-014-redesign-trust-keith.md` (criado — D1-D6 ratificadas + D7 fontes, D8 estrutura, D9 escopo admin)

## Change Log
- 2026-07-02 - @aiox-master (Orion) - Story criada e iniciada em modo YOLO (draft+validação compactados; ACs derivados diretamente da epic aprovada).
- 2026-07-02 - @aiox-master (Orion) - ADR-014 criado: D1-D6 ratificadas; D7 resolve G1/G4 (next/font; Quincy CF em duas trilhas, decisao do usuario sinalizada); D8 estrutura de componentes; D9 admin re-skin minimo. Gate documental: ACs 1-5 atendidos. Status: InProgress -> InReview.
