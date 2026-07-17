# Story REC-101: Revogar RPC pública de inscrição

## Status

Done

## Executor Assignment

executor: "@data-engineer"
quality_gate: "@qa"
quality_gate_tools:
- teste negativo de chamada direta à RPC via PostgREST com chave `anon`/`authenticated`
- teste negativo de chamada direta à RPC via chave `authenticated` sem contexto de service role
- confirmação de que a migration é reversível (roll-forward) e idempotente
- revisão do relatório de revogação sem segredo ou PII

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 1 — Fechar ataques e comportamentos enganosos
- **Prioridade:** P0 / SEV-0
- **Estimativa:** S
- **Findings:** FND-02
- **Requisitos:** FR-02, FR-04, NFR-03
- **Gate relacionado:** G1/G2 — bloqueia reabertura de catálogo/pré-inscrição pública até estar `Done`

## Story

**As a** responsável por integridade de dados da RH Cursos,
**I want** revogar a permissão de execução direta e pública da RPC `registrar_inscricao_publica`,
**so that** nenhum chamador não autorizado consiga alterar PII de aluno existente ou criar inscrição diretamente via PostgREST, contornando a validação, o rate limit e a idempotência do endpoint controlado.

## Contexto e valor

A migration `supabase/migrations/20260512193000_initial_rh_cursos_schema.sql` cria a função `registrar_inscricao_publica` (`security definer`) e a migration `supabase/migrations/20260604164120_content_access_alignment.sql` (linha 247) concede `grant execute ... to anon, authenticated`. Isso torna a RPC chamável diretamente por qualquer cliente com a chave `anon`, sem passar pelo endpoint controlado `supabase/functions/enrollments/index.ts`, que hoje também chama a mesma RPC via `anonClient()` (mesma role, mesma chave pública).

A função faz upsert de `public.aluno` por e-mail em minúsculas (`select ... where lower(email) = lower(p_email)`) e, quando encontra um cadastro existente, atualiza `nome_completo`, `cpf`, `telefone`, `cargo`, `orgao` e `tipo_aluno` apenas por posse do e-mail informado — exatamente o comportamento descrito por FND-02. Qualquer chamador que conheça ou adivinhe um e-mail de aluno existente pode alterar esses campos chamando a RPC diretamente, sem passar pela validação Zod, pelo rate limit ou pela verificação de origem do endpoint.

Esta story revoga a permissão de execução pública/anônima da RPC como contenção imediata. Como o endpoint `enrollments` atual usa a mesma chave `anon`, ele também deixa de funcionar até que REC-104 (cliente público anon dedicado), REC-105 (atomicidade) e REC-107 (endurecimento do endpoint) restaurem a inscrição pública por um caminho privilegiado e validado. Essa indisponibilidade temporária é intencional: a Épica 17 determina que um módulo permanece indisponível quando não consegue provar seu gate, e a Onda 1 mantém operações públicas inseguras bloqueadas até G1/G2.

## Escopo

### Incluído

- Revogar `grant execute` da função `registrar_inscricao_publica` para os papéis `anon` e `authenticated`.
- Confirmar que nenhum outro grant (direto ou por role herdado) permite chamada pública da função após a migration.
- Validar, com teste negativo real, que uma chamada direta via PostgREST com a chave `anon` e com a chave `authenticated` (sem privilégio adicional) retorna negação (`42501` ou equivalente).
- Documentar explicitamente que o endpoint `enrollments` fica temporariamente indisponível como consequência aceita desta contenção, até REC-104/REC-105/REC-107.
- Produzir migration forward-only, reversível apenas por nova migration corretiva (nunca por rollback destrutivo).
- Produzir evidência sanitizada para `@qa`.

### Fora do escopo

