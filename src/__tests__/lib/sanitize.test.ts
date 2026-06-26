import { describe, expect, it } from "vitest";

import { isSafeUrl, sanitizeHtml, sanitizeText } from "@/lib/security/sanitize";

describe("security sanitization", () => {
  it("removes unsafe html on the server fallback", () => {
    const previousWindow = globalThis.window;
    Reflect.deleteProperty(globalThis, "window");

    let sanitized = "";
    const unsafeMarkup =
      '<p>ok</p><' +
      'img src="x" onerror="alert(1)"><a href="javascript:alert(2)">x</a><script>alert(3)</script>';
    try {
      sanitized = sanitizeHtml(unsafeMarkup);
    } finally {
      globalThis.window = previousWindow;
    }

    expect(sanitized).toContain("<p>ok</p>");
    expect(sanitized).not.toContain("<script");
    expect(sanitized).not.toContain("onerror");
    expect(sanitized).not.toContain("javascript:");
  });

  it("returns plain text without html tags", () => {
    expect(sanitizeText("<strong>RH</strong> Cursos")).toBe("RH Cursos");
  });

  it("rejects javascript urls", () => {
    expect(isSafeUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeUrl("https://rhcursos.com.br")).toBe(true);
  });
});
