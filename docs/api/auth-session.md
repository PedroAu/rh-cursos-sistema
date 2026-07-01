# Route Handlers — RH Cursos

Endpoints executados no Next.js (Node.js em dev, Cloudflare Workers em prod).

## Overview

Atualmente, um único Route Handler:
- **GET /api/auth/session** — sincroniza a sessão autenticada e renova o token quando necessário
- **POST /api/auth/session** — login por perfil (`admin`, `student`, `instructor`)
- **DELETE /api/auth/session** — logout (revoga sessões)

Todos implementados em `app/api/auth/session/route.ts`.

## Convenções

### Rate Limiting
- Limite por IP (mesmo que Edge Functions)
- Configuração: `rateLimitConfigs.auth` — **5 tentativas / 15 minutos**
- Resposta `429` com header `Retry-After: <seconds>`

### Autenticação & Cookies
- Login: autentica contra Supabase Auth via `{ email, password, role }`
- Sessão: cookie HttpOnly `SESSION_COOKIE` (assinado com `AUTH_SESSION_SECRET`)
- Segurança: `Secure` apenas em produção (`NODE_ENV === "production"`), `SameSite=Lax`, `path=/`
- TTL: `SESSION_TTL_MS` — **30 minutos** (padrão)
- Rotação deslizante: atividade autenticada renova o cookie/token quando restam **5 minutos ou menos** para expiração

### Response Format
- Sucesso: `{ "ok": true, ... }`
- Erro: `{ "ok": false, "error": "descrição" }`

---

## Endpoints

### GET /api/auth/session

**Descrição:** Sincroniza a sessão autenticada atual e reaproveita ou rotaciona o token HMAC sem quebrar o SSR das áreas autenticadas (`/admin`, `/aluno`, `/instrutor`)

**Método:** `GET`

**Autenticação:** Cookie `SESSION_COOKIE`

**Comportamento:**
- valida o cookie assinado e o campo `exp`
- retorna `401` se a sessão estiver ausente, inválida ou expirada
- devolve o token atual quando a sessão ainda está saudável
- emite um novo token/cookie quando a sessão entra na janela de renovação

**Response (200 — sessão válida):**
```json
{
  "ok": true,
  "session": {
    "role": "student",
    "email": "admin@rhcursos.com.br",
    "name": "Maria"
  },
  "token": "eyJ...",
  "rotated": false,
  "supabaseSession": null
}
```

**Response (200 — sessão renovada):**
```json
{
  "ok": true,
  "session": {
    "role": "instructor",
    "email": "admin@rhcursos.com.br",
    "name": "Carlos"
  },
  "token": "eyJ...novo",
  "rotated": true,
  "supabaseSession": null
}
```

**Cookie set quando `rotated = true`:**
- Nome: `SESSION_COOKIE` — `"rh_cursos_demo_session"`
- Valor: novo `token`
- Flags: `HttpOnly`, `SameSite=Lax`, `path=/`
- `Max-Age`: `1800` segundos

**Response (401 — sessão inválida/expirada):**
```json
{
  "ok": false,
  "error": "Sessao invalida ou expirada."
}
```

### POST /api/auth/session

**Descrição:** Login por perfil — autentica contra Supabase e cria sessão local compatível com os portais autenticados

**Método:** `POST`

**Autenticação:** Nenhuma (body contém credenciais)

**Request body:**
```json
{
  "email": "admin@rhcursos.com.br",
  "password": "securepass123",
  "role": "student"
}
```

**Campos:**
- `email` (string, obrigatório) — email da conta Supabase Auth
- `password` (string, obrigatório) — senha da conta
- `role` (string, obrigatório) — função desejada; valores aceitos: `"admin"`, `"student"`, `"instructor"`

**Response (200 — sucesso):**
```json
{
  "ok": true,
  "session": {
    "role": "student",
    "email": "aluna@rhcursos.com.br",
    "name": "Ana"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHJoY3Vyc29zLmNvbS5iciIsIm5hbWUiOiJBZG1pbiIsImlhdCI6MTcxODk0MzYwMCwiZXhwIjoxNzE5MDMwMDAwfQ.SIGNATURE",
  "rotated": false,
  "supabaseSession": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
}
```

**Header adicional:**
- `x-rh-dashboard-path` — rota padrão para redirecionamento pós-login (`/admin`, `/aluno` ou `/instrutor`)

> **Nota:** `supabaseSession` pode ser `null` se o Supabase não retornar sessão (edge case).

> **Nota:** O campo `name` em `session` é lido de `user_metadata.name`. Se ausente, usa o prefixo do email (ex: `"admin"` para `admin@rhcursos.com.br`).

**Cookie set:**
- Nome: `SESSION_COOKIE` — `"rh_cursos_demo_session"`
- Valor: `token` (JWT assinado)
- Flags: `HttpOnly`, `SameSite=Lax`, `path=/`
- `Secure`: apenas em produção (`NODE_ENV === "production"`)
- Duração: `SESSION_TTL_MS` — **30 minutos** (1800000ms)

---

