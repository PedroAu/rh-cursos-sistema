# Relatório — REC-103: Criar projeções públicas seguras

> Nenhum dado real de instrutor (nome, e-mail, telefone) ou observação real de turma é reproduzido neste documento. Qualquer exemplo usa dado sintético. Nenhuma chave/secret de produção é reproduzida.

Story: [`docs/stories/2026-07-16-rec-103-projecoes-publicas-seguras.md`](../../stories/2026-07-16-rec-103-projecoes-publicas-seguras.md) · Épica 17, Onda 1 · Executor único (persona `@data-engineer` para migration/grants, `@dev` para ajuste de aplicação).

## 1. Resumo do estado final

| Item | Antes | Depois |
|---|---|---|
| Consulta pública de instrutor (`rh-cursos-api.ts`) | `instrutor.select("id,nome,email,telefone,bio,foto_url,formacao,especialidade,rating,status")` | `instrutor_publico.select("id,nome,bio,foto_url,formacao,especialidade,rating,status")` — sem `email`/`telefone` |
| Consulta pública de turma (`rh-cursos-api.ts`) | `turma.select("...,observacoes")` | `turma_publica.select("...")` — sem `observacoes` |
| `grant select` de `anon` em `public.instrutor` | tabela inteira | apenas `id, nome, bio, foto_url, formacao, especialidade, rating, status, deleted_at` |
| `grant select` de `anon` em `public.turma` | tabela inteira | apenas `id, curso_id, instrutor_id, data_inicio, data_fim, horario, local, vagas_total, vagas_preenchidas, vagas_restantes, preco_turma, modalidade, status, deleted_at` |
| `authenticated` (portal do instrutor, admin) | tabela inteira | inalterado (tabela inteira) |
| Views novas | — | `public.instrutor_publico`, `public.turma_publica` (allowlist explícita, `security_invoker = true`) |

## 2. Arquivos alterados/criados

- **Criado:** `supabase/migrations/20260716090000_rec103_public_projections.sql` — cria as duas views, concede `select` para `anon, authenticated`, e substitui o `select` de tabela inteira de `anon` por `select` de colunas explícitas em `instrutor`/`turma`.
- **Criado:** `supabase/tests/database/rec-103-public-projections.test.sql` — 18 asserções pgTAP.
- **Alterado:** `src/lib/supabase/rh-cursos-api.ts` — `fetchCatalog` passa a usar as views no caminho `visibility === "public"` (queries de `turma`/`instrutor`); `fetchPublicClassesFromSupabase` (sempre público) passa a usar `turma_publica`. O caminho `visibility === "admin"` não foi tocado.
- **Alterado:** `src/lib/supabase/database.types.ts` — `email`/`telefone` (instrutor) e `observacoes` (turma) marcados opcionais no tipo `Row` das tabelas base; adicionadas as entradas `instrutor_publico`/`turma_publica` (somente leitura).
- **Alterado:** `src/lib/supabase/schemas.ts` — os mesmos três campos passam a `.nullable().optional()` em `publicInstructorSchema`/`publicClassSchema`, permitindo que o mesmo schema valide tanto a linha completa (admin) quanto a projetada (pública).

## 3. Achado durante a implementação: ACL de coluna não restringe um grant de tabela inteira

O plano original assumia que, após criar as views, bastaria `revoke select (email, telefone) on public.instrutor from anon` (e equivalente para `observacoes` em `turma`) como defesa em profundidade — preservando o `grant select` de tabela inteira já existente em `anon` (`content_access_alignment.sql`, linhas 229-230).

A primeira execução real de `npm run test:db` (banco Supabase local via Docker) mostrou que essa suposição estava errada:

```
# Failed test 11: "anon não pode selecionar instrutor.email diretamente na tabela base"
#         have: true
#         want: false
# Failed test 12: "anon não pode selecionar instrutor.telefone diretamente na tabela base"
#         have: true
#         want: false
# Failed test 13: "anon não pode selecionar turma.observacoes diretamente na tabela base"
#         have: true
#         want: false
# Failed test 18 (idempotência): mesma falha reaplicada
Failed 4/18 subtests
```

Causa raiz: no modelo de ACL do PostgreSQL, um `grant select` de tabela inteira cobre todas as colunas; um `revoke select (coluna)` subsequente não reduz esse privilégio já concedido no nível da tabela — ele só teria efeito se o privilégio original também tivesse sido concedido no nível de coluna. `has_column_privilege` continuou retornando `true` porque o `grant` de tabela inteira ainda estava em vigor.

Correção aplicada: trocar a abordagem por `revoke select on public.instrutor from anon` (revogação total do privilégio de tabela) seguido de `grant select (allowlist) on public.instrutor to anon` (concessão explícita apenas das colunas públicas, incluindo `deleted_at`, referenciada pelas RLS policies `catalogo_publico_instrutor_select`/`catalogo_publico_turma_select` já existentes). Mesmo padrão aplicado a `public.turma`. Reexecução de `npm run test:db`: `76/76 ok`.

