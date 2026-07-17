# Story REC-107: Endurecer endpoints públicos (inscrição)

## Status

Done

## Executor Assignment

executor: "@dev"
quality_gate: "@qa"
quality_gate_tools:
- teste `pgTAP` novo confirmando que `service_role` mantém `execute` sobre `registrar_inscricao_publica` (pré-condição de `adminClient()`) e que `anon`/`authenticated` continuam sem `execute` (REC-101 preservada)
- teste de aplicação (Vitest, mockado) cobrindo body limit, separação de cliente (leitura pública vs. RPC privilegiada), status server-side pós-RPC e mapeamento de erro de duplicidade sob concorrência
- reexecução completa de `npm run test:db`, `npm run lint`, `npm run typecheck`, `npx vitest run`

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 2 — Integridade do caminho público (última story da onda)
- **Prioridade:** P0 / SEV-0
- **Estimativa:** M
- **Requisitos:** FR-02, NFR-04 (fail-closed)
- **Gate relacionado:** fecha G2 (lead/pré-inscrição) para o vetor de inscrição pública

## Story

**As a** responsável por integridade e disponibilidade segura da RH Cursos,
**I want** que o endpoint público de inscrição (`supabase/functions/enrollments/index.ts` e `app/api/enrollments/route.ts`) volte a funcionar de forma endurecida — schema estrito, limite de corpo, idempotência real sob concorrência, rate limit baseado em proxy confiável e status server-side —,
**so that** a inscrição pública seja restaurada sem reabrir o vetor original de REC-101 (chamada direta via PostgREST) nem sacrificar nenhuma das proteções construídas por REC-102, REC-104, REC-105 e REC-106.

## Contexto e valor

REC-101 revogou `execute` da RPC `registrar_inscricao_publica` para `anon`/`authenticated` como contenção de SEV-0 (FND-02). Desde então, REC-104 (cliente público `anon` dedicado), REC-105 (reserva de vaga atômica) e REC-106 (proteção de PII de aluno existente) corrigiram a lógica interna da função e a leitura pública do catálogo — mas nenhuma story anterior restaurou a permissão de chamar a RPC. Investigação desta story confirmou que, até este ponto, `supabase/functions/enrollments/index.ts` chamava a RPC via `anonClient()` (mesma role revogada por REC-101) — ou seja, **o endpoint estava funcionalmente quebrado**: qualquer chamada real falhava com erro de permissão (`42501`) antes mesmo de chegar à lógica de negócio já corrigida por REC-105/REC-106.

### Decisão de abordagem: `adminClient()`, não `grant execute` a `anon`

Duas opções foram avaliadas:

- **Opção A — restaurar `grant execute` a `anon`/`authenticated`:** reabriria a RPC como endpoint chamável diretamente via PostgREST, reintroduzindo parcialmente o vetor original de REC-101 (embora REC-105/REC-106 já tenham corrigido a lógica interna). Validação de origem, rate limit por proxy confiável, limite de corpo e checagem de lockdown (REC-003) do endpoint controlado deixariam de ser a única porta de entrada.
- **Opção B — trocar o cliente do endpoint para `adminClient()` (service-role, server-only):** é exatamente o padrão que REC-102 já aplicou ao mesmo dilema estrutural para `leads/index.ts` ("endpoint controlado com RPC/insert direto revogado do público"). O endpoint continua sendo o único caminho de escrita; a RPC permanece inacessível a qualquer chamador externo via PostgREST.

Esta story escolhe a **Opção B**, por consistência direta com a decisão já tomada e validada (gate PASS 96/100) por REC-102 para o mesmo tipo de dilema, e porque é estritamente mais conservadora sem custo funcional: nenhuma validação, rate limit ou verificação de origem já implementada no endpoint é enfraquecida, e o vetor de chamada direta via PostgREST permanece fechado.

**Achado que simplifica a implementação:** `service_role` já detém `grant execute on all functions in schema public to service_role` desde `20260604164120_content_access_alignment.sql` — um grant amplo que a `revoke` de REC-101 (escopado a `anon`/`authenticated`/`public`) nunca atingiu. Ou seja, **nenhuma migration nova de grant é necessária** para restaurar o acesso via `adminClient()`; a troca de cliente já é suficiente. Isso foi confirmado por `has_function_privilege('service_role', ...)` retornando `true` mesmo antes desta story (travado agora pelo teste `pgTAP` novo desta story) — decidir por uma migration nesse caso seria invenção desnecessária (Artigo IV).

