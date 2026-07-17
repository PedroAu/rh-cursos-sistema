# Story REC-105: Corrigir inscrição atômica

## Status

Done

## Executor Assignment

executor: "@data-engineer"
quality_gate: "@qa"
quality_gate_tools:
- teste `pgTAP` sequencial cobrindo os ramos de sucesso, sem-vaga (P0003), status fechado (P0002), duplicidade (P0004) e turma inexistente (P0001) após a refatoração de atomicidade
- teste de concorrência real (duas conexões `psql` distintas, disparadas simultaneamente) disputando a última vaga de uma turma sintética
- reexecução completa de `npm run test:db` para confirmar ausência de regressão nas stories REC-101/102/103/104/301 e EP12/EP14/ADR015

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 2 — Integridade do caminho público
- **Prioridade:** P0 / SEV-0
- **Estimativa:** M
- **Findings:** FND-12
- **Requisitos:** FR-03, NFR-05
- **Gate relacionado:** contribui para AC-17.07 e para o fechamento de G2 (lead/pré-inscrição)

## Story

**As a** responsável por integridade transacional da RH Cursos,
**I want** que a reserva de vaga em `public.registrar_inscricao_publica` seja atômica, sem depender de um `SELECT` prévio separado para decidir se há capacidade,
**so that** requisições concorrentes pela última vaga de uma turma produzam exatamente um sucesso e conflitos coerentes, nunca overbooking.

## Contexto e valor

A Épica 17 (FND-12) descreve que "contagem/reserva de vagas não é atômica", com "overbooking sob concorrência" como consequência. A âncora local original era a versão da função em `supabase/migrations/20260513200000_sprint2_integrity.sql` (linhas 18-119), que fazia um `select ... into v_turma` simples (sem `for update`) seguido, ao final da função, de um `update public.turma set vagas_preenchidas = least(vagas_total, vagas_preenchidas + 1)`. Esse padrão clássico de "ler para checar, depois escrever" é vulnerável a corrida: duas transações concorrentes podem ler `vagas_restantes = 1` antes de qualquer uma commitar, e ambas passam pela checagem `if v_turma.vagas_restantes <= 0`.

Investigação desta story identificou que a versão vigente da função no HEAD anterior a esta migration (`supabase/migrations/20260714231000_public_pre_enrollment_pending.sql`, produzida pela story REC-301) já havia introduzido `select ... for update` ao ler a turma, antes de qualquer refatoração desta story. Sob `READ COMMITTED`, um `SELECT ... FOR UPDATE` bloqueado por outra transação re-lê o valor já commitado ao ser liberado, o que — nesse caso específico — já fechava a janela clássica de leitura simultânea "stale". Ou seja, parte do problema original de FND-12 já havia sido mitigada como efeito colateral de REC-301, embora sem verificação de concorrência real registrada em nenhuma story anterior.

Esta story, ainda assim, substitui esse padrão por uma reserva atômica explícita via `UPDATE ... WHERE vagas_preenchidas < vagas_total RETURNING id`, unindo checagem de capacidade e incremento na mesma instrução, sem `SELECT` prévio separado decidindo a disponibilidade. A motivação de fazer essa troca mesmo com o `FOR UPDATE` já mitigando o pior caso: (1) o `UPDATE ... RETURNING` é auditável por construção — a decisão de sucesso/conflito é o próprio resultado da instrução (`ROW_COUNT`/`FOUND`), não uma inferência sobre semântica de lock; (2) é exatamente o padrão pedido pela Épica 17/FR-03; (3) reduz a superfície de corretude a uma garantia elementar do MVCC do Postgres, sem depender de um mantenedor futuro entender corretamente a interação de `FOR UPDATE` com `READ COMMITTED`.

Como REC-101 já revogou a execução pública/anônima direta desta RPC (`supabase/migrations/20260715100000_revoke_public_enrollment_rpc.sql`), a função permanece temporariamente inacessível para `anon`/`authenticated` até REC-104 (cliente anon dedicado) e REC-107 (endurecimento do endpoint) restaurarem o caminho público. Esta story corrige a atomicidade internamente, para que a função já esteja correta quando o endpoint controlado voltar a chamá-la.

