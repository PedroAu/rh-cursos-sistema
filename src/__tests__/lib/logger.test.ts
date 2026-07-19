import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { logger } from "@/lib/logger";

/**
 * REC-408 (AC5): a redaction central do logger deve impedir que token, cookie,
 * senha, e-mail e telefone apareçam na linha serializada — inclusive quando
 * aninhados, em arrays, em erros (message/cause/stack) ou em estruturas
 * circulares. Todos os valores usados aqui são SINTÉTICOS.
 */

function lastLine(spy: ReturnType<typeof vi.spyOn>): string {
  const calls = spy.mock.calls;
  return String(calls[calls.length - 1]?.[0] ?? "");
}

describe("logger — redaction central (REC-408 AC5)", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    infoSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("redige campos sensíveis aninhados por nome", () => {
    logger.info("evento", {
      route: "api/test",
      user: {
        email: "aluno.sintetico@example.test",
        phone: "+5511999998888",
        password: "senha-super-secreta",
        credentials: { access_token: "tok_ABC123", refresh_token: "ref_XYZ789" },
      },
      headers: { authorization: "Bearer synthetic.jwt.value", cookie: "sb=abc123" },
    });

    const line = lastLine(infoSpy);
    expect(line).not.toContain("aluno.sintetico@example.test");
    expect(line).not.toContain("+5511999998888");
    expect(line).not.toContain("senha-super-secreta");
    expect(line).not.toContain("tok_ABC123");
    expect(line).not.toContain("ref_XYZ789");
    expect(line).not.toContain("sb=abc123");
    expect(line).toContain("[REDACTED]");
    // Metadados não sensíveis permanecem.
    expect(line).toContain("api/test");
  });

  it("redige valores com formato de credencial/PII mesmo em campos não sensíveis", () => {
    logger.info("evento", {
      note: "contato aluno.sintetico@example.test via token eyJhbGciOi.JeyJ.sig e Bearer abc.def.ghi",
    });

    const line = lastLine(infoSpy);
    expect(line).not.toContain("aluno.sintetico@example.test");
    expect(line).not.toContain("eyJhbGciOi.JeyJ.sig");
    expect(line).not.toContain("Bearer abc.def.ghi");
    expect(line).toContain("[REDACTED]");
  });

  it("sanea Error.message e Error.cause sem reintroduzir segredo/PII", () => {
    const cause = new Error("root: token=eyJhbGciOi.JeyJ.sig");
    const err = new Error("falha ao processar aluno.sintetico@example.test");
    (err as { cause?: unknown }).cause = cause;

    logger.error("erro de processamento", { err, route: "api/test" });

    const line = lastLine(errorSpy);
    expect(line).not.toContain("aluno.sintetico@example.test");
    expect(line).not.toContain("eyJhbGciOi.JeyJ.sig");
    expect(line).toContain("[REDACTED]");
    expect(line).toContain("api/test");
  });

  it("não emite stack em produção", () => {
    const original = process.env.NODE_ENV;
    // @ts-expect-error override para o cenário de produção
    process.env.NODE_ENV = "production";
    try {
      const err = new Error("boom");
      logger.error("erro", { err });
      const line = lastLine(errorSpy);
      expect(line).not.toContain("stack");
    } finally {
      // @ts-expect-error restauração
      process.env.NODE_ENV = original;
    }
  });

  it("não lança em estrutura circular", () => {
    const circular: Record<string, unknown> = { name: "no-pii" };
    circular.self = circular;

    expect(() => logger.info("circular", { circular })).not.toThrow();
    const line = lastLine(infoSpy);
    expect(line).toContain("[Circular]");
  });
});
