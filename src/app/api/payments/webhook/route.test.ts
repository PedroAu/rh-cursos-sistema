const { createAdminClient, getAsaasEnv } = vi.hoisted(() => ({
  createAdminClient: vi.fn(),
  getAsaasEnv: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient,
}));

vi.mock("@/lib/asaas/env", () => ({
  getAsaasEnv,
}));

function buildRequest(body: unknown, token = "secret-token") {
  return new Request("https://example.com/api/payments/webhook", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "asaas-access-token": token,
    },
    body: JSON.stringify(body),
  });
}

function buildPayload(overrides: Record<string, unknown> = {}) {
  return {
    id: "evt_123",
    event: "PAYMENT_CONFIRMED",
    payment: {
      id: "pay_123",
      status: "CONFIRMED",
    },
    ...overrides,
  };
}

function buildSupabaseMock(options: {
  rpcData?: { payment_id: string | null; duplicate: boolean; applied_status: string | null } | null;
  rpcError?: unknown;
}) {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: options.rpcData ?? {
      payment_id: "payment-uuid",
      duplicate: false,
      applied_status: "CONFIRMED",
    },
    error: options.rpcError ?? null,
  });
  const rpc = vi.fn(() => ({ maybeSingle }));

  return { rpc, maybeSingle };
}

describe("POST /api/payments/webhook", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    getAsaasEnv.mockReturnValue({
      apiKey: "asaas-key",
      baseUrl: "https://sandbox.asaas.com/api/v3",
      userAgent: "rh-cursos-tests",
      webhookAuthToken: "secret-token",
    });
  });

  it("rejects missing or invalid webhook auth without writing to Supabase", async () => {
    const { POST } = await import("./route");

    const response = await POST(buildRequest(buildPayload(), "wrong-token"));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "unauthorized" });
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it("rejects a same-length wrong token via constant-time comparison", async () => {
    const { POST } = await import("./route");

    // "secret-token" and "wrong-tokenX" are both 12 bytes, so this exercises the
    // timingSafeEqual byte comparison instead of the length short-circuit.
    const response = await POST(buildRequest(buildPayload(), "wrong-tokenX"));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "unauthorized" });
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it("applies a known-charge event through the atomic webhook RPC", async () => {
    const supabase = buildSupabaseMock({
      rpcData: { payment_id: "payment-uuid", duplicate: false, applied_status: "CONFIRMED" },
    });
    createAdminClient.mockReturnValue(supabase);
    const { POST } = await import("./route");

    const response = await POST(buildRequest(buildPayload()));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      paymentId: "payment-uuid",
      status: "CONFIRMED",
    });
    expect(supabase.rpc).toHaveBeenCalledWith("apply_payment_webhook_event", {
      p_asaas_event_id: "evt_123",
      p_asaas_charge_id: "pay_123",
      p_event_type: "PAYMENT_CONFIRMED",
      p_new_status: "CONFIRMED",
      p_raw_event: buildPayload(),
    });
  });

  it("treats duplicate event ids as already processed without route-level side effects", async () => {
    const supabase = buildSupabaseMock({
      rpcData: { payment_id: "payment-uuid", duplicate: true, applied_status: "CONFIRMED" },
    });
    createAdminClient.mockReturnValue(supabase);
    const { POST } = await import("./route");

    const response = await POST(buildRequest(buildPayload()));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, duplicate: true });
    expect(supabase.rpc).toHaveBeenCalledTimes(1);
  });

  it("records unknown charges for audit and returns success", async () => {
    const supabase = buildSupabaseMock({
      rpcData: { payment_id: null, duplicate: false, applied_status: null },
    });
    createAdminClient.mockReturnValue(supabase);
    const { POST } = await import("./route");

    const response = await POST(buildRequest(buildPayload()));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      paymentId: null,
      status: null,
    });
    expect(supabase.rpc).toHaveBeenCalledWith(
      "apply_payment_webhook_event",
      expect.objectContaining({
        p_asaas_charge_id: "pay_123",
        p_new_status: "CONFIRMED",
      }),
    );
  });

  it("audits unknown Asaas statuses without casting them to the payment_status enum", async () => {
    const supabase = buildSupabaseMock({
      rpcData: { payment_id: "payment-uuid", duplicate: false, applied_status: "CONFIRMED" },
    });
    createAdminClient.mockReturnValue(supabase);
    const { POST } = await import("./route");
    const payload = buildPayload({
      payment: { id: "pay_123", status: "NEW_ASAAS_STATUS" },
    });

    const response = await POST(buildRequest(payload));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      paymentId: "payment-uuid",
      status: "CONFIRMED",
    });
    expect(supabase.rpc).toHaveBeenCalledWith(
      "apply_payment_webhook_event",
      expect.objectContaining({
        p_new_status: null,
        p_raw_event: payload,
      }),
    );
  });

  it("returns a controlled error for malformed payloads", async () => {
    const { POST } = await import("./route");

    const response = await POST(buildRequest({ id: "evt_123", event: "PAYMENT_CONFIRMED" }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "unsupported webhook payload" });
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it("returns a controlled error when atomic webhook processing fails", async () => {
    const supabase = buildSupabaseMock({
      rpcError: new Error("transaction failed"),
    });
    createAdminClient.mockReturnValue(supabase);
    const { POST } = await import("./route");

    const response = await POST(buildRequest(buildPayload()));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "payment webhook processing failed" });
  });

  it("echoes the persisted status returned by the RPC when a stale event is ignored", async () => {
    const supabase = buildSupabaseMock({
      rpcData: { payment_id: "payment-uuid", duplicate: false, applied_status: "RECEIVED" },
    });
    createAdminClient.mockReturnValue(supabase);
    const { POST } = await import("./route");
    const stalePayload = buildPayload({
      event: "PAYMENT_OVERDUE",
      payment: { id: "pay_123", status: "OVERDUE" },
    });

    const response = await POST(buildRequest(stalePayload));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      paymentId: "payment-uuid",
      status: "RECEIVED",
    });
  });

  it("can process a redelivery after a previous transaction failure", async () => {
    const failingSupabase = buildSupabaseMock({
      rpcError: new Error("transaction failed"),
    });
    const succeedingSupabase = buildSupabaseMock({
      rpcData: { payment_id: "payment-uuid", duplicate: false, applied_status: "CONFIRMED" },
    });
    createAdminClient
      .mockReturnValueOnce(failingSupabase)
      .mockReturnValueOnce(succeedingSupabase);
    const { POST } = await import("./route");

    const failedResponse = await POST(buildRequest(buildPayload()));
    const redeliveryResponse = await POST(buildRequest(buildPayload()));

    expect(failedResponse.status).toBe(500);
    expect(redeliveryResponse.status).toBe(200);
    expect(await redeliveryResponse.json()).toEqual({
      ok: true,
      paymentId: "payment-uuid",
      status: "CONFIRMED",
    });
    expect(failingSupabase.rpc).toHaveBeenCalledTimes(1);
    expect(succeedingSupabase.rpc).toHaveBeenCalledTimes(1);
  });
});