## Escopo

### Incluído

- Refatorar `public.registrar_inscricao_publica` para reservar a vaga atomicamente via `UPDATE public.turma ... WHERE vagas_preenchidas < vagas_total RETURNING id`, preservando a assinatura de parâmetros e o contrato de retorno (código opaco de 16 caracteres hexadecimais).
- Preservar exatamente os códigos de erro e mensagens existentes (`P0001` turma não encontrada, `P0002` status indisponível, `P0003` sem vagas, `P0004` duplicidade), consumidos por `supabase/functions/_shared/enrollment-errors.ts` e por testes existentes (EP12, REC-301).
- Garantir que uma tentativa rejeitada (por qualquer motivo) não deixe vaga reservada, aluno órfão nem inscrição parcial — a reserva de vaga é desfeita automaticamente pelo rollback da transação da chamada quando qualquer checagem posterior falha.
- Escrever teste `pgTAP` sequencial cobrindo os cinco ramos da função após a refatoração.
- Escrever e documentar um teste de concorrência real (duas conexões `psql` simultâneas) disputando a última vaga de uma turma sintética, distinto do teste de concorrência já existente de EP12 (que testa duplicidade de aluno, não disputa de capacidade).
- Produzir migration forward-only.
- Produzir evidência sanitizada para `@qa`.

### Fora do escopo

- Restaurar o acesso público à RPC: REC-104 (cliente anon dedicado) e REC-107 (endurecimento do endpoint).
- Proteger PII de aluno existente por identidade verificada: REC-106.
- Qualquer alteração em `supabase/functions/enrollments/index.ts`, `app/api/enrollments/route.ts` ou outro código de aplicação.
- Qualquer alteração no comportamento financeiro/pré-inscrição definido por REC-301 (o parâmetro `p_forma_pagamento` continua ignorado; `status_inscricao`/`status_pagamento` continuam `'Pendente'`).
- Qualquer alteração nos arquivos de REC-101, REC-102, REC-103 ou REC-104 (migrations, testes ou relatórios já produzidos por essas stories).

## Acceptance Criteria

1. **Reserva atômica de vaga sem SELECT prévio decisório**
   **Given** a migration desta story aplicada,
   **when** `public.registrar_inscricao_publica` é chamada para uma turma com vaga disponível,
   **then** a checagem de capacidade e o incremento de `vagas_preenchidas` ocorrem em uma única instrução `UPDATE ... RETURNING`, sem nenhum `SELECT` anterior decidindo separadamente se há vaga.

2. **Última vaga sob concorrência real produz um sucesso e um conflito coerente**
   **Given** uma turma sintética com exatamente 1 vaga restante,
   **when** duas chamadas concorrentes de processos `psql` distintos (dois alunos diferentes) disputam essa vaga simultaneamente,
   **then** exatamente uma chamada tem sucesso e a outra falha com um erro coerente de falta de capacidade (`P0002` ou `P0003`, nunca uma exceção genérica ou sucesso duplo), sem overbooking (`vagas_preenchidas` nunca excede `vagas_total`, exatamente 1 aluno e 1 inscrição ativa são persistidos).

3. **Tentativa rejeitada não deixa vaga reservada nem registro órfão**
   O aluno e a inscrição da tentativa perdedora não são persistidos; `vagas_preenchidas` não é incrementada pela tentativa rejeitada.

4. **Duplicidade continua protegida mesmo após reserva de vaga**
   Se a checagem de inscrição duplicada (`P0004`) falhar depois da reserva de vaga ter sido aplicada, a vaga reservada é desfeita junto com o rollback da transação da chamada — nenhuma vaga é consumida por uma tentativa duplicada.

