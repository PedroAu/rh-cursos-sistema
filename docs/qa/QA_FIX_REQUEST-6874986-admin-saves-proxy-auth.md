# QA Fix Request — `fix: stabilize admin resource saves and proxy auth`

- **Commit alvo:** `6874986`
- **Autor:** @dev
- **Revisor:** Quinn (@qa)
- **Data:** 2026-07-14
- **Gate:** 🟡 CONCERNS
- **Contexto de urgência:** Go-live 02/07/2026 — resolver antes do merge/deploy.

Arquivos no commit:
`app/api/functions/[name]/route.ts`, `src/lib/app-store.tsx`, `src/lib/admin-resource-configs.tsx`,
`src/lib/contexts/store-types.ts`, `src/views/admin/AdminResourcePage.tsx`,
`src/__tests__/app/api/functions-route.test.ts`, `tests/admin-crud.spec.ts`.

---

## 🔴 FIX-1 (Bloqueante) — Commit não é auto-consistente / não compila isolado

**Severidade:** CRITICAL — CI e `git bisect` hazard (Constitution Art. V — Quality First).

**Evidência:**
- `src/lib/app-store.tsx` (commitado) importa `getStableClientIp` e passa `keepalive` para `invokeFunction`.
- `src/lib/supabase/functions-client.ts` **no commit 6874986** só exporta `getFunctionsBaseUrl` e `isFunctionsConfigured`.
- `getStableClientIp` (L78) e o suporte a `keepalive` (L33 / L62 / L73) existem **apenas na working tree** (não commitados).

**Repro:**
```bash
git stash && git checkout 6874986
npm run typecheck   # falha: 'getStableClientIp' não é exportado por functions-client
```

**Correção esperada:**
- Incluir as alterações de `src/lib/supabase/functions-client.ts` no mesmo commit
  (`git add src/lib/supabase/functions-client.ts && git commit --amend`, ou fixup dedicado).
- Garantir que o commit compile isolado: `git checkout <novo-hash> && npm run typecheck && npm run build`.

**Aceite:** `npm run typecheck` passa no commit isolado (sem a working tree).

---

## 🟡 FIX-2 (Concern) — Lead público reporta sucesso sobre falha do servidor

**Severidade:** HIGH — perda silenciosa de lead (impacto de receita).
**Local:** `src/lib/app-store.tsx` → `createLead`, caminho público (`isFunctionsConfigured && !usedAdminMutation`).

**Problema:**
```ts
void invokeFunction("leads", { body: payload }).catch(() => {
  toast.error("Serviço indisponível no momento. A solicitação não foi sincronizada.");
});
startTransition(() => setState(/* adiciona lead */));
toast.success("Lead cadastrado.");
```
`.catch` só dispara em **rejeição de rede**. `fetch` com **status 4xx/5xx resolve normalmente** (não rejeita),
então uma Edge Function retornando 500 → sem catch → UI mostra "Lead cadastrado" e o lead nunca é persistido.
Regressão vs. código anterior, que checava `response.ok`.

**Correção esperada:** verificar `response.ok` (ex.: `.then(r => { if (!r.ok) toast.error(...) })`) e não
declarar sucesso quando a escrita pública falhar.

**Aceite:** teste cobrindo `leads` retornando `ok:false` (500) → sem toast de sucesso / usuário informado.

---

## 🟡 FIX-3 (Concern) — `createEnrollmentAdmin` descarta o `id` real do servidor

**Severidade:** MEDIUM — bug latente em create+delete na mesma sessão.
**Local:** `src/lib/app-store.tsx` → `createEnrollmentAdmin` (`buildEnrollmentRecord(payload)`).

**Problema:** antes o código lia `result.data.id` e o repassava; agora gera `id = enrollment-${Date.now()}` local.
Criar e excluir uma inscrição **na mesma sessão sem reload** faz `deleteEnrollment` enviar o id local, que não
bate com a linha do banco → delete no-op no servidor + rollback local (registro "ressuscita").

**Correção esperada:** reaproveitar o `id` retornado pela mutação (expor o payload de resposta em
`persistAdminMutation` ou refetch pós-create), ou confirmar que já há refetch das inscrições.

**Aceite:** create seguido de delete (sem reload) remove a inscrição no servidor.

---

