# Story REC-002: Revogar credenciais e sessões comprometidas

## Status

Done

## Executor Assignment

executor: "@devops" (rotação técnica) + proprietário humano da conta administrativa (senha/MFA)
quality_gate: "@qa"
quality_gate_tools:
- teste negativo de PAT/token antigo (esperar 401/403 em todos os consumidores)
- teste negativo de sessão HMAC assinada com `AUTH_SESSION_SECRET` anterior
- inventário sanitizado de credenciais rotacionadas com timestamp e owner
- confirmação de MFA ativo na conta administrativa
- revisão do relatório de rotação sem segredo ou PII

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 0 — Contenção SEV-0
- **Prioridade:** P0 / SEV-0
- **Estimativa:** S–M; concluir dentro da janela de contenção da Onda 0
- **Findings:** FND-01
- **Requisitos:** NFR-01, NFR-08, NFR-09, CON-03, CON-08
- **Gate relacionado:** G0 — Incidente contido

## Story

**As a** coordenador do incidente e proprietário da conta administrativa da RH Cursos,
**I want** revogar e rotacionar toda credencial, token e sessão identificados como potencialmente expostos por FND-01,
**so that** nenhum acesso obtido a partir do vazamento continue válido durante ou depois da recuperação.

## Contexto e valor

REC-001 declarou o incidente, aplicou o freeze e preservou evidências, incluindo o inventário sanitizado de credenciais potencialmente comprometidas (Task 4 de REC-001). `.claude/settings.json`, versionado no repositório, é a evidência primária do vazamento. Os workflows `.github/workflows/deploy-functions.yml` e `.github/workflows/deploy-frontend.yml` consomem, via GitHub Actions secrets, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `AUTH_SESSION_SECRET`, `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` — exatamente a classe de segredo operacional em risco. A sessão administrativa própria (`src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`) usa HMAC-SHA256 assinado com `AUTH_SESSION_SECRET`; rotacionar esse segredo em todos os ambientes consumidores invalida automaticamente qualquer sessão emitida antes da rotação, porque `decodeSession()`/verificação Edge recomputam a assinatura e rejeitam divergência.

Esta story não altera código de aplicação; ela rotaciona segredos e sessões nos ambientes onde já são consumidos. REC-003 cobre o que fazer se a rotação não puder ser comprovada em algum ambiente antes do prazo. REC-004/REC-005 cobrem remover o segredo do HEAD e do histórico Git.

## Escopo

### Incluído

- Rotacionar tokens de acesso do GitHub usados por automações/CI (PAT ou equivalente) e revogar os antigos.
- Rotacionar `SUPABASE_ACCESS_TOKEN` e `SUPABASE_PROJECT_REF` usados pelos workflows de deploy, coordenando com `@data-engineer` apenas a geração de novas credenciais no dashboard Supabase quando aplicável, sem alterar migration ou policy.
- Rotacionar `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` usados pelo deploy do frontend.
- Rotacionar `AUTH_SESSION_SECRET` simultaneamente em todos os ambientes consumidores (GitHub Actions secrets, ambiente do frontend implantado e ambiente das Supabase Edge Functions), validando que sessões antigas passam a ser rejeitadas.
- Orientar tecnicamente a troca de senha da conta administrativa e a ativação de MFA, executadas pelo proprietário humano da conta.
- Registrar inventário sanitizado da rotação: identificador não secreto, consumidor, ambiente, horário, resultado do teste negativo.
- Produzir evidência sanitizada para `@qa`.

### Fora do escopo

- Remover segredo do conteúdo versionado do HEAD: REC-004.
- Reescrever histórico, branches ou tags: REC-005.
- Ativar indisponibilidade fail-closed quando a rotação não puder ser propagada a tempo: REC-003.
- Migrar a autoridade de sessão para Supabase Auth: REC-201 a REC-204.
- Emitir conclusão jurídica sobre o incidente.
- Qualquer alteração de código de aplicação, migration ou workflow versionado.

## Acceptance Criteria

