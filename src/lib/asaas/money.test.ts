import { toAmountCents, toAsaasValue } from "@/lib/asaas/money";

describe("asaas money", () => {
  it("converts preco 199.90 to amount_cents 19990 (AC-17)", () => {
    expect(toAmountCents(199.9)).toBe(19990);
  });

  it("converts amount_cents 19990 back to the reais value 199.90, not 19990", () => {
    const amountCents = toAmountCents(199.9);
    const value = toAsaasValue(amountCents);

    expect(value).toBe(199.9);
    expect(value).not.toBe(19990);
  });

  it("rounds half up for fractional-cent edge cases", () => {
    expect(toAmountCents(0.1 * 3)).toBe(30);
    expect(toAmountCents(49.99)).toBe(4999);
    expect(toAmountCents(10.005)).toBe(1001);
    expect(toAmountCents(10.001)).toBe(1000);
  });

  it("round-trips amount_cents to a 2-decimal reais number", () => {
    expect(toAsaasValue(4999)).toBe(49.99);
    expect(toAsaasValue(1)).toBe(0.01);
    expect(toAsaasValue(0)).toBe(0);
  });
});