### Separação de privilégio dentro do endpoint (least privilege)

Nem toda a lógica do endpoint precisa do cliente privilegiado. As duas leituras de `turma` (turma direta + turmas alternativas do curso, usadas por `resolveEnrollmentClassIdOrThrow`) consultam dados já publicamente legíveis via RLS/grants de REC-103/REC-104 — não precisam de `service_role`. Por isso, esta story usa `adminClient()` **apenas** na chamada `.rpc("registrar_inscricao_publica", ...)`, mantendo as leituras de `turma` em `anonClient()` (Edge Function) / `createSupabasePublicServerClient()` (rota Next.js). Isso reduz a superfície de código que roda com privilégio elevado ao mínimo estritamente necessário — mesma motivação de least privilege que orientou REC-104.

A rota Next.js (`app/api/enrollments/route.ts`) tinha uma inconsistência adicional descoberta durante a investigação: já usava `createSupabaseServerClient()` (service role, preferencial quando `SUPABASE_SERVICE_ROLE_KEY` está configurada) para **tudo**, incluindo as leituras de `turma` — o que funcionava para a RPC (por isso a rota Next.js, ao contrário da Edge Function, não estava tecnicamente quebrada por REC-101), mas ia contra a separação de responsabilidade que REC-104 estabeleceu explicitamente no comentário de `createSupabaseServerClient()` ("exclusivo de caminhos administrativos"). Esta story corrige essa inconsistência, trocando as leituras de `turma` da rota Next.js para `createSupabasePublicServerClient()`, alinhando as duas implementações (Edge Function e rota Next.js) ao mesmo padrão.

## Escopo

### Incluído

- Restaurar o acesso funcional ao endpoint de inscrição via `adminClient()` (Edge Function) / `createSupabaseServerClient()` (rota Next.js), usado exclusivamente na chamada da RPC — sem migration de grant nova (já coberta pelo grant amplo de `service_role` existente).
- Alinhar `app/api/enrollments/route.ts` para usar o cliente público (`createSupabasePublicServerClient()`) nas leituras de `turma`, consistente com REC-104 e com a Edge Function.
- Body limit: rejeitar (HTTP 413) corpos de requisição acima de 8 KiB antes de qualquer `JSON.parse`, validando o tamanho real do texto lido (não apenas o header `Content-Length`, que pode estar ausente/incorreto em requisições chunked) — em ambos os pontos de entrada.
- Confirmar/reforçar idempotência: análise documentada de que o índice único parcial `inscricao_aluno_turma_active_idx` (`on public.inscricao (aluno_id, turma_id) where status_inscricao not in ('Cancelada')`) é a barreira real de idempotência a nível de banco, inclusive sob concorrência real (não apenas a checagem `if exists` em `P0004`, que tem uma janela de corrida teórica sob duas chamadas verdadeiramente simultâneas). Como hardening direto dessa análise, `enrollment-errors.ts` passa a mapear a violação bruta desse índice (`23505`) para a mesma mensagem amigável de `P0004`, para que o "perdedor" de uma corrida real não receba um erro genérico sem contexto.
- Confirmar que `checkRateLimit`/`rateLimitConfigs.enrollment`/`clientIp` (proxy confiável) já estão aplicados em ambos os pontos de entrada — nenhuma alteração necessária, apenas verificação documentada.
- Confirmar que o status reportado ao cliente só é `201`/sucesso após a RPC confirmar persistência (nenhuma regressão de REC-302) — verificação documentada e coberta por teste novo.
- Documentar honestamente o gap de CAPTCHA: nenhuma infraestrutura (chave de site, biblioteca, variável de ambiente) existe no projeto para nenhum provedor (hCaptcha/reCAPTCHA/Turnstile). Implementar uma integração completa nesta story seria uma dependência externa nova não autorizada (Artigo IV). O gap fica registrado como pendência conhecida, mitigada parcialmente por rate limit + validação de origem + body limit + idempotência nesta rodada.
- Testes novos: `pgTAP` (`rec-107-enrollment-endpoint-hardening.test.sql`) e Vitest (`enrollments-route.test.ts`, mais uma asserção em `enrollment-errors.test.ts`).
- Produzir evidência sanitizada para `@qa`.

### Fora do escopo

