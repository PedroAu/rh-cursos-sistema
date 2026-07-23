import { describe, expect, it } from "vitest";

import { getRecoveryRedirectUrl, safeRecoveryNext, validatePassword } from "@/lib/password-recovery";

describe("password recovery helpers", () => {
  it("valida uma senha forte", () => {
    expect(validatePassword("SenhaForte123!")).toBeNull();
    expect(validatePassword("fraca")).toMatch(/pelo menos/);
    expect(validatePassword("senha sem numero!A")).toMatch(/número/);
  });

  it("não permite redirecionamento externo", () => {
    expect(safeRecoveryNext("https://evil.example")).toBe("/recuperar-senha?mode=update");
    expect(safeRecoveryNext("/recuperar-senha?mode=update")).toBe("/recuperar-senha?mode=update");
  });

  it("monta callback usando a origem quando não há URL configurada", () => {
    const configured = process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    try {
      expect(getRecoveryRedirectUrl("https://app.example")).toBe(
        "https://app.example/auth/confirm?next=/recuperar-senha"
      );
    } finally {
      if (configured === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
      else process.env.NEXT_PUBLIC_APP_URL = configured;
    }
  });
});
