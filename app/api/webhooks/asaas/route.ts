import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { getAsaasConfig } from "@/lib/payments/asaas/config";
import {
  asaasWebhookSchema,
  type AsaasWebhook,
} from "@/lib/payments/asaas/contracts";
import { reconcileAsaasCheckoutPayment } from "@/lib/payments/asaas/client";
import { isValidAsaasWebhookToken } from "@/lib/payments/asaas/webhook-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { applyApiSecurityHeaders } from "@/lib/security-headers";
import { readLimitedBody } from "@/lib/http/read-limited-body";

const MAX_WEBHOOK_BODY_BYTES = 32 * 1024;

function normalizedEventHash(event: AsaasWebhook): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        id: event.id,
        event: event.event,
        checkoutId: event.checkout.id,
        externalReference: event.checkout.externalReference ?? null,
        status: event.checkout.status ?? null,
      }),
    )
    .digest("hex");
}

function normalizedEventDate(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value.replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function json(body: unknown, init?: ResponseInit) {
  return applyApiSecurityHeaders(NextResponse.json(body, init));
}

export async function POST(request: Request) {
  let config;
  try {
    config = getAsaasConfig();
  } catch {
    return json({ ok: false }, { status: 503 });
  }

  if (
    !isValidAsaasWebhookToken(
      request.headers.get("asaas-access-token"),
      config.webhookToken,
    )
  ) {
    return json({ ok: false }, { status: 401 });
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_WEBHOOK_BODY_BYTES) {
    return json({ ok: false }, { status: 413 });
  }
  const rawBody = await readLimitedBody(request, MAX_WEBHOOK_BODY_BYTES);
  if (rawBody === null) {
    return json({ ok: false }, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return json({ ok: false }, { status: 400 });
  }
  const parsed = asaasWebhookSchema.safeParse(payload);
  if (!parsed.success) {
    return json({ ok: false }, { status: 400 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
  const admin = createSupabaseServerClient();
  if (!admin) return json({ ok: false }, { status: 503 });

  const event = parsed.data;
  let reconciliation: { value: number; formaPagamento: "Pix" | "Cartao"; parcelas: number } | null = null;
  if (event.event === "CHECKOUT_PAID") {
    try {
      reconciliation = await reconcileAsaasCheckoutPayment(config, event.checkout.id, event.checkout.externalReference!);
    } catch {
      return json({ ok: false }, { status: 503 });
    }
  }
  const { data, error } = await admin.rpc("processar_evento_checkout_asaas", {
    p_event_id: event.id,
    p_event_type: event.event,
    p_gateway_ref: event.checkout.id,
    p_external_reference: event.checkout.externalReference ?? null,
    p_normalized_hash: normalizedEventHash(event),
    p_event_created_at: normalizedEventDate(event.dateCreated),
    p_valor: reconciliation?.value ?? null,
    p_forma_pagamento: reconciliation?.formaPagamento ?? null,
    p_parcelas: reconciliation?.parcelas ?? null,
  });

  const result = Array.isArray(data) ? data[0] : data;
  if (
    error ||
    !result ||
    typeof result !== "object" ||
    (result as { event_status?: unknown }).event_status !== "PROCESSED"
  ) {
    logger.error("asaas.webhook processing retry requested", {
      err: error,
      eventId: event.id,
      eventType: event.event,
    });
    return json({ ok: false }, { status: 503 });
  }

  return json({ ok: true });
}