- Qualquer integração real de CAPTCHA (hCaptcha/reCAPTCHA/Turnstile) — gap documentado, não implementado; candidato a story própria (REC-107b) se o produto decidir priorizar.
- Qualquer alteração em `supabase/functions/leads/index.ts` ou em qualquer outro endpoint além de `enrollments`.
- Qualquer alteração na lógica interna de `registrar_inscricao_publica` (reserva de vaga de REC-105, proteção de PII de REC-106, códigos de erro P0001-P0004) — função consumida como está.
- Qualquer alteração em `supabase/functions/_shared/rate-limit.ts` ou `src/lib/rate-limit.ts` — já corretos e reutilizados sem mudança.
- Restaurar `grant execute` a `anon`/`authenticated` — decisão explícita desta story de não fazer isso (ver "Decisão de abordagem").
- Qualquer story já `Done` (REC-101 a REC-106) ou seus arquivos de migration/teste/relatório.

## Acceptance Criteria

1. **Endpoint funcional novamente**
   **Given** REC-101 revogou `execute` de `anon`/`authenticated` sobre `registrar_inscricao_publica`,
   **when** uma submissão válida chega a `supabase/functions/enrollments/index.ts` ou `app/api/enrollments/route.ts`,
   **then** a RPC é chamada com sucesso via `adminClient()`/`createSupabaseServerClient()` (service-role, server-only) e a inscrição é persistida — sem nenhum `grant execute` restaurado para `anon`/`authenticated`.

2. **Least privilege preservado nas leituras**
   As leituras de `turma` (resolução de turma disponível) continuam usando o cliente público (`anonClient()`/`createSupabasePublicServerClient()`), não o cliente privilegiado — o privilégio elevado fica restrito à chamada da RPC.

3. **Body limit**
   **Given** um corpo de requisição acima de 8 KiB,
   **when** ele chega a qualquer um dos dois pontos de entrada,
   **then** a requisição é rejeitada com HTTP 413 antes de qualquer `JSON.parse`, mesmo que o header `Content-Length` esteja ausente ou incorreto.

4. **Schema estrito preservado**
   `enrollmentSchema` (`.strict()`, tipos e tamanhos máximos em todos os campos, regex em CPF/telefone/IDs) continua rejeitando payloads com campos desconhecidos, tipos incorretos ou valores fora dos limites — sem regressão.

5. **Idempotência sob concorrência real**
   **Given** duas chamadas concorrentes para o mesmo aluno/turma (mesmo e-mail, mesma turma),
   **when** ambas competem pela mesma reserva de inscrição,
   **then** o índice único parcial `inscricao_aluno_turma_active_idx` garante que no máximo uma inscrição ativa é persistida — a chamada perdedora recebe uma mensagem de erro coerente (`P0004` ou o mapeamento novo de `23505` desta story), nunca uma segunda inscrição.

6. **Rate limit confirmado**
   `checkRateLimit` com `rateLimitConfigs.enrollment` e `clientIp()` (proxy confiável: `x-forwarded-for`/`cf-connecting-ip`/`x-real-ip`) continuam aplicados antes de qualquer processamento de payload em ambos os pontos de entrada.

7. **Status server-side sem regressão**
   O endpoint só reporta sucesso (`201`, `ok: true`) depois que a RPC confirma persistência (retorno sem erro e recibo válido); qualquer falha da RPC resulta em resposta de erro real, nunca um sucesso otimista.

8. **CAPTCHA — gap documentado, não implementado**
   Nenhuma infraestrutura de CAPTCHA existe no código ou em variável de ambiente documentada; esta story não introduz nenhuma. O gap é registrado explicitamente nesta story e no relatório de evidência.

9. **Nenhuma regressão na suíte completa**
   `npm run test:db`, `npm run lint`, `npm run typecheck` e `npx vitest run` permanecem 100% verdes.

10. **Gate independente**
    `@qa` revisa a evidência, executa os testes e emite PASS/CONCERNS/FAIL para REC-107.

## Tasks / Subtasks

- [x] **Task 1 — Investigar o estado real dos dois pontos de entrada** (AC: 1, 2)
  - [x] Confirmado que `supabase/functions/enrollments/index.ts` chamava a RPC via `anonClient()` (quebrado desde REC-101).
  - [x] Confirmado que `app/api/enrollments/route.ts` já usava `createSupabaseServerClient()` (service-role) para tudo, incluindo leituras de `turma` — funcionalmente não quebrado, mas inconsistente com o padrão de least privilege de REC-104.
  - [x] Confirmado, via `grant execute on all functions in schema public to service_role` (`20260604164120_content_access_alignment.sql`), que `service_role` já tinha `execute` sobre a RPC — nenhuma migration de grant nova é necessária.