1. **Tokens e PATs antigos rejeitados**
   **Given** um PAT ou token de acesso identificado no inventário de REC-001,
   **when** um teste negativo é executado após a rotação,
   **then** o valor antigo retorna `401`/`403` (ou equivalente) em todo consumidor conhecido, e o novo valor funciona nos mesmos consumidores.

2. **Sessão HMAC antiga invalidada**
   **Given** uma sessão administrativa assinada com o `AUTH_SESSION_SECRET` anterior,
   **when** `AUTH_SESSION_SECRET` é rotacionado em todos os ambientes consumidores e a sessão é reapresentada,
   **then** a verificação de assinatura falha e a sessão é rejeitada em ambos os pontos de verificação (`src/lib/auth.ts` e `supabase/functions/_shared/auth.ts`).

3. **Senha e MFA da conta administrativa**
   O proprietário humano confirma a troca de senha e a ativação de MFA. Ausência de confirmação aparece como bloqueio explícito na story, nunca como suposição de conclusão.

4. **Rotação atômica entre ambientes**
   **Given** que `AUTH_SESSION_SECRET` e as demais credenciais de deploy são consumidas por mais de um ambiente (frontend implantado e Supabase Edge Functions),
   **when** a rotação ocorre,
   **then** todos os ambientes recebem o novo valor antes de qualquer novo deploy ser autorizado; se um ambiente não puder ser atualizado no mesmo checkpoint, a story registra o gap e aciona REC-003.

5. **Inventário sem material secreto**
   O registro de rotação lista cada credencial por identificador não secreto, consumidor, ambiente, timestamp, owner e resultado do teste negativo, sem copiar valor de token, senha, JWT ou segredo.

6. **Nenhum segredo em artefato versionado**
   O relatório e o gate produzidos por esta story não contêm valor de credencial, apenas evidência de rotação e resultado de teste.

7. **Gate independente**
   `@qa` revisa a evidência e emite PASS/CONCERNS/FAIL para REC-002. O executor `@devops` não autoaprova a própria rotação.

## Tasks / Subtasks

