# Story REC-206: Consolidar BFF canônico (remover contrato duplicado de leitura de leads no browser)

## Status

Done

## Executor Assignment

executor: "@dev" (Dex) — consolidação do roteamento de leitura administrativa de leads para same-origin (BFF)
quality_gate: "@qa" (Quinn) — revisão independente (gate separado, fora desta story)
quality_gate_tools:
- verificação de que o browser lê leads administrativos por UM único contrato same-origin (`admin-resources` `leads/list`, HMAC via `requireAdmin`), nunca mais pelo cliente Supabase direto
- verificação de que o contrato duplicado (`fetchLeadsFromSupabase`, leitura direta do cliente Supabase browser) foi removido
- verificação de que nenhuma nova autoridade de autorização foi introduzida — HMAC de produção intocado, REC-203 (`resolveServerRole`/`requireServerRole`) não consumida nem ativada
- verificação de que os read models administrativos completos (alunos/inscrições, paginação/filtros) NÃO foram implementados (isso é REC-303/304)
- verificação da suíte agregada sem regressão (638 → 639, +1 teste)

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** P1 — operação e UX
- **Prioridade:** P0 / SEV-0
- **Estimativa:** S–M
- **Findings/Requisitos:** FND-08 (listas administrativas não hidratam de forma confiável após reload), FR-08 (o admin busca recursos por APIs autenticadas, inclusive após reload)
- **Entrega mensurável (épica):** "Browser chama apenas same-origin; contratos duplicados removidos."
- **Depende de:** REC-202 (sessão SSR Supabase, Done) e REC-104 (cliente público anon dedicado, Done)
- **Bloqueia:** REC-303 (read models de alunos/inscrições) e REC-304 (demais read models admin) — que constroem os read models completos SOBRE o roteamento canônico consolidado aqui

## Story

**As a** responsável pela confiabilidade da operação administrativa da RH Cursos,
**I want** que o browser leia os recursos administrativos por um único contrato same-origin (BFF) em vez de manter dois caminhos concorrentes (BFF HMAC + cliente Supabase direto) para o mesmo dado,
**so that** a operação administrativa seja confiável e previsível (inclusive após reload) e o roteamento fique consolidado para os read models de REC-303/304 — **sem** introduzir nova autoridade de autorização nem construir os read models completos.

## Contexto e valor

FND-08 registra que "listas administrativas de alunos/inscrições não hidratam corretamente após reload", com consequência "operação administrativa não confiável". A causa estrutural relevante para REC-206 é a existência de **dois contratos concorrentes** para obter o mesmo dado administrativo no browser:

1. **BFF same-origin (HMAC):** `fetchAdminLeads()` → `invokeFunction("admin-resources", { resource: "leads", action: "list" })`. `invokeFunction` já roteia por `/api/functions/[name]` (rota Next.js same-origin) quando executa no browser, e a Edge Function `admin-resources` exige sessão HMAC real via `requireAdmin(request)`. Este é o caminho canônico de hidratação de leads no reload (`getAdminSessionTokenValue()` = token HMAC).
2. **Cliente Supabase direto (Supabase Auth + RLS):** `fetchLeadsFromSupabase()` → `supabase.from("lead").select("*")` chamado a partir do browser dentro do bloco `supabase.auth.setSession(...)`, mais o refetch realtime (`scheduleLeadRefetch`) que reinvocava a mesma leitura direta. Isso é uma chamada **não same-origin** (direto ao domínio `*.supabase.co`) e uma **segunda forma** de obter exatamente o mesmo conjunto (leads administrativos), por uma autoridade diferente (Supabase Auth) da autoridade real de produção (HMAC).

REC-206 **consolida a leitura de leads no contrato same-origin (BFF/HMAC)** e **remove o contrato duplicado** (leitura direta via cliente Supabase browser), sem alterar a autoridade de autorização e sem construir read models novos. O reload administrativo passa a hidratar leads exclusivamente pelo mesmo contrato, eliminando a corrida entre os dois caminhos.

## Escopo

### Incluído