- [x] **Task 2 — Restaurar o acesso via `adminClient()`/`createSupabaseServerClient()`, preservando least privilege** (AC: 1, 2)
  - [x] `supabase/functions/enrollments/index.ts`: import de `adminClient`; RPC chamada via `adminClient().rpc(...)`; leituras de `turma` mantidas em `anonClient()`.
  - [x] `app/api/enrollments/route.ts`: leituras de `turma` migradas para `createSupabasePublicServerClient()`; RPC chamada via `createSupabaseServerClient()` (renomeado localmente para `adminSupabase` para clareza).
  - [x] Nenhuma migration de grant criada (achado da Task 1 confirmado por teste `pgTAP` novo).

- [x] **Task 3 — Body limit** (AC: 3)
  - [x] Constante `MAX_BODY_BYTES = 8 * 1024` adicionada em ambos os arquivos.
  - [x] Checagem dupla: `Content-Length` (rejeição rápida quando presente) + tamanho real do texto lido via `request.text()` (`TextEncoder().encode(...).length`), cobrindo o caso de header ausente/incorreto.
  - [x] HTTP 413 em ambos os casos, antes de qualquer `JSON.parse`.

- [x] **Task 4 — Idempotência: análise e hardening do mapeamento de erro** (AC: 5)
  - [x] Confirmado que `inscricao_aluno_turma_active_idx` (índice único parcial, `20260512193000_initial_rh_cursos_schema.sql`) é a barreira real de idempotência a nível de banco — a checagem `if exists`/`P0004` dentro da RPC tem uma janela teórica de corrida (duas transações concorrentes podem passar da checagem antes de qualquer uma commitar), mas o índice único garante que apenas um `insert` final é aceito; o outro recebe violação `23505`.
  - [x] `enrollment-errors.ts` atualizado para mapear `23505` com a constraint `inscricao_aluno_turma_active_idx` na mensagem para a mesma mensagem amigável de `P0004` — a chamada perdedora de uma corrida real não recebe mais um erro genérico "Erro ao registrar inscrição." sem contexto.
  - [x] Conclusão documentada: nenhum mecanismo adicional de idempotência (ex.: chave de idempotência gerada pelo cliente) é necessário além do que o índice único já garante — inventar um novo mecanismo aqui seria escopo não solicitado sem lacuna real a fechar.

- [x] **Task 5 — Confirmar rate limit e status server-side** (AC: 6, 7)
  - [x] Confirmado, por leitura de código, que `checkRateLimit`/`rateLimitConfigs.enrollment`/`clientIp()` já executam antes de qualquer parse de payload em ambos os arquivos — nenhuma alteração necessária.
  - [x] Confirmado que o `201`/`ok:true` só é retornado após `error` da RPC ser `null` e o recibo (`enrollmentReceiptSchema`) validar — nenhuma regressão de REC-302; coberto por teste novo (`enrollments-route.test.ts`).

- [x] **Task 6 — Documentar o gap de CAPTCHA** (AC: 8)
  - [x] Busca confirmada (`grep -ril "captcha|hcaptcha|recaptcha|turnstile"`) sem nenhuma ocorrência em código-fonte ou `.env*` — apenas menções em stories anteriores discutindo o mesmo gap. Nenhuma infraestrutura existe.
  - [x] Gap registrado nesta story (Escopo/AC8) e no relatório de evidência, sem invenção de integração externa.

- [x] **Task 7 — Testes novos** (AC: 3, 5, 6, 7, 9)
  - [x] `supabase/tests/database/rec-107-enrollment-endpoint-hardening.test.sql` (4 asserções pgTAP): `service_role` mantém `execute`; `anon`/`authenticated` continuam sem `execute` (REC-101 preservada); `anon` mantém `select` nas colunas de `turma` usadas pelo endpoint.
  - [x] `src/__tests__/app/api/enrollments-route.test.ts` (6 testes Vitest, mockado): body limit (413), separação de cliente (leitura pública vs. RPC privilegiada), status server-side só após confirmação real, mapeamento de `23505` para mensagem amigável, rate limit bloqueando antes de tocar Supabase, schema estrito rejeitando campo desconhecido.
  - [x] `src/__tests__/lib/enrollment-errors.test.ts`: nova asserção para o mapeamento de `23505`.