5. **Nenhuma regressão nos códigos/mensagens de erro existentes**
   `P0001` (turma não encontrada), `P0002` (status indisponível) e `P0004` (duplicidade) continuam retornando exatamente as mesmas mensagens já consumidas por `enrollment-errors.ts` e pelos testes de EP12/REC-301.

6. **Nenhuma regressão na suíte de banco**
   `npm run test:db` permanece 100% verde, incluindo os testes já existentes de ADR-015, EP12, EP14, REC-101, REC-102, REC-103, REC-104 e REC-301.

7. **Gate independente**
   `@qa` revisa a evidência, executa os testes e emite PASS/CONCERNS/FAIL para REC-105.

## Tasks / Subtasks

- [x] **Task 1 — Investigar a implementação vigente** (AC: 1)
  - [x] Confirmado que `vagas_restantes` é coluna gerada (`generated always as (greatest(vagas_total - vagas_preenchidas, 0)) stored`) em `supabase/migrations/20260512193000_initial_rh_cursos_schema.sql` (linha 175).
  - [x] Confirmado que a versão original (`20260513200000_sprint2_integrity.sql`) fazia `SELECT` simples seguido de `UPDATE` final separado — padrão clássico vulnerável a corrida.
  - [x] Confirmado que a versão vigente antes desta story (`20260714231000_public_pre_enrollment_pending.sql`, produzida por REC-301) já usava `SELECT ... FOR UPDATE`, o que sob `READ COMMITTED` já mitigava a janela clássica de leitura concorrente stale — achado registrado com transparência em vez de alegar correção de uma corrida que já não existia da forma clássica.

- [x] **Task 2 — Refatorar a função para reserva atômica** (AC: 1, 3, 4, 5)
  - [x] Criada `supabase/migrations/20260716100000_rec105_atomic_enrollment.sql` com `UPDATE public.turma SET vagas_preenchidas = vagas_preenchidas + 1 WHERE id = ... AND deleted_at is null AND status in ('Aberta','PoucasVagas') AND vagas_preenchidas < vagas_total RETURNING id`.
  - [x] Diagnóstico pós-falha (`SELECT status, deleted_at`) usado exclusivamente para escolher a mensagem de erro correta (`P0001`/`P0002`/`P0003`), sem influenciar a decisão de sucesso/conflito, já tomada atomicamente pelo `UPDATE`.
  - [x] Reserva de vaga movida para antes do upsert de aluno e da checagem de duplicidade; confirmado que uma exceção não tratada em qualquer ramo posterior (incluindo `P0004`) aborta toda a transação da chamada e desfaz a reserva junto com qualquer escrita em `public.aluno`.
  - [x] Assinatura de parâmetros, contrato de retorno (`codigo_confirmacao`) e comportamento financeiro (REC-301: `status_inscricao='Pendente'`, `forma_pagamento` ignorado) preservados sem alteração.

- [x] **Task 3 — Teste sequencial pgTAP** (AC: 1, 3, 4, 5, 6)
  - [x] Criado `supabase/tests/database/rec-105-atomic-enrollment.test.sql` (10 asserções): última vaga ocupada com sucesso; `vagas_preenchidas` incrementada corretamente; trigger `sync_turma_status` fecha a turma ao esgotar; tentativa seguinte rejeitada com `P0003`; ausência de overbooking; ausência de registro órfão de aluno/inscrição na tentativa rejeitada; reserva de vaga desfeita junto com exceção `P0004` de duplicidade; regressão de `P0001` para turma inexistente.
  - [x] Documentada explicitamente, no cabeçalho do arquivo, a limitação de que pgTAP roda em uma única conexão/transação e portanto **não** exercita concorrência real — apenas a lógica sequencial dos ramos da função.