- `src/lib/app-store.tsx`:
  - Remoção do import e de todos os usos de `fetchLeadsFromSupabase` (leitura direta do cliente Supabase browser).
  - `scheduleLeadRefetch` passa a refazer a leitura de leads pelo BFF same-origin (`fetchAdminLeads(getAdminSessionTokenValue())`), nunca pelo cliente Supabase direto.
  - O bloco `supabase.auth.setSession(...)` deixa de ler leads pelo cliente Supabase direto; a sessão Supabase Auth ali passa a habilitar **apenas** as subscriptions realtime sob RLS (transporte inalterado). A hidratação de leads no reload continua sendo servida por `fetchAdminLeads` (BFF), que já ocorre no bootstrap.
- `src/lib/supabase/rh-cursos-api.ts`:
  - Remoção do wrapper `fetchLeadsFromSupabase()` (contrato duplicado de leitura direta no browser). O helper genérico `fetchLeadsWithClient(client)` é **mantido** (recebe o cliente por parâmetro; reutilizável server-side por REC-303).
- Testes:
  - `src/__tests__/lib/app-store.test.ts`: novo teste que prova a hidratação de leads no bootstrap **exclusivamente** pelo contrato same-origin `admin-resources` `leads/list` (HMAC), e endurecimento do `beforeEach` para restaurar os defaults dos mocks de sessão (evita vazamento de return value entre casos). Mock do módulo `rh-cursos-api` atualizado para não referenciar mais o export removido.

### Fora do escopo (deliberadamente NÃO feito)

- **Read models administrativos completos de alunos/inscrições** (hidratação server-side, paginação, filtros ricos, autorização real) — isso é **REC-303/REC-304**. Hoje `students`/`enrollments` seguem sem leitura server-side; REC-206 não adiciona esse contrato novo, apenas consolida o roteamento existente (leads).
- **Qualquer nova autoridade de autorização.** As rotas administrativas continuam usando o HMAC real de produção (`requireAdmin` em `supabase/functions/_shared/auth.ts`). `resolveServerRole`/`requireServerRole` (REC-203) **não** são consumidos nem ativados. O HMAC não é removido nem substituído.
- **Consolidação do transporte realtime (WebSocket direto ao Supabase).** As subscriptions realtime seguem conectando diretamente ao Supabase — a proxificação de WebSocket é uma mudança arquitetural maior, deixada para trabalho posterior (relacionada a REC-408). REC-206 consolida o **contrato de leitura de dados** de leads; o refetch disparado por realtime já passa a trafegar same-origin.
- **Consolidação das leituras públicas de catálogo** (`fetchPublicCatalogFromSupabase`, `fetchPublicBlogPostsFromSupabase`) do browser — são dados **públicos** (anon key, RLS público), fora do foco administrativo de FND-08; consolidação mais ampla fica documentada como diferida.
- **Tocar nos arquivos de auth HMAC de produção** (`src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts`) e nos módulos de REC-202/REC-203.

## Acceptance Criteria

1. **Leitura de leads por um único contrato same-origin (FR-08)**
   **Given** uma sessão administrativa HMAC ativa no browser,
   **when** o app inicializa (bootstrap/reload),
   **then** os leads são hidratados exclusivamente por `invokeFunction("admin-resources", { resource: "leads", action: "list" })` (roteado por `/api/functions/[name]`, same-origin, HMAC via `requireAdmin`), sem nenhuma leitura direta do cliente Supabase para o mesmo dado.

2. **Contrato duplicado removido (entrega mensurável da épica)**
   **Given** o objetivo de remover contratos duplicados,
   **when** o diff é revisado,
   **then** `fetchLeadsFromSupabase` não existe mais e nenhum código client-side lê `lead` pelo cliente Supabase browser; o refetch realtime de leads (`scheduleLeadRefetch`) também usa o BFF.

3. **Nenhuma nova autoridade de autorização (restrição dura)**
   **Given** as restrições da story,
   **when** o diff é revisado,
   **then** o HMAC de produção permanece a autoridade das rotas admin (via `requireAdmin`), e `resolveServerRole`/`requireServerRole` (REC-203) não são importados, chamados nem ativados.