**Response (400 — dados inválidos):**
```json
{
  "ok": false,
  "error": "Dados de login invalidos."
}
```

**Trigger:**
- `email`, `password` ou `role` faltando no body
- `role` não pertence ao conjunto permitido (`admin`, `student`, `instructor`)

---

**Response (401 — credenciais erradas):**
```json
{
  "ok": false,
  "error": "Credenciais invalidas."
}
```

**Trigger:**
- Supabase Auth retorna erro (`result.error` não nulo)
- `result.data.user` é `null`

---

**Response (403 — acesso negado):**
```json
{
  "ok": false,
  "error": "Acesso nao autorizado."
}
```

**Trigger:**
- Usuário autenticado no Supabase, mas `app_metadata.role` é `null`
- Usuário autenticado, porém o `app_metadata.role` não coincide com o `role` solicitado no login

---

**Response (429 — rate limit):**
```json
{
  "ok": false,
  "error": "Muitas tentativas. Tente novamente mais tarde."
}
```

**Headers:**
```
Retry-After: 900
```

**Trigger:**
- IP excede 5 tentativas dentro da janela de 15 minutos (`rateLimitConfigs.auth`)

---

**Response (503 — serviço indisponível):**
```json
{
  "ok": false,
  "error": "Auth indisponivel."
}
```

**Trigger:**
- `NEXT_PUBLIC_SUPABASE_URL` ou `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` não configuradas (`isSupabaseServerConfigured` retorna `false`)
- `createSupabaseServerClient()` retorna `null`

---

### DELETE /api/auth/session

**Descrição:** Logout administrativo — tenta revogar sessões Supabase globalmente e sempre limpa o cookie local

**Método:** `DELETE`

**Autenticação:** Cookie `SESSION_COOKIE` (lido implicitamente pelo browser)

**Request body (opcional):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Campo:**
- `accessToken` (string, opcional) — Supabase `access_token` retornado pelo POST anterior
  - Se fornecido e `SUPABASE_SERVICE_ROLE_KEY` configurado: revoga TODAS as sessões do usuário (global signout via `supabaseAdmin.auth.admin.signOut(token, "global")`)
  - Se omitido ou `supabaseAdmin` não disponível: apenas limpa o cookie local

**Response (200 — sucesso com revogação global confirmada):**
```json
{
  "ok": true,
  "mode": "global",
  "revoked": true
}
```

**Response (200 — sucesso com fallback local-only):**
```json
{
  "ok": true,
  "mode": "local-only",
  "revoked": false
}
```

**Comportamento:**
1. Se `accessToken` fornecido e `supabaseAdmin` disponível:
   - Aplica rate limit específico no ramo de revogação global (`authGlobalLogout`: 5 tentativas / 1 minuto por IP)
   - Limita a espera da chamada externa de revogação a uma janela curta
   - Chama `supabaseAdmin.auth.admin.signOut(accessToken, "global")`
   - Se funcionar: responde `mode: "global"` e `revoked: true`
   - Se falhar, exceder rate limit ou expirar no timeout: loga erro, segue para limpar cookie e responde `mode: "local-only"`
2. Limpa cookie `SESSION_COOKIE`:
   - `Set-Cookie: rh_cursos_demo_session=; Max-Age=0; path=/; ...`
3. Retorna `mode: "global"` ou `mode: "local-only"` para o cliente distinguir o resultado

**Cookie cleared:**
- Nome: `SESSION_COOKIE` — `"rh_cursos_demo_session"`
- Valor: `""` (vazio)
- `Max-Age: 0` (expira imediatamente)
- Mesmos flags do cookie original (`HttpOnly`, `SameSite=Lax`, `path=/`, `Secure` em prod)

**Fallback & Resiliência:**
- Logout NUNCA falha — retorna `200 + ok: true` mesmo se revogação Supabase falhar
- `mode: "global"` significa que a revogação via service role foi confirmada
- `mode: "local-only"` significa que só a limpeza local pôde ser garantida
- Cookie é SEMPRE limpo, independente de erros de revogação
- Erros de revogação são logados via `console.error` para observabilidade

## Fluxo de Autenticação

```
1. Frontend: POST /api/auth/session
   ↓
2. Server: Verifica rate limit por IP
   ↓
3. Server: Valida credenciais contra Supabase Auth
   ↓
4. Server: Verifica app_metadata.role === "admin"
   ↓
5. Server: Cria JWT assinado (token) + retorna session + cookie
   ↓
6. Browser: Armazena cookie (HttpOnly, automático)
   ↓
7. Admin autenticado: sincroniza sessão via GET /api/auth/session em foco/visibilidade/atividade
   ↓
8. Server: reutiliza ou renova o token/cookie quando a expiração entra na janela de 5 minutos
   ↓
9. Frontend: DELETE /api/auth/session (com accessToken opcional)
   ↓
10. Server: Revoga Supabase (se accessToken) + limpa cookie
   ↓
11. Browser: Cookie removido, logout completo
```

---

## Variáveis de Ambiente

