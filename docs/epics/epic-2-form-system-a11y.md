# Épica 2 — Form System & Acessibilidade Compartilhada

**PRD:** `docs/prd/modernizacao-ui-2026.md`
**Prioridade:** P0 (entra junto com Épica 1 — fundação Big Bang)
**Fonte:** Apple HIG plan Fase 2; plano original Fase 2

---

## Objetivo

Criar a camada `FormField` única (label persistente, hint, erro inline, semântica acessível) e aplicar consistência/a11y uma vez nos átomos que alimentam todas as telas — público **e** admin.

## Estado real (importante)

O **admin já tem** ArrayInput, ModulesBuilder, SelectField, MultiSelect e validação por resource (ver PRD §2.1). Esta épica **NÃO os recria**. Foca no que falta: `FormField` compartilhado, eliminação de placeholder-como-label nos forms públicos, e a11y de Button/Dialog/icon buttons.

---

## Stories propostas (para @sm *draft)

### Story 2.1 — Componente `FormField` reutilizável
- `label` + hint opcional + indicador de obrigatoriedade + erro inline.
- Conexões `id`, `aria-describedby`, `aria-invalid`.
- **Aceite:** formulários reportam erros junto aos campos (S3).

### Story 2.2 — Aplicar `FormField` a Input, Textarea, Select (público)
- Substituir placeholder-como-label por label persistente em `Contact.tsx`, `InCompany.tsx`, `Login.tsx`, `checkout-modal.tsx`.
- Placeholder permanece só como exemplo de preenchimento.
- **Arquivos:** `src/views/public/*`, `src/components/checkout/checkout-modal.tsx`.
- **Aceite:** nenhum form público usa placeholder como rótulo único.

### Story 2.3 — Estados padronizados de Button
- hover, pressed, focus, disabled, loading; destaque proeminente só para ação primária do contexto.
- **Arquivos:** `src/components/ui/button.tsx`.

### Story 2.4 — Nomes acessíveis em icon buttons + alvo 44px
- Editar/excluir/baixar material com nome acessível explícito.
- Alvo 44px em controles customizados.
- **Arquivos:** `src/components/admin/data-table.tsx`.
- **Aceite:** botões só-ícone têm nome acessível (S3).

### Story 2.5 — Padronizar Dialog e Sheet
- Descrição quando necessária, foco inicial, fechamento por teclado, ação primária/cancelamento claros.
- Feedback: toast como confirmação complementar, nunca único local de erro recuperável.
- **Arquivos:** `src/components/ui/dialog.tsx`, `sheet.tsx`.

---

## Critérios de aceite da épica

- [ ] S3 — todos os formulários com label persistente, erro inline, navegação por teclado.
- [ ] Controles compartilhados têm estados e semântica documentados.
- [ ] Erros associados ao campo, não só toast.
- [ ] Admin existente NÃO regrediu (guard de S1/S2).

## Gates

`npm run lint` · `npm run typecheck` · `npm test` · revisão visual · checklist a11y.