4. **Read models completos NÃO implementados (fronteira com REC-303/304)**
   **Given** que REC-303/304 constroem os read models administrativos completos,
   **when** o diff é revisado,
   **then** nenhum contrato novo de leitura server-side com paginação/filtros ricos de alunos/inscrições foi adicionado; apenas o roteamento do contrato existente (leads) foi consolidado.

5. **Auth HMAC de produção e módulos de REC-202/203 intocados**
   **Given** as restrições de segurança,
   **when** o `git status` e o diff são revisados,
   **then** `src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts` e os módulos de REC-202/REC-203 não foram modificados.

6. **Verificação verde sem regressão**
   **Given** o Definition of Done,
   **when** `npm run lint`, `npm run typecheck` e `npx vitest run` são executados,
   **then** todos passam; a suíte agregada vai de 638 para 639 (+1 teste), 0 regressão.

## Tasks / Subtasks

- [x] **Task 1 — Investigar roteamento e contratos duplicados** (AC: 1, 2)
  - [x] `graphify query` orientou consumidores de `app-store.tsx` e chamadas Supabase/Edge Functions client-side.
  - [x] Confirmado que `invokeFunction` já roteia por `/api/functions/[name]` (same-origin) no browser — mutações admin e criação de lead já são same-origin.
  - [x] Identificado o contrato duplicado de LEITURA de leads: BFF `admin-resources` `leads/list` (HMAC) vs `fetchLeadsFromSupabase` (cliente Supabase direto, Supabase Auth) — mesmo dado, duas autoridades e dois transportes.
  - [x] Confirmado que `admin-resources` já suporta `{resource:"leads", action:"list"}` sob `requireAdmin` — nenhuma rota BFF nova é necessária.
  - [x] Confirmado que `students`/`enrollments` não têm leitura server-side hoje (read model é REC-303/304) — fora do escopo.

- [x] **Task 2 — Consolidar leitura de leads no BFF same-origin** (AC: 1, 2, 3)
  - [x] `src/lib/app-store.tsx`: removido import e usos de `fetchLeadsFromSupabase`.
  - [x] `scheduleLeadRefetch` repontado para `fetchAdminLeads(getAdminSessionTokenValue())` (same-origin, HMAC).
  - [x] Bloco `supabase.auth.setSession(...)` deixou de ler leads via cliente direto; passou a apenas registrar as subscriptions realtime (transporte inalterado, documentado como diferido).

- [x] **Task 3 — Remover o wrapper duplicado** (AC: 2, 4)
  - [x] `src/lib/supabase/rh-cursos-api.ts`: removido `fetchLeadsFromSupabase()`; `fetchLeadsWithClient(client)` mantido (genérico, reutilizável server-side por REC-303).

- [x] **Task 4 — Testes** (AC: 1, 2, 6)
  - [x] `src/__tests__/lib/app-store.test.ts`: novo teste "hydrates admin leads on bootstrap exclusively through the same-origin BFF (REC-206)"; mock de `rh-cursos-api` sem o export removido; `beforeEach` restaura defaults dos mocks de sessão (anti-vazamento).

- [x] **Task 5 — Verificação** (AC: 6)
  - [x] `npm run lint` → 0 erros. `npm run typecheck` → OK. `npx vitest run` → 639/639 (59 files), 0 regressão (+1 sobre 638).

## Dev Notes

### Decisão de design: consolidar o roteamento, não construir read models

`invokeFunction` já implementa o padrão BFF same-origin: no browser (`typeof window !== "undefined"`) ele chama `/api/functions/[name]`, que proxia server-side para a Edge Function. A leitura canônica de leads (`fetchAdminLeads`) já usava esse caminho. O que restava era o **segundo caminho** — `fetchLeadsFromSupabase`, uma leitura direta do cliente Supabase browser contra `*.supabase.co`, gated por uma sessão Supabase Auth paralela. Manter os dois é o "contrato duplicado" que REC-206 elimina: mesma informação, duas autoridades (HMAC vs Supabase Auth) e dois transportes (same-origin vs direto). A consolidação escolhe o caminho já canônico (BFF/HMAC) e remove o direto — sem inventar read model novo (Article IV).

### Por que a hidratação após reload melhora sem novo read model

