# Relatório — REC-105: Corrigir inscrição atômica

> Nenhum dado real de aluno é reproduzido neste documento. Todos os e-mails/turmas citados são sintéticos (`@rhcursos.test`, `rec105-*`).

Story: [`docs/stories/2026-07-16-rec-105-inscricao-atomica.md`](../../stories/2026-07-16-rec-105-inscricao-atomica.md) · Épica 17, Onda 2 · Executor: `@data-engineer`.

## 1. Achado de investigação (transparência antes da correção)

FND-12 aponta "contagem/reserva de vagas não é atômica" com a âncora local original em `supabase/migrations/20260513200000_sprint2_integrity.sql`. Essa versão original de fato usava o padrão clássico vulnerável: `SELECT id, status, vagas_total, vagas_preenchidas, vagas_restantes ... into v_turma` (sem lock) seguido, ao final da função, de `UPDATE public.turma SET vagas_preenchidas = least(vagas_total, vagas_preenchidas + 1)`.

Porém, ao ler a versão **vigente** da função no HEAD anterior a esta story (`supabase/migrations/20260714231000_public_pre_enrollment_pending.sql`, produzida pela story REC-301 em 2026-07-14, antes de REC-105), constatou-se que o `SELECT` já havia ganhado `FOR UPDATE`:

```sql
select id, status, vagas_total, vagas_preenchidas, vagas_restantes, deleted_at
  into v_turma
 from public.turma
 where id = p_turma_id
 limit 1
 for update;
```

Sob `READ COMMITTED` (isolamento padrão do Postgres/Supabase), um `SELECT ... FOR UPDATE` bloqueado pelo lock de outra transação, ao ser liberado, relê o valor **já commitado** da linha — não um snapshot antigo. Isso já fechava, na prática, a janela clássica de "duas leituras concorrentes veem a mesma contagem antes de qualquer commit" descrita por FND-12, como efeito colateral não documentado de REC-301.

Este relatório registra esse achado com transparência em vez de descrever a correção como "eliminação de uma corrida ativa e não mitigada". A refatoração desta story (§2) ainda foi considerada necessária e correta, pelos motivos abaixo.

## 2. Correção aplicada

Nova migration `supabase/migrations/20260716100000_rec105_atomic_enrollment.sql` substitui o padrão `SELECT ... FOR UPDATE` + `UPDATE` final por uma reserva atômica em uma única instrução:

```sql
update public.turma
   set vagas_preenchidas = vagas_preenchidas + 1
 where id = p_turma_id
   and deleted_at is null
   and status in ('Aberta', 'PoucasVagas')
   and vagas_preenchidas < vagas_total
returning id into v_reserved_id;

if v_reserved_id is null then
  -- SELECT de diagnóstico apenas para a MENSAGEM de erro; a decisão de
  -- sucesso/conflito já foi tomada pelo UPDATE acima.
  ...
end if;
```

Motivação de trocar um padrão já parcialmente mitigado por outro mais explícito:

1. **Auditabilidade por construção**: a decisão de sucesso/conflito é o próprio resultado (`FOUND`/`ROW_COUNT`) da instrução, não uma inferência sobre a semântica de bloqueio de `SELECT ... FOR UPDATE` sob `READ COMMITTED`.
2. **Alinhamento direto com FR-03**: "a reserva de vaga deve ser atômica e retornar conflito quando não houver capacidade" — o padrão pedido explicitamente pela Épica 17.
3. **Redução de superfície de corretude**: depende apenas de uma garantia elementar do MVCC do Postgres (duas `UPDATE`s concorrentes sobre a mesma linha nunca aplicam a mesma condição de `WHERE` sobre o mesmo valor "stale"), sem exigir que um mantenedor futuro entenda corretamente a interação de locks explícitos com o nível de isolamento.

A reserva de vaga foi movida para **antes** do upsert de aluno e da checagem de duplicidade (`P0004`). Se qualquer checagem posterior falhar e lançar exceção não tratada, toda a transação da chamada é abortada pelo Postgres — o que desfaz automaticamente a reserva de vaga junto com qualquer escrita em `public.aluno`, sem necessidade de rollback manual dentro da função. Isso foi verificado empiricamente (§4, assertivas 7-8 do teste sequencial).

Assinatura de parâmetros, contrato de retorno (`codigo_confirmacao`, 16 caracteres hexadecimais) e o comportamento financeiro introduzido por REC-301 (`status_inscricao='Pendente'`, `p_forma_pagamento` ignorado) foram preservados sem alteração — fora do escopo desta story.

