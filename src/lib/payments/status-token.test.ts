import {
  createPaymentStatusToken,
  verifyPaymentStatusToken,
} from "@/lib/payments/status-token";

describe("payment status token", () => {
  let originalSecret: string | undefined;

  beforeEach(() => {
    originalSecret = process.env.PAYMENT_STATUS_TOKEN_SECRET;
    process.env.PAYMENT_STATUS_TOKEN_SECRET = "test-payment-status-secret";
  });

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.PAYMENT_STATUS_TOKEN_SECRET;
    } else {
      process.env.PAYMENT_STATUS_TOKEN_SECRET = originalSecret;
    }
  });

  it("creates and verifies a charge-bound payment status token", () => {
    const now = new Date("2026-06-21T12:00:00Z");
    const token = createPaymentStatusToken("pay_123", { now });

    expect(verifyPaymentStatusToken(token, "pay_123", { now })).toEqual({
      ok: true,
      payload: {
        chargeId: "pay_123",
        exp: 1782045000,
        iat: 1782043200,
        purpose: "payment-status",
      },
    });
  });

  it("rejects tokens with an invalid signature", () => {
    const token = createPaymentStatusToken("pay_123");
    const forged = `${token.slice(0, -1)}x`;

    expect(verifyPaymentStatusToken(forged, "pay_123")).toEqual({
      ok: false,
      reason: "invalid",
    });
  });

  it("rejects tokens bound to a different charge", () => {
    const token = createPaymentStatusToken("pay_123");

    expect(verifyPaymentStatusToken(token, "pay_456")).toEqual({
      ok: false,
      reason: "mismatch",
    });
  });

  it("rejects expired tokens", () => {
    const issuedAt = new Date("2026-06-21T12:00:00Z");
    const token = createPaymentStatusToken("pay_123", { now: issuedAt, ttlSeconds: 60 });

    expect(
      verifyPaymentStatusToken(token, "pay_123", {
        now: new Date("2026-06-21T12:02:00Z"),
      }),
    ).toEqual({ ok: false, reason: "expired" });
  });
});
