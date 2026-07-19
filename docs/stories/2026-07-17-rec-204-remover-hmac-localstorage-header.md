# Story REC-204: Cutover HMAC → Supabase SSR (rollout gradual com conta de teste) e remoção do legado

## Status

Done

## Executor Assignment

executor: "@dev" (Dex) — implementação do rollout em fases e do cutover final
quality_gate: "@qa" (Quinn) + "@architect" (Aria) — revisão independente do cutover (mudança de autoridade real de produção)
quality_gate_tools:
- verificação de que a Fase A (conta de teste) não altera comportamento de nenhum admin fora da allowlist
- verificação de que o gate humano da Fase B foi de fato confirmado e registrado no Change Log antes de qualquer código de Fase B ser mergeado
- verificação de que, após a Fase B, nenhum caminho produtivo aceita mais token HMAC próprio
- verificação de que `AUTH_SESSION_SECRET` deixou de ter função (D5/ADR-016) e nenhum segredo novo foi introduzido
- teste negativo: token HMAC legado apresentado após o cutover retorna 401, não é aceito silenciosamente

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 3 — Identidade e entrega segura
- **Prioridade:** P0 / SEV-0
- **Estimativa:** L (dividida internamente em Fase A / Gate humano / Fase B — ver Escopo)
- **ADR de origem:** [ADR-016](../architecture/adr-016-identidade-bff-rec201.md) — D1 (Supabase Auth autoridade única), D2 (cookies SSR, não `localStorage`), D4 (BFF: browser não chama mais Edge Functions administrativas cross-origin com `x-rh-session`), D5 (sequência: REC-204 é o passo 3, só ocorre depois de REC-202/REC-203 provarem a nova autoridade)
- **Findings/Requisitos:** FND-04 (HMAC sem revogação confiável), FR-07 (Supabase Auth autoridade única), NFR-04 (fail-closed), NFR-08 (roll-forward — rollback que restaure HMAC como autoridade é proibido)
- **Depende de:** REC-202 (sessão SSR, Done), REC-203 (mecanismo `requireServerRole`, Done — construído mas **não ativado** em nenhuma rota real)
- **Desbloqueia:** REC-206 (BFF canônico consome D4), REC-502 (encerramento — G4 exige REC-204), demais stories da Onda 4/5 que passam a poder assumir `requireServerRole` como autoridade

### Decisão humana registrada (CON-08)

Autorização explícita do proprietário da conta administrativa, coletada em 2026-07-17, para a estratégia de mitigação de risco "conta de teste, rollout reduzido e compatibilidade apenas de leitura por uma janela" (Épica 17 §11, risco "Migração de auth gerar lockout"):

- **Fase A aprovada para execução imediata:** migrar uma conta admin de teste para a autoridade SSR (`requireServerRole`), validar login/logout/rebaixamento nessa conta, manter o HMAC como autoridade de fallback (somente leitura) para todas as demais contas durante a janela.
- **Fase B (cutover total + remoção do HMAC) requer um segundo gate humano explícito**, coletado nesta mesma story antes de qualquer código de Fase B ser implementado — não basta a aprovação de Fase A. Isso é mais rígido que o mínimo do CON-08 porque o risco documentado na épica ("Migração de auth gerar lockout | Média | Alto") se aplica à Fase B, não à Fase A.

## Story

**As a** responsável pela identidade administrativa da RH Cursos,
**I want** migrar a autoridade de sessão administrativa de HMAC próprio para a sessão Supabase SSR **em duas fases controladas** — primeiro uma conta de teste isolada, depois (só com nova confirmação humana) o cutover de todos os admins com remoção do código legado —,
**so that** rebaixamento/revogação de papel bloqueiem a próxima requisição real (não apenas em mecanismo testado, como em REC-203), tokens HMAC/`localStorage`/header próprio saiam do fluxo produtivo (AC-17.14), e nenhum lockout de admin ocorra no processo.

## Contexto e valor

REC-202 entregou a sessão SSR do Supabase (aditiva, ainda não é o caminho real de login). REC-203 entregou `requireServerRole()` (`src/lib/supabase/authorize.ts`) — testado, mas **inerte**: nenhuma rota administrativa real o consome. O HMAC (`src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`) continua sendo a **única autoridade real de produção**, e é usado hoje em exatamente um lugar de produção: `supabase/functions/admin-resources/index.ts`, via `requireAdmin()` verificando o header `x-rh-session`. O login que emite esse HMAC é `app/api/auth/session/route.ts`. O token e a sessão bruta do Supabase ficam em `localStorage` via `src/lib/supabase/session-token.ts` (`rh_cursos_admin_token`, `rh_cursos_supabase_session`), e o cookie `httpOnly` `rh_cursos_demo_session` (`src/lib/auth.ts:16`) é a outra cópia da mesma autoridade no lado Next.js.

REC-204 é o **passo 3 de D5**: a "ativação em rota real" que REC-203 documentou como escopo futuro. É qualitativamente diferente de REC-202/REC-203 porque **troca comportamento de produção já em uso** — daí o risco de lockout explícito na épica e a exigência de rollout gradual.

## Escopo

### Fase A — Rollout em conta de teste (execução imediata autorizada)

