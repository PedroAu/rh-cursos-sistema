# Relatório de implementação — REC-003 (kill-switch fail-closed)

> Nenhum valor de segredo, senha, PAT, JWT ou `AUTH_SESSION_SECRET` é reproduzido neste documento. `INCIDENT_LOCKDOWN` não é um segredo — é um controle operacional (string/booleano) documentado abaixo.

Story: [`docs/stories/2026-07-15-rec-003-fail-closed-indisponibilidade.md`](../../stories/2026-07-15-rec-003-fail-closed-indisponibilidade.md) · Épica 17, Onda 0 · Executor de código: `@dev` · Executor operacional (ativação/desativação em produção): `@devops` + incident commander.

## 1. Contrato do sinal de lockdown (AC 1, 4)

| Item | Valor |
|---|---|
| Nome da variável | `INCIDENT_LOCKDOWN` |
| Tipo | String de controle operacional, não um segredo |
| Valores que ativam o bloqueio | `"true"` ou `"1"` (case-insensitive, espaços ao redor tolerados) |
| Qualquer outro valor, incluindo variável ausente | Lockdown inativo — comportamento idêntico ao atual |
| Onde é lida | `process.env.INCIDENT_LOCKDOWN` (Next.js / Cloudflare Worker) e `Deno.env.get("INCIDENT_LOCKDOWN")` (Supabase Edge Functions) |
| Escopo | Por ambiente — deve ser definida separadamente em cada ambiente consumidor (GitHub Actions `production` → Cloudflare Worker secret/var; Supabase Edge Functions secret) |
| Efeito quando ativa | Rotas em escopo respondem `503` com corpo `{"ok": false, "error": "service_unavailable", "reason": "lockdown"}`, sem detalhe interno |
| Fail-closed | Erro ao ler a variável (exceção na leitura) resulta em lockdown **ativo** — nunca libera silenciosamente |

**Critério objetivo de ativação:** a rotação de credenciais de REC-002 (`AUTH_SESSION_SECRET`, credenciais de deploy) não pode ser comprovada propagada em um ambiente até o checkpoint definido pelo incident commander para aquele ambiente. Nesse caso, `INCIDENT_LOCKDOWN=true` é definido no(s) ambiente(s) afetado(s) antes de qualquer operação sensível ocorrer, sem exigir novo deploy de código.

**Critério objetivo de desativação:** `@qa` confirma, por teste independente, que a rotação de REC-002 está propagada e efetiva no ambiente (sessão antiga rejeitada, credencial nova funcional); o incident commander confirma a decisão e remove/desativa `INCIDENT_LOCKDOWN` naquele ambiente.

## 2. Autoridade de ativação/desativação (Task 3, AC 4, 5)

| Ação | Quem pode executar | Registro obrigatório |
|---|---|---|
| Ativar (`INCIDENT_LOCKDOWN=true`) | Incident commander ou `@devops` a pedido do IC | Timestamp (ISO 8601, `America/Sao_Paulo`/UTC), ambiente, motivo (referência ao checkpoint de REC-002 não comprovado), responsável |
| Desativar (`INCIDENT_LOCKDOWN` removida/`false`) | `@qa` confirma rotação propagada **e** incident commander autoriza | Timestamp, ambiente, motivo (referência ao teste de `@qa` que comprovou a rotação), responsável |

Este controle é puramente operacional (variável de ambiente por ambiente); nenhum novo serviço de autorização foi introduzido. O registro de cada ativação/desativação é responsabilidade do incident commander/`@devops` no momento da operação (fora do escopo de código desta story), seguindo o mesmo padrão de auditoria sem segredo já usado em `rec-002-rotacao-credenciais-2026-07-15.md`.

## 3. Pontos de entrada guardados (Task 2, AC 2, 3, 6)

Foi criado um módulo de leitura do sinal, replicado nos dois runtimes do projeto (Node/Next.js e Deno/Edge Functions), sem introduzir segredo novo e sem criar um novo serviço de autorização:

