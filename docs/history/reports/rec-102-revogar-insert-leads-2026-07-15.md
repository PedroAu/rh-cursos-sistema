# Relatório — REC-102: Revogar insert anônimo de leads

> Nenhum dado real de lead (nome, e-mail, telefone) é reproduzido neste documento. Todos os identificadores de teste usam domínio sintético `@rhcursos.test`. Nenhuma chave/secret de produção é reproduzida; as chaves citadas são as chaves padrão compartilhadas do ambiente `supabase start` local (documentadas como não sensíveis pelo próprio CLI).

Story: [`docs/stories/2026-07-15-rec-102-revogar-insert-anonimo-leads.md`](../../stories/2026-07-15-rec-102-revogar-insert-anonimo-leads.md) · Épica 17, Onda 1 · Executores: `@data-engineer` (migration/policy) + `@dev` (ajuste do endpoint controlado).

## 1. Resumo do estado final

| Item | Antes | Depois |
|---|---|---|
| `grant insert on public.lead` | `anon, authenticated` | revogado de `anon, authenticated`; concedido explicitamente a `service_role` |
| Policy `lead_public_insert` | `for insert to anon, authenticated with check (true)` | removida |
| Persistência em `supabase/functions/leads/index.ts` | `anonClient()` | `adminClient()` (service-role, server-only) |
| Caminho de escrita em `public.lead` | qualquer chamador com chave `anon` via PostgREST, ou o endpoint | somente o endpoint controlado (via `service_role`) |

## 2. Arquivos alterados/criados

- **Criado:** `supabase/migrations/20260715110000_revoke_anon_lead_insert.sql` — revoga o grant de insert de `anon`/`authenticated`, remove a policy `lead_public_insert`, concede insert explícito a `service_role`.
- **Alterado:** `supabase/functions/leads/index.ts` — troca `anonClient()` por `adminClient()` na chamada de persistência (linha do `const supabase = ...`). Nenhuma outra lógica do arquivo foi tocada por esta story; a única outra diferença presente no arquivo (import/uso de `isLockdownActive`/`LOCKDOWN_RESPONSE_BODY`) é do REC-003, implementado em paralelo por outro agente, preservada sem modificação.
- **Criado:** `supabase/tests/database/rec-102-revoke-anon-lead-insert.test.sql` — 5 asserções pgTAP: `anon` negado (AC1), `authenticated` sem service role negado (AC2), `service_role` continua inserindo (AC3, caminho equivalente ao usado pelo endpoint), grants de `public.curso` para `authenticated` inalterados (AC6), grant de `select` em `public.lead` para `authenticated` inalterado (regressão de leitura administrativa).

Nota sobre timestamp: a migration inicialmente criada como `20260715100000_revoke_anon_lead_insert.sql` colidiu com `20260715100000_revoke_public_enrollment_rpc.sql`, criada em paralelo pelo executor de REC-101 (mesmo timestamp de minuto). Renomeada para `20260715110000_revoke_anon_lead_insert.sql` antes de qualquer aplicação real contra o banco de teste; nenhum conteúdo foi alterado, apenas o nome do arquivo.

## 3. Validação — executada contra banco real (ambiente de teste local, Docker)

Toda a validação abaixo foi executada de fato contra `supabase start` local (Postgres + PostgREST + Edge Functions em container), não simulada.

### 3.1 Suíte pgTAP completa (`npm run test:db`)

- `supabase db reset --local` aplicou todas as migrations do zero, incluindo `20260715110000_revoke_anon_lead_insert.sql`, sem erro.
- `rec-102-revoke-anon-lead-insert.test.sql`: **5/5 ok**, também confirmado isoladamente com `supabase test db --local supabase/tests/database/rec-102-revoke-anon-lead-insert.test.sql` → `Result: PASS`.
- A suíte completa reportou 1 falha, mas em `rec-101-revoke-public-enrollment-rpc.test.sql` (arquivo de outra story, em progresso em paralelo por outro agente): o subteste `"anon mantém insert em public.lead (fora do escopo de REC-101)"` falhou porque REC-102 — cujo objetivo explícito é justamente revogar esse insert — já havia sido aplicada no mesmo banco. Essa falha é uma interação esperada entre as duas stories concorrentes (a suposição de REC-101 de que `lead` permanecia fora de escopo deixou de valer assim que REC-102 fechou o vetor); não é uma regressão introduzida por REC-102 nem um teste desta story. Não alterei o arquivo de teste de REC-101 — pertence a outra story em andamento.

### 3.2 Idempotência da migration

