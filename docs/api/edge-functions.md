# Edge Functions — RH Cursos

Endpoints executados no Supabase (Deno runtime), com validação Zod e autenticação via HMAC token ou credenciais Supabase Auth.

## Overview

- **4 funções:** enrollments, leads, admin-resources, auth-session
- **Rate limiting:** por IP via Postgres RPC (`rate_limit_increment`) com fallback in-memory automático
- **CORS:** validação de header `Origin` contra allowlist estática + variáveis de ambiente
- **Response format:** `{ "ok": true, ... }` (sucesso) ou `{ "ok": false, "error": string }` (erro)
- **Runtime:** Deno + `@supabase/supabase-js@2.106.2` + `zod@4.4.3`

## Convenções Compartilhadas

### Rate Limiting

Rate limiting via Postgres (`rate_limit_increment` RPC — SECURITY DEFINER, requer `service_role` key).
Fallback automático para Map in-memory (por isolate) se o banco não responder em 300ms.

| Função | Janela | Max requests | Chave |
|--------|--------|-------------|-------|
| enrollments | 60s | 20 | `enrollment:{ip}` |
| leads | 60s | 10 | `lead:{ip}` |
| auth-session (POST) | 15min | 5 | `auth:{ip}` |
| admin-resources | 60s | 30 | `admin:{email}:{ip}` |

Resposta `429` com header `Retry-After: <seconds>`.

IP extraído em ordem de prioridade: `cf-connecting-ip` → `x-forwarded-for` (primeiro item) → `x-real-ip` → `"unknown"`.

### CORS e Origin Validation

Allowlist base (hardcoded):
- `https://rhcursos.com.br`
- `https://www.rhcursos.com.br`

Origens adicionais via variáveis de ambiente:
- `PUBLIC_APP_URL` — adiciona URL da aplicação
- `EXTRA_ALLOWED_ORIGINS` — lista separada por vírgulas
- `ALLOW_LOCALHOST=true` — adiciona `http://localhost:3000` e `http://127.0.0.1:3000`