- Criar projeções públicas seguras: REC-103.
- Implementar cliente público anon dedicado: REC-104.
- Corrigir atomicidade da reserva de vaga: REC-105.
- Proteger PII de aluno existente por identidade verificada: REC-106.
- Endurecer o endpoint com schema estrito, idempotência, CAPTCHA e rate limit por proxy confiável: REC-107.
- Qualquer alteração em `supabase/functions/enrollments/index.ts` ou em outro código de aplicação.
- Restaurar a inscrição pública funcional; esta story apenas fecha o vetor de escrita não controlada.

## Acceptance Criteria

1. **Execução pública/anônima negada**
   **Given** a migration desta story aplicada,
   **when** um cliente chama `registrar_inscricao_publica` diretamente via PostgREST com a chave `anon`,
   **then** a chamada é rejeitada com erro de permissão insuficiente, verificável e reproduzível.

2. **`authenticated` sem privilégio também negado**
   O mesmo teste negativo se repete para a chave `authenticated` sem contexto de service role, confirmando que a revogação não deixou brecha por herança de role.

3. **Migration forward-only e idempotente**
   A migration pode ser reaplicada sem erro (`revoke` é idempotente por natureza) e não depende de dados em um estado específico.

4. **Nenhuma outra função pública é afetada**
   A revogação atinge exclusivamente `registrar_inscricao_publica`; consultas de catálogo público e demais funções listadas na matriz de grants permanecem com o comportamento anterior.

5. **Indisponibilidade documentada e aceita**
   O relatório da story registra explicitamente que `supabase/functions/enrollments/index.ts` deixa de conseguir inscrever alunos após esta migration, com a dependência declarada em REC-104/REC-105/REC-107 para restauração.

6. **Sem regressão de leitura pública**
   Rotas de leitura do catálogo público não sofrem alteração de comportamento por esta story.

7. **Gate independente**
   `@qa` revisa a evidência, executa os testes negativos e emite PASS/CONCERNS/FAIL para REC-101.

## Tasks / Subtasks

- [x] **Task 1 — Escrever a migration de revogação** (AC: 1, 2, 3, 4)
  - [x] Criado `supabase/migrations/20260715100000_revoke_public_enrollment_rpc.sql` com `revoke execute ... from anon, authenticated` e um segundo `revoke ... from public` (defesa em profundidade contra herança).
  - [x] Assinatura de parâmetros confirmada idêntica à dos `grant`s originais (`varchar,varchar,varchar,varchar,varchar,varchar,public.tipo_aluno,varchar,varchar,public.forma_pagamento,text`), verificada contra `20260512193000_initial_rh_cursos_schema.sql`, `20260604164120_content_access_alignment.sql` e `20260513200000_sprint2_integrity.sql`/`20260714231000_public_pre_enrollment_pending.sql` (que só substituem o corpo via `create or replace`, sem mudar a assinatura).
  - [x] Nenhum grant residual: o segundo `revoke ... from public` fecha o vetor de herança do pseudo-role `PUBLIC`.

- [x] **Task 2 — Validar em ambiente de teste** (AC: 1, 2, 3)
  - [x] Teste de banco criado em `supabase/tests/database/rec-101-revoke-public-enrollment-rpc.test.sql` (9 asserções `pgTAP`), cobrindo negação para `anon`/`authenticated`/`public`, preservação de `service_role`, idempotência do `revoke` e ausência de regressão em `is_admin()` e leitura pública de `curso`/`turma`.
  - [x] Executado via `npm run test:db` nesta sessão (banco Supabase local, resultado consolidado no relatório de evidência).
  - [ ] Chamada HTTP real via PostgREST com chave `anon`/`authenticated` **não foi exercitada**: o runner local (`scripts/test-db.mjs`) inicia `supabase start` excluindo `postgrest`/`kong`. `has_function_privilege()` consulta o mesmo catálogo ACL que autoriza o PostgREST, sendo equivalente correto a nível de banco, mas a validação HTTP end-to-end fica pendente — registrado como gap não-bloqueante para `@qa` avaliar.

