# Relatório de Execução — REC-303: Read models de alunos e inscrições

- **Data:** 2026-07-17
- **Story:** [REC-303](../../stories/2026-07-17-rec-303-read-models-alunos-inscricoes.md)
- **Épica:** Épica 17 — Recuperação SEV-0
- **Onda:** P1 — operação e UX
- **Finding fechado:** FND-08 (parte de alunos/inscrições) — via FR-08 / NFR-04
- **Entrega mensurável:** "Reload, paginação e filtros retornam dados autorizados."

## 1. Problema (FND-08)

Até REC-206, **não havia leitura server-side** de alunos/inscrições. `admin-resources` só atende `list` para `leads` (o resto retorna `{ skipped: true }`), e `app-store.tsx` nasce com `students: []`/`enrollments: []` sem re-hidratação no reload — só leads são refeitos via `fetchAdminLeads`. Após reload, as listas de alunos/inscrições ficavam vazias: operação administrativa não confiável.

## 2. Solução implementada

Caminho **net-new**, sem tocar nenhum contrato de produção:

- **`src/lib/supabase/admin-read-models.ts`** — projeção DB→domínio: uma linha por `inscricao`, com `aluno` (nome, email, cpf, telefone, cargo, orgão, tipo_aluno) e `turma` (curso_id) embutidos via inner join. Converte enums na direção inversa (`fromDbEnrollmentStatus`, `fromDbStudentType`, `fromDbPaymentMethod`, espelhando os `toDb*` já existentes). `normalizeListParams` normaliza paginação e filtros de forma fail-safe (página/tamanho válidos e limitados a 100; status só aceito se for um `EnrollmentStatus` conhecido; busca sanitizada removendo os caracteres do operador PostgREST `.or()`). `listEnrollments`/`listStudents` montam a query com `count: "exact"`, `.order("created_at")`, filtros `.eq("turma_id")`/`.eq("status_inscricao")`, busca `.or(nome/email ilike, { referencedTable: "aluno" })` e `.range()` para a página.
- **`src/lib/supabase/admin-api-auth.ts`** — guard `requireAdminApi()`: lockdown/config → 503; `requireServerRole(ssrClient, "admin")` (REC-203) sobre a sessão SSR de REC-202; fail-closed 401 (sem sessão) / 403 (papel insuficiente); só devolve o cliente privilegiado (`createSupabaseServerClient()`, service-role) quando autorizado.
- **`app/api/admin/enrollments/route.ts`** e **`app/api/admin/students/route.ts`** — GET same-origin que aplicam o guard e delegam para os read models.

### Contrato (No Invention)

Formas `Enrollment`/`Student` e filtros (turma, status, busca por nome/email) derivam do que a UI já consome (`src/types/index.ts`, `AdminResourcePage`, `app-store.tsx`). Nenhum campo/filtro novo inventado. Resposta: `{ ok, data, page, pageSize, total }`.

## 3. Primeira ativação real de REC-203

Esta é a **primeira vez** que `requireServerRole()` (REC-203) é ligado a uma rota concreta. Seguro porque as rotas são **net-new** (REC-206 confirmou a ausência de leitura server-side desses dados): não há comportamento de produção para quebrar nem risco de lockout. **Não** é o cutover de REC-204 (troca de autoridade de rotas HMAC já em produção), que permanece proibido e fora de escopo.

## 4. Limitação de integração com o login HMAC (decisão consciente, NÃO bug)

**Registro explícito, conforme exigido pela story.** A sessão SSR (REC-202) só é populada por `signInSSR`. O login administrativo de produção usa o fluxo HMAC (`src/lib/auth.ts`), que **não** emite sessão SSR paralela. Portanto:

> Um admin logado **apenas via HMAC** não possui os cookies do Supabase e recebe **401** nessas rotas novas. Elas hoje podem não ser consumíveis pela UI de produção.

Isto é **intencional e aceitável** para REC-303. O objetivo aqui foi **construir e testar o mecanismo com autorização real**, não entregá-lo 100% consumível pela UI hoje. A integração com o login de produção é escopo de **REC-305 / ajuste dedicado**. Popular a sessão SSR a partir do HMAC seria pisar em **REC-204/305** e foi deliberadamente evitado. A decisão está documentada em três lugares: esta seção, o cabeçalho de `src/lib/supabase/admin-api-auth.ts` e a story.

## 5. HMAC de produção intocado

Confirmado (sem `git diff` nesses caminhos): `src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts` e `supabase/functions/admin-resources/index.ts` permanecem **sem modificação**. Nenhuma autoridade de produção foi removida ou substituída.

## 6. Testes

- **`src/__tests__/lib/admin-read-models.test.ts`** — conversões inversas de enum; projeção `mapDbEnrollment`/`mapDbStudent` (inclusive embed devolvido como array); `normalizeListParams` fail-safe (defaults, cap de pageSize, status desconhecido rejeitado, busca sanitizada); query paginada/filtrada correta (range/order/eq/or com `referencedTable`); propagação de erro do banco.
- **`src/__tests__/app/api/admin-read-models-route.test.ts`** — guard REAL (`requireServerRole`): sem sessão → 401 sem consultar o banco; student → 403; lockdown → 503 antes de qualquer autorização; admin → 200 com dados paginados; filtros de query chegam ao read model.

**Contagem:** 18 testes novos. Suíte agregada **639 → 657** (+18), sem regressão.

## 7. Verificação (evidência fresca)

| Gate | Comando | Resultado |
|---|---|---|
| Lint | `npm run lint` | OK |
| Typecheck | `npm run typecheck` | OK |
| Testes | `npx vitest run` | 61 arquivos, **657/657** |

## 8. Follow-ups

- **REC-305 / ajuste dedicado:** integrar a UI de produção ao read model (login que popule a sessão SSR ou ponte HMAC→SSR), tornando as rotas consumíveis pela UI real.
- **REC-304:** demais read models administrativos (cursos, turmas, instrutores, leads, conteúdo, métricas) sobre o mesmo padrão de guard.
