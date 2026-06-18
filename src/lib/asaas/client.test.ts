import {
  createCharge,
  createCustomer,
  getBoletoIdentification,
  getCharge,
  getPixQrCode,
} from "@/lib/asaas/client";

const ENV_KEYS = [
  "ASAAS_API_KEY",
  "ASAAS_BASE_URL",
  "ASAAS_USER_AGENT",
  "ASAAS_WEBHOOK_AUTH_TOKEN",
] as const;

function setAsaasEnv() {
  process.env.ASAAS_API_KEY = "$aact_hmlg_test-key";
  process.env.ASAAS_BASE_URL = "https://api-sandbox.asaas.com/v3";
  process.env.ASAAS_USER_AGENT = "rh-cursos-sandbox";
  process.env.ASAAS_WEBHOOK_AUTH_TOKEN = "whtoken";
}

describe("asaas client", () => {
  const originalEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of ENV_KEYS) {
      originalEnv[key] = process.env[key];
    }
    setAsaasEnv();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (originalEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalEnv[key];
      }
    }
    vi.unstubAllGlobals();
  });

  function mockFetchOnce(body: unknown, ok = true) {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok,
      status: ok ? 200 : 400,
      statusText: ok ? "OK" : "Bad Request",
      json: async () => body,
    });
  }

  it("sends access_token and User-Agent headers on createCustomer", async () => {
    mockFetchOnce({ id: "cus_123" });

    const result = await createCustomer({ name: "Maria", cpfCnpj: "12345678900" });

    expect(result).toEqual({ id: "cus_123" });
    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("https://api-sandbox.asaas.com/v3/customers");
    expect(init.headers).toMatchObject({
      access_token: "$aact_hmlg_test-key",
      "User-Agent": "rh-cursos-sandbox",
      "Content-Type": "application/json",
    });
  });

  it("sends access_token and User-Agent headers on createCharge with reais value", async () => {
    mockFetchOnce({ id: "pay_123", status: "PENDING" });

    await createCharge({
      customer: "cus_123",
      billingType: "PIX",
      value: 199.9,
      dueDate: "2026-06-20",
      externalReference: "enr-1",
    });

    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("https://api-sandbox.asaas.com/v3/payments");
    expect(init.headers).toMatchObject({
      access_token: "$aact_hmlg_test-key",
      "User-Agent": "rh-cursos-sandbox",
    });

    const body = JSON.parse(init.body as string);
    expect(body.value).toBe(199.9);
    expect(body).not.toHaveProperty("creditCard");
    expect(body).not.toHaveProperty("creditCardHolderInfo");
    expect(body).not.toHaveProperty("creditCardToken");
  });

  it("uses the base URL from env for getPixQrCode and getBoletoIdentification", async () => {
    mockFetchOnce({ encodedImage: "img", payload: "payload" });
    await getPixQrCode("pay_123");
    expect((fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe(
      "https://api-sandbox.asaas.com/v3/payments/pay_123/pixQrCode",
    );

    mockFetchOnce({ identificationField: "linha" });
    await getBoletoIdentification("pay_456");
    expect((fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[1][0]).toBe(
      "https://api-sandbox.asaas.com/v3/payments/pay_456/identificationField",
    );

    const [, qrInit] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(qrInit.headers).toMatchObject({ "User-Agent": "rh-cursos-sandbox" });
  });

  it("includes User-Agent header on getCharge status reads", async () => {
    mockFetchOnce({ id: "pay_123", status: "RECEIVED" });

    await getCharge("pay_123");

    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("https://api-sandbox.asaas.com/v3/payments/pay_123");
    expect(init.headers).toMatchObject({
      access_token: "$aact_hmlg_test-key",
      "User-Agent": "rh-cursos-sandbox",
    });
  });

  it("never includes card fields in any outbound body", async () => {
    mockFetchOnce({ id: "pay_789", status: "PENDING" });

    await createCharge({
      customer: "cus_123",
      billingType: "BOLETO",
      value: 49.99,
      dueDate: "2026-06-25",
    });

    const [, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    const serializedBody = init.body as string;

    for (const forbidden of [
      "creditCard",
      "creditCardHolderInfo",
      "creditCardToken",
      "cardNumber",
      "cvv",
      "securityCode",
    ]) {
      expect(serializedBody).not.toContain(forbidden);
    }
  });

  it("throws when the Asaas API responds with a non-ok status", async () => {
    mockFetchOnce({ errors: [{ description: "bad request" }] }, false);

    await expect(
      createCharge({
        customer: "cus_123",
        billingType: "PIX",
        value: 10,
        dueDate: "2026-06-20",
      }),
    ).rejects.toThrow(/Asaas API error/);
  });
});
