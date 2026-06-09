# Deployment

Deploy atual do projeto:

- Frontend: Next.js publicado no Cloudflare Workers via OpenNext
- Backend: Supabase Edge Functions publicadas via GitHub Actions

## Frontend

Workflow: [`.github/workflows/deploy-frontend.yml`](/Users/pedroaugusto/Documents/Site%20RH%20Cursos/site-rh-cursos/.github/workflows/deploy-frontend.yml:1)

Fluxo:

1. `push` em `main`
2. `npm ci`
3. `npm run deploy:workers -- --keep-vars`

Secrets necessários no GitHub:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `AUTH_SESSION_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL`

Observações:

- O empacotamento para Workers é feito pelo adapter `@opennextjs/cloudflare`.
- `wrangler.jsonc` define o Worker principal e o binding de assets gerado em `.open-next/`.
- O Worker de produção fica preso aos domínios `www.rhcursos.com.br` e `rhcursos.com.br` via Workers Routes na zona `rhcursos.com.br`.
- `workers.dev` e Preview URLs ficam desabilitados em produção para reduzir superfície pública.
- O projeto legado do Cloudflare Pages foi removido; o tráfego público do frontend agora entra apenas pelo Worker.
- O deploy usa `--keep-vars`, então as variáveis de runtime configuradas no painel da Cloudflare não são apagadas pelo pipeline.
- Os headers de segurança (`CSP`, `HSTS`, `X-Frame-Options` etc.) são aplicados pelo runtime em `middleware.ts`.
- O redirect do apex `rhcursos.com.br` para `www.rhcursos.com.br` é aplicado pelo próprio app, sem depender de Redirect Rules do Pages.
- `public/_headers` permanece apenas como fallback documental para assets estáticos.
- `public/_redirects` não participa do deploy em Workers.

## Edge Functions

Workflow: [`.github/workflows/deploy-functions.yml`](/Users/pedroaugusto/Documents/Site%20RH%20Cursos/site-rh-cursos/.github/workflows/deploy-functions.yml:1)

Secrets necessários no GitHub:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `AUTH_SESSION_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `EXTRA_ALLOWED_ORIGINS`

Functions publicadas:

- `leads`
- `enrollments`
- `auth-session`
- `admin-resources`

## Configuração no Cloudflare Workers

- Worker name: definido em `wrangler.jsonc`
- Workers Routes: `www.rhcursos.com.br/*` e `rhcursos.com.br/*`
- Build/deploy command em CI: `npm run deploy:workers -- --keep-vars`
- Runtime: Cloudflare Workers com `nodejs_compat`
- Node.js local/CI: `24`

Variáveis no painel da Cloudflare:

- Runtime vars/secrets do Worker devem ser configuradas no dashboard da Cloudflare Workers.
- Em produção, `NEXT_PUBLIC_APP_URL` deve ser `https://www.rhcursos.com.br`.
- Se optar por Workers Builds no futuro, repita também essas variáveis em `Build variables and secrets`, porque o build do Next precisa delas para SSG e inline de `NEXT_PUBLIC_*`.