- [x] **Task 4 — Teste de concorrência real** (AC: 2, 3)
  - [x] Criado `scripts/test-db-rec105-concurrency.mjs`, modelado no script já existente `scripts/test-db-concurrency.mjs` (EP12), mas disputando a última vaga com **dois alunos diferentes** (EP12 usa o mesmo e-mail nas duas chamadas concorrentes, testando duplicidade, não capacidade).
  - [x] Descoberta durante a execução real: como a turma de teste tem exatamente 1 vaga restante, o trigger `sync_turma_status` fecha a turma (`Encerrada`) na mesma transação/commit do vencedor da disputa; a chamada perdedora, ao ser liberada do lock de linha, já observa a turma fechada e recebe `P0002` ("Turma não está disponível para inscrição") em vez de `P0003` ("Turma sem vagas disponíveis."). Ambos são conflitos coerentes de falta de capacidade (nenhum overbooking em nenhum caso); a asserção do script foi ajustada para aceitar `P0002` ou `P0003` e o comportamento foi documentado inline no próprio script, em vez de forçar artificialmente uma mensagem específica.
  - [x] Script wireado em `scripts/test-db.mjs`, executado após o script de concorrência já existente de EP12, como novo passo de `npm run test:db`.

- [x] **Task 5 — Validar suíte completa** (AC: 6)
  - [x] `supabase db reset --local --yes` seguido de `supabase test db --local supabase/tests/database`: 9 arquivos, 100/100 testes, `Result: PASS` (inclui REC-104, aplicada em paralelo por outro agente durante esta sessão).
  - [x] `node scripts/test-db-concurrency.mjs` (EP12): PASS.
  - [x] `node scripts/test-db-rec105-concurrency.mjs` (REC-105): PASS.
  - [ ] `npm run test:db` como um único comando orquestrado (`stop` → `start` → `reset` → suíte → scripts de concorrência) apresentou falhas intermitentes de infraestrutura (containers Docker reiniciados/derrubados no meio da execução) nesta sessão, causadas por outro agente executando operações concorrentes de `supabase start`/`stop`/`reset` contra o mesmo projeto local compartilhado (confirmado pelo aparecimento da migration `20260716120000_rec104_grant_avaliacao_select.sql`, produzida em paralelo). Os três passos que o script orquestra foram validados manualmente, em sequência, contra o mesmo banco, com resultado 100% verde — ver relatório para detalhes e honestidade sobre essa limitação.

- [x] **Task 6 — Consolidar evidência e gate** (AC: 1–7)
  - [x] Relatório sanitizado em `docs/history/reports/rec-105-inscricao-atomica-2026-07-16.md`.
  - [ ] Arquivo de gate QA fica para criação por `@qa` na revisão independente (não criado pelo executor, para preservar AC7).

## Dev Notes

### Fontes verificadas

- A Épica 17 define REC-105 na Onda 2, dependente de REC-101, com entrega "última vaga sob concorrência produz um sucesso e conflitos coerentes". [Fonte: `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md#onda-2--integridade-do-caminho-público-t8-a-t24h`]
- `vagas_total`, `vagas_preenchidas` (colunas armazenadas) e `vagas_restantes` (coluna gerada `greatest(vagas_total - vagas_preenchidas, 0)`) definidas em `supabase/migrations/20260512193000_initial_rh_cursos_schema.sql` (linhas 173-184), com `constraint turma_vagas_chk check (vagas_total >= 0 and vagas_preenchidas >= 0 and vagas_preenchidas <= vagas_total)`.
- Versão original da função (vulnerável ao padrão clássico SELECT-depois-UPDATE): `supabase/migrations/20260513200000_sprint2_integrity.sql` (linhas 18-119).
- Versão vigente antes desta story (já com `SELECT ... FOR UPDATE`, produzida por REC-301): `supabase/migrations/20260714231000_public_pre_enrollment_pending.sql` (linha 33).
- Trigger `sync_turma_status` (fecha a turma para `Encerrada` ao atingir `vagas_preenchidas >= vagas_total`): `supabase/migrations/20260513200000_sprint2_integrity.sql` (linhas 122-148), disparado `before update of vagas_preenchidas on public.turma`.
- Códigos de erro `P0001`-`P0004` consumidos por `supabase/functions/_shared/enrollment-errors.ts`.
- REC-101 já revogou `grant execute` de `anon`/`authenticated` sobre esta função (`supabase/migrations/20260715100000_revoke_public_enrollment_rpc.sql`), tornando-a temporariamente inacessível ao público — esta story corrige a atomicidade internamente, sem restaurar o acesso.
- Script de concorrência real já existente, usado como modelo: `scripts/test-db-concurrency.mjs`, disparado por `scripts/test-db.mjs`; ambos executam contra o Postgres local via `psql`, sem depender de `postgrest`/`kong` (excluídos do `supabase start` de teste).

