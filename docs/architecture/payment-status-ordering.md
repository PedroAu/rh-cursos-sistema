# Payment status ordering guard (webhook reconciliation)

Decision record for QA advisory **STATUS-RANK-BUSINESS-008** (Story 1.1).
Status: Accepted — implemented.
Author: @architect (Aria) — 2026-06-19.

## Problem

`supabase/migrations/20260619195800_payment_webhook_rpc.sql` guards
`payments.status` updates with a monotonic rank: the update applies only when
`payment_status_rank(new) >= payment_status_rank(current)`. The intent was to
stop stale/out-of-order webhook deliveries from regressing a paid charge back to
`PENDING`/`OVERDUE`.

QA flagged a financial risk: `FAILED` holds the **highest** rank (140), so once a
charge reaches `FAILED`, no later `CONFIRMED`/`RECEIVED` can ever apply. A paid
student would stay marked unpaid.

## Evidence (Asaas v3 official docs)

1. **Delivery is ordered, not out-of-order.** Asaas delivers webhooks through a
   per-account **synchronization queue** in chronological order. On repeated
   delivery failure (15 consecutive) the queue **pauses**; it never skips ahead.
   When reactivated, backlog is replayed in sequence.
   → The premise the rank guard defends against (later event arriving before an
   earlier one) effectively does not happen. At-least-once duplication is the
   real concern, and that is already handled by `UNIQUE(asaas_event_id)`.
   Source: https://docs.asaas.com/docs/sobre-os-webhooks ,
   https://docs.asaas.com/docs/fila-pausada
2. **There is no `FAILED` status in Asaas.** Failures are *events*
   (`PAYMENT_REPROVED_BY_RISK_ANALYSIS`, `PAYMENT_CREDIT_CARD_CAPTURE_REFUSED`).
   The local `FAILED` enum is a synthetic label, and giving it the top rank was
   the root cause of the lock. Sources:
   https://docs.asaas.com/docs/payment-events
3. **The lifecycle is non-linear.** Documented flows include
   `OVERDUE → CONFIRMED → RECEIVED` (late boleto/card) and the chargeback branch
   `CHARGEBACK_REQUESTED → CHARGEBACK_DISPUTE → AWAITING_CHARGEBACK_REVERSAL → RECEIVED`
   when the dispute is won. A single linear rank cannot model both the
   "settlement" axis and the "dispute/refund" axis. Sources:
   https://docs.asaas.com/docs/fluxos-de-webhook ,
   https://docs.asaas.com/docs/webhook-para-cobrancas

## Where the current rank is wrong

| Real Asaas transition | rank(from) → rank(to) | Guard verdict | Correct? |
|---|---|---|---|
| OVERDUE(30) → CONFIRMED(60) | 30 → 60 | apply | OK |
| OVERDUE(30) → RECEIVED(80) | 30 → 80 | apply | OK |
| **FAILED(140) → CONFIRMED(60)** | 140 → 60 | **reject** | **WRONG — paid charge stays FAILED** |
| **FAILED(140) → RECEIVED(80)** | 140 → 80 | **reject** | **WRONG — money in, student unpaid** |
| **AWAITING_CHARGEBACK_REVERSAL(130) → RECEIVED(80)** | 130 → 80 | **reject** | **WRONG — won dispute never restores RECEIVED** |
| RECEIVED(80) → REFUNDED(100) | 80 → 100 | apply | OK |
| **REFUNDED(100) → RECEIVED(80)** (re-charge reuse — N/A, new charge id) | 100 → 80 | reject | N/A (new charge = new row) |

Three documented, money-affecting transitions are silently dropped by the
current guard.

## Options considered

**Option A — Keep linear rank, just re-order positions.**
Move `FAILED` low and shuffle settlement/dispute states.
- + Smallest diff, one SQL function.
- − Impossible to satisfy: any single line cannot encode both
  `OVERDUE→RECEIVED` (forward) and `AWAITING_CHARGEBACK_REVERSAL→RECEIVED`
  (which must move *backward* on any line where REFUNDED outranks RECEIVED).
  The non-linearity is intrinsic; re-ordering only relocates the bug.

**Option B — Two-axis model (billing axis + settlement/dispute axis).**
Separate "collection" states from "settlement/reversal" states and guard each
axis independently.
- + Models the real graph faithfully.
- − Requires a second column or a composite rank; more schema and test surface.
  Over-engineered for a 14-state enum with one webhook writer (YAGNI).

**Option C — Explicit allowed-transition matrix.**
Replace rank with a table/`case` of permitted `(from → to)` pairs.
- + Precise; documents the lifecycle in code; rejects only truly invalid moves.
- − ~30+ pairs to enumerate and maintain; every new Asaas status needs a matrix
  edit or it silently blocks. Heavier than the problem warrants.

