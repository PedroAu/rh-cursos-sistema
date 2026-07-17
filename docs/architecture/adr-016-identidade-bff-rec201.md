# ADR-016 — Autoridade única de identidade (Supabase Auth) e limites do BFF

- **Status:** Aprovado (produzido por REC-201; sujeito à validação de `@po` no InReview e aos gates de `@qa`)
- **Data:** 2026-07-16
- **Autor:** `@architect` (Aria)
- **Story de origem:** [`docs/stories/2026-07-16-rec-201-adr-identidade-bff.md`](../stories/2026-07-16-rec-201-adr-identidade-bff.md)
- **Épica:** [Épica 17 — Recuperação SEV-0](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md) · Onda 3
- **Insumos rastreáveis:** FND-04, FR-07, NFR-04 (Épica 17); finding SEC-104 (QA de REC-002); código verificado (ver "Evidência técnica")
- **Governança:** CON-04 (decisão de autoridade de sessão/BFF exige `@architect` + ADR)

> **Constitutional gate (Article IV — No Invention).** Cada decisão abaixo referencia explicitamente um finding/requisito da Épica 17 ou uma limitação técnica confirmada no código. Nenhuma tecnologia ou autoridade de sessão é introduzida sem essa âncora. Este ADR **registra a decisão**; não implementa código (implementação: REC-202 a REC-206).

---

## Contexto

FND-04 declara: *"Sessão administrativa própria usa HMAC, `localStorage` e não possui revogação confiável — autorização pode permanecer válida após mudança de papel ou bloqueio."* FR-07 exige que *"login, logout, renovação, revogação e papel usem Supabase Auth como autoridade única"*, derivado de FND-04 e FND-07. NFR-04 (fail-closed) exige que *"falha de configuração, autorização ou proteção antiabuso bloqueie operações sensíveis"*.

### Evidência técnica (código verificado, 2026-07-16)

O fluxo administrativo atual opera com **três mecanismos paralelos de identidade/autoridade**, confirmados diretamente no código:

1. **Validação de senha via Supabase Auth, mas autoridade real em HMAC próprio.** `app/api/auth/session/route.ts:126` chama `supabase.auth.signInWithPassword(...)` só para validar a senha e ler `app_metadata.role` (`:132`). Em seguida o handler emite uma **sessão HMAC própria** (`encodeSession`, `src/lib/auth.ts:98`) que carrega `{role, email, name, exp}` assinada com `AUTH_SESSION_SECRET`. É essa sessão HMAC — não o JWT do Supabase — que autoriza as requisições subsequentes.

2. **Papel congelado no token, sem revogação confiável.** O `role` é gravado no payload HMAC no momento do login (`src/lib/auth.ts:99`) e nunca é reconsultado na origem. `decodeSession` (`src/lib/auth.ts:104`, e o gêmeo `supabase/functions/_shared/auth.ts:77`) só recomputa a assinatura e checa `exp`. Um rebaixamento, bloqueio ou revogação de papel no Supabase **não invalida** uma sessão HMAC já emitida até o TTL expirar — 30 min padrão (`SESSION_TTL_MS`, `auth-session.ts:1`) ou **30 dias** com "Manter conectado" (`REMEMBER_SESSION_TTL_MS`, `auth-session.ts:2`). Confirma FND-04.

3. **Persistência client-side em `localStorage`, incluindo tokens Supabase crus.** `src/lib/supabase/session-token.ts` guarda o token HMAC (`rh_cursos_admin_token`, `:12`) e o par `access_token`/`refresh_token` do Supabase (`rh_cursos_supabase_session`, `:13`) em `window.localStorage` (`:21`, `:56`). `localStorage` é legível por qualquer script na página (exfiltrável por XSS) e não é `httpOnly`. O cliente ainda decodifica o token HMAC de forma **otimista, sem verificar a assinatura** (`decodeSessionToken`, `:82` — "No browser não há como validar o HMAC").