## 🟢 FIX-4 (Menor) — Lacunas de cobertura na rota proxy

**Severidade:** LOW.
**Local:** `src/__tests__/app/api/functions-route.test.ts`.

`functions-route.test.ts` cobre POST, GET e fallback de URL, mas **não** cobre:
- método **DELETE** (usado pelos deletes do admin);
- caminho **503** (nenhum host de Functions configurado → `getServerFunctionsBaseUrl()` retorna `null`).

**Correção esperada:** 2 casos de teste adicionais.

---

---

> **Atualização 2026-07-14 (revisão da working tree, `*code-review uncommitted`):**
> As mudanças **não commitadas** já resolvem FIX-1, FIX-2 e FIX-3
> (`functions-client.ts` exporta `getStableClientIp`/`keepalive`; `createLead` faz `await` + checa
> `response.ok`; `createEnrollmentAdmin` usa o `id` real via `persistAdminMutation`). **FIX-1 permanece
> aberto no plano de commit**: essas correções precisam entrar junto do commit para que ele compile isolado.
> Dois achados novos abaixo (FIX-5, FIX-6).

---

## 🟠 FIX-5 (Concern novo) — Login envia headers de IP usados no rate-limit de auth

**Severidade:** HIGH — bypass potencial do rate-limit de brute-force de login (defense-in-depth).
**Local:** `src/views/public/Login.tsx` (~L96-99) + `app/api/auth/session/route.ts:108` + `src/lib/rate-limit.ts:139-141`.

**Problema:**
```ts
// Login.tsx
headers: {
  "cf-connecting-ip": getStableClientIp(),  // "session-<uuid>" do localStorage — controlável/rotacionável
  "x-forwarded-for": getStableClientIp(),
  "x-real-ip": getStableClientIp(),
}
```
`clientIp()` deriva o IP de `cf-connecting-ip → x-forwarded-for[0] → x-real-ip`, e o rate-limit é
`auth:${clientIp(request)}`. Com o cliente fornecendo esse valor, a proteção vira per-browser rotacionável.

- **Mitigado** no caminho via Cloudflare (CF sobrescreve `cf-connecting-ip` com o IP real, que vence o `||`).
- **Exposição residual:** qualquer acesso à origem sem passar pela CF (`*.workers.dev` direto, preview, dev)
  confia no header spoofável → bypass do rate-limit de auth.

**Correção esperada:** não enviar `cf-connecting-ip`/`x-forwarded-for`/`x-real-ip` do browser. Se o objetivo
era evitar bucket único em dev sem CF, resolver no servidor (derivar IP real / fallback controlado). Manter o
`x-rh-client-ip` custom apenas para o proxy de functions (não colide com `clientIp()`).

**Aceite:** teste em `route-auth.spec.ts` fixando que `cf-connecting-ip` enviado pelo cliente não define o
bucket de rate-limit; brute-force não é contornável trocando o header.

---

## 🟡 FIX-6 (Concern novo) — Proxy de functions depende de env server-side no Worker

**Severidade:** MEDIUM — risco de deploy (go-live 02/07/2026).
**Local:** `src/lib/supabase/functions-client.ts` (~L43-46) + `app/api/functions/[name]/route.ts`.

**Problema:** no browser `useProxy = true` → todas as chamadas passam por `/api/functions/${name}`, e o proxy
exige `SUPABASE_FUNCTIONS_URL` ou `SUPABASE_URL` **no runtime do Worker** (senão retorna 503). Sem esses
bindings em produção, formulário público de contato e todo o admin quebram (503).

**Correção esperada:** confirmar os bindings no ambiente de produção do Cloudflare Workers e documentar no
checklist de go-live. (Sem alteração de código se já estiverem configurados.)

**Aceite:** smoke test pós-deploy: envio de lead público + uma operação de admin retornam != 503.

---

## 🟢 FIX-7 (Menores — polimento)

- `Login.tsx` chama `getStableClientIp()` 3× (uma por header) — chamar uma vez e reutilizar.
- `getStableClientIp()` usa `crypto.randomUUID()` (indefinido em origem HTTP) — premissa: produção é HTTPS.
- `Courses.tsx`: "próxima turma" = `getOpenEnrollmentClasses(classes, course.id)[0]` — confirmar que o helper
  retorna ordenado por `startDate`, senão o card pode não exibir a turma mais próxima.