**Option D — Trust the queue: use event timestamp (`dateCreated`) as the
arbiter, drop status-rank entirely.**
Asaas guarantees ordered delivery, so the only real defense needed is against
*duplicate/replayed* events, not reordered ones. Apply every newly-inserted
event's status, but never let an **older** event (by `dateCreated`) overwrite a
status written by a **newer** event.
- + Matches Asaas's actual delivery contract (KISS — removes a guard built on a
  false premise).
- + No status is ever permanently locked; correctness follows event recency, not
  a hand-maintained ordinal.
- + Naturally correct for OVERDUE→CONFIRMED, FAILED→RECEIVED, and the won
  chargeback → RECEIVED case.
- − Requires persisting the last applied event timestamp
  (`payments.status_event_at`) and the webhook payload's `dateCreated` to reach
  the RPC. Small, bounded schema + signature change.

## Recommendation

**Recommendation: Option D** (timestamp-arbitrated, drop the status rank).

**Motivo:** Asaas delivers in chronological order with a pausing queue, so the
correct invariant is "newest event wins, replays are ignored" — `dateCreated`
expresses exactly that, while the status rank encodes a lifecycle that is
provably non-linear and currently loses money on three transitions.

If the owner prefers to avoid any schema/signature change in this cycle, the
**minimal interim fix is a constrained Option A**: keep the rank but make it
**non-blocking for settlement** — i.e., remove `FAILED` from the high end (set it
to ~5, below `PENDING`) and remove the rank guard from any transition whose
target is `CONFIRMED`/`RECEIVED`/`RECEIVED_IN_CASH`. This stops the financial
bug immediately, but leaves the chargeback-reversal case and is technical debt
versus D.

### Proposed model under Option D

- Add nullable `payments.status_event_at timestamptz`.
- RPC signature gains `p_event_created_at timestamptz` (parsed from the payload
  `dateCreated`).
- Guard becomes:
  `update ... set status = p_new_status, status_event_at = p_event_created_at
   where id = v_payment_id
     and (status_event_at is null or p_event_created_at >= status_event_at);`
- Idempotency stays on `UNIQUE(asaas_event_id)` (unchanged).
- `payment_status_rank` is dropped (and its test removed).

## Risks & dependencies

- **Migration:** YES — Option D needs a new column + a revised
  `apply_payment_webhook_event` migration. Forward-only; existing rows backfill
  `status_event_at = NULL` (first event then always applies). Must be a **new**
  migration, not an edit to `20260619195800_*` (already shipped/tested).
- **Route change:** YES (small) — `src/app/api/payments/webhook/route.ts` must
  extract `dateCreated` from the raw payload and pass it as `p_event_created_at`.
  `AsaasWebhookPayload` in `src/lib/asaas/types.ts` gains an optional
  `dateCreated`/payment timestamp field. Missing/unparseable timestamp must fall
  back safely (treat as "apply", since ordered delivery makes the latest arrival
  the freshest).
- **Tests:** `supabase/migrations/payment-webhook-rpc.test.ts` asserts the rank
  expression literally and would need updating; webhook route tests gain an
  older-vs-newer timestamp case.
- **Backward compatibility:** Statuses already persisted are unaffected; the only
  behavior change is that previously-locked `FAILED`/post-dispute charges can now
  progress to `RECEIVED`. No public/RLS surface changes (writes stay server-side
  via `createAdminClient()`).
- **Security:** No new exposure — same server-only RPC, same auth, same
  dedup key. Timestamp is non-authoritative input but is only used for ordering,
  never for authorization or amount.

## Executive summary

The monotonic status rank was built to defend against out-of-order webhook
delivery, but Asaas delivers webhooks **in order** through a pausing queue, so
that defense is unnecessary — and harmful. By giving the synthetic `FAILED`
status the top rank, the guard permanently locks any charge that ever hit
`FAILED`, and it also blocks the legitimate `AWAITING_CHARGEBACK_REVERSAL →
RECEIVED` recovery. Result: real money received, student left marked unpaid.

Recommended fix (**Option D**): drop `payment_status_rank`, and order updates by
the event's `dateCreated` (newest event wins, replays ignored via the existing
`asaas_event_id` unique key). Requires a new migration (`status_event_at`
column + revised RPC) and a small change to the webhook route/types. If a
zero-schema interim is required, demote `FAILED` below `PENDING` and exempt
settlement targets from the rank guard — this stops the financial bug now but
remains debt against the timestamp model.
