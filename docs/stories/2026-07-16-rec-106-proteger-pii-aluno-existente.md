# Story REC-106: Proteger PII de aluno existente

## Status

Done

## Executor Assignment

executor: "@data-engineer" + "@dev"
quality_gate: "@qa"
quality_gate_tools:
- teste `pgTAP` cobrindo aluno novo (criação normal com dados do payload) e aluno existente (reuso do `aluno_id` sem sobrescrita de PII, mesmo com payload divergente), incluindo comparação case-insensitive de e-mail e regressão de duplicidade (`P0004`)
- reexecução completa de `npm run test:db` para confirmar ausência de regressão nas stories REC-101/102/103/104/105/301 e ADR015/EP12/EP14

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 2 — Integridade do caminho público
- **Prioridade:** P0 / SEV-0
- **Estimativa:** S
- **Findings:** FND-02
- **Requisitos:** FR-04, NFR-03
- **Gate relacionado:** contribui para AC-17.08 e para o fechamento de G2 (lead/pré-inscrição)

## Story

**As a** responsável por integridade de identidade e privacidade da RH Cursos,
**I want** que `public.registrar_inscricao_publica` nunca sobrescreva dados de PII (`nome_completo`, `cpf`, `telefone`, `cargo`, `orgao`, `tipo_aluno`) de um aluno existente apenas por coincidência de e-mail,
**so that** um chamador que conheça (ou adivinhe) um e-mail de aluno já cadastrado não consiga alterar o cadastro desse aluno sem qualquer verificação de identidade.

## Contexto e valor

A Épica 17 (FND-02) descreve que "RPC pública de inscrição pode alterar PII de aluno existente a partir do e-mail — Violação de identidade e integridade de dados". FR-04 exige explicitamente: "Dados de aluno existente não podem ser alterados apenas pela coincidência de e-mail."

Investigação da versão vigente da função antes desta story (`supabase/migrations/20260716100000_rec105_atomic_enrollment.sql`, produzida por REC-105 — mesma função, atomicidade de vaga, sem tocar no upsert de aluno) confirmou o defeito: ao encontrar um `public.aluno` existente pelo e-mail (`lower(email) = lower(p_email)`, `deleted_at is null`), a função executava um `UPDATE public.aluno SET nome_completo = ..., cpf = ..., telefone = ..., cargo = ..., orgao = ..., tipo_aluno = ...` incondicional com os valores recebidos no payload da chamada corrente — sobrescrevendo o cadastro existente mesmo que o chamador não seja o dono real daquele e-mail. Como `public.aluno` não distingue o "dono" de um e-mail de "alguém que digitou aquele e-mail em um formulário", qualquer diferença no payload passava a valer, silenciosamente e sem auditoria de identidade.

REC-101 já revogou a execução pública/anônima direta desta RPC (`supabase/migrations/20260715100000_revoke_public_enrollment_rpc.sql`) como contenção de curto prazo — o vetor de chamada direta via PostgREST está fechado. Mas a lógica interna da função ainda tinha esse defeito, que voltaria a importar assim que REC-104 (cliente anon, já `Done`) e REC-107 (endurecimento do endpoint, ainda pendente) restaurarem o acesso via endpoint controlado. Esta story corrige a lógica internamente, para que a função já esteja correta quando o caminho público voltar a existir — mesmo padrão de raciocínio que REC-105 aplicou para a atomicidade de vaga.

### Decisão de abordagem

Investigação do schema de `public.aluno` (`supabase/migrations/20260512193000_initial_rh_cursos_schema.sql`, linhas 76-89) confirmou que a tabela não possui nenhuma coluna ou conceito de "e-mail verificado"/"identidade confirmada" (`id`, `nome_completo`, `email`, `cpf`, `telefone`, `cargo`, `orgao`, `tipo_aluno`, `created_at`, `updated_at`, `deleted_at` — nenhum campo de verificação). Introduzir esse conceito nesta story (ex: coluna `email_verificado`, fluxo de link/OTP) seria escopo de uma story de autenticação (REC-201+), e inventar mecanismo novo sem essa base violaria o Artigo IV (No Invention) da Constitution AIOX, que exige que toda decisão trace a um requisito real, não a uma suposição do executor.

