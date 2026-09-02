import "server-only";

import type { AsaasConfig } from "@/lib/payments/asaas/config";
import {
  asaasCheckoutResponseSchema,
  DP_ZERO_PRODUCT,
  type AsaasCheckoutInput,
  type AsaasCheckoutPayload,
} from "@/lib/payments/asaas/contracts";

const ASAAS_REQUEST_TIMEOUT_MS = 10_000;

export type AsaasCheckoutFailureKind = "deterministic" | "unknown";

export class AsaasCheckoutError extends Error {
  constructor(
    public readonly kind: AsaasCheckoutFailureKind,
    public readonly providerStatus?: number,
    public readonly providerCodes: string[] = [],
    public readonly providerDescriptions: string[] = [],
  ) {
    super("Não foi possível iniciar o checkout Asaas.");
    this.name = "AsaasCheckoutError";
  }
}

export function buildAsaasCheckoutPayload(
  config: AsaasConfig,
  input: AsaasCheckoutInput,
  paymentId: string,
): AsaasCheckoutPayload {
  const callbackBase = `${config.appOrigin}/lp/${DP_ZERO_PRODUCT.slug}/pagamento`;
  const basePayload: AsaasCheckoutPayload = {
    billingTypes: ["PIX", "CREDIT_CARD"],
    chargeTypes: config.interestFreeInstallmentsConfirmed
      ? ["DETACHED", "INSTALLMENT"]
      : ["DETACHED"],
    externalReference: paymentId,
    items: [
      {
        externalReference: DP_ZERO_PRODUCT.slug,
        name: DP_ZERO_PRODUCT.name,
        description: DP_ZERO_PRODUCT.description,
        quantity: 1,
        value: DP_ZERO_PRODUCT.price,
      },
    ],
    minutesToExpire: config.checkoutExpiresMinutes,
    callback: {
      successUrl: `${callbackBase}/sucesso`,
      cancelUrl: `${callbackBase}/cancelado`,
      expiredUrl: `${callbackBase}/expirado`,
    },
  };

  if (config.interestFreeInstallmentsConfirmed) {
    basePayload.installment = { maxInstallmentCount: 12 };
  }

  return basePayload;
}

export async function createAsaasCheckout(
  config: AsaasConfig,
  input: AsaasCheckoutInput,
  paymentId: string,
  fetchImplementation: typeof fetch = fetch,
): Promise<{ id: string; link: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ASAAS_REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetchImplementation(`${config.apiBaseUrl}/v3/checkouts`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "user-agent": "RH-Cursos-Checkout/1.0 (+https://www.rhcursos.com.br)",
        access_token: config.apiKey,
      },
      body: JSON.stringify(buildAsaasCheckoutPayload(config, input, paymentId)),
      signal: controller.signal,
    });
  } catch {
    throw new AsaasCheckoutError("unknown");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const errors =
      body && typeof body === "object" && Array.isArray((body as { errors?: unknown }).errors)
        ? (body as { errors: unknown[] }).errors
        : [];
    const providerCodes = errors
      .map((entry) =>
        entry && typeof entry === "object" && typeof (entry as { code?: unknown }).code === "string"
          ? (entry as { code: string }).code.slice(0, 80)
          : null,
      )
      .filter((code): code is string => Boolean(code));
    const providerDescriptions = errors
      .map((entry) =>
        entry &&
        typeof entry === "object" &&
        typeof (entry as { description?: unknown }).description === "string"
          ? (entry as { description: string }).description.slice(0, 160)
          : null,
      )
      .filter((description): description is string => Boolean(description));
    throw new AsaasCheckoutError(
      response.status >= 400 && response.status < 500 ? "deterministic" : "unknown",
      response.status,
      providerCodes,
      providerDescriptions,
    );
  }

  const body = await response.json().catch(() => null);
  const parsed = asaasCheckoutResponseSchema.safeParse(body);
  if (!parsed.success) throw new AsaasCheckoutError("unknown");

  return { id: parsed.data.id, link: parsed.data.link };
}

export async function reconcileAsaasCheckoutPayment(
  config: AsaasConfig,
  checkoutId: string,
  expectedPaymentId: string,
  fetchImplementation: typeof fetch = fetch,
): Promise<{ value: number; formaPagamento: "Pix" | "Cartao"; parcelas: number }>
{
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ASAAS_REQUEST_TIMEOUT_MS);
  try {
    const url = new URL(`${config.apiBaseUrl}/v3/payments`);
    url.searchParams.set("checkoutSession", checkoutId);
    url.searchParams.set("limit", "100");
    const response = await fetchImplementation(url, {
      headers: { accept: "application/json", access_token: config.apiKey },
      signal: controller.signal,
    });
    if (!response.ok) throw new AsaasCheckoutError("unknown", response.status);
    const body = await response.json().catch(() => null) as { data?: unknown; totalCount?: unknown } | null;
    if (!body || !Array.isArray(body.data) || body.data.length === 0) throw new AsaasCheckoutError("unknown");
    if (typeof body.totalCount === "number" && body.totalCount > body.data.length) throw new AsaasCheckoutError("unknown");
    const payments = body.data.filter((item): item is { value: number; status: string; billingType?: string; externalReference?: string; installmentNumber?: number } =>
      Boolean(item) && typeof item === "object" && typeof (item as { value?: unknown }).value === "number" && typeof (item as { status?: unknown }).status === "string",
    );
    if (payments.length !== body.data.length || payments.some((payment) => payment.value <= 0 || (payment.externalReference && payment.externalReference !== expectedPaymentId))) {
      throw new AsaasCheckoutError("unknown");
    }
    const total = payments.reduce((sum, payment) => sum + payment.value, 0);
    if (Math.abs(total - DP_ZERO_PRODUCT.price) > 0.01) throw new AsaasCheckoutError("unknown");
    const paid = payments.filter((payment) => ["CONFIRMED", "RECEIVED", "RECEIVED_IN_CASH"].includes(payment.status));
    if (paid.length === 0) throw new AsaasCheckoutError("unknown");
    const billingTypes = new Set(payments.map((payment) => payment.billingType));
    if (![...billingTypes].every((type) => type === "PIX" || type === "CREDIT_CARD")) throw new AsaasCheckoutError("unknown");
    const formaPagamento = billingTypes.has("PIX") ? "Pix" : "Cartao";
    const parcelas = Math.max(1, ...payments.map((payment) => payment.installmentNumber ?? 1));
    return { value: total, formaPagamento, parcelas: Math.min(parcelas, 12) };
  } catch (error) {
    if (error instanceof AsaasCheckoutError) throw error;
    throw new AsaasCheckoutError("unknown");
  } finally {
    clearTimeout(timeout);
  }
}
