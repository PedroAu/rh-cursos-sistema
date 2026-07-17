# Relatório REC-202 — Sessão Supabase SSR (cookies httpOnly + AAL2 fail-closed)

- **Data:** 2026-07-16
- **Story:** [`docs/stories/2026-07-16-rec-202-sessao-supabase-ssr.md`](../../stories/2026-07-16-rec-202-sessao-supabase-ssr.md)
- **ADR de origem:** [ADR-016](../../architecture/adr-016-identidade-bff-rec201.md) — D2, D3, D5
- **Épica:** 17 (Recuperação SEV-0), Onda 3
- **Executor:** @dev · **Status:** InReview

> Relatório sanitizado: nenhum segredo, credencial, token ou dado de conta real aparece aqui. Nenhuma chamada de rede real foi feita contra o Supabase de produção.

## 1. O que foi implementado

### `src/lib/supabase/session.ts` (novo)
- `createSupabaseSSRClient(cookieAdapter)`: cria o cliente SSR do Supabase (`createServerClient` do `@supabase/ssr`) usando a chave **anon/publishable** (nunca `service_role`), ligado a um adaptador de cookies desacoplado de `next/headers`.
- `buildSsrCookieOptions()`: atributos de cookie da sessão SSR — `httpOnly: true`, `secure` só em produção, `SameSite=Lax`, `path=/` — espelhando `getCookieOptions` (`src/lib/auth.ts:18-26`) conforme **D2**.
- `signInSSR(client, {email, password, role?, mfaCode?})`: login com **AAL2 fail-closed** (**D3 / SEC-104**).
- `readSSRSession(client)`: leitura da identidade + AAL a partir dos cookies (via `getUser` + `getAuthenticatorAssuranceLevel`).
- `signOutSSR(client)`: logout limpando os cookies httpOnly.

### `app/api/auth/ssr-session/route.ts` (novo, aditivo)
- `POST` (login SSR), `GET` (leitura de sessão), `DELETE` (logout). Rate limit reutilizado (`rateLimitConfigs.auth`). **Nenhum token do Supabase é devolvido no corpo** (D2); a sessão vive só nos cookies httpOnly.

### `src/__tests__/lib/supabase-ssr-session.test.ts` (novo)
- 15 testes mockados, todos passando.

## 2. Contrato AAL2 fail-closed (D3 / SEC-104) — como funciona

Após `signInWithPassword`, o cliente SSR já tem uma sessão AAL1 em cookies. O módulo então:

| Situação | Resultado | Sessão admin emitida? |
|---|---|---|
| Conta **sem** fator MFA verificado | `authenticated` (aal1) | Sim (AAL1) |
| Conta **com** MFA, **sem** `mfaCode` | `mfa_required` + `signOut()` | **Não** (fail-closed) |
| Conta **com** MFA, `mfaCode` válido e `currentLevel === "aal2"` | `authenticated` (aal2) | Sim (AAL2) |
| Conta **com** MFA, challenge/verify falha | `mfa_failed` + `signOut()` | **Não** (fail-closed) |
| Conta **com** MFA, verify ok mas nível não sobe a aal2 | `mfa_failed` + `signOut()` | **Não** (fail-closed) |

O ponto crítico: quando o AAL2 não é completado, `client.auth.signOut()` **limpa os cookies httpOnly**, garantindo que **não existe caminho** onde senha sozinha (AAL1) abra sessão admin quando há MFA ativo. Isso fecha SEC-104 na trilha correta (REC-201+), como recomendado pelo gate de REC-002.

## 3. O que foi deliberadamente NÃO removido/alterado

REC-202 é o **passo 1** da migração forward-only de D5, com coexistência **só-leitura** do HMAC. Preservado intencionalmente:

- `app/api/auth/session/route.ts` (login HMAC) — **byte-a-byte inalterado**. Continua sendo o caminho de login em produção e a **autoridade** de autorização.
- `src/lib/auth.ts` e `supabase/functions/_shared/auth.ts` (verificadores HMAC) — intocados.
- `src/lib/supabase/session-token.ts` (token HMAC + tokens Supabase em `localStorage`, header `x-rh-session`) — intocado. Sua remoção é **REC-204**.
- `src/lib/app-store.tsx` / UI de login — continuam no fluxo HMAC. O endpoint SSR é adicional; a UI **não** foi trocada para consumi-lo por padrão nesta janela.
- Autorização por papel resolvida no servidor a cada operação (D1/FR-07) — é **REC-203**, fora do escopo.
- Guards de lockdown de REC-003 e endpoints/migrations de outras stories REC-* — não tocados.

**Estado do HMAC ao fim de REC-202: ainda é a autoridade. A sessão SSR coexiste como caminho novo, aditivo e testado.**

## 4. Por que é seguro fazer merge sem causar lockout

**Porque o caminho antigo continua funcionando intacto.** A implementação é puramente aditiva:

1. O handler de login HMAC não teve uma única linha alterada — o diff prova isso trivialmente.
2. A nova rota `app/api/auth/ssr-session/` é independente e não é referenciada pela UI de login atual, então nenhum usuário admin passa a depender dela ao dar merge.
3. Nenhuma credencial, segredo ou conta real foi alterado; nenhuma chamada de rede real contra produção foi feita.

Se a sessão SSR precisasse ser desligada, bastaria não usá-la — o login HMAC segue operante. Não há cenário de rollback que exija restaurar o HMAC como autoridade, porque o HMAC nunca deixou de ser a autoridade nesta story (D5 respeitado).

## 5. Riscos e limitações (honestos)

- **Sem rollout na UI:** REC-202 entrega o mecanismo SSR pronto e testado, mas não o ativa como caminho padrão do cliente. Intencional e seguro — evita expor o login real a um caminho ainda não validado ponta a ponta contra Docker.
- **Teste de integração real (Docker local) não executado:** exigiria subir `supabase start` e provisionar uma conta de teste com TOTP verificado, não garantido neste ambiente e fora da restrição de não tocar produção. O contrato AAL2 fail-closed e os atributos/emissão de cookie estão cobertos por testes mockados determinísticos. Recomendação: `@qa` validar contra o Docker local com conta de teste dedicada (nunca `admin@rhcursos.com.br` real) antes de qualquer ativação na UI.
- **Nenhum ponto exigiu parada por segurança:** a escolha por rota aditiva eliminou o risco de lockout de antemão.

## 6. Verificação (saída fresca)

- `npm run lint` → sem erros.
- `npm run typecheck` → `Types generated successfully`; `tsc --noEmit` sem erros.
- `npx vitest run src/__tests__/lib/supabase-ssr-session.test.ts` → **15/15 passed**.
- `npx vitest run` (suíte completa) → **621 passed (621), 58 test files**, 0 regressão.

## 7. Sequência a jusante (não implementada aqui)

- **REC-203:** autorização administrativa com papel resolvido no servidor a cada requisição (D1).
- **REC-204:** remoção do HMAC, `localStorage` e header `x-rh-session`; tokens legados rejeitados (D1/D2/D4). Só depois que REC-202/REC-203 provarem a nova autoridade.