- [x] **Task 3 — Confirmar impacto no endpoint controlado** (AC: 5)
  - [x] `supabase/functions/enrollments/index.ts` chama `registrar_inscricao_publica` via `anonClient()` (mesma role revogada) e portanto passa a receber erro de permissão após esta migration — nenhuma alteração de código feita nesta story, conforme escopo.
  - [x] Indisponibilidade registrada como consequência aceita, restaurada por REC-104 (cliente anon dedicado), REC-105 (atomicidade) e REC-107 (endurecimento do endpoint).

- [x] **Task 4 — Consolidar evidência e gate** (AC: 1–7)
  - [x] Relatório sanitizado em `docs/history/reports/rec-101-revogar-rpc-2026-07-15.md`.
  - [ ] Arquivo de gate QA fica para criação por `@qa` na revisão independente (não criado pelo executor, para preservar AC7).
  - [x] Nenhuma alteração necessária na matriz de rastreabilidade da Épica 17 (REC-101 já mapeada em FND-02).
  - [x] Veredito solicitado a `@qa`.

## Dev Notes

### Fontes verificadas

- A Épica 17 define REC-101 na Onda 1, dependente de REC-001 e REC-403, com entrega "`anon` e papéis não autorizados recebem negação verificável". [Fonte: `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md#onda-1--fechar-ataques-e-comportamentos-enganosos-t2-a-t8h`]
- A âncora local de FND-02 é `supabase/migrations/20260513200000_sprint2_integrity.sql`. [Fonte: matriz de rastreabilidade da Épica 17]
- A função `registrar_inscricao_publica` é definida em `supabase/migrations/20260512193000_initial_rh_cursos_schema.sql` e refinada (validação de turma, upsert por e-mail) em `supabase/migrations/20260513200000_sprint2_integrity.sql` (linhas 18-119), com comentário explícito "Callable por anon/authenticated via RPC" (linha 183).
- O `grant execute` para `anon, authenticated` está em `supabase/migrations/20260512193000_initial_rh_cursos_schema.sql` (linha ~435) e é reafirmado em `supabase/migrations/20260604164120_content_access_alignment.sql` (linha 247).
- O endpoint controlado `supabase/functions/enrollments/index.ts` chama a mesma RPC via `anonClient()` (linhas 9, 64, 94) — usa a mesma role revogada por esta story, portanto fica temporariamente indisponível.
- A Constitution reserva migrations e políticas de banco para `@data-engineer`, validadas por `@qa`. [Fonte: `.aiox-core/constitution.md#ii-agent-authority-non-negotiable`; épica seção 3, CON-05]
- A regra constitucional da Onda 0 exige `npm test` verde (REC-403) antes de qualquer merge de migration.

### Project Structure Notes

- Nova migration segue o padrão de nomenclatura `supabase/migrations/{YYYYMMDDHHMMSS}_{descricao}.sql`, coerente com as migrations existentes.
- Teste correspondente deve seguir o padrão de `supabase/tests/database/`, coerente com `supabase/tests/database/adr015-f3-curso-categorias.test.sql`.
- Nenhuma alteração em `supabase/functions/` é permitida nesta story; o impacto no endpoint é documentado, não corrigido aqui.

### Ferramentas e execução segura

- `supabase db push` ou execução equivalente contra o banco de teste local, nunca diretamente em produção sem homologação.
- Teste negativo via `curl`/cliente PostgREST usando a chave `anon` pública (não secreta) do ambiente de teste, nunca a chave de produção real em log.
- `git status --short` para confirmar que apenas a migration e os artefatos de evidência desta story foram alterados.

## Testing e evidências

- Teste negativo: chamada direta à RPC com chave `anon`, esperando erro de permissão.
- Teste negativo: chamada direta à RPC com chave `authenticated`, esperando erro de permissão.
- Teste de idempotência: reaplicar a migration sem erro.
- Teste de regressão: confirmar que `select` público do catálogo permanece funcional.
- Teste de banco via `supabase/tests/database/` cobrindo o `revoke`, seguindo o padrão já usado no projeto.

## Observabilidade

