# Relatório REC-203 — Autorização administrativa resolvida no servidor (papel fresco, sem cache assinado)

- **Data:** 2026-07-16
- **Story:** [`docs/stories/2026-07-16-rec-203-autorizacao-servidor.md`](../../stories/2026-07-16-rec-203-autorizacao-servidor.md)
- **ADR de origem:** [ADR-016](../../architecture/adr-016-identidade-bff-rec201.md) — D1, D5
- **Épica:** 17 (Recuperação SEV-0), Onda 3
- **Executor:** @dev · **Status:** InReview

> Relatório sanitizado: nenhum segredo, credencial, token ou dado de conta real aparece aqui. Nenhuma chamada de rede real foi feita contra o Supabase de produção.

## 1. O que foi construído (infraestrutura de resolução de papel sem cache)

### `src/lib/supabase/authorize.ts` (novo)

Mecanismo de autorização administrativa que resolve o papel **na fonte, no servidor, a cada operação** — implementando D1 do ADR-016 no nível de mecanismo:

- `resolveServerRole(client: SupabaseClient): Promise<DashboardRole | null>` — faz uma leitura **fresca** de `client.auth.getUser()` a cada chamada e deriva o papel de `app_metadata.role` via `normalizeDashboardRole`. **Sem cache, sem payload assinado**: nenhum estado é retido entre chamadas. É exatamente a fonte já validada por REC-202 (`readSSRSession`/`signInSSR`), reutilizada — nenhuma fonte nova inventada (Article IV).
- `requireServerRole(client, minimumRole): Promise<ServerAuthorization>` — helper de autorização **fail-closed** pensado para uma rota real usar no futuro: resolve o papel fresco e decide `authorized: true` / `authorized: false` com `reason` `"unauthenticated"` (sem sessão) ou `"insufficient_role"` (papel abaixo do mínimo).
- `roleSatisfies(actual, minimum)` — hierarquia de papéis `admin` > `instructor` > `student`; papel ausente (`null`) nunca satisfaz.

### `src/__tests__/lib/supabase-authorize.test.ts` (novo)

11 testes mockados, todos passando. Cobrem: papel resolvido de sessão ativa; **rebaixamento** (mock com `getUser` sequenciado devolvendo `admin` na 1ª chamada e `student` na 2ª) refletido na 2ª chamada — prova direta de ausência de cache; usuário sem sessão → negado; papel insuficiente → negado; e o cenário-chave da épica via `requireServerRole`: 1ª requisição autorizada (admin), 2ª **bloqueada** após rebaixamento para student.

## 2. Como o "sem cache / papel da fonte" é garantido e provado

| Situação | Resultado |
|---|---|
| Sessão ativa `app_metadata.role = admin` | `resolveServerRole` → `admin` (consultou `getUser` nessa chamada) |
| Papel muda `admin` → `student` entre 2 chamadas | 1ª → `admin`, 2ª → `student`; `getUser` chamado 2× (nada cacheado) |
| `requireServerRole("admin")` com rebaixamento entre requisições | 1ª → `authorized: true`; 2ª → `authorized: false, reason: "insufficient_role"` |
| Sem usuário autenticado | `authorized: false, reason: "unauthenticated"` (fail-closed) |
| Papel abaixo do mínimo | `authorized: false, reason: "insufficient_role"` (fail-closed) |

O ponto crítico: ao contrário do HMAC — que **assina o papel no login** (`src/lib/auth.ts:99`) e nunca o reconsulta —, `resolveServerRole` lê a fonte a cada invocação. É isso que torna um rebaixamento efetivo já na requisição seguinte (corrige FND-04). O teste de rebaixamento afirma explicitamente que o retorno muda entre duas chamadas e que a fonte foi consultada duas vezes.

## 3. O que foi deliberadamente NÃO feito (nenhuma rota real migrada — ativação futura)

REC-203 é o **passo 2** da migração forward-only de D5. Preservado intencionalmente:

- **Nenhuma rota administrativa real foi migrada ou ligada ao novo mecanismo.** `supabase/functions/admin-resources/index.ts` (e as demais rotas protegidas) continua autorizando por `requireAdmin` (token HMAC via header `x-rh-session`). Não tocado.
- `app/api/auth/session/route.ts` (login HMAC) — intocado. Continua sendo o caminho de login em produção e a **autoridade** de autorização.
- `src/lib/auth.ts` e `supabase/functions/_shared/auth.ts` (verificadores HMAC) — intocados. O HMAC **não foi desativado, removido nem enfraquecido**.
- Arquivos de REC-202 (`src/lib/supabase/session.ts`, `app/api/auth/ssr-session/route.ts`) — apenas **lidos e importados** (`DashboardRole`/`normalizeDashboardRole` via `src/lib/auth`), não modificados.
- Remoção de `localStorage` / header `x-rh-session` — é **REC-204**, fora do escopo.

**A ativação real** (trocar uma rota administrativa de `requireAdmin` HMAC para `requireServerRole` SSR) é explicitamente **escopo futuro** — parte de REC-204 ou um passo dedicado. Não inventei nova numeração; apenas documentei que a ativação em rota real fica para uma story futura.

## 4. Por que isso é seguro (nada em produção muda de comportamento)

**Porque é código novo não consumido.** A implementação é puramente aditiva:

1. Nenhuma rota de produção referencia `authorize.ts` — o mecanismo existe, é testado, mas está inerte. Nenhum usuário admin passa a depender dele ao dar merge.
2. O HMAC não teve uma única linha alterada — continua sendo a autoridade real. O diff prova isso trivialmente.
3. A sessão SSR ainda não é populada por nenhum login real (REC-202 é aditiva/inerte); por isso **não** liguei a checagem a uma rota real — fazê-lo causaria lockout imediato, pois a rota exigiria uma sessão SSR que nunca é criada.
4. Nenhuma credencial, segredo ou conta real foi alterado; nenhuma chamada de rede real contra produção foi feita; testes 100% mockados.

## 5. Limitação honesta da decomposição da épica

A "entrega mensurável" da Onda 3 ("papel vem do servidor e rebaixamento bloqueia a requisição seguinte") é demonstrada **em nível de mecanismo e teste**, não em uma rota de produção viva. Prová-la numa rota exigiria ativar o SSR como caminho de autenticação real — o que depende de REC-202 ser consumido pela UI e validado ponta a ponta contra Docker (recomendação do gate de REC-202). Isso é característica da decomposição forward-only da épica (D5 mantém o HMAC até REC-204), não uma omissão desta story. Conforme a restrição de segurança, **não** arrisquei ativar em produção para "provar valor"; registrei a ativação como escopo futuro.

## 6. Verificação (saída fresca)

- `npm run lint` → sem erros.
- `npm run typecheck` → `Types generated successfully`; `tsc --noEmit` sem erros.
- `npx vitest run src/__tests__/lib/supabase-authorize.test.ts` → **11/11 passed**.
- `npx vitest run` (suíte completa) → **632 passed (632), 59 test files**, 0 regressão (antes de REC-203: 621/58).

## 7. Estado da autoridade e sequência a jusante

- **Autoridade hoje:** o **HMAC continua sendo a autoridade real de produção**, sem exceção. O mecanismo de resolução de papel no servidor é infraestrutura aditiva, não ativada.
- **Próximo passo (escopo futuro, não implementado aqui):** ativação — trocar uma rota administrativa real de `requireAdmin` HMAC para `requireServerRole` SSR, uma vez que o SSR seja o caminho de login real e validado. Pertence a REC-204 ou a um passo dedicado.
- **REC-204:** remoção do HMAC, `localStorage` e header `x-rh-session`; tokens legados rejeitados (D1/D2/D4). Só depois que REC-202/REC-203 provarem a nova autoridade.