### Project Structure Notes

- Migration segue o padrão `supabase/migrations/{YYYYMMDDHHMMSS}_{descricao}.sql`; timestamp `20260716100000` escolhido posterior a `20260716090000` (REC-103) e anterior ao timestamp `20260716120000` usado por REC-104 (migration produzida em paralelo por outro agente durante esta sessão) — sem colisão de nome de arquivo.
- Teste `pgTAP` segue `supabase/tests/database/`, mesmo padrão de `rec-301-pre-enrollment.test.sql` (uso de curso/turma sintéticos, `begin ... rollback` para isolamento).
- Script de concorrência real segue `scripts/`, mesmo padrão de `scripts/test-db-concurrency.mjs`.

### Ferramentas e execução segura

- `supabase db reset --local --yes` e `supabase test db --local supabase/tests/database` contra o banco de teste local, nunca produção.
- `psql` contra `postgresql://postgres:postgres@127.0.0.1:54322/postgres` (credencial local de desenvolvimento, não secreta), nunca produção.
- Dados sintéticos (`rec105-course`, `rec105-class`, e-mails `@rhcursos.test`) usados em todos os testes; nenhum dado real de aluno.

## Testing e evidências

- Teste sequencial `pgTAP`: `supabase/tests/database/rec-105-atomic-enrollment.test.sql` (10 asserções).
- Teste de concorrência real: `scripts/test-db-rec105-concurrency.mjs` (duas conexões `psql` simultâneas, dois alunos distintos, turma com 1 vaga restante).
- Suíte completa: `npm run test:db` (decomposta em passos manuais nesta sessão por interferência de infraestrutura de outro agente — ver Task 5 e relatório).

## Observabilidade

- Registrar contagem de sucessos/falhas de cada corrida concorrente sem expor e-mail real (usar `@rhcursos.test`).
- Não usar e-mail, telefone ou identificador de aluno real como exemplo em log ou relatório; usar dado sintético.

## Security Notes

- A refatoração é roll-forward: `create or replace function` sobre a mesma assinatura, sem alterar grants (REC-101 permanece em vigor).
- Reserva de vaga não vaza para fora da transação da chamada em nenhum ramo de falha (garantido pelo rollback automático de exceção não tratada em PL/pgSQL).
- Não usar e-mail real de aluno em nenhum teste versionado.

## Dependências

- **Entrada:** REC-101 (RPC já revogada de acesso público direto, confirmando que a superfície de exploração direta via PostgREST está fechada enquanto esta correção interna é validada).
- **Bloqueia:** REC-107 (endurecimento do endpoint), que assume a reserva de vaga já atômica.
- **Não depende de:** REC-104, REC-106 — trabalho paralelo confirmado nesta sessão (migration `20260716120000_rec104_grant_avaliacao_select.sql` e arquivos de código sob `app/api/enrollments/`, `supabase/functions/enrollments`, `supabase/functions/leads`, `supabase/functions/admin-resources` modificados por outro agente); nenhum desses arquivos foi tocado por esta story.

## Roll-forward / Rollback

- **Roll-forward obrigatório:** qualquer ajuste futuro à lógica de reserva de vaga é uma nova migration explícita com `create or replace function`.
- **Rollback proibido:** reverter esta migration para restaurar o padrão SELECT-depois-UPDATE.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> A validação usa revisão manual da migration e dos testes por `@qa`.

### Story Type Analysis

