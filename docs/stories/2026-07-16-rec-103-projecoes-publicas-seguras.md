# Story REC-103: Criar projeções públicas seguras

## Status

Done

## Executor Assignment

executor: "@data-engineer"
quality_gate: "@qa"
quality_gate_tools:
- inspeção de `information_schema.columns` confirmando ausência de `email`/`telefone`/`observacoes` nas views públicas
- `has_column_privilege`/`has_table_privilege` confirmando allowlist de colunas para `anon` na tabela base
- regressão de `authenticated` (portal do instrutor/admin) inalterado
- `npm run test:db` completo (banco Supabase local) e `npm run typecheck`/`npm run lint`
- revisão do relatório de evidência sem PII real

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 1 — Fechar ataques e comportamentos enganosos (Onda 2 na tabela de escalonamento fino da épica, mas listada na tabela de execução da Onda 1)
- **Prioridade:** P0 / SEV-0
- **Estimativa:** S
- **Findings:** FND-10
- **Requisitos:** FR-01, NFR-03
- **Gate relacionado:** G1 — bloqueia reabertura plena do catálogo público até estar `Done`
- **Âncora local (matriz de rastreabilidade da Épica 17):** migrations de acesso público e `src/lib/supabase/rh-cursos-api.ts`

## Story

**As a** responsável por privacidade e integridade operacional da RH Cursos,
**I want** que o catálogo público leia instrutores e turmas por projeções com allowlist explícita de colunas (nunca a tabela crua com campos privados),
**so that** e-mail e telefone de instrutor e a observação interna de turma nunca trafeguem na resposta pública, mesmo que um desenvolvedor futuro volte a consultar a tabela base por engano.

## Contexto e valor

`src/lib/supabase/rh-cursos-api.ts` seleciona hoje, para o catálogo público (`fetchPublicCatalog` → `fetchCatalog(client, "public", …)` e `fetchPublicClassesFromSupabase`, ambos sem distinção de colunas por visibilidade):

- `instrutor`: `id,nome,email,telefone,bio,foto_url,formacao,especialidade,rating,status` (linhas 241-242 antes desta story) — inclui `email` e `telefone`, contato direto do instrutor.
- `turma`: `id,curso_id,instrutor_id,data_inicio,data_fim,horario,local,vagas_total,vagas_preenchidas,vagas_restantes,preco_turma,modalidade,status,observacoes` (linhas 232-233 e 365-366 antes desta story) — inclui `observacoes`, nota interna de operação da turma.

Os *mappers* (`mapInstructor`, `mapClass` em `src/lib/supabase/mappers.ts`) propagam esses dois campos para os tipos `Instructor.email`/`Instructor.phone` e `TrainingClass.notes`, que fazem parte do objeto retornado por `fetchPublicCatalog`/`fetchPublicClassesFromSupabase` e, portanto, do payload disponível para qualquer página pública que consuma esse catálogo (mesmo sem haver hoje um componente que renderize esses campos especificamente — confirmado por busca no código: nenhuma view em `src/views/public/`, `src/features/public/` ou `src/components/public/` lê `instructor.email`, `instructor.phone` ou `.notes` de turma). Isso é exatamente o comportamento descrito por FND-10: "respostas públicas expõem contato de instrutor e observações internas de turma".

Além disso, a tabela base `public.instrutor` concede `select` de **tabela inteira** para `anon` (`20260604164120_content_access_alignment.sql`, linha 230: `grant select on public.instrutor to anon, authenticated`) e o mesmo para `public.turma` (linha 229). Como o modelo de ACL do PostgreSQL trata um `grant select` de tabela inteira como cobertura de todas as colunas — um `revoke select (coluna)` posterior **não restringe** um `grant` de tabela inteira já concedido —, a única correção efetiva no nível de banco é substituir o `select` de tabela inteira de `anon` por um `select` de colunas explícitas (allowlist), a mesma allowlist usada nas novas views.

Esta story cria duas views de projeção pública (`public.instrutor_publico`, `public.turma_publica`) com allowlist explícita de colunas — sem `email`/`telefone`/`observacoes` — e ajusta `rh-cursos-api.ts` para consultá-las no caminho `visibility === "public"`, preservando o caminho `visibility === "admin"` inalterado (a área administrativa continua lendo a tabela base completa, protegida pelas RLS policies `instrutor_owner_or_admin_select`/`turma_admin_write`/`is_admin()`).