Headers CORS retornados:
- `Access-Control-Allow-Methods: POST, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: authorization, apikey, content-type, x-rh-session`
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Max-Age: 3600`
- `Vary: Origin`

Preflight (`OPTIONS`) retorna `204 No Content` com headers CORS.
Origin não listada: `403 Origin not allowed`.

### Autenticação

| Função | Mecanismo |
|--------|-----------|
| enrollments | Nenhuma (anônimo; RLS controla acesso no banco) |
| leads | Nenhuma (anônimo; RLS permite insert) |
| auth-session POST | Body `{email, password, role}` com `role` em `admin|student|instructor` |
| auth-session DELETE | Body `{accessToken}` (opcional) |
| admin-resources | Header `x-rh-session` (token HMAC-SHA256) |

### Token de Sessão (HMAC-SHA256)

Formato: `base64url(payload).base64url(signature)`

Onde `payload = base64url(JSON.stringify({ role, email, name, exp }))`.

- `exp`: epoch ms de expiração (SESSION_TTL_MS = 30 minutos)
- Comparação de assinatura em tempo constante (proteção contra timing attacks)
- Secret: variável de ambiente `AUTH_SESSION_SECRET` (mínimo 32 caracteres, obrigatório)

---

## Endpoints

### POST /functions/v1/enrollments

**Descrição:** Criar inscrição em curso via RPC `registrar_inscricao_publica` (SECURITY DEFINER — valida turma, vagas, cria aluno e inscrição atomicamente).

**Autenticação:** Nenhuma

**Request body:**
```json
{
  "studentName": "João Silva",
  "email": "joao@example.com",
  "cpf": "123.456.789-00",
  "phone": "(11) 99999-9999",
  "courseId": "abc123",
  "classId": "turma-456",
  "jobTitle": "Gerente",
  "organization": "Acme Inc",
  "enrollmentType": "Pessoa física",
  "paymentMethod": "Pix",
  "notes": "Preferir boleto"
}
```

**Validação (Zod — enrollmentSchema):**

| Campo | Tipo | Regras |
|-------|------|--------|
| `studentName` | string | min 3, max 100 chars |
| `email` | string | email válido, normalizado para lowercase |
| `cpf` | string | formato `XXX.XXX.XXX-XX` (armazenado sem formatação) |
| `phone` | string | formato `(XX) XXXXX-XXXX` ou `(XX) XXXX-XXXX` (armazenado sem formatação) |
| `courseId` | string | min 1, max 80 chars, `[A-Za-z0-9_-]` |
| `classId` | string | min 1, max 80 chars, `[A-Za-z0-9_-]` |
| `organization` | string | max 100 chars, default `""` |
| `jobTitle` | string | max 100 chars, default `""` |
| `enrollmentType` | enum | `"Pessoa física"` \| `"Empresa"` \| `"Órgão público"`, default `"Pessoa física"` |
| `paymentMethod` | enum | `"Pix"` \| `"Cartão"` \| `"Boleto"` \| `"Empenho"`, default `"Pix"` |
| `notes` | string | max 500 chars, default `""` |

Mapeamento `enrollmentType` → `tipo_aluno` no banco:
- `"Empresa"` → `"PJ"`
- `"Órgão público"` → `"Servidor"`
- `"Pessoa física"` → `"PF"`

**Response (201 — sucesso):**
```json
{
  "ok": true,
  "enrollmentId": "uuid-da-inscricao"
}
```
Header: `X-RateLimit-Remaining: <n>`

**Response (400 — body inválido ou JSON malformado):**
```json
{
  "ok": false,
  "error": "Invalid request body"
}
```

**Response (400 — validação Zod falha):**
```json
{
  "ok": false,
  "error": "Validation failed",
  "details": { "fieldErrors": { "cpf": ["CPF deve estar no formato XXX.XXX.XXX-XX"] } }
}
```

**Response (403 — origin bloqueada):**
```json
{
  "ok": false,
  "error": "Origin not allowed"
}
```

**Response (405 — método não permitido):**
```json
{
  "ok": false,
  "error": "Method not allowed"
}
```

**Response (429 — rate limit):**
```json
{
  "ok": false,
  "error": "Muitas tentativas. Tente novamente mais tarde."
}
```
Header: `Retry-After: 60` (segundos até reset da janela)

**Response (500 — erro interno):**
```json
{
  "ok": false,
  "error": "Erro ao registrar inscrição."
}
```

---

### POST /functions/v1/leads

**Descrição:** Registrar lead comercial/consultivo. Insert direto na tabela `lead` com `status_crm = "Novo"`.

**Autenticação:** Nenhuma

**Request body:**
```json
{
  "name": "Maria Silva",
  "email": "maria@company.com",
  "phone": "(11) 98888-8888",
  "type": "Consultoria",
  "organization": "Acme Inc",
  "teamSize": 100,
  "courseInterest": "Liderança",
  "courseId": "lideranca-estrategica",
  "origin": "Especialista",
  "preferredModality": "Online ao vivo",
  "trainingObjective": "Desenvolver liderança média",
  "trainingTheme": "Comunicação e feedback",
  "mainChallenges": "Gestores recém-promovidos",
  "message": "Interessado em programa corporativo"
}
```

**Validação:** campos obrigatórios verificados diretamente no handler — `name`, `email`, `courseInterest`, `origin`. Os demais (`phone`, `type`, `organization`, `teamSize`, `courseId`, `preferredModality`, `trainingObjective`, `trainingTheme`, `mainChallenges`, `message`) são opcionais e armazenados como-estão.

Mapeamento para tabela `lead`:

| Campo JS | Coluna DB |
|----------|-----------|
| `name` | `nome` |
| `email` | `email` |
| `phone` | `telefone` |
| `type` | `tipo` |
| `organization` | `orgao` |
| `teamSize` | `num_participantes` |
| `courseInterest` | `tema_interesse` |
| `courseId` | `curso_id` |
| `origin` | `origem` |
| `preferredModality` | `modalidade_preferida` |
| `trainingObjective` | `objetivo_treinamento` |
| `trainingTheme` | `tema_treinamento` |
| `mainChallenges` | `desafios_principais` |
| `message` | `mensagem` |
| (fixo) | `status_crm = "Novo"` |

Normalização de `type` antes do insert:
- `"Consultoria"` -> `"Mentoria"`
- `"Orçamento"` -> `"Orcamento"`
- Demais valores (`Curso`, `InCompany`, `Newsletter`, `Contato`) seguem como vieram

**Response (201 — sucesso):**
```json
{
  "ok": true
}
```

**Response (400 — campos obrigatórios ausentes):**
```json
{
  "ok": false,
  "error": "Campos obrigatórios ausentes."
}
```

**Response (403 — origin bloqueada):**
```json
{
  "ok": false,
  "error": "Origin not allowed"
}
```

**Response (429 — rate limit):**
```json
{
  "ok": false,
  "error": "Muitas tentativas. Tente novamente mais tarde."
}
```
Header: `Retry-After: 60`

**Response (500 — erro interno):**
```json
{
  "ok": false,
  "error": "Erro ao criar lead."
}
```

---

### POST /functions/v1/admin-resources

**Descrição:** Mutações administrativas (CRUD) para 7 recursos. Usa `adminClient()` (service_role — ignora RLS). Registra audit log assíncrono em `admin_audit_log` (não bloqueia a resposta, sanitiza campos sensíveis: `cpf`, `password`, `token`, `secret`).

**Autenticação:** Header `x-rh-session` obrigatório (token HMAC-SHA256, TTL 30 min)

**Resources suportados:** `courses`, `classes`, `students`, `enrollments`, `instructors`, `leads`, `blog`

**Mapeamento resource → tabela DB:**

| Resource | Tabela |
|----------|--------|
| `courses` | `curso` |
| `classes` | `turma` |
| `students` | `aluno` |
| `enrollments` | `inscricao` |
| `instructors` | `instrutor` |
| `leads` | `lead` |
| `blog` | `post_blog` |

**Actions disponíveis:**

| Action | Descrição | Suporte por resource |
|--------|-----------|---------------------|
| `list` | Lista todos os registros (soft-deleted excluídos) | `leads` (outros: `skipped: true`) |
| `upsert` | Cria ou atualiza (requer `payload`) | courses, classes, students, instructors, blog, leads |
| `delete` | Soft-delete via `deleted_at` | courses, classes, instructors, blog |
| `update-status` | Atualiza campo de status | leads (`status_crm`), enrollments (`status_inscricao`) |

**Request body — upsert course:**
```json
{
  "resource": "courses",
  "action": "upsert",
  "payload": {
    "id": "uuid-opcional",
    "title": "Liderança Estratégica",
    "slug": "lideranca-estrategica",
    "description": "Treinamento avançado de liderança...",
    "instructor_id": "uuid-instructor",
    "price": 1000,
    "duration_hours": 40,
    "is_published": true
  }
}
```

**Request body — delete:**
```json
{
  "resource": "courses",
  "action": "delete",
  "id": "uuid-course-to-delete"
}
```

**Request body — update-status lead:**
```json
{
  "resource": "leads",
  "action": "update-status",
  "id": "uuid-lead",
  "status": "contacted"
}
```

**Request body — update-status enrollment:**
```json
{
  "resource": "enrollments",
  "action": "update-status",
  "id": "uuid-inscricao",
  "status": "Confirmado"
}
```

**Request body — list:**
```json
{
  "resource": "leads",
  "action": "list"
}
```

**Response (200 — sucesso):**
```json
{
  "ok": true,
  "skipped": false,
  "data": { "...": "..." }
}
```

**Response (200 — list de leads):**
```json
{
  "ok": true,
  "skipped": false,
  "data": [
    { "id": "uuid", "nome": "Maria Silva", "status_crm": "Novo", "..." : "..." }
  ]
}
```

**Response (400 — mutation inválida — resource ou action ausente):**
```json
{
  "ok": false,
  "error": "Mutação inválida."
}
```

**Response (401 — token ausente ou inválido):**
```json
{
  "ok": false,
  "error": "Não autorizado."
}
```

**Response (403 — origin bloqueada):**
```json
{
  "ok": false,
  "error": "Origin not allowed"
}
```

**Response (422 — validação de payload falha):**
```json
{
  "ok": false,
  "error": "Mensagem do erro de validação Zod"
}
```

**Response (429 — rate limit):**
```json
{
  "ok": false,
  "error": "Muitas requisições. Aguarde um momento."
}
```
Header: `Retry-After: <seconds>`

**Response (500 — erro de banco):**
```json
{
  "ok": false,
  "error": "Mensagem do erro do Supabase"
}
```

---

### POST /functions/v1/auth-session

**Descrição:** Login administrativo. Autentica via `supabase.auth.signInWithPassword()`, verifica `app_metadata.role === "admin"`, e retorna token HMAC assinado + sessão Supabase.

**Autenticação:** Nenhuma (body contém credenciais)

**Request body:**
```json
{
  "email": "admin@rhcursos.com.br",
  "password": "securepass123",
  "role": "admin"
}
```

Todos os campos obrigatórios. `role` deve ser exatamente `"admin"` (única role suportada).

**Response (200 — sucesso):**
```json
{
  "ok": true,
  "session": {
    "role": "admin",
    "email": "admin@rhcursos.com.br",
    "name": "Admin"
  },
  "token": "base64url_payload.base64url_signature",
  "supabaseSession": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "..."
  }
}
```

`supabaseSession` pode ser `null` se Supabase não retornar sessão.

`session.name` = `user_metadata.name` do Supabase Auth, ou fallback para parte local do email.

**Response (400 — campos ausentes ou role inválida):**
```json
{
  "ok": false,
  "error": "Dados de login invalidos."
}
```

**Response (401 — credenciais incorretas):**
```json
{
  "ok": false,
  "error": "Credenciais invalidas."
}
```

**Response (403 — usuário autenticado mas sem role admin em `app_metadata`):**
```json
{
  "ok": false,
  "error": "Acesso nao autorizado."
}
```

**Response (429 — rate limit):**
```json
{
  "ok": false,
  "error": "Muitas tentativas. Tente novamente mais tarde."
}
```
Header: `Retry-After: 900` (15 minutos)

**Response (500 — erro interno):**
```json
{
  "ok": false,
  "error": "Erro na autenticacao."
}
```

**Response (503 — Supabase não configurado):**
```json
{
  "ok": false,
  "error": "Auth indisponivel."
}
```

---

### DELETE /functions/v1/auth-session

**Descrição:** Logout administrativo. Tenta revogar todas as sessões do usuário no Supabase (global signout). Sempre retorna `ok: true` — logout nunca falha do ponto de vista do cliente.

**Autenticação:** Nenhuma (accessToken no body é opcional)

**Request body:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 — sempre sucesso):**
```json
{
  "ok": true
}
```

**Comportamento:**
- Com `accessToken` + `SUPABASE_SERVICE_ROLE_KEY` configurada: chama `admin.auth.admin.signOut(accessToken, "global")` revogando TODAS as sessões do usuário e responde `mode: "global", revoked: true`
- Com `accessToken` mas sem `SUPABASE_SERVICE_ROLE_KEY`: responde `mode: "local-only", revoked: false`
- Sem `accessToken`: responde `mode: "local-only", revoked: false`
- Se a revogação Supabase falhar: erro é logado mas response ainda é `{ ok: true }` (fallback gracioso)

**Nota:** Rate limit NÃO aplicado no DELETE — logout sempre deve ser permitido.

---

## Fluxo de Autenticação Administrativo

1. **Login:** Frontend envia `POST /functions/v1/auth-session` com `{email, password, role: "admin"}`
2. **Validação:** Edge Function autentica no Supabase Auth e verifica `app_metadata.role === "admin"`
3. **Response:** `{ ok: true, token, session, supabaseSession }`
4. **Armazenamento:** Frontend armazena `token` para uso nos headers e `supabaseSession` para reidratação do cliente Supabase JS
5. **Reidratação:** `supabase.auth.setSession(supabaseSession)` — habilita leitura direta via RLS (`is_admin`)
6. **Requisições admin:** envia `x-rh-session: {token}` em toda chamada para `admin-resources`
7. **Validação do token:** `admin-resources` chama `requireAdmin(request)` → `decodeSession()` → verifica HMAC e TTL
8. **Logout:** `DELETE /functions/v1/auth-session` com `{accessToken}` do Supabase → revogação global

---

## Variáveis de Ambiente

| Variável | Função | Obrigatório |
|----------|--------|-------------|
| `SUPABASE_URL` | URL do projeto Supabase | Sim |
| `SUPABASE_ANON_KEY` | Chave anônima (client-side RLS) | Sim |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service_role (ignora RLS) | Para admin-resources e rate limit Postgres |
| `AUTH_SESSION_SECRET` | Secret HMAC (min 32 chars) | Sim (obrigatório para auth-session e admin-resources) |
| `PUBLIC_APP_URL` | URL adicional na allowlist CORS | Não |
| `EXTRA_ALLOWED_ORIGINS` | Origins adicionais (vírgula) | Não |
| `ALLOW_LOCALHOST` | Habilita localhost:3000 na allowlist | Não (dev only) |

---

## Comparação: Route Handlers vs Edge Functions

| Aspecto | Route Handlers | Edge Functions |
|---------|----------------|----------------|
| Runtime | Node.js (dev) / Cloudflare Workers (prod) | Deno + Supabase |
| Base path | `/api/*` | `/functions/v1/*` |
| Autenticação | Cookie HttpOnly | Token no body + header `x-rh-session` |
| CORS | Built-in Next.js | Manual via `_shared/cors.ts` |
| Rate limit | Por IP | Por IP via Postgres + fallback in-memory |
| Validação | Zod em `src/lib/validation.ts` | Zod em `supabase/functions/_shared/validation.ts` |
| Razão da diferença | Cookies HttpOnly não cruzam domínio estático → functions; token no header resolve o cross-origin | — |

---

## Troubleshooting

| Sintoma | Causa provável | Solução |
|---------|---------------|---------|
| `403 Origin not allowed` | Frontend rodando em origin não listada na allowlist | Adicione a origin em `EXTRA_ALLOWED_ORIGINS` ou `ALLOW_LOCALHOST=true` para dev |
| `401 Não autorizado` (admin-resources) | Header `x-rh-session` ausente, token expirado (>30min) ou assinatura inválida | Refaça login via `POST /functions/v1/auth-session` e use o novo token |
| `403 Acesso nao autorizado` (auth-session POST) | Usuário existe mas `app_metadata.role` não é `"admin"` | Configure `app_metadata` via Supabase Auth Admin (`supabase.auth.admin.updateUserById`) |
| `429 rate limit exceeded` (auth) | Mais de 5 tentativas de login em 15 minutos do mesmo IP | Aguarde o tempo indicado em `Retry-After` (max 900 segundos) |
| `429 rate limit exceeded` (outros) | Threshold de requisições atingido | Aguarde `Retry-After` |
| `503 Auth indisponivel` | `SUPABASE_URL` ou `SUPABASE_ANON_KEY` não configurados no ambiente Supabase | Verifique secrets no Supabase Dashboard → Project Settings → Edge Functions |
| Rate limit sempre passa | `SUPABASE_SERVICE_ROLE_KEY` não configurada | Rate limit cai no fallback in-memory (por isolate, reiniciado a cada cold start) |
| Logout não revoga sessões globalmente | `SUPABASE_SERVICE_ROLE_KEY` ausente ou `isAdminConfigured = false` | Configure `SUPABASE_SERVICE_ROLE_KEY` nos secrets da Edge Function |
| Audit log falha silenciosamente | Tabela `admin_audit_log` ausente ou permissão insuficiente | Verifique se a migration que cria `admin_audit_log` foi aplicada; `adminClient()` usa service_role |
