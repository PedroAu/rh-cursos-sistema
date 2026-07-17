# Story REC-205: Expandir rate limiting para identidade autenticada (composição de chave, sem autorização)

## Status

Done

## Executor Assignment

executor: "@dev" (Dex) — extensão da composição da chave de rate limit da inscrição pública
quality_gate: "@qa" (Quinn) — revisão independente (gate separado, fora desta story)
quality_gate_tools:
- verificação de que requisições ANÔNIMAS (sem sessão SSR) permanecem byte-idênticas: mesma chave (`enrollment:<ip>`), mesmo limite, mesmas respostas
- verificação de que o mecanismo de autorização de REC-203 (`resolveServerRole`/`requireServerRole`) NÃO é consumido em nenhum ponto — a inclusão do usuário é só granularidade de bucket
- verificação de que os arquivos de auth HMAC de produção (`src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts`) permanecem intocados
- verificação da suíte agregada sem regressão (632 → 638, +6 testes)

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 3 — Identidade e entrega segura
- **Prioridade:** P0 / SEV-0
- **Estimativa:** S
- **ADR de origem:** [ADR-016](../architecture/adr-016-identidade-bff-rec201.md) — D5 (sequência forward-only: REC-202 sessão SSR → REC-203 mecanismo de papel no servidor → REC-204 cutover → REC-205/206). REC-205 reusa a leitura de identidade de REC-202 (`readSSRSession`), sem depender do cutover de REC-204.
- **Findings/Requisitos:** FND-09 (proteção de endpoints públicos), FR-02, NFR-04 (fail-closed / degradação segura)
- **Entrega mensurável (épica):** "A proteção pública de REC-107 é estendida para proxy confiável + usuário atual + operação; IP do browser continua ignorado."
- **Depende de:** REC-107 (endurecimento de endpoints públicos, Done) e REC-202 (sessão SSR, Done)
- **Não bloqueia** e **não depende de** REC-204 (cutover de auth) — a inclusão do usuário na chave é aditiva e inerte quando não há sessão SSR.

## Story

**As a** responsável pela proteção dos endpoints públicos da RH Cursos,
**I want** que a chave de rate limit da inscrição pública inclua, OPCIONALMENTE, um identificador da sessão autenticada (quando existir uma sessão SSR de REC-202 ativa), além do proxy confiável e da operação,
**so that** um usuário autenticado tenha um bucket de rate limit mais específico (granularidade), **sem** alterar em nada o comportamento observável das requisições anônimas e **sem** usar essa identidade para qualquer decisão de autorização.

## Contexto e valor

REC-107 (Done) endureceu o endpoint público de inscrição (`app/api/enrollments/route.ts`), incluindo rate limit baseado no proxy confiável: a chave é `enrollment:${clientIp(request)}`, onde `clientIp` prefere `cf-connecting-ip`/`x-forwarded-for`/`x-real-ip` (proxy confiável), **ignorando qualquer IP arbitrário definido pelo browser**. REC-202 (Done) entregou a sessão SSR do Supabase (`readSSRSession`), aditiva e sem consumo por login real ainda.

REC-205 estende **apenas a composição da chave**: quando há uma sessão SSR ativa, um identificador derivado do usuário é anexado à chave (`enrollment:<ip>:user:<hash>`), tornando o bucket mais único. Isso é **puramente granularidade de bucket** — não é autenticação, não é autorização, não bloqueia nem libera acesso. Requisições anônimas (sem sessão SSR) mantêm a chave `enrollment:<ip>` **byte-idêntica**, com o mesmo limite e as mesmas respostas de REC-107.

## Escopo

### Incluído

- Nova função pura `buildRateLimitKey(scope, clientIdentifier, userIdentifier?)` em `src/lib/rate-limit.ts`:
  - Sem `userIdentifier` (anônimo) → `${scope}:${clientIdentifier}` (idêntico ao formato REC-107).
  - Com `userIdentifier` não vazio → `${scope}:${clientIdentifier}:user:${userIdentifier}` (mais específico).
  - `null`/`undefined`/`""` são tratados como anônimo.
