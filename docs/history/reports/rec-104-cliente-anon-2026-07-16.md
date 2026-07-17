# Relatório — REC-104: Implementar cliente público anon

> Nenhum dado real de instrutor/aluno/lead é reproduzido neste documento. Exemplos usam dado sintético.

Story: [`docs/stories/2026-07-16-rec-104-cliente-publico-anon.md`](../../stories/2026-07-16-rec-104-cliente-publico-anon.md) · Épica 17, Onda 2 · Executor: `@dev` (execução assíncrona, documentação consolidada por `aiox-master` após falha de conexão do agente original — ver Change Log da story).

## 1. Resumo do estado final

| Item | Antes | Depois |
|---|---|---|
| `fetchPublicCatalogFromSupabaseServer` | `createSupabaseServerClient()` (service role) | `createSupabasePublicServerClient()` (anon) |
| `fetchPublicBlogPostsFromSupabaseServer` | `createSupabaseServerClient()` (service role) | `createSupabasePublicServerClient()` (anon) |
| `fetchPublicTestimonialsFromSupabaseServer` | `createSupabaseServerClient()` (service role) | `createSupabasePublicServerClient()` (anon) |
| Caminho `visibility === "admin"` | `createSupabaseServerClient()` (service role) | inalterado |
| `public.avaliacao` — grant de tabela para `anon`/`authenticated` | ausente (nunca concedido) | concedido (`select`) |
| `public.is_admin()` — grant de execução para `anon` | ausente | concedido (`execute`) |

## 2. Arquivos criados/modificados

- **Modificado:** `src/lib/supabase/server.ts` — adiciona `createSupabasePublicServerClient()` (chave anon/publishable, nunca service role) e `isSupabasePublicServerConfigured`; documenta `createSupabaseServerClient()` como exclusivo de caminhos administrativos.
- **Modificado:** `src/lib/supabase/rh-cursos-api.ts` — os 3 caminhos de leitura pública passam a usar o cliente dedicado; o caminho admin permanece com o cliente privilegiado.
- **Criado:** `supabase/migrations/20260716120000_rec104_grant_avaliacao_select.sql` — corrige as duas lacunas de grant descobertas (ver §3).
- **Criado:** `supabase/tests/database/rec-104-anon-client.test.sql` — 14 asserções pgTAP sob `set local role anon`.
- **Criado:** `src/__tests__/lib/rh-cursos-api-server-client.test.ts` — 5 asserções Vitest (mockado) confirmando a fiação de cliente por função.

## 3. Achado durante a implementação: grants ausentes mascarados por `service_role`

`public.avaliacao` já possuía a policy RLS `avaliacao_public_or_owner_select` (definida em `20260513100000_sprint1_security.sql`, `to anon, authenticated`, liberando linhas com `publicar = true`), mas **nenhuma migration jamais concedeu o privilégio `select` de tabela** para `anon` nem `authenticated` nessa tabela. No modelo de ACL do PostgreSQL, uma policy RLS só é avaliada depois que o `grant` de tabela permite o comando — sem o `grant`, o role recebe `permission denied for table avaliacao`, independentemente da policy existir.

Isso ficou mascarado até esta story porque o único consumidor SSR de depoimentos públicos usava `service_role` (que possui `grant select` em todas as tabelas do schema `public`) e o consumidor de browser (cliente anon) nunca havia sido exercitado por um teste real contra o banco.

Um segundo problema, dependente do primeiro: mesmo com o `grant select` de tabela corrigido, a própria avaliação da policy falhava para `anon` com `permission denied for function is_admin` — a policy usa `public.is_admin()` na cláusula `or`, e `execute` nessa função só havia sido concedido a `authenticated`. `is_admin()` é `security definer`, `stable`, e apenas compara `auth.uid()` (nulo para `anon`) com `profiles.role`; conceder `execute` a `anon` não expõe dado algum além do booleano já usado pela própria policy.

**Correção:** `grant select on public.avaliacao to anon, authenticated` + `grant execute on function public.is_admin() to anon`, escopados exatamente aos papéis já previstos pela policy de leitura. Nenhum privilégio de escrita concedido — os fluxos de escrita de avaliação permanecem fora do escopo desta story.

## 4. Validação

### 4.1 Teste de banco (`rec-104-anon-client.test.sql`, 14 asserções, `set local role anon`)

- Catálogo público (curso `Ativo`, `turma_publica`, `instrutor_publico`, avaliação publicada) visível sob `anon` via RLS real.
- Curso `Rascunho`, turma soft-deleted e avaliação não publicada **não** vazam sob `anon` — confirma que a RLS existente passou a ser a barreira ativa (antes era bypassada por `service_role`).
- Regressão de REC-103: `anon` continua sem `select` em `instrutor.email`/`turma.observacoes` na tabela base.
- Grants novos escopados corretamente (`anon`/`authenticated` em `avaliacao`, `anon` em `is_admin()`).
- Regressão: grants de `post_blog`/`trilha`/`curso_public_content` inalterados.
- Regressão: caminho admin (`service_role`) continua enxergando curso em Rascunho, sem alteração de RLS/grants para esse papel.

### 4.2 Teste de aplicação (`rh-cursos-api-server-client.test.ts`, 5 asserções Vitest, mockado)

Confirma, sem depender de Docker, que `fetchPublicCatalogFromSupabaseServer`, `fetchPublicBlogPostsFromSupabaseServer` e `fetchPublicTestimonialsFromSupabaseServer` chamam exclusivamente `createSupabasePublicServerClient()` e nunca `createSupabaseServerClient()`, e que `fetchAdminCatalogFromSupabaseServer`/`fetchAdminBlogPostsFromSupabaseServer` continuam usando exclusivamente o cliente privilegiado.

### 4.3 Suíte agregada

Confirmada verde na consolidação final por `aiox-master` (ver Change Log da story, versão 1.1, e a atualização subsequente do Status desta story) após resolução de uma colisão transiente de execução concorrente de `npm run test:db` com a story REC-105 (rodando em paralelo no mesmo banco Docker local).

## 5. AC → evidência

| AC | Evidência |
|---|---|
| 1 — nenhum caminho público usa service_role | Diff de `rh-cursos-api.ts` (§2) + teste de aplicação (§4.2) |
| 2 — caminho admin inalterado | Diff de `rh-cursos-api.ts` (funções admin não tocadas) + teste de aplicação (§4.2) |
| 3 — RLS real aplicada ao catálogo público | Teste de banco, asserções de rascunho/soft-deleted bloqueados (§4.1) |
| 4 — sem regressão funcional no catálogo legítimo | Teste de banco, asserções de conteúdo publicado visível (§4.1) |
| 5 — regressões corrigidas por migration, nunca por reversão de credencial | §3 (grants corrigidos via migration, cliente público mantido) |
| 6 — colunas privadas de REC-103 permanecem bloqueadas | Teste de banco, asserções de regressão REC-103 (§4.1) |
| 7 — suíte agregada verde | §4.3 |

## 6. Nota de processo

O agente executor original sofreu uma falha de conexão de API (erro de infraestrutura, não relacionado ao conteúdo do trabalho) imediatamente após concluir a implementação de código e os dois arquivos de teste, mas antes de escrever a story e este relatório. `aiox-master` (Orion) consolidou a documentação final a partir da inspeção direta do diff e dos arquivos já criados pelo agente, sem alterar nenhuma linha de código produzida por ele.
