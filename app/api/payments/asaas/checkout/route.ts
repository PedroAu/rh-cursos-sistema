import { createHash } from "node:crypto";
import { z } from "zod";
import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import {
  AsaasCheckoutError,
  createAsaasCheckout,
} from "@/lib/payments/asaas/client";
import { AsaasConfigError, getAsaasConfig } from "@/lib/payments/asaas/config";
import { asaasCheckoutInputSchema } from "@/lib/payments/asaas/contracts";
import { isAllowedAsaasCheckoutUrl } from "@/lib/payments/asaas/url-policy";
import { buildRateLimitKey, checkRateLimit, clientIp, rateLimitConfigs } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { applyApiSecurityHeaders } from "@/lib/security-headers";
import { readLimitedBody } from "@/lib/http/read-limited-body";

const MAX_BODY_BYTES = 4 * 1024;

const checkoutStartResultSchema = z.object({
  aluno_id: z.string().min(1),
  inscricao_id: z.string().min(1),
  pagamento_id: z.string().uuid(),
  gateway_status: z.enum([
    "CREATING",
    "CREATION_UNKNOWN",
    "ACTIVE",
    "FAILED",
    "PAID",
    "CANCELED",
    "EXPIRED",
    "MANUAL_REVIEW",
  ]),
  idempotency_key: z.string().uuid(),
  created: z.boolean(),
});

type AdminClient = NonNullable<ReturnType<typeof createSupabaseServerClient>>;

function firstRpcRow(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : value;
}

function json(body: unknown, init?: ResponseInit) {
  return applyApiSecurityHeaders(NextResponse.json(body, init));
}

function sameOrigin(request: Request, appOrigin: string): boolean {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  return !origin || origin === appOrigin;
}

function identityKey(kind: "email" | "cpf", value: string): string {
  return createHash("sha256").update(`${kind}:${value}`).digest("hex").slice(0, 32);
}

async function markCreationUnknown(admin: AdminClient, paymentId: string) {
  const { error } = await admin.rpc("marcar_checkout_asaas_creation_unknown", {
    p_pagamento_id: paymentId,
  });
  if (error) logger.error("asaas.checkout.creation_unknown persistence failed", { err: error });
}

async function markDeterministicFailure(admin: AdminClient, paymentId: string) {
  const { error } = await admin.rpc("marcar_checkout_asaas_failed", {
    p_pagamento_id: paymentId,
  });
  if (error) logger.error("asaas.checkout.failed persistence failed", { err: error });
}

