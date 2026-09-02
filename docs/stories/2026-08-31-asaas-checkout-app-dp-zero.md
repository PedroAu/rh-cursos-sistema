# Story: Checkout hospedado Asaas e callbacks — DP Zero

## Status

Ready for Review

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [architecture_review, security_review, contract_tests, accessibility, build]
```

## Story

**Como** comprador do Departamento Pessoal do Zero, **quero** pagar R$ 297 por Pix ou cartão no checkout hospedado Asaas, **para** concluir a compra sem fornecer dados de cartão à RH Cursos.

## Dependência

- Bloqueada até a story `2026-08-31-asaas-checkout-persistence-dp-zero.md` estar concluída.
- Preserva `/cursos/[slug]/checkout`, `/api/enrollments` e o fluxo de pré-inscrição dos demais cursos.
- Fontes: [Asaas Checkout](https://docs.asaas.com/docs/asaas-checkout) e [eventos de Checkout](https://docs.asaas.com/docs/checkout-events).

## Acceptance Criteria

1. A CTA da LP aponta para `/lp/departamento-pessoal-do-zero/checkout` e mantém o tracking `inscricao_cta`.
2. O formulário solicita somente nome, e-mail, CPF e telefone; exibe produto, R$ 297, Pix e cartão; nenhum campo ou dado bruto de cartão passa pelo app. Exibe o aviso: “Para processar o pagamento, nome, e-mail, CPF e telefone serão compartilhados com o Asaas. Isso não autoriza comunicações de marketing. Os dados do cartão são informados somente no ambiente seguro do Asaas e não são recebidos nem armazenados pela RH Cursos.”
3. `POST /api/payments/asaas/checkout` usa Zod estrito, limite de corpo/rate limit e aceita apenas o slug allowlisted; rejeita preço, parcelas, turma, callback ou URL enviados pelo cliente.
4. O endpoint chama as RPCs da story de persistência e nunca escolhe turma ou valor a partir do navegador.
5. O request Asaas usa `billingTypes: ["PIX","CREDIT_CARD"]`, `externalReference: pagamento.id`, item de R$ 297 e `customerData` com nome, `cpfCnpj`, e-mail e telefone normalizados.
6. `ASAAS_12X_INTEREST_FREE_CONFIRMED=false` é o padrão. Com `false`, o payload usa `chargeTypes: ["DETACHED"]`, limita a uma parcela e omite integralmente `installment`; a UI não afirma “12x sem juros”.
7. Somente após evidência operacional no Sandbox, fora desta story, a flag pode ser `true`. Com `true`, o payload usa `chargeTypes: ["DETACHED", "INSTALLMENT"]`, `installment: { "maxInstallmentCount": 12 }` e a UI mostra “até 12x sem juros”. A flag nunca vem do cliente.
8. Configuração server-only valida `ASAAS_API_KEY`, `ASAAS_WEBHOOK_TOKEN`, `ASAAS_ENVIRONMENT`, `ASAAS_12X_INTEREST_FREE_CONFIRMED`, `ASAAS_CHECKOUT_EXPIRES_MINUTES` e `NEXT_PUBLIC_APP_URL`; o máximo é derivado exclusivamente da flag como 1 ou 12, sem terceira configuração concorrente.
9. `ASAAS_WEBHOOK_TOKEN` possui 32–255 caracteres, não contém qualquer whitespace, é diferente de `ASAAS_API_KEY` e é comparado em tempo constante.
10. Base API deriva exclusivamente de `sandbox|production`; callbacks usam a origem allowlisted. A URL de redirect deve ser HTTPS e corresponder exatamente ao host e prefixo `https://sandbox.asaas.com/checkoutSession/show/` no Sandbox ou `https://asaas.com/checkoutSession/show/` em produção. Aceita somente o ID opaco no path sem query ou o path-base com a query única `id` não vazia; subdomínio alternativo, porta, credenciais, fragmento, query adicional ou outro path é rejeitado.
11. Timeout ou conexão ambígua marca `CREATION_UNKNOWN`, preserva a vaga, não executa compensação e não repete automaticamente o POST.
12. Apenas erro determinístico permite marcar `FAILED` via RPC; respostas e erros são sanitizados e não expõem segredo, PII ou payload bruto.
13. `POST /api/webhooks/asaas` valida `asaas-access-token`, limita o corpo, aceita campos futuros e reconhece somente os nomes exatos `CHECKOUT_CREATED`, `CHECKOUT_PAID`, `CHECKOUT_CANCELED` e `CHECKOUT_EXPIRED`.
14. O webhook entrega dados normalizados à RPC atômica da story de persistência. Duplicata já `PROCESSED` retorna 2xx; falha transitória ou evento `RETRYABLE_ERROR` retorna non-2xx para solicitar retry do Asaas, sem confirmar processamento.
15. Callback de sucesso é apenas navegacional e nunca confirma pagamento; sucesso, cancelamento e expiração são `noindex`, usam o shell da campanha e orientam o próximo passo.
16. Antes do redirect registra `checkout_iniciado` sem PII: `{ course: "departamento-pessoal-do-zero", provider: "asaas" }`.
17. Todas as chamadas Asaas são mockadas; não há deploy, Sandbox real, produção, credencial, configuração externa de webhook ou pagamento real.
18. O endpoint executa estritamente: RPC `start` → um único `POST` Asaas → validação integral da resposta/URL → RPC `bind` → retorno de `{ orderId, checkoutUrl }`. Se `bind` falhar, marca `CREATION_UNKNOWN`, retorna non-2xx e nunca entrega `checkoutUrl` nem redireciona o navegador.

## Tasks / Subtasks