4. **Duas cópias da verificação HMAC = duas autoridades.** A mesma lógica de assinatura/verificação existe em `src/lib/auth.ts` (Next.js, cookie `httpOnly` `rh_cursos_demo_session`) e em `supabase/functions/_shared/auth.ts` (Deno/Edge, header `x-rh-session`). O comentário no topo de `_shared/auth.ts:3-4` documenta o motivo do header: *"o cookie httpOnly não cruza o domínio do frontend → supabase.co"* — ou seja, o browser chama as Edge Functions administrativas **cross-origin** direto em `*.supabase.co`, reenviando o token no header `x-rh-session` (`getSessionToken`, `_shared/auth.ts:113`).

5. **MFA não é exigido no login (SEC-104).** O gate de QA de REC-002 registrou: MFA (TOTP) está *enrolled* na conta administrativa do Supabase Auth, mas `signInWithPassword` (`route.ts:126`) emite a sessão administrativa validando **apenas** `app_metadata.role`, sem exigir challenge AAL2. Senha sozinha (AAL1) abre sessão admin. Verificado novamente neste ADR: entre `route.ts:126` e a emissão da sessão (`:141-158`) não há checagem de `aal`/fator.

### Contexto de stack

O projeto roda Next.js sobre Cloudflare Workers (memória do go-live 2026-07-02; `deploy-frontend.yml`). O padrão SSR do Supabase (`@supabase/ssr`, cookies) é compatível com route handlers e middleware do Next e com o runtime dos Workers, e é o mecanismo oficial de sessão do Supabase. `createSupabaseServerClient` já existe (`src/lib/supabase/server.ts`, importado em `route.ts:16`).

---

## Decisão

### D1 — Supabase Auth é a única autoridade de identidade (browser e servidor). RATIFICADA

Deriva de **FR-07** e **FND-04**. A identidade, o papel e o estado de revogação passam a vir **exclusivamente** do Supabase Auth, no browser e no servidor. Consequências normativas:

- A sessão HMAC própria (`src/lib/auth.ts`) e sua cópia Edge (`supabase/functions/_shared/auth.ts`) **deixam de ser autoridade** de sessão. Nenhum novo caminho produtivo pode emitir, verificar ou confiar em token HMAC próprio.
- O papel (`role`) passa a ser resolvido a partir da fonte no servidor (Supabase Auth / `profiles`) a cada operação protegida, e **não** lido de um payload assinado no momento do login. Isso é o que torna rebaixamento/bloqueio efetivos na requisição seguinte (FR-07: "renovação, revogação e papel").
- Alinha-se a AC-17.12 (Supabase Auth única autoridade no browser e servidor) e AC-17.14 (HMAC/`localStorage`/header próprio fora do fluxo produtivo).

### D2 — Sessão via cookies SSR `httpOnly`/`secure`, não `localStorage`. RATIFICADA

Deriva de **NFR-04 (fail-closed)** e do risco confirmado no ponto 3 da evidência (`session-token.ts:13,56` grava tokens do Supabase em `localStorage`). A sessão do Supabase passa a ser mantida pelo mecanismo SSR (`@supabase/ssr`) em **cookies `httpOnly`, `secure`, `SameSite=Lax`**, gerenciados no servidor (route handlers / middleware Next), coerente com a stack Next.js/Cloudflare Workers.

- `access_token`/`refresh_token` do Supabase **não** podem mais ser persistidos em `localStorage` nem devolvidos no corpo da resposta de login (hoje em `route.ts:151-158`). Removê-los do alcance de scripts fecha o vetor de exfiltração por XSS.
- O cookie `httpOnly` existente `rh_cursos_demo_session` (HMAC) é substituído pelos cookies de sessão do Supabase; ambos os itens de `localStorage` (`rh_cursos_admin_token`, `rh_cursos_supabase_session`) são eliminados.
- O padrão de `getCookieOptions` já em uso (`httpOnly`, `secure` em produção, `SameSite=lax`, `src/lib/auth.ts:18-26`) é preservado como referência de atributos de cookie.

### D3 — Login exige AAL2 quando a conta tem MFA ativo. RATIFICADA

Deriva de **NFR-04 (fail-closed)**, **FND-04** e do finding **SEC-104**. A conta administrativa já tem MFA (TOTP) *enrolled* (REC-002), mas o login não o exige. Decisão:

