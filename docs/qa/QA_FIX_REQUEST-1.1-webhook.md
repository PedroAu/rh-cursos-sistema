# QA Fix Request — Webhook Asaas (Story 1.1)

- **De:** Quinn (QA / Test Architect)
- **Para:** @dev (Dex)
- **Data:** 2026-06-19
- **Branch:** `pr/design-fase-a-tokens`
- **Gate de origem:** `docs/qa/gates/branch-pr-design-fase-a-tokens.yaml` → **CONCERNS**
- **Arquivo alvo:** `src/app/api/payments/webhook/route.ts` + nova migration
- **Escopo:** corrigir a lógica de idempotência/ordenação do webhook. **Não** refatorar o resto da rota.

> Quality gates estão verdes (typecheck, lint, 107 testes). Estes fixes endereçam corretude do fluxo financeiro, não regressão de build.

---

## 🔴 FIX 1 — Idempotência: audit e side-effect devem ser atômicos (HIGH)

### Comportamento esperado
Quando o Asaas reentrega um evento (at-least-once), o status do pagamento deve refletir o último evento **mesmo que** a primeira entrega tenha falhado no meio do caminho.

### Comportamento observado
`route.ts:106-131` insere `payment_events` (marca processado) **antes** do `update` de status. Se o `update` falha (500), a reentrega colide em `asaas_event_id` (23505) e retorna `{ok:true, duplicate:true}` **sem reaplicar o update** → status fica defasado para sempre. Confirmado por `route.test.ts:127` e `route.test.ts:206`.

### Causa raiz
Audit insert e update de status são duas operações não transacionais, e o short-circuit de dedup acontece **antes** de garantir que o side-effect foi aplicado.

### Como corrigir (recomendado: RPC atômica)
Criar uma migration nova com uma função `public.apply_payment_webhook_event(...)` que faça, numa única transação:

1. `INSERT ... ON CONFLICT (asaas_event_id) DO NOTHING` em `payment_events`;
2. `UPDATE payments SET status = ... WHERE id = ...` (somente se o charge existir);
3. retornar se foi `duplicate` **e** se o status final está consistente.

Migration sugerida (`supabase/migrations/<timestamp>_payment_webhook_rpc.sql`):

```sql
create or replace function public.apply_payment_webhook_event(
  p_asaas_event_id  text,
  p_asaas_charge_id text,
  p_event_type      text,
  p_new_status      payment_status,
  p_raw_event       jsonb
)
returns table (payment_id uuid, duplicate boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment_id uuid;
  v_inserted   boolean := false;
begin
  select id into v_payment_id
  from payments
  where asaas_charge_id = p_asaas_charge_id;

  insert into payment_events (payment_id, asaas_event_id, asaas_charge_id, event_type, raw_event)
  values (v_payment_id, p_asaas_event_id, p_asaas_charge_id, p_event_type, p_raw_event)
  on conflict (asaas_event_id) do nothing;

  get diagnostics v_inserted = row_count;  -- 1 = inserido, 0 = duplicado

  -- Aplica o side-effect SOMENTE em primeira entrega e quando o charge existe.
  -- Reaplicação é coberta pelo FIX 2 (guarda de ordem), não por reprocessar duplicados.
  if v_inserted > 0 and v_payment_id is not null then
    update payments set status = p_new_status where id = v_payment_id;
  end if;

  return query select v_payment_id, (v_inserted = 0);
end;
$$;
```

> **Atenção:** o enum `payment_status` precisa aceitar `p_new_status` — ver FIX 3 antes de passar a string crua do Asaas.

Na rota, substituir o trio lookup→insert→update por uma única chamada:

```ts
const { data, error } = await supabase
  .rpc("apply_payment_webhook_event", {
    p_asaas_event_id: payload.id,
    p_asaas_charge_id: payload.payment.id,
    p_event_type: payload.event,
    p_new_status: payload.payment.status,
    p_raw_event: rawPayload,
  })
  .maybeSingle<{ payment_id: string | null; duplicate: boolean }>();

if (error) {
  return jsonError({ error: "payment webhook processing failed" }, 500);
}
if (data?.duplicate) {
  return NextResponse.json({ ok: true, duplicate: true });
}
return NextResponse.json({
  ok: true,
  paymentId: data?.payment_id ?? null,
  status: payload.payment.status,
});
```

Com isso, ou tudo é aplicado, ou nada é — e a reentrega não deixa status defasado.

---

## 🟡 FIX 2 — Guarda de ordem: não regredir status (MEDIUM)

### Comportamento esperado
Um evento atrasado (`PENDING`/`OVERDUE`) **não** pode sobrescrever um `CONFIRMED`/`RECEIVED` já recebido.

### Comportamento observado
`route.ts:122-126` sobrescreve cego com o que o Asaas mandar. Asaas não garante ordem de entrega.

### Como corrigir
Dentro do `update` da RPC do FIX 1, condicionar a transição. Opção determinística: tabela/CASE de precedência de status, aplicando o novo status só quando seu rank for `>=` o atual.

```sql
-- dentro da função, substituir o update simples por:
update payments p
set status = p_new_status
where p.id = v_payment_id
  and public.payment_status_rank(p_new_status) >= public.payment_status_rank(p.status);
```

Criar `payment_status_rank(payment_status) returns int` com a ordem de progressão (ex.: PENDING < AWAITING_RISK_ANALYSIS < CONFIRMED < RECEIVED; estornos/chargebacks com rank alto pois são terminais). Defina os ranks com o @architect/@data-engineer se houver dúvida de negócio — não inventar regra de estorno sem confirmação.

---

## 🟢 FIX 3 — Status desconhecido não pode derrubar o webhook (LOW)

### Comportamento observado
`payments.status` é enum fixo; o webhook grava string crua. Status novo do Asaas → cast falha → 500 em loop de redelivery.

### Como corrigir (escolher 1)
- **A:** validar `payload.payment.status` contra a lista conhecida na rota; se desconhecido, **gravar o evento em `payment_events` (auditoria preservada) e NÃO atualizar `payments.status`**, retornando 200. Assim o evento não fica em loop e nada é perdido.
- **B:** relaxar `payments.status` para `text` com `CHECK` documentado.

Recomendação: **A** — preserva o enum e a fidelidade de auditoria já prometida na migration.

---

## 🟢 FIX 4 — Limpezas de baixo custo (LOW, opcionais nesta rodada)

- `route.ts:65-70` — `isDuplicateEventError` casa por substring da mensagem; após o FIX 1 (RPC com `ON CONFLICT`), esse helper sai de cena. Remover.
- `route.ts:76` — comparar token com `crypto.timingSafeEqual` (constant-time).
- Migration `20260617120000_payments.sql:1-12` — atualizar o comentário de idempotência para refletir a RPC.

> **PII-URL-005** (CPF na query string) fica **fora deste fix request** — é pré-existente e vale uma story própria. Não tocar aqui.

---

## ✅ Critérios de aceite (o que QA vai re-verificar)

1. `npm run typecheck`, `npm run lint`, `npm test` verdes.
2. Novo teste: **reentrega após falha do update reaplica/consolida o status** (cobre a regressão do FIX 1 — hoje `route.test.ts:127/206` codificam o bug; precisam ser atualizados).
3. Novo teste: **evento regressivo não rebaixa status** (FIX 2).
4. Novo teste: **status desconhecido → 200 + evento auditado, sem update e sem loop** (FIX 3).
5. Migration aplica de forma idempotente (segue o padrão `if not exists`/`create or replace` do repo).

---

## Iterações
Máximo de 5 ciclos de fix→re-review (QA Loop). Ao concluir, devolver para `*review` apontando os testes novos. Não dar `git push` — isso é exclusivo do @devops.

— Quinn, guardião da qualidade 🛡️
