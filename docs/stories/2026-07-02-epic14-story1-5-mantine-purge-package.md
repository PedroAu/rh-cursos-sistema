# Story 14.1.5: Remoção Mantine — Purge package.json e Smoke Tests

## Status
InProgress

## Executor Assignment
executor: "Codex" (@dev delegado)
quality_gate: "@qa" (story 14.1.6 PASS → aprovado este)

## Epic
EPIC 14, Fase 1 — Source: `docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md`
ADR: `docs/architecture/adr-014-redesign-trust-keith.md` · Depende de: 14.1.4 (portals — todas as camadas migradas)

## Complexity Estimate
S — 3 pontos (remover packages; rodar e validar smoke tests).

---

## 📋 Escopo

**IN:**
- `package.json` — remover todas as dependências `@mantine/*` após validação que nenhuma está sendo importada
- `package-lock.json` — atualizado automaticamente após `npm install`
- Testes de smoke da Fase 1 (`tests/epic14-mantine-removal.smoke.spec.ts`, etc.)

**OUT:**
- Deps do provider/notificações (sonner, react-hook-form) — MANTÊM
- Deps de UI (Radix UI, Tailwind, cva, lucide) — MANTÊM
- Deps não-Mantine — MANTÊM

### 🤖 PROMPT CODEX (autossuficiente)

#### Contexto

Projeto Next.js 16. Fase 1: finalizar remoção de Mantine. Stories 14.1.1–14.1.4 completadas (provider, forms, shells, portals); agora é hora de purgar do package.json e validar com smoke tests.

#### Tarefas

1. **Verificação final:** `grep -rn "@mantine" src/ app/` — confirmar NENHUMA importação Mantine restante.
2. **Limpar package.json:** remover TODOS os `@mantine/*` (ex.: `@mantine/core`, `@mantine/form`, `@mantine/hooks`, `@mantine/notifications`, `@mantine/styles`, etc.).
3. **npm install** → gera novo package-lock.json sem Mantine.
4. **Smoke tests:** rodar `tests/epic14-mantine-removal.smoke.spec.ts` (Playwright) validando:
   - Home renderiza sem erro
   - Rota admin renderiza sem erro
   - Form contact renderiza e submete (validação)
   - Login carrega (sem submit, pois requer creds)
   - In-company carrega
5. **Lint/typecheck/test/build** — todos verdes.

#### ACs

1. `grep -rn "@mantine" src/ app/` → vazio (nenhuma importação restante).
2. `grep "@mantine" package.json` → vazio (nenhuma dep Mantine).
3. `npm run lint && npm run typecheck && npm run test:unit` → verdes.
4. `npm run build` → sucesso.
5. Smoke tests (`npm run test:e2e`) passam em desktop viewport (1280x720).

### Ao concluir
Atualizar esta story: checkboxes, status → InReview, Change Log.

---

## Tasks / Subtasks
- [x] Verificação final de imports (AC: 1)
- [x] package.json purge Mantine (AC: 2)
- [x] npm install + lock update (AC: 2)
- [ ] Smoke tests (AC: 5)
- [ ] Verificação completa (AC: 1-5)

## Dev Notes

Purge Mantine concluído na árvore real do app:
- `app/layout.tsx` não carrega mais `@mantine/core/styles.css`
- `src/components/providers/mantine-provider.tsx` virou pass-through sem dependência Mantine
- `src/theme/mantine-theme.ts` removido
- páginas/views restantes que ainda importavam Mantine foram reescritas com primitivas locais (`Button`, `Card`, `Input`, `Badge`, `Table`) e Tailwind:
  - `src/views/public/About.tsx`
  - `src/views/public/Agenda.tsx`
  - `src/views/public/Courses.tsx`
  - `src/features/admin/dashboard/admin-dashboard-page.tsx`

Validações concluídas:
- `rg -n "@mantine" src app` → sem matches
- `rg -n "\"@mantine/" package.json package-lock.json` → sem matches
- `npm run lint` → verde
- `npm run typecheck` → verde
- `npm run test:unit` → verde (394 testes)
- `npm run build` → verde
- `tests/epic14-mantine-removal.smoke.spec.ts` → verde dentro de `npm run test:e2e:smoke`

Bloqueador atual para fechar a story:
- `npm run test:e2e:smoke` continua falhando no repositório por causas fora do escopo direto da purge:
  - `tests/a11y.spec.ts` em múltiplas rotas públicas (contraste/label)
  - `tests/epic5-search-motion.spec.ts`
  - `tests/quote-modal.e2e.spec.ts`
  - `tests/route-auth.spec.ts`
  - `tests/ui-governance.spec.ts`

Como o AC 5 pede a suite de smoke passando, a story permanece `InProgress` apesar da remoção de Mantine já estar concluída.

## File List
- `docs/stories/2026-07-02-epic14-story1-5-mantine-purge-package.md`
- `app/layout.tsx`
- `package.json`
- `package-lock.json`
- `src/components/providers/mantine-provider.tsx`
- `src/features/admin/dashboard/admin-dashboard-page.tsx`
- `src/views/public/About.tsx`
- `src/views/public/Agenda.tsx`
- `src/views/public/Courses.tsx`

## PO Validation
2026-07-02 · @po via @aiox-master YOLO · **GO** — última barreira antes Fase 2; smoke tests validam integral removal. Status: Draft → Ready.

## Change Log
- 2026-07-02 - @aiox-master (Orion) - Story criada como prompt Codex (Epic 14 §4.5).
- 2026-07-02 - @dev (Dex) - Purge Mantine concluído: removidas deps `@mantine/*` de `package.json`/`package-lock.json`, eliminados imports restantes em `src/` e `app/`, `src/theme/mantine-theme.ts` removido, provider convertido para pass-through. `npm run lint`, `npm run typecheck`, `npm run test:unit` (394 testes) e `npm run build` verdes. `tests/epic14-mantine-removal.smoke.spec.ts` verde, mas `npm run test:e2e:smoke` ainda falha por testes repo-wide fora do escopo imediato; status mantido em `InProgress`.