REC-101 (revogação da RPC pública de inscrição) já está `Done` e é pré-requisito declarado desta story na Épica 17. Ela não altera diretamente `instrutor`/`turma`, mas fixa o padrão de migration forward-only + teste pgTAP negativo seguido aqui.

Nota de escopo: `src/lib/supabase/server.ts` hoje prefere `SUPABASE_SERVICE_ROLE_KEY` sobre a chave `anon` (FND-03, tratado por REC-104, fora do escopo desta story). Isso significa que, na SSR atual, o cliente que executa `fetchPublicCatalog` frequentemente já é `service_role` e bypassa RLS/grants completamente — a correção de allowlist de colunas no banco (grants de `anon`) é defesa em profundidade que só se torna a barreira ativa quando REC-104 trocar o cliente público para a chave `anon`. A correção que fecha o vazamento **hoje**, independente de REC-104, é a mudança da própria consulta em `rh-cursos-api.ts` para nunca pedir `email`/`telefone`/`observacoes` no caminho público — essa é a parte que efetivamente elimina FND-10 da resposta atual, e é tratada nesta story com a mesma prioridade que os grants.

## Escopo

### Incluído

- Criar `public.instrutor_publico` (view, `security_invoker = true`) com allowlist `id, nome, bio, foto_url, formacao, especialidade, rating, status`, filtrando `deleted_at is null and status = 'Ativo'`.
- Criar `public.turma_publica` (view, `security_invoker = true`) com allowlist `id, curso_id, instrutor_id, data_inicio, data_fim, horario, local, vagas_total, vagas_preenchidas, vagas_restantes, preco_turma, modalidade, status`, filtrando `deleted_at is null`.
- Conceder `select` das duas views para `anon, authenticated`.
- Trocar, na tabela base, o `select` de tabela inteira de `anon` por `select` restrito à mesma allowlist de colunas (mais `deleted_at`, necessário para a avaliação das RLS policies existentes) em `public.instrutor` e `public.turma`. `authenticated` não é tocado (mantém `select` de tabela inteira, necessário para portal do instrutor e admin).
- Ajustar `src/lib/supabase/rh-cursos-api.ts`: `fetchCatalog(client, "public", …)` e `fetchPublicClassesFromSupabase` passam a consultar `instrutor_publico`/`turma_publica`; `fetchCatalog(client, "admin", …)` continua consultando `instrutor`/`turma` sem alteração de colunas.
- Ajustar `src/lib/supabase/database.types.ts` (tipos das duas novas views; campos `email`/`telefone`/`observacoes` marcados opcionais nos tipos `Row` de `instrutor`/`turma`, refletindo que a linha pode vir da projeção pública sem esses campos) e `src/lib/supabase/schemas.ts` (mesmos três campos passam a `.optional()` em `publicInstructorSchema`/`publicClassSchema`, para validar tanto a linha da view pública quanto a linha completa da tabela admin com o mesmo schema já existente).
- Migration `supabase/migrations/20260716090000_rec103_public_projections.sql` e teste `supabase/tests/database/rec-103-public-projections.test.sql` (pgTAP).
- Relatório sanitizado de evidência.

### Fora do escopo

- Trocar o cliente SSR de `service_role` para `anon` (REC-104) — FND-03 não é corrigido aqui; esta story só garante que a *consulta* nunca pede os campos privados, independente de qual credencial a executa.
- Corrigir atomicidade de reserva de vaga (REC-105) ou endurecer o endpoint de inscrição (REC-107).
- Qualquer alteração em `supabase/functions/`.
- Qualquer alteração em componentes de UI (`src/views/`, `src/features/`, `src/components/`) — confirmado que nenhum já renderiza os campos removidos, portanto nenhuma mudança visual é necessária ou feita.
- Restringir colunas de `authenticated` — permanece com acesso total às tabelas base, protegido por RLS.

## Acceptance Criteria

1. **Views de projeção pública existem com allowlist correta**
   **Given** a migration desta story aplicada,
   **when** se inspeciona `information_schema.columns` para `public.instrutor_publico` e `public.turma_publica`,
   **then** nenhuma das duas contém `email`, `telefone` ou `observacoes`, e ambas contêm exatamente as colunas públicas legítimas listadas no escopo.

