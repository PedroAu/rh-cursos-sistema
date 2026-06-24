import { describe, expect, it, vi, afterEach } from "vitest";

import { decodeSessionToken } from "@/lib/supabase/session-token";

function toToken(payload: unknown) {
  const encoded = Buffer.from(JSON.stringify(payload), "utf8")
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");

  return `${encoded}.signature`;
}

describe("decodeSessionToken", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("decodes optimistic admin payloads", () => {
    const token = toToken({
      role: "admin",
      email: "admin@rhcursos.com.br",
      name: "Admin RH Cursos",
      exp: Date.now() + 30_000,
    });

    expect(decodeSessionToken(token)).toMatchObject({
      role: "admin",
      email: "admin@rhcursos.com.br",
      name: "Admin RH Cursos",
    });
  });

  it("keeps explicit non-admin roles available for future authorization flows", () => {
    const token = toToken({
      role: "student",
      email: "aluno@rhcursos.com.br",
      name: "Aluno RH Cursos",
      exp: Date.now() + 30_000,
    });

    expect(decodeSessionToken(token)).toMatchObject({
      role: "student",
      email: "aluno@rhcursos.com.br",
      name: "Aluno RH Cursos",
    });
  });

  it("ignores expired payloads restored from local storage", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-24T12:00:00.000Z"));

    const token = toToken({
      role: "admin",
      email: "admin@rhcursos.com.br",
      name: "Admin RH Cursos",
      exp: Date.now() - 1,
    });

    expect(decodeSessionToken(token)).toBeNull();
  });
});
