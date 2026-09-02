# Story: Persistência transacional do checkout Asaas — DP Zero

## Status

Ready for Review

## Executor Assignment

```yaml
executor: "@data-engineer"
quality_gate: "@dev"
quality_gate_tools: [migration_review, rls_review, pgtap, typecheck]
```

## Story

**Como** operação da RH Cursos, **quero** persistir aluno, inscrição, pagamento e eventos Asaas de forma transacional, **para** confirmar compras sem duplicidade, perda de vaga ou inconsistência financeira.

## Dependências e limites

- Baseia-se em `public.aluno`, `public.inscricao`, `public.pagamento` e no controle atual de vagas.
- Não cria API, UI, credencial, webhook externo, deploy ou chamada ao Asaas.
- Referências: `20260513400000_sprint4_evolution.sql`, `20260716100000_rec105_atomic_enrollment.sql` e `20260716130000_rec106_protect_existing_student_pii.sql`.

## Acceptance Criteria

1. Migration compatível evolui `pagamento`: `forma_pagamento` e `parcelas` ficam anuláveis; adiciona `gateway`, `gateway_status`, `checkout_expires_at` e unicidade de `gateway_ref` por gateway.
2. Estados suportam `CREATING`, `CREATION_UNKNOWN`, `ACTIVE`, `FAILED`, `PAID`, `CANCELED`, `EXPIRED` e `MANUAL_REVIEW`, obedecendo integralmente à matriz normativa desta story; transições não listadas falham sem mutação.
3. `public.pagamento_gateway_evento` guarda ID Asaas único, tipo, referências, hash normalizado, estado `RECEIVED|PROCESSED|RETRYABLE_ERROR` e timestamps; não guarda payload bruto ou PII.
4. RLS fica habilitada nas estruturas privadas, sem acesso de `anon` ou `authenticated`; RPCs são `security definer`, têm `search_path` fixo e execução exclusiva de `service_role`.
5. A resolução de identidade obedece à matriz normativa completa desta story. Qualquer conflito ou resultado ambíguo falha sem alterar PII, inscrição ou vaga.
6. A turma é resolvida no servidor entre turmas não excluídas, abertas e `Gravado`, do slug `departamento-pessoal-do-zero`, com `preco_turma = 297`: zero falha; uma seleciona; várias ordenam por `data_inicio ASC NULLS LAST, id ASC`.
7. RPC de início exige `p_idempotency_key` UUID e cria/reutiliza aluno, inscrição `AguardandoPagamento`, pagamento `Pendente` e reserva exatamente uma vaga. Mesma chave + payload normalizado retorna os mesmos IDs; mesma chave + payload diferente falha com conflito, sem nova mutação.
8. Existe no máximo uma tentativa Asaas ativa por inscrição; RPC separada vincula checkout/expiração idempotentemente pelo `pagamento.id` usado como `externalReference`.
9. Falha externa determinística pode marcar `FAILED`, cancelar somente a inscrição ainda aguardando e liberar exatamente uma vaga.
10. Timeout ou resultado ambíguo vira `CREATION_UNKNOWN`: mantém vaga, não compensa e não autoriza retry automático. Webhook pode reconciliar pelo `externalReference` mesmo sem `gateway_ref`.
11. A RPC de webhook insere/recupera evento, trava registros, aplica transição e finaliza o evento atomicamente. Duplicata `PROCESSED` retorna sucesso idempotente; `RETRYABLE_ERROR` pode ser processada novamente sem efeitos parciais.
12. Somente `CHECKOUT_PAID` define pagamento `Pago` e inscrição `Confirmada`; cancelamento/expiração tardios não revertem pagamento. Pagamento tardio reserva novamente ou vira `MANUAL_REVIEW` sem overbooking.
13. `forma_pagamento` e `parcelas` permanecem `NULL` até conciliação validada. `NULL` significa exclusivamente “indefinido/não conciliado”, nunca Pix, cartão ou uma parcela por inferência; quando preenchidas, a forma deve ser `Pix|Cartao` e parcelas deve estar entre 1 e 12.
14. Migration atualiza tipos gerados e inclui rollback operacional documentado, sem quebrar pré-inscrição ou dados existentes.

## Contratos normativos

### Matriz de identidade normalizada