2. **`anon` não lê mais as colunas privadas na tabela base**
   **Given** a migration aplicada,
   **when** se verifica `has_column_privilege('anon', 'public.instrutor', 'email'/'telefone', 'select')` e `has_column_privilege('anon', 'public.turma', 'observacoes', 'select')`,
   **then** todas retornam `false`, sem afetar `has_column_privilege` de colunas públicas (ex.: `nome`, `local`), que continuam `true`.

3. **`authenticated` não sofre regressão**
   O portal do instrutor e a área administrativa continuam podendo ler `email`/`telefone`/`observacoes` da tabela base (`has_column_privilege('authenticated', …)` permanece `true`), pois a restrição desta story atinge exclusivamente `anon`.

4. **Catálogo público consome as views**
   `src/lib/supabase/rh-cursos-api.ts`, no caminho `visibility === "public"`, seleciona de `instrutor_publico`/`turma_publica`; o caminho `visibility === "admin"` continua selecionando `instrutor`/`turma` sem alteração de colunas (`npm run typecheck` confirma que os tipos permanecem consistentes).

5. **Migration forward-only e idempotente**
   A migration pode ser reaplicada (`create or replace view`, `revoke`+`grant` de coluna) sem erro.

6. **Sem regressão de leitura pública de curso/trilha/post_blog**
   Nenhuma alteração no comportamento de leitura pública de `curso`, `trilha`, `post_blog`, `curso_public_content`, verificada pela suíte `npm run test:db` completa sem novas falhas.

7. **Suíte de banco 100% verde**
   `npm run test:db` local (Docker) passa integralmente, incluindo os testes já existentes (`rec-101-*`, `rec-102-*`, `adr015-f3-*`, `ep12-*`, `ep14-*`, `rec-301-*`) e o novo `rec-103-public-projections.test.sql`.

8. **Lint e typecheck limpos**
   `npm run lint` e `npm run typecheck` não reportam erro após as alterações em `rh-cursos-api.ts`, `mappers.ts` (se tocado), `schemas.ts` e `database.types.ts`.

## Tasks / Subtasks

- [x] **Task 1 — Investigar exatamente quais campos vazam** (AC: 1)
  - [x] Confirmado, lendo `src/lib/supabase/rh-cursos-api.ts` (antes da alteração), que `email`/`telefone` (instrutor) e `observacoes` (turma) eram selecionados explicitamente no caminho público, sem distinção de `visibility`.
  - [x] Confirmado, por busca em `src/views/public/`, `src/features/public/`, `src/components/public/`, que nenhum desses campos é renderizado publicamente hoje — a exposição é apenas no payload JSON/objeto de estado, não em HTML visível.
  - [x] Confirmado o schema de `public.instrutor`/`public.turma` (`supabase/migrations/20260512193000_initial_rh_cursos_schema.sql`, linhas 99-186) e os grants de tabela inteira para `anon` (`20260604164120_content_access_alignment.sql`, linhas 229-230).

- [x] **Task 2 — Criar as views de projeção pública** (AC: 1, 5)
  - [x] `public.instrutor_publico` e `public.turma_publica` criadas em `supabase/migrations/20260716090000_rec103_public_projections.sql`, `security_invoker = true`, allowlist explícita, filtros de visibilidade pública embutidos.
  - [x] `grant select` das views para `anon, authenticated`.

- [x] **Task 3 — Corrigir os grants da tabela base** (AC: 2, 3, 5)
  - [x] Descoberto durante a primeira rodada de `npm run test:db` que `revoke select (coluna) ... from anon` após um `grant select` de tabela inteira **não restringe** o acesso (ACL do PostgreSQL trata privilégio de tabela inteira como cobertura de todas as colunas) — os 4 testes pgTAP correspondentes falharam (`have: true, want: false`).
  - [x] Corrigido substituindo por `revoke select on ... from anon` (tabela inteira) seguido de `grant select (allowlist) on ... to anon` (colunas explícitas, incluindo `deleted_at` para as RLS policies existentes). Reexecutado `npm run test:db` → verde.
  - [x] `authenticated` não tocado.