- Wiring best-effort em `app/api/enrollments/route.ts`:
  - `readRateLimitUserIdentity()` lê a sessão SSR (REC-202) via `readSSRSession` de forma tolerante a falha; retorna `null` quando SSR não configurado, sem sessão ativa ou em qualquer exceção.
  - Quando há sessão ativa, deriva um identificador **não-PII** (SHA-256 do e-mail, truncado a 16 hex) — evita persistir e-mail no armazenamento de rate limit.
  - A chave passa a ser composta por `buildRateLimitKey("enrollment", clientIp(request), userIdentifier)`.
- Testes unitários em `src/__tests__/lib/rate-limit.test.ts` cobrindo: chave anônima inalterada (`undefined`/`null`/`""`) e chave mais específica/única com usuário (buckets separados para usuários distintos no mesmo IP).
- Ajuste do mock em `src/__tests__/app/api/enrollments-route.test.ts` para expor `buildRateLimitKey` e forçar SSR não configurado (mantém o caminho anônimo dos testes de REC-107).

### Fora do escopo (deliberadamente NÃO feito)

- **Qualquer decisão de autorização/bloqueio** a partir da identidade — REC-203 (`resolveServerRole`/`requireServerRole`) **não** é consumida. A identidade só torna a chave mais única.
- **Qualquer mudança de comportamento observável para requisições anônimas** — mesma chave, mesmo limite, mesmas respostas.
- **Tocar nos arquivos de auth HMAC de produção** (`src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts`) — autoridade real até REC-204.
- **Modificar arquivos de REC-202** (`src/lib/supabase/session.ts`, `app/api/auth/ssr-session/route.ts`) — apenas importados/lidos.
- **Estender a Edge Function `supabase/functions/enrollments/index.ts`** — `readSSRSession` é o caminho SSR Next.js (Node), não o runtime Deno da Edge Function; a extensão pertence à rota Next.
- Cutover de auth (REC-204), qualquer alteração de credencial/segredo/conta real, ou chamada de rede real contra produção nos testes.

## Acceptance Criteria

1. **Chave anônima byte-idêntica (NFR-04 / não regressão de REC-107)**
   **Given** uma requisição sem sessão SSR (usuário não autenticado),
   **when** a chave de rate limit é composta,
   **then** ela é exatamente `enrollment:${clientIp(request)}` — mesma chave, mesmo bucket, mesmo limite e mesmas respostas de REC-107.

2. **Chave mais específica com usuário autenticado (entrega mensurável da épica)**
   **Given** uma sessão SSR ativa (REC-202),
   **when** a chave é composta,
   **then** ela inclui um identificador do usuário (`enrollment:<ip>:user:<hash>`), sendo estritamente mais específica que a chave anônima e distinta entre usuários diferentes no mesmo IP.

3. **`null`/`undefined`/`""` = anônimo**
   **Given** `userIdentifier` ausente, nulo ou string vazia,
   **when** `buildRateLimitKey` é chamado,
   **then** o resultado é a chave anônima (`${scope}:${clientIdentifier}`), sem sufixo `:user:`.

4. **Nenhuma decisão de autorização (restrição dura da story)**
   **Given** o escopo estrito,
   **when** o diff é revisado,
   **then** `resolveServerRole`/`requireServerRole` (REC-203) não são importados nem chamados em `app/api/enrollments/route.ts`; a identidade só afeta a composição da chave.

5. **Degradação segura da leitura de identidade (NFR-04)**
   **Given** SSR não configurado, sem sessão, ou qualquer exceção na leitura,
   **when** `readRateLimitUserIdentity()` executa,
   **then** retorna `null` e a chave permanece anônima — a falha nunca bloqueia nem altera a resposta da inscrição.