- Registrar a aplicação da migration com timestamp absoluto e ambiente.
- Registrar o resultado de cada teste negativo (papel testado, código de erro retornado).
- Não usar e-mail, telefone ou identificador de aluno real como exemplo em log ou relatório; usar dado sintético.

## Security Notes

- A revogação é roll-forward: nenhum rollback restaura o grant público perigoso.
- Não usar e-mail real de aluno em nenhum teste versionado; usar dado sintético ou anonimizado.
- Esta story não corrige a causa raiz de exposição de PII (upsert por e-mail sem verificação de identidade) — isso é tratado por REC-106; ela apenas fecha o canal de execução não autorizada.

## Dependências

- **Entrada:** REC-001 (freeze aplicado) e REC-403 (baseline constitucional verde, exigido para merge de migration).
- **Bloqueia:** REC-103 (projeções públicas), REC-105 (atomicidade), que assumem a RPC já revogada de acesso público direto.
- **Aceita indisponibilidade temporária de:** fluxo de inscrição via `supabase/functions/enrollments/index.ts`, restaurado por REC-104/REC-105/REC-107.
- **Não depende de:** REC-102, que trata do vetor equivalente para leads.

## Roll-forward / Rollback

- **Roll-forward obrigatório:** qualquer ajuste futuro de permissão é uma nova migration explícita.
- **Rollback proibido:** reverter esta migration para restaurar o grant público da RPC.
- Se a indisponibilidade do endpoint de inscrição gerar impacto comercial inaceitável antes de REC-104/REC-105/REC-107 estarem prontas, a decisão de aceitar ou não esse impacto pertence ao incident commander/stakeholder designado, não a esta story.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> A validação usa revisão manual da migration e dos testes negativos por `@qa`.

### Story Type Analysis

- **Primary Type:** Database (revogação de grant/RLS-adjacent)
- **Secondary Type:** Security
- **Complexity:** Baixa, por ser uma migration objetiva e isolada, apesar do impacto funcional aceito no endpoint.
- **Agentes:** executor `@data-engineer`; quality gate independente `@qa`.

### Manual review focus

- Assinatura completa e correta da função no `revoke`.
- Nenhum grant residual (direto ou herdado) permitindo chamada pública.
- Migration idempotente e reversível apenas por roll-forward.
- Indisponibilidade do endpoint documentada, não escondida.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-15 | 0.1 | Draft criado a partir da Épica 17 (autorização de decomposição pós-REC-001), com escopo exclusivo de revogação de execução pública da RPC de inscrição. | @sm (River) |
| 2026-07-15 | 1.0 | **GO (10/10) → Draft → Ready.** Checklist de 10 pontos sem lacunas: título claro, contexto/valor completo (FND-02 fundamentado em migrations reais), ACs em Given/When/Then, escopo incluído/excluído explícito (indisponibilidade do endpoint aceita e documentada), dependências mapeadas (REC-001+REC-403 entrada; bloqueia REC-103/REC-105; não depende de REC-102), estimativa (S), valor de negócio (fecha vetor de escrita não controlada de PII), riscos e roll-forward/rollback documentados, critérios de conclusão claros via gate independente do @qa, alinhamento com Épica 17/Onda 1 confirmado. Bloqueadores documentais: 0. | @po (Pax) |
| 2026-07-16 | 1.1 | **Ready → InProgress → InReview.** `@data-engineer` criou a migration de revogação (`grant execute` removido de `anon`/`authenticated` e defesa em profundidade contra `public`) e o teste de banco `pgTAP` correspondente (9 asserções). Executado via `npm run test:db`. Gap não-bloqueante: validação HTTP end-to-end via PostgREST não exercitada neste ambiente (runner local exclui `postgrest`/`kong`); `has_function_privilege()` é o equivalente correto a nível de banco. Indisponibilidade aceita do endpoint `enrollments` confirmada e documentada. Gate QA não criado pelo executor (preserva AC7). | @data-engineer (Dara) |
| 2026-07-16 | 1.2 | **InReview → Done.** Asserção 9 do teste (desatualizada por interação com REC-102) corrigida por `@qa`, suíte 100% verde (58/58). Gate CONCERNS (82/100) — SEC-107 (validação HTTP real via PostgREST pendente) não bloqueia o merge da migration, mas fica registrado como follow-up antes de fechar G1/G2. | @qa (Quinn) |