- [x] **Task 4 — Ajustar `rh-cursos-api.ts` para consumir as views** (AC: 4)
  - [x] `fetchCatalog`: branch por `visibility` nas queries de `turma`/`instrutor` — `"public"` usa as views (sem filtros adicionais, já embutidos), `"admin"` usa as tabelas base (inalterado).
  - [x] `fetchPublicClassesFromSupabase` (sempre público, cliente `anon` do browser) passa a usar `turma_publica`.

- [x] **Task 5 — Ajustar tipos e schemas** (AC: 4, 8)
  - [x] `database.types.ts`: `email`/`telefone` (instrutor) e `observacoes` (turma) marcados opcionais no tipo `Row` das tabelas base; novas entradas `instrutor_publico`/`turma_publica` (somente leitura, `Insert`/`Update: never`).
  - [x] `schemas.ts`: mesmos três campos passam a `.nullable().optional()` em `publicInstructorSchema`/`publicClassSchema`, aceitando tanto a linha completa (admin) quanto a projetada (pública) com o mesmo schema.
  - [x] `npm run typecheck` e `npm run lint` verdes.

- [x] **Task 6 — Teste de banco e validação real** (AC: 1, 2, 3, 5, 6, 7)
  - [x] `supabase/tests/database/rec-103-public-projections.test.sql` criado (18 asserções pgTAP): existência das views, ausência das colunas privadas nas views, contagem exata das colunas públicas esperadas, grants das views para `anon`/`authenticated`, ausência de `select` de coluna privada para `anon` na tabela base, regressão de colunas públicas e de `authenticated`, idempotência.
  - [x] `npm run test:db` executado nesta sessão (banco Supabase local via Docker): suíte completa `76/76 ok` (`adr015-f3`, `ep12`, `ep14`, `rec-101`, `rec-102`, `rec-103`, `rec-301`), incluindo o teste de concorrência (`scripts/test-db-concurrency.mjs`).

- [x] **Task 7 — Consolidar evidência e gate** (AC: 1-8)
  - [x] Relatório sanitizado em `docs/history/reports/rec-103-projecoes-publicas-2026-07-16.md`.
  - [ ] Arquivo de gate QA fica para criação por `@qa` na revisão independente (não criado pelo executor).
  - [x] Veredito solicitado a `@qa`.

## Dev Notes

### Fontes verificadas

- A Épica 17 define REC-103 na tabela de execução da Onda 1 (seção "Onda 1 — Fechar ataques e comportamentos enganosos"), com entrega "PII e observações internas de turma ausentes de respostas públicas", executor `@data-engineer`, validador `@qa`, dependência REC-101. [Fonte: `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md`]
- A matriz de rastreabilidade mapeia FND-10 → FR-01, NFR-03 → REC-103, REC-104, REC-408, com âncora local "migrations de acesso público e `src/lib/supabase/rh-cursos-api.ts`". [Fonte: mesma épica, seção 3, tabela "Matriz de rastreabilidade"]
- FND-10: "Respostas públicas expõem contato de instrutor e observações internas de turma". [Fonte: mesma épica, seção 2]
- Colunas privadas confirmadas por leitura direta de `src/lib/supabase/rh-cursos-api.ts` (antes desta story): `.select("id,nome,email,telefone,bio,foto_url,formacao,especialidade,rating,status")` para `instrutor` e `.select("id,curso_id,instrutor_id,data_inicio,data_fim,horario,local,vagas_total,vagas_preenchidas,vagas_restantes,preco_turma,modalidade,status,observacoes")` para `turma`, propagadas por `mapInstructor`/`mapClass` (`src/lib/supabase/mappers.ts`) para `Instructor.email`/`Instructor.phone`/`TrainingClass.notes`.
- Grants de tabela inteira para `anon` em `public.instrutor`/`public.turma`: `supabase/migrations/20260604164120_content_access_alignment.sql`, linhas 229-230.
- RLS policies de leitura pública existentes: `catalogo_publico_instrutor_select` (`supabase/migrations/20260513100000_sprint1_security.sql`, linhas 33-36) e `catalogo_publico_turma_select` (`supabase/migrations/20260604164120_content_access_alignment.sql`, linhas 157-179), ambas `to anon, authenticated`.
- Policies de `authenticated` que legitimamente precisam ler contato/observações internas: `instrutor_owner_or_admin_select` (`supabase/migrations/20260701090000_instructor_portal_rls.sql`) e `turma_admin_write`/`instrutor_admin_write` (`supabase/migrations/20260604164120_content_access_alignment.sql`, linhas 207-215), todas `to authenticated`.
- FND-03 (cliente SSR prefere `service_role`) confirmado em `src/lib/supabase/server.ts` (`process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`) — tratado por REC-104, fora de escopo, mas documentado como o motivo pelo qual a correção de grants de `anon` é defesa em profundidade e não a única barreira ativa hoje.

