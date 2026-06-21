# Secret Hygiene Check

Run before release or deployment packaging to prevent secrets from leaking into artifacts.

## Pre-Deploy Command

```bash
npm run security:secrets
```

## What the Check Does

The `scripts/check-secret-hygiene.mjs` script verifies:

1. **`.env.example` sanitization** — Secret-like variable names (containing SECRET, TOKEN, KEY, PASSWORD, DSN, WEBHOOK) have only placeholder values (`changeme`, `example`, `placeholder`, or empty).
2. **No tracked `.env` files** — Confirms that `git ls-files .env*` returns only `.env.example` (no real secrets committed).
3. **No generated `.env` artifacts** — Ensures `.next/**/.env` and `.open-next/**/.env` do not exist before packaging (these are generated on every build and must not be bundled).

## Architecture: App Secrets vs. Installer Secrets

**Do NOT mix secrets:**

- **App Secrets** (in root `.env` for development, deployed via Cloudflare `wrangler secret put`):
  - `SUPABASE_SERVICE_ROLE_KEY` — Supabase admin access
  - `ASAAS_API_KEY` — Payment gateway
  - `ASAAS_WEBHOOK_AUTH_TOKEN` — Webhook verification
  - `PAYMENT_STATUS_TOKEN_SECRET` — Signing payments
  
- **Installer/CLI Secrets** (in `~/.aiox/` or similar, NOT in app `.env`):
  - `DEEPSEEK_API_KEY`, `OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` — AIOX agent keys
  - `GITHUB_TOKEN`, `N8N_API_KEY`, etc. — Development tools

**Why:** The app's root `.env` is copied into the OpenNext bundle (`.open-next/server-functions/default/.env`). If installer secrets are there, they will be bundled. **Installer secrets belong in the developer's home directory, not the app's root.**

## Manual Hygiene Workflow

1. **Before local development:**
   ```bash
   # Copy placeholder template, fill with LOCAL DEVELOPMENT values only
   cp .env.example .env
   # Edit .env to add real app secrets (Supabase, Asaas)
   # NEVER add AIOX/installer secrets here
   ```

2. **Before deployment packaging:**
   ```bash
   npm run security:secrets
   # Should pass with only app secrets in root .env
   ```

3. **If secrets are exposed:**
   - Check git history: `git log -p -- '.env*' | head -50`
   - Rotate any secret that appears in logs, diffs, or bundled artifacts
   - Document the rotation with date and reason in the Change Log

## Error Resolution

| Error | Cause | Fix |
|-------|-------|-----|
| "Tracked env files not allowed" | Real `.env` or `.env.local` committed | `git rm .env` + rotate secrets |
| "Generated .env artifacts must be removed" | `.env` exists in `.next/` or `.open-next/` | Run `npm run build:cloudflare` in clean dir, or `rm -rf .next .open-next` |
| ".env.example line X has a non-placeholder value" | Secret vars in template have real values | Replace with placeholder (`changeme`, `example`, empty) |

## Deployment: Secrets via Cloudflare

Never commit or bundle `.env` to production. Instead:

1. Build without `.env` (or with empty placeholders only)
2. Deploy to Cloudflare with `opennextjs-cloudflare deploy`
3. Inject secrets via `wrangler secret put` (Cloudflare CLI)
4. Verify in Cloudflare dashboard that secrets were set (values are masked)