- **Primary Type:** Database (correção de atomicidade transacional)
- **Secondary Type:** Concurrency / Reliability
- **Complexity:** Média — a lógica em si é direta, mas a interação com o trigger `sync_turma_status` sob concorrência real exigiu investigação e ajuste do teste.
- **Agentes:** executor `@data-engineer`; quality gate independente `@qa`.

### Manual review focus

- Confirmar que o `UPDATE ... RETURNING` é de fato a única fonte de decisão de sucesso/conflito, sem `SELECT` prévio decisório.
- Confirmar que a reserva de vaga é desfeita corretamente quando a checagem de duplicidade falha depois dela.
- Confirmar que o teste de concorrência real dispara duas conexões distintas (não uma simulação sequencial disfarçada).
- Avaliar se a diferenciação P0002/P0003 no cenário de última vaga é aceitável ou se merece uma story de follow-up para mensagem unificada.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-16 | 0.1 | Draft criado a partir da Épica 17 (Onda 2, dependente de REC-101), com escopo exclusivo de atomicidade da reserva de vaga em `registrar_inscricao_publica`. | @sm (River) |
| 2026-07-16 | 1.0 | **GO (10/10) → Draft → Ready.** Checklist de 10 pontos sem lacunas: título claro, contexto/valor completo (FND-12 fundamentado em migrations reais, incluindo achado transparente de que REC-301 já mitigava parcialmente via `FOR UPDATE`), ACs em Given/When/Then cobrindo concorrência real e ramos de erro, escopo incluído/excluído explícito, dependências mapeadas (entrada REC-101; bloqueia REC-107; não depende de REC-104/REC-106, trabalho paralelo confirmado), estimativa (M), valor de negócio (fecha FND-12/AC-17.07), riscos e roll-forward/rollback documentados, gate independente do @qa, alinhamento com Épica 17/Onda 2 confirmado. Bloqueadores documentais: 0. | @po (Pax) |
| 2026-07-16 | 1.1 | **Ready → InProgress → InReview.** `@data-engineer` investigou a implementação vigente (achado: `FOR UPDATE` já presente desde REC-301 mitigava parcialmente a corrida clássica), refatorou a função para reserva atômica via `UPDATE ... RETURNING`, criou teste `pgTAP` sequencial (10 asserções) e teste de concorrência real via duas conexões `psql` simultâneas (`scripts/test-db-rec105-concurrency.mjs`), ajustado após execução real revelar interação com o trigger `sync_turma_status` (P0002 em vez de P0003 no cenário de última vaga — documentado, não escondido). `supabase test db` 100/100 verde; ambos os scripts de concorrência (EP12 e REC-105) verdes. `npm run test:db` como comando único sofreu interferência de infraestrutura de outro agente trabalhando em paralelo (REC-104); os três passos que ele orquestra foram validados manualmente com resultado 100% verde. Gate QA não criado pelo executor (preserva AC7). | @data-engineer (Dara) |
| 2026-07-16 | 1.2 | **InReview → Done.** Gate PASS (97/100) emitido por `@qa` após reexecução limpa de `npm run test:db` (comando único, ambos os agentes já finalizados) → `Files=9, Tests=100, PASS` + ambos os scripts de concorrência PASS. Migration revisada linha a linha; ordem de operações confirmada correta (rollback automático em P0004). | @qa (Quinn) |

## File List

### Criado nesta preparação

- `docs/stories/2026-07-16-rec-105-inscricao-atomica.md`

### Criado nesta execução

- `supabase/migrations/20260716100000_rec105_atomic_enrollment.sql`
- `supabase/tests/database/rec-105-atomic-enrollment.test.sql`
- `scripts/test-db-rec105-concurrency.mjs`
- `docs/history/reports/rec-105-inscricao-atomica-2026-07-16.md`

### Modificado nesta execução

- `scripts/test-db.mjs` — adicionada uma linha invocando `scripts/test-db-rec105-concurrency.mjs` após o script de concorrência já existente de EP12.

