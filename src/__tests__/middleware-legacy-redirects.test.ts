import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { middleware } from "../../middleware";

const redirectCases = [
  ["/agenda-cursos", "/agenda/"],
  ["/cursos-in-company", "/in-company/"],
  ["/especialista", "/falar-com-especialista/"],
  [
    "/informa-es-do-evento-e-registro/curso-de-interpretacao-dos-requisitos-da-norma-iso-iec-20000-1-1",
    "/cursos/curso-de-interpretacao-dos-requisitos-da-norma-iso-iec-20000-1/",
  ],
] as const;

describe("legacy 404 redirects", () => {
  it.each(redirectCases)("redirects %s directly to the canonical destination", async (source, target) => {
    const request = new NextRequest(`http://rhcursos.com.br${source}?utm_source=legacy`, {
      headers: { host: "rhcursos.com.br", "x-forwarded-proto": "http" },
    });

    const response = await middleware(request);

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe(
      `https://www.rhcursos.com.br${target}?utm_source=legacy`,
    );
    expect(response.headers.get("content-signal")).toBe(
      "search=yes, ai-input=yes, ai-train=yes",
    );
  });

  it("does not redirect a near-match", async () => {
    const request = new NextRequest("https://www.rhcursos.com.br/agenda-cursos-extra");

    const response = await middleware(request);

    expect(response.status).toBe(200);
  });
});
