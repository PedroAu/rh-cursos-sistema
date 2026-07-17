# Story REC-104: Implementar cliente público anon

## Status

Done

## Executor Assignment

executor: "@dev"
quality_gate: "@architect" + "@qa"
quality_gate_tools:
- teste de banco (`set local role anon`) confirmando catálogo público visível e rascunho/arquivado/soft-deleted bloqueados
- teste de aplicação (Vitest, mockado) confirmando que nenhum caminho público chama `createSupabaseServerClient()`
- revisão de que o caminho `visibility === "admin"` permanece inalterado (service role preservado onde é autorizado)
- confirmação de que a suíte agregada (`npm run test:db`, `npx vitest run`) permanece 100% verde

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 2 — Integridade do caminho público
- **Prioridade:** P0 / SEV-0
- **Estimativa:** M
- **Findings:** FND-03
- **Requisitos:** FR-01, NFR-02, NFR-04
- **Gate relacionado:** G1 — Catálogo público
- **Achado de QA absorvido:** SEC-108, aberto no gate de REC-103 ("a barreira de ACL de `anon` só se torna ativa quando REC-104 trocar o cliente público de `service_role` para `anon`")

## Story

**As a** responsável por integridade de dados da RH Cursos,
**I want** que todo caminho de leitura pública do site use exclusivamente a chave `anon`/publishable, nunca `service_role`,
**so that** as projeções e grants de coluna criados por REC-103 sejam de fato a barreira ativa contra exposição de dado privado, em vez de depender de um filtro em memória que pode ser esquecido em uma consulta futura.

## Contexto e valor

REC-103 criou as views `instrutor_publico`/`turma_publica` com allowlist de coluna e corrigiu os grants de `anon` na tabela base — mas o executor daquela story identificou e documentou explicitamente (relatório REC-103, §7) que essa barreira só é a proteção ativa quando o cliente que executa a query é de fato `anon`. Até esta story, `fetchPublicCatalogFromSupabaseServer`, `fetchPublicBlogPostsFromSupabaseServer` e `fetchPublicTestimonialsFromSupabaseServer` usavam `createSupabaseServerClient()` (`src/lib/supabase/server.ts`), que prefere `SUPABASE_SERVICE_ROLE_KEY` — uma credencial que ignora RLS e grants completamente. A proteção efetiva contra o vazamento de FND-10 (fechado por REC-103) dependia inteiramente da query não pedir mais os campos privados; nenhuma política de RLS estava de fato em vigor no caminho público.

Isso também significa que RLS de publicação (curso `Rascunho`/`Arquivado`, turma soft-deleted) nunca foi de fato aplicada ao caminho SSR público — qualquer filtro correto dependia inteiramente do código da aplicação (`selectCatalogRowsForVisibility` e filtros explícitos em cada query), não do banco. Esta story fecha essa lacuna estrutural.

## Escopo

### Incluído

- Criar `createSupabasePublicServerClient()` em `src/lib/supabase/server.ts`: cliente SSR dedicado que usa exclusivamente `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`, nunca `SUPABASE_SERVICE_ROLE_KEY`.
- Trocar todo caminho de leitura pública em `src/lib/supabase/rh-cursos-api.ts` (`fetchPublicCatalogFromSupabaseServer`, `fetchPublicBlogPostsFromSupabaseServer`, `fetchPublicTestimonialsFromSupabaseServer`) para usar o novo cliente público, em vez do cliente privilegiado.
- Preservar `createSupabaseServerClient()` (service role) exclusivamente para o caminho `visibility === "admin"` (`fetchAdminCatalogFromSupabaseServer`, `fetchAdminBlogPostsFromSupabaseServer`, `fetchCourseCategories`).
- Corrigir qualquer regressão de RLS/grant revelada pela troca de credencial (ex.: grant ausente em `public.avaliacao`, encontrado durante a implementação — ver Dev Notes), via migration nova, nunca revertendo para `service_role`.
- Produzir evidência sanitizada para `@architect`/`@qa`.

### Fora do escopo

- Consolidação do BFF canônico (browser same-origin, remoção de contratos duplicados): REC-206.
- Migração de autoridade de identidade/sessão administrativa: REC-201 a REC-204 (ADR-016 já registrado).
- Qualquer alteração no caminho `visibility === "admin"`.
- Endurecimento de endpoints de escrita pública (REC-107) ou atomicidade de inscrição (REC-105).

## Acceptance Criteria

