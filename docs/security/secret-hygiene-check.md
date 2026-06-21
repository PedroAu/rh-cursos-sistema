# Secret Hygiene Check

Run before release or deployment packaging:

```bash
npm run security:secrets
git status --ignored --short
git ls-files '.env*' '.next/**/.env'
```

The scripted check verifies:

- `.env.example` exists and secret-like names use empty or placeholder values.
- No real `.env*` file is tracked, except `.env.example`.
- Generated `.next/**/.env` artifacts are absent before packaging.

Do not print secret values while investigating failures. Inspect file paths and
variable names only. Rotate any secret if there is evidence it was committed,
shared, or bundled into a public artifact.