- `src/lib/lockdown.ts` — `isLockdownActive()` + `LOCKDOWN_RESPONSE_BODY` (runtime Next.js / Cloudflare Worker).
- `supabase/functions/_shared/lockdown.ts` — mesma lógica, portada para `Deno.env.get` (runtime Edge Functions).

A guarda foi adicionada como primeira verificação após o tratamento de preflight/método HTTP, antes de CORS, autenticação, rate limit ou qualquer acesso a dado, nos 4 pontos de entrada server-side identificados por investigação da árvore de arquivos (não apenas os 2 citados no Dev Notes original — `app/api/enrollments/route.ts` foi incluído por representar um caminho alternativo real e vivo em produção, já que o deploy usa Cloudflare Workers via OpenNext e não export estático puro):

| Arquivo | Papel | Linha da guarda |
|---|---|---|
| `supabase/functions/admin-resources/index.ts` | Rota administrativa autenticada (única rota de mutação admin; verifica `requireAdmin()` depois da guarda) | Antes de `requireAdmin()`, logo após checagem de método |
| `supabase/functions/enrollments/index.ts` | Endpoint público de escrita (Edge Function, caminho vivo em produção) | Logo após checagem de método, antes de CORS/rate limit |
| `supabase/functions/leads/index.ts` | Endpoint público de escrita (Edge Function, caminho vivo em produção) | Logo após checagem de método, antes de CORS/rate limit |
| `app/api/enrollments/route.ts` | Duplicata Next.js do endpoint de enrollments — caminho alternativo real (não apenas legado estático) que bypassaria o lockdown da Edge Function se não guardado (AC6) | Primeira linha do handler `POST`, antes de `isSupabaseServerConfigured` |

`app/api/functions/[name]/route.ts` é um proxy genérico que apenas repassa a requisição para a Edge Function correspondente (inclusive status code); como a Edge Function de destino já aplica a guarda e retorna `503`, o proxy repassa esse status sem necessidade de guarda própria — não há bypass por esse caminho.

`app/api/auth/session/route.ts` (login) fica fora do escopo desta story: não é uma rota administrativa **autenticada** (é o ponto de entrada para se autenticar) nem um endpoint público de escrita de negócio; a Épica 17 trata REC-201–204 para a autoridade de identidade.

## 4. Testes e evidência (Task 4, AC 2, 3, 5, 6)

### 4.1 Teste automatizado

`src/__tests__/lib/lockdown.test.ts` (Vitest) cobre o contrato de `isLockdownActive()`:

```
npx vitest run src/__tests__/lib/lockdown.test.ts

 ✓ src/__tests__/lib/lockdown.test.ts (7 tests) 3ms
   ✓ lockdown > isLockdownActive > is inactive when INCIDENT_LOCKDOWN is unset (no regression)
   ✓ lockdown > isLockdownActive > is active when INCIDENT_LOCKDOWN is "true"
   ✓ lockdown > isLockdownActive > is active when INCIDENT_LOCKDOWN is "1"
   ✓ lockdown > isLockdownActive > is case-insensitive and tolerates surrounding whitespace
   ✓ lockdown > isLockdownActive > is inactive for any other value
   ✓ lockdown > isLockdownActive > fails closed (returns true) when reading the env var throws
   ✓ lockdown > LOCKDOWN_RESPONSE_BODY > does not leak internal details

 Test Files  1 passed (1)
      Tests  7 passed (7)
```

