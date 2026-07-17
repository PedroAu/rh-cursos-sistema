# Relatório de Execução — REC-304: Read models de catálogo (cursos/turmas/instrutores)

- **Data:** 2026-07-17
- **Story:** [REC-304](../../stories/2026-07-17-rec-304-read-models-catalogo-admin.md)
- **Épica:** Épica 17 — Recuperação SEV-0
- **Onda:** P1 — operação e UX
- **Finding continuado:** FND-08 (parte catálogo) — via FR-08 / NFR-04
- **Entrega mensurável (épica):** "Cursos, turmas, instrutores, leads, conteúdo e métricas paginados."

## 1. Problema (FND-08)

Assim como alunos/inscrições (fechados em REC-303), as listas administrativas de catálogo não hidratam server-side após reload por um caminho autenticado e paginado dedicado. REC-304 estende o padrão de REC-303 aos recursos centrais do catálogo.

## 2. Decisão de escopo (menor e sólido)

A entrega mensurável da épica lista seis recursos. Seguindo a orientação de "preferir escopo menor e sólido a cobertura rasa" (mesma lógica de REC-206), esta rodada implementa com rigor e testes completos o **núcleo do catálogo**:

| Recurso | Implementado | Projeção reutilizada |
|---|---|---|
| Cursos | ✅ `/api/admin/courses` | `mapCourse` (+ joins `curso_instrutor`, `turma`) |
| Turmas | ✅ `/api/admin/classes` | `mapClass` |
| Instrutores | ✅ `/api/admin/instructors` | `mapInstructor` (+ join `curso_instrutor`) |
| Leads | ⏭️ pendência REC-304b | já servido por `admin-resources` `leads/list` (REC-206) |
| Conteúdo (blog) | ⏭️ pendência REC-304b | `mapBlogPost` existe; fora do núcleo priorizado |
| Métricas | ⏭️ pendência REC-304b | **sem contrato server-side** — derivadas no cliente |

### Por que leads/conteúdo/métricas ficaram de fora (explícito, não lacuna silenciosa)

- **Leads:** a leitura administrativa de leads **já existe** e foi consolidada em REC-206 (`admin-resources` `leads/list`, HMAC via `requireAdmin`, roteado por `/api/functions/[name]`). Criar uma segunda rota SSR duplicaria a autoridade de leitura de leads e pisaria em território de REC-206/REC-204. Deixado como consolidação futura.
- **Conteúdo (blog):** projeção `mapBlogPost` e o shape de query (`fetchAdminBlogPostsFromSupabaseServer`) já existem, tornando a implementação trivial — mas o blog não faz parte do núcleo do catálogo priorizado. Documentado como REC-304b para manter esta story enxuta e sólida.
- **Métricas:** **não há contrato de read-model server-side.** As métricas administrativas (stats bento em `admin-resource-configs.tsx`, cards em `admin-dashboard-page.tsx`) são **derivadas no cliente** a partir das listas já na store (ex.: `activeCourses`, `upcomingClasses`, `occupancyRate`, `leadConversionRate`, `completionRate`). Não existe tabela nem endpoint de métricas que a UI consuma. Implementar um seria **inventar contrato** (viola Article IV — No Invention). Documentado como pendência a especificar (REC-304b) caso um dashboard server-side agregado venha a ser desejado.

## 3. Solução implementada

Caminho **net-new**, sem tocar nenhum contrato de produção:

- **`src/lib/supabase/admin-catalog-read-models.ts`** — três read models paginados:
  - `listCourses`: `curso` (colunas do caminho admin de `fetchCatalog`), `count: "exact"`, `.is("deleted_at", null)`, `.order("titulo")`, busca `.ilike("titulo", %search%)`, `.range()`. Para os cursos da página, busca `curso_instrutor` e `turma` scoped por `.in("curso_id", pageIds)` e alimenta `mapCourse(row, joins, classes)` (instrutor principal + próxima turma).
  - `listClasses`: `turma` (colunas admin), `count: "exact"`, deleted_at null, `.order("data_inicio")`, `.range()`; busca pelo título do curso via embed `curso:curso_id!inner(titulo)` + `.or("titulo.ilike.%...%", { referencedTable: "curso" })` (mesmo padrão de REC-303). `mapClass`.
  - `listInstructors`: `instrutor` (colunas admin), `count: "exact"`, deleted_at null, `.order("nome")`, busca `.ilike("nome", %search%)`, `.range()`. Para os instrutores da página, busca `curso_instrutor` scoped por `.in("instrutor_id", pageIds)` → `mapInstructor(row, joins)`.
  - `normalizeCatalogListParams`: paginação fail-safe (página/tamanho válidos, cap 100) + busca sanitizada (remove caracteres do operador PostgREST). Reutiliza `DEFAULT_PAGE_SIZE`/`MAX_PAGE_SIZE`/`AdminListResult` de `admin-read-models.ts`.
- **`app/api/admin/courses|classes|instructors/route.ts`** — GET same-origin que aplicam `requireAdminApi()` e delegam para os read models. Mesma estrutura das rotas de REC-303.

### Contrato (No Invention)

Formas `Course`/`TrainingClass`/`Instructor` e o único filtro (busca) derivam do que a UI já consome (`admin-resource-configs.tsx`: cursos filtram por título, instrutores por nome, turmas pelo título do curso). Nenhum campo/filtro novo inventado. Resposta: `{ ok, data, page, pageSize, total }`.

## 4. Autorização (herdada de REC-303)

As rotas usam o guard `requireAdminApi()` (REC-303): lockdown/config → 503; `requireServerRole(ssrClient, "admin")` (REC-203) sobre a sessão SSR de REC-202; fail-closed 401 (sem sessão) / 403 (papel insuficiente); só devolve o cliente privilegiado quando autorizado. **Não** é o cutover de REC-204.

## 5. Limitação de integração com o login HMAC (decisão consciente, NÃO bug)

Idêntica a REC-303 e explícita: a sessão SSR só é populada por `signInSSR`; o login admin de produção é HMAC (`src/lib/auth.ts`), que não emite sessão SSR. Um admin logado só via HMAC recebe **401** nessas rotas novas. Intencional — a integração fica para **REC-305 / ajuste dedicado**.

## 6. HMAC de produção intocado

Confirmado: `src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts` e `supabase/functions/admin-resources/index.ts` permanecem **sem modificação**. Nenhuma autoridade de produção foi removida ou substituída.

## 7. Testes

- **`src/__tests__/lib/admin-catalog-read-models.test.ts`** — normalização fail-safe (defaults, cap de pageSize, busca sanitizada); montagem correta da query paginada/filtrada (range/order/ilike/or com `referencedTable`); joins scoped por página (`.in`); projeção DB→domínio (`mapCourse` com instrutor/próxima turma, `mapClass`, `mapInstructor` com courseIds); propagação de erro do banco.
- **`src/__tests__/app/api/admin-catalog-read-models-route.test.ts`** — guard REAL (`requireServerRole`): sem sessão → 401 sem consultar o banco; student → 403; lockdown → 503; admin → 200 paginado (cursos, turmas e instrutores).

**Contagem:** 15 testes novos. Suíte agregada **657 → 672** (+15), sem regressão.

## 8. Verificação (evidência fresca)

| Gate | Comando | Resultado |
|---|---|---|
| Lint | `npm run lint` | OK |
| Typecheck | `npm run typecheck` | OK |
| Testes | `npx vitest run` | 63 arquivos, **672/672** |

## 9. Follow-ups

- **REC-304b (pendência documentada, não criada formalmente):** ler leads por rota SSR (consolidar com REC-206), read model de conteúdo/blog e — se desejado — um contrato server-side de métricas agregadas (hoje derivadas no cliente; especificar antes de implementar, para não inventar contrato).
- **REC-305 / ajuste dedicado:** integrar a UI de produção aos read models (login que popule a sessão SSR ou ponte HMAC→SSR), tornando as rotas consumíveis pela UI real.
