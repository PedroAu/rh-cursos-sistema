# Edge Functions — RH Cursos

Endpoints executados no Supabase (Deno runtime), com validação Zod e identidade administrativa Supabase SSR encaminhada pelo BFF.

## Overview

- **3 funções:** enrollments, leads e admin-resources
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
- `ALLOW_LOCALHOST=true` — adiciona `http://localhost:3000`, `http://127.0.0.1:3000` e `http://[::1]:3000` apenas em dev/test

Headers CORS retornados:
- `Access-Control-Allow-Methods: POST, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: authorization, apikey, content-type, x-rh-ssr-admin-id, x-rh-ssr-admin-email`
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Max-Age: 3600`
- `Vary: Origin`

Nota: quando a origem não está na allowlist, a função ainda devolve um `Access-Control-Allow-Origin` de fallback estável junto com `Allow-Credentials: true`. Isso é intencional; o browser bloqueia o acesso porque a origem da resposta não casa com a origem chamadora.

Preflight (`OPTIONS`) retorna `204 No Content` com headers CORS.
Origin não listada: `403 Origin not allowed`.

### Autenticação

| Função | Mecanismo |
|--------|-----------|
| enrollments | Nenhuma (anônimo; RLS controla acesso no banco) |
| leads | Nenhuma (anônimo; RLS permite insert) |
| admin-resources | Identidade SSR encaminhada pelo BFF, autenticada com `service_role` server-side |

O verificador HMAC e a Edge Function `auth-session` foram removidos no cutover
REC-204. Requisições que tentem usar `x-rh-session` falham fechado.

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

**Autenticação:** chamada interna do BFF com `service_role` e identidade SSR
validada por `requireTrustedSsrAdmin`; chamadas diretas do browser falham fechado.

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

## Fluxo de Autenticação Administrativo

1. **Login:** frontend usa `POST /api/auth/ssr-session`; cookies Supabase são `httpOnly`.
2. **Autorização:** o BFF lê a sessão SSR e exige papel `admin` no servidor.
3. **Requisições admin:** o browser chama `/api/functions/admin-resources` same-origin.
4. **Encaminhamento:** o BFF usa `service_role` e headers internos de identidade SSR.
5. **Validação:** `admin-resources` aceita apenas `requireTrustedSsrAdmin`; HMAC legado falha com `401`.
6. **Logout:** frontend usa `DELETE /api/auth/ssr-session`.

---

## Variáveis de Ambiente

| Variável | Função | Obrigatório |
|----------|--------|-------------|
| `SUPABASE_URL` | URL do projeto Supabase | Sim |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service_role (ignora RLS) | Para admin-resources e rate limit Postgres |
| `PUBLIC_APP_URL` | URL adicional na allowlist CORS | Não |
| `EXTRA_ALLOWED_ORIGINS` | Origins adicionais (vírgula) | Não |
| `ALLOW_LOCALHOST` | Habilita localhost:3000 na allowlist | Não (dev only) |

---

## Comparação: Route Handlers vs Edge Functions

| Aspecto | Route Handlers | Edge Functions |
|---------|----------------|----------------|
| Runtime | Node.js (dev) / Cloudflare Workers (prod) | Deno + Supabase |
| Base path | `/api/*` | `/functions/v1/*` |
| Autenticação | Cookie Supabase SSR HttpOnly | Identidade SSR confiável encaminhada pelo BFF |
| CORS | Built-in Next.js | Manual via `_shared/cors.ts` |
| Rate limit | Por IP | Por IP via Postgres + fallback in-memory |
| Validação | Zod em `src/lib/validation.ts` | Zod em `supabase/functions/_shared/validation.ts` |
| Razão da diferença | Browser permanece same-origin; credenciais SSR não são expostas | Edge administrativa é interna ao BFF |

---

## Troubleshooting

| Sintoma | Causa provável | Solução |
|---------|---------------|---------|
| `403 Origin not allowed` | Frontend rodando em origin não listada na allowlist | Adicione a origin em `EXTRA_ALLOWED_ORIGINS` ou `ALLOW_LOCALHOST=true` para dev |
| `401 Não autorizado` (admin-resources) | Chamada fora do BFF ou identidade SSR ausente | Autentique em `/api/auth/ssr-session` e use o proxy same-origin |
| `429 rate limit exceeded` (outros) | Threshold de requisições atingido | Aguarde `Retry-After` |
| Rate limit sempre passa | `SUPABASE_SERVICE_ROLE_KEY` não configurada | Rate limit cai no fallback in-memory (por isolate, reiniciado a cada cold start) |
| Audit log falha silenciosamente | Tabela `admin_audit_log` ausente ou permissão insuficiente | Verifique se a migration que cria `admin_audit_log` foi aplicada; `adminClient()` usa service_role |