Por isso, a abordagem escolhida é a **Opção A**: quando o e-mail já corresponde a um aluno existente, a função **não sobrescreve nenhum campo de PII** — apenas reutiliza o `aluno_id` existente para a nova inscrição, ignorando silenciosamente as diferenças de payload para esses campos. O aluno existente mantém exatamente os dados que já tinha. Este é o comportamento normativo de FR-04 para esta story: a simples posse (ou digitação) de um e-mail que coincide com um cadastro existente nunca é suficiente para alterá-lo. O caminho de aluno **novo** (e-mail ainda não cadastrado) é inalterado — continua criando o registro com todos os dados do payload.

## Escopo

### Incluído

- Refatorar `public.registrar_inscricao_publica` para, no ramo de aluno já existente (`v_aluno_id` encontrado por e-mail case-insensitive), remover o `UPDATE public.aluno` incondicional e apenas reutilizar `v_aluno_id` para a inscrição — sem escrever em nenhum campo de PII do aluno.
- Preservar o ramo de aluno novo (`v_aluno_id is null`) exatamente como estava: `INSERT` com todos os campos do payload.
- Preservar a assinatura de parâmetros, os códigos de erro existentes (`P0001`-`P0004`) e o contrato de retorno (código opaco de 16 caracteres hexadecimais).
- Preservar a reserva atômica de vaga de REC-105 (`UPDATE ... WHERE vagas_preenchidas < vagas_total RETURNING id`) sem nenhuma alteração.
- Escrever teste `pgTAP` cobrindo aluno novo e aluno existente (payload divergente, e-mail com case diferente, regressão de `P0004`).
- Produzir migration forward-only (`create or replace function`) a partir da versão de REC-105.
- Produzir evidência sanitizada para `@qa`.

### Fora do escopo

- Qualquer mecanismo de verificação de e-mail por link/OTP, coluna nova de "e-mail verificado" ou qualquer forma de confirmar que o chamador é de fato o dono do e-mail — isso é Opção B, não aplicável aqui por ausência do conceito no schema atual; se necessário, é escopo de REC-201+ (autenticação).
- Restaurar o acesso público à RPC: já revogado por REC-101; restauração é REC-104 (`Done`, cliente anon) e REC-107 (endurecimento do endpoint, ainda pendente).
- Qualquer alteração na reserva atômica de vaga produzida por REC-105.
- Qualquer alteração em `supabase/functions/enrollments/index.ts`, `app/api/enrollments/route.ts` ou outro código de aplicação.
- Qualquer alteração no comportamento financeiro/pré-inscrição definido por REC-301 (`p_forma_pagamento` continua ignorado; `status_inscricao`/`status_pagamento` continuam `'Pendente'`).
- Qualquer alteração nos arquivos de REC-101, REC-102, REC-103, REC-104, REC-105 ou REC-301 (migrations, testes ou relatórios já produzidos por essas stories).

## Acceptance Criteria

1. **Aluno novo continua sendo criado normalmente**
   **Given** um e-mail que ainda não corresponde a nenhum `public.aluno` não excluído,
   **when** `public.registrar_inscricao_publica` é chamada com esse e-mail,
   **then** um novo registro de `public.aluno` é criado com todos os campos de PII exatamente como recebidos no payload.

2. **Aluno existente é reutilizado sem sobrescrita de PII**
   **Given** um `public.aluno` já cadastrado, identificado por e-mail (case-insensitive),
   **when** `public.registrar_inscricao_publica` é chamada novamente com o mesmo e-mail e valores diferentes para `nome_completo`, `cpf`, `telefone`, `cargo`, `orgao` ou `tipo_aluno`,
   **then** o `aluno_id` existente é reutilizado para a nova inscrição e nenhum dos campos de PII do aluno é alterado — o registro mantém exatamente os dados que já tinha antes da chamada.