1. **Nenhum caminho público usa `service_role`**
   **Given** o código após esta story,
   **when** qualquer função de leitura pública (catálogo, blog, depoimentos) é chamada,
   **then** ela usa exclusivamente `createSupabasePublicServerClient()`; nenhuma dessas funções chama `createSupabaseServerClient()`.

2. **Caminho admin inalterado**
   As funções do caminho `visibility === "admin"` continuam usando `createSupabaseServerClient()` (service role), sem regressão de comportamento.

3. **RLS real aplicada ao catálogo público**
   **Given** um curso em `Rascunho`/`Arquivado` ou uma turma soft-deleted,
   **when** o caminho público os consulta sob `anon`,
   **then** eles não aparecem na resposta — a política RLS existente é a barreira, não apenas o filtro em memória.

4. **Sem regressão funcional no catálogo público legítimo**
   Cursos publicados, turmas abertas e instrutores ativos continuam visíveis e completos (campos públicos) na resposta do catálogo sob `anon`.

5. **Regressões de RLS/grant reveladas pela troca de credencial são corrigidas por migration, nunca por reversão de credencial**
   Qualquer caminho público que dependia implicitamente do bypass de `service_role` é corrigido ajustando a RLS/grant correspondente (documentando o porquê), nunca revertendo o cliente para `service_role`.

6. **Colunas privadas de REC-103 permanecem bloqueadas**
   `anon` continua sem `select` em `instrutor.email`/`telefone` e `turma.observacoes` na tabela base — nenhuma regressão da defesa em profundidade de REC-103.

7. **Suíte agregada verde**
   `npm run test:db` e `npx vitest run` permanecem 100% verdes após a mudança.

## Tasks / Subtasks

- [x] **Task 1 — Criar o cliente público dedicado** (AC: 1, 2)
  - [x] `createSupabasePublicServerClient()` adicionado em `src/lib/supabase/server.ts`, usando exclusivamente a chave publicável/anon.
  - [x] `createSupabaseServerClient()` (service role) documentado como exclusivo de caminhos administrativos.

- [x] **Task 2 — Migrar os caminhos públicos** (AC: 1, 4)
  - [x] `fetchPublicCatalogFromSupabaseServer`, `fetchPublicBlogPostsFromSupabaseServer`, `fetchPublicTestimonialsFromSupabaseServer` migrados para o cliente público.
  - [x] Caminho `visibility === "admin"` confirmado inalterado.

- [x] **Task 3 — Investigar e corrigir regressões de RLS/grant** (AC: 3, 5)
  - [x] Identificado: `public.avaliacao` tinha policy RLS (`avaliacao_public_or_owner_select`) mas nunca recebeu `grant select` de tabela para `anon`/`authenticated` — mascarado até agora porque o único consumidor SSR usava `service_role`.
  - [x] Identificado (2/2): a avaliação da policy também falhava para `anon` por falta de `grant execute` em `public.is_admin()` (usada na cláusula `or` da policy), concedido anteriormente só a `authenticated`.
  - [x] Corrigido via `supabase/migrations/20260716120000_rec104_grant_avaliacao_select.sql`: `grant select on public.avaliacao to anon, authenticated` + `grant execute on function public.is_admin() to anon`. Nenhum privilégio de escrita concedido.

- [x] **Task 4 — Testar contra banco real e suíte completa** (AC: 3, 4, 6, 7)
  - [x] Teste de banco `supabase/tests/database/rec-104-anon-client.test.sql` (14 asserções pgTAP, `set local role anon`): catálogo público visível, rascunho/arquivado/soft-deleted bloqueados, colunas privadas de REC-103 continuam bloqueadas, grants novos escopados corretamente, caminho admin (service_role) inalterado.
  - [x] Teste de aplicação `src/__tests__/lib/rh-cursos-api-server-client.test.ts` (Vitest, mockado): confirma no nível de fiação de código que cada função pública chama `createSupabasePublicServerClient()` e nunca `createSupabaseServerClient()`, e vice-versa para as funções admin.

- [x] **Task 5 — Consolidar evidência** (AC: 1–7)
  - [x] Relatório sanitizado em `docs/history/reports/rec-104-cliente-anon-2026-07-16.md`.
  - [ ] Gate QA fica para criação por `@architect`/`@qa` na revisão independente.

## Dev Notes

### Fontes verificadas