| Match por e-mail | Match por CPF | Resultado |
| --- | --- | --- |
| nenhum | nenhum | Criar um aluno |
| aluno A | aluno A | Reutilizar A sem sobrescrever PII |
| aluno A | nenhum | Falhar por conflito |
| nenhum | aluno A | Falhar por conflito |
| aluno A | aluno B | Falhar por conflito |
| múltiplo/ambíguo | qualquer | Falhar por ambiguidade |

### Matriz de estados do pagamento

| Estado atual | Próximos estados automáticos permitidos | Terminalidade |
| --- | --- | --- |
| `CREATING` | `ACTIVE`, `CREATION_UNKNOWN`, `FAILED` | Não terminal |
| `CREATION_UNKNOWN` | `ACTIVE`, `PAID`, `CANCELED`, `EXPIRED`, `MANUAL_REVIEW` | Não terminal |
| `ACTIVE` | `PAID`, `CANCELED`, `EXPIRED` | Não terminal |
| `CANCELED` | `PAID`, `MANUAL_REVIEW`, somente por pagamento tardio | Terminal salvo pagamento tardio |
| `EXPIRED` | `PAID`, `MANUAL_REVIEW`, somente por pagamento tardio | Terminal salvo pagamento tardio |
| `FAILED` | nenhum | Terminal |
| `PAID` | nenhum | Terminal absoluto |
| `MANUAL_REVIEW` | nenhum automático | Terminal para automação |

A RPC inicial retorna sempre `{ aluno_id, inscricao_id, pagamento_id, gateway_status, idempotency_key, created }`. Pagamento tardio só chega a `PAID` se a vaga for reservada atomicamente; caso contrário chega a `MANUAL_REVIEW`.

## Tasks / Subtasks

- [x] Criar migration, constraints, índices parciais, RLS e grants (AC: 1–4).
- [x] Implementar resolução determinística de aluno e turma (AC: 5–6).
- [x] Implementar RPCs de início, vínculo, falha e `CREATION_UNKNOWN` (AC: 7–10).
- [x] Implementar RPC atômica de eventos e máquina de estados (AC: 11–13).
- [x] Regenerar tipos e documentar rollback (AC: 14).

## Testing

- pgTAP: RLS/grants, preço R$297, seleção 0/1/N, conflito e-mail/CPF, concorrência e reserva/liberação exata.
- pgTAP: timeout preserva vaga; duplicata processada é no-op; duplicata recuperável reprocessa; eventos fora de ordem são monotônicos.
- pgTAP: todas as linhas das matrizes de identidade/estado, chave idempotente repetida e conflito de payload.
- Gates: `npm run test:db`, `npm run typecheck`, `npm run lint`.
- Nenhuma chamada ao Asaas ou mutação externa.

## CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled in `core-config.yaml`. Quality validation will use manual review process only.

## File List previsto

- `supabase/migrations/<timestamp>_asaas_checkout_persistence.sql`
- `supabase/tests/database/asaas-checkout-persistence.test.sql`
- `src/lib/supabase/database.types.ts`

## Change Log

| Data | Versão | Descrição | Autor |
| --- | ---: | --- | --- |
| 2026-08-31 | 0.1 | Draft da persistência transacional Asaas. | River (@sm) |
| 2026-08-31 | 0.2 | Aplicado veredito PO: matrizes normativas, idempotência, nulidade e gate manual. | River (@sm) |

## Dev Agent Record

### Agent Model Used

GPT-5.6 / Codex (@data-engineer delegado e @dev no gate de persistência).

### Debug Log References

`npm run test:db` — PASS (157 testes pgTAP).

`npm run typecheck` — PASS.

`npm run lint` — PASS.

### Completion Notes List

- Migration aplica em banco local e mantém `forma_pagamento`/`parcelas` nulos até conciliação.
- Um teste inicial revelou que `pgcrypto` está no schema `extensions`; a chamada foi qualificada como `extensions.digest` dentro da RPC com `search_path` restrito.
- A reserva de vaga, idempotência, criação ambígua, falha determinística e confirmação pelo webhook são cobertas por pgTAP.

### File List

- `supabase/migrations/20260831120000_asaas_checkout_persistence.sql`
- `supabase/tests/database/asaas-checkout-persistence.test.sql`
- `src/lib/supabase/database.types.ts`

## QA Results

Gate @dev: PASS nos testes de banco, tipos e lint. Pronto para revisão arquitetural da integração de aplicação.

## Story Draft Checklist

READY — objetivo, estados, segurança, erros e testes estão implementáveis; a story de aplicação permanece bloqueada até esta story estar concluída.