3. **Nenhum aluno duplicado por variação de case no e-mail**
   A comparação de e-mail para decidir entre "aluno novo" e "aluno existente" continua case-insensitive (`lower(email) = lower(p_email)`); nenhum segundo registro de aluno é criado quando o e-mail difere apenas em maiúsculas/minúsculas.

4. **Nenhuma regressão nos códigos/mensagens de erro existentes**
   `P0001` (turma não encontrada), `P0002` (status indisponível), `P0003` (sem vaga) e `P0004` (duplicidade) continuam retornando exatamente as mesmas mensagens já consumidas por `enrollment-errors.ts` e pelos testes de EP12/REC-105/REC-301. Em particular, uma tentativa rejeitada por `P0004` também não altera a PII do aluno existente.

5. **Nenhuma regressão na atomicidade de vaga de REC-105**
   A reserva de vaga via `UPDATE ... WHERE vagas_preenchidas < vagas_total RETURNING id` permanece inalterada e é a única fonte de decisão de sucesso/conflito de capacidade.

6. **Nenhuma regressão na suíte de banco**
   `npm run test:db` permanece 100% verde, incluindo os testes já existentes de ADR-015, EP12, EP14, REC-101, REC-102, REC-103, REC-104, REC-105 e REC-301, além dos scripts de concorrência real (EP12 e REC-105).

7. **Gate independente**
   `@qa` revisa a evidência, executa os testes e emite PASS/CONCERNS/FAIL para REC-106.

## Tasks / Subtasks

- [x] **Task 1 — Investigar a implementação vigente e o schema de `public.aluno`** (AC: 1, 2)
  - [x] Confirmado, em `supabase/migrations/20260716100000_rec105_atomic_enrollment.sql` (linhas 95-132), o `UPDATE public.aluno` incondicional no ramo de aluno já existente, sobrescrevendo `nome_completo`, `cpf`, `telefone`, `cargo`, `orgao`, `tipo_aluno` com `coalesce(nullif(payload, ''), valor_atual)` — ou seja, qualquer campo não-vazio do payload sobrescrevia o valor já cadastrado.
  - [x] Confirmado, em `supabase/migrations/20260512193000_initial_rh_cursos_schema.sql` (linhas 76-89), que `public.aluno` não possui nenhuma coluna de verificação de e-mail/identidade — descartando a Opção B por ausência do conceito no schema real (Artigo IV — No Invention).

- [x] **Task 2 — Refatorar a função para não sobrescrever PII de aluno existente** (AC: 1, 2, 3, 4, 5)
  - [x] Criada `supabase/migrations/20260716130000_rec106_protect_existing_student_pii.sql` com `create or replace function` a partir da versão vigente de REC-105.
  - [x] Removido o `UPDATE public.aluno` do ramo `else` (aluno existente); mantido apenas o `SELECT id INTO v_aluno_id` seguido da reutilização direta do `v_aluno_id` já encontrado, sem nenhuma escrita.
  - [x] Ramo de aluno novo (`INSERT`) preservado sem alteração.
  - [x] Reserva atômica de vaga (REC-105) e checagem de duplicidade (`P0004`) preservadas sem alteração de ordem ou lógica.

- [x] **Task 3 — Teste pgTAP** (AC: 1, 2, 3, 4)
  - [x] Criado `supabase/tests/database/rec-106-protect-existing-student-pii.test.sql` (9 asserções): aluno novo criado com todos os dados do payload; aluno existente (mesmo e-mail, case diferente) reutilizado sem sobrescrita de nenhum campo de PII mesmo com payload totalmente divergente; nenhum aluno duplicado pela variação de case; mesmo `aluno_id` nas duas inscrições (turmas distintas, para não colidir com `P0004`); ambas as inscrições persistidas; regressão de `P0004` para tentativa duplicada na mesma turma; PII do aluno preservada mesmo após a tentativa rejeitada por `P0004`.