### Decisão de design registrada (achado durante a implementação)

O plano original desta story assumia que `revoke select (coluna) ... from anon` bastaria como defesa em profundidade após criar as views, preservando o `grant select` de tabela inteira já existente. A primeira execução real de `npm run test:db` mostrou que essa suposição estava errada: o PostgreSQL não permite reduzir um privilégio de tabela inteira já concedido por meio de um `revoke` de coluna subsequente — a checagem de `has_column_privilege` continuou `true` para as colunas revogadas. A correção foi trocar a abordagem para `revoke select on tabela from anon` (revogação total) seguida de `grant select (allowlist) on tabela to anon` (concessão explícita apenas das colunas públicas, incluindo `deleted_at` porque as RLS policies existentes referenciam essa coluna nas próprias linhas retornadas). Documentado como comentário na migration e no teste, para que futuras stories não repitam a suposição incorreta.

### Project Structure Notes

- Migration segue o padrão `supabase/migrations/{YYYYMMDDHHMMSS}_{descricao}.sql`.
- Teste segue o padrão de `supabase/tests/database/rec-101-revoke-public-enrollment-rpc.test.sql` (pgTAP, `plan()`/`is()`/`ok()`/`finish()`, transação com `rollback` no fim).
- Nenhuma alteração em `supabase/functions/` — os endpoints controlados (`enrollments`, `leads`) não leem `instrutor`/`turma` diretamente.

## Testing e evidências

- Estrutural: `information_schema.columns` confirma ausência de `email`/`telefone`/`observacoes` nas duas views.
- ACL: `has_column_privilege`/`has_table_privilege` confirmam allowlist de `anon` na tabela base e grants das views.
- Regressão: `authenticated` mantém acesso completo; `curso`/`trilha`/`post_blog`/`curso_public_content` inalterados; suíte completa `76/76` (antes desta story: `58/58`, conforme registrado no gate de REC-101).
- `npm run typecheck` e `npm run lint` sem erro.
- `npx vitest run` (589 testes) sem falha — inclui `src/__tests__/lib/mappers.test.ts`, `src/__tests__/lib/schemas.test.ts`, `src/__tests__/lib/admin-mappers.test.ts` e `src/__tests__/lib/rh-cursos-api.test.ts`.

## Observabilidade

- Registrar a aplicação da migration com timestamp absoluto e ambiente.
- Registrar a contagem de testes antes/depois (58 → 76) no relatório de evidência.
- Não usar e-mail, telefone ou observação real de instrutor/turma em nenhum exemplo versionado; usar dado sintético.

## Security Notes

- Roll-forward: nenhuma migration futura deve reintroduzir `email`/`telefone`/`observacoes` numa projeção consumida por rota pública.
- Defesa em profundidade: mesmo que uma consulta futura no código da aplicação volte, por engano, a apontar para a tabela base em vez da view, `anon` não tem mais privilégio de coluna para ler os campos privados — a query falharia com erro de permissão insuficiente em vez de vazar dado.
- Esta story não substitui REC-104 (cliente público anon dedicado): enquanto o cliente SSR continuar preferindo `service_role` (FND-03), a barreira de ACL de `anon` não é exercitada nesse caminho específico — a barreira ativa hoje é a própria consulta em `rh-cursos-api.ts` não pedir mais os campos privados.

## Dependências

- **Entrada:** REC-101 (`Done`) — RPC pública de inscrição já revogada, conforme exigido pela Épica 17 antes de REC-103.
- **Bloqueia:** REC-104 (cliente público anon dedicado), que assume que a consulta ao catálogo já usa as projeções seguras desta story.
- **Não corrige:** FND-03 (cliente SSR prefere `service_role`) — tratado por REC-104.

