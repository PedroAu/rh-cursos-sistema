# Deploy Híbrido — Site estático (Locaweb) + Backend (Supabase Edge Functions)

## Arquitetura

```
┌─────────────────────────┐         ┌──────────────────────────────┐
│  Locaweb (FTP/estático)  │  HTTPS  │   Supabase Edge Functions     │
│  Next.js static export   │ ──────► │   (backend serverless)        │
│  out/ → /public_html/    │         │   /functions/v1/...           │
└─────────────────────────┘         └──────────────┬───────────────┘
         frontend                                   │ service-role / RPC
                                                     ▼
                                          ┌────────────────────┐
                                          │  Postgres (Supabase)│
                                          │  + RLS + RPC        │
                                          └────────────────────┘
```

- **Frontend**: HTML/CSS/JS estáticos na Locaweb (sem Node.js no servidor).
- **Backend**: 4 Edge Functions no Supabase substituem as antigas rotas `app/api/*`.

## Edge Functions

| Function | Substitui | Auth | Responsabilidade |
|----------|-----------|------|------------------|
| `leads` | `/api/leads` | público (origin + rate-limit) | cria lead |
| `enrollments` | `/api/enrollments` | público (Zod + rate-limit) | RPC `registrar_inscricao_publica` |
| `auth-session` | `/api/auth/session` | público (rate-limit) | login admin → token HMAC |
| `admin-resources` | `/api/admin/resources` | admin (token HMAC `x-rh-session`) | mutações com service-role |

### Autenticação admin (cross-origin)

Como o site (Locaweb) e o backend (supabase.co) estão em domínios distintos,
cookies `httpOnly` não cruzam a fronteira. Por isso:

1. `auth-session` valida via Supabase Auth e devolve um **token HMAC no corpo**.
2. O frontend guarda em `localStorage` (`rh_cursos_admin_token`).
3. Chamadas admin reenviam o token via header `x-rh-session`.
4. `admin-resources` valida o HMAC antes de usar a service-role.

> ⚠️ O role admin é exigido nos `user_metadata` do Supabase Auth — o cliente
> não pode escalar privilégio pedindo `role: admin`.

## Variáveis de ambiente

### Frontend (build estático — GitHub Secrets / `.env`)
```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_<sua-chave>
# opcional: NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL
```

### Edge Functions (Supabase secrets)
```
AUTH_SESSION_SECRET=<32+ chars>      # mesma usada no frontend legado
PUBLIC_APP_URL=https://www.rhcursos.com.br
# SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY → injetadas pelo runtime
```

## Deploy

### Backend (Edge Functions)
Automático via [.github/workflows/deploy-functions.yml](.github/workflows/deploy-functions.yml)
quando há mudanças em `supabase/functions/**`. Manualmente:

```bash
supabase link --project-ref <ref>
supabase secrets set AUTH_SESSION_SECRET="..." PUBLIC_APP_URL="https://www.rhcursos.com.br"
supabase functions deploy leads
supabase functions deploy enrollments
supabase functions deploy auth-session
supabase functions deploy admin-resources
```

### Frontend (estático)
Inalterado — via [.github/workflows/deploy.yml](.github/workflows/deploy.yml) (FTP → Locaweb).

## Secrets necessários no GitHub

| Secret | Uso |
|--------|-----|
| `SUPABASE_ACCESS_TOKEN` | CLI do Supabase no CI |
| `SUPABASE_PROJECT_REF` | ref do projeto |
| `AUTH_SESSION_SECRET` | assinatura HMAC (frontend + functions) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | build estático |
| `FTP_HOST` / `FTP_USER` / `FTP_PASSWORD` | deploy Locaweb |

## Teste local das functions

```bash
supabase start
supabase functions serve --env-file .env
# chamada exemplo:
curl -i -X POST http://localhost:54321/functions/v1/leads \
  -H "Authorization: Bearer <anon>" -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"name":"Teste","email":"t@t.com","courseInterest":"X","origin":"site"}'
```
