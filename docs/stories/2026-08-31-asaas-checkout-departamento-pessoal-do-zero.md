# Story: Integrar checkout hospedado Asaas à LP Departamento Pessoal do Zero

## Status

Draft

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools:
  - architecture_review
  - security_review
  - migration_review
  - contract_tests
  - lint
  - typecheck
  - test:unit
  - test:db
  - build
```

## Origem e rastreabilidade

- Solicitação: transformar a conversão da LP “Departamento Pessoal do Zero” em pagamento direto.
- Gateway: Asaas Checkout hospedado.
- Meios: Pix e cartão de crédito.
- Parcelamento: até 12 vezes sem acréscimo no total exibido pelo site, configurável no servidor.
- Persistência: `public.aluno`, `public.inscricao`, `public.pagamento` e eventos de gateway no Supabase.
- Story relacionada: `docs/stories/2026-08-30-lp-departamento-pessoal-do-zero.md`.
- Parent epic: N/A — solicitação direta.
- Produto aprovado: curso gravado/online de 40 horas, valor de R$ 297, slug `departamento-pessoal-do-zero`.

## Story

**Como** visitante decidido a comprar o curso Departamento Pessoal do Zero,
**quero** pagar por Pix ou cartão em uma página segura hospedada pelo Asaas,
**para** concluir a compra sem informar dados de cartão diretamente ao site da RH Cursos.

## Contexto e decisões

O checkout atual é uma pré-inscrição e não recebe pagamento. Esta story cria um fluxo dedicado somente para a LP, preservando o checkout genérico dos demais cursos.

O site coleta apenas nome, e-mail, CPF e telefone. Esses dados criam ou reutilizam o aluno e uma inscrição `AguardandoPagamento`. Cartão, validade, CVV e autenticação 3DS são informados exclusivamente no Asaas.

A criação síncrona do Checkout Asaas não confirma pagamento. Somente o webhook autenticado `CHECKOUT_PAID` pode marcar `pagamento.status = Pago`, `inscricao.status_pagamento = Pago` e `inscricao.status_inscricao = Confirmada` na mesma transação.

- `[AUTO-DECISION] Integração → Asaas Checkout hospedado via POST /v3/checkouts (reduz escopo PCI e suporta Pix/cartão em uma única página).`
- `[AUTO-DECISION] Limite → 12 parcelas (limite compatível com todas as bandeiras; algumas bandeiras suportam mais).`
- `[AUTO-DECISION] Juros → o app envia e exibe o total fixo de R$ 297 e não calcula acréscimo; a validação comercial final depende do Sandbox e da conta Asaas.`
- `[AUTO-DECISION] Expiração → 30 minutos, configurável entre 10 e 1440 minutos.`
- `[AUTO-DECISION] Dados financeiros → nenhum dado de cartão é recebido, persistido ou registrado pelo app.`
- `[AUTO-DECISION] Catálogo → preço, curso e turma são sempre resolvidos no Supabase; nada comercial vem do navegador.`

Fontes oficiais: [Asaas Checkout](https://docs.asaas.com/docs/asaas-checkout), [Checkout para cartão](https://docs.asaas.com/docs/checkout-para-cart%C3%A3o-de-cr%C3%A9dito), [Eventos para Checkout](https://docs.asaas.com/docs/checkout-events), [Criar Webhook](https://docs.asaas.com/docs/create-new-webhook-via-api).

## Acceptance Criteria

1. A CTA da LP aponta para um checkout dedicado em `/lp/departamento-pessoal-do-zero/checkout`, preservando texto, intenção e `inscricao_cta`. O fluxo `/cursos/[slug]/checkout`, `CourseCheckout`, `/api/enrollments` e `registrar_inscricao_publica` permanece funcional para os demais cursos.

2. O checkout dedicado exibe somente os campos nome, e-mail, CPF e telefone, o produto, o preço autoritativo de R$ 297, Pix e cartão e “até 12x sem juros”. Não existem campos de cartão no app.

3. `POST /api/payments/asaas/checkout`:
   - aceita payload Zod estrito e aplica body/rate limit;
   - aceita somente o produto allowlisted `departamento-pessoal-do-zero`;
   - rejeita preço, moeda, parcelas, turma, callback ou URL enviados pelo cliente;
   - resolve produto ativo e turma gravada aberta no Supabase;
   - obtém o valor de `turma.preco_turma` e exige coerência com a oferta aprovada de R$ 297;
   - cria atomicamente aluno, inscrição `AguardandoPagamento` e pagamento `Pendente` antes de chamar o Asaas;
   - retorna apenas `orderId` e `checkoutUrl` oficial.

4. O request Asaas usa:

   ```json
   {
     "billingTypes": ["PIX", "CREDIT_CARD"],
     "chargeTypes": ["DETACHED", "INSTALLMENT"],
     "externalReference": "<pagamento.id>",
     "items": [{
       "externalReference": "departamento-pessoal-do-zero",
       "name": "Departamento Pessoal do Zero",
       "description": "Formação prática gravada e online",
       "quantity": 1,
       "value": 297
     }],
     "installment": { "maxInstallmentCount": 12 },
     "minutesToExpire": 30,
     "callback": {
       "successUrl": "<origem>/lp/departamento-pessoal-do-zero/pagamento/sucesso",
       "cancelUrl": "<origem>/lp/departamento-pessoal-do-zero/pagamento/cancelado",
       "expiredUrl": "<origem>/lp/departamento-pessoal-do-zero/pagamento/expirado"
     }
   }
   ```

5. Configurações server-only são fail-closed:

   ```text
   ASAAS_API_KEY
   ASAAS_WEBHOOK_TOKEN
   ASAAS_ENVIRONMENT=sandbox|production
   ASAAS_MAX_INSTALLMENTS=1..12
   ASAAS_CHECKOUT_EXPIRES_MINUTES=10..1440
   NEXT_PUBLIC_APP_URL
   ```

   A base URL é derivada do ambiente fechado: Sandbox `https://api-sandbox.asaas.com`; produção `https://api.asaas.com`. Não existe base URL arbitrária.