- O novo fluxo de login SSR **deve exigir e verificar um challenge AAL2** para qualquer conta que possua um fator MFA ativo, **antes** de emitir a sessão administrativa. Uma sessão administrativa só é considerada válida em nível de autenticação `aal2` quando a conta tem fator ativo.
- **Fail-closed:** ausência, falha, expiração ou não-conclusão do challenge AAL2 **não** emite sessão administrativa (bloqueia; não faz downgrade silencioso para AAL1). A verificação de nível ocorre no servidor a cada operação administrativa sensível, não apenas no momento do login.
- Contas sem fator MFA seguem AAL1, mas a política operacional (AC-17.02, REC-002) já mantém MFA ativo para a conta administrativa; portanto, na prática, o admin passa a ser protegido por AAL2.
- Esta decisão fecha SEC-104 na trilha REC-201+ conforme recomendado pelo gate de REC-002. A implementação é de REC-202 (o ADR apenas fixa a regra e o comportamento fail-closed).

### D4 — Limites do BFF: operações privilegiadas resolvem no servidor; browser chama same-origin. RATIFICADA (princípio)

Deriva de **NFR-04** e da limitação confirmada no ponto 4 da evidência (browser → `*.supabase.co` cross-origin com `x-rh-session`). Princípio arquitetural fixado por este ADR:

- **Resolvido exclusivamente no servidor** (Next.js route handlers e/ou Edge Functions que validam a sessão SSR do Supabase): autenticação, emissão/renovação/revogação de sessão, resolução de papel, autorização administrativa, mutações administrativas e leituras privilegiadas de recursos administrativos.
- **Permitido ao browser diretamente:** apenas leituras públicas do catálogo sob credencial anon/RLS (escopo de REC-104) e chamadas **same-origin** ao BFF. O browser **não** deve mais chamar Edge Functions administrativas cross-origin em `*.supabase.co` reenviando um token próprio no header `x-rh-session`.
- O header próprio `x-rh-session` e o padrão cross-origin correspondente são **descontinuados**; a autorização das operações administrativas passa a depender da sessão do Supabase validada no servidor.
- **Escopo:** este ADR estabelece o *princípio*. A **consolidação do BFF canônico** (browser chama apenas same-origin; contratos duplicados removidos) é **REC-206**, story futura fora do escopo de REC-201. O ADR não implementa REC-206; apenas fixa a direção que REC-206 deve seguir e a que REC-202/REC-203 devem obedecer.

### D5 — Migração incremental (strangler), forward-only. RATIFICADA (sequência)

Deriva de **NFR-08 (roll-forward)** e do risco "Migração de auth gerar lockout" (Épica 17 §11). O ADR **registra a sequência**; não implementa nenhuma das etapas.

| Ordem | Story | Entrega (resumo da épica) | O que este ADR fixa |
|---|---|---|---|
| 1 | **REC-202** | Login/logout/refresh via cookie SSR do Supabase + AAL2 (D2, D3) | Sessão SSR passa a coexistir com o HMAC apenas por leitura, durante uma janela curta de transição |
| 2 | **REC-203** | Autorização administrativa: papel vem do servidor; rebaixamento bloqueia a requisição seguinte (D1) | Autorização passa a consultar a fonte no servidor, não o payload HMAC |
| 3 | **REC-204** | Remover HMAC, `localStorage` e header próprio; tokens legados rejeitados e código morto removido (D1, D2, D4) | Só ocorre depois que REC-202/REC-203 provarem a nova autoridade; forward-only |
| — | REC-205 | Rate limit estendido a proxy confiável + usuário autenticado + operação | Consome a identidade de D1; fora do escopo deste ADR |
| — | REC-206 | BFF canônico same-origin; contratos duplicados removidos | Consome o princípio de D4; fora do escopo deste ADR |

Regra de transição fail-closed: em nenhum momento a sessão HMAC pode voltar a ser **autoridade**; durante a janela de REC-202 ela pode, no máximo, ser aceita para leitura enquanto a sessão SSR não estiver propagada, e é removida em REC-204. Rollback que restaure o HMAC como autoridade é **proibido** (Épica 17 §9, linha "Autenticação").