- [x] **Task 8 — Validar suíte completa** (AC: 9)
  - [x] `npm run test:db`: `Files=11, Tests=113, Result: PASS` (10 arquivos pré-existentes + `rec-107-enrollment-endpoint-hardening.test.sql`), ambos os scripts de concorrência real (EP12, REC-105) PASS.
  - [x] `npm run lint`: limpo.
  - [x] `npm run typecheck`: limpo.
  - [x] `npx vitest run`: `601 passed (601)`.

- [x] **Task 9 — Consolidar evidência**
  - [x] Relatório sanitizado em `docs/history/reports/rec-107-endurecer-endpoints-2026-07-16.md`.
  - [ ] Gate QA fica para criação por `@qa` na revisão independente (não criado pelo executor, para preservar AC10).

## Dev Notes

### Fontes verificadas

- A Épica 17 define REC-107 na Onda 2, dependente de REC-102 e REC-105 (`Done`), com entrega "Schema estrito, body limit, idempotência, CAPTCHA, rate limit público baseado no proxy confiável e status server-side". [Fonte: `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md`]
- `supabase/functions/enrollments/index.ts` chamava a RPC via `anonClient()` antes desta story — quebrado desde `20260715100000_revoke_public_enrollment_rpc.sql` (REC-101).
- `app/api/enrollments/route.ts` usava `createSupabaseServerClient()` (service-role) para tudo antes desta story — funcionalmente intacto para a RPC, mas inconsistente com o padrão de least privilege que `src/lib/supabase/server.ts` documenta explicitamente desde REC-104 ("`createSupabaseServerClient()`... exclusivo de caminhos administrativos").
- `grant execute on all functions in schema public to service_role;` (`supabase/migrations/20260604164120_content_access_alignment.sql`, linha 245) — grant amplo pré-existente que torna `adminClient()`/`createSupabaseServerClient()` funcionais sobre `registrar_inscricao_publica` sem nenhuma migration nova.
- `revoke execute on function public.registrar_inscricao_publica(...) from anon, authenticated;` / `... from public;` (`supabase/migrations/20260715100000_revoke_public_enrollment_rpc.sql`, REC-101) — escopo do revoke não atinge `service_role`; preservado sem alteração por esta story.
- `create unique index if not exists inscricao_aluno_turma_active_idx on public.inscricao (aluno_id, turma_id) where status_inscricao not in ('Cancelada');` (`supabase/migrations/20260512193000_initial_rh_cursos_schema.sql`, linha 207) — barreira real de idempotência a nível de banco, existente desde o schema inicial, não criada por esta story.
- `supabase/functions/leads/index.ts` (REC-102, `Done`): padrão de referência para a decisão desta story — `adminClient()` usado exclusivamente na persistência controlada, validação/rate limit/origem preservados sem alteração.
- `supabase/functions/_shared/rate-limit.ts`: `rateLimitConfigs.enrollment = { windowMs: 60_000, maxRequests: 20 }`, `clientIp()` já prioriza `x-forwarded-for`/`cf-connecting-ip`/`x-real-ip` (proxy confiável) — reutilizado sem alteração.
- Busca por CAPTCHA/hCaptcha/reCAPTCHA/Turnstile no código e em `.env*` não retornou nenhuma ocorrência de infraestrutura real, apenas menções em stories anteriores discutindo o mesmo gap.

### Project Structure Notes

- Nenhuma migration nova criada por esta story (achado da Task 1: grant já existente para `service_role`).
- Alteração restrita a `supabase/functions/enrollments/index.ts`, `app/api/enrollments/route.ts`, `supabase/functions/_shared/enrollment-errors.ts` e testes novos/atualizados.
- Teste `pgTAP` segue `supabase/tests/database/`, mesmo padrão de `rec-101-revoke-public-enrollment-rpc.test.sql` (uso de `has_function_privilege`/`has_column_privilege`, `begin...rollback`).
- Teste Vitest segue o padrão de `src/__tests__/app/api/auth-session-route.test.ts` (`vi.hoisted`, `vi.mock` de módulos, import dinâmico da rota).

### Ferramentas e execução segura

- `npm run test:db` contra o banco de teste local (Docker), nunca produção.
- `npx vitest run` mockado, sem depender de Docker.
- Nenhum dado real de aluno em qualquer teste; e-mails sintéticos onde aplicável.

## Testing e evidências

