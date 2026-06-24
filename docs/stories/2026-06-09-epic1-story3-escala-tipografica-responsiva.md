# Story 1.3: Escala Tipográfica Responsiva

## Status
Done

## Épica
Épica 1 — Fundação Visual & Baseline A11y (`docs/epics/epic-1-fundacao-visual-baseline-a11y.md`)
PRD: `docs/prd/modernizacao-ui-2026.md`

## Contexto

A Story 1.2 já estruturou os tokens semânticos de cor e superfície e introduziu a base da escala tipográfica no `tailwind.config.ts` e no `globals.css`. O problema restante é de **adoção real**: o runtime ainda mistura tokens novos com tamanhos hardcoded e usos funcionais em 10-11px (`text-micro`, `text-badge`, `text-[11px]`) em navegação, badges, metadata e cards.

O PRD marca essa lacuna como prioridade alta (§2.3, "Texto funcional em 10-12px") e define o critério S4: **nenhum texto funcional abaixo do mínimo tipográfico definido**. Esta story fecha a distância entre a escala definida e o uso real nas páginas/componentes críticos.

## Business Value

Sem a migração tipográfica, a modernização visual continua inconsistente: a fundação existe, mas labels, badges, metadata e navegação permanecem com legibilidade irregular entre público e admin. Esta story transforma a escala em comportamento real e prepara as épicas seguintes para reutilizar padrões estáveis, em vez de continuar hardcoding tamanhos por página.

## Acceptance Criteria

- [x] AC1 — Formalizar no `src/styles/globals.css` a escala responsiva base para headings e texto funcional, consumindo os tokens já introduzidos na Story 1.2.
- [x] AC2 — Atualizar `src/components/ui/badge.tsx`, `src/components/ui/card.tsx` e `src/components/common/section-title.tsx` para usar variantes compatíveis com a escala tipográfica da épica, sem reduzir legibilidade.
- [x] AC3 — Eliminar usos **funcionais** de 10-11px nas áreas críticas identificadas no PRD e na épica: badges, metadata, labels de navegação, cards e agenda.
- [x] AC4 — Migrar views/componentes públicos críticos para variantes tipográficas consistentes (`Home`, `Courses`, `InCompany`, cards de curso/trilha/blog/agenda e navegação móvel/admin quando aplicável).
- [x] AC5 — Preservar hierarquia visual: títulos continuam destacados por peso/escala; labels e metadata sobem para o mínimo sem competir com headings.
- [x] AC6 — Validar o critério S4 do PRD: nenhum texto funcional abaixo do mínimo definido permanece nos arquivos-alvo desta story.
- [x] AC7 — Validar com `npm run lint` (limpo).
- [x] AC8 — Validar com `npm run typecheck` (limpo).
- [x] AC9 — Validar com `npm test` (suite completa verde, sem flaky).
- [x] AC10 — Atualizar File List e Change Log ao concluir.

## Scope

### In Scope

- Ajuste da escala base no `globals.css` e consumo no Tailwind já existente.
- Migração de componentes compartilhados de tipografia e card.
- Remoção de texto funcional em 10-11px nas áreas críticas públicas/admin mobile.
- Ajustes de labels, badges, metadata e headings curtos em views críticas.

### Out of Scope

- Mudança de conteúdo/copy.
- Reestruturação de layout fora do necessário para acomodar a nova escala.
- Revisão completa de todas as páginas do sistema; foco nos componentes e views listados na épica/PRD.
- Materiais/translucidez por camada — Story 1.4.

## Tarefas / Subtarefas

- [x] Revisar a escala tipográfica base em `src/styles/globals.css`.
- [x] Atualizar `badge.tsx`, `card.tsx` e `section-title.tsx`.
- [x] Corrigir usos funcionais de `text-micro`, `text-badge` e `text-[11px]` nas áreas críticas.
- [x] Ajustar cards e metadata em `Home`, `Courses`, `InCompany`, agenda e navegação.
- [x] Rodar quality gates (lint, typecheck, test).
- [x] Atualizar File List e Change Log.

