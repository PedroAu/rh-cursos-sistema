# API — RH Cursos

Documentação dos endpoints da plataforma. A API é dividida em duas camadas:

| Camada | Onde roda | Documentação |
|--------|-----------|--------------|
| **Route Handlers** | Next.js (Cloudflare Workers) | [`auth-session.md`](auth-session.md) |
| **Edge Functions** | Supabase (Deno) | [`edge-functions.md`](edge-functions.md) |
| **Contrato OpenAPI** | Artefato versionado | [`openapi.yaml`](openapi.yaml) |
| **UI navegável** | ReDoc estático gerado | [`/api-docs.html`](../../public/api-docs.html) |

---

## Convenções gerais

- **Formato:** todas as respostas são JSON.
- **Envelope de resposta:** `{ "ok": boolean, ... }`. Em erro: `{ "ok": false, "error": string }`.
- **Autenticação:**
  - `GET`/`POST`/`DELETE /api/auth/session` usam a sessão Supabase em cookies httpOnly (`@supabase/ssr`); nenhum access/refresh token trafega no corpo, e papéis admin exigem AAL2 (MFA fail-closed).
  - `GET /api/admin/*` (read models paginados) são autorizados server-side pela sessão SSR (`requireAdminApi` → `requireServerRole('admin')`).
  - `GET`/`POST`/`DELETE /api/functions/{name}` é o proxy BFF same-origin: para `admin-resources` a identidade admin vem da sessão SSR (o header HMAC foi removido); demais funções são repassadas à Edge Function upstream.
  - `POST /functions/v1/admin-resources` é interno ao BFF: aceita somente a identidade SSR encaminhada server-side com a credencial `service_role`; HMAC legado é rejeitado.
- **Rate limiting:** endpoints sensíveis (auth) aplicam limite por IP e retornam `429` com header `Retry-After`.
- **CORS:** Edge Functions validam o header `Origin` contra a allowlist e respondem a preflight (`OPTIONS`).

---

## Índice de endpoints

| Método | Endpoint | Descrição | Doc |
|--------|----------|-----------|-----|
| `GET` | `/api/auth/session` | Sincronizar sessão autenticada e rotacionar token quando necessário | [auth-session](auth-session.md) |
| `POST` | `/api/auth/session` | Login por perfil (`admin`, `student`, `instructor`) | [auth-session](auth-session.md) |
| `DELETE` | `/api/auth/session` | Logout (revoga sessões) | [auth-session](auth-session.md) |
| `GET` | `/api/auth/realtime-token` | Emitir token efêmero de realtime para sessão admin SSR | [openapi.yaml](openapi.yaml) |
| `GET` | `/api/admin/courses` | Listar cursos (paginado, busca por título) | [openapi.yaml](openapi.yaml) |
| `GET` | `/api/admin/classes` | Listar turmas (paginado, busca por curso) | [openapi.yaml](openapi.yaml) |
| `GET` | `/api/admin/instructors` | Listar instrutores (paginado, busca por nome) | [openapi.yaml](openapi.yaml) |
| `GET` | `/api/admin/students` | Listar alunos (paginado, filtros turma/status/busca) | [openapi.yaml](openapi.yaml) |
| `GET` | `/api/admin/enrollments` | Listar inscrições (paginado, filtros turma/status/busca) | [openapi.yaml](openapi.yaml) |
| `GET`/`POST`/`DELETE` | `/api/functions/{name}` | Proxy BFF same-origin para as Edge Functions | [openapi.yaml](openapi.yaml) |
| `POST` | `/functions/v1/enrollments` | Criar inscrição em curso | [edge-functions](edge-functions.md) |
| `POST` | `/functions/v1/leads` | Registrar lead comercial/consultivo | [edge-functions](edge-functions.md) |
| `POST` | `/functions/v1/admin-resources` | Mutações administrativas (CRUD) | [edge-functions](edge-functions.md) |

---

## Fonte de verdade

- **Route Handler canônico:** `app/api/auth/session/route.ts`
- **Edge Functions canônicas:** `supabase/functions/*/index.ts`
- **Spec OpenAPI versionada:** `docs/api/openapi.yaml`
- **Documentação manual:** `docs/api/auth-session.md` e `docs/api/edge-functions.md`
- **UI navegável publicada:** `/api-docs.html`
- **Comandos de manutenção:** `npm run docs:api:lint`, `npm run docs:api:build`, `npm run docs:api:check-drift`
- **Inventário anti-drift:** derivado de `app/api/**/route.ts` e `supabase/functions/*/index.ts`, comparando path e métodos sem contagem histórica fixa.
- **Estratégia de manutenção:** atualizar o código primeiro, depois reconciliar `docs/api/*.md` e `docs/api/openapi.yaml` na mesma mudança