## File List

### Criado nesta preparação

- `docs/stories/2026-07-15-rec-101-revogar-rpc-inscricao-publica.md`

### Criado nesta execução

- `supabase/migrations/20260715100000_revoke_public_enrollment_rpc.sql`
- `supabase/tests/database/rec-101-revoke-public-enrollment-rpc.test.sql`
- `docs/history/reports/rec-101-revogar-rpc-2026-07-15.md`

### Pendente (criação por `@qa`)

- `docs/qa/gates/rec-101-revogar-rpc-inscricao-publica.yml`

### Referências somente leitura

- `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md`
- `docs/stories/2026-07-14-rec-001-incidente-freeze-evidencias.md`
- `supabase/migrations/20260512193000_initial_rh_cursos_schema.sql`
- `supabase/migrations/20260513200000_sprint2_integrity.sql`
- `supabase/migrations/20260604164120_content_access_alignment.sql`
- `supabase/functions/enrollments/index.ts`

## Dev Agent Record

### Agent Model Used

Claude (executor agent, persona @data-engineer para esta story).

### Debug Log References

`npm run test:db` (banco Supabase local via Docker) — resultado consolidado em `docs/history/reports/rec-101-revogar-rpc-2026-07-15.md`, sem segredo ou PII.

### Completion Notes

Migration e teste de banco implementados conforme especificação da story. AC1-AC4 e AC6 verificados a nível de ACL de banco (`has_function_privilege`), equivalente correto ao comportamento do PostgREST. AC5 (indisponibilidade documentada) e AC7 (gate independente) atendidos por escopo/processo. Validação HTTP real via PostgREST/curl não foi possível neste ambiente de execução (runner local não sobe `postgrest`/`kong`) — registrado como gap não-bloqueante para avaliação de `@qa`, mesma linha estrutural de limitações já aceitas em REC-001/REC-002.

## QA Results

### Gate: CONCERNS ⚠️ — @qa (Quinn), 2026-07-16

**Gate file:** [`docs/qa/gates/rec-101-revogar-rpc-inscricao-publica.yml`](../qa/gates/rec-101-revogar-rpc-inscricao-publica.yml) · **Quality score:** 82/100

Migration e teste `pgTAP` revisados linha a linha. Suíte completa reexecutada via `npm run test:db` após correção de uma asserção desatualizada (o teste original desta story assumia `anon` ainda manteria `insert` em `public.lead`, mas REC-102 — aplicada na mesma sequência de migrations — já revoga esse insert; asserção removida por sobreposição de escopo, sem perda de cobertura). Resultado final: `Files=6, Tests=58, Result: PASS`.

AC2-AC6: PASS. AC1 (execução pública/anônima negada): CONCERNS — confirmado por `has_function_privilege()` a nível de ACL de banco (equivalente correto ao que o PostgREST consulta para autorizar), mas a chamada HTTP real via PostgREST (pedida explicitamente pelos `quality_gate_tools` da story) não foi exercitada nesta story, diferente da story irmã REC-102 que rodou o teste HTTP real.

Finding `medium`: SEC-107 (gap de validação HTTP real, não bloqueante para o merge da migration, mas recomendado antes de considerar G1/G2 plenamente encerrados para este vetor).

**Veredito:** CONCERNS. A revogação está tecnicamente sólida e comprovada a nível de banco; a contenção do vetor de escrita não controlada de PII (FND-02) está efetiva. Recomendo: (1) prosseguir tratando REC-101 como contida; (2) executar o teste HTTP real via PostgREST antes de fechar G1/G2 para reabertura de catálogo/pré-inscrição pública.

— Quinn, guardião da qualidade 🛡️