## Dependencies

- **Pré-requisito:** Story 1.2 (tokens semânticos e medição confiável).
- **Bloqueia:** Story 1.4 (camada material precisa se apoiar em hierarquia tipográfica estável); Épicas 2-4 (consumo consistente de labels e cards).

## Complexity Estimate

**M (Médio)** — O risco está menos no volume e mais em manter hierarquia visual enquanto se remove tipografia subdimensionada sem inflar o layout.

## Risks

| Risco | Mitigação |
|-------|-----------|
| Subir labels/badges quebrar grids compactos | Ajustar apenas áreas críticas e conferir comportamento mobile/desktop com tokens existentes. |
| Tipografia ficar homogênea demais | Preservar contraste por peso, spacing e tokens de título, não só por tamanho. |
| Corrigir um componente e deixar hardcodes espalhados | Atacar componentes compartilhados primeiro e varrer usos funcionais de 10-11px nos arquivos-alvo. |

## Definition of Done

- Todos os AC marcados.
- `npm run lint`, `npm run typecheck`, `npm test` verdes.
- Escala tipográfica aplicada nos componentes e views críticas da épica.
- File List e Change Log atualizados.

## File List

### Criados
- `docs/stories/2026-06-09-epic1-story3-escala-tipografica-responsiva.md`

### Modificados
- `src/styles/globals.css` — headings base migrados para a escala responsiva por token; superfícies reaproveitam a semântica de texto
- `src/components/ui/badge.tsx` — badges sobem de 11px para o mínimo funcional (`text-label`)
- `src/components/ui/card.tsx` — descrição padrão alinhada ao token semântico secundário
- `src/components/common/section-title.tsx` — descrição responsiva (`text-sm` → `md:text-base`) sem competir com o heading
- `src/components/courses/course-card.tsx` — path/nível e título do card migrados para variantes legíveis
- `src/components/blog/blog-card.tsx` — categoria migrada para `text-label`
- `src/components/agenda/class-card.tsx` — badge da trilha migrada para `text-label`
- `src/components/agenda/calendar-view.tsx` — cabeçalhos do calendário, aviso e chip de seleção migrados para o mínimo funcional
- `src/views/public/Courses.tsx` — eyebrows e contadores de filtros/trilhas migrados para `text-label`
- `src/views/public/Home.tsx` — labels dos cards métricos e chips de prova ajustados para o mínimo funcional
- `src/features/admin-shell/components/admin-bottom-navigation.tsx` — navegação móvel admin elevada de `11px` para `text-label`

## Dev Agent Record

### Agent Model Used
Codex (dev)

### Completion Notes
- A escala tipográfica definida na Story 1.2 foi finalmente consumida no runtime crítico, sem criar novos tokens nem mudar a hierarquia da épica.
- Os usos funcionais restantes de `text-micro`, `text-badge` e `text-[11px]` foram removidos dos alvos da story; a varredura final deixou apenas as definições de token no CSS.
- O critério S4 do PRD foi operacionalizado nas áreas mais sensíveis: badges, metadata, cards de catálogo/agenda/blog e navegação admin mobile.

## Change Log

- 2026-06-09 — @sm (River) — Story criada a partir da Épica 1 e do PRD para operacionalizar o critério S4 (mínimo tipográfico funcional).
- 2026-06-09 — @dev (Codex) — Implementação concluída: headings base responsivos, badges/metadata elevados ao mínimo funcional e áreas críticas públicas/admin mobile migradas. `npm run lint`, `npm run typecheck` e `npm test` verdes. Status In Progress → Ready for Review.

## Dev Notes

- A base da escala já existe em `src/styles/globals.css` e `tailwind.config.ts`; esta story foca adoção e consistência.
- O alvo principal são usos funcionais de `text-micro`, `text-badge` e `text-[11px]`, especialmente em badges, navegação e metadata.

## QA Results

Pass — encerramento formal em 2026-06-24. Story permanece coerente com o runtime atual após ajuste documental da file list.
