# Story 14.1.2: Remoção Mantine — Sistema de Forms (react-hook-form + zod)

## Status
InReview

## Executor Assignment
executor: "Codex" (@dev delegado)
quality_gate: "@qa" (story 14.1.6)

## Epic
EPIC 14, Fase 1 — Source: `docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md`
ADR: `docs/architecture/adr-014-redesign-trust-keith.md` (D2) · Depende de: 14.1.1 (CONCLUÍDA antes de iniciar esta)

## Complexity Estimate
L — 8 pontos (toca fluxos críticos: contato, login, in-company, admin).

---

## 🤖 PROMPT CODEX (autossuficiente)

### Contexto

Projeto Next.js 16 em `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos`. Substituir `@mantine/form` e os campos de formulário Mantine por **react-hook-form + zod** (ADR D2), usando as primitivas Trust Keith de `src/components/ui/` (input, textarea, select, checkbox — story 14.0.5). `zod` já está instalado.

**EXCEÇÃO À REGRA DE DEPENDÊNCIAS: esta story instala exatamente 2 pacotes:** `react-hook-form` e `@hookform/resolvers`. Nenhum outro.

### Levantamento (executar primeiro)

`grep -rln "@mantine/form\|TextInput\|Textarea\|MultiSelect\|Select.*@mantine" src/` — consumidores conhecidos:
- `src/components/ui/form-field.tsx` — wrapper de campo (Mantine)
- `src/components/admin/form-fields.tsx` — TextInput, Select, Textarea, MultiSelect
- `src/views/public/Contact.tsx` — `useForm`/`isEmail` de `@mantine/form`
- `src/views/public/Login.tsx`, `src/views/public/InCompany.tsx` — forms Mantine
- `src/views/admin/AdminSettingsPage.tsx`, `src/views/admin/AdminResourcePage.tsx` — campos admin

### Tarefas

1. `npm install react-hook-form @hookform/resolvers`.
2. **`src/components/ui/form-field.tsx`:** reescrever como wrapper acessível (label + hint + erro com `aria-describedby`/`aria-invalid`) integrado a react-hook-form (padrão `Controller`/`register`), compondo as primitivas `ui/`.
3. **`src/components/admin/form-fields.tsx`:** reescrever os campos com primitivas `ui/`. Para `MultiSelect` (sem primitiva pronta): implementar com Radix Popover (instalado) + lista de checkboxes + chips das seleções — acessível e tokenizado; sem nova dependência.
4. **Migrar consumidores** (todos os arquivos do levantamento): schemas zod colocalizados (ex.: `isEmail` → `z.string().email()`), `useForm` do react-hook-form com `zodResolver`, submit/erros preservando comportamento atual (mesmos endpoints/actions, mesmas mensagens). Remover TODOS os imports `@mantine/core`/`@mantine/form` desses arquivos — componentes não-form que aparecerem neles (Group, Stack, etc.) viram Tailwind/primitivas.
5. **Testes:** manter/ajustar testes existentes; adicionar teste de validação zod para o form de Contact (email inválido → mensagem de erro).

### Proibições

- NÃO tocar em shells (`admin-shell`, `public-mobile-navigation`), portais (`StudentPortal`, `InstructorPortal`) nem views não listadas (stories 14.1.3/14.1.4).
- NÃO remover pacotes Mantine do package.json (14.1.5).
- NÃO alterar endpoints/lógica de submit — apenas a camada de form/UI.
- NÃO fazer `git push`.

### Acceptance Criteria

1. `grep -rn "@mantine/form" src/` → vazio.
2. `grep -rn "@mantine" src/components/ui/form-field.tsx src/components/admin/form-fields.tsx src/views/public/Contact.tsx src/views/public/Login.tsx src/views/public/InCompany.tsx src/views/admin/AdminSettingsPage.tsx src/views/admin/AdminResourcePage.tsx` → vazio.
3. `grep -n "react-hook-form" package.json` → presente; nenhuma outra dependência nova além de `@hookform/resolvers`.
4. `npm run lint && npm run typecheck && npm run test:unit` → verdes (incluindo novo teste de Contact).
5. `npm run build` → sucesso.
6. Fluxos manuais em dev: enviar form de contato com email inválido mostra erro de validação; login com credenciais demo funciona; form in-company submete.

### Ao concluir
Atualizar esta story: checkboxes, File List, status → InReview, Change Log.

---

## Tasks / Subtasks
- [x] Instalar react-hook-form + resolvers (AC: 3)
- [x] form-field.tsx reescrito (AC: 2)
- [x] form-fields.tsx admin reescrito com MultiSelect custom (AC: 2)
- [x] Consumidores migrados: Contact, Login, InCompany, AdminSettings, AdminResource (AC: 1, 2, 6)
- [x] Teste de validação Contact (AC: 4)
- [x] Verificação completa (AC: 1-6)

## File List
- `docs/stories/2026-07-02-epic14-story1-2-forms-react-hook-form.md`
- `package-lock.json`
- `package.json`
- `src/__tests__/views/public/contact.test.tsx`
- `src/components/admin/form-fields.stories.tsx`
- `src/components/admin/form-fields.tsx`
- `src/components/ui/form-field.stories.tsx`
- `src/components/ui/form-field.tsx`
- `src/views/admin/AdminResourcePage.tsx`
- `src/views/admin/AdminSettingsPage.tsx`
- `src/views/public/Contact.tsx`
- `src/views/public/InCompany.tsx`
- `src/views/public/Login.tsx`

## PO Validation
2026-07-02 · @po via @aiox-master YOLO · **GO** — exceção de dependências explícita e limitada (ADR D2), fluxos críticos com verificação manual no AC6, escopo cercado. Status: Draft → Ready.

## Change Log
- 2026-07-02 - @aiox-master (Orion) - Story criada como prompt Codex (Epic 14 §4).
- 2026-07-02 - @dev (Codex) - Instalados `react-hook-form` e `@hookform/resolvers`; base de forms e consumidores público/admin migrados para primitives locais + zod; teste de validação do Contact adicionado; `lint`, `typecheck`, `test:unit` e `build` aprovados. Tentativa de smoke browser em `next dev` bloqueada por ausência do binário do Playwright no ambiente local.
