# Story 4.2: Jornada de Conversão

## Status
Done

## Épica
Épica 4 — Jornadas Públicas (`docs/epics/epic-4-jornadas-publicas.md`)
PRD: `docs/prd/modernizacao-ui-2026.md`

## Contexto

Depois da descoberta, a próxima trava do PRD é reduzir atrito na decisão e na captura. O detalhe do curso, o checkout, a confirmação de inscrição e os formulários de contato/in-company precisam orientar melhor a escolha e devolver confirmação clara ao usuário.

## Acceptance Criteria

- [x] AC1 — O detalhe do curso reforça hierarquia de decisão com resumo operacional e suporte consultivo.
- [x] AC2 — O checkout mostra resumo do pedido, mantém labels persistentes, erros inline e reduz atrito para pessoa física.
- [x] AC3 — A confirmação de inscrição explicita próximos passos.
- [x] AC4 — Contato e In Company coletam contexto mais consultivo e exibem confirmação inline após envio.
- [x] AC5 — Há cobertura de regressão para o fluxo de checkout e formulários públicos.
- [x] AC6 — `npm run lint`, `npm run typecheck` e `npm test` verdes.
- [x] AC7 — File List e Change Log atualizados.

## File List

### Criados
- `docs/stories/2026-06-10-epic4-story2-conversao.md`
- `tests/public-journeys.spec.ts` — regressão dos fluxos de checkout, contato e in-company

### Modificados
- `src/views/public/CourseDetail.tsx` — hierarquia de decisão, atalhos consultivos e sumário operacional
- `src/components/checkout/checkout-modal.tsx` — checkout guiado com resumo e validação condicional por tipo de inscrição
- `src/views/public/EnrollmentSuccess.tsx` — confirmação com próximos passos
- `src/views/public/Contact.tsx` — coleta consultiva adicional e confirmação inline
- `src/views/public/InCompany.tsx` — briefing mais denso, confirmação inline e superfície ajustada
- `tests/route-auth.spec.ts` — rota pública de confirmação incluída
- `tests/visual.baseline.spec.ts` — captura visual das páginas dinâmicas e de confirmação
- `tests/baseline/curso-detalhe-baseline-desktop.png`
- `tests/baseline/curso-detalhe-baseline-mobile.png`
- `tests/baseline/inscricao-confirmada-baseline-desktop.png`
- `tests/baseline/inscricao-confirmada-baseline-mobile.png`

## Change Log

- 2026-06-10 — @sm (River) — Story criada a partir da Épica 4.
- 2026-06-10 — @dev (Codex) — Fluxos de conversão públicos reforçados com melhor hierarquia, confirmação e guard de regressão. `npm run lint`, `npm run typecheck` e `npm test` verdes. Status In Progress → Ready for Review.

## Dev Agent Record

### Agent Model Used
Codex (dev)

### Completion Notes
- A redução de atrito principal ficou no checkout: pessoa física não precisa mais preencher contexto corporativo para avançar.
- As confirmações públicas agora são verificáveis em DOM sem depender apenas de toast.

## QA Results

Pass — encerramento formal em 2026-06-24. Story permanece coerente com o runtime atual após ajuste documental da file list.