- `pgTAP`: `supabase/tests/database/rec-107-enrollment-endpoint-hardening.test.sql` (4 asserções).
- Vitest: `src/__tests__/app/api/enrollments-route.test.ts` (6 testes) + 1 asserção nova em `src/__tests__/lib/enrollment-errors.test.ts`.
- Suíte completa: `npm run test:db` (`Files=11, Tests=113, PASS`), `npm run lint` (limpo), `npm run typecheck` (limpo), `npx vitest run` (`601 passed`).

## Observabilidade

- Nenhum log novo introduzido além do já existente (`console.error`/`logger.error` em caso de exceção).
- Nenhum dado de PII em log, teste ou relatório desta story.

## Security Notes

- Nenhum `grant execute` restaurado para `anon`/`authenticated` — REC-101 permanece integralmente em vigor.
- `adminClient()`/`createSupabaseServerClient()` (service-role) usados exclusivamente na chamada da RPC, nunca exposto ao browser (código server-only, mesmo padrão de REC-102).
- Leituras de `turma` permanecem no cliente público (least privilege), reduzindo a superfície de código com privilégio elevado.
- Body limit e mapeamento de erro de duplicidade sob concorrência (`23505`) fecham lacunas reais de robustez sem introduzir nenhuma dependência externa nova.
- Gap de CAPTCHA documentado com transparência, sem invenção de integração (Artigo IV).

## Dependências

- **Entrada:** REC-102 (`Done`, padrão de `adminClient()` para endpoint controlado), REC-104 (`Done`, cliente público dedicado e padrão de least privilege), REC-105 (`Done`, reserva atômica de vaga), REC-106 (`Done`, proteção de PII de aluno existente).
- **Fecha:** última story pendente da Onda 2 da Épica 17 antes de G2 (lead/pré-inscrição) ser considerado fechado para o vetor de inscrição.
- **Não depende de:** REC-201/REC-202 (sessão SSR/ADR-016) — trabalho de identidade administrativa, não tocado por esta story.

## Roll-forward / Rollback

- **Roll-forward obrigatório:** qualquer ajuste futuro de client/privilégio no endpoint é uma nova alteração explícita, documentada.
- **Rollback proibido:** reverter `adminClient()`/`createSupabaseServerClient()` para `anonClient()`/cliente público na chamada da RPC (reintroduziria a quebra funcional atual). Reverter body limit ou o mapeamento de erro de `23505` também é proibido — ambos fecham lacunas reais.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> A validação usa revisão manual do diff e dos testes por `@qa`.

### Story Type Analysis

- **Primary Type:** API / Security (endurecimento de endpoint público)
- **Secondary Type:** Reliability (idempotência sob concorrência)
- **Complexity:** Média — decisão de arquitetura (adminClient vs. grant) com precedente direto (REC-102), mais múltiplos itens de endurecimento pontuais, sem nenhuma migration nova.
- **Agentes:** executor `@dev`; quality gate independente `@qa`.

### Manual review focus

