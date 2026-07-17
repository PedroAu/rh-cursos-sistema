# Story REC-204: Cutover HMAC → Supabase SSR (rollout gradual com conta de teste) e remoção do legado

## Status

In Progress

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

- [ ] **Task 3 — Validação da Fase A e relatório** (AC: 2, 3, 9)
  - [ ] Relatório sanitizado documentando os testes de rebaixamento/logout na rota real, sem credencial ou PII.
  - [x] `npm run lint`, `npm run typecheck`, `npx vitest run` verdes.
  - [ ] Reportar a `@po`/`@architect` para a validação antes do gate humano de Fase B.

- [ ] **Task 4 — Gate humano de Fase B (bloqueante)** (AC: 4)
  - [ ] HALT: aguardar confirmação humana explícita e específica para a Fase B (cutover total + remoção do HMAC).
  - [ ] Registrar a confirmação no Change Log desta story (data + escopo autorizado) antes de tocar qualquer arquivo de Fase B.

- [ ] **Task 5 — Fase B: cutover total** (AC: 5, 6, 8, condicional à Task 4)
  - [ ] `admin-resources/index.ts`: `requireServerRole` passa a ser a única checagem (allowlist removida ou expandida para todos).
  - [ ] `app/api/auth/session/route.ts`: parar de emitir sessão HMAC; login 100% via `@supabase/ssr`.
  - [ ] Teste negativo explícito: token HMAC legado apresentado após cutover → `401`.

- [ ] **Task 6 — Fase B: remoção do código morto** (AC: 7)
  - [ ] Remover `encodeSession`/`decodeSession`/`SESSION_COOKIE` de `src/lib/auth.ts`.
  - [ ] Remover verificador gêmeo em `supabase/functions/_shared/auth.ts` e leitura de `x-rh-session`.
  - [ ] Remover `rh_cursos_admin_token`/`rh_cursos_supabase_session` de `src/lib/supabase/session-token.ts` (ou remover o arquivo, se ficar sem uso).
  - [ ] Remover a allowlist de rollout da Fase A (sem função após cutover total).
  - [ ] Documentar, sem executar, que `AUTH_SESSION_SECRET` ficou órfão (ação de rotação/remoção do cofre é de `@devops`).

- [ ] **Task 7 — Verificação final** (AC: 9)
  - [ ] `npm run lint`, `npm run typecheck`, `npx vitest run` sem regressão.
  - [ ] Suíte agregada da épica reexecutada (baseline atual: 657/657 após REC-303 — valor a confirmar no momento da execução desta story).

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

## File List

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

## QA Results

_Pendente — aguardando implementação e revisão de `@qa` + `@architect` (mudança de autoridade real de produção exige o mesmo rigor aplicado em REC-203)._