| Variável | Descrição | Obrigatória? |
|----------|-----------|-------------|
| `AUTH_SESSION_SECRET` | Chave HMAC para assinar JWT (mín. 32 chars) | Sim em produção; fallback inseguro em dev |
| `SESSION_TTL_MS` | Não configurável via env — hardcoded em `src/lib/auth.ts` (30 min) | — |
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública do Supabase | Sim |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anon key do Supabase | Sim |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (para revogar sessões globalmente) | Não (fallback: logout local-only) |

---

## Rate Limiting Detail

**Configuração:** `rateLimitConfigs.auth` em `src/lib/rate-limit.ts`

```typescript
auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 }
// 5 tentativas por 15 minutos por IP
```

**Como funciona:**
1. Cliente faz `POST /api/auth/session`
2. Server extrai IP via `clientIp(request)` (suporta `X-Forwarded-For` e headers Cloudflare como `cf-connecting-ip`)
3. Chama `checkRateLimit(\`auth:${ip}\`, rateLimitConfigs.auth)`
4. Se limite excedido: retorna `429` com `Retry-After` em segundos até o reset da janela
5. Cliente aguarda o tempo indicado antes de tentar novamente

**Logout global (ramo opcional do DELETE):**
```typescript
authGlobalLogout: { windowMs: 60 * 1000, maxRequests: 5 }
// 5 tentativas de revogação global por 1 minuto por IP
```

---

## Exemplo de Fluxo Completo

### Login (POST)

**Requisição:**
```bash
curl -X POST http://localhost:3000/api/auth/session \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rhcursos.com.br",
    "password": "securepass123",
    "role": "admin"
  }'
```

**Resposta (200):**
```json
{
  "ok": true,
  "session": {
    "role": "admin",
    "email": "admin@rhcursos.com.br",
    "name": "Admin"
  },
  "token": "eyJ...",
  "supabaseSession": {
    "access_token": "eyJ...",
    "refresh_token": "xxxxx"
  }
}
```

**Cookie:**
```
Set-Cookie: rh_cursos_demo_session=eyJ...; HttpOnly; SameSite=Lax; path=/; Max-Age=1800
```

> Em produção, o header inclui `Secure`.

---

### Sync / Rotation (GET)

**Requisição:**
```bash
curl http://localhost:3000/api/auth/session \
  --cookie "rh_cursos_demo_session=eyJ..."
```

**Resposta (200, sem rotação):**
```json
{
  "ok": true,
  "session": {
    "role": "admin",
    "email": "admin@rhcursos.com.br",
    "name": "Admin"
  },
  "token": "eyJ...",
  "rotated": false,
  "supabaseSession": null
}
```

**Resposta (200, com rotação):**
```json
{
  "ok": true,
  "session": {
    "role": "admin",
    "email": "admin@rhcursos.com.br",
    "name": "Admin"
  },
  "token": "eyJ...novo",
  "rotated": true,
  "supabaseSession": null
}
```

---

### Logout (DELETE)

**Requisição:**
```bash
curl -X DELETE http://localhost:3000/api/auth/session \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "eyJ..."
  }' \
  --cookie "rh_cursos_demo_session=eyJ..."
```

**Resposta (200):**
```json
{
  "ok": true,
  "mode": "global",
  "revoked": true
}
```

**Cookie:**
```
Set-Cookie: rh_cursos_demo_session=; Max-Age=0; path=/; HttpOnly; SameSite=Lax
```

---

## Troubleshooting

| Sintoma | Causa | Solução |
|---------|-------|---------|
| Login retorna `503 Auth indisponivel` | `NEXT_PUBLIC_SUPABASE_URL` ou `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` não configuradas | Copie `.env.example` → `.env.local` e preencha as variáveis |
| Login retorna `429` | Rate limit — 5 tentativas em 15 min por IP | Aguarde o tempo indicado em `Retry-After` (em segundos) |
| Login retorna `401 Credenciais invalidas` | Email/password incorretos | Verifique credenciais no Supabase Auth dashboard |
| Login retorna `403 Acesso nao autorizado` | Usuário autenticado, mas `app_metadata.role` não é `"admin"` | Configure `app_metadata.role = "admin"` no Supabase para o usuário |
| Cookie não persiste no browser | Em dev local (`http://`), o cookie não tem flag `Secure` | Cookie deve funcionar normalmente; verifique DevTools → Application → Cookies |
| Cookie com `Secure` rejeitado em dev | Testando via HTTPS local ou proxy | Use `http://localhost:3000` diretamente; flag `Secure` só ativa em produção |
| Logout não revoga sessão Supabase | `SUPABASE_SERVICE_ROLE_KEY` não configurada | Configure em `.env.local`; sem ela o logout é local-only (cookie limpo) |
| Token JWT inválido após restart | `AUTH_SESSION_SECRET` diferente ou ausente entre deploys | Garanta que `AUTH_SESSION_SECRET` é uma string fixa e idêntica em todos os ambientes |
| `name` no session mostra prefixo do email | `user_metadata.name` não definido no Supabase | Atualize o campo `name` em `user_metadata` no Supabase Auth dashboard |
