# Story REC-102: Revogar insert anônimo de leads

## Status

Ready

## Executor Assignment

executor: "@data-engineer" (migration/policy) + "@dev" (ajuste do endpoint controlado)
quality_gate: "@qa"
quality_gate_tools:
- teste negativo de insert direto em `public.lead` via PostgREST com chave `anon`/`authenticated`
- teste positivo de persistência via `supabase/functions/leads/index.ts` após o ajuste
- confirmação de que a migration é reversível (roll-forward) e idempotente
- revisão do relatório sem segredo ou PII

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 1 — Fechar ataques e comportamentos enganosos
- **Prioridade:** P0 / SEV-0
- **Estimativa:** S–M
- **Findings:** FND-11
- **Requisitos:** FR-02, NFR-04
- **Gate relacionado:** G2 — Leads e pré-inscrição

## Story

**As a** responsável por integridade de dados da RH Cursos,
**I want** revogar a permissão de insert anônimo direto na tabela `public.lead` e garantir que somente o endpoint controlado consiga persistir um lead,
**so that** nenhum chamador consiga inserir dados diretamente no banco contornando validação, rate limit e verificação de origem, sem quebrar a captação legítima de leads pelo site.

## Contexto e valor

A migration `supabase/migrations/20260512193000_initial_rh_cursos_schema.sql` (linhas 315-318) cria a policy `lead_public_insert` — `for insert to anon, authenticated with check (true)` — e `supabase/migrations/20260604164120_content_access_alignment.sql` (linha 234) concede `grant insert on public.lead to anon, authenticated`. A combinação de `with check (true)` e grant a `anon` permite que qualquer chamador com a chave pública `anon` insira uma linha em `public.lead` diretamente via PostgREST, sem os campos obrigatórios, o rate limit ou a checagem de origem que `supabase/functions/leads/index.ts` já aplica (validação de `name`/`email`/`courseInterest`/`origin`, `checkRateLimit`, `isOriginAllowed`).

O endpoint controlado hoje usa `anonClient()` (mesma role, mesma chave pública) para o próprio insert — ou seja, ele está sujeito exatamente à mesma policy permissiva que o ataque direto explora. Diferente de REC-101, aqui a entrega esperada pela Épica 17 é que "somente o endpoint controlado persiste": revogar o grant sem mudar o cliente do endpoint quebraria a captação legítima junto com o vetor de abuso. Esta story, portanto, revoga o insert anônimo direto no banco e move a persistência do endpoint controlado para um cliente privilegiado (`adminClient()`, já definido em `supabase/functions/_shared/supabase.ts`), que é código server-only e portanto autorizado por NFR-02, mantendo toda a validação, rate limit e verificação de origem já existentes no endpoint como o único caminho de escrita.

## Escopo

### Incluído

- Revogar `grant insert on public.lead from anon, authenticated` (ou substituir por um grant restrito a `service_role`, conforme o padrão já usado para as demais tabelas administrativas).
- Remover ou substituir a policy `lead_public_insert` (`with check (true)`, aberta a `anon`) por uma policy que não conceda insert direto a `anon`.
- Atualizar `supabase/functions/leads/index.ts` para persistir via `adminClient()` em vez de `anonClient()`, preservando toda a validação, o rate limit (`checkRateLimit`) e a verificação de origem (`isOriginAllowed`) já implementados.
- Validar, com teste negativo real, que um insert direto via PostgREST com a chave `anon` é rejeitado.
- Validar, com teste positivo real, que uma submissão via `supabase/functions/leads/index.ts` continua persistindo um lead normalmente.
- Produzir evidência sanitizada para `@qa`.

### Fora do escopo