6. **Sem PII persistida no rate limit**
   **Given** um usuário autenticado,
   **when** o identificador do usuário é derivado,
   **then** é um hash não reversível (SHA-256 truncado), não o e-mail em claro.

7. **Auth de produção e arquivos de REC-202/203 intocados (D5, anti-lockout)**
   **Given** as restrições de segurança,
   **when** o `git status` e o diff são revisados,
   **then** `src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts` e os módulos de REC-202/REC-203 **não** foram modificados.

8. **Verificação verde sem regressão**
   **Given** o Definition of Done,
   **when** `npm run lint`, `npm run typecheck` e `npx vitest run` são executados,
   **then** todos passam; a suíte agregada vai de 632 para 638 (+6 testes), 0 regressão.

## Tasks / Subtasks

- [x] **Task 1 — Confirmar mecanismo atual e dependências** (AC: 1, 7)
  - [x] Localizado o rate limit via `graphify query "rate limit"`: `src/lib/rate-limit.ts` (`checkRateLimit`/`clientIp`) e chave `enrollment:${clientIp(request)}` em `app/api/enrollments/route.ts:40` (REC-107).
  - [x] Confirmado que `readSSRSession` (REC-202, `src/lib/supabase/session.ts`) é a leitura de identidade a reutilizar (Article IV — sem inventar fonte).
  - [x] Confirmado que a Edge Function Deno não é o alvo (SSR é Node/Next).

- [x] **Task 2 — Função pura `buildRateLimitKey`** (AC: 1, 2, 3)
  - [x] Adicionada a `src/lib/rate-limit.ts`: anônimo → `${scope}:${clientIdentifier}`; com usuário → `...:user:${userIdentifier}`; `null`/`undefined`/`""` = anônimo.

- [x] **Task 3 — Wiring best-effort na rota** (AC: 4, 5, 6)
  - [x] `readRateLimitUserIdentity()` em `app/api/enrollments/route.ts`: lê SSR best-effort (short-circuit se `!isSupabaseSsrConfigured`), `try/catch` → `null`; deriva hash SHA-256 (16 hex) do e-mail; adaptador de cookies somente-leitura (`setAll` no-op).
  - [x] Chave passada a `checkRateLimit` via `buildRateLimitKey("enrollment", clientIp(request), userIdentifier)`.
  - [x] Nenhum consumo de REC-203; nenhuma alteração no restante da rota.

- [x] **Task 4 — Testes** (AC: 1, 2, 3, 8)
  - [x] `src/__tests__/lib/rate-limit.test.ts`: 6 casos novos (anônimo inalterado; `undefined`/`null`/`""` = anônimo; mais específico com usuário; buckets separados por usuário no mesmo IP).
  - [x] `src/__tests__/app/api/enrollments-route.test.ts`: mock atualizado (`buildRateLimitKey` exposto; `@/lib/supabase/session` com `isSupabaseSsrConfigured: false` → caminho anônimo preservado).

- [x] **Task 5 — Verificação** (AC: 8)
  - [x] `npm run lint` → 0 erros. `npm run typecheck` → OK. `npx vitest run` → 638/638 (59 files), 0 regressão (+6 testes sobre 632).

## Dev Notes

### Decisão de design: composição de chave, não autorização

A épica descreve a entrega como "proxy confiável + usuário atual + operação; IP do browser continua ignorado". Traduzido literalmente e de forma segura: **operação** = escopo (`enrollment`); **proxy confiável** = `clientIp()` (já ignora IP arbitrário do browser desde REC-107); **usuário atual** = identificador opcional derivado da sessão SSR. A única coisa que muda é a **string da chave** enviada ao `checkRateLimit`. Nada disso é uma decisão de acesso: a identidade só subdivide buckets. Consumir REC-203 aqui (para bloquear/autorizar) seria ativação de autorização — explicitamente fora do escopo e proibido enquanto o HMAC é a autoridade real (D5).

### Por que anônimo permanece byte-idêntico