- Introduzir uma allowlist de ativação restrita (variável de ambiente, ex. `SSR_AUTH_ROLLOUT_ACCOUNTS`, lista de `user_id`/e-mail do Supabase Auth) que **não existe hoje** — nova, mínima, server-only, sem PII em log.
- Em `supabase/functions/admin-resources/index.ts` (única rota real usando `requireAdmin`), adicionar um desvio: **antes** de chamar `requireAdmin()` (HMAC), resolver a sessão SSR do Supabase; se o usuário autenticado via SSR pertence à allowlist de rollout, autorizar via `requireServerRole()` (REC-203) e **não** consultar o HMAC para essa requisição. Caso contrário (fora da allowlist, ou sem sessão SSR), o comportamento é **byte-idêntico ao atual**: `requireAdmin()` HMAC decide.
- Validar, com a conta de teste real (ambiente de homologação, nunca produção direta sem supervisão): login via SSR, logout, e — crítico — **rebaixamento do papel da conta de teste no Supabase Auth seguido de uma nova requisição, confirmando bloqueio imediato** (não em mock, como REC-203, mas em uma rota HTTP real).
- HMAC permanece autoridade de fallback (leitura) para toda conta fora da allowlist, sem exceção.

### Gate humano intermediário (bloqueante — não é opcional)

- **HALT explícito antes de qualquer trabalho de Fase B.** A Fase A entregue e validada não autoriza automaticamente a Fase B. Uma nova confirmação humana explícita — registrada no Change Log desta story com data e escopo — é pré-requisito.
- Se a Fase A revelar qualquer comportamento inesperado (ex.: rebaixamento não bloqueando na rota real, sessão SSR instável), a story **para em Fase A** e reporta a `@po`/`@architect`; Fase B não é elegível até o problema ser resolvido.

### Fase B — Cutover total + remoção do legado (condicional ao gate humano)

- Expandir a allowlist para **todos** os admins (ou remover a checagem de allowlist, tornando `requireServerRole` a única autoridade) em `admin-resources/index.ts`.
- `app/api/auth/session/route.ts`: parar de emitir sessão HMAC (`encodeSession`); login passa a depender exclusivamente da sessão SSR do Supabase (`@supabase/ssr`, cookie `httpOnly`/`secure`/`SameSite=Lax`, já usado por REC-202).
- Rejeitar explicitamente tokens HMAC legados apresentados após o cutover: qualquer requisição que só traga `x-rh-session` (sem sessão SSR válida) recebe **401**, não é aceita nem em modo de compatibilidade.
- Remover código morto: `encodeSession`/`decodeSession` e `SESSION_COOKIE` (`src/lib/auth.ts`), o verificador gêmeo (`supabase/functions/_shared/auth.ts`), leitura do header `x-rh-session` (`getSessionToken`), e a persistência em `localStorage` (`src/lib/supabase/session-token.ts` — `rh_cursos_admin_token`, `rh_cursos_supabase_session`).
- Remover a allowlist de rollout introduzida na Fase A (não tem mais função quando todos os admins usam SSR).
- `AUTH_SESSION_SECRET` deixa de ter função (não é removido do cofre de secrets nesta story — isso é operação de `@devops`; a story só documenta que o segredo ficou órfão).

### Fora do escopo (deliberadamente NÃO feito)

- Consolidação do BFF canônico (contratos duplicados, chamadas same-origin) — é REC-206, story separada que consome D4.
- Extensão do rate limit para identidade autenticada — já entregue de forma não-acoplada por REC-205; nenhuma mudança adicional aqui.
- Qualquer alteração em `src/lib/supabase/session.ts` ou `app/api/auth/ssr-session/route.ts` (REC-202) além do uso normal como consumidor.
- Rotação de `AUTH_SESSION_SECRET` no cofre de produção (ação de `@devops`, fora desta story).
- Migrar qualquer rota que não seja `admin-resources/index.ts` — é a única rota real usando `requireAdmin()` hoje (confirmado por busca no código); rotas `app/api/admin/*` (REC-303/REC-206) já usam `requireServerRole`/`requireAdminApi` e não são tocadas aqui.

## Acceptance Criteria

1. **Fase A não altera comportamento fora da allowlist (anti-lockout)**
   **Given** um admin cujo `user_id` não está na allowlist de rollout,
   **when** ele autentica e opera normalmente,
   **then** o comportamento é idêntico ao pré-existente (HMAC via `x-rh-session`), sem qualquer dependência de sessão SSR.

2. **Fase A: rebaixamento bloqueia a requisição seguinte em rota real**
   **Given** a conta de teste na allowlist, autenticada via SSR e autorizada como `admin`,
   **when** o papel é rebaixado na fonte (Supabase Auth) e uma nova requisição chega,
   **then** a requisição seguinte é negada (`403`/`insufficient_role`) — em uma rota HTTP real, não em mock (diferencia esta AC da AC 3 de REC-203).

3. **Fase A: logout e ausência de sessão são fail-closed**
   **Given** a conta de teste sem sessão SSR ativa (logout ou expiração),
   **when** ela tenta uma operação protegida,
   **then** é negada (`401`/`unauthenticated`), sem fallback silencioso para HMAC.

4. **Gate humano registrado antes da Fase B**
   **Given** a Fase A validada e reportada,
   **when** a story avança para tarefas de Fase B,
   **then** o Change Log contém uma entrada explícita de confirmação humana para Fase B, com data — sem essa entrada, nenhuma tarefa de Fase B pode ser marcada como iniciada.

5. **Fase B: HMAC deixa de ser autoridade para qualquer admin**
   **Given** o cutover total aplicado,
   **when** qualquer admin autentica,
   **then** a autorização em `admin-resources/index.ts` depende exclusivamente de `requireServerRole` (sessão SSR); `requireAdmin()` HMAC não é mais chamado no caminho de produção.

6. **Fase B: token HMAC legado é rejeitado, não aceito em modo de compatibilidade**
   **Given** um token HMAC válido emitido antes do cutover (ex.: sessão ainda dentro do TTL antigo),
   **when** ele é apresentado a uma rota protegida após o cutover,
   **then** a resposta é `401` — o token não autoriza nada, nem em modo de leitura.