No reload, `fetchAdminLeads(getAdminSessionTokenValue())` já hidratava leads pelo BFF. O caminho direto (`fetchLeadsFromSupabase`) só rodava sob `supabase.auth.setSession(...)` e podia sobrescrever/competir com o resultado do BFF a partir de uma visão RLS diferente. Removendo o caminho direto, a hidratação de leads no reload passa a ter uma única fonte determinística (same-origin/HMAC), coerente com FR-08.

### Realtime mantido, transporte diferido

As subscriptions realtime (`lead_changes`, `inscricao_changes`, `aluno_changes`) seguem conectando diretamente ao Supabase via WebSocket — proxificar isso é uma mudança arquitetural maior (fora do escopo, relacionada a REC-408). O que muda: o **refetch** disparado por `lead_changes` agora trafega same-origin (BFF), não mais pelo cliente Supabase direto. A sessão Supabase Auth no bloco `setSession` permanece apenas para habilitar as subscriptions sob RLS.

### Fronteira explícita com REC-303/304

`students`/`enrollments` não têm leitura server-side hoje (populados só por mutações otimistas). Construir esses read models (hidratação após reload, paginação, filtros, autorização real) é REC-303/304 e depende desta consolidação de roteamento. REC-206 não os antecipa.

### Project Structure Notes

- Não modificados: `.aiox-core/**` (L1/L2), fluxo HMAC (`src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts`), módulos de REC-202 (`src/lib/supabase/session.ts`, `app/api/auth/ssr-session/route.ts`) e REC-203 (`src/lib/supabase/authorize.ts` — não referenciado), Edge Function `supabase/functions/admin-resources/index.ts` (contrato `leads/list` já existente, apenas consumido).

## Dependências

- **Entrada:** REC-202 (sessão SSR, Done) e REC-104 (cliente público anon dedicado, Done).
- **Habilita:** REC-303 (read models de alunos/inscrições) e REC-304 (demais read models admin), que constroem os read models completos sobre o roteamento canônico.

## Roll-forward / Rollback

- **Forward-only:** mudança de roteamento aditiva/subtrativa no client. "Rollback" significaria reintroduzir o caminho direto ao Supabase (o contrato duplicado) — não desejável. Nenhuma alteração de produção (credencial/segredo/migração) é necessária.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-17 | 0.1 | **Draft.** Story criada a partir da entrada REC-206 da Épica 17 (FND-08/FR-08). Escopo: consolidar a leitura administrativa de leads no BFF same-origin e remover o contrato duplicado de leitura direta via cliente Supabase browser, sem nova autoridade de autorização e sem construir read models (REC-303/304). | @dev (Dex) |
| 2026-07-17 | 1.0 | **Draft → Ready.** Auto-validação contra o checklist de 10 pontos: título claro; contexto/valor via épica (FND-08/FR-08); ACs testáveis (Given/When/Then); escopo IN/OUT com "deliberadamente NÃO feito"; dependências mapeadas (REC-202 + REC-104; habilita REC-303/304); estimativa S–M; valor (operação admin confiável, roteamento consolidado); riscos documentados (proibição de nova autoridade/HMAC/REC-203; realtime diferido). | @dev (Dex) |
| 2026-07-17 | 1.1 | **Ready → InProgress.** Implementação: remoção de `fetchLeadsFromSupabase` (app-store + rh-cursos-api); `scheduleLeadRefetch` e reload repontados para o BFF `admin-resources` `leads/list`; teste de hidratação same-origin; HMAC e REC-203 intocados. | @dev (Dex) |
| 2026-07-17 | 1.2 | **InProgress → InReview.** Tasks 1–5 concluídas. `npm run lint` (0 erros), `npm run typecheck` (OK), `npx vitest run` (639/639, 59 files, +1 sobre 638) verdes. `git status` confirma zero arquivo de auth HMAC modificado; `grep` confirma zero consumo de REC-203. Relatório em `docs/history/reports/rec-206-consolidar-bff-canonico-2026-07-17.md`. Encaminhado a `@qa`. | @dev (Dex) |
| 2026-07-17 | 1.3 | **InReview → Done.** Gate PASS (93/100) emitido por `@qa`. Verificação independente: leitura de leads por contrato same-origin único (HMAC) confirmada; contrato duplicado removido; nenhuma autoridade nova (REC-203 não consumida); read models de alunos/inscrições NÃO antecipados; suíte 639/639. | @qa (Quinn) |

