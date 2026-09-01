# Relatório consolidado de segurança — LP e checkout

Data: 2026-09-01
Escopo: landing page, Server Actions de inscrição/cobrança, integração Asaas,
status de pagamento, webhook e dependências de produção/build.

Este documento consolida os achados de `site-security-audit-2026-06-21.md` e
`security-hardening-implementation-plan-2026-06-21.md`, incluindo a verificação
do código atual e as correções aplicadas nesta revisão.

## Resultado

Os controles previstos nos dois relatórios foram implementados ou confirmados:

| Área | Controle | Situação |
| --- | --- | --- |
| Administração | Reautenticação e validação de papel antes de qualquer Server Action administrativa | Implementado |
| Checkout | Preço e curso sempre resolvidos no servidor; o valor enviado pelo navegador é ignorado | Implementado |
| Checkout | Validação de slug/UUID, referência, nome e CPF/CNPJ, com limites de tamanho | Implementado |
| Asaas | URL de API restrita às origens HTTPS oficiais, IDs de recursos validados e timeout de 15s | Implementado |
| Asaas | Respostas de cobrança, QR Code e boleto validadas antes de persistir/renderizar | Implementado |
| Status | Token HMAC com expiração, comparação em tempo constante e resposta `no-store` | Implementado |
| Webhook | Token em comparação constante, JSON obrigatório, limite de 64 KiB, payload/IDs validados e resposta `no-store` | Implementado |
| Webhook | Deduplicação e atualização atômica/monotônica via RPC | Implementado anteriormente e confirmado |
| Webhook | RPC `SECURITY DEFINER` não executável por `anon`/`authenticated`/`public` | Implementado nesta revisão |
| Cabeçalhos | CSP report-only, HSTS em produção, X-Frame-Options, nosniff, Referrer-Policy e Permissions-Policy | Implementado anteriormente e confirmado |
| Segredos | Verificação automatizada de artefatos e ausência de chaves no bundle | Implementado anteriormente e confirmado |
| Dependências | Next 16.3.4, PostCSS/Tailwind atualizados, Wrangler/OpenNext atualizados; `npm audit` sem vulnerabilidades | Implementado nesta revisão |

## Arquivos alterados nesta revisão

- `src/app/actions/payment.ts`
- `src/app/api/payments/status/[chargeId]/route.ts`
- `src/app/api/payments/webhook/route.ts`
- `src/lib/asaas/client.ts`
- `src/lib/asaas/env.ts`
- `src/lib/forms/schemas/enrollment.ts`
- `src/lib/forms/schemas/lead.ts`
- `src/lib/payments/status-token.ts`
- `supabase/migrations/20260901090000_payment_rpc_execute_hardening.sql`
- `package.json` e `package-lock.json`

## Validação executada

- `npm run lint` — aprovado.
- `npm run typecheck` — aprovado.
- `npm run security:secrets` — aprovado.
- `npm audit --audit-level=moderate` — 0 vulnerabilidades.
- Testes de checkout/Asaas/status/webhook — 30 testes aprovados.
- `npm test` — 166 testes aprovados; 1 teste pré-existente da página de curso falha porque a fixture usa uma turma em 12/07/2026, que já passou na data atual, fazendo a página exibir “sob consulta”. Não é falha de segurança nem foi alterado nesta revisão.

## Limites e operação segura

Não existe garantia técnica de “zero vulnerabilidades” em um sistema conectado a
serviços de terceiros. Antes de publicar, aplicar a migration no Supabase,
configurar os segredos apenas no ambiente de produção e manter uma rotina de
`npm audit`/atualizações. O checkout não recebe nem armazena dados de cartão;
cartão deve continuar sendo processado apenas pela página hospedada do Asaas.
