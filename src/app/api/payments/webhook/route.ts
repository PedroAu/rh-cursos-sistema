import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getAsaasEnv } from "@/lib/asaas/env";
import type { AsaasWebhookPayload } from "@/lib/asaas/types";
import { createAdminClient } from "@/lib/supabase/admin";

type WebhookError = {
  error: string;
};

type ApplyWebhookEventResult = {
  payment_id: string | null;
  duplicate: boolean;
  applied_status: string | null;
};

const knownPaymentStatuses = new Set([
  "PENDING",
  "CONFIRMED",
  "RECEIVED",
  "OVERDUE",
  "REFUNDED",
  "RECEIVED_IN_CASH",
  "REFUND_REQUESTED",
  "CHARGEBACK_REQUESTED",
  "CHARGEBACK_DISPUTE",
  "AWAITING_CHARGEBACK_REVERSAL",
  "DUNNING_REQUESTED",
  "DUNNING_RECEIVED",
  "AWAITING_RISK_ANALYSIS",
  "FAILED",
]);

function jsonError(body: WebhookError, status: number) {
  return NextResponse.json(body, { status });
}

function getWebhookToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  return (
    request.headers.get("asaas-access-token") ??
    request.headers.get("x-asaas-webhook-token") ??
    request.headers.get("x-webhook-token")
  );
}

function constantTimeEquals(first: string, second: string) {
  const firstBytes = Buffer.from(first, "utf8");
  const secondBytes = Buffer.from(second, "utf8");

  // timingSafeEqual throws on unequal lengths; the byte length of a secret is
  // not itself secret, so a length mismatch can short-circuit to a reject.
  if (firstBytes.length !== secondBytes.length) {
    return false;
  }

  return timingSafeEqual(firstBytes, secondBytes);
}

function getEventCreatedAt(payload: unknown) {
  const candidate = payload as { dateCreated?: unknown };

  if (typeof candidate.dateCreated !== "string") {
    return null;
  }

  return Number.isNaN(Date.parse(candidate.dateCreated)) ? null : candidate.dateCreated;
}

function parseWebhookPayload(payload: unknown): AsaasWebhookPayload | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as {
    id?: unknown;
    event?: unknown;
    dateCreated?: unknown;
    payment?: { id?: unknown; status?: unknown };
  };

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.event !== "string" ||
    !candidate.payment ||
    typeof candidate.payment.id !== "string" ||
    typeof candidate.payment.status !== "string"
  ) {
    return null;
  }

  return {
    id: candidate.id,
    event: candidate.event,
    dateCreated: typeof candidate.dateCreated === "string" ? candidate.dateCreated : undefined,
    payment: {
      id: candidate.payment.id,
      status: candidate.payment.status,
    },
  };
}

export async function POST(request: Request) {
  const expectedToken = getAsaasEnv().webhookAuthToken;
  const receivedToken = getWebhookToken(request);

  if (!receivedToken || !constantTimeEquals(receivedToken, expectedToken)) {
    return jsonError({ error: "unauthorized" }, 401);
  }

  let rawPayload: unknown;

  try {
    rawPayload = await request.json();
  } catch {
    return jsonError({ error: "invalid json payload" }, 400);
  }

  const payload = parseWebhookPayload(rawPayload);

  if (!payload) {
    return jsonError({ error: "unsupported webhook payload" }, 400);
  }

  const supabase = createAdminClient();
  const knownStatus = knownPaymentStatuses.has(payload.payment.status)
    ? payload.payment.status
    : null;
  const result = await supabase
    .rpc("apply_payment_webhook_event", {
      p_asaas_event_id: payload.id,
      p_asaas_charge_id: payload.payment.id,
      p_event_type: payload.event,
      p_new_status: knownStatus,
      p_event_created_at: getEventCreatedAt(rawPayload),
      p_raw_event: rawPayload,
    })
    .maybeSingle<ApplyWebhookEventResult>();

  if (result.error) {
    return jsonError({ error: "payment webhook processing failed" }, 500);
  }

  if (result.data?.duplicate) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  return NextResponse.json({
    ok: true,
    paymentId: result.data?.payment_id ?? null,
    status: result.data?.applied_status ?? null,
  });
}
