# Relatório de rotação de credenciais — REC-002

> Nenhum valor de senha, PAT, JWT, refresh token, private key, `AUTH_SESSION_SECRET` ou secret é reproduzido neste documento. Apenas identificadores não secretos, consumidor, ambiente, timestamp, owner e resultado do teste.

Story: [`docs/stories/2026-07-15-rec-002-revogar-credenciais-sessoes.md`](../../stories/2026-07-15-rec-002-revogar-credenciais-sessoes.md) · Épica 17, Onda 0 · Executor: `@devops` (Gage) · Incident Commander / proprietário humano: Pedro Augusto.

Base: inventário sanitizado do REC-001 ([`rec-001-inventario-exposicao-2026-07-14.md`](rec-001-inventario-exposicao-2026-07-14.md)).

## 1. Resumo do estado final

| Item | Consumidor | Ambiente | Estado |
|---|---|---|---|
| CRED-02 | Sessão `gh` CLI usada na contenção | Local (`@devops`) | ✅ Rotacionado |
| CRED-03 | `SUPABASE_ACCESS_TOKEN` (deploy Edge Functions) | GitHub Actions (`production`) | ✅ Rotacionado |
| — | `SUPABASE_PROJECT_REF` | GitHub Actions (`production`) | ✅ Confirmado íntegro (não-rotável) |
| CRED-04 | `CLOUDFLARE_API_TOKEN` (deploy Worker) | GitHub Actions (`production`) | ✅ Rotacionado |
| — | `CLOUDFLARE_ACCOUNT_ID` | GitHub Actions (`production`) | ✅ Confirmado íntegro (não-rotável) |
| SESS-01 | `AUTH_SESSION_SECRET` (sessão HMAC admin) | GitHub Actions + Supabase Edge Functions + Cloudflare Worker (3 ambientes, mesma janela) | ✅ Rotacionado |
| — | Senha da conta administrativa (Supabase Auth) | Supabase Auth (`admin@rhcursos.com.br`) | ✅ Trocada + sessões antigas revogadas globalmente |
| — | MFA (TOTP) da conta administrativa | Supabase Auth (`admin@rhcursos.com.br`) | ✅ Ativado |

## 2. Task 1 — Consumidores confirmados

