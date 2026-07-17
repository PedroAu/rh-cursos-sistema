-- REC-101: revogar execução pública/anônima da RPC de inscrição.
--
-- `public.registrar_inscricao_publica` faz upsert de `public.aluno` por
-- e-mail (case-insensitive) e, para cadastro existente, atualiza
-- nome_completo, cpf, telefone, cargo, orgao e tipo_aluno apenas por posse
-- do e-mail informado. Chamada diretamente via PostgREST com a chave `anon`
-- ou `authenticated`, sem passar pela validação/rate limit/idempotência do
-- endpoint controlado, permite alteração de PII de aluno existente por
-- qualquer chamador que conheça ou adivinhe um e-mail cadastrado (FND-02).
--
-- Esta migration fecha esse canal de execução não autorizada, revogando o
-- `grant execute` concedido originalmente em
-- 20260512193000_initial_rh_cursos_schema.sql e reafirmado em
-- 20260604164120_content_access_alignment.sql. A assinatura de parâmetros é
-- idêntica à usada nesses `grant`s (confirmada também pelo `comment on
-- function` em 20260513200000_sprint2_integrity.sql e
-- 20260714231000_public_pre_enrollment_pending.sql, que apenas substituem o
-- corpo da função via `create or replace function`, sem alterar a
-- assinatura).
--
-- Consequência aceita: o endpoint controlado
-- `supabase/functions/enrollments/index.ts` chama esta mesma RPC via
-- `anonClient()` (mesma role revogada) e, portanto, fica temporariamente
-- indisponível para inscrever alunos após esta migration. Essa
-- indisponibilidade é intencional e é restaurada por REC-104 (cliente
-- público anon dedicado), REC-105 (atomicidade) e REC-107 (endurecimento do
-- endpoint) — nenhuma alteração de código de aplicação é feita nesta story.
--
-- `revoke` é idempotente por natureza: reaplicar esta migration contra um
-- banco onde o grant já foi revogado não produz erro nem depende de estado
-- de dados. Esta migration é forward-only: qualquer restauração futura do
-- grant público exige uma nova migration explícita; nunca um rollback desta.
revoke execute on function public.registrar_inscricao_publica(
  varchar,
  varchar,
  varchar,
  varchar,
  varchar,
  varchar,
  public.tipo_aluno,
  varchar,
  varchar,
  public.forma_pagamento,
  text
) from anon, authenticated;

-- Defesa em profundidade: garante que nenhum grant residual para o
-- pseudo-role PUBLIC (herdado por padrão por qualquer role, incluindo
-- `anon`/`authenticated`) permaneça ativo para esta função.
revoke execute on function public.registrar_inscricao_publica(
  varchar,
  varchar,
  varchar,
  varchar,
  varchar,
  varchar,
  public.tipo_aluno,
  varchar,
  varchar,
  public.forma_pagamento,
  text
) from public;