- [x] **Task 4 — Validar suíte completa** (AC: 6)
  - [x] `npm run test:db` (comando único orquestrado: stop → start → reset → suíte pgTAP → scripts de concorrência): `Files=10, Tests=109, Result: PASS`. Inclui os 9 arquivos pré-existentes (100 testes) mais o novo arquivo desta story (9 testes).
  - [x] `node scripts/test-db-concurrency.mjs` (EP12): PASS.
  - [x] `node scripts/test-db-rec105-concurrency.mjs` (REC-105): PASS — confirma que esta story não introduziu nenhuma regressão na atomicidade de vaga.

- [x] **Task 5 — Consolidar evidência e gate** (AC: 1-7)
  - [x] Relatório sanitizado em `docs/history/reports/rec-106-protecao-pii-aluno-2026-07-16.md`.
  - [ ] Arquivo de gate QA fica para criação por `@qa` na revisão independente (não criado pelo executor, para preservar AC7).

## Dev Notes

### Fontes verificadas

- A Épica 17 define REC-106 na Onda 2, dependente de REC-105, com entrega "E-mail sem identidade verificada não altera cadastro existente". [Fonte: `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md#onda-2--integridade-do-caminho-público-t8-a-t24h`]
- `public.aluno`: `id`, `nome_completo`, `email` (índice único case-insensitive `aluno_email_unique_idx` sobre `deleted_at is null`), `cpf` (índice único parcial), `telefone`, `cargo`, `orgao`, `tipo_aluno`, `created_at`, `updated_at`, `deleted_at`. [Fonte: `supabase/migrations/20260512193000_initial_rh_cursos_schema.sql`, linhas 76-97]
- Versão vigente antes desta story (produzida por REC-105, atomicidade de vaga): `supabase/migrations/20260716100000_rec105_atomic_enrollment.sql` (linhas 95-132, ramo de upsert de aluno com `UPDATE` incondicional no `else`).
- Códigos de erro `P0001`-`P0004` consumidos por `supabase/functions/_shared/enrollment-errors.ts` — inalterados por esta story.
- REC-101 já revogou `grant execute` de `anon`/`authenticated` sobre esta função (`supabase/migrations/20260715100000_revoke_public_enrollment_rpc.sql`), tornando-a temporariamente inacessível ao público — esta story corrige a lógica de PII internamente, sem restaurar o acesso.

### Project Structure Notes

- Migration segue o padrão `supabase/migrations/{YYYYMMDDHHMMSS}_{descricao}.sql`; timestamp `20260716130000` escolhido posterior a `20260716120000` (REC-104, migration mais recente já aplicada nesta sessão) e à migration de REC-105 (`20260716100000`).
- Teste `pgTAP` segue `supabase/tests/database/`, mesmo padrão de `rec-105-atomic-enrollment.test.sql` (curso/turma sintéticos, `begin ... rollback` para isolamento, e-mails `@rhcursos.test`).

### Ferramentas e execução segura

- `npm run test:db` contra o banco de teste local (Docker), nunca produção.
- Dados sintéticos (`rec106-course`, `rec106-class`, `rec106-class-2`, e-mails `@rhcursos.test`) usados em todos os testes; nenhum dado real de aluno.

## Testing e evidências

- Teste `pgTAP`: `supabase/tests/database/rec-106-protect-existing-student-pii.test.sql` (9 asserções).
- Suíte completa: `npm run test:db` — `Files=10, Tests=109, Result: PASS` (execução única e limpa, sem interferência de agentes concorrentes nesta sessão).

## Observabilidade

- Registrar apenas contagens e vereditos nos relatórios; nunca e-mail, telefone, CPF ou nome real de aluno.
- Todos os dados de teste usam o domínio sintético `@rhcursos.test`.

## Security Notes

- A refatoração é roll-forward: `create or replace function` sobre a mesma assinatura, sem alterar grants (REC-101 permanece em vigor).
- Nenhum campo de PII de `public.aluno` é escrito fora do `INSERT` do caminho de aluno novo.
- Não usar e-mail real de aluno em nenhum teste versionado.

## Dependências

