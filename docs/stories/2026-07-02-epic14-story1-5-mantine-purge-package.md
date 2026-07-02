# Story 14.1.5: Remoção Mantine — Purge package.json e Smoke Tests

## Status
Ready

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
- [ ] Verificação final de imports (AC: 1)
- [ ] package.json purge Mantine (AC: 2)
- [ ] npm install + lock update (AC: 2)
- [ ] Smoke tests (AC: 5)
- [ ] Verificação completa (AC: 1-5)

## File List
- `docs/stories/2026-07-02-epic14-story1-5-mantine-purge-package.md`
- `package.json`
- `package-lock.json`

## PO Validation
2026-07-02 · @po via @aiox-master YOLO · **GO** — última barreira antes Fase 2; smoke tests validam integral removal. Status: Draft → Ready.

## Change Log
- 2026-07-02 - @aiox-master (Orion) - Story criada como prompt Codex (Epic 14 §4.5).

