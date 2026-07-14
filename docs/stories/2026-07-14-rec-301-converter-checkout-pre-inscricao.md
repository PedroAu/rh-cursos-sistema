# Story REC-301: Converter checkout em pré-inscrição verdadeira

## Status

Ready

## Executor Assignment

executor: "@dev + @data-engineer"
quality_gate: "@po + @qa"
quality_gate_tools:
- regressão Vitest do store, validação e página de sucesso
- contratos HTTP do route handler e da Edge Function
- pgTAP da migration forward-only em Supabase local isolado
- Playwright da jornada pública com inspeção de request e persistência
- busca negativa por campos/alegações financeiras no fluxo público
- `npm run test:db`
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm test`
- `npm run build`
- CodeRabbit e revisão manual sem PII ou secrets

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 1 — Fechar escrita pública perigosa e comportamentos enganosos
- **Prioridade:** P0
- **Estimativa:** L, por atravessar UI, store, duas entradas HTTP e RPC versionada
- **Finding:** FND-05
- **Requisitos:** FR-02, FR-05, NFR-03, NFR-04, NFR-05 e NFR-09
- **Critérios da épica:** AC-17.09 integral; AC-17.10/AC-17.11 no fluxo de pré-inscrição
- **Gate relacionado:** G2 — Leads e pré-inscrição
- **Dependências:** REC-403 `Done`; REC-401/REC-402 `Done`; REC-001 permanece bloqueador operacional de merge/publicação remota

## Story

**As a** pessoa interessada em uma capacitação,
**I want** enviar uma pré-inscrição sem informar dados financeiros nem receber promessa de pagamento ou vaga confirmada,
**so that** a RH Cursos registre meu interesse de forma verdadeira e apresente uma referência persistida para acompanhamento humano posterior.

## Contexto e diagnóstico confirmado

`src/views/public/CourseCheckout.tsx` se apresenta como checkout financeiro sem
existir gateway, webhook ou liquidação server-side. O formulário coleta número
do cartão, validade e CVV, simula Pix/Boleto, parcelamento e cupom, e declara
“compra segura”/“pagamento processado”. Nenhum desses dados é processado por um
provedor real.

O payload público ainda inclui `paymentMethod`. Tanto
`app/api/enrollments/route.ts` quanto `supabase/functions/enrollments/index.ts`
aceitam esse campo e o encaminham a `registrar_inscricao_publica`. A RPC grava
`status_inscricao = 'Confirmada'`, `status_pagamento = 'Pendente'` e uma forma de
pagamento escolhida, apesar de nenhuma cobrança existir.

O backend já devolve um `enrollmentId` opaco, mas `createEnrollment` o ignora,
inventa um ID temporal local e marca o estado como `Confirmada`. A página de
sucesso recebe nome e forma de pagamento pela URL/sessionStorage e pode exibir
sucesso mesmo quando aberta sem um recibo persistido, usando o primeiro item do
store como fallback.

REC-301 converte essa jornada em pré-inscrição. Ela não escolhe gateway, não
cria pagamento e não resolve atomicidade/identidade por e-mail, que pertencem a
REC-105/REC-106/REC-107. Uma migration mínima é necessária somente para gravar
o estado verdadeiro `Pendente` e `forma_pagamento = null` na RPC existente.

## Escopo

### Incluído

- Renomear a jornada pública para pré-inscrição/solicitação de inscrição.
- Remover do DOM e do estado público cartão, CVV, validade, parcelamento, Pix, Boleto, cupom e endereço de cobrança.
- Manter preço apenas como informação de referência, sem total, desconto, parcelamento, cobrança ou promessa de vaga.
- Remover alegações de compra/pagamento processado, criptografia de pagamento, comprovante e código de pagamento.
- Definir payload público próprio sem `paymentMethod` nem qualquer chave financeira.
- Rejeitar chaves desconhecidas/financeiras nas duas entradas HTTP.
- Fazer servidor e Edge Function passarem `p_forma_pagamento = null` à RPC.
- Criar migration forward-only para a RPC gravar `status_inscricao = 'Pendente'`, `status_pagamento = 'Pendente'` e forma nula.
- Exigir resposta `ok === true`, `enrollmentId` opaco e `classId` antes de qualquer confirmação local.
- Remover fallback público de sucesso apenas local, inclusive quando Functions estiverem ausentes em produção.
- Exibir página de recebimento somente com recibo persistido; acesso direto sem recibo não declara sucesso.
- Remover PII e forma de pagamento da URL; sessionStorage deve conter somente referência opaca e IDs de curso/turma necessários ao resumo.
- Preservar campos e contexto em network error, timeout, non-2xx, conflito ou envelope inválido.

### Fora do escopo

- Contratar ou integrar gateway, adquirente, Pix, boleto, cartão, cupom ou webhook.
- Capturar token de cartão, payment intent, QR code ou código de barras.
- Marcar pagamento como pago, confirmar vaga comercialmente ou emitir nota fiscal.
- Redesenhar atomicidade da última vaga: REC-105.
- Impedir alteração de aluno existente por e-mail: REC-106.
- Implementar idempotência, CAPTCHA, body limit e rate limit definitivo: REC-107.
- Revogar RPC pública/anon e revisar grants: REC-101.
- Sincronizar toda a especificação OpenAPI: REC-406; esta story atualiza somente testes/contratos executáveis diretamente afetados.
- Alterar fluxos administrativos legítimos de forma de pagamento.
- Executar migration ou deploy remoto sem REC-001 e autoridade operacional.

## Acceptance Criteria

1. **Zero coleta financeira pública**
   A rota de pré-inscrição não renderiza nem mantém em estado número de cartão,
   CVV, validade, titular, parcelamento, Pix, boleto, cupom ou endereço de
   cobrança. Busca estática e teste de DOM não encontram esses controles no
   componente público.

2. **Zero alegação enganosa**
   A jornada não usa “checkout”, “finalizar compra”, “compra segura”, “pagamento
   processado”, “comprovante”, “código de pagamento” ou “vaga confirmada”. O CTA
   e o stepper descrevem envio/recebimento de pré-inscrição e análise posterior.

3. **Preço apenas informativo**
   Se o preço do curso continuar visível, ele é identificado como valor de
   referência. Não existe total transacional, desconto/cupom, juros, parcela ou
   seleção de forma de pagamento; condições comerciais são tratadas depois por
   atendimento humano.

4. **Payload público mínimo e estrito**
   O tipo usado por `createEnrollment` e os schemas público/Edge não contêm
   `paymentMethod`. Payload com `paymentMethod`, `cardNumber`, `cardCvv`,
   `installments`, `couponCode` ou campos equivalentes retorna 400, sem executar
   RPC. O contrato administrativo permanece separado e inalterado.

5. **Persistência verdadeira como pendente**
   Uma migration forward-only altera somente o comportamento necessário da RPC:
   pré-inscrição válida persiste `status_inscricao = 'Pendente'`,
   `status_pagamento = 'Pendente'`, `forma_pagamento IS NULL` e mantém um
   `codigo_confirmacao` opaco. Nenhuma migration anterior é editada.

6. **Recibo canônico obrigatório**
   Route handler e Edge Function respondem `201` somente com `ok: true`,
   `enrollmentId` não vazio e `classId` resolvido. `createEnrollment` retorna
   esse recibo; não inventa ID por `Date.now()` nem confirma estado sem envelope
   válido.

7. **Sem sucesso local público**
   Produção sem Functions/configuração, network error, timeout, non-2xx ou JSON
   inválido rejeita. Nenhum desses caminhos muta `enrollments/students`, navega
   para sucesso, limpa campos ou emite confirmação.

8. **Estado local coerente após persistência**
   Quando o recibo válido resolve, qualquer projeção local criada usa o ID real,
   `status = 'Pendente'` e não reduz capacidade como inscrição confirmada. O
   toast, se existir, diz “pré-inscrição recebida”, nunca “inscrição realizada”.

9. **Página de recebimento fail-closed**
   `/inscricao-confirmada` mostra confirmação somente quando navigation state ou
   sessionStorage contém recibo válido da tentativa atual. Acesso direto,
   payload corrompido ou ausência de recibo mostra estado neutro com retorno ao
   catálogo, sem fallback para `enrollments[0]`.

10. **URL e armazenamento sem PII financeira/pessoal**
    A navegação para sucesso não inclui `studentName`, CPF, e-mail, telefone,
    payment method ou qualquer dado financeiro em query string. O armazenamento
    temporário contém apenas `enrollmentId`, `courseId` e `classId`, com schema
    validado antes do uso.

11. **Falhas preservam a tentativa**
    Network error, 400, 409, 429, 500 e envelope 2xx inválido mantêm turma e
    campos digitados, exibem erro seguro e permitem retry. Nenhum log/test
    artifact contém payload pessoal.

12. **Regressão integral e evidência honesta**
    Vitest cobre UI/store/schemas; contratos exercitam route/Edge; pgTAP prova o
    estado persistido; Playwright intercepta o request e confirma ausência de
    chaves financeiras, persistência pendente e recibo real. `npm run test:db`,
    lint, typecheck, unitários, `npm test`, build e CodeRabbit passam. Nenhuma
    execução produtiva é alegada.

## Tasks / Subtasks

- [ ] **Task 1 — Congelar o comportamento inseguro com testes test-first** (AC: 1–4, 6–11)
  - [ ] Provar que cartão/CVV/cupom/parcelamento e alegações financeiras existem antes da correção.
  - [ ] Adicionar teste do payload público rejeitando chaves financeiras desconhecidas.
  - [ ] Adicionar teste do store para ID real, pending, envelope inválido e ausência de fallback local.
  - [ ] Adicionar teste da página de sucesso direta/corrompida/recibo válido.
  - [ ] Atualizar Playwright para inspecionar request e persistência, não pagamento simulado.

- [ ] **Task 2 — Criar contrato público mínimo de pré-inscrição** (AC: 4, 6, 7, 11)
  - [ ] Separar `PublicEnrollmentPayload` do contrato administrativo.
  - [ ] Remover `paymentMethod` dos schemas público e Edge; tornar objetos strict.
  - [ ] Validar recibo `{ ok, enrollmentId, classId }` nas duas respostas.
  - [ ] Preservar mensagens seguras para 400/409/429/500 e envelope inválido.

- [ ] **Task 3 — Persistir estado pendente sem forma de pagamento** (AC: 5, 12)
  - [ ] `@data-engineer` criar nova migration, sem editar as 24 existentes.
  - [ ] Fazer a RPC inserir status de inscrição/pagamento pendentes e forma nula.
  - [ ] Manter confirmação opaca e invariantes existentes de turma/duplicidade.
  - [ ] Adicionar pgTAP para status, forma nula, recibo e erro duplicado.
  - [ ] Executar reset completo e segunda aplicação convergente.

- [ ] **Task 4 — Corrigir route handler e Edge Function** (AC: 4–7, 11)
  - [ ] Passar `p_forma_pagamento: null` após validação estrita.
  - [ ] Nunca registrar payload, PII ou recibo completo em logs de erro.
  - [ ] Retornar o mesmo contrato canônico nas duas entradas.
  - [ ] Cobrir ausência de RPC, erro conhecido, envelope válido e inválido.

- [ ] **Task 5 — Converter a interface em pré-inscrição** (AC: 1–3, 11)
  - [ ] Remover tipos, estado, formatadores, componentes e ícones financeiros.
  - [ ] Remover etapa de pagamento e campos de cobrança/cupom.
  - [ ] Manter seleção de turma e dados mínimos da pessoa/organização.
  - [ ] Reescrever CTA, stepper, resumo e avisos como solicitação pendente.
  - [ ] Preservar valores e turma em erro/retry.

- [ ] **Task 6 — Tornar store e sucesso dependentes do recibo** (AC: 6–10)
  - [ ] Fazer `createEnrollment` retornar recibo canônico e falhar sem backend.
  - [ ] Mutar estado somente após recibo, com ID real/status Pendente.
  - [ ] Não contabilizar pré-inscrição pendente como vaga confirmada no cliente.
  - [ ] Navegar sem query PII e armazenar somente recibo mínimo validado.
  - [ ] Remover fallback da página de sucesso para o primeiro item do store.

- [ ] **Task 7 — Reconciliar consumidores e contratos** (AC: 4, 8–12)
  - [ ] Atualizar testes/componentes que esperam `paymentMethod` no payload público.
  - [ ] Preservar formulário administrativo e relatórios legítimos fora da jornada pública.
  - [ ] Atualizar checkout/public journeys e quaisquer fixtures diretamente afetadas.
  - [ ] Buscar usos públicos remanescentes de cartão/CVV/Pix/Boleto/cupom/compra.

- [ ] **Task 8 — Executar gates e registrar evidências** (AC: 12)
  - [ ] Executar testes direcionados test-first e suíte unitária completa.
  - [ ] Executar `npm run test:db` e convergência local.
  - [ ] Executar lint, typecheck, `npm test` e build.
  - [ ] Executar CodeRabbit sem findings CRITICAL/HIGH.
  - [ ] Atualizar File List/Dev Agent Record e solicitar gate independente `@qa`.

## Dev Notes

### Contrato real confirmado

- `CourseCheckout.tsx` mantém `cardNumber`, `cardCvv`, validade, parcelas, cupom e payment method no estado do browser.
- O frontend envia somente `paymentMethod` ao backend, mas a coleta local dos demais dados já viola FR-05 e AC-17.09.
- `enrollmentSchema` em `src/lib/validation.ts` e `supabase/functions/_shared/validation.ts` aceita payment method e hoje remove silenciosamente chaves desconhecidas.
- As duas entradas chamam a mesma RPC e devolvem `enrollmentId`/`classId`.
- `inscricao.forma_pagamento` é nullable; a RPC aceita parâmetro enum nulo, mas grava `Confirmada` explicitamente.
- `createEnrollment` ignora o ID remoto, inventa IDs locais e produz sucesso local quando nenhum backend é chamado.
- `EnrollmentSuccessPage` aceita PII/query/session e cai para `enrollments[0]`, permitindo confirmação sem vínculo à tentativa atual.

### Limites de autoridade

- `@dev` altera TypeScript/React, contratos executáveis e testes de aplicação.
- `@data-engineer` é o único autor da migration/RPC e dos testes pgTAP.
- `@po` valida que a linguagem não cria promessa comercial nova.
- `@qa` emite o gate final e revisa ausência de coleta financeira/PII.
- `@devops` não executa migration/deploy remoto sem REC-001 e autorização explícita.

### Restrições de segurança e privacidade

- Nunca usar números de cartão, CVV, CPF/e-mail reais ou payloads completos em fixtures/logs.
- Testes de campos financeiros usam strings sintéticas e devem provar rejeição antes de qualquer RPC.
- Não conservar dados financeiros em state, sessionStorage, query, analytics ou error reporting.
- A referência pública deve ser opaca; não derivar recibo de e-mail/CPF/telefone.
- Falha de configuração é indisponibilidade visível, nunca sucesso local.

### Alinhamento de estrutura

- Modificar preferencialmente os arquivos existentes de checkout/sucesso/store/validation.
- Reutilizar `src/lib/contexts/store-types.ts` para o contrato público, sem duplicar tipos soltos no componente.
- Espelhar o schema compartilhado na Edge Function até REC-206 consolidar o BFF.
- Migration nova em `supabase/migrations/`; teste em `supabase/tests/database/`.
- Não editar migrations existentes nem os tipos gerados manualmente antes de validar o schema local.

## Testing

### Test-first obrigatório

- DOM/source falha enquanto cartão/CVV/Pix/Boleto/cupom e frases proibidas existirem.
- Schema falha enquanto payment method ou chaves financeiras forem aceitas.
- Store falha enquanto inventar ID/status Confirmada ou permitir sucesso local.
- Página de sucesso falha enquanto query PII/fallback global produzir confirmação.
- Banco falha enquanto a RPC persistir Confirmada/forma não nula.

### Cenários positivos

- Pessoa física e pessoa jurídica enviam dados válidos sem campo financeiro.
- Backend persiste Pendente, retorna recibo opaco e UI navega sem query PII.
- Refresh da página usa somente recibo mínimo da tentativa atual.
- Preço, quando presente, aparece como referência e não como cobrança.

### Cenários negativos

- Request com payment/card/CVV/installments/coupon → 400 e zero RPC.
- Backend ausente/network/timeout/400/409/429/500 → campos/turma preservados.
- 2xx sem `ok`, `enrollmentId` ou `classId` → rejeição e zero sucesso.
- Acesso direto/corrupt session → estado neutro, sem “recebida com sucesso”.
- Duplicidade mantém mensagem coerente e não cria segundo recibo.

### Gates finais

- testes Vitest direcionados
- contratos HTTP/Edge
- `npm run test:db`
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm test`
- `npm run build`
- CodeRabbit sem findings CRITICAL/HIGH