`buildRateLimitKey("enrollment", ip)` sem `userIdentifier` retorna exatamente `enrollment:<ip>` — a mesma string literal que REC-107 montava. `readRateLimitUserIdentity()` retorna `null` para qualquer request sem sessão SSR (o caso comum do público anônimo), então a chave, o limite e as respostas ficam idênticos. Os testes de REC-107 (`enrollments-route.test.ts`) continuam válidos com o mock de sessão forçando SSR não configurado.

### Identificador não-PII

`readSSRSession` expõe `email` (não um `sub`/UUID). Para não persistir PII no armazenamento de rate limit (`rate_limit_increment`), o e-mail é reduzido a um hash SHA-256 truncado (16 hex) — suficiente para unicidade de bucket, não reversível. Escolha consciente num contexto de recuperação SEV-0.

### Degradação segura (NFR-04)

A leitura de identidade é best-effort: `!isSupabaseSsrConfigured` faz short-circuit; qualquer exceção cai no `catch` → `null`. Um erro ao ler a sessão nunca bloqueia a inscrição nem altera a resposta — apenas resulta na chave anônima.

### Project Structure Notes

- Não modificados: `.aiox-core/**` (L1/L2), fluxo HMAC (`src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts`), módulos de REC-202 (`session.ts`, `ssr-session/route.ts` — importados/lidos) e REC-203 (`authorize.ts` — não referenciado), Edge Function `supabase/functions/enrollments/index.ts`.

## Dependências

- **Entrada:** REC-107 (endurecimento público, Done) e REC-202 (`readSSRSession`, Done).
- **Não bloqueia** REC-204 e **não depende** dele: a extensão é aditiva e inerte sem sessão SSR.

## Roll-forward / Rollback

- **Forward-only:** mudança aditiva. "Rollback" da granularidade por usuário é simplesmente não haver sessão SSR — o comportamento recai para a chave anônima de REC-107, sem necessidade de reverter nada de produção.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-17 | 0.1 | **Draft.** Story criada a partir da entrada REC-205 da Épica 17 (Onda 3) e do ADR-016 (D5). Escopo: estender a composição da chave de rate limit para incluir opcionalmente a identidade SSR (REC-202), sem autorização e sem mudança para anônimos. | @dev (Dex) |
| 2026-07-17 | 1.0 | **Draft → Ready.** Auto-validação contra o checklist de 10 pontos: título claro; contexto/valor via épica/ADR-016; ACs testáveis (Given/When/Then); escopo IN/OUT com "deliberadamente NÃO feito"; dependências mapeadas (REC-107 + REC-202); estimativa S; valor (granularidade de bucket sem risco a anônimos); riscos documentados (proibição de consumir REC-203; anônimo byte-idêntico). **`@po` retém a autoridade formal de GO no gate InReview.** | @dev (Dex) |
| 2026-07-17 | 1.1 | **Ready → InProgress.** Implementação: `buildRateLimitKey` em `src/lib/rate-limit.ts`; wiring best-effort `readRateLimitUserIdentity()` em `app/api/enrollments/route.ts`; testes em `rate-limit.test.ts`; mock ajustado em `enrollments-route.test.ts`. HMAC e REC-203 intocados. | @dev (Dex) |
| 2026-07-17 | 1.2 | **InProgress → InReview.** Tasks 1–5 concluídas. `npm run lint` (0 erros), `npm run typecheck` (OK), `npx vitest run` (638/638, 59 files, +6 sobre 632) verdes. `git status` confirma zero arquivo de auth HMAC modificado; `grep` confirma zero consumo de REC-203 na rota. Relatório em `docs/history/reports/rec-205-rate-limit-identidade-autenticada-2026-07-17.md`. Encaminhado a `@qa`. | @dev (Dex) |
| 2026-07-17 | 1.3 | **InReview → Done.** Gate PASS (94/100) emitido por `@qa`. Verificação independente: chave anônima byte-idêntica confirmada; identidade só compõe chave (sem autorização); auth HMAC e REC-203 intocados por `git status`/`grep`; suíte 638/638. | @qa (Quinn) |