- **Entrada:** REC-105 (Done — reserva de vaga já atômica; esta story parte dessa versão da função sem alterar sua lógica de capacidade).
- **Bloqueia:** REC-107 (endurecimento do endpoint), que assume que a função já não permite alteração de PII por coincidência de e-mail.
- **Não depende de:** REC-104 (cliente anon, já `Done`, trabalho de aplicação não tocado por esta story).

## Roll-forward / Rollback

- **Roll-forward obrigatório:** qualquer ajuste futuro à lógica de upsert de aluno (incluindo eventual introdução de verificação de identidade real) é uma nova migration explícita com `create or replace function`.
- **Rollback proibido:** reverter esta migration para restaurar a sobrescrita incondicional de PII de aluno existente.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> A validação usa revisão manual da migration e dos testes por `@qa`.

### Story Type Analysis

- **Primary Type:** Database (correção de integridade/privacidade de dados)
- **Secondary Type:** Security / Privacy
- **Complexity:** Baixa — remoção de um `UPDATE` incondicional, sem interação com concorrência ou outras lógicas de negócio.
- **Agentes:** executor `@data-engineer` + `@dev`; quality gate independente `@qa`.

### Manual review focus

- Confirmar que nenhum campo de PII é escrito no ramo de aluno existente.
- Confirmar que o ramo de aluno novo continua idêntico ao comportamento anterior.
- Confirmar que a comparação de e-mail continua case-insensitive e que nenhum aluno duplicado é criado.
- Confirmar que a decisão de não implementar verificação de identidade (Opção B) está corretamente justificada pela ausência do conceito no schema, não por conveniência.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-16 | 0.1 | Draft criado a partir da Épica 17 (Onda 2, dependente de REC-105), com escopo exclusivo de proteção de PII de aluno existente em `registrar_inscricao_publica`. | @sm (River) |
| 2026-07-16 | 1.0 | **GO (10/10) → Draft → Ready.** Checklist de 10 pontos sem lacunas: título claro, contexto/valor completo (FND-02 fundamentado na migration real de REC-105, decisão Opção A vs. Opção B documentada e justificada pela ausência de coluna de verificação no schema), ACs em Given/When/Then cobrindo aluno novo, aluno existente, case-insensitive e regressão de erros, escopo incluído/excluído explícito (Opção B explicitamente fora de escopo), dependências mapeadas (entrada REC-105; bloqueia REC-107), estimativa (S), valor de negócio (fecha FND-02/AC-17.08), riscos e roll-forward/rollback documentados, gate independente do @qa, alinhamento com Épica 17/Onda 2 confirmado. Bloqueadores documentais: 0. | @po (Pax) |
| 2026-07-16 | 1.1 | **Ready → InProgress → InReview.** `@data-engineer` + `@dev` investigaram a implementação vigente (achado: `UPDATE public.aluno` incondicional no ramo de aluno existente, usando `coalesce(nullif(payload,''), valor_atual)` para sobrescrever qualquer campo não-vazio do payload) e o schema de `public.aluno` (achado: nenhuma coluna de verificação de e-mail/identidade existe, descartando Opção B por ausência de base real — Artigo IV). Refatorada a função para reutilizar `v_aluno_id` sem nenhuma escrita de PII no ramo de aluno existente, preservando o ramo de aluno novo e a atomicidade de vaga de REC-105 sem alteração. Criado teste `pgTAP` (9 asserções) cobrindo aluno novo, aluno existente com payload divergente, case-insensitive, reuso de `aluno_id`, e regressão de `P0004` incluindo verificação de que a tentativa rejeitada também não altera PII. `npm run test:db` executado como comando único, execução limpa, sem interferência de outros agentes: `Files=10, Tests=109, Result: PASS`; ambos os scripts de concorrência (EP12 e REC-105) verdes, confirmando ausência de regressão na atomicidade de vaga. Gate QA não criado pelo executor (preserva AC7). | @data-engineer (Dara) |

## File List

### Criado nesta preparação

- `docs/stories/2026-07-16-rec-106-proteger-pii-aluno-existente.md`

### Criado nesta execução