## Roll-forward / Rollback

- **Roll-forward preferido:** corrigir UI/contrato/migration preservando recibo e estado pendente.
- **Falha da migration:** manter a jornada indisponível; nunca reativar payment fields ou status Confirmada.
- **Rollback seguro da UI:** trocar o formulário por aviso de indisponibilidade e CTA de contato.
- **Rollback proibido:** restaurar cartão/CVV, pagamento simulado, ID temporal, query PII ou sucesso sem persistência.

## Dependências

- **Concluídas:** REC-403, REC-401 e REC-402.
- **Operacional:** REC-001 bloqueia merge/publicação/deploy; implementação e testes permanecem exclusivamente locais/isolados até autorização.
- **Relacionadas posteriores:** REC-101, REC-105, REC-106, REC-107 e REC-406.
- **Bloqueia:** conclusão de AC-17.09 e reabertura completa do gate G2.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> A integração automática não está habilitada no core-config. O executor usa a
> CLI disponível quando a cota permitir, além de revisão manual e gate `@qa`.

### Story Type Analysis

- **Primary Type:** Security / Functional Truth
- **Secondary Types:** Frontend, API Contract, Database
- **Complexity:** Alta — quatro camadas, sem introduzir sistema de pagamento
- **Primary Agents:** `@dev`, `@data-engineer`
- **Quality Gate:** `@po`, `@qa`

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-14 | 0.1 | Draft criado a partir de FND-05/FR-05 e do diagnóstico real de coleta financeira, payload público, RPC Confirmada e recibo ignorado. | @sm (River) |
| 2026-07-14 | 1.0 | **GO — 10/10; Draft → Ready.** Doze ACs testáveis cobrem zero coleta/alegação financeira, payload estrito, migration pending/null, recibo canônico, fail-closed, página de sucesso vinculada à tentativa, URL sem PII e gates integrais. Escopo separa explicitamente gateway, atomicidade, identidade por e-mail e hardening definitivo; `@dev` e `@data-engineer` respeitam suas autoridades. REC-001 permanece bloqueador de merge/publicação, sem impedir implementação local isolada. Bloqueadores documentais: 0. | @po (Pax) |