export async function POST(request: Request) {
  let config;
  try {
    config = getAsaasConfig();
  } catch (error) {
    if (error instanceof AsaasConfigError) return json({ error: "Pagamento temporariamente indisponível." }, { status: 503 });
    throw error;
  }
  if (!sameOrigin(request, config.appOrigin)) return json({ error: "Origem da requisição não permitida." }, { status: 403 });
  if (!(request.headers.get("content-type")?.toLowerCase() ?? "").startsWith("application/json")) {
    return json({ error: "Content-Type deve ser application/json." }, { status: 415 });
  }
  const globalRate = await checkRateLimit("asaas-checkout:global", rateLimitConfigs.checkoutGlobal);
  if (!globalRate.allowed) return json({ error: "Muitas inscrições em andamento. Aguarde um momento." }, { status: 429, headers: { "Retry-After": String(globalRate.retryAfter) } });
  const rate = await checkRateLimit(
    buildRateLimitKey("asaas-checkout", clientIp(request)),
    rateLimitConfigs.checkout,
  );
  if (!rate.allowed) {
    return json(
      { error: "Muitas tentativas. Aguarde um momento e tente novamente." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } },
    );
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    return json({ error: "Corpo da requisição muito grande." }, { status: 413 });
  }

  const rawBody = await readLimitedBody(request, MAX_BODY_BYTES);
  if (rawBody === null) {
    return json({ error: "Corpo da requisição inválido ou muito grande." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const input = asaasCheckoutInputSchema.safeParse(body);
  if (!input.success) {
    return json({ error: "Revise os dados informados." }, { status: 400 });
  }

  const identityRate = await checkRateLimit(identityKey("email", input.data.email), rateLimitConfigs.checkoutIdentity);
  const cpfRate = await checkRateLimit(identityKey("cpf", input.data.cpf), rateLimitConfigs.checkoutIdentity);
  if (!identityRate.allowed || !cpfRate.allowed) return json({ error: "Muitas tentativas para estes dados. Aguarde alguns minutos." }, { status: 429, headers: { "Retry-After": String(Math.max(identityRate.retryAfter, cpfRate.retryAfter)) } });

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return json({ error: "Pagamento temporariamente indisponível." }, { status: 503 });
  }
  const admin = createSupabaseServerClient();
  if (!admin) {
    return json({ error: "Pagamento temporariamente indisponível." }, { status: 503 });
  }
  // Libera reservas vencidas antes de tentar ocupar uma nova vaga.
  const { error: cleanupError } = await admin.rpc("limpar_checkouts_asaas_expirados");
  if (cleanupError) logger.warn("asaas.checkout.expired_cleanup_failed", { err: cleanupError });

  const { data: rawStart, error: startError } = await admin.rpc(
    "iniciar_checkout_asaas_dp_zero",
    {
      p_idempotency_key: input.data.idempotencyKey,
      p_nome_completo: input.data.name,
      p_email: input.data.email,
      p_cpf: input.data.cpf,
      p_telefone: input.data.phone,
      p_minutes_to_expire: config.checkoutExpiresMinutes,
    },
  );
  const start = checkoutStartResultSchema.safeParse(firstRpcRow(rawStart));
  if (startError || !start.success) {
    logger.error("asaas.checkout start failed", { err: startError });
    return json(
      { error: "Não foi possível reservar sua inscrição. Confira os dados ou tente mais tarde." },
      { status: 409 },
    );
  }

  if (!start.data.created || start.data.gateway_status !== "CREATING") {
    return json(
      { error: "Esta tentativa já foi processada. Inicie uma nova tentativa se necessário." },
      { status: 409 },
    );
  }

  let checkout: { id: string; link: string };
  try {
    checkout = await createAsaasCheckout(config, input.data, start.data.pagamento_id);
  } catch (error) {
    if (error instanceof AsaasCheckoutError && error.kind === "deterministic") {
      logger.error("asaas.checkout.provider_rejected", {
        status: error.providerStatus,
        codes: error.providerCodes,
        descriptions: error.providerDescriptions,
      });
      await markDeterministicFailure(admin, start.data.pagamento_id);
      return json(
        {
          error: "O Asaas recusou a criação do checkout. Tente novamente.",
          retryWithNewAttempt: true,
        },
        { status: 502 },
      );
    }

    await markCreationUnknown(admin, start.data.pagamento_id);
    return json(
      { error: "Não foi possível confirmar a criação do checkout. Não repita o pagamento agora; fale com o atendimento." },
      { status: 503 },
    );
  }

  if (!isAllowedAsaasCheckoutUrl(checkout.link, config.environment)) {
    await markCreationUnknown(admin, start.data.pagamento_id);
    logger.error("asaas.checkout rejected redirect URL", { environment: config.environment });
    return json({ error: "Resposta de pagamento inválida." }, { status: 502 });
  }

  const expiresAt = new Date(
    Date.now() + config.checkoutExpiresMinutes * 60 * 1000,
  ).toISOString();
  const { error: bindError } = await admin.rpc("vincular_checkout_asaas", {
    p_pagamento_id: start.data.pagamento_id,
    p_gateway_ref: checkout.id,
    p_checkout_expires_at: expiresAt,
  });
  if (bindError) {
    await markCreationUnknown(admin, start.data.pagamento_id);
    logger.error("asaas.checkout bind failed", { err: bindError });
    return json({ error: "Não foi possível concluir o direcionamento." }, { status: 502 });
  }

  return json(
    { orderId: start.data.pagamento_id, checkoutUrl: checkout.link },
    { status: 201, headers: { "X-RateLimit-Remaining": String(rate.remaining) } },
  );
}
