# Story 2.1: Componente `FormField` Reutilizável

## Status
Done

## Épica
Épica 2 — Form System & Acessibilidade Compartilhada (`docs/epics/epic-2-form-system-a11y.md`)
PRD: `docs/prd/modernizacao-ui-2026.md`

## Contexto

Os átomos atuais (`Input`, `Textarea`, `Select`) já têm base visual consistente, mas ainda não existe uma camada compartilhada que resolva o contrato acessível completo de campo: `label` persistente, hint, required, erro inline, `aria-describedby` e `aria-invalid`. Sem isso, cada formulário continua reinventando estrutura e semântica.

## Acceptance Criteria

- [x] AC1 — Criar um componente compartilhado `FormField` com `label`, `hint`, `required`, `error` e ids acessíveis gerados de forma estável.
- [x] AC2 — O componente deve expor `fieldId`, `descriptionId`, `errorId`, `aria-describedby` e `aria-invalid` para os controles filhos.
- [x] AC3 — `Input`, `Textarea` e `Select` continuam consumíveis sem regressão visual.
- [x] AC4 — `FormField` é adotado pelos pontos compartilhados relevantes do admin/form system desta épica.
- [x] AC5 — `npm run lint`, `npm run typecheck` e `npm test` verdes.
- [x] AC6 — File List e Change Log atualizados.

## File List

### Criados
- `docs/stories/2026-06-09-epic2-story1-formfield-reutilizavel.md`
- `src/components/ui/form-field.tsx` — wrapper compartilhado com label persistente, hint, erro inline e contrato aria

### Modificados
- `src/components/admin/form-fields.tsx` — componentes admin reaproveitam `FormField` para semântica consistente
- `src/views/admin/AdminResourcePage.tsx` — campos simples/textarea/file/date/number passam a consumir `FormField`

## Change Log

- 2026-06-09 — @sm (River) — Story criada a partir da Épica 2.
- 2026-06-09 — @dev (Codex) — Implementação concluída: `FormField` criado e aplicado aos pontos compartilhados do form system público/admin. `npm run lint`, `npm run typecheck` e `npm test` verdes. Status In Progress → Ready for Review.

## Dev Agent Record

### Agent Model Used
Codex (dev)

### Completion Notes
- `FormField` opera via render prop para não acoplar os átomos a uma API específica e expõe ids/aria prontos para `Input`, `Textarea` e `SelectTrigger`.
- O admin existente foi evoluído, não refeito: `ArrayInput`, `SelectField`, `ModulesBuilder`, `MultiSelectField` e o CRUD genérico agora compartilham a mesma camada semântica.

## QA Results

Pass — encerramento formal em 2026-06-24. Acceptance Criteria fechados, artefatos presentes e sem gap funcional identificado na auditoria atual.