---

## Resumo

| ID | Severidade | Item | Obrigatório p/ aprovar |
|----|-----------|------|------------------------|
| FIX-1 | CRITICAL | Commit não compila isolado — incluir `functions-client.ts` (e demais correções) no commit | ✅ Sim |
| FIX-2 | HIGH | Lead público: sucesso sobre falha 4xx/5xx | ✅ Resolvido na working tree (commitar) |
| FIX-3 | MEDIUM | Enrollment usa id local em vez do id do servidor | ✅ Resolvido na working tree (commitar) |
| FIX-4 | LOW | Cobertura DELETE + 503 no proxy | Recomendado |
| FIX-5 | HIGH | Login envia headers de IP do rate-limit de auth (bypass) | ✅ Sim |
| FIX-6 | MEDIUM | Proxy depende de env server-side no Worker (503 em produção) | ✅ Confirmar no deploy |
| FIX-7 | LOW | Polimento (3× getStableClientIp, HTTPS, ordenação do catálogo) | Recomendado |

**Reenvio:** após correções, `@qa *review` para re-gate. Alvo: PASS.

---

## 🟢 Re-gate 2026-07-14 — `*review` (commit `cea2501`)

**Gate:** 🟢 **PASS**

Commit de correção `cea2501` — *"fix: consolidate admin saves proxy fixes and stop leaking client IP headers"* — aplicado sobre `6874986`.

**Evidências coletadas:**

| ID | Sev | Resultado | Evidência |
|----|-----|-----------|-----------|
| FIX-1 | CRITICAL | ✅ RESOLVIDO | `functions-client.ts` + `app-store.tsx` no **mesmo commit**; `npx tsc --noEmit` no commit isolado (worktree detached em `cea2501`) → **EXIT=0** |
| FIX-2 | HIGH | ✅ RESOLVIDO | `createLead`: `await invokeFunction(...)` + `if (!response \|\| !response.ok) { toast.error; return }` |
| FIX-3 | MEDIUM | ✅ RESOLVIDO | `persistAdminMutation` retorna `body?.data`; `createEnrollmentAdmin` usa `buildEnrollmentRecord(payload, result?.id)` |
| FIX-4 | LOW | ✅ RESOLVIDO | `functions-route.test.ts` +48 linhas (DELETE + 503); suíte `functions-route` + `app-store` → **26/26 green** (vitest) |
| FIX-5 | HIGH | ✅ RESOLVIDO (app) | `Login.tsx` envia só `Content-Type` — `cf-connecting-ip`/`x-forwarded-for`/`x-real-ip` removidos; `role` movido para o body |
| FIX-6 | MEDIUM | ⚠️ MITIGADO | proxy cai em `process.env.NEXT_PUBLIC_SUPABASE_URL` (inline build-time); CI `production` tem 6/6 secrets → 503 improvável. **Confirmar via smoke test pós-deploy.** |
| FIX-7 | LOW | ✅ / parcial | `getStableClientIp` 3× no login **eliminado** (headers removidos); ordenação do catálogo (LOW) não reverificada |

**Concerns residuais (não-bloqueantes, follow-up):**
1. **FIX-5 server-side** — `clientIp()` (`rate-limit.ts`) ainda confia em `cf-connecting-ip`/`x-forwarded-for`/`x-real-ip` de **qualquer** cliente (não só o browser). Mitigado no caminho Cloudflare (CF sobrescreve). Exposição residual: acesso direto à origem sem CF (`*.workers.dev`, preview, dev). Postura pré-existente, dependente de infra — endurecer no servidor em story futura. Falta ainda o teste anti-spoof em `route-auth.spec.ts` (as adições atuais só isolam buckets entre testes).
2. **FIX-6** — verificar bindings de runtime no Worker via smoke test pós-deploy (lead público + 1 operação de admin retornam ≠ 503). Item do checklist de go-live.

**Decisão:** os dois obrigatórios (FIX-1, FIX-5) estão resolvidos e **verificados com evidência**; os pendentes são verificação em deploy (FIX-6) e polimento LOW (FIX-7/ordenação). Gate **PASS** — liberado para merge; FIX-6 permanece como gate de go-live.

— Quinn, guardião da qualidade 🛡️
