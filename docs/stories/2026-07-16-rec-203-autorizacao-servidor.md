# Story REC-203: Autorização administrativa resolvida no servidor (papel fresco, sem cache assinado)

## Status

Done

## Executor Assignment

executor: "@dev" (Dex) — implementação da resolução de papel no servidor (infraestrutura, sem ativação)
quality_gate: "@qa" (Quinn) — revisão independente (gate separado, fora desta story)
quality_gate_tools:
- verificação de que o fluxo HMAC existente (`app/api/auth/session/route.ts`, `src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`) permanece intacto e continua sendo a autoridade real de produção (D5, anti-lockout)
- verificação de que NENHUMA rota administrativa real foi migrada/ligada ao novo mecanismo (ativação é escopo futuro)
- verificação do contrato de resolução fresca: rebaixamento entre duas chamadas reflete o papel atual, não um valor cacheado
- conferência de que nenhuma credencial/segredo/conta real foi alterado e nenhuma chamada de rede real contra produção foi feita

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 3 — Identidade e entrega segura
- **Prioridade:** P0 / SEV-0
- **Estimativa:** M
- **ADR de origem:** [ADR-016](../architecture/adr-016-identidade-bff-rec201.md) — D1 (Supabase Auth autoridade única; papel resolvido no servidor a cada operação, não lido de payload assinado), D5 (sequência: REC-203 é o passo 2 — "Autorização passa a consultar a fonte no servidor, não o payload HMAC"; o HMAC ainda NÃO é removido, isso é REC-204)
- **Findings/Requisitos:** FND-04 (papel congelado no token, sem revogação confiável), FR-07 (papel/revogação via Supabase Auth), NFR-04 (fail-closed)
- **Depende de:** REC-202 (sessão SSR do Supabase, Done) — reutiliza `readSSRSession`/`getUser` como fonte de papel
- **Bloqueia:** REC-204 (remoção do HMAC/`localStorage`/header); a ativação em rota real depende deste mecanismo

## Story

**As a** responsável pela identidade administrativa da RH Cursos,
**I want** um mecanismo que resolva o papel do usuário consultando a fonte no servidor a cada operação (via sessão SSR do Supabase), em vez de confiar no papel congelado num payload HMAC assinado no login,
**so that** um rebaixamento ou bloqueio de papel na fonte passe a **bloquear a requisição seguinte** (D1/FND-04), **sem** ativar essa checagem em nenhuma rota real ainda — evitando quebrar a produção, que continua autorizada pelo HMAC (D5).

## Contexto e valor

FND-04 registra a falha central: o papel é gravado no payload HMAC no login (`src/lib/auth.ts:99`) e **nunca é reconsultado na origem** — `decodeSession` só recomputa a assinatura e checa `exp`. Um rebaixamento no Supabase não invalida uma sessão HMAC já emitida até o TTL expirar (30 min, ou 30 dias com "Manter conectado"). D1 do ADR-016 corrige isso: o papel deve ser **resolvido a partir da fonte no servidor a cada operação protegida**.

REC-202 (Done) entregou a sessão SSR do Supabase (`src/lib/supabase/session.ts`) e já lê o papel da fonte via `app_metadata.role` em `getUser()` (`readSSRSession`). REC-203 é o **passo 2** de D5: construir o **mecanismo de resolução de papel no servidor** — uma função que, dado o `SupabaseClient` da sessão SSR, resolve o papel corrente a cada chamada (consulta fresca, sem cache de payload assinado) — e disponibilizá-lo como helper reutilizável.

**Escopo consciente (infraestrutura, não ativação):** esta story **constrói e testa** o mecanismo, mas **não o liga a nenhuma rota administrativa real**. A autoridade de produção continua sendo o HMAC. Trocar uma rota real de HMAC para esta checagem é **ativação** — escopo de uma story futura (parte de REC-204 ou um passo dedicado). Fazer a ativação aqui quebraria produção imediatamente, porque a sessão SSR ainda não é usada por nenhum login real (REC-202 é puramente aditiva e inerte).