### Addendum D4-A — Fronteira executável BFF → Edge no rollout de REC-204. RATIFICADA

**Data da ratificação:** 2026-07-17

**Motivo:** a preparação de REC-204 revelou uma instrução tecnicamente inexequível na story: `supabase/functions/admin-resources/index.ts`, executada no runtime Deno e no domínio do Supabase, não consegue ler o cookie `httpOnly` de sessão SSR pertencente ao domínio do Next.js, nem importar `requireServerRole()` do runtime Next. A restrição já estava implícita na evidência técnica deste ADR (ponto 4) e em D4, mas o salto BFF → Edge ainda não havia sido especificado.

Esta addendum **não altera D1–D5**. Ela torna D4 executável durante o rollout gradual de REC-204 e fixa a seguinte fronteira:

1. **A decisão de identidade e papel ocorre no BFF same-origin.** `app/api/functions/[name]/route.ts` é o componente que recebe o cookie SSR do browser e, para a conta incluída na allowlist de rollout, deve validar a sessão com `requireServerRole(..., "admin")`. O Edge não tenta ler cookie SSR e não replica essa regra de autorização.
2. **A service role autentica o canal, não o usuário.** Depois de autorizar a sessão SSR, o BFF chama `admin-resources` com a `SUPABASE_SERVICE_ROLE_KEY` já existente em `Authorization: Bearer ...` **e** `apikey`, mais identidade interna mínima derivada exclusivamente da sessão SSR validada (identificador estável e e-mail necessário ao rate limit/audit atuais). A service role não substitui Supabase Auth como autoridade de identidade e não pode ser exposta ao browser, resposta, log ou mensagem de erro.
3. **Headers internos são não confiáveis por padrão.** O BFF deve descartar quaisquer headers internos homônimos recebidos do cliente e reconstruí-los após a autorização. O Edge só pode aceitar a identidade interna quando **ambos** `Authorization` e `apikey` correspondem à `SUPABASE_SERVICE_ROLE_KEY` configurada no próprio runtime; comparação ausente ou divergente falha com `401`. Um header interno acompanhado apenas de anon key, HMAC ou bearer arbitrário nunca autoriza.
4. **Fail-closed para a conta em rollout.** A identidade de um token HMAC legado, quando verificada no BFF, pode ser usada somente para decidir que a requisição pertence a uma conta incluída na allowlist; não autoriza a operação. Se essa conta não tiver sessão SSR válida, estiver deslogada, expirada ou rebaixada, o BFF nega a requisição e **não** encaminha pelo fallback HMAC.
5. **Compatibilidade fica restrita a contas fora da allowlist.** Durante a Fase A, requisições de contas não incluídas preservam o caminho HMAC existente e seus contratos. O BFF não injeta identidade interna nesse caminho. Essa exceção transitória termina obrigatoriamente na Fase B de REC-204; ela não revoga a proibição de criar novos consumidores HMAC.
6. **A superfície Edge permanece protegida em profundidade.** `admin-resources` mantém validação de origem, lockdown, rate limit, validação de payload e audit log. No caminho interno, a chave do rate limit e o autor do audit log usam apenas a identidade entregue pelo canal BFF autenticado. A resposta do proxy continua com allowlist explícita de headers e nunca encaminha credenciais internas ao browser.

Fluxo normativo da Fase A:

```text
browser ── cookie SSR / HMAC legado ──> BFF same-origin
  ├─ conta em rollout ── requireServerRole(admin) ──> service-role + identidade interna ──> Edge
  │                        └─ falha/ausência/rebaixamento: 401/403, sem fallback
  └─ conta fora da allowlist ── contrato HMAC byte-idêntico ──> Edge (transitório)
```

**Invariantes de segurança para implementação e QA:**

- uma chamada direta do browser ao Edge não consegue produzir o caminho interno sem conhecer a service role;
- a service role isolada, sem identidade interna completa, não declara papel de usuário; a confiança na identidade anexada pressupõe custódia exclusiva dessa chave pelos runtimes server-side autorizados;
- o proxy nunca encaminha cegamente credenciais ou headers internos fornecidos pelo cliente no caminho SSR;
- configuração ausente de service role, allowlist inválida ou identidade interna incompleta falha fechado para a conta em rollout;
- a Fase B remove o fallback HMAC e a allowlist, preservando o mesmo canal BFF autenticado até REC-206 consolidar os contratos.