- Os 8 secrets de deploy vivem no ambiente `production` do GitHub (não repo-level): `AUTH_SESSION_SECRET`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`.
- `GITHUB_TOKEN` em `.github/workflows/release.yml` é o token efêmero automático do GitHub Actions (por execução), não um PAT armazenado — fora do escopo de rotação manual.
- Consumidores de `AUTH_SESSION_SECRET` confirmados por leitura de código: `src/lib/auth.ts` (`getSessionSecret()`, exige ≥32 caracteres) e `supabase/functions/_shared/auth.ts` (mesma verificação HMAC).

## 3. Task 2 — CRED-02 (token GitHub CLI)

- Nenhum PAT customizado de CI foi encontrado armazenado em secret de workflow (ver Task 1) — o item a rotacionar era o próprio token `gho_...` da sessão `gh` CLI usada na contenção do REC-001.
- **2026-07-15:** `gh auth logout` revogou o token corrente. `gh auth status` confirmou `token in keyring is invalid` antes de qualquer novo login (teste negativo por efeito, sem reutilizar o valor antigo).
- Reautenticação via device flow (`gh auth login --scopes repo,workflow,read:org`) manteve `gist` no token novo — comportamento padrão do app OAuth embutido do `gh` CLI (escopo mínimo do device flow, não removível via flag). Revogada a autorização do app "GitHub CLI" em `github.com/settings/applications` e refeito o login do zero: `gist` persistiu mesmo assim (confirmado como limitação estrutural do `gh` CLI, não resíduo de autorização anterior).
- **Decisão do IC:** aceitar `gist` como risco residual `low` (não alcança código de repositório nem segredo de produção) em vez de migrar para PAT fine-grained manual.
- Escopo final do token ativo: `gist, read:org, repo, workflow`.

## 4. Task 3 — CRED-03 (Supabase)

- Verificação prévia sem expor valores: `supabase projects list` retornou timeout de autenticação neste ambiente — confirma que não havia token de Management API válido configurado localmente (consistente com a exclusão de todos os Access Tokens já feita pelo IC durante a remediação do REC-001).
- **2026-07-16:** IC gerou novo Access Token via Supabase Dashboard (Account → Access Tokens). Primeira tentativa saiu com escopo insuficiente (`missing required scopes [read:project]`); corrigida com token substituto cobrindo `link`/`secrets set`/`functions deploy`.
- Secret `SUPABASE_ACCESS_TOKEN` no ambiente `production` do GitHub regravado: `updated_at` avançou de `2026-07-12T14:10:55Z` para `2026-07-16T13:33:02Z` (confirmado via API do GitHub, sem leitura de valor).
- Teste positivo do token novo, feito pelo IC em terminal próprio: `supabase projects list` → sucesso.
- `SUPABASE_PROJECT_REF` confirmado como identificador não-rotável; `updated_at` inalterado desde `2026-07-08`.

## 5. Task 4 — CRED-04 (Cloudflare)

- `wrangler` não está instalado neste ambiente de execução — mesma limitação de verificação técnica já documentada no REC-001.
- **2026-07-16:** IC gerou novo API Token via Cloudflare Dashboard (My Profile → API Tokens), template "Edit Cloudflare Workers", escopo restrito à conta/zona do projeto.
- Secret `CLOUDFLARE_API_TOKEN` no ambiente `production` do GitHub regravado: `updated_at` avançou de `2026-07-03T14:13:34Z` para `2026-07-16T13:41:00Z` (confirmado via API do GitHub, sem leitura de valor).
- Teste positivo do token novo, feito pelo IC em terminal próprio: `wrangler whoami` → sucesso.
- `CLOUDFLARE_ACCOUNT_ID` confirmado como identificador não-rotável; `updated_at` inalterado desde `2026-07-03`.
- Valor antigo já estava morto desde a remediação do REC-001 (todos os API Tokens excluídos pelo IC) — mesma limitação de verificação técnica direta (atestação do IC, sem `wrangler` disponível para confirmação independente neste ambiente).

## 6. Task 5 — SESS-01 (`AUTH_SESSION_SECRET`)

- Gerado com `openssl rand -hex 32` (64 caracteres hex, acima do mínimo de 32 exigido por `getSessionSecret()`), pelo IC, nunca exposto a esta sessão.
- Como os workflows de deploy seguem `disabled_manually` (freeze do REC-001), atualizar só o secret do GitHub não propagaria para os ambientes vivos. Os 3 pontos foram atualizados diretamente pelo IC, em sequência, na mesma janela:
  1. `gh secret set AUTH_SESSION_SECRET --env production` — confirmado via API (`updated_at` avançou de `2026-07-03T13:58:18Z` para `2026-07-16T14:27:30Z`, sem leitura de valor).
  2. `supabase secrets set AUTH_SESSION_SECRET=... --project-ref <ref>` contra o projeto de produção.
  3. `wrangler secret put AUTH_SESSION_SECRET` contra o Worker Cloudflare implantado.
- **Teste negativo (AC2):** IC mantinha sessão admin ativa em produção antes da rotação. Após os 3 comandos, tentativa de acesso a rota admin com a sessão antiga foi rejeitada (cookie inválido, exigiu novo login) — confirma `decodeSession()` rejeitando corretamente tanto no lado do frontend (`src/lib/auth.ts`) quanto no lado das Edge Functions (`supabase/functions/_shared/auth.ts`), que compartilham a mesma verificação HMAC.
- Nenhum gap entre ambientes — não houve necessidade de acionar REC-003.

## 7. Task 6 — Senha e MFA da conta administrativa

- Autenticação administrativa do app confirmada como Supabase Auth (`supabase.auth.signInWithPassword` em `app/api/auth/session/route.ts:126`), não a conta do dashboard/organização.
- Fluxo padrão de recuperação por e-mail bateu em dois obstáculos, ambos documentados:
  1. `Site URL`/`Redirect URLs` da configuração de Auth do projeto apontava para um domínio Cloudflare Pages obsoleto (`DNS_PROBE_FINISHED_NXDOMAIN`) — produção migrou para Cloudflare Workers. Gap não-bloqueante, fora do escopo desta story (não é credencial), recomendado como follow-up do IC em Authentication → URL Configuration.
  2. Rate limit de e-mail do Supabase (plano free) bloqueou reenvios do link de recuperação.
- **Resolução:** troca de senha feita via Admin API (`auth.admin.updateUserById`), usando `SUPABASE_SERVICE_ROLE_KEY` já configurada localmente, em script descartável (`.tmp-reset-password.mjs`, criado na raiz do projeto, nunca commitado, apagado imediatamente após uso). O mesmo passo executou `auth.admin.signOut(userId, "global")`, revogando todas as sessões antigas.
- **Incidente lateral:** durante a triagem do obstáculo de e-mail, um `access_token`/`refresh_token` de uma sessão de recuperação foi colado nesta sessão de trabalho, fora do fluxo padrão da story. Tratado como potencialmente comprometido por precaução — a revogação global de sessões do passo anterior já invalida esse refresh token junto com qualquer outra sessão. Nenhum valor foi copiado para commit, issue ou artefato versionado.
- MFA (TOTP) ativado via script descartável equivalente (`.tmp-enroll-mfa.mjs`, mesma disciplina de não-commit e remoção imediata), usando `supabase.auth.mfa.enroll/challenge/verify`. Enrollment concluído por cadastro manual do secret no app autenticador do IC (o `qr_code` retornado pela API é SVG em texto, não renderizável em terminal).
- Confirmação humana explícita do IC em duas etapas separadas: "senha trocada com sucesso" + "sessões antigas revogadas globalmente"; depois "MFA ativado com sucesso". Nenhuma conclusão foi suposta sem confirmação textual (AC3).

## 8. Gaps e recomendações não-bloqueantes

- **Site URL/Redirect URLs do Supabase Auth obsoletos** (item 7.1): recomendado ao IC corrigir em Authentication → URL Configuration para `https://rhcursos.com.br`. Não bloqueia este gate por não ser rotação de credencial.
- **Descongelamento dos workflows de deploy** (`disabled_manually` desde REC-001): permanece fora do escopo desta story — pertence aos gates posteriores da Épica 17.
- **Audit logs de Supabase/Cloudflare durante a rotação**: não coletados neste ciclo (mesma limitação estrutural do REC-001 — sem acesso de auditoria de provedor neste ambiente). Risco residual `low`, mesma natureza do REL-002 do gate REC-001.

## 9. Verificação independente por `@devops` (sem autoaprovação — AC7/AC9)

Todas as confirmações de sucesso acima vieram do Incident Commander em terminal próprio; `@devops` corroborou tecnicamente onde possível sem tocar em valores de segredo: `updated_at` de 3 secrets via API do GitHub (`SUPABASE_ACCESS_TOKEN`, `CLOUDFLARE_API_TOKEN`, `AUTH_SESSION_SECRET`), estado dos workflows (`disabled_manually`, freeze intacto), e ausência de PAT customizado nos workflows versionados. `@devops` não emite veredito de gate — solicitado a `@qa`.
