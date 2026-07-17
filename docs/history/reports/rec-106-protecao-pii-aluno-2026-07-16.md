# Relatório — REC-106: Proteger PII de aluno existente

> Nenhum dado real de aluno é reproduzido neste documento. Todos os e-mails/turmas citados são sintéticos (`@rhcursos.test`, `rec106-*`).

Story: [`docs/stories/2026-07-16-rec-106-proteger-pii-aluno-existente.md`](../../stories/2026-07-16-rec-106-proteger-pii-aluno-existente.md) · Épica 17, Onda 2 · Executores: `@data-engineer` + `@dev`.

## 1. Achado de investigação

FND-02 aponta que a "RPC pública de inscrição pode alterar PII de aluno existente a partir do e-mail — Violação de identidade e integridade de dados". A versão vigente da função antes desta story (`supabase/migrations/20260716100000_rec105_atomic_enrollment.sql`, produzida por REC-105 — mesma função, escopo de atomicidade de vaga, sem tocar no upsert de aluno) confirmou o defeito no ramo de aluno existente:

```sql
select id
  into v_aluno_id
  from public.aluno
 where lower(email) = lower(p_email)
   and deleted_at is null
 limit 1;

if v_aluno_id is null then
  insert into public.aluno (...) values (...) returning id into v_aluno_id;
else
  update public.aluno
     set nome_completo = coalesce(nullif(p_nome_completo, ''), nome_completo),
         cpf = coalesce(nullif(p_cpf, ''), cpf),
         telefone = coalesce(nullif(p_telefone, ''), telefone),
         cargo = coalesce(nullif(p_cargo, ''), cargo),
         orgao = coalesce(nullif(p_orgao, ''), orgao),
         tipo_aluno = coalesce(p_tipo_aluno, tipo_aluno)
   where id = v_aluno_id;
end if;
```

Qualquer chamador que soubesse (ou adivinhasse) um e-mail de aluno já cadastrado — e REC-101 já revogou apenas o acesso público **direto** via PostgREST, não a lógica interna — poderia, quando o endpoint controlado (REC-107) for reaberto, sobrescrever qualquer campo não-vazio do payload sobre o cadastro existente. `coalesce(nullif(payload, ''), valor_atual)` significa que só um campo literalmente vazio no payload preservava o valor antigo; qualquer outro valor, correto ou não, sobrescrevia.

## 2. Investigação do schema — decisão de abordagem

`public.aluno` (`supabase/migrations/20260512193000_initial_rh_cursos_schema.sql`, linhas 76-89):

```sql
create table if not exists public.aluno (
  id varchar(80) primary key default gen_random_uuid()::text,
  nome_completo varchar(180) not null,
  email varchar(180) not null,
  cpf varchar(20),
  telefone varchar(30),
  cargo varchar(120),
  orgao varchar(180),
  tipo_aluno public.tipo_aluno not null default 'PF',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint aluno_email_format_chk check (position('@' in email) > 1)
);
```

Nenhuma coluna representa "e-mail verificado" ou qualquer conceito de identidade confirmada. A Opção B do escopo da story (usar um conceito de verificação já existente) foi descartada por ausência de base real no schema — implementá-la exigiria inventar uma coluna nova e um fluxo de confirmação, o que é escopo de uma story de autenticação (REC-201+) e violaria o Artigo IV (No Invention) da Constitution AIOX se feito aqui sem esse contexto.

**Decisão: Opção A.** Quando o e-mail já corresponde a um aluno existente, a função reutiliza `v_aluno_id` para a nova inscrição e não escreve em nenhum campo de PII desse aluno. O aluno existente mantém exatamente os dados que já tinha antes da chamada — a diferença de payload é ignorada silenciosamente para esses campos. O caminho de aluno novo é inalterado.

## 3. Correção aplicada

Nova migration `supabase/migrations/20260716130000_rec106_protect_existing_student_pii.sql` (`create or replace function`, a partir da versão de REC-105). O `else` que fazia `UPDATE public.aluno` foi removido; o `if v_aluno_id is null then ... end if;` agora só cobre o caminho de criação:

```sql
select id
  into v_aluno_id
  from public.aluno
 where lower(email) = lower(p_email)
   and deleted_at is null
 limit 1;

if v_aluno_id is null then
  insert into public.aluno (
    nome_completo, email, cpf, telefone, cargo, orgao, tipo_aluno
  )
  values (
    p_nome_completo, p_email, nullif(p_cpf, ''), nullif(p_telefone, ''),
    nullif(p_cargo, ''), nullif(p_orgao, ''), p_tipo_aluno
  )
  returning id into v_aluno_id;
end if;
```