**Risco residual aceito:** durante a Fase A, a service role trafega entre dois componentes server-side e concede alto privilégio se exfiltrada; quem obtiver a chave poderá forjar o canal e a identidade interna. O risco é mitigado por HTTPS, armazenamento somente em secrets server-side, não propagação de resposta/log, comparação no Edge e janela curta de rollout. Usar a chave já existente evita introduzir um terceiro segredo de canal, em conformidade com Article IV (No Invention). A remoção desse acoplamento e a consolidação do BFF permanecem em REC-206.

---

## Consequências

- **Positivas:** uma única autoridade de identidade (FR-07/AC-17.12); rebaixamento/revogação efetivos na requisição seguinte (FND-04/AC-17.13); tokens fora de `localStorage` e do alcance de XSS (NFR-04); AAL2 real no admin (SEC-104 fechado); fim das duas cópias de verificação HMAC; base para o BFF canônico de REC-206.
- **Negativas / riscos:** migração de auth toca fluxo crítico de login (risco de lockout — mitigado por conta de teste, rollout reduzido e janela de compatibilidade só-leitura, Épica 17 §11); o `x-rh-session` das Edge Functions administrativas exige reroteamento para same-origin (dependência REC-206); AAL2 adiciona um passo ao login administrativo (aceito por NFR-04). O `AUTH_SESSION_SECRET`, já rotacionado em REC-002, deixa de ter função ao fim de REC-204.
- **Dependência satisfeita:** REC-201 depende de REC-002 (Done) — as credenciais e o `AUTH_SESSION_SECRET` já foram rotacionados, então o ADR pode assumir credenciais limpas.

## Alternativas rejeitadas

- **Manter HMAC próprio e apenas adicionar revogação (blocklist de tokens):** mantém duas autoridades e o `localStorage`; contraria diretamente FR-07 ("autoridade única") e não resolve o vetor de exfiltração de NFR-04. Rejeitada.
- **Sessão SSR mas mantendo tokens Supabase em `localStorage` para leitura direta sob RLS no cliente:** preserva o vetor de exfiltração por XSS confirmado em `session-token.ts:13,56`; incompatível com D2/NFR-04. Leitura direta do cliente sob RLS deve ocorrer, quando necessária, dentro dos limites de D4. Rejeitada.
- **Trocar o provedor de identidade (auth próprio "endurecido" ou terceiro):** viola Article IV (No Invention) — nenhum finding/requisito pede novo provedor; FR-07 nomeia Supabase Auth explicitamente. Rejeitada.
- **AAL2 opcional ("MFA recomendado"):** contraria NFR-04 (fail-closed) e mantém SEC-104 aberto. Rejeitada em favor de AAL2 obrigatório quando há fator ativo (D3).
- **Consolidar o BFF (REC-206) dentro desta trilha:** aumentaria o escopo de uma story de decisão; a épica separa REC-206 como story própria da Onda 4. O ADR fixa só o princípio (D4). Rejeitada como escopo de REC-201.

## Sequência de execução

| Ordem | Story | Depende de | Agentes | Papel deste ADR |
|---|---|---|---|---|
| 0 | **REC-201 (esta)** | REC-002 | `@architect` → `@po` | Registrar a decisão (D1–D5) |
| 1 | REC-202 | REC-201 | `@dev` → `@qa` | Implementa D2 + D3 |
| 2 | REC-203 | REC-202 | `@dev` → `@qa` | Implementa D1 (papel do servidor) |
| 3 | REC-204 | REC-203 | `@dev` → `@qa` | Implementa D1/D2/D4 (remoção do legado) |
| — | REC-205 | REC-107, REC-202 | `@dev` + `@devops` → `@qa` | Consome D1 |
| — | REC-206 | REC-202, REC-104 | `@dev` → `@architect` + `@qa` | Consome D4 |

Nenhuma story pode antecipar tecnologia ou autoridade de sessão fora deste ADR (Épica 17 §15, condição de execução nº5).
