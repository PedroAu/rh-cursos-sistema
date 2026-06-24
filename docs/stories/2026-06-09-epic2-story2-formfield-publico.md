# Story 2.2: Aplicar `FormField` nos Formulários Públicos

## Status
Done

## Épica
Épica 2 — Form System & Acessibilidade Compartilhada (`docs/epics/epic-2-form-system-a11y.md`)
PRD: `docs/prd/modernizacao-ui-2026.md`

## Contexto

`Contact`, `InCompany`, `Login` e `checkout-modal` ainda dependem de placeholder como rótulo único e reportam boa parte dos erros recuperáveis só via toast. O PRD marca isso diretamente como lacuna de S3.

## Acceptance Criteria

- [x] AC1 — Substituir placeholder-como-label por `label` persistente em `Contact`, `InCompany`, `Login` e `checkout-modal`.
- [x] AC2 — Placeholder permanece apenas como exemplo de preenchimento.
- [x] AC3 — Erros recuperáveis aparecem inline, associados ao campo.
- [x] AC4 — Navegação por teclado e semântica acessível preservadas.
- [x] AC5 — `npm run lint`, `npm run typecheck` e `npm test` verdes.
- [x] AC6 — File List e Change Log atualizados.

## File List

### Criados
- `docs/stories/2026-06-09-epic2-story2-formfield-publico.md`

### Modificados
- `src/views/public/Contact.tsx` — labels persistentes, erros inline e estado de envio compartilhado
- `src/views/public/InCompany.tsx` — formulário consultivo migrado para `FormField` + erros inline
- `src/views/public/Login.tsx` — login com labels persistentes e erros por campo + resumo
- `src/components/checkout/checkout-modal.tsx` — etapas do checkout com `FormField`, validação inline e resumo de erro recuperável
- `tests/login-errors.spec.ts` — alinhado à nova semântica de labels/erros inline
- `tests/baseline/login-baseline-desktop.png` — baseline visual regenerado
- `tests/baseline/login-baseline-mobile.png` — baseline visual regenerado
- `tests/baseline/contato-baseline-desktop.png` — baseline visual regenerado
- `tests/baseline/contato-baseline-mobile.png` — baseline visual regenerado
- `tests/baseline/in-company-baseline-desktop.png` — baseline visual regenerado
- `tests/baseline/in-company-baseline-mobile.png` — baseline visual regenerado

## Change Log

- 2026-06-09 — @sm (River) — Story criada a partir da Épica 2.
- 2026-06-09 — @dev (Codex) — Implementação concluída: forms públicos migrados para labels persistentes e erros inline associados ao campo. Baselines visuais de login/contato/in-company regenerados. `npm run lint`, `npm run typecheck` e `npm test` verdes. Status In Progress → Ready for Review.

## Dev Agent Record

### Agent Model Used
Codex (dev)

### Completion Notes
- Toast permaneceu apenas para confirmação ou falha não recuperável; erros de validação local agora vivem junto do campo.
- O checkout multi-step foi o ponto mais sensível: a validação agora respeita a etapa atual sem perder o fluxo existente.

## QA Results

Pass — encerramento formal em 2026-06-24. Story permanece coerente com o runtime atual após ajuste documental da file list.