## Roll-forward / Rollback

- **Roll-forward obrigatório:** qualquer ajuste futuro de coluna exposta publicamente é uma nova migration explícita que atualiza a view e o teste correspondente.
- **Rollback proibido:** reverter esta migration para restaurar o `select` de tabela inteira de `anon` sobre `instrutor`/`turma`.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> A validação usa revisão manual da migration, do teste pgTAP e do diff de `rh-cursos-api.ts`/`schemas.ts`/`database.types.ts` por `@qa`.

### Story Type Analysis

- **Primary Type:** Database (views de projeção + ajuste de grants)
- **Secondary Type:** Application (ajuste de consulta em `rh-cursos-api.ts`, tipos e schemas)
- **Complexity:** Baixa-média — objetiva no escopo, mas exigiu uma correção de abordagem durante a implementação (ACL de coluna vs. tabela inteira).
- **Agentes:** executor único (`@data-engineer` para migration/grants, `@dev` para o ajuste de `rh-cursos-api.ts`/tipos/schemas); quality gate independente `@qa`.

### Manual review focus

- Allowlist de colunas correta nas duas views (nenhum campo privado, nenhuma coluna pública faltando).
- Grants de `anon` restritos corretamente na tabela base, sem afetar `authenticated`.
- `rh-cursos-api.ts`: caminho `admin` realmente inalterado (nenhuma coluna removida do lado administrativo).
- Suíte de banco 100% verde, sem regressão nas stories anteriores.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-16 | 0.1 | Draft criado a partir da Épica 17 (REC-101 `Done`, dependência satisfeita), com escopo de projeções públicas seguras para `instrutor`/`turma`. | @sm (River) |
| 2026-07-16 | 1.0 | **GO (9/10) → Draft → Ready.** Checklist de 10 pontos: título claro, contexto/valor completo (FND-10 fundamentado em código real, campos confirmados por leitura de `rh-cursos-api.ts`), ACs em Given/When/Then testáveis, escopo incluído/excluído explícito, dependências mapeadas (REC-101 `Done` como entrada; bloqueia REC-104), estimativa (S), valor de negócio (fecha vazamento de PII/observação interna do catálogo público), riscos documentados (ambiguidade sobre ACL de coluna vs. tabela inteira, resolvida durante implementação), critérios de conclusão claros via gate independente do @qa, alinhamento com Épica 17/Onda 1 confirmado. Ponto não pleno (9/10): a estimativa de complexidade ACL foi otimista no draft original (assumia que revoke de coluna após grant de tabela bastaria); não bloqueante, pois a correção foi absorvida dentro do próprio ciclo de implementação e documentada. Bloqueadores documentais: 0. | @po (Pax) |
| 2026-07-16 | 1.1 | **Ready → InProgress → InReview.** `@data-engineer`/`@dev` (executor único) criaram as views `instrutor_publico`/`turma_publica`, corrigiram os grants de `anon` (tabela inteira → allowlist de coluna, após descobrir que a abordagem original de `revoke select (coluna)` não funciona sobre um `grant` de tabela inteira já existente), ajustaram `rh-cursos-api.ts`/`schemas.ts`/`database.types.ts`, e criaram o teste de banco `pgTAP` (18 asserções). `npm run test:db` completo: 76/76 (antes: 58/58, +18 desta story). `npm run typecheck`, `npm run lint` e `npx vitest run` (589 testes) verdes. Gate QA não criado pelo executor (preserva independência do gate). | @data-engineer (Dara) / @dev (Dex) |
| 2026-07-16 | 1.2 | **InReview → Done.** Gate PASS (94/100) emitido por `@qa` após verificação independente das 18 asserções, do diff de `rh-cursos-api.ts` (caminho admin preservado) e da suíte completa (76/76). Residual `low` (SEC-108) encaminhado para REC-104. | @qa (Quinn) |

## File List

### Criado nesta preparação

- `docs/stories/2026-07-16-rec-103-projecoes-publicas-seguras.md`

### Criado nesta execução

- `supabase/migrations/20260716090000_rec103_public_projections.sql`
- `supabase/tests/database/rec-103-public-projections.test.sql`
- `docs/history/reports/rec-103-projecoes-publicas-2026-07-16.md`

