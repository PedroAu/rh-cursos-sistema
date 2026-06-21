# Payment Status Authorization Design - 2026-06-21

**Owner:** Architect (Aria)  
**Related story:** `docs/stories/2.2.harden-payment-status-lookup.md`  
**Source audit:** `docs/security/site-security-audit-2026-06-21.md`

## Decision

Use a short-lived, signed payment status lookup token for `/api/payments/status/[chargeId]`.

The endpoint must no longer authorize a status lookup with `chargeId` alone. Checkout creation should return a server-generated token bound to the Asaas charge id and a timestamp. The status route validates the token before reading payment state.

## Token Shape

Payload:

```json
{
  "chargeId": "asaas-charge-id",
  "iat": 1710000000,
  "exp": 1710001800,
  "purpose": "payment-status"
}
```

Signing:

- HMAC SHA-256 with a server-only secret such as `PAYMENT_STATUS_TOKEN_SECRET`.
- Secret must never use a `NEXT_PUBLIC_` prefix.
- Token can be compact base64url payload + signature, or JWT if an existing server-only dependency is already present.

## Request Contract

Preferred:

```http
GET /api/payments/status/{chargeId}?token={signedToken}
```

Accepted alternative:

```http
Authorization: Bearer {signedToken}
```

## Validation Rules

1. Token is required.
2. Signature must be valid.
3. `purpose` must be `payment-status`.
4. Token `chargeId` must equal the path `chargeId`.
5. Token must not be expired.
6. Invalid tokens return a generic `404` or `401` without revealing whether the charge exists.

## Data Access

Service-role can remain temporarily because payment status is server-owned and not naturally session-bound for anonymous checkout. The route must constrain reads to the single validated `chargeId` and return only `{ status }`.

Future improvement: migrate to RLS-backed lookup if checkout state becomes session-bound.

## Risks And Mitigations

- **Token leakage in browser history:** acceptable for a short-lived checkout status token; keep TTL short and status-only response minimal.
- **Clock skew:** allow small leeway, for example 30 seconds.
- **Secret rotation:** support a current secret and optional previous secret if operationally needed.
- **Polling abuse:** add rate limiting after token validation if traffic indicates abuse.

## Verification

- Unit tests for token generation and verification.
- Route tests for valid token, missing token, invalid signature, mismatched charge id, expired token, and unknown charge.
- Regression test for checkout UI polling flow.