- Alterar o formato do payload aceito pelo endpoint de leads.
- Adicionar CAPTCHA, idempotência ou rate limit por proxy confiável ao endpoint de leads (parte do endurecimento mais amplo tratado em REC-107, cujo escopo declarado cobre `enrollments`/inscrição; se aplicável a leads, deve ser reavaliado por `@sm` como story separada).
- Corrigir a RPC de inscrição pública: REC-101.
- Qualquer alteração em `public.aluno`, `public.inscricao` ou `public.turma`.
- Migrar autenticação/identidade.

## Acceptance Criteria

1. **Insert direto anônimo negado**
   **Given** a migration desta story aplicada,
   **when** um cliente insere diretamente em `public.lead` via PostgREST com a chave `anon`,
   **then** a operação é rejeitada com erro de permissão insuficiente, verificável e reproduzível.

2. **`authenticated` sem privilégio também negado**
   O mesmo teste negativo se repete para a chave `authenticated` sem contexto de service role.

3. **Endpoint controlado continua persistindo**
   **Given** `supabase/functions/leads/index.ts` atualizado para usar `adminClient()`,
   **when** uma submissão válida chega ao endpoint,
   **then** o lead é persistido normalmente, com o mesmo comportamento de validação, rate limit e verificação de origem já existentes.

4. **Nenhuma regressão de validação**
   As validações já existentes no endpoint (campos obrigatórios, `checkRateLimit`, `isOriginAllowed`) continuam ativas e não foram enfraquecidas pela troca de cliente.

5. **Migration forward-only e idempotente**
   A migration de revogação/policy pode ser reaplicada sem erro e não depende de dados em um estado específico.

6. **Sem regressão em outras tabelas**
   A revogação atinge exclusivamente `public.lead`; grants e policies de `curso`, `turma`, `instrutor`, `curso_instrutor`, `trilha`, `post_blog`, `aluno` e `inscricao` permanecem inalterados.

7. **Gate independente**
   `@qa` revisa a evidência, executa os testes positivo e negativo, e emite PASS/CONCERNS/FAIL para REC-102.

## Tasks / Subtasks

- [ ] **Task 1 — Escrever a migration de revogação** (AC: 1, 2, 5, 6)
  - [ ] Criar `supabase/migrations/{timestamp}_revoke_anon_lead_insert.sql`.
  - [ ] `revoke insert on public.lead from anon, authenticated;` (mantendo os grants de `authenticated` para `select`/`update` já existentes, se aplicável ao papel administrativo autenticado).
  - [ ] Remover/recriar a policy `lead_public_insert`, garantindo que `anon` não retenha `insert` por nenhum caminho.
  - [ ] Conceder `insert` em `public.lead` a `service_role` explicitamente, se ainda não coberto pelo grant amplo existente para `service_role`.

- [ ] **Task 2 — Ajustar o endpoint controlado** (AC: 3, 4)
  - [ ] Trocar `anonClient()` por `adminClient()` em `supabase/functions/leads/index.ts` apenas na chamada de persistência do insert.
  - [ ] Confirmar que a validação de campos obrigatórios, `checkRateLimit` e `isOriginAllowed` permanecem exatamente como estão, antes do insert.

- [ ] **Task 3 — Validar em ambiente de teste** (AC: 1, 2, 3, 5)
  - [ ] Aplicar a migration no banco de teste local.
  - [ ] Executar insert direto via PostgREST com chave `anon`, esperando negação.
  - [ ] Executar insert direto via PostgREST com chave `authenticated`, esperando negação.
  - [ ] Executar submissão via o endpoint ajustado, esperando persistência bem-sucedida.
  - [ ] Reaplicar a migration e confirmar idempotência.

- [ ] **Task 4 — Consolidar evidência e gate** (AC: 1–7)
  - [ ] Produzir relatório sanitizado em `docs/history/reports/rec-102-revogar-insert-leads-2026-07-15.md`.
  - [ ] Criar/atualizar `docs/qa/gates/rec-102-revogar-insert-anonimo-leads.yml`.
  - [ ] Solicitar veredito de `@qa`.

## Dev Notes

### Fontes verificadas