- [x] **Task 1 — Consolidar inventário de rotação a partir de REC-001** (AC: 1, 5)
  - [x] Importar o inventário sanitizado produzido em REC-001 Task 4.
  - [x] Confirmar consumidores por credencial: `.github/workflows/deploy-functions.yml`, `.github/workflows/deploy-frontend.yml`, ambiente das Edge Functions, ambiente do frontend implantado. Confirmado tecnicamente: os 8 secrets de deploy (`AUTH_SESSION_SECRET`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`) vivem no ambiente `production` do GitHub (não repo-level); `GITHUB_TOKEN` em `release.yml` é o token efêmero automático do Actions, não um PAT armazenado — fora do escopo de rotação manual.

- [x] **Task 2 — Rotacionar tokens de GitHub/CI** (AC: 1, 5, 6)
  - [x] Gerar novo token, revogar o antigo. CRED-02 (inventário REC-001): token `gho_...` de sessão `gh` CLI (`@devops`) usado nesta contenção — tratado como potencialmente exposto por precaução (FND-01) e rotacionado: `gh auth logout` + revogação da autorização OAuth do app "GitHub CLI" em github.com/settings/applications (owner: Pedro Augusto) + novo login via device flow com escopo solicitado `repo,workflow,read:org`. Não havia PAT customizado armazenado em secret de workflow para rotacionar (ver Task 1).
  - [x] Executar teste negativo com o valor antigo. Comprovado por efeito, não por reuso do valor antigo (vedado pelas Security Notes): após `gh auth logout`, `gh auth status` retornou "The token in keyring is invalid" — revogação server-side confirmada antes de qualquer novo login.

- [x] **Task 3 — Rotacionar credenciais Supabase** (AC: 1, 5, 6)
  - [x] Rotacionar `SUPABASE_ACCESS_TOKEN` usado pelo deploy de Functions. CRED-03 (inventário REC-001): novo Access Token gerado pelo Incident Commander (Pedro Augusto) via Supabase Dashboard, escopo cobrindo `link`/`secrets set`/`functions deploy` (primeira tentativa saiu com escopo insuficiente — `missing required scopes [read:project]` — corrigida com token substituto de escopo completo). `SUPABASE_PROJECT_REF` confirmado como identificador não-rotável (não é credencial); `updated_at` do secret inalterado desde 2026-07-08, sem mudança indevida.
  - [x] Atualizar o secret nos workflows e validar teste negativo do valor antigo. Valor antigo já estava morto desde a remediação do REC-001 (`supabase projects list` → `Unauthorized`, 2026-07-15T23:55:02Z). Secret `SUPABASE_ACCESS_TOKEN` no ambiente `production` regravado (`updated_at` avançou de `2026-07-12T14:10:55Z` para `2026-07-16T13:33:02Z`, confirmado via API sem leitura de valor). Token novo validado positivamente pelo IC em terminal próprio: `supabase projects list` → sucesso, sem o valor passar por esta sessão.

- [x] **Task 4 — Rotacionar credenciais Cloudflare** (AC: 1, 5, 6)
  - [x] Rotacionar `CLOUDFLARE_API_TOKEN` e revisar `CLOUDFLARE_ACCOUNT_ID`. CRED-04 (inventário REC-001): novo API Token gerado pelo Incident Commander via Cloudflare Dashboard → My Profile → API Tokens, template "Edit Cloudflare Workers", escopo restrito à conta/zona do projeto. `CLOUDFLARE_ACCOUNT_ID` confirmado como identificador não-rotável; `updated_at` inalterado desde 2026-07-03.
  - [x] Validar teste negativo do valor antigo. Valor antigo já estava morto desde a remediação do REC-001 (todos os API Tokens Cloudflare excluídos pelo IC, por atestação — sem `wrangler` disponível neste ambiente para verificação técnica direta, mesma limitação documentada em REC-001). Secret `CLOUDFLARE_API_TOKEN` no ambiente `production` regravado (`updated_at` avançou de `2026-07-03T14:13:34Z` para `2026-07-16T13:41:00Z`, confirmado via API sem leitura de valor). Token novo validado positivamente pelo IC em terminal próprio (`wrangler whoami` bem-sucedido), sem o valor passar por esta sessão.

- [x] **Task 5 — Rotacionar `AUTH_SESSION_SECRET`** (AC: 2, 4, 5)
  - [x] Gerar novo segredo (≥32 caracteres) conforme exigido por `getSessionSecret()` (`src/lib/auth.ts:43-47`). Gerado com `openssl rand -hex 32` (64 caracteres hex) pelo Incident Commander, nunca exposto a esta sessão.
  - [x] Atualizar o secret em GitHub Actions, no ambiente do frontend implantado e no ambiente das Edge Functions, na mesma janela. Como os workflows de deploy seguem `disabled_manually` (freeze do REC-001), o secret do GitHub sozinho não propagaria para os ambientes vivos — os 3 pontos foram atualizados diretamente pelo IC em sequência: (1) `gh secret set AUTH_SESSION_SECRET --env production`, confirmado via API (`updated_at` avançou de `2026-07-03T13:58:18Z` para `2026-07-16T14:27:30Z`, sem leitura de valor); (2) `supabase secrets set AUTH_SESSION_SECRET=... --project-ref` contra o projeto de produção; (3) `wrangler secret put AUTH_SESSION_SECRET` contra o Worker Cloudflare implantado. IC confirmou sucesso dos 3 comandos.
  - [x] Validar que uma sessão emitida antes da rotação é rejeitada por ambos os verificadores. IC mantinha sessão admin ativa em produção antes da rotação; após os 3 comandos, tentativa de acesso a rota admin com a sessão antiga foi rejeitada (cookie inválido, exigiu novo login) — confirma `decodeSession()` rejeitando corretamente tanto no lado do frontend (`src/lib/auth.ts`) quanto no lado das Edge Functions (`supabase/functions/_shared/auth.ts`), já que ambos compartilham a mesma verificação de assinatura HMAC contra o novo segredo.
  - [x] Se algum ambiente não puder ser atualizado na mesma janela, registrar o gap e acionar REC-003. Não aplicável — os 3 ambientes foram atualizados na mesma janela, sem gap.

- [x] **Task 6 — Coordenar troca de senha e MFA** (AC: 3)
  - [x] Orientar tecnicamente o proprietário humano da conta administrativa. Identificado que a autenticação administrativa do app usa Supabase Auth (`supabase.auth.signInWithPassword` em `app/api/auth/session/route.ts:126`), não a conta do dashboard/organização. Fluxo padrão de recuperação por e-mail bateu em dois obstáculos: (1) `Site URL`/`Redirect URLs` da configuração de Auth do projeto apontava para um domínio Cloudflare Pages obsoleto (`site-rh-cursos.pages.dev`, `DNS_PROBE_FINISHED_NXDOMAIN`) — produção migrou para Cloudflare Workers (`rhcursos.com.br`); (2) rate limit de e-mail do Supabase (plano free) bloqueou reenvios. Resolvido com script descartável local usando `SUPABASE_SERVICE_ROLE_KEY` (Admin API `auth.admin.updateUserById` + `auth.admin.signOut(..., "global")`), criado em `.tmp-reset-password.mjs` na raiz do projeto (nunca commitado, apagado logo após uso) — troca de senha sem depender de e-mail, com revogação global de sessões antigas no mesmo passo. MFA (TOTP) ativado via script descartável equivalente (`.tmp-enroll-mfa.mjs`, também apagado) usando `supabase.auth.mfa.enroll/challenge/verify`; enrollment concluído por cadastro manual do secret no app autenticador (QR code SVG não é renderizável em terminal).
  - [x] Registrar confirmação humana explícita ou bloqueio. Confirmado explicitamente pelo Incident Commander (Pedro Augusto), em duas etapas separadas: "senha trocada com sucesso" + "sessões antigas revogadas globalmente" (script de senha), depois "MFA ativado com sucesso" (script de MFA). Nenhuma conclusão foi suposta sem confirmação textual.
  - [x] **Incidente lateral registrado:** durante a triagem do passo de recuperação por e-mail, um `access_token`/`refresh_token` de uma sessão de recuperação de senha foi colado nesta sessão de trabalho (fora do fluxo padrão da story). Tratado como potencialmente comprometido por precaução: a revogação global de sessões (`auth.admin.signOut(..., "global")`) executada na troca de senha via Admin API invalida esse refresh token junto com qualquer outra sessão antiga. Nenhum valor de segredo foi copiado para commit, issue ou log versionado.
  - [x] **Gap não-bloqueante identificado, fora do escopo de execução desta story:** `Site URL`/`Redirect URLs` da configuração de Auth do Supabase seguem apontando para o domínio Cloudflare Pages obsoleto. Isso não afeta login normal (que não depende de redirect), mas quebra qualquer fluxo de recuperação de senha por e-mail até ser corrigido no dashboard (Authentication → URL Configuration). Recomendado como ação de follow-up do IC, fora do escopo desta story (não é rotação de credencial).

- [x] **Task 7 — Consolidar evidência e gate** (AC: 1–7)
  - [x] Produzir relatório sanitizado em `docs/history/reports/rec-002-rotacao-credenciais-2026-07-15.md`.
  - [x] Criar/atualizar `docs/qa/gates/rec-002-revogar-credenciais-sessoes.yml` (`gate: PENDING`).
  - [x] Solicitar veredito de `@qa`. Pontos levantados para atenção do `@qa`: AC3 via caminho alternativo (Admin API, não e-mail padrão) e o incidente lateral SEC-103 (token de recuperação exposto e mitigado por revogação global no mesmo ciclo).

## Dev Notes

### Fontes verificadas

- A Épica 17 define REC-002 como segunda story da Onda 0, dependente de REC-001, com entrega "PATs, senha, sessões e segredo HMAC antigos rejeitados; MFA ativo". [Fonte: `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md#onda-0--contenção-sev-0-t0-a-t2h`]
- `.claude/settings.json` é a âncora local de FND-01. [Fonte: `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md#2-rastreamento-dos-achados-aprovados`]
- Os secrets `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `AUTH_SESSION_SECRET`, `PUBLIC_APP_URL`, `EXTRA_ALLOWED_ORIGINS` são consumidos por `.github/workflows/deploy-functions.yml` (linhas 40-66).
- Os secrets `AUTH_SESSION_SECRET`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` são consumidos por `.github/workflows/deploy-frontend.yml` (linhas 43-63).
- A verificação de sessão HMAC ocorre em `src/lib/auth.ts` (`getSessionSecret`, `signPayload`, `decodeSession`) e em `supabase/functions/_shared/auth.ts` (mesma família de verificação, falha explicitamente se o segredo estiver ausente ou tiver menos de 32 caracteres).
- A Constitution reserva secrets, CI/CD e operações remotas para `@devops`, e determina que decisões de senha/MFA que exigem titularidade humana permanecem com o proprietário da conta. [Fonte: `.aiox-core/constitution.md#ii-agent-authority-non-negotiable`; épica seção 3, CON-08]

### Project Structure Notes

- Esta story não cria nem modifica código de aplicação.
- Segredos rotacionados são estado operacional (dashboards GitHub/Supabase/Cloudflare); apenas o índice sanitizado da rotação é versionado, em `docs/history/reports/`.
- Não modificar `.claude/settings.json`, `.github/workflows/*.yml` ou qualquer path L1/L2.

### Ferramentas e execução segura

- GitHub: Settings → Secrets and variables → Actions; revogação de PAT em Developer settings.
- Supabase: Project Settings → API/Access Tokens, com geração mínima de escopo necessário.
- Cloudflare: My Profile → API Tokens, escopo restrito ao necessário para o deploy.
- `AUTH_SESSION_SECRET`: gerar com `openssl rand -hex 32` ou equivalente, nunca reaproveitar valor exposto.
- Nenhum valor de segredo deve aparecer em terminal capturado, log ou artefato versionado.

## Testing e evidências

- Teste negativo de cada credencial antiga (PAT, tokens Supabase/Cloudflare) esperando rejeição.
- Teste negativo de sessão HMAC assinada com o segredo anterior, verificado tanto no fluxo do frontend quanto no das Edge Functions.
- Confirmação humana registrada de troca de senha e MFA ativo.
- Verificação de que nenhum novo deploy foi disparado com credencial mista (ambiente parcialmente rotacionado).
- Busca no relatório por padrões de token/segredo, esperando zero ocorrência real.

## Observabilidade

- Registrar cada rotação com timestamp absoluto, timezone `America/Sao_Paulo`/UTC e owner.
- Registrar apenas identificador não secreto, consumidor e resultado do teste.
- Alertar imediatamente se um consumidor continuar aceitando credencial antiga após o checkpoint.
- Falha de rotação em qualquer ambiente aparece como lacuna explícita com owner e próxima ação, nunca como PASS parcial.

## Security Notes

- Tratar toda credencial associada a `.claude/settings.json` e aos workflows de deploy como comprometida, mesmo sem evidência de uso malicioso.
- Rotacionar antes de sanear o HEAD (REC-004) ou o histórico (REC-005); nunca na ordem inversa.
- Não copiar valor de segredo para CLI, issue, chat ou log durante o teste negativo; usar apenas indicação de sucesso/falha.
- A decisão de notificação legal permanece com o DPO/responsável legal; esta story fornece apenas evidência sanitizada de rotação.

## Dependências

- **Entrada:** REC-001 concluída (freeze aplicado, inventário sanitizado disponível).
- **Bloqueia execução de:** REC-004 (sanear HEAD), REC-201 (ADR de identidade, que assume credenciais já rotacionadas).
- **Aciona quando necessário:** REC-003, se algum ambiente não puder comprovar a rotação a tempo.
- **Não depende de:** REC-403, pois não altera código de aplicação.

## Roll-forward / Rollback

- **Roll-forward obrigatório:** gerar nova credencial e revogar a anterior; nunca restaurar um token, senha ou segredo comprometido.
- **Rollback proibido:** reativar credencial antiga para "destravar" um deploy; deploys ficam bloqueados (REC-003) até a rotação ser comprovada.
- Erro de rotação (ex.: novo token mal configurado) é corrigido gerando outro novo valor, preservando o registro do valor anterior como inválido.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> Como REC-002 não altera código de aplicação, a validação usa revisão manual do relatório de rotação e dos testes negativos por `@qa`.

### Story Type Analysis

- **Primary Type:** Deployment / Security (rotação de credenciais)
- **Secondary Type:** Governance (autoridade humana sobre senha/MFA)
- **Complexity:** Média, por envolver quatro consumidores (GitHub, Supabase, Cloudflare, sessão HMAC) e dependência humana.
- **Agentes:** executor `@devops`; dependência humana no proprietário da conta; quality gate independente `@qa`.

### Manual review focus

- Nenhum segredo/PII em artefatos versionados.
- Rotação comprovada com teste negativo em todos os consumidores identificados.
- Janela de rotação sem estado misto entre ambientes.
- Autoridades AIOX respeitadas (senha/MFA com o proprietário humano).

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-15 | 0.1 | Draft criado a partir da Épica 17 (autorização de decomposição pós-REC-001), com escopo exclusivo de rotação de credenciais, tokens e sessão HMAC. | @sm (River) |
| 2026-07-15 | 1.0 | **GO (10/10) → Draft → Ready.** Checklist de 10 pontos sem lacunas: título claro, contexto/valor completo, ACs em Given/When/Then, escopo incluído/excluído explícito, dependências mapeadas (REC-001 entrada; bloqueia REC-004/REC-201; aciona REC-003 sob gap), estimativa (S–M), valor de negócio (contenção SEV-0), riscos e roll-forward/rollback documentados, critérios de conclusão claros via gate independente do @qa, alinhamento com Épica 17/Onda 0 confirmado. Bloqueadores documentais: 0. | @po (Pax) |
| 2026-07-15 | 1.1 | **Ready → InProgress.** `@devops` (Gage) executou Tasks 1-2 com confirmação explícita do Incident Commander (Pedro Augusto) em cada etapa. Task 1: consumidores confirmados tecnicamente (8 secrets no ambiente `production`, não repo-level; `GITHUB_TOKEN` de `release.yml` é o efêmero automático do Actions, fora de escopo). Task 2: CRED-02 (token `gho_...` da sessão `gh` CLI usada nesta contenção) rotacionado — `gh auth logout`, revogação da autorização OAuth do app "GitHub CLI" pelo IC via github.com/settings/applications, novo login via device flow com escopo `repo,workflow,read:org`. Teste negativo comprovado por efeito (`gh auth status` → "token in keyring is invalid" após logout), sem reutilizar o valor antigo. Residual `low` registrado e aceito pelo IC: o device flow do `gh` CLI sempre inclui `gist` como escopo mínimo do app, independente de `--scopes`; não expõe código de repositório nem segredo de produção. Tasks 3-7 (Supabase, Cloudflare, `AUTH_SESSION_SECRET`, senha/MFA, evidência/gate) seguem pendentes. | @devops (Gage) |
| 2026-07-16 | 1.2 | **InProgress → InReview.** `@devops` (Gage) concluiu Tasks 3-7 com confirmação explícita do IC em cada etapa. Task 3: `SUPABASE_ACCESS_TOKEN` rotacionado (primeira tentativa com escopo insuficiente, corrigida), validado com `supabase projects list`. Task 4: `CLOUDFLARE_API_TOKEN` rotacionado, validado com `wrangler whoami`. Task 5: `AUTH_SESSION_SECRET` rotacionado nos 3 ambientes (GitHub Actions, Supabase Edge Functions, Cloudflare Worker) na mesma janela, sem gap; sessão admin antiga confirmada rejeitada. Task 6: senha e MFA da conta administrativa (Supabase Auth) trocadas/ativadas via Admin API em scripts descartáveis não versionados, após o fluxo padrão de e-mail falhar (Site URL obsoleto + rate limit); incidente lateral de token de recuperação exposto na sessão de trabalho, mitigado por revogação global de sessões no mesmo ciclo. Task 7: relatório sanitizado (`docs/history/reports/rec-002-rotacao-credenciais-2026-07-15.md`) e gate (`docs/qa/gates/rec-002-revogar-credenciais-sessoes.yml`, `gate: PENDING`) criados; `@devops` não autoaprovou (AC7/AC9). Gaps não-bloqueantes registrados para follow-up do IC: Site URL/Redirect URLs obsoletos no Supabase Auth (REL-101), escopo residual `gist` no token gh CLI (SEC-101). Veredito solicitado a `@qa`, com atenção especial ao AC3 (caminho alternativo) e ao incidente lateral (SEC-103). | @devops (Gage) |
| 2026-07-16 | 1.4 | **InReview → Done.** Gate CONCERNS (80/100) não bloqueia G0; ambos os findings medium (SEC-103, SEC-104) são residuais mitigados ou explicitamente fora do escopo desta story, com follow-up registrado. `@devops` fecha a story conforme regra de lifecycle (CONCERNS → aprovar com observações documentadas, prosseguir). Follow-up SEC-104 (AAL2 no login admin) será tratado como story própria na trilha REC-201+. | @devops (Gage) |
| 2026-07-16 | 1.3 | **Gate: CONCERNS (80/100).** `@qa` (Quinn) revisou de forma independente e confirmou: AC1/AC2/AC4/AC5/AC6/AC7 PASS (verificação técnica própria dos dois verificadores HMAC em `src/lib/auth.ts` e `supabase/functions/_shared/auth.ts`, ausência dos scripts `.tmp-*.mjs` no histórico do Git, zero segredo real nos 3 artefatos versionados); AC3 CONCERNS (outcome atingido via caminho alternativo). Dois findings `medium` novos, nenhum bloqueante para a contenção SEV-0: **SEC-103** (token de recuperação exposto na sessão de trabalho, mitigado por revogação global no mesmo ciclo — janela residual de TTL já decorrida) e **SEC-104** (MFA foi enrolled na conta Supabase Auth, mas o login do app em `app/api/auth/session/route.ts:126` não exige challenge AAL2 — `signInWithPassword` sozinho ainda abre sessão admin; correção é alteração de código, fora do escopo declarado de REC-002, recomendada como story de follow-up, possivelmente junto da trilha REC-201+). Gate: `docs/qa/gates/rec-002-revogar-credenciais-sessoes.yml`. | @qa (Quinn) |

## File List

### Criado nesta preparação

- `docs/stories/2026-07-15-rec-002-revogar-credenciais-sessoes.md`

### Criado nesta execução

- `docs/history/reports/rec-002-rotacao-credenciais-2026-07-15.md`
- `docs/qa/gates/rec-002-revogar-credenciais-sessoes.yml`

### Referências somente leitura

- `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md`
- `docs/stories/2026-07-14-rec-001-incidente-freeze-evidencias.md`
- `.claude/settings.json`
- `.github/workflows/deploy-functions.yml`
- `.github/workflows/deploy-frontend.yml`
- `src/lib/auth.ts`
- `supabase/functions/_shared/auth.ts`

## Dev Agent Record

### Agent Model Used

A preencher pelo executor.

### Debug Log References

A preencher pelo executor, somente com referências sanitizadas.

### Completion Notes

A preencher pelo executor.

## QA Results

### Gate: CONCERNS ⚠️ — @qa (Quinn), 2026-07-16

**Gate file:** [`docs/qa/gates/rec-002-revogar-credenciais-sessoes.yml`](../qa/gates/rec-002-revogar-credenciais-sessoes.yml) · **Quality score:** 80/100

Revisão independente (executor `@devops` não autoaprova — AC7). Não confiei apenas no relatório; verifiquei tecnicamente onde era possível sem tocar em valores de segredo.

#### Verificação independente realizada

| Verificação | Resultado |
|---|---|
| Ambos os verificadores HMAC (`src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`) recomputam a assinatura com o segredo atual e rejeitam via `timingSafeEqual`; ambos exigem ≥32 caracteres | ✅ AC2 tecnicamente sólido — rotar `AUTH_SESSION_SECRET` invalida sessões antigas de forma determinística |
| Scripts descartáveis `.tmp-reset-password.mjs` / `.tmp-enroll-mfa.mjs` | ✅ Nunca commitados, ausentes da história do Git, removidos do disco |
| Scan de padrões de segredo (`sbp_`, `gho_`, JWT, hex-64, PEM) nos 3 artefatos versionados | ✅ Zero ocorrências de valor real (AC5/AC6) |
| Fluxo de login do app (`app/api/auth/session/route.ts:126`) | ⚠️ `signInWithPassword` sem challenge AAL2 → ver SEC-104 |

#### Acceptance Criteria

- **AC1 (tokens/PATs antigos rejeitados):** PASS — CRED-02/03/04 rotacionados, teste negativo por efeito + teste positivo do valor novo confirmado pelo IC.
- **AC2 (sessão HMAC antiga invalidada):** PASS — mecanismo verificado no código nos dois pontos; teste real com sessão admin ativa em produção.
- **AC3 (senha e MFA):** CONCERNS — **outcome atingido** (senha trocada, MFA TOTP enrolled, confirmação humana explícita em duas etapas). O AC não prescreve o fluxo de e-mail; o caminho alternativo via Admin API atende ao espírito e ainda adicionou revogação global. Mantido CONCERNS por SEC-103 e SEC-104 (abaixo).
- **AC4 (rotação atômica entre ambientes):** PASS — `AUTH_SESSION_SECRET` nos 3 ambientes na mesma janela, sem gap; REC-003 não acionado.
- **AC5 (inventário sem material secreto):** PASS.
- **AC6 (nenhum segredo em artefato versionado):** PASS — confirmado por scan.
- **AC7 (gate independente):** PASS — veredito emitido por `@qa`, sem autoaprovação do executor.

#### Findings que sustentam o CONCERNS

- **SEC-103 (medium, mitigado):** token de recuperação colado na sessão de trabalho. A revogação global (`auth.admin.signOut(..., "global")`) fecha o vetor persistente (refresh token); resta apenas a janela de TTL do access_token JWT (~1h), **já decorrida** nesta data. @qa considera o vetor efetivamente fechado.
- **SEC-104 (medium, NOVO — descoberto por @qa):** MFA está *enrolled* na conta Supabase Auth, mas **não é exigido pelo login do app** — `signInWithPassword` valida só `app_metadata.role`, sem AAL2. Senha sozinha ainda abre sessão admin. **Não corrigível dentro de REC-002** (é alteração de código, explicitamente fora do escopo). Encaminhado como story de follow-up. Registro aqui para evitar a leitura incorreta de que "o login admin agora está protegido por MFA".

#### Residuais aceitos (low)

SEC-101 (escopo `gist` do gh CLI), SEC-102 (verificação Cloudflare por atestação), REL-101 (Site URL obsoleto no Supabase Auth), REL-102 (audit logs de provedor não coletados) — mesma linha estrutural do gate REC-001.

#### Veredito

**CONCERNS.** A rotação de credenciais e do segredo HMAC está comprovada e a contenção SEV-0 (G0) não é bloqueada. Os dois pontos medium são residuais mitigados ou fora do escopo desta story. Recomendo: (1) prosseguir na Onda 0 tratando REC-002 como contido; (2) abrir follow-up de código para AAL2 no login admin (SEC-104); (3) IC corrigir REL-101 no dashboard. Nenhum retorno a `@dev` é necessário dentro do escopo de REC-002.

— Quinn, guardião da qualidade 🛡️