- Confirmar que nenhum `grant execute` foi restaurado para `anon`/`authenticated` (REC-101 intacta).
- Confirmar que o privilégio elevado (`adminClient()`/service-role) fica restrito à chamada da RPC, não às leituras de `turma`.
- Confirmar que o body limit rejeita corretamente tanto por `Content-Length` quanto por tamanho real do corpo.
- Avaliar se o gap de CAPTCHA documentado é aceitável para esta rodada ou se justifica story de follow-up imediata.
- Confirmar que o mapeamento de `23505` não enfraquece nenhuma mensagem de erro existente nem esconde uma falha real.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-16 | 0.1 | Draft criado a partir da Épica 17 (Onda 2, última story, dependente de REC-102/REC-105 `Done`), com investigação do estado real quebrado do endpoint (REC-101 revogou execute da RPC sem nenhuma story anterior restaurar o acesso) e decisão de abordagem (adminClient(), mesmo padrão de REC-102) documentada com justificativa técnica. | @sm (River) via executor único desta sessão |
| 2026-07-16 | 1.0 | **Draft → Ready.** Checklist de 10 pontos sem lacunas: título claro, contexto/valor completo (achado real de endpoint quebrado, decisão adminClient vs. grant justificada por precedente direto de REC-102), ACs em Given/When/Then cobrindo função, least privilege, body limit, idempotência, rate limit, status server-side e gap de CAPTCHA, escopo incluído/excluído explícito, dependências mapeadas, estimativa (M), riscos e roll-forward/rollback documentados, gate independente do @qa, alinhamento com Épica 17/Onda 2 confirmado. | @po (Pax) via executor único desta sessão |
| 2026-07-16 | 1.2 | **InReview → Done.** Gate PASS (96/100) emitido por `@qa` após reexecução independente: `npm run test:db` → `Files=11, Tests=113, PASS` (incluindo scripts de concorrência); `npm run lint`/`npm run typecheck` limpos; `npx vitest run` → `601 passed`. Onda 2 da Épica 17 completa. | @qa (Quinn) |
| 2026-07-16 | 1.1 | **Ready → InProgress → InReview.** Implementado: RPC restaurada via `adminClient()`/`createSupabaseServerClient()` exclusivamente (nenhuma migration de grant nova — achado de que `service_role` já detinha `execute`); leituras de `turma` mantidas/migradas para cliente público em ambos os pontos de entrada (least privilege); body limit de 8 KiB (Content-Length + tamanho real) em ambos; análise de idempotência documentada (índice único parcial `inscricao_aluno_turma_active_idx` é a barreira real) com hardening do mapeamento de erro `23505`→P0004; rate limit e status server-side confirmados sem regressão; gap de CAPTCHA documentado honestamente, sem invenção de integração. Testes novos: `rec-107-enrollment-endpoint-hardening.test.sql` (4 asserções pgTAP) e `enrollments-route.test.ts` (6 testes Vitest) + 1 asserção nova em `enrollment-errors.test.ts`. `npm run test:db` → `Files=11, Tests=113, PASS` (ambos os scripts de concorrência PASS); `npm run lint`/`npm run typecheck` limpos; `npx vitest run` → `601 passed`. Gate QA não criado pelo executor (preserva AC10). | @dev (executor único desta sessão) |

## File List

### Criado nesta preparação

- `docs/stories/2026-07-16-rec-107-endurecer-endpoints-publicos.md`

### Criado nesta execução

- `supabase/tests/database/rec-107-enrollment-endpoint-hardening.test.sql`
- `src/__tests__/app/api/enrollments-route.test.ts`
- `docs/history/reports/rec-107-endurecer-endpoints-2026-07-16.md`

### Modificado nesta execução

- `supabase/functions/enrollments/index.ts` (import de `adminClient`; body limit; RPC via `adminClient()`; leituras de `turma` mantidas em `anonClient()`)
- `app/api/enrollments/route.ts` (import de `createSupabasePublicServerClient`/`isSupabasePublicServerConfigured`; body limit; leituras de `turma` via cliente público; RPC via `createSupabaseServerClient()`)
- `supabase/functions/_shared/enrollment-errors.ts` (novo matcher: `23505`/`inscricao_aluno_turma_active_idx` → mensagem de P0004)
- `src/__tests__/lib/enrollment-errors.test.ts` (nova asserção para o matcher de `23505`)

### Nenhuma migration criada

- Achado documentado: `service_role` já detinha `execute` sobre `registrar_inscricao_publica` desde `20260604164120_content_access_alignment.sql` (grant amplo não atingido pelo `revoke` escopado de REC-101). Nenhuma migration nova de grant foi necessária.

### Pendente (criação por `@qa`)

- `docs/qa/gates/rec-107-endurecer-endpoints-publicos.yml`

### Referências somente leitura

- `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md`
- `docs/stories/2026-07-16-rec-106-proteger-pii-aluno-existente.md`
- `docs/stories/2026-07-16-rec-105-inscricao-atomica.md`
- `docs/stories/2026-07-16-rec-104-cliente-publico-anon.md`
- `docs/stories/2026-07-15-rec-102-revogar-insert-anonimo-leads.md`
- `supabase/migrations/20260512193000_initial_rh_cursos_schema.sql`
- `supabase/migrations/20260604164120_content_access_alignment.sql`
- `supabase/migrations/20260715100000_revoke_public_enrollment_rpc.sql`
- `supabase/functions/_shared/rate-limit.ts`
- `supabase/functions/_shared/supabase.ts`
- `supabase/functions/leads/index.ts`
- `src/lib/supabase/server.ts`
- `src/lib/rate-limit.ts`

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (executor único desta sessão, persona `@dev`).

### Debug Log References