- A Épica 17 define REC-102 na Onda 1, dependente de REC-001 e REC-403, com entrega "insert direto anônimo falha; somente endpoint controlado persiste". [Fonte: `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md#onda-1--fechar-ataques-e-comportamentos-enganosos-t2-a-t8h`]
- A âncora local de FND-11 é `supabase/migrations/20260604164120_content_access_alignment.sql`. [Fonte: matriz de rastreabilidade da Épica 17]
- A policy `lead_public_insert` (`for insert to anon, authenticated with check (true)`) está em `supabase/migrations/20260512193000_initial_rh_cursos_schema.sql` (linhas 315-318), com comentário no arquivo "anon e authenticated podem inserir (formulários públicos)" em `supabase/migrations/20260513100000_sprint1_security.sql` (linha 157).
- O `grant insert on public.lead to anon, authenticated` está em `supabase/migrations/20260604164120_content_access_alignment.sql` (linha 234).
- O endpoint controlado `supabase/functions/leads/index.ts` já valida `name`/`email`/`courseInterest`/`origin`, aplica `checkRateLimit` (`rateLimitConfigs.lead`) e `isOriginAllowed`, mas persiste hoje via `anonClient()` (linha 5 do import, linha do `const supabase = anonClient()`), a mesma role pública revogada por esta story.
- `adminClient()` já existe em `supabase/functions/_shared/supabase.ts` (linha 24) e é código server-only dentro de uma Edge Function, autorizado por NFR-02 ("service role só pode existir em código server-only após autorização"). [Fonte: `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md#3-requisitos-do-programa`]
- A Constitution reserva migrations e políticas de banco para `@data-engineer`, validadas por `@qa`; código de Edge Function que consome o dado ajustado é território de `@dev`, coordenado nesta story sem alterar a autoridade de banco. [Fonte: `.aiox-core/constitution.md#ii-agent-authority-non-negotiable`]

### Project Structure Notes

- Nova migration segue o padrão `supabase/migrations/{YYYYMMDDHHMMSS}_{descricao}.sql`.
- A alteração em `supabase/functions/leads/index.ts` é restrita à troca do cliente de persistência; nenhuma outra lógica do arquivo deve mudar.
- Teste de banco correspondente segue o padrão de `supabase/tests/database/`.

### Ferramentas e execução segura

- `supabase db push` ou execução equivalente contra o banco de teste local, nunca diretamente em produção sem homologação.
- Teste negativo via cliente PostgREST usando a chave `anon` pública do ambiente de teste.
- Teste positivo via chamada HTTP real ao endpoint `leads` ajustado, em ambiente de teste.
- `git status --short` para confirmar que apenas a migration, `supabase/functions/leads/index.ts` e os artefatos de evidência desta story foram alterados.

## Testing e evidências

- Teste negativo: insert direto em `public.lead` com chave `anon`, esperando erro de permissão.
- Teste negativo: insert direto em `public.lead` com chave `authenticated`, esperando erro de permissão.
- Teste positivo: submissão válida via `supabase/functions/leads/index.ts`, esperando lead persistido.
- Teste de regressão: submissão inválida (campo obrigatório ausente) continua retornando `400` como antes.
- Teste de regressão: rate limit e verificação de origem continuam ativos após a troca de cliente.
- Teste de idempotência da migration.

## Observabilidade

- Registrar a aplicação da migration com timestamp absoluto e ambiente.
- Registrar o resultado de cada teste positivo/negativo.
- Não usar e-mail ou telefone real de lead como exemplo em log ou relatório; usar dado sintético.

## Security Notes

- A revogação é roll-forward: nenhum rollback restaura o insert anônimo direto.
- `adminClient()` só é usado dentro da Edge Function (código server-only); a chave de service role nunca é exposta ao browser.
- Não usar dado real de lead em nenhum teste versionado; usar dado sintético.

## Dependências

