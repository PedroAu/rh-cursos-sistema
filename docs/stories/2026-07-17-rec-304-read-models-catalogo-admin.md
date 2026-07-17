# Story REC-304: Implementar demais read models administrativos (catálogo)

## Status

Done

## Executor Assignment

executor: "@dev" (Dex) + "@data-engineer" (Dara) — read models server-side de cursos/turmas/instrutores com paginação, busca e autorização real
quality_gate: "@qa" (Quinn) — revisão independente (gate separado, fora desta story)
quality_gate_tools:
- verificação de que existem rotas same-origin NET-NEW (`app/api/admin/courses`, `app/api/admin/classes`, `app/api/admin/instructors`) que hidratam cursos/turmas/instrutores server-side após reload, com paginação e busca equivalente à UI
- verificação de que essas rotas são protegidas por `requireAdminApi()` → `requireServerRole(ssrClient, "admin")` (REC-203) sobre a sessão SSR de REC-202 — fail-closed: sem sessão → 401, papel insuficiente → 403, lockdown → 503
- verificação de que o HMAC de produção NÃO foi tocado (`src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts`, `supabase/functions/admin-resources/index.ts` intocados)
- verificação de que o escopo excluído (leads, conteúdo/blog, métricas) está documentado como pendência explícita (REC-304b), não como lacuna silenciosa
- verificação da suíte agregada sem regressão (657 → 672, +15 testes)

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** P1 — operação e UX
- **Prioridade:** P0 / SEV-0
- **Estimativa:** M
- **Findings/Requisitos:** FND-08 (listas administrativas não hidratam após reload), FR-08 (o admin deve buscar recursos por APIs autenticadas, paginadas e autorizadas, inclusive após reload), NFR-04 (fail-closed)
- **Entrega mensurável (épica):** "Cursos, turmas, instrutores, leads, conteúdo e métricas paginados."
- **Depende de:** REC-303 (Done — construiu o guard `requireAdminApi()` e o padrão de read model paginado/autorizado)
- **Bloqueia:** REC-306, REC-501 (decomposição do AppStore)

## Story

**As a** responsável pela confiabilidade da operação administrativa da RH Cursos,
**I want** que cursos, turmas e instrutores sejam servidos por rotas same-origin autenticadas, paginadas e autorizadas no servidor,
**so that** as listas administrativas do catálogo hidratem de forma confiável após reload (continua o fechamento de FND-08), com o papel resolvido na fonte a cada requisição — **sem** remover ou substituir a autoridade HMAC de produção.

## Contexto e valor

REC-303 fechou a parte alunos/inscrições de FND-08 e deixou o padrão pronto (`requireAdminApi()`, read model paginado, projeção DB→domínio, fail-closed provado por teste). REC-304 estende esse mesmo padrão aos demais recursos administrativos. A entrega mensurável da épica lista seis recursos (cursos, turmas, instrutores, leads, conteúdo, métricas); esta story implementa o **subconjunto central e mais usado** — cursos, turmas e instrutores — com rigor e testes completos, e documenta explicitamente o restante como pendência (ver "Fora do escopo").

## Decisão de escopo (menor e sólido — mesma lógica de REC-206)

Seguindo a orientação da épica ("preferir escopo menor e sólido a cobertura rasa"), esta story cobre os três recursos que formam o núcleo do catálogo e compartilham a complexidade de join `curso_instrutor`:

- **cursos** (`curso` + joins `curso_instrutor` e `turma` da página, via `mapCourse`);
- **turmas** (`turma`, via `mapClass`);
- **instrutores** (`instrutor` + join `curso_instrutor` da página, via `mapInstructor`).

Os três reutilizam integralmente as projeções DB→domínio já validadas em `src/lib/supabase/mappers.ts` — nenhum mapper novo foi criado.

## Decisão arquitetural (herdada de REC-303, não questionada)

Rotas NET-NEW protegidas por `requireAdminApi()` (que usa `requireServerRole(ssrClient, "admin")` de REC-203 sobre a sessão SSR de REC-202). Seguro porque são rotas novas sem comportamento de produção prévio a quebrar — **não** é o cutover de REC-204. A leitura usa `createSupabaseServerClient()` (service-role) apenas após autorização.

## Limitação de integração CONHECIDA e ACEITÁVEL (decisão consciente, não bug)

Idêntica a REC-303: a sessão SSR (REC-202) só é populada por `signInSSR`. O login administrativo de produção ainda usa o fluxo HMAC (`src/lib/auth.ts`), que **não** emite sessão SSR. Logo, um admin logado apenas via HMAC não possui os cookies do Supabase e recebe **401** nessas rotas novas por ora. A integração com o login de produção é escopo de **REC-305 / ajuste dedicado** — documentar, não resolver aqui.

## Contrato (No Invention — Article IV)

As formas `Course`/`TrainingClass`/`Instructor` e o único filtro exposto (busca textual) derivam exatamente do que a UI administrativa já consome (`src/lib/admin-resource-configs.tsx`): cada recurso filtra por **um** campo — cursos por título, instrutores por nome, turmas pelo título do curso. Nenhum outro filtro é exposto porque a UI não consome nenhum outro. As colunas selecionadas espelham o caminho `admin` de `fetchCatalog` (`rh-cursos-api.ts`).

**Query params das rotas (GET):** `page` (1-based, default 1), `pageSize` (default 20, máx 100), `search` (sanitizado contra o operador PostgREST).
**Resposta:** `{ ok: true, data: Course[]|TrainingClass[]|Instructor[], page, pageSize, total }`.

## Escopo

### Incluído