6. A resposta do Asaas é validada. O redirect aceita somente HTTPS e os hosts/path oficiais esperados para o ambiente. Resposta malformada ou URL externa não produz redirecionamento.

7. `public.pagamento` evolui para suportar checkout misto:
   - `forma_pagamento` e `parcelas` podem ser nulos enquanto a escolha real não é conciliada;
   - inclui `gateway`, `gateway_status` e `checkout_expires_at`;
   - `gateway_ref` é único por gateway;
   - apenas uma tentativa Asaas ativa existe por inscrição.

8. Existe tabela privada `public.pagamento_gateway_evento` com ID de evento Asaas único, tipo, checkout, pagamento, hash normalizado e estado de processamento. RLS fica habilitada, sem grants/policies para `anon` ou `authenticated`; payload bruto e PII não são persistidos.

9. RPCs `security definer`, com `search_path` fixo e execute apenas para `service_role`, implementam:
   - início idempotente da inscrição/pagamento e reserva atômica da vaga;
   - vínculo idempotente do checkout Asaas;
   - compensação de falha na criação externa;
   - recebimento/processamento transacional de webhook;
   - expiração segura de tentativas abandonadas.

10. Cancelamento, expiração ou falha antes do pagamento cancela apenas inscrições ainda aguardando e libera exatamente uma vaga. Transições dentro do conjunto de estados reservados não alteram capacidade.

11. `POST /api/webhooks/asaas`:
   - valida `asaas-access-token` contra `ASAAS_WEBHOOK_TOKEN` em tempo constante;
   - limita o corpo e tolera campos futuros;
   - aceita `CHECKOUT_CREATED`, `CHECKOUT_PAID`, `CHECKOUT_CANCELED` e `CHECKOUT_EXPIRED`;
   - persiste o evento antes de responder 2xx;
   - é idempotente pelo `payload.id`;
   - não registra token, payload bruto ou PII.

12. Transições são monotônicas. `CHECKOUT_PAID` é a única confirmação financeira e nunca regride. Cancelamento/expiração tardios não desfazem pagamento. Pagamento tardio tenta reservar novamente; se não houver vaga, fica marcado para ação manual sem overbooking.

13. O callback de sucesso é apenas navegacional. As páginas de sucesso, cancelamento e expiração são `noindex`, usam o shell da campanha, não fazem mutation e explicam o próximo passo sem falso sucesso.

14. Após criar o checkout e antes do redirect, a UI registra `checkout_iniciado` sem PII:

   ```ts
   { course: "departamento-pessoal-do-zero", provider: "asaas" }
   ```

15. Erros são sanitizados. API key, token de webhook, CPF, e-mail, telefone, headers e resposta bruta do gateway não aparecem em logs ou respostas.

16. Testes cobrem payload autoritativo, Pix/cartão, 1–12 parcelas, configuração inválida, URL allowlist, timeout/erros Asaas, formulário acessível, ausência de campos de cartão, token do webhook, duplicidade, ordem de eventos, pagamento autoritativo, liberação de vaga, RLS/grants e regressão do checkout legado.

17. Antes de `Done`, passam `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run test:db`, `npm run build` e `npm test`. A indisponibilidade de Docker/Supabase deve ser registrada como lacuna ambiental, nunca como teste aprovado.

18. Não há deploy, credencial real, configuração externa de webhook, chamada a Sandbox/produção ou pagamento real nesta story. O produto e uma turma gravada publicada precisam existir no catálogo antes da ativação real.

## Escopo

### Incluído