- FND-03: "Cliente SSR público prefere `service_role` e consulta dados sem filtragem defensiva completa — Bypass de RLS e exposição de dados não públicos." [Fonte: `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md#2-rastreamento-dos-achados-aprovados`]
- Achado SEC-108 do gate de REC-103: a barreira de ACL só se torna ativa quando o cliente público trocar para `anon`. [Fonte: `docs/qa/gates/rec-103-projecoes-publicas-seguras.yml`]
- `src/lib/supabase/server.ts`: única fonte de construção de cliente SSR antes desta story (`createSupabaseServerClient`, sempre service role quando disponível).
- `public.avaliacao` RLS: `avaliacao_public_or_owner_select` definida em `20260513100000_sprint1_security.sql`, mas grant de tabela nunca concedido a `anon`/`authenticated` — achado durante a implementação, não previsto no Dev Notes original da story.
- `public.is_admin()`: `security definer`, `stable`, comparação de `auth.uid()` (nulo para `anon`) contra `profiles.role`; `grant execute` só existia para `authenticated` antes desta story.

### Project Structure Notes

- Nenhuma alteração em `.aiox-core/` ou paths L1/L2.
- Alteração restrita a `src/lib/supabase/server.ts`, `src/lib/supabase/rh-cursos-api.ts`, uma migration nova e dois arquivos de teste novos.

## Testing e evidências

- Teste de banco real (`supabase/tests/database/rec-104-anon-client.test.sql`) sob `set local role anon`, cobrindo catálogo público visível, conteúdo não publicado bloqueado, colunas privadas bloqueadas, grants escopados corretamente, caminho admin inalterado.
- Teste de aplicação (`src/__tests__/lib/rh-cursos-api-server-client.test.ts`), mockado, confirmando a fiação de qual cliente cada função pública/admin usa, sem depender de Docker.
- `npm run test:db` e `npx vitest run` completos, para confirmar ausência de regressão nas suítes já existentes.

## Observabilidade

- Nenhum novo log/métrica introduzido; a mudança é de credencial de leitura, não de comportamento observável em runtime além do bloqueio correto de conteúdo não publicado.

## Security Notes

- Este é o fechamento estrutural de FND-03: a partir desta story, RLS e grants passam a ser a barreira real do caminho público, não apenas um filtro de aplicação.
- Os grants adicionados em `public.avaliacao`/`is_admin()` foram escopados ao mínimo necessário (somente `select`/`execute` de leitura, nenhuma escrita), e apenas aos papéis já previstos pela policy RLS existente.
- Nenhuma credencial nova foi introduzida; a chave pública/anon já era usada pelo cliente browser (`src/lib/supabase/client.ts`).

## Dependências

- **Entrada:** REC-103 concluída (views/grants de coluna que esta story torna efetivos).
- **Consome achado de:** SEC-108 (gate REC-103).
- **Habilita:** G1 (Catálogo público) — RLS real aplicada ao caminho SSR.
- **Não depende de:** REC-105, REC-107 (endurecimento de escrita), que tratam de vetores distintos (leitura vs. escrita pública).

## Roll-forward / Rollback

- **Roll-forward obrigatório:** qualquer regressão de RLS/grant revelada pela troca de credencial é corrigida com nova migration; nunca revertendo o cliente público para `service_role`.
- **Rollback proibido:** reverter `createSupabasePublicServerClient()` para preferir service role, mesmo temporariamente, reabriria FND-03.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> Validação usa revisão manual por `@architect` (arquitetura do cliente dedicado) e `@qa` (evidência de teste).

### Story Type Analysis

- **Primary Type:** Security (privilégio mínimo, FND-03)
- **Secondary Type:** Database (grants revelados como ausentes)
- **Complexity:** Média — mudança de credencial em múltiplos pontos de leitura, com risco real de regressão de RLS não exercitada anteriormente (materializado e corrigido durante a própria implementação).
- **Agentes:** executor `@dev`; quality gate `@architect` + `@qa`.

### Manual review focus

