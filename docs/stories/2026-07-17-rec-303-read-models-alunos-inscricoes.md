# Story REC-303: Implementar read models de alunos e inscrições

## Status

Done

## Executor Assignment

executor: "@dev" (Dex) + "@data-engineer" (Dara) — read models server-side de alunos/inscrições com paginação, filtros e autorização real
quality_gate: "@qa" (Quinn) — revisão independente (gate separado, fora desta story)
quality_gate_tools:
- verificação de que existem rotas same-origin NET-NEW (`app/api/admin/students`, `app/api/admin/enrollments`) que hidratam alunos/inscrições server-side após reload, com paginação e filtros (turma, status, busca por nome/email)
- verificação de que essas rotas são protegidas por `requireServerRole(ssrClient, "admin")` (REC-203) sobre a sessão SSR de REC-202 — fail-closed: sem sessão → 401, papel insuficiente → 403
- verificação de que o HMAC de produção NÃO foi tocado (`src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts`, `supabase/functions/admin-resources/index.ts` intocados)
- verificação de que a limitação de integração com o login HMAC está documentada como decisão consciente (não bug)
- verificação da suíte agregada sem regressão (639 → 657, +18 testes)

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** P1 — operação e UX
- **Prioridade:** P0 / SEV-0
- **Estimativa:** M
- **Findings/Requisitos:** FND-08 (listas administrativas de alunos/inscrições não hidratam corretamente após reload), FR-08 (o admin deve buscar recursos por APIs autenticadas, paginadas e autorizadas, inclusive após reload), NFR-04 (fail-closed)
- **Entrega mensurável (épica):** "Reload, paginação e filtros retornam dados autorizados."
- **Depende de:** REC-203 (mecanismo de autorização server-side — `requireServerRole`, Done, nunca ativado em rota real até aqui) e REC-206 (BFF canônico, Done — confirmou que não existe leitura server-side de alunos/inscrições; território net-new)
- **Bloqueia:** REC-304 (demais read models admin), REC-306, REC-307, G4 (reabertura)

## Story

**As a** responsável pela confiabilidade da operação administrativa da RH Cursos,
**I want** que alunos e inscrições sejam servidos por rotas same-origin autenticadas, paginadas e autorizadas no servidor,
**so that** a lista administrativa hidrate de forma confiável após reload (fecha FND-08), com o papel resolvido na fonte a cada requisição — **sem** remover ou substituir a autoridade HMAC de produção.

## Contexto e valor

FND-08 registra que "listas administrativas de alunos/inscrições não hidratam corretamente após reload", com consequência "operação administrativa não confiável". A causa estrutural: até REC-206, **não existia leitura server-side** desses dados. `supabase/functions/admin-resources/index.ts` só atende `list` para `leads` (todo o resto retorna `{ skipped: true }`), e `src/lib/app-store.tsx` nasce com `students: []`/`enrollments: []` sem nenhum caminho de re-hidratação no reload (apenas leads são refeitos via `fetchAdminLeads`). Logo, após reload, as listas de alunos/inscrições permanecem vazias.

REC-206 confirmou (e deixou registrado) que os read models completos de alunos/inscrições ficariam para REC-303/304. Esta story constrói esse caminho net-new: rotas same-origin que leem `inscricao` (com `aluno`/`turma` embutidos), paginadas e filtráveis, autorizadas server-side.

## Decisão arquitetural (primeira ativação real de REC-203)

REC-303 é a **primeira ativação real de `requireServerRole()`** (REC-203) em rota concreta, mas **apenas para as rotas NOVAS** criadas aqui. Isso é seguro porque:

- **(a)** não existe hoje nenhuma rota real servindo esse dado com autorização adequada (per REC-206), logo não há comportamento existente para quebrar nem risco de lockout;
- **(b)** isso é qualitativamente **diferente de REC-204** (que trocaria a autoridade de rotas administrativas JÁ em produção do HMAC para a sessão SSR — o cutover real, que permanece PROIBIDO e fora de escopo). Aqui apenas construímos um caminho novo sobre um mecanismo já testado.

## Limitação de integração CONHECIDA e ACEITÁVEL (decisão consciente, não bug)

A sessão SSR (REC-202) só é populada por um login real via `signInSSR`. O login administrativo de produção ainda usa o fluxo HMAC (`src/lib/auth.ts`), que **não** emite sessão SSR paralela. Consequência: um admin logado apenas via HMAC **não possui** os cookies do Supabase e receberá **401** nessas rotas novas — elas hoje podem ficar não consumíveis pela UI de produção.

Isto é **aceitável e intencional** para esta story. O objetivo de REC-303 é **construir e testar o mecanismo com dados reais e autorização real**, não necessariamente entregá-lo 100% consumível pela UI hoje. A integração com o login de produção é escopo de uma story futura (REC-305 / ajuste dedicado). **Não** popular a sessão SSR a partir do login HMAC foi decisão deliberada — isso seria pisar em escopo de REC-204/305.

## Escopo

### Incluído