## File List

### Modificado

- `src/lib/rate-limit.ts` (nova função `buildRateLimitKey`)
- `app/api/enrollments/route.ts` (wiring best-effort da identidade na composição da chave)
- `src/__tests__/lib/rate-limit.test.ts` (6 testes novos de `buildRateLimitKey`)
- `src/__tests__/app/api/enrollments-route.test.ts` (mock de `buildRateLimitKey` + `@/lib/supabase/session` não configurado)

### Criado

- `docs/stories/2026-07-17-rec-205-rate-limit-identidade-autenticada.md`
- `docs/history/reports/rec-205-rate-limit-identidade-autenticada-2026-07-17.md`
- `docs/qa/gates/rec-205-rate-limit-identidade-autenticada.yml`

### Referências somente leitura (não modificadas)

- `docs/architecture/adr-016-identidade-bff-rec201.md`
- `src/lib/supabase/session.ts` (REC-202 — `readSSRSession`/`createSupabaseSSRClient`/`isSupabaseSsrConfigured` importados)
- `src/lib/supabase/authorize.ts` (REC-203 — **não** referenciado)
- `src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts` (HMAC — autoridade, intocados)
- `supabase/functions/enrollments/index.ts` (Edge Deno — fora do escopo SSR)

## QA Results

### Gate: PASS ✅ — @qa (Quinn), 2026-07-17

**Gate file:** [`docs/qa/gates/rec-205-rate-limit-identidade-autenticada.yml`](../qa/gates/rec-205-rate-limit-identidade-autenticada.yml) · **Quality score:** 94/100

Verificação independente: chave anônima confirmada byte-idêntica (`enrollment:<ip>`) via teste dedicado e via mock de sessão SSR não configurada nos testes de REC-107; a identidade autenticada só compõe a chave (`...:user:<hash>`), sem qualquer decisão de autorização (`grep` confirma zero import/uso de `resolveServerRole`/`requireServerRole` em `app/api/enrollments/route.ts`). `git status` confirma que `src/lib/auth.ts`, `supabase/functions/_shared/auth.ts` e `app/api/auth/session/route.ts` não foram modificados; `authorize.ts` (REC-203) permanece não referenciado. Identificador de usuário é hash SHA-256 truncado (sem PII persistida). Degradação segura: leitura best-effort com `try/catch` → `null`. `npx vitest run` → `638 passed (638)`; `npm run lint`/`npm run typecheck` limpos.

**Veredito:** PASS. Composição de chave estendida com identidade opcional; anônimo preservado; nenhuma autorização acoplada; auth de produção intocada.

— Quinn, guardiã da qualidade 🛡️

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (executor)

### Debug Log / Verificação

- `npx vitest run src/__tests__/lib/rate-limit.test.ts` → passa (inclui 6 casos novos de `buildRateLimitKey`).
- `npm run typecheck` → `Types generated successfully`, `tsc --noEmit` sem erros.
- `npm run lint` → sem erros.
- `npx vitest run` (suíte completa) → **638 passed (638), 59 files**, 0 regressão (antes de REC-205: 632/59; +6 testes, mesmo número de files).

### Completion Notes

- A extensão afeta **apenas a string da chave** enviada ao `checkRateLimit`. Requisições anônimas mantêm `enrollment:<ip>` byte-idêntico — mesmo limite e mesmas respostas de REC-107.
- **Nenhuma decisão de autorização**: REC-203 (`resolveServerRole`/`requireServerRole`) não é importada nem chamada. A identidade só subdivide buckets de rate limit.
- **Auth HMAC de produção intocada**: `src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts` não modificados (confirmado por `git status`).
- Identificador do usuário é hash SHA-256 truncado do e-mail (não-PII); leitura de identidade é best-effort e falha para `null` sem afetar a resposta.