## File List

### Modificado

- `src/lib/app-store.tsx` (remoção de `fetchLeadsFromSupabase`; `scheduleLeadRefetch` e bloco `setSession` repontados para o BFF same-origin)
- `src/lib/supabase/rh-cursos-api.ts` (remoção do wrapper duplicado `fetchLeadsFromSupabase`; `fetchLeadsWithClient` mantido)
- `src/__tests__/lib/app-store.test.ts` (teste de hidratação same-origin REC-206; `beforeEach` restaura defaults de mocks de sessão; mock de `rh-cursos-api` sem o export removido)

### Criado

- `docs/stories/2026-07-17-rec-206-consolidar-bff-canonico.md`
- `docs/history/reports/rec-206-consolidar-bff-canonico-2026-07-17.md`
- `docs/qa/gates/rec-206-consolidar-bff-canonico.yml`

### Referências somente leitura (não modificadas)

- `supabase/functions/admin-resources/index.ts` (contrato `leads/list` sob `requireAdmin` — consumido)
- `app/api/functions/[name]/route.ts` (proxy BFF same-origin — consumido)
- `src/lib/supabase/functions-client.ts` (roteamento same-origin de `invokeFunction` — lido)
- `src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts` (HMAC — autoridade, intocados)
- `src/lib/supabase/session.ts`, `app/api/auth/ssr-session/route.ts` (REC-202 — intocados)
- `src/lib/supabase/authorize.ts` (REC-203 — não referenciado)

## QA Results

### Gate: PASS ✅ — @qa (Quinn), 2026-07-17

**Gate file:** [`docs/qa/gates/rec-206-consolidar-bff-canonico.yml`](../qa/gates/rec-206-consolidar-bff-canonico.yml) · **Quality score:** 93/100

Verificação independente: a leitura de leads no browser passou a ter um único contrato same-origin (`admin-resources` `leads/list`, HMAC via `requireAdmin`, roteado por `/api/functions/[name]`), confirmado por teste dedicado de bootstrap; o contrato duplicado (`fetchLeadsFromSupabase`, leitura direta do cliente Supabase browser) foi removido de `app-store.tsx` e de `rh-cursos-api.ts`, com o refetch realtime também repontado para o BFF. `grep` confirma zero consumo de `resolveServerRole`/`requireServerRole` (REC-203); `git status` confirma que os arquivos de auth HMAC de produção não foram modificados. Nenhum read model completo de alunos/inscrições foi antecipado (fronteira com REC-303/304 preservada). `npx vitest run` → `639 passed (639)`; `npm run lint`/`npm run typecheck` limpos.

**Veredito:** PASS. Roteamento de leitura de leads consolidado em same-origin; contrato duplicado removido; nenhuma autoridade de autorização introduzida; read models deixados para REC-303/304.

— Quinn, guardiã da qualidade 🛡️

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (executor)

### Debug Log / Verificação

- `npx vitest run src/__tests__/lib/app-store.test.ts src/__tests__/lib/rh-cursos-api.test.ts` → 50 passed.
- `npm run typecheck` → `Types generated successfully`, `tsc --noEmit` sem erros.
- `npm run lint` → sem erros.
- `npx vitest run` (suíte completa) → **639 passed (639), 59 files**, 0 regressão (antes de REC-206: 638/59; +1 teste).

### Completion Notes

- A consolidação afeta **o roteamento de leitura de leads no browser**: passa a existir um único contrato same-origin (BFF/HMAC), com o caminho direto ao cliente Supabase (contrato duplicado) removido.
- **Nenhuma nova autoridade de autorização**: HMAC de produção intocado (`requireAdmin`); REC-203 (`resolveServerRole`/`requireServerRole`) não consumida nem ativada.
- **Read models completos NÃO implementados**: alunos/inscrições seguem sem leitura server-side; isso é REC-303/304, habilitado por esta consolidação.
- **Diferido e documentado**: transporte realtime (WebSocket direto ao Supabase) e consolidação das leituras públicas de catálogo do browser permanecem fora do escopo desta story.