- **Entrada:** REC-001 (freeze aplicado) e REC-403 (baseline constitucional verde, exigido para merge de migration e de código).
- **Bloqueia:** REC-107, caso o endurecimento do endpoint de leads seja incluído em seu escopo futuro.
- **Não depende de:** REC-101, que trata do vetor equivalente para a RPC de inscrição.

## Roll-forward / Rollback

- **Roll-forward obrigatório:** qualquer ajuste futuro de permissão é uma nova migration explícita.
- **Rollback proibido:** reverter a migration para restaurar `with check (true)` a `anon`, ou reverter `supabase/functions/leads/index.ts` para `anonClient()`.
- Se o ajuste do endpoint introduzir uma falha de persistência não prevista, a correção é uma nova iteração desta story antes de `Done`, não uma reversão ao estado inseguro anterior.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> A validação usa revisão manual da migration, da alteração no endpoint e dos testes positivo/negativo por `@qa`.

### Story Type Analysis

- **Primary Type:** Database (revogação de grant/policy)
- **Secondary Type:** API (ajuste do cliente de persistência em Edge Function)
- **Complexity:** Média, por envolver migration e uma alteração mínima porém sensível de privilégio em código server-only.
- **Agentes:** `@data-engineer` (migration/policy); `@dev` (troca de cliente no endpoint); quality gate independente `@qa`.

### Manual review focus

- Nenhum caminho residual de insert anônimo direto.
- Endpoint controlado continua sendo o único caminho de persistência, sem enfraquecer validação/rate limit/origem.
- Uso de `adminClient()` restrito ao código server-only já existente, sem exposição de chave privilegiada.
- Migration idempotente e reversível apenas por roll-forward.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-15 | 0.1 | Draft criado a partir da Épica 17 (autorização de decomposição pós-REC-001), com escopo de revogação de insert anônimo em `public.lead` e migração do endpoint controlado para cliente privilegiado. | @sm (River) |
| 2026-07-15 | 1.0 | **GO (10/10) → Draft → Ready.** Checklist de 10 pontos sem lacunas: título claro, contexto/valor completo (FND-11 fundamentado em migrations reais e no endpoint atual), ACs em Given/When/Then, escopo incluído/excluído explícito (REC-107/REC-101 fora), dependências mapeadas (REC-001+REC-403 entrada; bloqueia REC-107 condicionalmente; não depende de REC-101), estimativa (S–M), valor de negócio (fecha vetor de insert direto sem quebrar captação legítima), riscos e roll-forward/rollback documentados, critérios de conclusão claros via gate independente do @qa, alinhamento com Épica 17/Onda 1 confirmado. Bloqueadores documentais: 0. | @po (Pax) |

## File List

### Criado nesta preparação

- `docs/stories/2026-07-15-rec-102-revogar-insert-anonimo-leads.md`

### Planejado para implementação/validação

- `supabase/migrations/{timestamp}_revoke_anon_lead_insert.sql`
- `supabase/tests/database/rec-102-revoke-anon-lead-insert.test.sql`
- `supabase/functions/leads/index.ts` (troca de `anonClient()` para `adminClient()` na persistência)
- `docs/history/reports/rec-102-revogar-insert-leads-2026-07-15.md`
- `docs/qa/gates/rec-102-revogar-insert-anonimo-leads.yml`

### Referências somente leitura

- `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md`
- `docs/stories/2026-07-14-rec-001-incidente-freeze-evidencias.md`
- `supabase/migrations/20260512193000_initial_rh_cursos_schema.sql`
- `supabase/migrations/20260513100000_sprint1_security.sql`
- `supabase/migrations/20260604164120_content_access_alignment.sql`
- `supabase/functions/_shared/supabase.ts`

## Dev Agent Record

### Agent Model Used

A preencher pelo executor.

### Debug Log References

A preencher pelo executor, somente com referências sanitizadas.

### Completion Notes

A preencher pelo executor.

## QA Results

A preencher por `@qa` após validação independente.
