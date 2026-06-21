import { createPaymentStatusToken } from "@/lib/payments/status-token";

const { createAdminClient } = vi.hoisted(() => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient,
}));

function buildRequest(chargeId: string, token?: string) {
  const url = new URL(`https://example.com/api/payments/status/${chargeId}`);

  if (token) {
    url.searchParams.set("token", token);
  }

  return new Request(url);
}

function buildContext(chargeId: string) {
  return { params: Promise.resolve({ chargeId }) };
}

function buildSupabaseMock(options: {
  paymentRow?: { status: string } | null;
  paymentError?: unknown;
}) {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: options.paymentRow ?? null,
    error: options.paymentError ?? null,
  });
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));

  return { from, select, eq, maybeSingle };
}

describe("GET /api/payments/status/[chargeId]", () => {
  const originalSecret = process.env.PAYMENT_STATUS_TOKEN_SECRET;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.PAYMENT_STATUS_TOKEN_SECRET = "test-payment-status-secret";
  });

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.PAYMENT_STATUS_TOKEN_SECRET;
    } else {
      process.env.PAYMENT_STATUS_TOKEN_SECRET = originalSecret;
    }
  });

  it("returns status when a valid charge-bound token is provided", async () => {
    const supabase = buildSupabaseMock({ paymentRow: { status: "CONFIRMED" } });
    createAdminClient.mockReturnValue(supabase);
    const { GET } = await import("./route");
    const token = createPaymentStatusToken("pay_123");

    const response = await GET(buildRequest("pay_123", token), buildContext("pay_123"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "CONFIRMED" });
    expect(supabase.eq).toHaveBeenCalledWith("asaas_charge_id", "pay_123");
  });

  it("rejects requests with only a charge id", async () => {
    const { GET } = await import("./route");

    const response = await GET(buildRequest("pay_123"), buildContext("pay_123"));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "unauthorized" });
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it("rejects invalid tokens with a generic safe error", async () => {
    const { GET } = await import("./route");

    const response = await GET(buildRequest("pay_123", "not-a-valid-token"), buildContext("pay_123"));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "unauthorized" });
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it("rejects mismatched charge id tokens", async () => {
    const { GET } = await import("./route");
    const token = createPaymentStatusToken("pay_123");

    const response = await GET(buildRequest("pay_456", token), buildContext("pay_456"));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "unauthorized" });
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it("rejects expired tokens", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-21T12:00:00Z"));
    const token = createPaymentStatusToken("pay_123", { ttlSeconds: 60 });
    vi.setSystemTime(new Date("2026-06-21T12:02:00Z"));
    const { GET } = await import("./route");

    const response = await GET(buildRequest("pay_123", token), buildContext("pay_123"));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "unauthorized" });
    expect(createAdminClient).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("returns not found for an unknown charge after token validation", async () => {
    const supabase = buildSupabaseMock({ paymentRow: null });
    createAdminClient.mockReturnValue(supabase);
    const { GET } = await import("./route");
    const token = createPaymentStatusToken("pay_unknown");

    const response = await GET(
      buildRequest("pay_unknown", token),
      buildContext("pay_unknown"),
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "payment not found" });
  });

  it("accepts a bearer token as an alternative request contract", async () => {
    const supabase = buildSupabaseMock({ paymentRow: { status: "RECEIVED" } });
    createAdminClient.mockReturnValue(supabase);
    const { GET } = await import("./route");
    const token = createPaymentStatusToken("pay_123");

    const response = await GET(
      new Request("https://example.com/api/payments/status/pay_123", {
        headers: { authorization: `Bearer ${token}` },
      }),
      buildContext("pay_123"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "RECEIVED" });
  });
});