- `src/lib/supabase/admin-read-models.ts` (NOVO): projeção DB→domínio de `inscricao` (com `aluno`/`turma` embutidos) para `Enrollment`/`Student`; conversões inversas de enum (`fromDbEnrollmentStatus`, `fromDbStudentType`, `fromDbPaymentMethod`); `normalizeListParams` (paginação + filtros fail-safe, busca sanitizada contra o operador PostgREST `.or()`); `listEnrollments`/`listStudents` (query paginada com `count: "exact"`, filtros por turma/status/busca via inner join).
- `src/lib/supabase/admin-api-auth.ts` (NOVO): guard `requireAdminApi()` — lockdown/config → 503; `requireServerRole(ssrClient, "admin")` sobre a sessão SSR (REC-202); fail-closed 401/403; devolve o cliente privilegiado (service-role) só quando autorizado.
- `app/api/admin/enrollments/route.ts` (NOVO): GET autorizado → `listEnrollments`.
- `app/api/admin/students/route.ts` (NOVO): GET autorizado → `listStudents`.
- Testes:
  - `src/__tests__/lib/admin-read-models.test.ts` (NOVO): projeção DB→domínio, `normalizeListParams` fail-safe, montagem correta da query paginada/filtrada, propagação de erro.
  - `src/__tests__/app/api/admin-read-models-route.test.ts` (NOVO): guard REAL — sem sessão → 401 (sem consulta ao banco), papel insuficiente → 403, lockdown → 503, admin válido → 200 com dados paginados, filtros de query chegam ao read model.

### Fora do escopo (deliberadamente NÃO feito)

- **Cutover de autoridade (REC-204):** trocar rotas administrativas HMAC já em produção para a sessão SSR. PROIBIDO nesta story.
- **Integração da UI de produção com o novo read model:** a UI ainda autentica via HMAC, que não popula a sessão SSR (ver limitação acima). Escopo de REC-305 / ajuste futuro.
- **Popular a sessão SSR a partir do login HMAC:** escopo de REC-204/305.
- **Demais read models administrativos** (cursos, turmas, instrutores, leads, conteúdo, métricas): REC-304.
- **Alterar qualquer caminho HMAC:** `src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts`, `supabase/functions/admin-resources/index.ts` permanecem intocados.

## Contrato (No Invention — Article IV)

Os filtros (turma, status, busca por nome/email) e as formas `Enrollment`/`Student` derivam exatamente do que a UI administrativa já consome (`src/types/index.ts`, `AdminResourcePage`, `app-store.tsx`). Nenhum campo ou filtro novo foi inventado.

**Query params das rotas (GET):** `page` (1-based, default 1), `pageSize` (default 20, máx 100), `classId` (turma), `status` (`EnrollmentStatus` conhecido), `search` (nome/email, sanitizado).
**Resposta:** `{ ok: true, data: Enrollment[]|Student[], page, pageSize, total }`.

## Acceptance Criteria

- [x] **AC-303.01** — Existem rotas same-origin NET-NEW que hidratam alunos e inscrições server-side após reload (`app/api/admin/students`, `app/api/admin/enrollments`), com paginação (`page`/`pageSize`) e filtros (turma, status, busca por nome/email). Entrega mensurável da épica: "Reload, paginação e filtros retornam dados autorizados."
- [x] **AC-303.02** — As rotas são protegidas por `requireServerRole(ssrClient, "admin")` (REC-203, primeira ativação real) sobre a sessão SSR de REC-202, com o papel resolvido na fonte a cada requisição.
- [x] **AC-303.03** — Fail-closed comprovado por teste: sem sessão → 401 (sem consultar o banco); papel insuficiente (student) → 403; lockdown → 503; nenhum dado vaza em caminho negado.
- [x] **AC-303.04** — Admin válido → 200 com dados paginados corretos; filtros (turma/status/busca) chegam ao read model e produzem a query esperada (`.eq`, `.or` com `referencedTable: "aluno"`, `.range`).
- [x] **AC-303.05** — Leituras usam `createSupabaseServerClient()` (service-role) apenas após autorização; a busca é sanitizada contra injeção no filtro PostgREST.
- [x] **AC-303.06** — HMAC de produção intocado: `src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts`, `supabase/functions/admin-resources/index.ts` sem modificação.
- [x] **AC-303.07** — A limitação de integração com o login HMAC (rotas hoje não consumíveis por admin logado só via HMAC) está documentada como decisão consciente, não bug (esta story + `admin-api-auth.ts` + relatório).
- [x] **AC-303.08** — Baseline constitucional verde: lint OK, typecheck OK, suíte agregada 639 → 657 (+18), sem regressão.

## File List

### Criados
- `src/lib/supabase/admin-read-models.ts`
- `src/lib/supabase/admin-api-auth.ts`
- `app/api/admin/enrollments/route.ts`
- `app/api/admin/students/route.ts`
- `src/__tests__/lib/admin-read-models.test.ts`
- `src/__tests__/app/api/admin-read-models-route.test.ts`
- `docs/stories/2026-07-17-rec-303-read-models-alunos-inscricoes.md`
- `docs/history/reports/rec-303-read-models-alunos-inscricoes-2026-07-17.md`
- `docs/qa/gates/rec-303-read-models-alunos-inscricoes.yml`

### Modificados
- `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md` (linha de status)

## Verificação

- `npm run lint` → OK
- `npm run typecheck` → OK
- `npx vitest run` → 61 arquivos, **657/657** (baseline 639 + 18 novos), sem regressão
