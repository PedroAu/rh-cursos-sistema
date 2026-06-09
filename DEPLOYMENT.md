# Deployment

Deploy atual do projeto:

- Frontend: Next.js estático publicado no Cloudflare Pages
- Backend: Supabase Edge Functions publicadas via GitHub Actions

## Frontend

Workflow: [`.github/workflows/deploy-frontend.yml`](/Users/pedroaugusto/Documents/Site%20RH%20Cursos/site-rh-cursos/.github/workflows/deploy-frontend.yml:1)

Fluxo:

1. `push` em `main`
2. `npm ci`
3. `npm run build`
4. upload do diretório `out/` para o Cloudflare Pages

Secrets necessários no GitHub:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_PAGES_PROJECT_NAME`
- `AUTH_SESSION_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL`

Observações:

- `public/_headers` define os headers de segurança no Cloudflare Pages.
- `public/_redirects` mantém o redirect do apex para `www`.
- O build gera export estático em `out/` via `next.config.mjs`.

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

## Configuração no Cloudflare Pages

- Framework preset: `None`
- Build command: `npm run build`
- Build output directory: `out`
- Production branch: `main`
- Node.js version: `24`

As variáveis `NEXT_PUBLIC_*` devem existir também no painel do Cloudflare Pages para builds feitos pelo próprio provedor.