7. **Fase B: código morto removido**
   **Given** o File List da story,
   **when** revisado,
   **then** `encodeSession`/`decodeSession`/`SESSION_COOKIE` (`src/lib/auth.ts`), o verificador gêmeo (`supabase/functions/_shared/auth.ts`), a leitura de `x-rh-session`, e as chaves de `localStorage` (`rh_cursos_admin_token`, `rh_cursos_supabase_session`) foram removidos — não apenas desativados.

8. **Nenhum rollback que restaure HMAC como autoridade (NFR-08)**
   **Given** a estratégia de rollback documentada nesta story,
   **then** ela é explicitamente roll-forward — nenhum caminho de reversão reativa o HMAC como autoridade (Épica 17 §9, linha "Autenticação").

9. **Verificação verde em ambas as fases**
   **Given** o Definition of Done,
   **when** `npm run lint`, `npm run typecheck` e `npx vitest run` são executados ao final de cada fase,
   **then** todos passam sem regressão, incluindo os novos testes negativos de token legado.

## Tasks / Subtasks

- [x] **Task 1 — Confirmar pré-condições e inventário da autoridade real** (AC: 1, 9)
  - [x] Confirmar REC-202 e REC-203 `Done`; reler `src/lib/supabase/authorize.ts` (`requireServerRole`) como mecanismo pronto a usar.
  - [x] Confirmar que `supabase/functions/admin-resources/index.ts` é a única rota real chamando `requireAdmin()` (já verificado nesta preparação: `grep -rl "requireAdmin(" supabase/ app/ src/` retorna apenas `admin-resources/index.ts` e `_shared/auth.ts`).
  - [x] Confirmar que `app/api/admin/*` (REC-303/REC-206) já usa `requireServerRole`/`requireAdminApi` e não precisa de mudança.

- [x] **Task 2 — Fase A: allowlist de rollout + desvio condicional em `admin-resources`** (AC: 1, 2, 3)
  - [x] Nova env var server-only (ex. `SSR_AUTH_ROLLOUT_ACCOUNTS`), documentada, sem valor real versionado (segue NFR-01/FND-01).
  - [x] Em `admin-resources/index.ts`: resolver sessão SSR primeiro; se usuário está na allowlist, usar `requireServerRole`; senão, fluxo atual (`requireAdmin` HMAC) inalterado.
  - [x] Testes automatizados: allowlist ativa autoriza via SSR; fora da allowlist segue HMAC; rebaixamento da conta de teste bloqueia a requisição seguinte na rota real; ausência de sessão SSR para conta da allowlist nega (não cai para HMAC).

- [x] **Task 3 — Validação da Fase A e relatório** (AC: 2, 3, 9)
  - [x] Relatório sanitizado documentando os testes de rebaixamento/logout na rota real, sem credencial ou PII (`docs/history/reports/rec-204-fase-a-rollout-2026-07-17.md`).
  - [x] `npm run lint`, `npm run typecheck`, `npx vitest run` verdes.
  - [x] Reportar a `@po`/`@architect` para a validação antes do gate humano de Fase B.

- [x] **Task 4 — Gate humano de Fase B (bloqueante)** (AC: 4)
  - [x] HALT: aguardar confirmação humana explícita e específica para a Fase B (cutover total + remoção do HMAC).
  - [x] Registrar a confirmação no Change Log desta story (data + escopo autorizado) antes de tocar qualquer arquivo de Fase B.

- [x] **Task 5 — Fase B: cutover total** (AC: 5, 6, 8, condicional à Task 4)
  - [x] `admin-resources/index.ts`: `requireServerRole` (via `requireTrustedSsrAdmin`) passa a ser a única checagem — `requireAdmin()` HMAC removido do caminho. Allowlist removida do BFF (`app/api/functions/[name]/route.ts`), que agora resolve SSR incondicionalmente para `admin-resources`.
  - [x] `app/api/auth/session/route.ts`: parou de emitir sessão HMAC (`encodeSession` removido); login 100% via `signInSSR`/`@supabase/ssr`; branch condicional de allowlist removido.
  - [x] Teste negativo explícito: token HMAC legado (`x-rh-session` sem sessão SSR) → `401` no BFF (`functions-auth-rollout-route.test.ts`, caso "rejects a legacy HMAC-only request with 401"); GET `/api/auth/session` sem sessão SSR também limpa o cookie legado e retorna 401.

- [x] **Task 6 — Fase B: remoção do código morto** (AC: 7)
  - [x] Removidos `encodeSession`/`decodeSession`/`SESSION_COOKIE` (e internals HMAC: `getSessionSecret`/`SESSION_SECRET`/`signPayload`/`timingSafeEqual`) de `src/lib/auth.ts`.
  - [x] Removido o verificador gêmeo (`decodeSession`/`requireAdmin`/`getSessionToken` + leitura de `x-rh-session`) em `supabase/functions/_shared/auth.ts`; `requireTrustedSsrAdmin` mantido como autoridade única. `encodeSession` mantido apenas para a Edge Function `auth-session` (fora do escopo, deploy estático).
  - [x] Removido `src/lib/supabase/session-token.ts` inteiro (`rh_cursos_admin_token`/`rh_cursos_supabase_session`) — sem uso após atualizar os consumidores (`app-store.tsx`, `Login.tsx`, `functions-client.ts`).
  - [x] Removida a allowlist de rollout da Fase A: `src/lib/supabase/auth-rollout.ts` deletado e usos removidos em `app/api/functions/[name]/route.ts`, `app/api/auth/session/route.ts`, `src/lib/server-session.ts` e `supabase/functions/_shared/auth.ts`.
  - [x] `AUTH_SESSION_SECRET` documentado como órfão do caminho de produção Next.js/BFF (só permanece referenciado pela Edge Function `auth-session` do deploy estático, fora do escopo, e por `src/lib/env-validation.ts`). Rotação/remoção do cofre permanece ação futura de `@devops` — não executada aqui.