- `supabase/migrations/20260716130000_rec106_protect_existing_student_pii.sql`
- `supabase/tests/database/rec-106-protect-existing-student-pii.test.sql`
- `docs/history/reports/rec-106-protecao-pii-aluno-2026-07-16.md`

### Modificado nesta execução

- Nenhum arquivo TypeScript ou de outra story foi modificado.

### Pendente (criação por `@qa`)

- `docs/qa/gates/rec-106-proteger-pii-aluno-existente.yml`

### Referências somente leitura

- `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md`
- `docs/stories/2026-07-16-rec-105-inscricao-atomica.md`
- `supabase/migrations/20260512193000_initial_rh_cursos_schema.sql`
- `supabase/migrations/20260716100000_rec105_atomic_enrollment.sql`
- `supabase/migrations/20260715100000_revoke_public_enrollment_rpc.sql`
- `supabase/functions/_shared/enrollment-errors.ts`

## Dev Agent Record

### Agent Model Used

Claude (executor agent, persona @data-engineer + @dev para esta story).

### Debug Log References

`npm run test:db` (comando único orquestrado: stop → start → reset → suíte pgTAP → scripts de concorrência) executado nesta sessão, execução única e limpa: `Files=10, Tests=109, Result: PASS` (inclui os 9 arquivos/100 testes pré-existentes mais o novo arquivo desta story). `node scripts/test-db-concurrency.mjs` (EP12) e `node scripts/test-db-rec105-concurrency.mjs` (REC-105) PASS, confirmando ausência de regressão na atomicidade de vaga. Resultado consolidado em `docs/history/reports/rec-106-protecao-pii-aluno-2026-07-16.md`, sem segredo ou PII.

### Completion Notes

Função `registrar_inscricao_publica` refatorada: o ramo de aluno já existente (encontrado por e-mail case-insensitive) deixou de executar qualquer `UPDATE` sobre `public.aluno`; apenas reutiliza o `aluno_id` já encontrado para a nova inscrição. O ramo de aluno novo permanece idêntico (INSERT com todos os dados do payload). Decisão de abordagem documentada com transparência: Opção A (não sobrescrever PII) foi escolhida em vez da Opção B (verificação de identidade) porque `public.aluno` não possui nenhum conceito de e-mail verificado no schema atual — inventar essa coluna nesta story violaria o Artigo IV (No Invention) da Constitution AIOX; se um mecanismo de verificação real for necessário no futuro, é escopo de uma story de autenticação (REC-201+). Teste `pgTAP` novo (9 asserções) cobre explicitamente o cenário mais importante do FR-04: um payload deliberadamente divergente em todos os campos de PII não altera nenhum dado do aluno existente, mesmo variando o case do e-mail. `npm run test:db` executado como comando único, sem interferência de outros agentes nesta sessão (diferente da experiência de REC-105): `Files=10, Tests=109, Result: PASS`, incluindo ambos os scripts de concorrência real (EP12 e REC-105), confirmando que a atomicidade de vaga permanece intacta.

**InReview → Done.** Gate PASS (95/100) emitido por `@qa` após revisão independente da migration (UPDATE incondicional de PII confirmado removido, resto da função intacto) e confirmação da suíte (Files=10, Tests=109, PASS).

## QA Results

### Gate: PASS ✅ — @qa (Quinn), 2026-07-16

**Gate file:** [`docs/qa/gates/rec-106-proteger-pii-aluno-existente.yml`](../qa/gates/rec-106-proteger-pii-aluno-existente.yml) · **Quality score:** 95/100

Migration revisada linha a linha: o `UPDATE` incondicional de PII foi removido por completo; apenas a reutilização de `aluno_id` permanece no ramo de aluno existente. Reserva atômica de vaga (REC-105) e checagem de duplicidade (`P0004`) confirmadas intactas. `npm run test:db` → `Files=10, Tests=109, PASS`, incluindo os dois scripts de concorrência real sem regressão.

**Veredito:** PASS. FND-02 fechado na parte de integridade de PII. Decisão de escopo (Opção A) corretamente fundamentada em Article IV. Nenhuma ação bloqueante.

— Quinn, guardião da qualidade 🛡️
