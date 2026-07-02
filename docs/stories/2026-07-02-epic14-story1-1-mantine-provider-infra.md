# Story 14.1.1: Remoção Mantine — Provider e Infraestrutura

## Status
Ready

## Executor Assignment
executor: "Codex" (@dev delegado)
quality_gate: "@qa" (story 14.1.6)

## Epic
EPIC 14, Fase 1 — Source: `docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md`
ADR: `docs/architecture/adr-014-redesign-trust-keith.md` (D1, D3, D4) · Depende de: 14.0.5 (componentes — CONCLUÍDA)

## Complexity Estimate
S — 3 pontos.

---

## 🤖 PROMPT CODEX (autossuficiente)

### Contexto

Projeto Next.js 16 em `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos`. Fase 1 do Epic 14: remover Mantine. As primitivas novas (Trust Keith RH) já existem em `src/components/ui/` (button, badge, card, input, dialog, etc. — story 14.0.5). `sonner` já está instalado.

Esta story remove a INFRAESTRUTURA Mantine (provider, tema, componentes de infra). As demais camadas (forms, shells, views) são stories seguintes — NÃO as toque.

### Tarefas

1. **Provider:** localizar onde `src/components/providers/mantine-provider.tsx` é montado (provavelmente `app/layout.tsx` ou provider raiz) e removê-lo da árvore. Se `@mantine/notifications` (`Notifications`) estiver montado, substituir por `<Toaster />` do `sonner` (verificar se já existe). Deletar `src/components/providers/mantine-provider.tsx` e `src/theme/mantine-theme.ts`.
2. **Hook:** criar `src/hooks/use-disclosure.ts` (`{ opened, open, close, toggle }`, tipado) — substitui `useDisclosure` de `@mantine/hooks`. NÃO migrar os consumidores ainda (stories 14.1.3/14.1.4), apenas criar o hook.
3. **`src/components/error-boundary.tsx`:** reescrever a UI de fallback sem Mantine (usar primitivas `ui/` + Tailwind tokens tk). Manter comportamento/exports.
4. **`src/features/public-shell/components/whatsapp-support.tsx`:** remover o import Mantine substituindo pelo equivalente (primitiva `ui/` ou markup + tokens). Manter comportamento.
5. **`src/design-tokens/mantine-tokens.css`:** verificar consumidores restantes (`grep -rn "mantine-color" src/ tailwind.config.ts`). Onde `tokens.tailwind.js`/`tailwind.config.ts` referenciam `--mantine-color-*` (escalas `primary.0-9`, `secondary.*`), re-apontar para tokens `--tk-*`/`--rh-*` equivalentes (escala pode colapsar para o valor mais próximo — ex.: primary.5-9 → `var(--tk-brand)`/`var(--tk-brand-hover)`). Se após isso nada mais consumir o arquivo, deletar `mantine-tokens.css` e seu import em `globals.css`; senão, documentar o que restou no Change Log.
6. **Notificações:** `grep -rn "@mantine/notifications\|notifications.show" src/` — migrar chamadas para `toast.*` do sonner.

### Proibições

- NÃO tocar em: `src/views/**`, `src/features/admin-shell/**`, `src/features/public-shell/components/public-mobile-navigation.tsx`, `src/components/ui/form-field.tsx`, `src/components/admin/form-fields.tsx` (stories 14.1.2–14.1.4) — EXCETO se a remoção do provider quebrar a compilação de algum deles; nesse caso, correção mínima e registrar no Change Log.
- NÃO remover pacotes do `package.json` (isso é a 14.1.5).
- NÃO adicionar dependências. NÃO fazer `git push`.

### Acceptance Criteria

1. `grep -rn "@mantine" app/ src/components/providers/ src/components/error-boundary.tsx src/features/public-shell/components/whatsapp-support.tsx` → vazio.
2. `ls src/theme/mantine-theme.ts src/components/providers/mantine-provider.tsx` → não existem.
3. `test -f src/hooks/use-disclosure.ts` → existe.
4. `npm run lint && npm run typecheck && npm run test:unit` → verdes.
5. `npm run build` → sucesso.
6. App em dev renderiza home e uma rota admin sem erro de runtime no console (provider ausente não pode quebrar).

### Ao concluir
Atualizar esta story: checkboxes, File List, status → InReview, Change Log.

---

## Tasks / Subtasks
- [ ] Provider removido + sonner Toaster (AC: 1, 2, 6)
- [ ] use-disclosure criado (AC: 3)
- [ ] error-boundary sem Mantine (AC: 1)
- [ ] whatsapp-support sem Mantine (AC: 1)
- [ ] mantine-tokens.css tratado (AC: 4)
- [ ] Verificação completa (AC: 1-6)

## File List
- `docs/stories/2026-07-02-epic14-story1-1-mantine-provider-infra.md`

## PO Validation
2026-07-02 · @po via @aiox-master YOLO · **GO** — escopo cercado com exceção documentada, ACs por comando, dependência 14.0.5 concluída. Status: Draft → Ready.

## Change Log
- 2026-07-02 - @aiox-master (Orion) - Story criada como prompt Codex (Epic 14 §4).