- [x] **Task 7 — Verificação final** (AC: 9)
  - [x] `npm run lint` (limpo), `npm run typecheck` (limpo), `npx vitest run` (715/715, 72 arquivos) sem regressão, incluindo os testes negativos de token legado.
  - [x] Suíte unitária completa reexecutada: 715 passando (subiu de 714 por +1 teste líquido — testes órfãos de HMAC removidos e testes SSR/negativos adicionados).

## Dev Notes

### Por que a Fase A é segura por construção

A allowlist é **restritiva por padrão**: qualquer conta fora dela segue exatamente o caminho HMAC de hoje, sem nenhuma mudança de comportamento observável. Isso significa que a Fase A pode ser implementada, testada e até mergeada sem risco de lockout — o único caminho que muda é o da(s) conta(s) explicitamente listada(s), que é justamente a estratégia "conta de teste" aprovada. Isso reflete o mesmo princípio de segurança que REC-202/REC-203 usaram (aditivo, não consumido), mas aqui há uma diferença deliberada: a conta de teste **é** consumida de verdade, porque só assim o rebaixamento pode ser provado em rota real (AC 2), fechando a limitação que o relatório de REC-203 documentou explicitamente como pendente.

### Por que a Fase B precisa de um segundo gate humano

A aprovação coletada para esta story autoriza a Fase A "para execução imediata". A Fase B é o evento que a épica identifica como risco real de lockout ("Migração de auth gerar lockout | Média | Alto"). Não presumir que a aprovação de Fase A implica aprovação de Fase B é o que torna esta story auditável e reversível até o último momento seguro — a Fase A pode ser abandonada sem custo (é só reverter a env var/desvio); a Fase B não é trivialmente reversível porque remove código.

### Reuso (Article IV — No Invention)

Nenhum mecanismo novo de autorização é criado: `requireServerRole` (REC-203) e a sessão SSR (REC-202) já existem e são reutilizados sem modificação de contrato. A única peça nova é a allowlist de rollout da Fase A, que é removida na Fase B — não é uma abstração permanente.

### Arquivos de referência (autoridade legada, confirmados por busca no código)

- `supabase/functions/admin-resources/index.ts` — única rota real usando `requireAdmin()` (HMAC).
- `supabase/functions/_shared/auth.ts` — verificador HMAC gêmeo (Edge/Deno), lê `x-rh-session` (`getSessionToken`, linha ~112-114).
- `src/lib/auth.ts` — verificador HMAC (Next.js), `SESSION_COOKIE = "rh_cursos_demo_session"` (linha 16), `encodeSession`/`decodeSession`.
- `app/api/auth/session/route.ts` — login que hoje emite a sessão HMAC.
- `src/lib/supabase/session-token.ts` — `localStorage`: `rh_cursos_admin_token` (linha 12), `rh_cursos_supabase_session` (linha 13).
- `src/lib/supabase/authorize.ts` (REC-203, Done) — `requireServerRole`/`resolveServerRole`/`roleSatisfies`, pronto para consumo real.
- `src/lib/supabase/session.ts`, `app/api/auth/ssr-session/route.ts` (REC-202, Done) — fonte da sessão SSR.

### Testing

- Local: `src/__tests__/lib/`, seguindo o padrão mockado de `supabase-authorize.test.ts` (REC-203) para os casos de rebaixamento/negação — porém os testes desta story cobrem a **rota real** (`admin-resources`), não apenas o módulo `authorize.ts`.
- Nenhuma chamada de rede real contra o projeto remoto do Supabase; nenhuma credencial real é usada nos testes automatizados.
- Validação da conta de teste (Fase A, Task 3) pode exigir passo manual documentado em ambiente de homologação — reportar como evidência sanitizada (sem PII/segredo), conforme §10 da épica.

### Project Structure Notes

- Não modificados nesta story: `.aiox-core/**` (L1/L2), `app/api/admin/*` (REC-303, já usa `requireServerRole` corretamente), `src/lib/supabase/session.ts`/`ssr-session/route.ts` (REC-202, apenas consumidos).

## Dependências

- **Entrada:** REC-202 (Done), REC-203 (Done, mecanismo pronto e não ativado).
- **Desbloqueia:** REC-206 (BFF canônico), G4/REC-502 (encerramento da épica), qualquer story futura que assuma HMAC já removido.

## Roll-forward / Rollback