### Pendente (criação por `@qa`)

- `docs/qa/gates/rec-105-inscricao-atomica.yml`

### Referências somente leitura

- `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md`
- `docs/stories/2026-07-15-rec-101-revogar-rpc-inscricao-publica.md`
- `supabase/migrations/20260512193000_initial_rh_cursos_schema.sql`
- `supabase/migrations/20260513200000_sprint2_integrity.sql`
- `supabase/migrations/20260714231000_public_pre_enrollment_pending.sql`
- `supabase/migrations/20260715100000_revoke_public_enrollment_rpc.sql`
- `supabase/functions/_shared/enrollment-errors.ts`
- `scripts/test-db-concurrency.mjs`

## Dev Agent Record

### Agent Model Used

Claude (executor agent, persona @data-engineer para esta story).

### Debug Log References

`supabase db reset --local --yes` + `supabase test db --local supabase/tests/database` (Files=9, Tests=100, PASS) + `node scripts/test-db-concurrency.mjs` (PASS) + `node scripts/test-db-rec105-concurrency.mjs` (PASS), executados manualmente em sequência contra o mesmo banco local via Docker, nesta sessão — resultado consolidado em `docs/history/reports/rec-105-inscricao-atomica-2026-07-16.md`, sem segredo ou PII.

### Completion Notes

Função `registrar_inscricao_publica` refatorada para reserva atômica de vaga via `UPDATE ... WHERE vagas_preenchidas < vagas_total RETURNING id`, sem `SELECT` prévio decisório. Investigação preliminar honesta: a versão vigente antes desta story já usava `SELECT ... FOR UPDATE` (produzida por REC-301), o que já mitigava a corrida clássica sob `READ COMMITTED`; a refatoração desta story torna a atomicidade auditável por construção (decisão = resultado de uma única instrução), em vez de depender da semântica de lock. Teste de concorrência real (duas conexões `psql` simultâneas, dois alunos diferentes disputando a última vaga) confirmou exatamente 1 sucesso e 1 conflito coerente, sem overbooking — achado adicional documentado com transparência: a interação com o trigger `sync_turma_status` faz o perdedor da disputa pela última vaga observar `P0002` (turma já fechada) em vez de `P0003` (sem vagas), ambos conflitos coerentes de falta de capacidade. `npm run test:db` como comando único orquestrado sofreu falhas intermitentes de infraestrutura nesta sessão devido a outro agente operando `supabase start`/`stop`/`reset` em paralelo contra o mesmo projeto Docker local compartilhado (evidenciado pela migration `20260716120000_rec104_grant_avaliacao_select.sql`, produzida durante a execução); os três passos que o comando orquestra (reset, suíte pgTAP, ambos os scripts de concorrência) foram validados manualmente em sequência contra o mesmo banco, com resultado 100% verde, e documentados como tal em vez de reportar uma execução única que não ocorreu de fato.

## QA Results

### Gate: PASS ✅ — @qa (Quinn), 2026-07-16

**Gate file:** [`docs/qa/gates/rec-105-inscricao-atomica.yml`](../qa/gates/rec-105-inscricao-atomica.yml) · **Quality score:** 97/100

Verificação independente: `npm run test:db` (execução limpa) → `Files=9, Tests=100, PASS`. Ambos os scripts de concorrência real (EP12 pré-existente + REC-105 novo) reexecutados: PASS, incluindo o achado de caso de borda P0002/P0003 (determinístico, não uma falha intermitente). Migration revisada linha a linha: reserva atômica correta, ordem de operações garante rollback automático em `P0004`. `npm run lint`/`npm run typecheck` limpos.

Todos os itens de AC→evidência do relatório: PASS.

Nota `info`: interferência de Docker compartilhado durante a execução original do agente (PROC-102), resolvida nesta revisão com execução limpa.

**Veredito:** PASS. FND-12 fechado com evidência de concorrência real, não apenas teste sequencial. Nenhuma ação bloqueante.

— Quinn, guardião da qualidade 🛡️