Nenhuma outra parte da função foi alterada: a reserva atômica de vaga de REC-105 (`UPDATE public.turma ... RETURNING id`), a checagem de duplicidade (`P0004`), os códigos de erro (`P0001`-`P0004`), a assinatura de parâmetros e o contrato de retorno permanecem exatamente iguais.

## 4. Teste pgTAP

`supabase/tests/database/rec-106-protect-existing-student-pii.test.sql` (9 asserções), com curso/turmas sintéticos (`rec106-course`, `rec106-class`, `rec106-class-2`) e e-mails `@rhcursos.test`:

1. Aluno novo criado com sucesso (código opaco de 16 caracteres hex).
2. Todos os campos de PII do aluno novo persistidos exatamente como enviados.
3. Segunda chamada com o **mesmo e-mail em case diferente** (`REC-106-ALUNO@rhcursos.test` vs. `rec-106-aluno@rhcursos.test`) e **payload completamente divergente** em todos os campos de PII, para uma segunda turma (evita colidir com `P0004`, que não é o alvo deste teste): sucesso.
4. **Núcleo do FR-04**: os campos de PII do aluno permanecem exatamente os originais após a segunda chamada, apesar do payload divergente.
5. Nenhum aluno duplicado foi criado pela variação de case no e-mail (exatamente 1 registro).
6. As duas inscrições (turmas distintas) referenciam o mesmo `aluno_id` — reuso, não duplicação.
7. Ambas as inscrições foram de fato persistidas.
8. Regressão: tentativa duplicada na **mesma** turma continua rejeitada com `P0004`.
9. A tentativa rejeitada por `P0004` também não altera a PII do aluno (nenhum ramo de falha escreve PII).

## 5. Validação — suíte completa

`npm run test:db` (comando único orquestrado: stop → start → reset → suíte pgTAP → scripts de concorrência), execução única e limpa nesta sessão, sem interferência de outros agentes:

```
Files=10, Tests=109
Result: PASS
```

Todos os 10 arquivos `ok`, incluindo `rec-106-protect-existing-student-pii.test.sql` (9/9, novo) e os 9 arquivos pré-existentes (100 testes): ADR-015, EP12, EP14, REC-101, REC-102, REC-103, REC-104, REC-105, REC-301 — sem nenhuma regressão.

```
node scripts/test-db-concurrency.mjs        → PASS (EP12, inalterado)
node scripts/test-db-rec105-concurrency.mjs → PASS (REC-105, inalterado — confirma que a
                                                atomicidade de vaga não foi afetada por esta story)
```

## 6. AC → evidência

| AC | Evidência |
|---|---|
| 1 — aluno novo continua sendo criado normalmente | §3 (código); §4, asserções 1-2 |
| 2 — aluno existente reutilizado sem sobrescrita de PII | §3 (código); §4, asserções 3-4 (payload divergente não altera dado persistido) |
| 3 — nenhum aluno duplicado por case do e-mail | §4, asserções 3, 5 |
| 4 — nenhuma regressão em P0001-P0004 | §4, asserções 8-9 (P0004); suíte completa (§5) inclui REC-105/REC-301 (P0001/P0002/P0003) e EP12 (P0004) inalterados |
| 5 — nenhuma regressão na atomicidade de vaga (REC-105) | §5 (`node scripts/test-db-rec105-concurrency.mjs` PASS; `rec-105-atomic-enrollment.test.sql` 10/10 inalterado) |
| 6 — nenhuma regressão na suíte de banco | §5 (`Files=10, Tests=109, PASS`, execução única e limpa) |
| 7 — gate independente | Pendente — a cargo de `@qa` |

## 7. Impacto aceito / dependências

Esta story não restaura o acesso público à RPC (revogado por REC-101, ainda pendente de REC-107 para reabertura via endpoint controlado) nem altera código de aplicação (`supabase/functions/enrollments/index.ts`, `app/api/enrollments/route.ts`, etc.). Nenhum arquivo de REC-101, REC-102, REC-103, REC-104, REC-105 ou REC-301 foi modificado — apenas uma nova migration `create or replace function` a partir da versão de REC-105.

Diferente da experiência de REC-105, `npm run test:db` foi executado como comando único sem interferência de infraestrutura de outro agente nesta sessão.
