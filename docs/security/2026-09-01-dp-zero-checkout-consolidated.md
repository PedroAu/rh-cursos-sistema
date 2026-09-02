# Relatório consolidado de segurança — DP do Zero

Data: 2026-09-01  |  Escopo: LP, checkout Asaas, webhook, Supabase e proxy de funções.

## Resultado

Nenhuma vulnerabilidade crítica ou alta explorável foi encontrada após a correção. Os achados médios/baixos dos relatórios Cyber Chief/QA foram tratados na branch `codex/recover-dp-zero-lp`:

| Achado | Tratamento |
|---|---|
| Abuso distribuído de reservas | Limites por IP, e-mail e CPF (hash), limite global e cap transacional de reservas pendentes por turma; limpeza oportunista de expirados. |
| Corpo chunked sem limite | Leitura em streaming com teto de 4 KiB no checkout e 32 KiB no webhook. |
| Replay de identidade | Unicidade natural existente por aluno/turma, idempotência por UUID, rate limit por identidade e cap de reservas pendentes. |
| PII pré-pagamento | Reservas expiradas são canceladas e suas vagas liberadas automaticamente; rotina operacional disponível para limpeza. |
| Webhook sem reconciliação | `CHECKOUT_PAID` consulta `/v3/payments?checkoutSession=...`, confere referência, status pago, método e total de R$ 297 antes da RPC. |
| CPF sem dígitos verificadores | Validação Zod compartilhada rejeita sequências repetidas e dígitos inválidos. |
| IP falsificável | Em produção só `CF-Connecting-IP` é aceito; fallbacks ficam restritos ao desenvolvimento. |
| Cache de resposta sensível | Checkout, webhook e erros usam `Cache-Control: no-store` e headers anti-sniff/clickjacking. |
| Proxy de função amplo | Allowlist explícita: `admin-resources`, `enrollments` e `leads`, com limite de corpo e JSON obrigatório. |

## Evidências

- `npm run lint` — PASS
- `npm run typecheck` — PASS
- `npm run test:unit` — 821 testes PASS
- `npm run test:db` — 157 testes SQL/pgTAP PASS, incluindo concorrência da última vaga
- `npm audit --omit=dev` — 0 vulnerabilidades
- `npm run build` — PASS com variáveis de ambiente temporárias não persistidas
- Preview local: LP e checkout HTTP 200, formulário com 4 campos, Pix/cartão e imagem da campanha

## Limites operacionais

O domínio de produção deve aceitar tráfego somente pelo Cloudflare/WAF; o token Asaas deve permanecer em secret manager. A rotina de limpeza pode ser agendada diariamente para retenção LGPD de cadastros abandonados, sem armazenar dados de cartão.
