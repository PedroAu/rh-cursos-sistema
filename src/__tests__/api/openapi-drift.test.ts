import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildSpecEndpoints,
  detectMethods,
  diffEndpoints,
  listCodeEndpoints,
  normalizeDynamicSegments,
} from "../../../scripts/check-openapi-drift.mjs";

/**
 * Testes de contrato do gate anti-drift (REC-406, AC1/AC4/AC5).
 *
 * Cobrem a normalização de rota dinâmica (`[name]` ↔ `{name}`), o comparador de
 * inventário (path/método ausente ou excedente) com fixtures isoladas, e a
 * superfície real reconciliada rodando o script publicado. Nenhuma rota real é
 * editada para provar falha — as fixtures são entradas sintéticas isoladas.
 */

const scriptPath = resolve(process.cwd(), "scripts/check-openapi-drift.mjs");

function endpoints(entries: Record<string, string[]>): Map<string, string[]> {
  return new Map(Object.entries(entries));
}

describe("normalizeDynamicSegments", () => {
  it("converte segmento dinâmico do Next para path parameter OpenAPI", () => {
    expect(normalizeDynamicSegments("/api/functions/[name]")).toBe("/api/functions/{name}");
  });

  it("converte catch-all para um único parâmetro", () => {
    expect(normalizeDynamicSegments("/api/blog/[...slug]")).toBe("/api/blog/{slug}");
  });

  it("mantém rotas estáticas inalteradas", () => {
    expect(normalizeDynamicSegments("/api/admin/courses")).toBe("/api/admin/courses");
  });
});

describe("detectMethods", () => {
  it("detecta métodos exportados como Route Handlers", () => {
    const content = [
      "export async function GET() {}",
      "export async function POST() {}",
      "export async function DELETE() {}",
    ].join("\n");
    expect(detectMethods(content)).toEqual(["delete", "get", "post"]);
  });

  it("ignora exports que não são métodos HTTP", () => {
    expect(detectMethods("export async function helper() {}")).toEqual([]);
  });
});

describe("buildSpecEndpoints", () => {
  it("normaliza paths dinâmicos declarados na spec", () => {
    const spec = { paths: { "/api/functions/{name}": { get: {}, post: {}, delete: {} } } };
    const specEndpoints = buildSpecEndpoints(spec);
    expect(specEndpoints.get("/api/functions/{name}")).toEqual(["delete", "get", "post"]);
  });

  it("ignora chaves que não são métodos HTTP (parameters, x-*)", () => {
    const spec = { paths: { "/api/functions/{name}": { parameters: [], get: {} } } };
    expect(buildSpecEndpoints(spec).get("/api/functions/{name}")).toEqual(["get"]);
  });
});

describe("diffEndpoints — superfície reconciliada", () => {
  it("não reporta divergência quando código e spec coincidem", () => {
    const code = endpoints({ "/api/admin/courses": ["get"], "/api/functions/{name}": ["delete", "get", "post"] });
    const spec = endpoints({ "/api/admin/courses": ["get"], "/api/functions/{name}": ["delete", "get", "post"] });
    const result = diffEndpoints(code, spec);
    expect(result.missingFromSpec).toEqual([]);
    expect(result.extraInSpec).toEqual([]);
    expect(result.methodMismatches).toEqual([]);
  });

  it("reconhece equivalência `[name]` ↔ `{name}` após normalização", () => {
    const nextPath = normalizeDynamicSegments("/api/functions/[name]");
    const code = endpoints({ [nextPath]: ["delete", "get", "post"] });
    const spec = buildSpecEndpoints({
      paths: { "/api/functions/{name}": { get: {}, post: {}, delete: {} } },
    });
    expect(diffEndpoints(code, spec).methodMismatches).toEqual([]);
    expect(diffEndpoints(code, spec).missingFromSpec).toEqual([]);
  });
});

describe("diffEndpoints — fixtures de drift", () => {
  it("detecta path presente no código e ausente na spec", () => {
    const code = endpoints({ "/api/admin/courses": ["get"] });
    const result = diffEndpoints(code, endpoints({}));
    expect(result.missingFromSpec).toEqual(["/api/admin/courses (GET)"]);
  });

  it("detecta path presente na spec e ausente no código", () => {
    const spec = endpoints({ "/api/ghost": ["get"] });
    const result = diffEndpoints(endpoints({}), spec);
    expect(result.extraInSpec).toEqual(["/api/ghost (GET)"]);
  });

  it("detecta método faltando na spec para a rota dinâmica", () => {
    const code = endpoints({ "/api/functions/{name}": ["delete", "get", "post"] });
    const spec = endpoints({ "/api/functions/{name}": ["get", "post"] });
    const result = diffEndpoints(code, spec);
    expect(result.methodMismatches).toEqual([
      { path: "/api/functions/{name}", missingMethods: ["delete"], extraMethods: [] },
    ]);
  });

  it("detecta método excedente na spec", () => {
    const code = endpoints({ "/api/admin/students": ["get"] });
    const spec = endpoints({ "/api/admin/students": ["get", "post"] });
    const result = diffEndpoints(code, spec);
    expect(result.methodMismatches).toEqual([
      { path: "/api/admin/students", missingMethods: [], extraMethods: ["post"] },
    ]);
  });
});

describe("superfície real", () => {
  it("deriva todas as rotas e métodos publicados do código sem contagem histórica fixa", () => {
    const code = listCodeEndpoints();
    expect(code.size).toBeGreaterThan(0);
    expect(code.has("/api/functions/{name}")).toBe(true);
    expect(code.get("/api/functions/{name}")).toEqual(["delete", "get", "post"]);
    for (const resource of ["classes", "courses", "enrollments", "instructors", "students"]) {
      expect(code.get(`/api/admin/${resource}`)).toEqual(["get"]);
    }
    expect(code.get("/api/auth/ssr-session")).toEqual(["delete", "get", "post"]);
  });

  it("passa o gate anti-drift com a spec versionada", () => {
    const routeCount = listCodeEndpoints().size;
    const output = execFileSync("node", [scriptPath], { encoding: "utf8" });
    expect(output).toContain(`${routeCount} rotas reconciliadas`);
  });
});