- Reaplicação direta do arquivo via `psql` contra o banco já migrado: `DROP POLICY` (skip, já ausente) / `REVOKE` / `GRANT`, sem erro, saída limpa. Confirma AC5 (idempotente, reaplicável sem falha).

### 3.3 Teste negativo real via PostgREST — chave `anon` (AC1)

```
POST http://127.0.0.1:54321/rest/v1/lead  (apikey/Authorization = chave anon local)
→ HTTP 401
{"code":"42501","message":"permission denied for table lead", ...}
```

Confirma AC1: insert direto negado com erro de permissão insuficiente, reproduzível.

### 3.4 Teste negativo real — chave `authenticated` (AC2)

- Validado a nível de role via pgTAP (`set local role authenticated`, sem claim de admin) na suíte 3.1: `throws_ok` com SQLSTATE `42501`, mesmo comportamento de permissão insuficiente do teste HTTP acima (PostgREST usa o mesmo grant de tabela para decidir a resposta).

### 3.5 Teste positivo real — endpoint ajustado (AC3, AC4)

```
POST http://127.0.0.1:54321/functions/v1/leads
Origin: http://localhost:3000
body: {"name":"...","email":"rec102-http-endpoint@rhcursos.test","courseInterest":"Teste","origin":"landing-teste"}
→ HTTP 201 {"ok":true}
```

- Linha confirmada persistida via `service_role` (`GET /rest/v1/lead?email=eq...`) e removida logo em seguida (dado sintético, sem reaproveitamento).
- Regressão de validação (campo obrigatório ausente, `email` omitido): `HTTP 400 {"ok":false,"error":"Campos obrigatórios ausentes."}` — comportamento inalterado.
- Regressão de verificação de origem (`Origin: http://evil.example.com`): `HTTP 403 {"ok":false,"error":"Origin not allowed"}` — comportamento inalterado.
- `checkRateLimit` não foi exercitado até o limite nesta rodada (não há motivo para suspeitar de regressão: a chamada de rate limit permanece antes do bloco `try`/persistência, não tocada pela troca de cliente — confirmado por leitura do arquivo final).

### 3.6 Escopo da revogação (AC6)

- A migration só referencia `public.lead`. Verificado por leitura do arquivo e pela suíte completa: nenhum teste de `curso`, `turma`, `instrutor`, `curso_instrutor`, `trilha`, `post_blog`, `aluno` ou `inscricao` (`adr015-f3`, `ep12`, `ep14`, `rec-301`) regrediu.
- Assert adicional no próprio teste da story: `has_table_privilege('authenticated', 'public.curso', 'INSERT')` continua `true`.

## 4. Lint / typecheck

- `npx eslint supabase/functions/leads/index.ts`: arquivo ignorado pela config do ESLint do projeto (`supabase/functions/**` está no `ignores` de `eslint.config.*`, pois é código Deno, fora do escopo do lint Next.js/TS deste repo). Sem erro reportável por essa via.
- `npm run typecheck` (`tsc --noEmit`) não inclui `supabase/functions/**` no `tsconfig.json` (fora do `include`), mesma razão.
- Evidência de correção do arquivo: a Edge Function real (não uma simulação) foi executada pelo `edge-runtime` local em 3.5 sem erro de compilação/runtime, retornando `201` para o caso válido e `400`/`403` para os casos de regressão — validação equivalente ou mais forte que type-check estático para código Deno.

## 5. AC → evidência

| AC | Evidência |
|---|---|
| 1 — insert direto anônimo negado | §3.3 (HTTP real) + §3.1 (pgTAP) |
| 2 — `authenticated` sem privilégio negado | §3.1 (pgTAP, `throws_ok` 42501) |
| 3 — endpoint controlado continua persistindo | §3.5 (HTTP real, 201 + linha confirmada) |
| 4 — nenhuma regressão de validação | §3.5 (400 campo ausente, 403 origem) |
| 5 — migration idempotente | §3.2 (reaplicação direta sem erro) |
| 6 — sem regressão em outras tabelas | §3.6 |
| 7 — gate independente | Pendente — a cargo de `@qa`, fora do escopo deste relatório |

## 6. Observações e limites

- Nenhum dado real de lead foi usado; todos os e-mails de teste usam o domínio sintético `@rhcursos.test` e as linhas criadas em testes HTTP foram removidas ao final.
- A pilha local Docker foi parada (`supabase stop --no-backup`) ao final da validação.
- `docs/qa/gates/rec-102-revogar-insert-anonimo-leads.yml` **não** foi criado por este executor — fica para o gate independente de `@qa`, conforme instrução da story.