## Escopo

### Incluído

- Novo módulo `src/lib/supabase/authorize.ts`:
  - `resolveServerRole(client: SupabaseClient): Promise<DashboardRole | null>` — consulta a fonte (`app_metadata.role` via `getUser()`, o mesmo padrão de REC-202) a cada chamada; nunca lê de payload assinado; sem cache.
  - `requireServerRole(client, minimumRole): Promise<ServerAuthorization>` — helper de autorização (fail-closed) pensado para uma rota real usar no futuro; resolve o papel fresco e decide autorizado/negado.
  - `roleSatisfies(actual, minimum)` — hierarquia de papéis (`admin` > `instructor` > `student`).
- Testes mockados (Vitest) `src/__tests__/lib/supabase-authorize.test.ts` cobrindo: papel resolvido de sessão ativa; **rebaixamento** (mock muda `app_metadata.role` entre duas chamadas) refletido na 2ª chamada, não cacheado; usuário sem sessão → negado; papel insuficiente → negado; rebaixamento bloqueia a requisição seguinte via `requireServerRole`.

### Fora do escopo (deliberadamente NÃO feito)

- **Ativar a checagem em qualquer rota administrativa real** (ex.: `supabase/functions/admin-resources/index.ts`, que hoje usa `requireAdmin` HMAC via `x-rh-session`). A ativação é **escopo futuro** (parte de REC-204 ou um passo dedicado) — ver Dev Notes.
- **Remover/alterar/enfraquecer o HMAC** (`src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts`) — permanece a autoridade real; remoção é REC-204.
- **Modificar arquivos de REC-202** (`src/lib/supabase/session.ts`, `app/api/auth/ssr-session/route.ts`) — apenas LIDOS e IMPORTADOS (`DashboardRole`/`normalizeDashboardRole` via `src/lib/auth`).
- Eliminar `localStorage`/header `x-rh-session` — REC-204.
- Qualquer alteração de credencial, segredo ou conta real; qualquer chamada de rede contra o Supabase de produção.

## Acceptance Criteria

1. **Papel resolvido da fonte no servidor (D1)**
   **Given** uma sessão SSR ativa cujo `app_metadata.role` é `admin`,
   **when** `resolveServerRole(client)` é chamado,
   **then** retorna `admin`, tendo consultado a fonte (`getUser`) nessa chamada — não um valor lido de payload assinado.

2. **Rebaixamento reflete na requisição seguinte, sem cache (D1/FND-04)**
   **Given** a mesma sessão cujo papel na fonte muda de `admin` para `student` entre duas chamadas,
   **when** `resolveServerRole` é chamado duas vezes,
   **then** a 1ª retorna `admin` e a 2ª retorna `student` (a fonte é consultada a cada chamada; nenhum valor é cacheado).

3. **Rebaixamento bloqueia a requisição seguinte (entrega mensurável da épica)**
   **Given** `requireServerRole(client, "admin")` e um papel que cai de `admin` para `student`,
   **when** duas requisições consecutivas ocorrem,
   **then** a 1ª é `authorized: true` e a 2ª é `authorized: false, reason: "insufficient_role"`.

4. **Fail-closed: sem sessão ou papel insuficiente → negado (NFR-04)**
   **Given** um cliente sem usuário autenticado, ou com papel abaixo do mínimo,
   **when** `requireServerRole` é chamado,
   **then** retorna `authorized: false` com `reason: "unauthenticated"` (sem sessão) ou `"insufficient_role"` (papel abaixo do mínimo).

5. **Nenhuma rota real ativada; HMAC intacto (D5, anti-lockout)**
   **Given** o risco de quebrar produção,
   **when** o File List e o diff são revisados,
   **then** nenhuma rota administrativa real passou a depender do novo mecanismo, e `app/api/auth/session/route.ts`, `src/lib/auth.ts`, `supabase/functions/_shared/auth.ts` **não** foram modificados — o HMAC continua sendo a autoridade.