- **Fase A:** reversível trivialmente — remover a conta da allowlist (ou a env var) restaura o comportamento 100% HMAC para ela, sem tocar em código de produção usado por outros admins.
- **Fase B:** **forward-only, sem exceção.** Uma vez removido o código HMAC, qualquer "rollback" real (reintroduzir `encodeSession`/`decodeSession`/verificação HMAC) é proibido por NFR-08 e pela Épica 17 §9 ("Autenticação: Corrigir Supabase Auth para frente | Restaurar HMAC como autoridade [proibido]"). Se um problema for descoberto após a Fase B, a correção é sempre uma migration/patch forward na própria autoridade SSR — nunca a reativação do HMAC.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-17 | 0.1 | **Draft.** Story criada a partir do ADR-016 (D1/D2/D4/D5), Onda 3, passo 3 de identidade (cutover real). Decisão humana de Fase A (rollout com conta de teste) coletada e registrada acima; Fase B requer gate humano adicional, ainda não coletado. Escopo dividido em Fase A / Gate humano / Fase B dentro da mesma story, em vez de nova numeração, seguindo a disciplina de REC-203 de não inventar IDs fora do backlog da épica. | @sm (River) |
| 2026-07-17 | 0.2 | **Ready.** Validação `@po` (checklist 10/10, GO): AC testáveis, escopo IN/OUT claro, dependências e riscos mapeados, alinhamento com ADR-016/Épica 17 confirmado. Afirmações técnicas da story (única rota real usando `requireAdmin()` HMAC, `app/api/admin/*` já em `requireServerRole`, chaves de `localStorage`, etc.) auditadas contra o código atual — todas corretas. Ponto de atenção não-bloqueante registrado: hoje um admin autenticado só via HMAC recebe 401 em `app/api/admin/*` por falta de sessão SSR; story já trata isso como fora de escopo (remetido a REC-305) — validar com `@dev`/`@architect` se a Fase B deve fechar esse gap explicitamente. | @po (Pax) |
| 2026-07-17 | 0.3 | **In Progress — Fase A implementada localmente.** Addendum D4-A ratificada por `@architect`: SSR é validado no BFF same-origin e o canal BFF→Edge usa a service role existente, sem segredo novo. Login/logout/layout/BFF da conta allowlisted usam SSR sem emitir HMAC; allowlist fail-closed e bloqueio de bypass HMAC direto implementados. 742/742 testes unitários, lint, typecheck e build verdes. Validação operacional com conta real de homologação permanece pendente; Fase B não iniciada. | @dev (Dex) |
| 2026-07-18 | 0.4 | **Task 3 concluída — validação operacional da Fase A.** Executada em projeto Supabase de teste isolado (schema completo via migrations, Edge Functions deployadas, sem relação com produção), seguindo a ordem anti-bypass (allowlist Edge → prova de rejeição HMAC → allowlist Next → validação SSR). Confirmado por chamada HTTP real: (1) conta fora da allowlist mantém HMAC funcionando (200); (2) HMAC válido para conta allowlisted é rejeitado no Edge (401); (3) login SSR sem emissão de HMAC; (4) operação real autorizada via `requireServerRole` (200); (5) logout seguido de operação nega (401, fail-closed); (6) rebaixamento na fonte (`app_metadata.role` + `profiles.role`) bloqueia a requisição seguinte na mesma sessão já autenticada (403), sem necessidade de novo login; (7) restauração roll-forward do papel confirmada (200 novamente). Relatório sanitizado atualizado em `docs/history/reports/rec-204-fase-a-rollout-2026-07-17.md`. Fase A validada operacionalmente; gate humano de Fase B (Task 4) segue pendente de confirmação explícita. | @dev (Dex) |
| 2026-07-18 | 0.5 | **Gate humano de Fase B confirmado (Task 4).** Autorização explícita do proprietário da conta administrativa, coletada em 2026-07-18, para o escopo integral da Fase B descrito na story (Escopo → "Fase B — Cutover total + remoção do legado"): (1) `app/api/auth/session/route.ts` para de emitir sessão HMAC para qualquer admin de produção, login passa a depender exclusivamente da sessão SSR do Supabase; (2) `admin-resources/index.ts` passa a usar exclusivamente `requireServerRole`, `requireAdmin()` HMAC sai do caminho de produção; (3) token HMAC legado apresentado após o cutover recebe `401`, sem modo de compatibilidade; (4) remoção de código morto (`encodeSession`/`decodeSession`/`SESSION_COOKIE` em `src/lib/auth.ts`, verificador gêmeo em `supabase/functions/_shared/auth.ts`, chaves de `localStorage` em `session-token.ts`); (5) `AUTH_SESSION_SECRET` fica órfão, documentado sem rotação/remoção do cofre (ação futura de `@devops`). Confirmado que esta é uma mudança **forward-only** (NFR-08): nenhum rollback que reative HMAC é permitido após o cutover. Task 5 em diante liberada para `@dev`. | @po (Pax), confirmação coletada via `@aiox-master` |
| 2026-07-18 | 0.6 | **Fase B implementada — cutover total HMAC → SSR (Tasks 5, 6, 7).** Autoridade de sessão admin migrada para a sessão Supabase SSR em todo o caminho de produção, forward-only (NFR-08). (1) `admin-resources/index.ts` passou a autorizar exclusivamente via `requireTrustedSsrAdmin` (SSR + service-role encaminhados pelo BFF same-origin); `requireAdmin()` HMAC removido do caminho. (2) `app/api/auth/session/route.ts` parou de emitir sessão HMAC (`encodeSession`), login 100% `signInSSR`; branch de allowlist removido; cookie HMAC legado limpo defensivamente e GET sem SSR retorna 401. (3) BFF `app/api/functions/[name]/route.ts` sem allowlist — `admin-resources` sempre resolve SSR (`requireServerRole`) e não encaminha mais `x-rh-session`. (4) Código morto removido: `encodeSession`/`decodeSession`/`SESSION_COOKIE` + internals HMAC em `src/lib/auth.ts`; verificador gêmeo em `_shared/auth.ts`; arquivo `src/lib/supabase/session-token.ts` (localStorage `rh_cursos_admin_token`/`rh_cursos_supabase_session`) deletado com atualização dos consumidores (`app-store.tsx`, `Login.tsx`, `functions-client.ts`); allowlist `src/lib/supabase/auth-rollout.ts` deletada. (5) Teste negativo de token HMAC legado → 401 adicionado no BFF; suíte de testes ajustada (órfãos HMAC removidos/reescritos, casos SSR e negativos adicionados). (6) `AUTH_SESSION_SECRET` documentado como órfão do caminho Next.js/BFF (permanece referenciado apenas pela Edge Function `auth-session` do deploy estático, fora do escopo, e por `env-validation.ts`); rotação/remoção do cofre segue como ação futura de `@devops`, não executada. Verificação final: `npm run lint` limpo, `npm run typecheck` limpo, `npx vitest run` 715/715 (72 arquivos) verde. QA Results permanece pendente da revisão independente de `@qa` + `@architect`. | @dev (Dex) |
| 2026-07-18 | 0.7 | **Done — QA gate concluído.** Revisão de segurança (`@qa`) e de arquitetura (`@architect`) executadas de forma independente (ver `## QA Results`). Achado HIGH (gap de `.gitignore` para backup local sem segredo real) remediado nesta sessão. Regressão MEDIUM confirmada analiticamente (realtime admin sem autenticação pós-cutover — policies RLS de `lead`/`aluno`/`inscricao` exigem `authenticated`, cliente browser fica `anon` permanentemente) — decisão humana explícita: tratar como known-issue documentado, fora do escopo de REC-204, a ser resolvido junto da consolidação do transporte realtime (já escopo diferido de REC-206). Scaffolding de teste morto (`session-token` mock inerte em `app-store.test.ts`) e resíduos de `x-rh-session` em `cors.ts`/`config.toml` removidos. Verificação final reexecutada de forma independente por `@aiox-master`: lint limpo, typecheck limpo, `npx vitest run` 715/715 (72 arquivos), sem regressão. Status promovido para `Done`. | @aiox-master (Orion), consolidando @qa + @architect |