## 3. Teste sequencial (pgTAP) — lógica, não concorrência real

`supabase/tests/database/rec-105-atomic-enrollment.test.sql` (10 asserções) roda em uma única conexão/transação (`begin ... rollback`), portanto **não exercita concorrência real**. Ele valida a lógica sequencialmente: turma sintética com 1 vaga restante → primeira inscrição ocupa a vaga com sucesso → trigger `sync_turma_status` fecha a turma → segunda tentativa (aluno diferente) é rejeitada com `P0003` e sem overbooking → tentativa rejeitada não deixa aluno/inscrição órfãos → reserva de vaga da tentativa de duplicidade (`P0004`) é desfeita pelo rollback automático → regressão de `P0001` para turma inexistente.

Essa limitação está documentada explicitamente no cabeçalho do próprio arquivo de teste, sem alegar cobertura de concorrência que ele não tem.

## 4. Teste de concorrência REAL — abordagem e achado

Como o pgTAP não exercita concorrência real, foi criado `scripts/test-db-rec105-concurrency.mjs`, modelado no script já existente `scripts/test-db-concurrency.mjs` (de uma story anterior, EP12), que já comprovava ser possível disparar chamadas concorrentes reais via processos `psql` distintos contra o Postgres local (o runner de teste local exclui `postgrest`/`kong`, mas conexão direta via `psql` funciona).

**Diferença deliberada em relação ao script de EP12**: aquele script dispara duas chamadas concorrentes com o **mesmo e-mail**, testando prevenção de inscrição duplicada (`P0004`) — a corrida ali é resolvida pela restrição de unicidade "aluno já inscrito", não pela disputa por vaga. O script desta story dispara duas chamadas concorrentes com **e-mails diferentes** contra uma turma com exatamente 1 vaga restante, exercitando especificamente a disputa pela última vaga (o cenário descrito por AC-17.07 e pelo enunciado da story: "última vaga sob concorrência produz um sucesso e conflitos coerentes").

**Achado durante a execução real**: como a turma-alvo tem exatamente 1 vaga restante, quem vence a reserva atômica leva `vagas_preenchidas` a igualar `vagas_total`, e o trigger `sync_turma_status` (`before update of vagas_preenchidas`) fecha a turma para `'Encerrada'` na mesma transação/commit do vencedor. Quando a `UPDATE` do perdedor — bloqueada pelo lock de linha da primeira `UPDATE` — é reavaliada após o commit do vencedor, ela já enxerga `status='Encerrada'`. O diagnóstico pós-falha relata, portanto, `P0002` ("Turma não está disponível para inscrição") em vez de `P0003` ("Turma sem vagas disponíveis."), de forma **determinística** (não é uma corrida entre duas mensagens possíveis; é a consequência direta e sempre igual de a última vaga fechar automaticamente a turma).

Ambos os códigos são conflitos coerentes de falta de capacidade — em nenhum dos dois casos ocorre overbooking, sucesso duplo ou exceção genérica. A asserção do script foi ajustada para aceitar `P0002` ou `P0003`, com a explicação acima documentada inline no próprio script, em vez de forçar uma mensagem específica que não reflete o comportamento real do sistema (que inclui o trigger de fechamento automático, não apenas a função de inscrição isoladamente).

Resultado real, executado duas vezes de forma independente nesta sessão (ver §5): exatamente 1 sucesso e 1 conflito coerente em cada execução; exatamente 1 aluno e 1 inscrição ativa persistidos; `vagas_preenchidas` final igual a `vagas_total` (nunca excedendo).

O script foi encadeado em `scripts/test-db.mjs`, executado como novo passo de `npm run test:db`, logo após o script de concorrência já existente de EP12.

## 5. Validação — executada contra banco real (ambiente de teste local, Docker)

### 5.1. Suíte pgTAP completa

`supabase db reset --local --yes` (aplica todas as migrations do zero, incluindo esta) seguido de `supabase test db --local supabase/tests/database`, contra Postgres real em container:

```
Files=9, Tests=100
Result: PASS
```

Todos os 9 arquivos `ok`, incluindo `rec-105-atomic-enrollment.test.sql` (10/10) e os já existentes de ADR-015, EP12, EP14, REC-101, REC-102, REC-103, REC-104 e REC-301. Executado com sucesso **duas vezes** de forma independente nesta sessão (mesmo resultado em ambas).