## File List

### Criado nesta preparação

- `docs/stories/2026-07-14-rec-301-converter-checkout-pre-inscricao.md`

### Planejado para implementação

- `src/views/public/CourseCheckout.tsx`
- `src/views/public/EnrollmentSuccess.tsx`
- `src/lib/contexts/store-types.ts`
- `src/lib/contexts/student-context.tsx`
- `src/lib/app-store.tsx`
- `src/lib/validation.ts`
- `app/api/enrollments/route.ts`
- `supabase/functions/_shared/validation.ts`
- `supabase/functions/enrollments/index.ts`
- `supabase/migrations/<timestamp>_public_pre_enrollment_pending.sql`
- `supabase/tests/database/<rec-301-pre-enrollment>.test.sql`
- testes Vitest e Playwright diretamente afetados

### Referências somente leitura

- `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md`
- `supabase/migrations/20260512193000_initial_rh_cursos_schema.sql`
- `supabase/migrations/20260513200000_sprint2_integrity.sql`
- `tests/helpers/integration-env.ts`

## Dev Agent Record

### Agent Model Used

A preencher por `@dev`/`@data-engineer`.

### Debug Log References

A preencher após testes test-first, sem PII.

### Completion Notes

A preencher pelo executor.

## QA Results

A preencher por `@qa` após validação independente.