## File List

### Fase A (v0.1–0.4)

- `.env.example`
- `README.md`
- `app/api/functions/[name]/route.ts`
- `app/api/auth/session/route.ts`
- `docs/architecture/adr-016-identidade-bff-rec201.md`
- `docs/history/reports/rec-204-fase-a-rollout-2026-07-17.md`
- `docs/stories/2026-07-17-rec-204-remover-hmac-localstorage-header.md`
- `src/__tests__/app/api/functions-auth-rollout-route.test.ts`
- `src/__tests__/app/api/auth-session-route.test.ts`
- `src/__tests__/lib/supabase-auth-rollout.test.ts`
- `src/__tests__/lib/server-session-rollout.test.ts`
- `src/__tests__/mocks/server-only.ts`
- `src/__tests__/supabase/edge-auth-rollout.test.ts`
- `src/lib/supabase/auth-rollout.ts`
- `src/lib/server-session.ts`
- `src/views/public/Login.tsx`
- `supabase/functions/_shared/auth.ts`
- `supabase/functions/admin-resources/index.ts`
- `vitest.config.ts`

### Fase B — cutover total (v0.6)

Produção (modificados):
- `src/lib/auth.ts` — removidos `encodeSession`/`decodeSession`/`SESSION_COOKIE` e internals HMAC; mantidos tipos/`getCookieOptions`/`normalizeDashboardRole`.
- `supabase/functions/_shared/auth.ts` — removido verificador HMAC (`decodeSession`/`requireAdmin`/`getSessionToken`); `requireTrustedSsrAdmin` autoridade única.
- `supabase/functions/admin-resources/index.ts` — `requireTrustedSsrAdmin` como única checagem.
- `app/api/auth/session/route.ts` — login SSR-only; sem emissão HMAC; sem allowlist; cookie legado limpo + 401 no GET sem SSR.
- `app/api/functions/[name]/route.ts` — allowlist removida; `admin-resources` sempre autorizado via `requireServerRole`; `x-rh-session` não é mais encaminhado.
- `src/lib/server-session.ts` — SSR-only; sem `decodeSession`/allowlist.
- `src/lib/supabase/functions-client.ts` — removidos `sessionToken`/header `x-rh-session`.
- `src/views/public/Login.tsx` — removida persistência de token/sessão Supabase no browser.
- `src/lib/app-store.tsx` — removida dependência de `session-token.ts`; gate admin passa a derivar do papel da sessão SSR; logout sem `accessToken` de browser.

Produção (removidos):
- `src/lib/supabase/session-token.ts` — deletado (localStorage HMAC).
- `src/lib/supabase/auth-rollout.ts` — deletado (allowlist da Fase A).

Testes (modificados):
- `src/__tests__/lib/auth.test.ts` — reescrito para os helpers sobreviventes ao cutover.
- `src/__tests__/lib/core-utilities.test.ts`, `src/__tests__/lib/execution-test.test.ts` — removidos os blocos de auth HMAC órfãos.
- `src/__tests__/app/api/auth-session-route.test.ts` — mismatch de papel via `signInSSR` (SSR-only).
- `src/__tests__/app/api/functions-route.test.ts` — passthrough via `leads`; sem `x-rh-session`.
- `src/__tests__/app/api/functions-auth-rollout-route.test.ts` — reescrito para SSR exclusiva + negativo HMAC→401.
- `src/__tests__/supabase/edge-auth-rollout.test.ts` — removido caso `requireAdmin`; mantidos casos `requireTrustedSsrAdmin`.
- `src/__tests__/lib/server-session-rollout.test.ts` — reescrito para autoridade SSR exclusiva.
- `src/__tests__/views/public/login-page.test.tsx` — removido mock `session-token` e teste de persistência HMAC.
- `src/__tests__/lib/app-store.test.ts` — removidas asserções de token/localStorage; gate admin via papel SSR; realtime gated por papel.

Testes (removidos):
- `src/__tests__/lib/session-token.test.ts` — módulo alvo deletado.
- `src/__tests__/lib/supabase-auth-rollout.test.ts` — módulo alvo deletado.

## QA Results

### Revisão de segurança `@qa` (Quinn) — Fase B (2026-07-18)

**Escopo:** diff completo da Fase B (9 arquivos modificados, 2 removidos) + varredura de todo o repositório por resíduo de bypass HMAC.

**Veredito original do revisor: CONCERNS.**