- Nenhum caminho público residual usando `service_role`.
- Caminho admin verificado inalterado.
- Grants novos escopados ao mínimo necessário, sem privilégio de escrita.
- Regressão de RLS real (rascunho/arquivado/soft-deleted) confirmada bloqueada, não apenas assumida.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-16 | 0.1 | Draft criado a partir da Épica 17 (REC-103 `Done`, dependência satisfeita; achado SEC-108 do gate de REC-103 como motivador direto). | @sm (River) |
| 2026-07-16 | 1.0 | **GO (9/10) → Draft → Ready.** Checklist de 10 pontos: título claro, contexto/valor completo (FND-03 fundamentado em código real e no achado SEC-108), ACs testáveis, escopo incluído/excluído explícito, dependências mapeadas (REC-103 entrada), estimativa (M), valor de negócio (RLS real no caminho público), riscos documentados (regressão de RLS não exercitada anteriormente — materializada e corrigida durante a implementação), critérios de conclusão via gate `@architect`+`@qa`, alinhamento com Épica 17/Onda 2 confirmado. Ponto não pleno (9/10): a complexidade real de grants ausentes em `avaliacao`/`is_admin()` não era previsível no draft. Bloqueadores documentais: 0. | @po (Pax) |
| 2026-07-16 | 1.1 | **Ready → InProgress → InReview.** `@dev` implementou `createSupabasePublicServerClient()` e migrou os 3 caminhos públicos de leitura. Durante a implementação, descobriu e corrigiu duas lacunas de grant em `public.avaliacao`/`public.is_admin()` que estavam mascaradas pelo uso de `service_role` (nunca exercitadas por um teste real contra `anon`). Testes de banco (14 asserções) e de aplicação (5 asserções Vitest) criados. Nota de processo: o agente executor sofreu uma falha de conexão de API após concluir a implementação e os testes, mas antes de escrever esta story/relatório — a documentação final desta entrada foi produzida por `aiox-master`/Orion a partir da inspeção direta do diff e dos arquivos de teste já criados, sem alterar nenhum código. | @dev (Dex) via aiox-master (Orion) |
| 2026-07-16 | 1.2 | **InReview → Done.** Gate PASS (93/100) emitido por `@qa`+`@architect` após verificação independente: `npm run test:db` limpo (Files=9, Tests=100, PASS), lint/typecheck limpos, diff revisado. | @qa (Quinn) + @architect (Aria) |

## File List

### Criado nesta execução

- `docs/stories/2026-07-16-rec-104-cliente-publico-anon.md`
- `supabase/migrations/20260716120000_rec104_grant_avaliacao_select.sql`
- `supabase/tests/database/rec-104-anon-client.test.sql`
- `src/__tests__/lib/rh-cursos-api-server-client.test.ts`
- `docs/history/reports/rec-104-cliente-anon-2026-07-16.md`

### Modificado nesta execução

- `src/lib/supabase/server.ts`
- `src/lib/supabase/rh-cursos-api.ts`

### Pendente (criação por `@architect`/`@qa`)

- `docs/qa/gates/rec-104-cliente-publico-anon.yml`

### Referências somente leitura

- `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md`
- `docs/stories/2026-07-16-rec-103-projecoes-publicas-seguras.md`
- `docs/qa/gates/rec-103-projecoes-publicas-seguras.yml`
- `supabase/migrations/20260513100000_sprint1_security.sql`
- `supabase/migrations/20260604164120_content_access_alignment.sql`

## Dev Agent Record

### Agent Model Used

Claude (persona `@dev` para esta story, executor assíncrono; documentação final consolidada por `aiox-master`/Orion após falha de conexão do agente original).

### Debug Log References

`npm run test:db` (banco Supabase local via Docker) — a ser confirmado na consolidação final; ver relatório de evidência.

### Completion Notes

Implementação completa (cliente dedicado, migração dos 3 caminhos públicos, correção das 2 lacunas de grant, testes de banco e de aplicação). Todos os ACs 1-6 atendidos com evidência direta de código/teste. AC7 (suíte agregada verde) confirmado na consolidação final por `aiox-master`.

## QA Results

### Gate: PASS ✅ — @qa (Quinn) + @architect (Aria), 2026-07-16

**Gate file:** [`docs/qa/gates/rec-104-cliente-publico-anon.yml`](../qa/gates/rec-104-cliente-publico-anon.yml) · **Quality score:** 93/100

Verificação independente: `npm run test:db` (execução limpa, ambos os agentes paralelos já finalizados) → `Files=9, Tests=100, PASS`. `npm run lint`/`npm run typecheck` limpos. Diff de `server.ts`/`rh-cursos-api.ts` revisado: separação de cliente público/privilegiado correta, caminho admin intocado. Grants de `avaliacao`/`is_admin()` escopados ao mínimo necessário.

Todos os ACs (1-7) PASS.

Nota `info`: falha de conexão do agente executor original registrada por transparência (PROC-101) — não afeta a qualidade do código/testes produzidos.

**Veredito:** PASS. FND-03 fechado estruturalmente. Nenhuma ação bloqueante.

— Quinn, guardião da qualidade 🛡️
