# Security Waiver: Next/PostCSS GHSA-qx2v-qp2m-jg93

Date: 2026-06-21  
Expires: 2026-07-21  
Owner: @devops  
Related story: `docs/stories/2.4.resolve-next-postcss-advisory.md`

## Advisory

- Package path: `next -> postcss`
- Advisory: `GHSA-qx2v-qp2m-jg93`
- Severity: Moderate
- Summary: PostCSS can emit unescaped `</style>` in CSS stringify output.

## Current Evidence

- `npm audit --audit-level=moderate`: reports `postcss <8.5.10` through `next`.
- `npm view next version`: `16.2.9`.
- `npm view next@latest version dependencies.postcss`: `next@16.2.9`, `postcss@8.4.31`.
- `npm view next@16 version --json`: latest stable 16.x is `16.2.9`.
- `npm audit fix --force` would install `next@9.3.3`, which is a breaking downgrade and is explicitly rejected.

## Rationale

No patched compatible stable Next 16 release is available at waiver time. The only
automated fix offered by npm is a breaking downgrade. The project should remain on
the current Next 16 line and upgrade when Vercel publishes a compatible patched
release.

## Impact

The risk is moderate XSS in CSS stringify output. Current site code does not
intentionally process attacker-controlled CSS. The primary mitigation is to avoid
introducing any flow that accepts user-authored CSS or passes untrusted CSS
through PostCSS/stringify until the dependency is patched.

## Monitoring Trigger

Re-run:

```bash
npm audit --audit-level=moderate
npm view next version
npm view next@latest dependencies.postcss
```

Upgrade and remove this waiver when a stable Next release outside the vulnerable
range, or a Next release depending on `postcss >=8.5.10`, is available.

## Decision

Waived temporarily until 2026-07-21 or until a compatible patched Next release is
available, whichever comes first.