- Checkout dedicado da LP.
- Formulário de identificação do comprador.
- Cliente Asaas server-only.
- Pix e cartão, à vista e até 12 parcelas.
- Persistência em aluno/inscrição/pagamento.
- Webhook autenticado e idempotente.
- Páginas de retorno.
- Migration, tipos e testes.
- Placeholders de configuração em `.env.example`.

### Fora do escopo

- Alteração do checkout dos demais cursos.
- Formulário próprio ou armazenamento de cartão.
- Boleto, recorrência, split, Pix Automático, reembolso ou chargeback.
- Criação de credenciais/webhook no Asaas.
- Criação inventada de produto, turma ou contato da instrutora.
- Deploy e pagamento real.
- E-mail transacional e nota fiscal.

## Tasks / Subtasks

- [ ] **Task 1 — Implementar persistência e RPCs** (AC: 3, 7–12)
  - [ ] Evoluir `pagamento` sem quebrar registros existentes.
  - [ ] Criar tabela privada de eventos e índices de idempotência.
  - [ ] Implementar início, vínculo, compensação, expiração e webhook transacionais.
  - [ ] Corrigir liberação de vaga em transição para `Cancelada` e delete de `Pendente`.
  - [ ] Atualizar tipos e testes pgTAP.

- [ ] **Task 2 — Implementar cliente Asaas** (AC: 4–6, 15)
  - [ ] Validar configuração server-only.
  - [ ] Criar payload sem dados comerciais vindos do cliente.
  - [ ] Aplicar timeout sem retry cego de POST.
  - [ ] Validar resposta e URL oficial.

- [ ] **Task 3 — Implementar APIs** (AC: 3, 9, 11, 15)
  - [ ] Criar endpoint de checkout com body/rate limit.
  - [ ] Compensar falha externa após claim local.
  - [ ] Criar webhook com comparação timing-safe e evento idempotente.

- [ ] **Task 4 — Implementar UX da LP** (AC: 1–2, 13–14)
  - [ ] Criar checkout dedicado acessível e responsivo.
  - [ ] Atualizar a CTA somente desta LP.
  - [ ] Criar estados de loading/erro e redirect seguro.
  - [ ] Criar páginas de retorno `noindex`.

- [ ] **Task 5 — Testar e documentar** (AC: 16–18)
  - [ ] Testar migration/RPC, cliente, endpoints, UI e callbacks.
  - [ ] Executar regressão do checkout legado.
  - [ ] Atualizar Completion Notes e File List.
  - [ ] Documentar configuração posterior sem executá-la.

## Testing

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run test:db
npm run build
npm test
```

Chamadas Asaas devem ser mockadas/injetadas. Nenhuma credencial real é necessária.

## File List previsto

- `docs/stories/2026-08-31-asaas-checkout-departamento-pessoal-do-zero.md`
- `.env.example`
- `src/lib/validation.ts`
- `src/lib/rate-limit.ts`
- `src/lib/payments/asaas/*`
- `app/api/payments/asaas/checkout/route.ts`
- `app/api/webhooks/asaas/route.ts`
- `app/lp/departamento-pessoal-do-zero/checkout/page.tsx`
- `app/lp/departamento-pessoal-do-zero/pagamento/*/page.tsx`
- `src/features/public/landing-pages/departamento-pessoal-do-zero/*`
- `supabase/migrations/<timestamp>_asaas_checkout.sql`
- `supabase/tests/database/asaas-checkout.test.sql`
- `src/lib/supabase/database.types.ts`
- testes unitários de cliente, APIs, UI e regressão.

## Change Log

| Data | Versão | Descrição | Autor |
| --- | ---: | --- | --- |
| 2026-08-31 | 0.1 | Draft do checkout Asaas com persistência em aluno/inscrição/pagamento e webhook autoritativo. | River (@sm) |

## Dev Agent Record

### Agent Model Used

_A preencher pelo executor._

### Debug Log References

_A preencher pelo executor._

### Completion Notes List

_A preencher pelo executor._

### File List

_A preencher pelo executor._

## QA Results

_A preencher por @qa._

## Story Draft Checklist Validation

| Categoria | Status | Observações |
| --- | --- | --- |
| Goal & Context Clarity | PASS | Jornada, gateway, persistência e autoridade financeira estão explícitos. |
| Technical Implementation Guidance | PASS | API, banco, webhook, segurança e capacidade estão definidos. |
| Reference Effectiveness | PASS | Código local e documentação oficial Asaas sustentam o contrato. |
| Self-Containment Assessment | PASS | Regras comerciais, dependências e fora de escopo estão declarados. |
| Testing Guidance | PASS | Unit, pgTAP, UI e regressão estão definidos. |

**Final Assessment:** READY para validação do PO e implementação local/mockada. Sandbox, configuração comercial “sem juros”, catálogo publicado e deploy permanecem dependências de ativação real.
