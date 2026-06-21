---
task: auditSiteSecurity()
responsavel: "@cyber-chief"
responsavel_type: Agent
atomic_layer: Task
elicit: false

Entrada:
  - campo: project_root
    tipo: string
    origem: Current Workspace
    obrigatorio: true
  - campo: target_url
    tipo: string
    origem: User Input
    obrigatorio: false

Saida:
  - campo: site_security_audit
    tipo: markdown
    destino: Console
    persistido: false

Checklist:
  - "[ ] Authorization scope confirmed as local/owned project"
  - "[ ] Framework, auth, data, and payment boundaries reviewed"
  - "[ ] Security headers and dependency posture checked"
  - "[ ] Findings include severity, evidence, and remediation"
---

# Task: Site Security Audit

**Task ID:** CYBER-009  
**Version:** 1.0.0  
**Command:** `*audit-site`  
**Orchestrator:** Cyber Chief (cyber-chief)  
**Purpose:** Audit the current website's security posture through safe local review.

---

## Scope

This command is defensive and non-destructive. It reviews the current project source code,
configuration, dependency metadata, tests, and optionally safe HTTP headers for an authorized
local or owned target URL. It does not perform exploitation, credential attacks, DoS, or
unauthorized scanning.

## Execution Phases

### Phase 1: Scope And Inventory

1. Confirm the project is owned/authorized.
2. Identify framework, runtime, auth provider, database, payment provider, and deployment target.
3. Enumerate public routes, admin routes, API handlers, server actions, middleware, and privileged clients.

### Phase 2: Static Security Review

1. Review authentication and authorization boundaries.
2. Check server actions and API handlers that use privileged credentials.
3. Review payment/webhook validation, idempotency, and status disclosure.
4. Check input validation, output encoding, file uploads, redirects, and cache invalidation.
5. Check secret handling and environment file hygiene without printing secret values.

### Phase 3: Configuration And Dependencies

1. Review security headers: CSP, HSTS, X-Frame-Options or frame-ancestors, X-Content-Type-Options,
   Referrer-Policy, Permissions-Policy.
2. Run package audit when available.
3. Review middleware matcher and deployment-specific config.
4. Review tests around auth, payments, and privileged data flows.

### Phase 4: Report

Return a concise report with:

- Overall posture
- STRIDE/OWASP mapping
- Findings ordered by severity
- Evidence with file and line references
- Concrete remediation steps
- Verification commands that were run

## Veto Conditions

- Do not attack production systems.
- Do not print secrets or credentials.
- Do not claim dynamic coverage unless a safe local target was actually tested.
- Do not mark authorization-critical findings as low severity.

## Completion Criteria

- [ ] Scope stated
- [ ] Commands/checks listed
- [ ] Findings have severity and evidence
- [ ] Remediation is actionable