### 5.2. Scripts de concorrência real

```
node scripts/test-db-concurrency.mjs        → PASS (EP12, pré-existente, sem alteração)
node scripts/test-db-rec105-concurrency.mjs  → PASS (REC-105, novo)
```

Executados com sucesso duas vezes de forma independente, imediatamente após cada reset da suíte pgTAP (§5.1), contra o mesmo banco.

### 5.3. Limitação honesta: `npm run test:db` como comando único orquestrado

O comando único `npm run test:db` (que executa `stop` → `start` → `db reset` → suíte pgTAP → os dois scripts de concorrência em sequência) apresentou falhas intermitentes de infraestrutura nesta sessão: containers Docker reiniciados ou encerrados no meio da execução (`error running container: exit 1`/`exit 143`), e em uma tentativa o comando ficou preso por mais de 10 minutos em "Initialising schema..." antes de ser interrompido.

A causa identificada não é relacionada ao conteúdo desta story: outro agente executava, em paralelo, suas próprias operações de `supabase start`/`stop`/`reset` contra o **mesmo projeto Docker local compartilhado** (`supabase_db_site-rh-cursos`) — confirmado pelo aparecimento, no meio desta sessão, da migration `supabase/migrations/20260716120000_rec104_grant_avaliacao_select.sql`, produzida por outro agente trabalhando em REC-104. Dois processos manipulando o ciclo de vida do mesmo container Docker simultaneamente produz exatamente esse tipo de interferência (container derrubado por um processo enquanto o outro está no meio de uma inicialização).

Diante disso, os três passos que `npm run test:db` orquestra internamente foram validados **manualmente, em sequência, contra o mesmo banco**, evitando a janela de conflito do `stop`/`start` orquestrado:

1. `supabase db reset --local --yes` — equivalente ao passo de reset do script.
2. `supabase test db --local supabase/tests/database` — equivalente ao passo de suíte pgTAP do script.
3. `node scripts/test-db-concurrency.mjs` e `node scripts/test-db-rec105-concurrency.mjs` — exatamente os mesmos comandos que o script executa como últimos passos.

Essa validação manual é funcionalmente equivalente à execução do comando único (mesmos comandos, mesma ordem, mesmo banco), mas não constitui uma execução ininterrupta de `npm run test:db` de ponta a ponta nesta sessão. Registrado aqui sem tentar apresentar como se o comando único tivesse rodado limpo quando, de fato, precisou ser decomposto por interferência externa de infraestrutura.

## 6. AC → evidência

| AC | Evidência |
|---|---|
| 1 — reserva atômica sem SELECT prévio decisório | §2 (código da migration); revisão manual da função |
| 2 — última vaga sob concorrência real produz 1 sucesso + 1 conflito coerente | §4-5.2 (script de concorrência real, 2 execuções independentes, PASS em ambas) |
| 3 — tentativa rejeitada não deixa vaga/registro órfão | §3, asserções 5-6 do teste sequencial; §4-5.2 (contagem de aluno/inscrição pós-corrida) |
| 4 — duplicidade continua protegida após reserva | §3, asserções 7-8 do teste sequencial |
| 5 — nenhuma regressão nos códigos/mensagens de erro | §3, asserção 9 (P0001); suíte completa (§5.1) inclui REC-301 (P0001/P0002/P0004) e EP12 (P0004) inalterados |
| 6 — nenhuma regressão na suíte de banco | §5.1 (100/100, 2 execuções); ver também §5.3 sobre a limitação do comando único |
| 7 — gate independente | Pendente — a cargo de `@qa` |

## 7. Impacto aceito / dependências (transparência)

Esta story não restaura o acesso público à RPC (revogado por REC-101) nem altera código de aplicação (`supabase/functions/enrollments/index.ts`, `app/api/enrollments/route.ts`). A função corrigida só volta a ser chamável publicamente após REC-104 (cliente anon dedicado) e REC-107 (endurecimento do endpoint).

Trabalho paralelo confirmado nesta sessão por outro agente (REC-104): migration `20260716120000_rec104_grant_avaliacao_select.sql` e alterações em `app/api/enrollments/route.ts`, `src/lib/supabase/server.ts`, `supabase/functions/admin-resources/index.ts`, `supabase/functions/enrollments/index.ts`, `supabase/functions/leads/index.ts`. Nenhum desses arquivos foi tocado por REC-105; a interação observada foi puramente de infraestrutura Docker compartilhada (§5.3), não de conteúdo.