- `src/lib/supabase/admin-catalog-read-models.ts` (NOVO): `normalizeCatalogListParams` (paginação + busca fail-safe, sanitizada); `listCourses`/`listClasses`/`listInstructors` (query paginada com `count: "exact"`, busca via `.ilike`/`.or` com `referencedTable`, joins de página buscados via `.in(...)` scoped pelos ids da página). Reutiliza `DEFAULT_PAGE_SIZE`/`MAX_PAGE_SIZE`/`AdminListResult` de `admin-read-models.ts` e os mappers de `mappers.ts`.
- `app/api/admin/courses/route.ts` (NOVO): GET autorizado → `listCourses`.
- `app/api/admin/classes/route.ts` (NOVO): GET autorizado → `listClasses`.
- `app/api/admin/instructors/route.ts` (NOVO): GET autorizado → `listInstructors`.
- Testes:
  - `src/__tests__/lib/admin-catalog-read-models.test.ts` (NOVO): normalização fail-safe, montagem da query paginada/filtrada, joins scoped por página, projeção DB→domínio, propagação de erro.
  - `src/__tests__/app/api/admin-catalog-read-models-route.test.ts` (NOVO): guard REAL — sem sessão → 401 (sem consulta ao banco), papel insuficiente → 403, lockdown → 503, admin válido → 200 paginado.

### Fora do escopo (deliberadamente NÃO feito — pendência explícita "REC-304b")

- **Leads:** a leitura administrativa de leads **já é servida** por `admin-resources` (`leads/list`, HMAC via `requireAdmin`), consolidada em REC-206. Criar uma segunda rota SSR duplicaria autoridade e pisaria em território de REC-206/REC-204 — deixado como pendência de consolidação futura, não reimplementado aqui.
- **Conteúdo (blog):** projeção `mapBlogPost` existe e a leitura seria trivial, mas o recurso não faz parte do núcleo do catálogo priorizado nesta rodada; fica documentado como REC-304b.
- **Métricas:** **não há contrato de read-model server-side identificável.** As métricas administrativas (stats bento em `admin-resource-configs.tsx`, `admin-dashboard-page.tsx`) são **derivadas no cliente** a partir das listas já carregadas na store (ex.: `activeCourses`, `occupancyRate`, `leadConversionRate`). Não existe uma tabela/endpoint de métricas que a UI consuma. Implementar um seria inventar contrato (viola Article IV). Fica documentado como pendência a ser especificada (REC-304b) caso um dashboard server-side venha a ser desejado.
- **Cutover de autoridade (REC-204):** trocar rotas HMAC já em produção para a sessão SSR. PROIBIDO nesta story.
- **Integração da UI de produção com o novo read model:** a UI ainda autentica via HMAC (ver limitação). Escopo de REC-305.
- **Alterar qualquer caminho HMAC:** `src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts`, `supabase/functions/admin-resources/index.ts` permanecem intocados.

## Acceptance Criteria

- [x] **AC-304.01** — Existem rotas same-origin NET-NEW que hidratam cursos, turmas e instrutores server-side após reload (`app/api/admin/courses`, `app/api/admin/classes`, `app/api/admin/instructors`), com paginação (`page`/`pageSize`) e busca equivalente à UI (título/nome/título do curso).
- [x] **AC-304.02** — As rotas são protegidas por `requireAdminApi()` → `requireServerRole(ssrClient, "admin")` (REC-203) sobre a sessão SSR de REC-202, com o papel resolvido na fonte a cada requisição.
- [x] **AC-304.03** — Fail-closed comprovado por teste: sem sessão → 401 (sem consultar o banco); papel insuficiente (student) → 403; lockdown → 503; nenhum dado vaza em caminho negado.
- [x] **AC-304.04** — Admin válido → 200 com dados paginados corretos; a busca chega ao read model e produz a query esperada; os joins de página (`curso_instrutor`/`turma`) são buscados scoped pelos ids da página (`.in(...)`).
- [x] **AC-304.05** — Projeções reutilizam `mapCourse`/`mapClass`/`mapInstructor` (No Invention); colunas espelham o caminho `admin` de `fetchCatalog`; leituras usam `createSupabaseServerClient()` (service-role) apenas após autorização; a busca é sanitizada contra injeção PostgREST.
- [x] **AC-304.06** — HMAC de produção intocado: `src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts`, `supabase/functions/admin-resources/index.ts` sem modificação.
- [x] **AC-304.07** — Escopo excluído (leads, conteúdo/blog, métricas) documentado como pendência explícita (REC-304b), com justificativa por recurso (leads já em REC-206; métricas sem contrato server-side — No Invention).
- [x] **AC-304.08** — Baseline constitucional verde: lint OK, typecheck OK, suíte agregada 657 → 672 (+15), sem regressão.

## File List

### Criados
- `src/lib/supabase/admin-catalog-read-models.ts`
- `app/api/admin/courses/route.ts`
- `app/api/admin/classes/route.ts`
- `app/api/admin/instructors/route.ts`
- `src/__tests__/lib/admin-catalog-read-models.test.ts`
- `src/__tests__/app/api/admin-catalog-read-models-route.test.ts`
- `docs/stories/2026-07-17-rec-304-read-models-catalogo-admin.md`
- `docs/history/reports/rec-304-read-models-catalogo-admin-2026-07-17.md`
- `docs/qa/gates/rec-304-read-models-catalogo-admin.yml`

### Modificados
- `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md` (linha de status)

## Verificação

- `npm run lint` → OK
- `npm run typecheck` → OK
- `npx vitest run` → 63 arquivos, **672/672** (baseline 657 + 15 novos), sem regressão
