import { createPixOrBoletoCharge } from "@/app/actions/payment";

const { createAdminClient, createCharge, createCustomer, getPixQrCode, getBoletoIdentification } =
  vi.hoisted(() => ({
    createAdminClient: vi.fn(),
    createCharge: vi.fn(),
    createCustomer: vi.fn(),
    getPixQrCode: vi.fn(),
    getBoletoIdentification: vi.fn(),
  }));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient,
}));

vi.mock("@/lib/asaas/client", () => ({
  createCharge,
  createCustomer,
  getPixQrCode,
  getBoletoIdentification,
  getCharge: vi.fn(),
}));

function buildSupabaseMock(options: {
  courseRow?: { id: string; preco: number } | null;
  courseError?: unknown;
  insertError?: unknown;
}) {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: options.courseRow ?? null,
    error: options.courseError ?? null,
  });
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const insert = vi.fn().mockResolvedValue({ error: options.insertError ?? null });

  const from = vi.fn((table: string) => {
    if (table === "courses") {
      return { select };
    }
    if (table === "payments") {
      return { insert };
    }
    throw new Error(`Unexpected table: ${table}`);
  });

  return { from, select, eq, maybeSingle, insert };
}

describe("createPixOrBoletoCharge", () => {
  const originalSecret = process.env.PAYMENT_STATUS_TOKEN_SECRET;

  beforeEach(() => {
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

  it("derives the amount from courses.preco and ignores a forged client amount (AC-8)", async () => {
    const supabaseMock = buildSupabaseMock({
      courseRow: { id: "11111111-1111-1111-1111-111111111111", preco: 199.9 },
    });
    createAdminClient.mockReturnValue(supabaseMock);
    createCustomer.mockResolvedValue({ id: "cus_123" });
    createCharge.mockResolvedValue({ id: "pay_123", status: "PENDING" });
    getPixQrCode.mockResolvedValue({ encodedImage: "img-data", payload: "copia-e-cola" });

    const result = await createPixOrBoletoCharge(
      {
        courseSlug: "curso-exemplo",
        enrollmentRef: "enr-1",
        billingType: "PIX",
        amount: 1, // forged client amount — must be ignored
      },
      { name: "Maria", cpfCnpj: "12345678900" },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.statusToken).toEqual(expect.any(String));
    }

    // Asaas charge must be created with the server-derived reais value, not the forged amount.
    expect(createCharge).toHaveBeenCalledWith(
      expect.objectContaining({ value: 199.9 }),
    );

    // payments row insert must carry the server-derived amount_cents + snapshot.
    expect(supabaseMock.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        amount_cents: 19990,
        course_preco_snapshot: 199.9,
        course_id: "11111111-1111-1111-1111-111111111111",
        enrollment_ref: "enr-1",
        asaas_charge_id: "pay_123",
        asaas_customer_id: "cus_123",
        billing_type: "PIX",
        status: "PENDING",
      }),
    );
  });

  it("fails loudly when the course cannot be resolved to a courses.id uuid (FLAG-A)", async () => {
    const supabaseMock = buildSupabaseMock({ courseRow: null });
    createAdminClient.mockReturnValue(supabaseMock);

    const result = await createPixOrBoletoCharge(
      { courseSlug: "curso-inexistente", billingType: "PIX" },
      { name: "Maria", cpfCnpj: "12345678900" },
    );

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/curso-inexistente/);
    expect(createCustomer).not.toHaveBeenCalled();
    expect(createCharge).not.toHaveBeenCalled();
  });

  it("creates a Boleto charge and persists the linha digitável + bankSlipUrl", async () => {
    const supabaseMock = buildSupabaseMock({
      courseRow: { id: "22222222-2222-2222-2222-222222222222", preco: 49.99 },
    });
    createAdminClient.mockReturnValue(supabaseMock);
    createCustomer.mockResolvedValue({ id: "cus_456" });
    createCharge.mockResolvedValue({
      id: "pay_456",
      status: "PENDING",
      bankSlipUrl: "https://sandbox.asaas.com/b/pay_456.pdf",
    });
    getBoletoIdentification.mockResolvedValue({ identificationField: "34191.79001 ..." });

    const result = await createPixOrBoletoCharge(
      { courseSlug: "curso-boleto", billingType: "BOLETO" },
      { name: "João", cpfCnpj: "98765432100" },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.statusToken).toEqual(expect.any(String));
      expect(result.boleto).toEqual({
        url: "https://sandbox.asaas.com/b/pay_456.pdf",
        linhaDigitavel: "34191.79001 ...",
      });
    }

    expect(supabaseMock.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        amount_cents: 4999,
        course_preco_snapshot: 49.99,
        boleto_url: "https://sandbox.asaas.com/b/pay_456.pdf",
        boleto_linha_digitavel: "34191.79001 ...",
      }),
    );
  });

  it("returns an error and does not insert when no course identity is supplied", async () => {
    const supabaseMock = buildSupabaseMock({ courseRow: null });
    createAdminClient.mockReturnValue(supabaseMock);

    const result = await createPixOrBoletoCharge(
      { billingType: "PIX" },
      { name: "Maria", cpfCnpj: "12345678900" },
    );

    expect(result.success).toBe(false);
    expect(supabaseMock.insert).not.toHaveBeenCalled();
  });

  it("fails before external side effects when the status token secret is missing", async () => {
    delete process.env.PAYMENT_STATUS_TOKEN_SECRET;

    const result = await createPixOrBoletoCharge(
      { courseSlug: "curso-exemplo", billingType: "PIX" },
      { name: "Maria", cpfCnpj: "12345678900" },
    );

    expect(result).toEqual({
      error: "Configuração de pagamento indisponível.",
      success: false,
    });
    expect(createAdminClient).not.toHaveBeenCalled();
    expect(createCustomer).not.toHaveBeenCalled();
    expect(createCharge).not.toHaveBeenCalled();
  });
});