Confirmado como seguro (evidência, não inferência):
- Nenhum caminho de produção aceita mais `x-rh-session`/HMAC — varredura no repo inteiro (`app/`, `src/`, `supabase/`) confirma zero consumidores de autorização dos módulos removidos.
- Ponte de confiança BFF→Edge (`requireTrustedSsrAdmin`) resiste a forjamento: headers de identidade só são aceitos com `timingSafeEqual` contra a service-role key (server-only); teste negativo prova que identidade forjada pelo cliente é descartada e substituída pela identidade resolvida via SSR.
- Resolução de papel sempre fresca via `client.auth.getUser()` (sem cache, sem JWT decodificado localmente) — rebaixamento bloqueia a próxima requisição.
- Fail-closed em todos os ramos (nenhum caminho "permite" silenciosamente em caso de erro/ausência de sessão).
- Rate limiting e lockdown preservados na limpeza de código morto.
- Limpeza de cookie legado é efetiva (`maxAge: 0`, mesmas opções de emissão).
- Teste negativo (HMAC legado → 401) exercita o módulo de rota real, não uma reimplementação.

**Achado HIGH — corrigido nesta sessão:** `.env.local.backup-20260718-152440` (criado durante a validação operacional da Fase A, ver Change Log v0.4) não estava coberto pelo padrão `.gitignore` (`.env.backup-*` não cobre `.env.local.backup-*`). Verificação de conteúdo confirmou que os campos sensíveis desse backup específico estavam **vazios** (0 caracteres em `SUPABASE_SERVICE_ROLE_KEY`/`AUTH_SESSION_SECRET`/etc. — o `.env.local` original, antes desta story, não continha segredo real), portanto não houve exposição de segredo real neste caso concreto. Ainda assim, o gap de padrão era real e foi corrigido: `.gitignore` atualizado com `.env.local.backup-*`; arquivo removido. O `.env.local` atual (com os segredos reais do projeto de teste `site-teste`) já estava corretamente coberto pelo `.gitignore` (`.env.local`, padrão pré-existente) — confirmado, nunca esteve exposto.

**Achado MEDIUM — follow-up não bloqueante (SEC-204a, não criada formalmente):** a Edge Function `auth-session` permanece um caminho de login paralelo fora da autoridade SSR desta story (usa `signInWithPassword` sem MFA/AAL2, mesma lacuna de SEC-104), retornando `access_token`/`refresh_token` no corpo. `AUTH_SESSION_SECRET` está genuinamente órfão do caminho Next/BFF (confirmado — nenhum consumidor de produção o lê para autorizar `admin-resources`), mas essa function segue deployada e utilizável independentemente do cutover. Decisão de manter/decomissionar essa function é operacional (`@devops`) e está fora do escopo desta story; registrado aqui para rastreabilidade.

**Achado LOW — follow-up não bloqueante:** `src/lib/env-validation.ts` ainda marca `AUTH_SESSION_SECRET` como `🔴 CRITICAL` para o app Next/BFF, o que não reflete mais a realidade pós-cutover (o segredo só serve a `auth-session`, fora de escopo). Ajuste de anotação, sem impacto de runtime — fica para quando `@devops` tratar o ciclo de vida do segredo.

**Veredito revisado após remediação do achado HIGH nesta sessão: PASS com follow-ups não bloqueantes** (MEDIUM SEC-204a, LOW env-validation) — mesmo padrão de fechamento usado em outras stories da Épica 17 (ex. REC-002/SEC-104, REC-101/SEC-107).

### Revisão de arquitetura `@architect` (Aria) — Fase B (2026-07-18)

**Veredito do revisor: CONCERNS.** Nenhum issue CRITICAL/HIGH. Conformidade com AC5, AC6, AC7, AC8, AC4, ADR-016 D1/D2, D5 e forward-only (NFR-08) confirmada ponto a ponto (tabela completa de rastreamento no relatório do revisor). Cadeia de autorização BFF→Edge avaliada como correta e fail-closed em cada elo; deleção dos dois arquivos de teste órfãos (`session-token.test.ts`, `supabase-auth-rollout.test.ts`) avaliada como apropriada (módulos-alvo removidos, sem perda real de cobertura do caminho crítico); mudança em `app-store.tsx` (fora da lista nominal de arquivos da story) avaliada como mínima e necessária, não escopo inflado (Article IV respeitado).

**[MEDIUM] Regressão confirmada — realtime admin sem autenticação.** O cliente Supabase do browser (`src/lib/supabase/client.ts`) nunca mais fica autenticado após a Fase B: `setSupabaseSession`/`auth.setSession` foram removidos junto com `session-token.ts`, e a sessão SSR fica exclusivamente em cookie `httpOnly` (inacessível ao JS, por desenho — ADR-016 D2). As subscriptions realtime de `lead_changes`/`inscricao_changes`/`aluno_changes` em `app-store.tsx` continuam sendo abertas para sessão admin, mas com esse cliente agora permanentemente `anon`. **Confirmado analiticamente** (não apenas hipótese do revisor): as policies RLS de `SELECT` nessas três tabelas (`lead_admin_select`, `authenticated_read_aluno`/`aluno_owner_or_admin_select`, `authenticated_read_inscricao`) são todas `to authenticated` — nenhuma concede `anon` — logo o Realtime do Supabase (que aplica RLS por conexão a cada evento `postgres_changes`) nunca entrega esses eventos ao cliente anon. Efeito: dados iniciais do dashboard continuam corretos (servidos pelo BFF autenticado), mas mudanças feitas por outra sessão não aparecem mais sem recarregar a página — perda silenciosa do auto-refresh ao vivo, não uma falha de segurança (fail-closed, não fail-open).

