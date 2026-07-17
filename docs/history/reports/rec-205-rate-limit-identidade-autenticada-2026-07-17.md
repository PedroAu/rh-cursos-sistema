# Relatório de evidência — REC-205: Expandir rate limiting para identidade autenticada

- **Data:** 2026-07-17
- **Story:** [REC-205](../../stories/2026-07-17-rec-205-rate-limit-identidade-autenticada.md)
- **Épica:** [Épica 17 — Recuperação SEV-0](../../epics/epic-17-recuperacao-sev0-seguranca-integridade.md), Onda 3
- **ADR:** [ADR-016](../../architecture/adr-016-identidade-bff-rec201.md) (D5)
- **Executor:** @dev (Dex) · claude-opus-4-8 (executor)
- **Depende de:** REC-107 (Done), REC-202 (Done)

## 1. Objetivo e escopo entregue

Estender **exclusivamente a composição da chave** de rate limit da inscrição pública para, **opcionalmente**, incluir um identificador do usuário lido via `readSSRSession` (REC-202) quando existir uma sessão SSR ativa — tornando o bucket mais específico. Requisições anônimas permanecem com comportamento observável byte-idêntico ao de REC-107. **Nenhuma decisão de autorização** foi introduzida; REC-203 não foi consumida.

## 2. Mudanças de código

| Arquivo | Natureza | Descrição |
|---|---|---|
| `src/lib/rate-limit.ts` | Modificado | Nova função pura `buildRateLimitKey(scope, clientIdentifier, userIdentifier?)`. Anônimo → `${scope}:${clientIdentifier}` (idêntico ao formato REC-107). Com usuário → `${scope}:${clientIdentifier}:user:${userIdentifier}`. `null`/`undefined`/`""` = anônimo. |
| `app/api/enrollments/route.ts` | Modificado | `readRateLimitUserIdentity()` best-effort (short-circuit se `!isSupabaseSsrConfigured`; `try/catch` → `null`; hash SHA-256/16-hex do e-mail; adaptador de cookies somente-leitura com `setAll` no-op). Chave montada via `buildRateLimitKey("enrollment", clientIp(request), userIdentifier)`. |
| `src/__tests__/lib/rate-limit.test.ts` | Modificado | 6 casos novos de `buildRateLimitKey` (anônimo inalterado; `undefined`/`null`/`""`; mais específico; buckets separados por usuário no mesmo IP). |
| `src/__tests__/app/api/enrollments-route.test.ts` | Modificado | Mock de `@/lib/rate-limit` expõe `buildRateLimitKey`; mock de `@/lib/supabase/session` com `isSupabaseSsrConfigured: false` mantém o caminho anônimo dos testes de REC-107. |

## 3. Verificação executada

| Comando | Resultado |
|---|---|
| `npm run lint` | 0 erros |
| `npm run typecheck` (`next typegen && tsc --noEmit`) | OK — "Types generated successfully", sem erros de tipo |
| `npx vitest run` | **638 passed (638), 59 files** |

### Contagem de testes antes/depois

| Momento | Testes | Files |
|---|---|---|
| Antes de REC-205 (baseline REC-203) | 632 | 59 |
| Depois de REC-205 | 638 | 59 |
| Delta | +6 (novos casos de `buildRateLimitKey`) | 0 |

Zero regressão: nenhum teste pré-existente falhou. Observação de processo: a primeira execução de `npx vitest run` acusou 6 falhas nos testes de REC-107 (`enrollments-route.test.ts`) porque o mock de `@/lib/rate-limit` ainda não expunha `buildRateLimitKey` e o novo import de `@/lib/supabase/session` não estava mockado. Corrigido no próprio teste (mock atualizado, SSR forçado a não configurado). Reexecução → 638/638, sem alterar o comportamento verificado por esses testes (caminho anônimo).

## 4. Verificação independente de segurança (git/grep)

### 4.1 Arquivos de auth HMAC de produção — INTOCADOS

```
$ git status --short -- src/lib/auth.ts \
    supabase/functions/_shared/auth.ts \
    app/api/auth/session/route.ts
(sem saída)
```

Nenhum dos três arquivos aparece no `git status` → não modificados. O HMAC continua sendo a única autoridade real de autorização em produção até REC-204 (cutover, ainda não autorizado).

### 4.2 REC-203 (autorização server-side) — NÃO CONSUMIDA

```
$ grep -c "resolveServerRole\|requireServerRole\|authorize" app/api/enrollments/route.ts
0

$ git status --short -- src/lib/supabase/authorize.ts
?? src/lib/supabase/authorize.ts
```

Zero referências a `resolveServerRole`/`requireServerRole`/`authorize` na rota de inscrição. `authorize.ts` aparece apenas como **untracked** (arquivo pré-existente de REC-203, não modificado por REC-205). A inclusão do usuário na chave é puramente granularidade de bucket — não é decisão de autorização.

### 4.3 REC-202 — apenas importado/lido

`src/lib/supabase/session.ts` foi importado (`readSSRSession`, `createSupabaseSSRClient`, `isSupabaseSsrConfigured`, `type SsrCookieAdapter`) e não modificado (permanece untracked, inalterado por esta story).

### 4.4 Edge Function Deno — fora do escopo

`supabase/functions/enrollments/index.ts` não foi tocado: `readSSRSession` é o caminho SSR Next.js (Node), não o runtime Deno da Edge Function.

## 5. Comportamento observável para anônimos — byte-idêntico

- Sem sessão SSR, `readRateLimitUserIdentity()` retorna `null` (short-circuit por `!isSupabaseSsrConfigured` ou ausência de sessão ativa).
- `buildRateLimitKey("enrollment", clientIp(request), null)` → `enrollment:<ip>`, a mesma string literal montada por REC-107 (`enrollment:${clientIp(request)}`).
- Limite (`rateLimitConfigs.enrollment`), respostas (201 / 400 / 413 / 429 / 500 / 503) e headers permanecem inalterados.
- Coberto por teste unitário dedicado (`buildRateLimitKey('enrollment', '192.0.2.44') === 'enrollment:192.0.2.44'`) e pelos testes de REC-107, que rodam com SSR não configurado.

## 6. Considerações de segurança (NFR-04)

- **Sem PII persistida:** o identificador do usuário é `SHA-256(email)` truncado a 16 hex — não reversível, evita gravar e-mail no armazenamento de rate limit (`rate_limit_increment`).
- **Degradação segura:** leitura best-effort; qualquer exceção cai em `catch → null`; um erro ao ler a sessão nunca bloqueia a inscrição nem altera a resposta.
- **Sem ativação de auth:** nenhuma sessão real é emitida/renovada aqui (`setAll` no-op, somente leitura).

## 7. Conclusão

REC-205 entrega a extensão da composição da chave de rate limit com identidade opcional (proxy confiável + usuário + operação), sem alterar o comportamento observável de requisições anônimas e sem acoplar qualquer decisão de autorização. Auth HMAC de produção e o mecanismo de REC-203 permanecem intocados/não consumidos, confirmados por `git status` e `grep`. Suíte agregada 638/638, lint e typecheck limpos.
