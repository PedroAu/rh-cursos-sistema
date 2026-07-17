# Relatório — REC-101: Revogar RPC pública de inscrição

> Nenhum dado real de aluno é reproduzido neste documento.

Story: [`docs/stories/2026-07-15-rec-101-revogar-rpc-inscricao-publica.md`](../../stories/2026-07-15-rec-101-revogar-rpc-inscricao-publica.md) · Épica 17, Onda 1 · Executor: `@data-engineer`.

## 1. Resumo do estado final

| Item | Antes | Depois |
|---|---|---|
| `grant execute` em `public.registrar_inscricao_publica` | `anon, authenticated` | revogado de `anon`, `authenticated` e `public` (defesa em profundidade) |
| `service_role` | executa | continua executando (inalterado) |
| Endpoint `supabase/functions/enrollments/index.ts` | inscreve alunos via `anonClient()` | passa a receber erro de permissão ao chamar a RPC (mesma role revogada) — indisponibilidade temporária aceita, restaurada por REC-104/REC-105/REC-107 |

## 2. Arquivos criados

- `supabase/migrations/20260715100000_revoke_public_enrollment_rpc.sql` — `revoke execute ... from anon, authenticated` e `revoke execute ... from public`, usando a assinatura completa de parâmetros da função.
- `supabase/tests/database/rec-101-revoke-public-enrollment-rpc.test.sql` — 8 asserções `pgTAP` (ajustado nesta sessão de 9 para 8: uma asserção sobre `public.lead` foi removida por sobreposição com o escopo de REC-102, que revoga esse insert na mesma sequência de migrations — ver §4).

## 3. Validação — executada contra banco real (ambiente de teste local, Docker)

`npm run test:db` executa `supabase db reset --local` (aplica todas as migrations do zero, incluindo esta) seguido de `supabase test db --local`, contra Postgres real em container.

Resultado final consolidado (após o ajuste do §4): suíte completa **PASS**, `Files=6, Tests=58`, todos os arquivos `ok`, incluindo `rec-101-revoke-public-enrollment-rpc.test.sql` (8/8).

Asserções cobertas pelo teste, todas a nível de ACL de banco (`has_function_privilege`/`has_table_privilege`), equivalente correto ao que o PostgREST consulta para autorizar uma chamada real:

1. `anon` não tem `execute` na RPC após a revogação.
2. `authenticated` (sem privilégio adicional) também não tem `execute`.
3. `public` (pseudo-role herdado) também não tem `execute` residual — confirma ausência de brecha por herança.
4. `service_role` continua com `execute` — a revogação não atinge o caminho de service role.
5. Idempotência: `revoke` reaplicado não gera erro nem muda o resultado.
6. Sem regressão: `is_admin()` continua executável por `authenticated`.
7. Sem regressão de leitura pública: `anon` mantém `select` em `public.curso`.
8. Sem regressão de leitura pública: `authenticated` mantém `select` em `public.turma`.

## 4. Ajuste de teste por interação com REC-102 (transparência)

A versão original do teste desta story incluía uma 9ª asserção verificando que `anon` **mantinha** `insert` em `public.lead` (citada como "fora do escopo de REC-101"). Como a migration da REC-102 (timestamp posterior, aplicada na mesma sequência de `supabase db reset`) revoga esse insert como parte do seu próprio escopo, essa asserção ficou desatualizada e foi removida nesta sessão — a checagem equivalente já existe em `rec-102-revoke-anon-lead-insert.test.sql`. Nenhuma asserção relativa ao escopo real de REC-101 (a RPC de inscrição) foi alterada.

## 5. Validação HTTP real — gap explícito

A validação HTTP real via PostgREST (`curl` com chave `anon`/`authenticated` contra o endpoint REST) **não foi executada** para esta story especificamente. `has_function_privilege()` consulta o mesmo catálogo ACL (`pg_proc`) que o PostgREST usa para autorizar `rpc/registrar_inscricao_publica`, sendo o equivalente correto a nível de banco, mas a chamada HTTP fim-a-fim não foi disparada nesta story (diferente de REC-102, que rodou o teste HTTP real via `supabase start`). Recomenda-se a `@qa` decidir se a evidência de ACL é suficiente para PASS ou se exige a chamada HTTP real antes de fechar o gate.

## 6. Impacto aceito no endpoint controlado (AC5)

`supabase/functions/enrollments/index.ts` chama `registrar_inscricao_publica` via `anonClient()` — mesma role revogada por esta migration. Nenhuma alteração de código foi feita neste arquivo (fora do escopo desta story); a indisponibilidade de inscrição pública é uma consequência intencional e aceita, documentada na Épica 17 (Onda 1: "operações públicas inseguras permanecem bloqueadas até G1/G2"), restaurada por REC-104 (cliente anon dedicado), REC-105 (atomicidade) e REC-107 (endurecimento do endpoint).

## 7. AC → evidência

| AC | Evidência |
|---|---|
| 1 — execução pública/anônima negada | §3, asserções 1 e 3 (ACL de banco); validação HTTP real é gap explícito (§5) |
| 2 — `authenticated` sem privilégio negado | §3, asserção 2 |
| 3 — migration forward-only e idempotente | §3, asserção 5 |
| 4 — nenhuma outra função afetada | §3, asserções 4, 6 |
| 5 — indisponibilidade documentada e aceita | §6 |
| 6 — sem regressão de leitura pública | §3, asserções 7, 8 |
| 7 — gate independente | Pendente — a cargo de `@qa` |

## 8. Lint / typecheck

Migration e teste SQL não são cobertos por `npm run lint`/`npm run typecheck` (escopo TypeScript/Deno apenas); validação aplicável é a suíte `pgTAP` em si (§3), que passou integralmente.