### Alterado nesta execução

- `src/lib/supabase/rh-cursos-api.ts` (queries de `turma`/`instrutor` no caminho público passam a usar `turma_publica`/`instrutor_publico`; caminho admin inalterado)
- `src/lib/supabase/database.types.ts` (tipos das novas views; `email`/`telefone`/`observacoes` opcionais nos `Row` das tabelas base)
- `src/lib/supabase/schemas.ts` (`email`/`telefone`/`observacoes` opcionais em `publicInstructorSchema`/`publicClassSchema`)

### Pendente (criação por `@qa`)

- `docs/qa/gates/rec-103-projecoes-publicas-seguras.yml`

### Referências somente leitura

- `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md`
- `docs/stories/2026-07-15-rec-101-revogar-rpc-inscricao-publica.md`
- `docs/stories/2026-07-15-rec-102-revogar-insert-anonimo-leads.md`
- `supabase/migrations/20260512193000_initial_rh_cursos_schema.sql`
- `supabase/migrations/20260604164120_content_access_alignment.sql`
- `supabase/migrations/20260701090000_instructor_portal_rls.sql`
- `src/lib/supabase/mappers.ts`
- `src/lib/supabase/server.ts`

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (executor único, atuando como `@data-engineer` para migration/grants e `@dev` para o ajuste de `rh-cursos-api.ts`/tipos/schemas).

### Debug Log References

- `npm run test:db` (banco Supabase local via Docker) — primeira rodada: 4 falhas em `rec-103-public-projections.test.sql` (testes 11-13, 18) por causa da abordagem inicial incorreta de `revoke select (coluna)` sobre um `grant` de tabela inteira. Segunda rodada, após corrigir para `revoke select on tabela` + `grant select (allowlist)`: `76/76 ok`.
- `npm run typecheck`, `npm run lint`, `npx vitest run` (589 testes) — todos verdes após a implementação.
- Detalhe completo em `docs/history/reports/rec-103-projecoes-publicas-2026-07-16.md`.

### Completion Notes

- Todos os ACs (1-8) verificados com evidência real (banco local via Docker, não simulada).
- Decisão de escopo tomada sem especificação exata na épica: a épica não detalha se a correção deveria acontecer só no nível de query da aplicação (`rh-cursos-api.ts`) ou também no nível de ACL de banco (`anon`). Optei por fazer as duas, já que a análise mostrou que o cliente SSR atual usa `service_role` (FND-03, fora de escopo) — sem o ajuste de query, a correção de ACL sozinha não fecharia o vazamento na configuração atual; sem o ajuste de ACL, a correção de query não teria defesa em profundidade contra uma regressão futura de código. Documentado em "Security Notes" e no Dev Notes ("Decisão de design registrada").
- Nenhuma alteração em `supabase/functions/` ou em componentes de UI foi necessária — confirmado por busca que nenhum componente público renderiza os campos removidos.
- Nomenclatura das views (`instrutor_publico`, `turma_publica`) escolhida por analogia ao padrão em português já usado no schema (`curso_public_content`, `catalogo_publico_*`); não há convenção prévia de nomenclatura de view no projeto (nenhuma view existia antes desta story).

## QA Results

### Gate: PASS ✅ — @qa (Quinn), 2026-07-16

**Gate file:** [`docs/qa/gates/rec-103-projecoes-publicas-seguras.yml`](../qa/gates/rec-103-projecoes-publicas-seguras.yml) · **Quality score:** 94/100

Verificação independente: views `instrutor_publico`/`turma_publica` confirmadas sem `email`/`telefone`/`observacoes`; correção de ACL (revoke total + grant de allowlist) revisada e tecnicamente correta; diff de `rh-cursos-api.ts` confirma caminho admin intocado. Suíte de banco `76/76`, 589 testes unitários, lint/typecheck limpos.

Todos os itens de AC→evidência do relatório: PASS.

Residual `low`: SEC-108 (a barreira de ACL só é a proteção ativa no caminho SSR quando REC-104 trocar o cliente público para `anon`; até lá a proteção efetiva é a própria query não pedir mais os campos, o que já está em vigor).

**Veredito:** PASS. FND-10 fechado. Nenhuma ação bloqueante.

— Quinn, guardião da qualidade 🛡️
