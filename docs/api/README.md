# API — RH Cursos

Documentação dos endpoints da plataforma. A API é dividida em duas camadas:

| Camada | Onde roda | Documentação |
|--------|-----------|--------------|
| **Route Handlers** | Next.js (Cloudflare Workers) | [`auth-session.md`](auth-session.md) |
| **Edge Functions** | Supabase (Deno) | [`edge-functions.md`](edge-functions.md) |
| **Contrato OpenAPI** | Artefato versionado | [`openapi.yaml`](openapi.yaml) |

---

## Convenções gerais

- **Formato:** todas as respostas são JSON.
- **Envelope de resposta:** `{ "ok": boolean, ... }`. Em erro: `{ "ok": false, "error": string }`.
- **Autenticação:**
  - `POST`/`DELETE /api/auth/session` usam cookie HttpOnly assinado (`SESSION_COOKIE`) no runtime Next.
  - `POST`/`DELETE /functions/v1/auth-session` devolvem/consomem token de sessão no corpo por causa do deploy estático.
  - `POST /functions/v1/admin-resources` exige header `x-rh-session`.
- **Rate limiting:** endpoints sensíveis (auth) aplicam limite por IP e retornam `429` com header `Retry-After`.
- **CORS:** Edge Functions validam o header `Origin` contra a allowlist e respondem a preflight (`OPTIONS`).

---

## Índice de endpoints

| Método | Endpoint | Descrição | Doc |
|--------|----------|-----------|-----|
| `GET` | `/api/auth/session` | Sincronizar sessão admin e rotacionar token quando necessário | [auth-session](auth-session.md) |
| `POST` | `/api/auth/session` | Login administrativo | [auth-session](auth-session.md) |
| `DELETE` | `/api/auth/session` | Logout (revoga sessões) | [auth-session](auth-session.md) |
| `POST` | `/functions/v1/enrollments` | Criar inscrição em curso | [edge-functions](edge-functions.md) |
| `POST` | `/functions/v1/leads` | Registrar lead in-company | [edge-functions](edge-functions.md) |
| `POST` | `/functions/v1/admin-resources` | Mutações administrativas (CRUD) | [edge-functions](edge-functions.md) |
| `POST` | `/functions/v1/auth-session` | Login administrativo (Edge) | [edge-functions](edge-functions.md) |
| `DELETE` | `/functions/v1/auth-session` | Logout administrativo (Edge) | [edge-functions](edge-functions.md) |

---

## Fonte de verdade

- **Route Handler canônico:** `app/api/auth/session/route.ts`
- **Edge Functions canônicas:** `supabase/functions/*/index.ts`
- **Spec OpenAPI versionada:** `docs/api/openapi.yaml`
- **Documentação manual:** `docs/api/auth-session.md` e `docs/api/edge-functions.md`
- **Drift conhecido reconciliado neste catálogo:** `DELETE /functions/v1/auth-session` existe no código e deve aparecer no inventário
- **Estratégia de manutenção:** atualizar o código primeiro, depois reconciliar `docs/api/*.md` e `docs/api/openapi.yaml` na mesma mudança