6. **Nenhum toque em produção/credenciais reais**
   **Given** as restrições de segurança da story,
   **when** a implementação e os testes são executados,
   **then** nenhuma credencial/segredo/conta real é alterada e nenhum teste faz chamada de rede real contra o projeto remoto — os testes são 100% mockados.

7. **Verificação verde**
   **Given** o Definition of Done,
   **when** `npm run lint`, `npm run typecheck` e `npx vitest run` são executados,
   **then** todos passam sem regressão.

## Tasks / Subtasks

- [x] **Task 1 — Confirmar dependência e fonte de papel** (AC: 1, 5, 6)
  - [x] REC-202 (Done) confirmada: `readSSRSession`/`signInSSR` já leem o papel de `app_metadata.role` via `getUser()`. Fonte reutilizada, não inventada (Article IV).
  - [x] Fluxo HMAC atual relido (`src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `admin-resources/index.ts`): `requireAdmin` autoriza pelo token HMAC (`x-rh-session`) — permanece a autoridade.

- [x] **Task 2 — Módulo `src/lib/supabase/authorize.ts`** (AC: 1, 2, 3, 4)
  - [x] `resolveServerRole(client)`: leitura fresca via `getUser()` + `normalizeDashboardRole(app_metadata.role)`; sem cache.
  - [x] `roleSatisfies(actual, minimum)`: hierarquia `admin` > `instructor` > `student`; `null` nunca satisfaz.
  - [x] `requireServerRole(client, minimumRole)`: fail-closed (`unauthenticated` / `insufficient_role` / autorizado). Não ligado a nenhuma rota real.

- [x] **Task 3 — Testes mockados** (AC: 2, 3, 4, 6, 7)
  - [x] `src/__tests__/lib/supabase-authorize.test.ts`: 11 casos. Cliente mockado com `getUser` sequenciado (prova rebaixamento sem cache: 2 chamadas, valores diferentes). Sem rede real.

- [x] **Task 4 — Verificação** (AC: 7)
  - [x] `npm run lint` → 0 erros. `npm run typecheck` → OK. `npx vitest run` → 632/632 (59 files), 0 regressão.

## Dev Notes

### Decisão de design: infraestrutura pura, ativação adiada

D5 coloca REC-203 como o passo que faz "a autorização consultar a fonte no servidor, não o payload HMAC". O caminho mais seguro para entregar isso **sem** arriscar produção é construir o mecanismo como um módulo reutilizável e **não ligá-lo a nenhuma rota real** nesta story. Motivo: a sessão SSR de REC-202 é aditiva e inerte — nenhum login real a popula ainda. Se uma rota real (ex.: `admin-resources`) fosse trocada de `requireAdmin` (HMAC) para `requireServerRole` (SSR) agora, ela passaria a exigir uma sessão SSR que nunca é criada → lockout imediato do admin. Portanto a ativação é explicitamente **escopo futuro**.

### Reuso da fonte de papel (Article IV — No Invention)

`resolveServerRole` usa exatamente a fonte já validada por REC-202: `app_metadata.role` lido de `client.auth.getUser()`. Nenhuma fonte nova (nem tabela `profiles` consultada diretamente, nem outro provedor) é introduzida. `DashboardRole` e `normalizeDashboardRole` são importados de `src/lib/auth` (mesmo tipo derivado de `profiles.role`).

### Como o "sem cache" é garantido e provado

`resolveServerRole` chama `getUser()` a cada invocação e retorna o papel derivado dessa leitura — não há estado retido entre chamadas, ao contrário do HMAC, que assina o papel no login. O teste `rebaixamento: role muda entre duas chamadas` usa um mock cujo `getUser` devolve `admin` na 1ª chamada e `student` na 2ª, e afirma que o retorno muda (`admin` → `student`) e que `getUser` foi chamado 2 vezes. É a prova direta de que a segunda requisição reflete o estado atual da fonte, não um valor congelado.

### Limitação de decomposição da épica (honestidade)

A "entrega mensurável" da Onda 3 ("papel vem do servidor e rebaixamento bloqueia a requisição seguinte") é demonstrada aqui **em nível de mecanismo/teste**, não em uma rota de produção viva. Demonstrá-la de fato numa rota exigiria ativar o SSR como caminho de autenticação real — o que depende de REC-202 ser consumido pela UI e validado ponta a ponta contra Docker (recomendação registrada no gate de REC-202). Isso é uma característica da decomposição forward-only da épica (D5: HMAC só sai em REC-204), não uma omissão desta story. **Não** arrisquei ativar em produção para "provar valor" — conforme a restrição de segurança da story, a ativação é escopo futuro documentado.

### Próximo passo (ativação — escopo futuro, NÃO desta story)

Quando a sessão SSR for o caminho de login real (após REC-202 ser consumido pela UI e validado), uma rota administrativa (ex.: `admin-resources`) pode substituir `requireAdmin` (HMAC/`x-rh-session`) por `requireServerRole(ssrClient, "admin")`, obtendo bloqueio efetivo na requisição seguinte a um rebaixamento. Isso é **ativação em rota real** e pertence a uma story futura (parte de REC-204 ou um passo dedicado) — não invento nova numeração aqui.

### Project Structure Notes

- Não modificados: `.aiox-core/**` (L1/L2), fluxo HMAC, arquivos de REC-202 (`session.ts`, `ssr-session/route.ts` — apenas importados/lidos), migrations/endpoints de outras stories REC-*.

## Dependências

- **Entrada:** REC-202 (sessão SSR, Done); `DashboardRole`/`normalizeDashboardRole` de `src/lib/auth`.
- **Bloqueia:** REC-204 (remoção do legado); a ativação em rota real consome este mecanismo.

## Roll-forward / Rollback

- **Forward-only:** o módulo é aditivo e não consumido por nenhuma rota real. "Rollback" da parte de autorização servidor é simplesmente não usá-la — o HMAC segue como autoridade, intacto. Rollback que restaure o HMAC como autoridade nunca é necessário porque o HMAC nunca deixou de ser a autoridade nesta story (D5 respeitado).

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-16 | 0.1 | **Draft.** Story criada a partir do ADR-016 (D1/D5), Onda 3, passo 2 de identidade. Escopo: mecanismo de resolução de papel no servidor (sem cache assinado), como infraestrutura NÃO ativada em rota real. | @dev (Dex) |
| 2026-07-16 | 1.0 | **Draft → Ready.** Auto-validação contra o checklist de 10 pontos: título claro; contexto/valor via ADR-016/FND-04; ACs testáveis (Given/When/Then); escopo IN/OUT com "deliberadamente NÃO feito"; dependências mapeadas (REC-202 entrada; bloqueia REC-204); estimativa M; valor (rebaixamento efetivo na requisição seguinte); riscos documentados (lockout evitado por não-ativação). **`@po` retém a autoridade formal de GO no gate InReview.** | @dev (Dex) |
| 2026-07-16 | 1.1 | **Ready → InProgress.** Implementação: `src/lib/supabase/authorize.ts` (`resolveServerRole`/`requireServerRole`/`roleSatisfies`), testes `src/__tests__/lib/supabase-authorize.test.ts`. HMAC intocado; nenhuma rota real ativada. | @dev (Dex) |
| 2026-07-16 | 1.2 | **InProgress → InReview.** Tasks 1–4 concluídas. `npm run lint` (0 erros), `npm run typecheck` (OK), `npx vitest run` (632/632, 59 files) verdes. Rebaixamento sem cache provado por teste de 2 chamadas com valores diferentes; nenhuma chamada de rede real; nenhuma credencial/conta real alterada; HMAC preservado; nenhuma rota real migrada. Relatório em `docs/history/reports/rec-203-autorizacao-servidor-2026-07-16.md`. Encaminhado a `@qa`. | @dev (Dex) |
| 2026-07-17 | 1.3 | **InReview → Done.** Gate PASS (95/100) emitido por `@qa`+`@architect` após revisão de alto rigor: `git status` confirma zero arquivo HMAC/REC-202 modificado (apenas lidos/importados); `authorize.ts` revisado linha a linha (fail-closed correto em todos os ramos); `admin-resources/index.ts` confirmado ainda usando `requireAdmin()` HMAC, sem importar o módulo novo. Suíte 632/632 reexecutada. Nota `info` (PROC-106): ativação em rota real fica para REC-204, condicionada à sessão SSR já estar em uso real. | @qa (Quinn) + @architect (Aria) |

## File List

### Criado

- `docs/stories/2026-07-16-rec-203-autorizacao-servidor.md`
- `src/lib/supabase/authorize.ts`
- `src/__tests__/lib/supabase-authorize.test.ts`
- `docs/history/reports/rec-203-autorizacao-servidor-2026-07-16.md`

### Referências somente leitura (não modificadas)

- `docs/architecture/adr-016-identidade-bff-rec201.md`
- `src/lib/supabase/session.ts`, `app/api/auth/ssr-session/route.ts` (REC-202 — importados/lidos, não alterados)
- `src/lib/auth.ts` (fonte de `DashboardRole`/`normalizeDashboardRole` — importado, não alterado)
- `app/api/auth/session/route.ts`, `supabase/functions/_shared/auth.ts` (HMAC — autoridade, intocados)
- `supabase/functions/admin-resources/index.ts` (rota protegida por `requireAdmin` HMAC — não tocada; candidata a ativação futura)
- `src/lib/app-store.tsx`

## QA Results

### Gate: PASS ✅ — @qa (Quinn) + @architect (Aria), 2026-07-17

**Gate file:** [`docs/qa/gates/rec-203-autorizacao-servidor.yml`](../qa/gates/rec-203-autorizacao-servidor.yml) · **Quality score:** 95/100

Verificação independente de alto rigor: `git status` confirma que nenhum arquivo do fluxo HMAC (`auth.ts`, `_shared/auth.ts`, `session/route.ts`) nem os arquivos de REC-202 (`session.ts`, `ssr-session/route.ts`) foram modificados — apenas importados/lidos. `src/lib/supabase/authorize.ts` revisado linha a linha: `resolveServerRole()` sem cache, `roleSatisfies()` trata `null` como não-satisfeito (fail-closed), `requireServerRole()` cobre corretamente os 3 ramos. Confirmado por leitura que `supabase/functions/admin-resources/index.ts` continua usando `requireAdmin()` (HMAC), sem importar o módulo novo — nenhuma ativação real ocorreu. `npx vitest run` → `632 passed (632)`. `npm run lint`/`npm run typecheck` limpos.

**Veredito:** PASS. Mecanismo de resolução de papel sem cache construído, testado (rebaixamento provado bloqueando a chamada seguinte a nível de mecanismo) e corretamente não-ativado em produção. HMAC confirmado como única autoridade real, sem exceção.

— Quinn, guardiã da qualidade 🛡️ + Aria, arquitetura 🏛️

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (executor)

### Debug Log / Verificação

- `npx vitest run src/__tests__/lib/supabase-authorize.test.ts` → 11/11 passed.
- `npm run typecheck` → `Types generated successfully`, `tsc --noEmit` sem erros.
- `npm run lint` → sem erros.
- `npx vitest run` (suíte completa) → **632 passed (632), 59 files**, 0 regressão (antes de REC-203: 621/58; +11 testes / +1 file).

### Completion Notes

- Estado da autoridade: **HMAC continua sendo a autoridade real de produção**, sem exceção. O mecanismo de resolução de papel no servidor foi construído como infraestrutura aditiva e **não está ligado a nenhuma rota administrativa real**.
- Nenhuma rota foi migrada/ativada. A ativação (trocar `requireAdmin` HMAC por `requireServerRole` numa rota real) é **escopo futuro** (parte de REC-204 ou um passo dedicado), documentado nas Dev Notes.
- Deliberadamente deixado para REC-204: remoção do HMAC/`localStorage`/header `x-rh-session`.
- Nenhum ponto exigiu parada por segurança: não-ativação eliminou qualquer risco de lockout. Nenhuma chamada de rede real; testes 100% mockados.
