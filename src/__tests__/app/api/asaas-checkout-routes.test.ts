import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(),
  rpc: vi.fn(),
  createCheckout: vi.fn(),
  reconcileCheckout: vi.fn(),
  allowedUrl: vi.fn(),
  validWebhookToken: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: (...args: unknown[]) => mocks.checkRateLimit(...args),
  clientIp: () => "203.0.113.8",
  buildRateLimitKey: (scope: string, ip: string) => `${scope}:${ip}`,
  rateLimitConfigs: { checkout: { windowMs: 60_000, maxRequests: 5 } },
}));

vi.mock("@/lib/payments/asaas/config", () => ({
  AsaasConfigError: class AsaasConfigError extends Error {},
  getAsaasConfig: () => ({
    apiKey: "api-key",
    webhookToken: "a".repeat(32),
    environment: "sandbox",
    apiBaseUrl: "https://api-sandbox.asaas.com",
    appOrigin: "https://app.rhcursos.test",
    checkoutExpiresMinutes: 30,
    interestFreeInstallmentsConfirmed: false,
    maxInstallments: 1,
  }),
}));

vi.mock("@/lib/payments/asaas/client", () => ({
  AsaasCheckoutError: class AsaasCheckoutError extends Error {
    constructor(public kind: "deterministic" | "unknown") {
      super("checkout error");
    }
  },
  createAsaasCheckout: (...args: unknown[]) => mocks.createCheckout(...args),
  reconcileAsaasCheckoutPayment: (...args: unknown[]) => mocks.reconcileCheckout(...args),
}));

vi.mock("@/lib/payments/asaas/url-policy", () => ({
  isAllowedAsaasCheckoutUrl: (...args: unknown[]) => mocks.allowedUrl(...args),
}));

vi.mock("@/lib/payments/asaas/webhook-auth", () => ({
  isValidAsaasWebhookToken: (...args: unknown[]) => mocks.validWebhookToken(...args),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: () => ({ rpc: mocks.rpc }),
}));

function validCheckoutRequest() {
  return new Request("http://localhost/api/payments/asaas/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productSlug: "departamento-pessoal-do-zero",
      idempotencyKey: "10000000-0000-4000-8000-000000000001",
      name: "Pessoa de Teste",
      email: "pessoa@example.com",
      cpf: "529.982.247-25",
      phone: "(11) 99999-0000",
    }),
  });
}

function startResponse() {
  return {
    aluno_id: "aluno-1",
    inscricao_id: "inscricao-1",
    pagamento_id: "20000000-0000-4000-8000-000000000002",
    gateway_status: "CREATING",
    idempotency_key: "10000000-0000-4000-8000-000000000001",
    created: true,
  };
}

describe("Asaas checkout and webhook routes", () => {
  beforeEach(() => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test";
    mocks.checkRateLimit.mockReset();
    mocks.checkRateLimit.mockResolvedValue({ allowed: true, remaining: 4, retryAfter: 0 });
    mocks.rpc.mockReset();
    mocks.createCheckout.mockReset();
    mocks.createCheckout.mockResolvedValue({
      id: "checkout-1",
      link: "https://sandbox.asaas.com/checkoutSession/show/?id=checkout-1",
    });
    mocks.reconcileCheckout.mockReset();
    mocks.reconcileCheckout.mockResolvedValue({ value: 297, formaPagamento: "Pix", parcelas: 1 });
    mocks.allowedUrl.mockReset();
    mocks.allowedUrl.mockReturnValue(true);
    mocks.validWebhookToken.mockReset();
    mocks.validWebhookToken.mockReturnValue(true);
  });

  it("executes start → Asaas POST → URL validation → bind before returning the URL", async () => {
    const sequence: string[] = [];
    mocks.rpc.mockImplementation((name: string) => {
      sequence.push(name);
      if (name === "iniciar_checkout_asaas_dp_zero") return { data: [startResponse()], error: null };
      if (name === "vincular_checkout_asaas") return { data: "ACTIVE", error: null };
      return { data: null, error: null };
    });
    mocks.createCheckout.mockImplementation(async () => {
      sequence.push("asaas_post");
      return {
        id: "checkout-1",
        link: "https://sandbox.asaas.com/checkoutSession/show/?id=checkout-1",
      };
    });
    mocks.allowedUrl.mockImplementation(() => {
      sequence.push("validate_url");
      return true;
    });

    const { POST } = await import("../../../../app/api/payments/asaas/checkout/route");
    const response = await POST(validCheckoutRequest());

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      orderId: "20000000-0000-4000-8000-000000000002",
      checkoutUrl: "https://sandbox.asaas.com/checkoutSession/show/?id=checkout-1",
    });
    expect(sequence).toEqual([
      "limpar_checkouts_asaas_expirados",
      "iniciar_checkout_asaas_dp_zero",
      "asaas_post",
      "validate_url",
      "vincular_checkout_asaas",
    ]);
  });

  it("marks CREATION_UNKNOWN and never returns a URL when bind fails", async () => {
    mocks.rpc.mockImplementation((name: string) => {
      if (name === "iniciar_checkout_asaas_dp_zero") return { data: [startResponse()], error: null };
      if (name === "vincular_checkout_asaas") return { data: null, error: { message: "bind failed" } };
      if (name === "marcar_checkout_asaas_creation_unknown") return { data: "CREATION_UNKNOWN", error: null };
      return { data: null, error: null };
    });

    const { POST } = await import("../../../../app/api/payments/asaas/checkout/route");
    const response = await POST(validCheckoutRequest());

    expect(response.status).toBe(502);
    expect(mocks.rpc).toHaveBeenCalledWith("marcar_checkout_asaas_creation_unknown", {
      p_pagamento_id: "20000000-0000-4000-8000-000000000002",
    });
    await expect(response.json()).resolves.not.toHaveProperty("checkoutUrl");
  });

  it("asks Asaas to retry webhook delivery while the RPC reports a transient event error", async () => {
    mocks.rpc.mockResolvedValue({
      data: [
        {
          event_status: "RETRYABLE_ERROR",
          payment_gateway_status: "CREATION_UNKNOWN",
          processed: false,
          duplicate: false,
        },
      ],
      error: null,
    });

    const { POST } = await import("../../../../app/api/webhooks/asaas/route");
    const response = await POST(
      new Request("http://localhost/api/webhooks/asaas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "asaas-access-token": "a".repeat(32),
        },
        body: JSON.stringify({
          id: "evt-1",
          event: "CHECKOUT_PAID",
          checkout: {
            id: "checkout-1",
            externalReference: "20000000-0000-4000-8000-000000000002",
            status: "PAID",
            items: [{ externalReference: "departamento-pessoal-do-zero", quantity: 1, value: 297 }],
          },
        }),
      }),
    );

    expect(response.status).toBe(503);
  });

  it("rejects invalid checkout payloads before starting a database operation", async () => {
    const { POST } = await import("../../../../app/api/payments/asaas/checkout/route");
    const response = await POST(
      new Request("http://localhost/api/payments/asaas/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: "departamento-pessoal-do-zero",
          idempotencyKey: "10000000-0000-4000-8000-000000000001",
          name: "Pessoa de Teste",
          email: "pessoa@example.com",
          cpf: "111.111.111-11",
          phone: "(11) 99999-0000",
          price: 1,
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