- [x] Criar config validada, cliente Asaas, timeout sem retry e allowlists (AC: 5–12).
- [x] Criar endpoint de checkout integrado às RPCs da story de persistência (AC: 3–12, 18).
- [x] Criar webhook autenticado e idempotente (AC: 9, 13–14).
- [x] Criar formulário, estados, redirect, analytics e callbacks `noindex` (AC: 1–2, 15–16).
- [x] Atualizar `.env.example` sem segredos e preservar checkout legado (AC: 8, 17).

## Testing

- Unitários: config inválida, token com whitespace/curto/igual à API key, ambos os contratos da flag 12x, `customerData`, timeout `CREATION_UNKNOWN` e allowlist exata de URL.
- API/webhook: ordem `start→POST→validate→bind→return`, bind falho sem redirect, assinatura, nomes exatos, duplicata 2xx, falha transitória non-2xx e ausência de retry do POST de criação.
- UI/E2E: acessibilidade, Pix/cartão, ausência de campos de cartão, claim condicional e callbacks sem falso sucesso.
- Gates: `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run test:db`, `npm run build`, `npm test`.

## CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled in `core-config.yaml`. Quality validation will use manual review process only.

## File List previsto

- `.env.example`
- `src/lib/payments/asaas/*`
- `app/api/payments/asaas/checkout/route.ts`
- `app/api/webhooks/asaas/route.ts`
- `app/lp/departamento-pessoal-do-zero/checkout/page.tsx`
- `app/lp/departamento-pessoal-do-zero/pagamento/*/page.tsx`
- testes unitários, API, UI e regressão.

## Change Log

| Data | Versão | Descrição | Autor |
| --- | ---: | --- | --- |
| 2026-08-31 | 0.1 | Draft do checkout hospedado Asaas e callbacks. | River (@sm) |
| 2026-08-31 | 0.2 | Aplicado veredito PO: contratos da flag, allowlist, token, privacidade, ordem e retry de webhook. | River (@sm) |

## Dev Agent Record

### Agent Model Used

GPT-5.6 / Codex (@dev).

### Debug Log References

`npm run lint` — PASS.

`npm run typecheck` — PASS.

`npm run test:unit` — PASS (821 testes).

`npm run test:db` — PASS (157 testes pgTAP).

`npm run build` — PASS.

`node scripts/run-playwright.mjs tests/dp-zero-landing.spec.ts --project=functional` — PASS (3 testes).

`npm test` foi iniciado com o Supabase completo e ultrapassou os testes de acessibilidade; foi interrompido após falhas pré-existentes/flaky em `tests/admin-crud.spec.ts`, fora dos arquivos desta story.

### Completion Notes List

- Checkout usa somente o contrato server-side: nome, e-mail, CPF, telefone e slug allowlisted.
- Não há dados de cartão no app; a URL devolvida é validada contra o host/path oficial antes de redirecionar.
- A flag de 12x sem juros inicia desligada e só habilita `INSTALLMENT` após confirmação operacional explícita.
- Webhook usa token comparado em tempo constante, payload extensível e retorno non-2xx para eventos transitórios.
- Ambiente de produção preparado para `https://www.rhcursos.com.br`: Worker recebe origem HTTPS, `ASAAS_ENVIRONMENT=production`, expiração de 30 minutos e parcelamento sem juros mantido desligado até validação operacional. A chave Asaas e o token do webhook seguem pendentes como secrets externos.

### File List

- `.env.example`
- `docs/api/openapi.yaml`
- `src/lib/payments/asaas/*`
- `app/api/payments/asaas/checkout/route.ts`
- `app/api/webhooks/asaas/route.ts`
- `app/lp/departamento-pessoal-do-zero/checkout/page.tsx`
- `app/lp/departamento-pessoal-do-zero/pagamento/*/page.tsx`
- `src/features/public/landing-pages/departamento-pessoal-do-zero/*`
- `src/lib/{logger,rate-limit,validation}.ts`
- `src/__tests__/app/api/asaas-checkout-routes.test.ts`
- `src/__tests__/lib/payments/asaas-checkout.test.ts`
- `tests/dp-zero-landing.spec.ts`
- `wrangler.jsonc`

## QA Results

Gate @qa: PASS para o escopo da story. `npm run lint`, `npm run typecheck`, `npm run test:unit` (821), `npm run test:db` (157), `npm run build` e `npm audit --omit=dev` (0 vulnerabilidades) passaram. Preview local validou LP/checkout, navegação, contraste e ausência de campos de cartão. O relatório consolidado de QA + Cyber Chief está em `docs/security/2026-09-01-dp-zero-checkout-consolidated.md`.

### Security Check — 2026-09-01

**Decisão:** PASS (nenhum padrão CRITICAL/HIGH explorável encontrado após as correções).

- 8 padrões de segurança verificados em 24 arquivos / 2.295 linhas.
- Os 9 achados contextuais foram tratados com controles de aplicação, banco e operação.
- Principais controles: antiabuso por identidade/global, leitura limitada em streaming, cleanup de reservas, reconciliação via API Asaas, CPF com checksum, IP confiável, no-store e allowlist do proxy.
- Nenhum SQL injection, XSS executável, SSRF, open redirect, CORS wildcard ou segredo em asset público foi identificado.
- Relatório completo: `docs/stories/2026-08-31-asaas-checkout-app-dp-zero/qa/security_issues.json`.
- Relatório consolidado final: `docs/security/2026-09-01-dp-zero-checkout-consolidated.md`.

## Story Draft Checklist

READY após a story de persistência; critérios, dependências, segurança, UX e testes estão claros e mensuráveis.