- `npm run test:db` (banco Supabase local via Docker, comando único orquestrado: stop → start → reset → suíte pgTAP → scripts de concorrência): `Files=11, Tests=113, Result: PASS` (10 arquivos pré-existentes + `rec-107-enrollment-endpoint-hardening.test.sql`, 4 asserções novas). `node scripts/test-db-concurrency.mjs` (EP12) e `node scripts/test-db-rec105-concurrency.mjs` (REC-105) PASS, confirmando ausência de regressão.
- `npm run lint`: limpo, sem warnings novos.
- `npm run typecheck`: `next typegen && tsc --noEmit` limpo (correção de tipo necessária: o novo matcher de `enrollment-errors.ts` precisou de `code: undefined` explícito para satisfazer o tipo de união inferido do array `as const`).
- `npx vitest run`: `601 passed (601)`, incluindo os 6 testes novos de `enrollments-route.test.ts` e a asserção nova de `enrollment-errors.test.ts`.

### Completion Notes

Endpoint de inscrição pública restaurado funcionalmente sem reabrir o vetor de chamada direta via PostgREST fechado por REC-101: a decisão foi usar `adminClient()`/`createSupabaseServerClient()` (service-role) exclusivamente na chamada da RPC `registrar_inscricao_publica`, seguindo o mesmo padrão que REC-102 já validou (gate PASS 96/100) para o dilema estruturalmente idêntico de `leads/index.ts`. Achado que simplificou a implementação: `service_role` já detinha `execute` sobre a RPC desde `20260604164120_content_access_alignment.sql` (grant amplo, não escopado pelo `revoke` de REC-101), então nenhuma migration nova foi necessária — decidir por uma migration nesse caso teria sido invenção desnecessária. As leituras de `turma` (resolução de disponibilidade) permanecem no cliente público em ambos os pontos de entrada, por least privilege; a rota Next.js, que já usava o cliente privilegiado para tudo (inconsistência pré-existente com o padrão de REC-104), foi corrigida para separar os dois clientes também.

Do escopo de endurecimento pedido pela Épica 17: schema estrito já existia (`.strict()`, limites em todos os campos) e foi confirmado sem regressão; body limit (8 KiB, Content-Length + tamanho real) foi adicionado em ambos os pontos de entrada, ausente até esta story; idempotência foi analisada com honestidade — o índice único parcial `inscricao_aluno_turma_active_idx` já é a barreira real a nível de banco mesmo sob concorrência real (a checagem `if exists`/P0004 dentro da RPC tem uma janela teórica de corrida, mas o índice único garante que nenhuma segunda inscrição é persistida), então nenhum mecanismo novo de idempotência foi inventado — apenas um hardening pontual do mapeamento de erro para que a chamada perdedora de uma corrida real receba a mesma mensagem amigável de P0004 em vez de um erro genérico sem contexto; rate limit e status server-side foram confirmados sem alteração necessária (já corretos). CAPTCHA é o único item da lista da Épica 17 que **não** foi implementado nesta story — nenhuma infraestrutura existe no projeto para nenhum provedor, e implementar uma integração completa seria uma dependência externa nova não autorizada (Artigo IV); o gap está documentado explicitamente como pendência conhecida, mitigado parcialmente por rate limit + validação de origem + body limit + idempotência.

Suíte completa validada em execução única e limpa: `npm run test:db` (`Files=11, Tests=113, PASS`, ambos os scripts de concorrência PASS), `npm run lint`/`npm run typecheck` limpos, `npx vitest run` (`601 passed`). Gate QA não criado pelo executor (preserva AC10).

## QA Results

### Gate: PASS ✅ — @qa (Quinn), 2026-07-16

**Gate file:** [`docs/qa/gates/rec-107-endurecer-endpoints-publicos.yml`](../qa/gates/rec-107-endurecer-endpoints-publicos.yml) · **Quality score:** 96/100

Verificação independente: decisão de arquitetura (`adminClient()` vs. `grant`) revisada e confirmada consistente com o precedente de REC-102. `npm run test:db` → `Files=11, Tests=113, PASS`, incluindo ambos os scripts de concorrência real. `npm run lint`/`npm run typecheck` limpos. `npx vitest run` → `601 passed`.

Todos os ACs (1-9) PASS.

Residual `low`: SEC-109 (CAPTCHA não implementado por ausência de infraestrutura/decisão de produto — documentado com transparência, não bloqueante).

**Veredito:** PASS. Onda 2 da Épica 17 (Integridade do caminho público) está completa. Nenhuma ação bloqueante.

— Quinn, guardião da qualidade 🛡️
