# Arquitetura: Migração Static Export → Runtime SSR

**Autor:** @architect (Aria) — 2026-06-09
**Motivação:** habilitar área do aluno + certificados (geração dinâmica, proteção server-side de conteúdo).
**Decisão de produto:** [[decisao-migracao-runtime-ssr]] (memória).

---

## 1. Estado real descoberto (não era o esperado)

A investigação revelou que **a fundação SSR já foi implementada** — não é trabalho do zero.

### Já PRONTO (story `admin-ssr-auth-foundation`, Status: Done, no `stash@{0}`)

| Componente | Arquivo | Natureza |
|---|---|---|
| Remoção de `output: 'export'` | `next.config.mjs` | modificação |
| Rota interna de sessão SSR | `app/api/auth/session/route.ts` | **novo** (87 linhas) |
| Guard server-side de `/admin` (antes do render) | `app/admin/layout.tsx` | **novo** |
| Helper de sessão server | `src/lib/server-session.ts` | **novo** |
| Sessão inicial no store/shell | `src/lib/app-store.tsx`, `src/components/next-page-shell.tsx` | modificação |
| Token HMAC preservado (compat. Edge Functions) | `src/lib/supabase/session-token.ts` | modificação |
| Testes E2E adaptados p/ SSR | `tests/route-auth.spec.ts`, `tests/login-errors.spec.ts` | modificação |

Gates da story passaram (lint, typecheck, test) no contexto original.

### Gap REAL (o épico verdadeiro) — Out of Scope explícito daquela story

- ❌ Deploy produtivo: `deploy-frontend.yml` ainda faz `pages deploy out` (estático). **Precisa virar build OpenNext + deploy de Worker SSR.**
- ❌ `ci.yml` testa export (`serve out`) — precisa testar runtime (`next start`).
- ❌ Decisão: mutações admin em Edge Functions vs Route Handlers do Next.

---

## 2. Arquitetura-alvo (2 camadas)

```
┌─────────────────────────────────────────────┐
│ Cloudflare Worker (OpenNext) — RUNTIME SSR    │  ← Camada 2 (NOVO)
│  • SSR das páginas, guard server-side         │
│  • /api/auth/session (login/logout)           │
│  • /aluno/*, /certificado/[id] (dinâmico)     │
└───────────────┬───────────────────────────────┘
                │ token HMAC (preservado)
┌───────────────▼───────────────────────────────┐
│ Supabase Edge Functions (mantidas)            │  ← backend de dados
│  auth-session, admin-resources, enrollments,  │
│  leads (+ futura: certificates)               │
└───────────────┬───────────────────────────────┘
                │
┌───────────────▼───────────────────────────────┐
│ Supabase DB                                    │
└────────────────────────────────────────────────┘
```

**Decisão arquitetural (recomendada):** manter mutações em **Edge Functions** nesta fase. O token HMAC já integra; migrar para Route Handlers agora adiciona risco sem ganho imediato. Reavaliar quando a área do aluno exigir transações multi-step.

---

## 3. Colisão a resolver ANTES de codar (crítico)

O `stash@{0}` está **contaminado** — mistura 3 origens porque foi tirado da branch antiga `feature/1.1` com tudo no working tree:

1. **SSR genuíno** (queremos) — rota de sessão, layout guard, server-session.
2. **Story 1.1 estática** (já está no commit `dc31c39`) — baselines, contraste, story md. **Conflitam** com a direção SSR.
3. **`src/features/admin/*`** — dependem do refactor feature-first que já está em `origin/main`.

`origin/main` (`841a3a8`) **não contém** o SSR ainda.

### Sequência segura (decidida: "SSR primeiro")

1. **Descontaminar:** extrair do stash APENAS os arquivos SSR (lista da seção 1), descartando os de baseline/1.1 e os que já estão em `origin/main`.
2. **Branch SSR** a partir de `origin/main`; aplicar só o SSR; revalidar gates (`next start`, não `serve out`). Commitar como `admin-ssr-auth-foundation` (já Done).
3. **Épico de deploy runtime** (@pm fatia): trocar `deploy-frontend.yml` (OpenNext/Worker), `ci.yml`, env bindings runtime, smoke test de produção.
4. **Rebase da Story 1.1 sobre o mundo SSR:** o teste `/admin` volta a **307** (server-side) — o fix estático aplicado pelo @dev é **revertido**. Baseline recapturado no SSR.
5. **Só então:** stories de área do aluno + certificados, apoiadas na base SSR.

---

## 4. Impacto na Story 1.1

A 1.1 fica **On Hold** até passo 4. O fix estático do @dev (alinhar `/admin` a 200) é descartado — no destino SSR o `/admin` é 307 server-side, como o stash já implementa. O baseline (a11y/contraste/screenshots) é específico do modelo de render e será recapturado no SSR.

---

## 5. Riscos

| Risco | Mitigação |
|---|---|
| Deploy SSR quebra produção (Worker mal configurado) | Smoke test em preview do Worker antes de apontar produção; rollback p/ `pages deploy out` documentado |
| Cold start / custo do Worker SSR | Medir; páginas públicas podem usar ISR/cache de borda |
| Stash contaminado aplicado cru | Descontaminação cirúrgica (seção 3) antes de qualquer commit |
| Edge Functions vs runtime: duplicação de auth | Manter HMAC como contrato único; não duplicar lógica de sessão |
| `origin/main` evoluindo durante a migração | Épico em branch própria, rebases frequentes |