Este achado está documentado como comentário permanente na migration e no teste, para que futuras stories não repitam a suposição incorreta.

## 4. Validação — executada contra banco real (ambiente de teste local, Docker)

### 4.1 Suíte pgTAP completa (`npm run test:db`)

```
/…/adr015-f3-curso-categorias.test.sql ............ ok
/…/ep12-transactions-rls.test.sql ................. ok
/…/ep14-instructor-portal-rls.test.sql ............ ok
/…/rec-101-revoke-public-enrollment-rpc.test.sql .. ok
/…/rec-102-revoke-anon-lead-insert.test.sql ....... ok
/…/rec-103-public-projections.test.sql ............ ok
/…/rec-301-pre-enrollment.test.sql ................ ok
All tests successful.
Files=7, Tests=76
Result: PASS
✅ Concurrency DB test passou.
```

Contagem antes/depois: **58 → 76** testes (18 novos, todos da story REC-103; nenhum teste pré-existente removido ou alterado).

### 4.2 Asserções de `rec-103-public-projections.test.sql`

1-2. Existência de `public.instrutor_publico`/`public.turma_publica` (`information_schema.views`).
3-4. Ausência de `email`/`telefone`/`observacoes` nas colunas das duas views (`information_schema.columns`).
5-6. Contagem exata das colunas públicas esperadas (8 em `instrutor_publico`, 13 em `turma_publica`).
7-10. `has_table_privilege` confirma `anon`/`authenticated` com `select` nas duas views.
11-13. `has_column_privilege('anon', …, 'select')` confirma `false` para `email`/`telefone`/`observacoes` na tabela base.
14-15. Regressão: `anon` mantém `select` em colunas públicas (`nome`, `local`) na tabela base.
16-17. Regressão: `authenticated` mantém `select` em `email`/`observacoes` na tabela base (portal do instrutor/admin não afetados).
18. Idempotência: reaplicar `revoke`+`grant` de coluna não altera o resultado nem gera erro.

### 4.3 Typecheck, lint e testes unitários

```
npm run typecheck  → ✓ Types generated successfully / tsc --noEmit sem erro
npm run lint       → eslint . sem erro
npx vitest run     → Test Files 54 passed (54) / Tests 589 passed (589)
```

Suítes unitárias relevantes verificadas individualmente antes da rodada completa: `src/__tests__/lib/mappers.test.ts`, `src/__tests__/lib/schemas.test.ts`, `src/__tests__/lib/admin-mappers.test.ts`, `src/__tests__/lib/rh-cursos-api.test.ts`, `src/__tests__/lib/public-pre-enrollment-contract.test.ts`, `src/__tests__/lib/app-store.test.ts`, `src/__tests__/views/public/pre-enrollment.test.tsx` — todas verdes.

## 5. Confirmação de que nenhum componente público renderiza os campos removidos

Busca em `src/views/public/`, `src/features/public/`, `src/components/public/` por `instructor.email`, `instructor.phone` e `.notes` (turma): nenhuma ocorrência de leitura desses campos para exibição pública. As únicas ocorrências de `.email`/`.phone` nesses diretórios pertencem a formulários de contato/checkout (dados digitados pelo próprio visitante, não o contato do instrutor) e ao formulário de login. Confirma que a remoção dos campos da resposta pública não altera nenhuma tela existente.

## 6. AC → evidência

| AC | Evidência |
|---|---|
| 1 — Views com allowlist correta | Asserções 1-6 do teste pgTAP |
| 2 — `anon` sem colunas privadas na tabela base | Asserções 11-13 |
| 3 — `authenticated` sem regressão | Asserções 16-17 |
| 4 — Catálogo público consome as views | Diff de `rh-cursos-api.ts` (§2) + `npm run typecheck` verde |
| 5 — Migration idempotente | Asserção 18 + segunda rodada de `supabase db reset` sem erro |
| 6 — Sem regressão de leitura pública de curso/trilha/post_blog | Suíte completa `76/76`, nenhum teste de `curso`/`trilha`/`post_blog` alterado ou falho |
| 7 — Suíte 100% verde | `Files=7, Tests=76, Result: PASS` |
| 8 — Lint/typecheck limpos | §4.3 |

## 7. Escopo não coberto por esta story (documentado, não bloqueante)

- **FND-03** (cliente SSR prefere `service_role`): a barreira de ACL de `anon` criada aqui só se torna a barreira ativa no caminho SSR quando REC-104 trocar o cliente público para a chave `anon`. Até lá, a barreira efetiva contra o vazamento de FND-10 é a própria consulta em `rh-cursos-api.ts` não pedir mais os campos privados — que já está em vigor independente de qual credencial executa a query.
- Nenhuma alteração em `supabase/functions/` foi necessária (os endpoints controlados não leem `instrutor`/`turma` diretamente).