**Decisão registrada (2026-07-18):** tratar como known-issue documentado, **fora do escopo do REC-204** — a consolidação do transporte realtime já era escopo explícito e diferido de REC-206 (ver comentário em `app-store.tsx`: "a consolidação do transporte realtime (WebSocket direto ao Supabase) permanece fora do escopo"). Não corrigido nesta story para evitar reintroduzir exposição de token ao browser (o que violaria D2) sem desenho dedicado. Fica registrado como pendência explícita para quando o transporte realtime for endereçado (REC-206 ou story dedicada).

**[MEDIUM] Scaffolding morto de teste corrigido nesta sessão.** `src/__tests__/lib/app-store.test.ts` mantinha `vi.mock("@/lib/supabase/session-token", ...)` de um módulo deletado, com mocks/asserções inertes (`getSessionToken.mockReturnValue(...)`, `setSessionToken` etc.) que não influenciam mais o código sob teste — o mock nunca executa porque `app-store.tsx` não importa mais esse módulo. Removido: mock do módulo inexistente e todos os usos órfãos; suíte reexecutada e permanece verde (ver nota de verificação abaixo).

**Itens LOW (housekeeping, endereçados nesta sessão onde de baixo risco):** resíduo de `x-rh-session` em `supabase/functions/_shared/cors.ts` (Access-Control-Allow-Headers) e no comentário de `supabase/config.toml` removidos (AC7 pede remoção, não apenas desativação). Nomenclatura/setup obsoleto de `SSR_AUTH_ROLLOUT_ACCOUNTS` em `auth-session-route.test.ts` deixada como está (testa comportamento real e correto, só o nome do `describe` é enganoso — cosmético, não bloqueante). `AUTH_SESSION_SECRET` em `env-validation.ts` mantido como está, com o follow-up já registrado para `@devops` no achado da revisão de segurança acima.

**Veredito final combinado (segurança + arquitetura):** **PASS com follow-ups não bloqueantes** — HIGH remediado nesta sessão (gitignore), MEDIUM-realtime documentado como known-issue com decisão humana explícita, MEDIUM-testes corrigido nesta sessão, LOWs de código morto residual corrigidos onde de baixo risco.

### Revisão `@po`/`@architect` da Task 3 — Fase A (2026-07-18)

**Escopo da revisão:** evidência operacional da Fase A registrada em `docs/history/reports/rec-204-fase-a-rollout-2026-07-17.md` (seção "Validação operacional concluída"), cruzada com AC 1, 2, 3 e 9.

| AC | Verificação | Evidência | Veredito |
|---|---|---|---|
| AC1 (anti-lockout) | Conta fora da allowlist continua HMAC-autorizada, comportamento idêntico ao pré-existente | Chamada direta ao Edge com token HMAC de conta não-allowlisted → `200` | ✅ Atende |
| AC2 (rebaixamento em rota real) | Rebaixamento na fonte bloqueia a requisição seguinte, na mesma sessão já autenticada, sem novo login | `app_metadata.role` + `profiles.role` rebaixados; próxima requisição na mesma sessão → `403` | ✅ Atende |
| AC3 (logout fail-closed) | Ausência de sessão nega, sem fallback para HMAC | `DELETE /api/auth/session` seguido de operação → `401` | ✅ Atende |
| AC9 (gates verdes) | lint/typecheck/vitest sem regressão | lint ✅, typecheck ✅ (742/742 unitários já confirmados na v0.3, sem alteração de código nesta rodada — apenas ambiente/dados) | ✅ Atende |

Verificação adicional (fora do escopo formal das ACs, mas relevante para D5/anti-lockout): bypass HMAC direto para conta allowlisted testado e rejeitado (`401`) antes mesmo de ativar a allowlist no runtime Next, confirmando a ordem de ativação descrita no relatório da Fase A.

**Nota de isolamento:** toda a validação rodou contra um projeto Supabase de teste criado exclusivamente para este fim (schema completo via migrations, Edge Functions deployadas), sem qualquer interação com o banco de produção. Diff de código nesta rodada é zero (`git diff` vazio) — a Task 3 foi puramente operacional/dados.

**Veredito:** Task 3 **GO**. A Fase A está validada operacionalmente end-to-end (não apenas em mock, como o relatório da Fase A já documentava como pendência de REC-203). O gate humano da Fase B (Task 4) está elegível para ser solicitado — permanece condicionado à confirmação humana explícita do proprietário da conta administrativa, ainda não coletada.

— @po (Pax) + @architect (Aria), via `@aiox-master`

---

### Resolução dos itens não-bloqueantes de limpeza (follow-up dos vereditos CONCERNS)

Os dois itens de limpeza sinalizados pelas revisões independentes foram resolvidos:

- **MEDIUM (testes):** removido o scaffolding morto de `@/lib/supabase/session-token` em `src/__tests__/lib/app-store.test.ts` — bloco `vi.mock` do módulo deletado, entradas `mocks` correspondentes (`clearSessionToken`, `setSessionToken`, `getSessionToken`, `decodeSessionToken`, `getSupabaseSession`), os `mockReset`/`mockClear` no `beforeEach` e as ~15 chamadas `mocks.getSessionToken/getSupabaseSession.mockReturnValue(...)` espalhadas pelos testes. Removida também a asserção vacuamente verdadeira `expect(mocks.setSessionToken).not.toHaveBeenCalledWith("stale.token")` (o teste em volta mantém a asserção real de não-reidratação pós-logout).
- **LOW (cors/config):** removido `x-rh-session` da lista `Access-Control-Allow-Headers` em `supabase/functions/_shared/cors.ts` e atualizado o comentário em `supabase/config.toml` (agora descreve a autorização admin via sessão SSR confiável / `requireTrustedSsrAdmin` em vez do token HMAC via `x-rh-session`).

**Verificação final:** `npm run lint` ✅, `npm run typecheck` ✅, `npx vitest run` ✅ 715/715 testes em 72 arquivos — sem regressão em relação ao baseline.