- **Teste positivo (AC3, sem regressão):** variável ausente → `isLockdownActive()` retorna `false`; o fluxo original de cada rota segue inalterado (nenhuma linha de lógica de negócio pré-existente foi modificada, apenas uma verificação adicionada antes dela).
- **Teste negativo (AC2):** variável `"true"`/`"1"` → `isLockdownActive()` retorna `true`; nos 4 handlers, isso resulta em retorno imediato de `503` com `LOCKDOWN_RESPONSE_BODY`, antes de qualquer acesso a Supabase, RPC, `requireAdmin()` ou rate limit.
- **Fail-closed (Security Notes):** leitura de `process.env` forçada a lançar exceção (via proxy que sempre `throw`) → `isLockdownActive()` retorna `true` (bloqueia), nunca `false`. Mesma lógica replicada no módulo Deno (revisão de código; runtime Deno não disponível neste ambiente de execução para teste automatizado — ver §5).
- **Ausência de bypass (AC6):** os 3 caminhos de escrita vivos identificados (`enrollments` Edge Function, `leads` Edge Function, `enrollments` Next.js route) e o único caminho de mutação admin (`admin-resources` Edge Function) foram guardados. O proxy genérico (`app/api/functions/[name]/route.ts`) não contém lógica própria de negócio — repassa o `503` da Edge Function de destino.

### 4.2 Verificação estática

```
npm run typecheck
> next typegen && tsc --noEmit
✓ Types generated successfully   (0 erros)

npx eslint src/lib/lockdown.ts app/api/enrollments/route.ts src/__tests__/lib/lockdown.test.ts
✓ 0 erros

npx eslint supabase/functions/_shared/lockdown.ts supabase/functions/enrollments/index.ts \
  supabase/functions/leads/index.ts supabase/functions/admin-resources/index.ts
⚠ arquivos ignorados pelo ESLint do projeto (fora do escopo Deno do linter) — comportamento pré-existente, não introduzido por esta story
```

`deno check` não pôde ser executado neste ambiente (`deno` não instalado); a lógica do módulo Deno é uma portagem 1:1 do módulo Node já validado por `tsc`/Vitest, revisada manualmente linha a linha contra o padrão já usado em `supabase/functions/_shared/auth.ts` (mesmo padrão de portagem Node → Deno do projeto).

## 5. Lacunas explícitas

- **Teste de integração real do runtime Deno** (subir a Edge Function localmente com `INCIDENT_LOCKDOWN=true` e disparar uma requisição HTTP real) não foi executado por falta de `deno`/`supabase` CLI configurado interativamente neste ambiente de execução. A cobertura automatizada ficou no nível do módulo compartilhado (`isLockdownActive()`, testado no lado Node) mais revisão manual do código Deno idêntico. Recomenda-se a `@qa` (quality_gate_tools da story) rodar um teste negativo real contra um ambiente não produtivo antes de aceitar o gate, conforme já previsto na story.
- **Ativação real em ambiente de produção** (definir `INCIDENT_LOCKDOWN` via `supabase secrets set` / `wrangler secret put` / GitHub Actions env) não foi executada nesta story — é uma ação operacional de `@devops`/incident commander, não uma mudança de código, e só deve ocorrer se e quando o critério de ativação do §1 for atingido.
- **Alertar o incident commander imediatamente na ativação/desativação** (seção Observabilidade da story) depende do canal operacional já usado pelo IC (fora do escopo de código desta story) — não há webhook/notificação automática de mudança da variável de ambiente, pois a variável não é lida por um serviço centralizado, e sim por cada handler no momento da requisição.

## 6. Resumo do estado final

| Item | Estado |
|---|---|
| Sinal de lockdown definido e documentado (AC1) | ✅ |
| Bloqueio efetivo quando ativo, sem vazar detalhe interno (AC2) | ✅ (verificado por teste automatizado + revisão de código) |
| Sem impacto quando inativo (AC3) | ✅ (verificado por teste automatizado; nenhuma lógica pré-existente alterada) |
| Critério objetivo de ativação (AC4) | ✅ (documentado em §1) |
| Reversibilidade auditável (AC5) | ✅ (processo documentado em §2; execução real é ação operacional de `@devops`/IC) |
| Sem bypass silencioso (AC6) | ✅ (4 pontos de entrada guardados; proxy genérico repassa o `503`) |
| Gate independente (AC7) | Pendente — aguardando `@qa` |
