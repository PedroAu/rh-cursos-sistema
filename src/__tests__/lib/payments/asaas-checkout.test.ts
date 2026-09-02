import { describe, expect, it } from "vitest";

import {
  AsaasCheckoutError,
  buildAsaasCheckoutPayload,
  reconcileAsaasCheckoutPayment,
} from "@/lib/payments/asaas/client";
import { AsaasConfigError, getAsaasConfig } from "@/lib/payments/asaas/config";
import { DP_ZERO_PRODUCT } from "@/lib/payments/asaas/contracts";
import { isAllowedAsaasCheckoutUrl } from "@/lib/payments/asaas/url-policy";
import { isValidAsaasWebhookToken } from "@/lib/payments/asaas/webhook-auth";

const validEnvironment = {
  NODE_ENV: "test",
  ASAAS_API_KEY: "sandbox_api_token",
  ASAAS_WEBHOOK_TOKEN: "a".repeat(32),
  ASAAS_ENVIRONMENT: "sandbox",
  ASAAS_12X_INTEREST_FREE_CONFIRMED: "false",
  ASAAS_CHECKOUT_EXPIRES_MINUTES: "30",
  NEXT_PUBLIC_APP_URL: "http://localhost:3100",
} as NodeJS.ProcessEnv;

describe("Asaas checkout configuration", () => {
  it("fails closed for short, whitespace or repeated webhook secrets", () => {
    expect(() =>
      getAsaasConfig({ ...validEnvironment, ASAAS_WEBHOOK_TOKEN: "short" }),
    ).toThrow(AsaasConfigError);
    expect(() =>
      getAsaasConfig({ ...validEnvironment, ASAAS_WEBHOOK_TOKEN: `${"a".repeat(31)} ` }),
    ).toThrow(AsaasConfigError);
    expect(() =>
      getAsaasConfig({
        ...validEnvironment,
        ASAAS_API_KEY: "b".repeat(32),
        ASAAS_WEBHOOK_TOKEN: "b".repeat(32),
      }),
    ).toThrow(AsaasConfigError);
  });

  it("uses a detached one-payment checkout by default", () => {
    const config = getAsaasConfig(validEnvironment);
    const payload = buildAsaasCheckoutPayload(
      config,
      {
        productSlug: DP_ZERO_PRODUCT.slug,
        idempotencyKey: "10000000-0000-0000-0000-000000000001",
        name: "Pessoa de Teste",
        email: "pessoa@example.com",
        cpf: "11111111111",
        phone: "11999990000",
      },
      "20000000-0000-0000-0000-000000000002",
    );

    expect(payload).toMatchObject({
      billingTypes: ["PIX", "CREDIT_CARD"],
      chargeTypes: ["DETACHED"],
      externalReference: "20000000-0000-0000-0000-000000000002",
    });
    expect(payload.customerData).toBeUndefined();
    expect(payload.installment).toBeUndefined();
  });

  it("only sends 12 installments when the operational flag is explicitly true", () => {
    const config = getAsaasConfig({
      ...validEnvironment,
      ASAAS_12X_INTEREST_FREE_CONFIRMED: "true",
    });
    const payload = buildAsaasCheckoutPayload(
      config,
      {
        productSlug: DP_ZERO_PRODUCT.slug,
        idempotencyKey: "10000000-0000-0000-0000-000000000001",
        name: "Pessoa de Teste",
        email: "pessoa@example.com",
        cpf: "11111111111",
        phone: "11999990000",
      },
      "20000000-0000-0000-0000-000000000002",
    );

    expect(payload.chargeTypes).toEqual(["DETACHED", "INSTALLMENT"]);
    expect(payload.installment).toEqual({ maxInstallmentCount: 12 });
  });
});

describe("Asaas checkout URL policy", () => {
  it("only accepts the exact checkout URL for the selected environment", () => {
    expect(
      isAllowedAsaasCheckoutUrl(
        "https://sandbox.asaas.com/checkoutSession/show/?id=checkout-1",
        "sandbox",
      ),
    ).toBe(true);
    expect(
      isAllowedAsaasCheckoutUrl(
        "https://sandbox.asaas.com/checkoutSession/show/checkout-1",
        "sandbox",
      ),
    ).toBe(true);
    expect(
      isAllowedAsaasCheckoutUrl(
        "https://sandbox.asaas.com/checkoutSession/show?id=checkout-1",
        "sandbox",
      ),
    ).toBe(true);
    expect(
      isAllowedAsaasCheckoutUrl(
        "https://sandbox.asaas.com/checkoutSession/show/?id=checkout-1&next=x",
        "sandbox",
      ),
    ).toBe(false);
    expect(
      isAllowedAsaasCheckoutUrl(
        "https://evil.sandbox.asaas.com/checkoutSession/show/?id=checkout-1",
        "sandbox",
      ),
    ).toBe(false);
    expect(
      isAllowedAsaasCheckoutUrl(
        "https://asaas.com/checkoutSession/show/?id=checkout-1",
        "production",
      ),
    ).toBe(true);
    expect(
      isAllowedAsaasCheckoutUrl(
        "https://www.asaas.com/checkoutSession/show/checkout-1",
        "production",
      ),
    ).toBe(true);
  });
});

describe("Asaas webhook authentication", () => {
  it("accepts only the configured token without exposing a timing-sensitive string comparison", () => {
    const token = "a".repeat(32);
    expect(isValidAsaasWebhookToken(token, token)).toBe(true);
    expect(isValidAsaasWebhookToken("b".repeat(32), token)).toBe(false);
    expect(isValidAsaasWebhookToken(null, token)).toBe(false);
  });
});

describe("Asaas payment reconciliation", () => {
  it("confirms only the expected paid checkout total", async () => {
    const config = getAsaasConfig(validEnvironment);
    const result = await reconcileAsaasCheckoutPayment(
      config,
      "checkout-1",
      "20000000-0000-0000-0000-000000000002",
      async () => new Response(JSON.stringify({
        totalCount: 1,
        data: [{
          value: 297,
          status: "RECEIVED",
          billingType: "PIX",
          externalReference: "20000000-0000-0000-0000-000000000002",
        }],
      }), { status: 200 }),
    );

    expect(result).toEqual({ value: 297, formaPagamento: "Pix", parcelas: 1 });
  });

  it("fails closed when Asaas returns an unexpected amount or reference", async () => {
    const config = getAsaasConfig(validEnvironment);
    await expect(reconcileAsaasCheckoutPayment(
      config,
      "checkout-1",
      "20000000-0000-0000-0000-000000000002",
      async () => new Response(JSON.stringify({
        totalCount: 1,
        data: [{ value: 1, status: "RECEIVED", billingType: "PIX", externalReference: "another-payment" }],
      }), { status: 200 }),
    )).rejects.toBeInstanceOf(AsaasCheckoutError);
  });
});
