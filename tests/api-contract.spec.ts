import { expect, test } from "@playwright/test";

import {
  annotateCanonicalDoc,
  createUniqueIp,
  ensureAuthUser,
  getCanonicalDocs,
  getIntegrationEnv,
  hasRealIntegrationEnv,
  loginWithSsrSession,
} from "./helpers/integration-env";

const docs = getCanonicalDocs();
const studentEmail = "student-contract@rhcursos.test";
const studentPassword = "AlunoContrato#2026";

function edgeHeaders(ip: string, origin = "https://rhcursos.com.br") {
  const { publishableKey } = getIntegrationEnv();

  return {
    Authorization: `Bearer ${publishableKey}`,
    apikey: publishableKey,
    Origin: origin,
    "Content-Type": "application/json",
    "x-forwarded-for": ip,
    "x-real-ip": ip,
  };
}

function routeHeaders(ip: string) {
  return {
    "cf-connecting-ip": ip,
    "x-forwarded-for": ip,
    "x-real-ip": ip,
  };
}

function publicEnrollmentPayload(extra: Record<string, unknown> = {}) {
  return {
    studentName: "Pessoa Contrato",
    email: "pre-enrollment-contract@rhcursos.test",
    cpf: "123.456.789-10",
    phone: "(61) 99999-0001",
    courseId: "course-contract",
    classId: "class-contract",
    organization: "",
    jobTitle: "",
    enrollmentType: "Pessoa física",
    notes: "Contrato sintético",
    ...extra,
  };
}

async function edgeRequest(
  path: string,
  options: {
    method?: "GET" | "POST" | "DELETE";
    ip: string;
    origin?: string;
    body?: unknown;
    headers?: Record<string, string>;
  }
) {
  const { functionsBaseUrl } = getIntegrationEnv();

  return fetch(`${functionsBaseUrl}${path}`, {
    method: options.method ?? "POST",
    headers: {
      ...edgeHeaders(options.ip, options.origin),
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
}

test.describe("contratos HTTP — route handler auth-session", () => {
  test("POST valida payload, credenciais, autorização e rate limit", async ({ request }, testInfo) => {
    test.skip(!hasRealIntegrationEnv(), "Requer ambiente Supabase real para contrato auth-session.");
    annotateCanonicalDoc(testInfo, docs.apiCatalog);
    annotateCanonicalDoc(testInfo, docs.authSession);

    await ensureAuthUser({
      email: studentEmail,
      name: "Aluno Contrato",
      password: studentPassword,
      role: "student",
    });

    const invalidBody = await request.post("/api/auth/session", {
      data: { role: "admin", email: "", password: "" },
      headers: routeHeaders(createUniqueIp("next-auth-invalid-body")),
    });
    expect(invalidBody.status()).toBe(400);
    await expect(invalidBody.json()).resolves.toEqual({
      ok: false,
      error: "Dados de login invalidos.",
    });

    const invalidCredentials = await request.post("/api/auth/session", {
      data: { role: "admin", email: "nao-existe@rhcursos.test", password: "senha-errada" },
      headers: routeHeaders(createUniqueIp("next-auth-invalid-credentials")),
    });
    expect(invalidCredentials.status()).toBe(401);
    await expect(invalidCredentials.json()).resolves.toMatchObject({
      ok: false,
      error: "Credenciais invalidas.",
    });

    const unauthorizedRole = await request.post("/api/auth/session", {
      data: { role: "admin", email: studentEmail, password: studentPassword },
      headers: routeHeaders(createUniqueIp("next-auth-unauthorized-role")),
    });
    expect(unauthorizedRole.status()).toBe(403);
    await expect(unauthorizedRole.json()).resolves.toMatchObject({
      ok: false,
      error: "Acesso nao autorizado.",
    });

    const rateLimitIp = createUniqueIp("next-auth-rate-limit");
    let rateLimited: Awaited<ReturnType<typeof request.post>> | null = null;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      rateLimited = await request.post("/api/auth/session", {
        data: { role: "admin", email: "nao-existe@rhcursos.test", password: "senha-errada" },
        headers: routeHeaders(rateLimitIp),
      });
    }

    expect([401, 429]).toContain(rateLimited?.status());
    if (rateLimited?.status() === 429) {
      expect(Number(rateLimited.headers()["retry-after"] ?? "0")).toBeGreaterThan(0);
      await expect(rateLimited.json()).resolves.toEqual({
        ok: false,
        error: "Muitas tentativas. Tente novamente mais tarde.",
      });
    }
  });

  test("DELETE encerra a sessão global mesmo sem access token explícito", async ({ request }, testInfo) => {
    annotateCanonicalDoc(testInfo, docs.authSession);

    const response = await request.delete("/api/auth/session", {
      data: {},
      headers: routeHeaders(createUniqueIp("next-auth-delete")),
    });

    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      mode: "global",
      revoked: true,
    });
  });
});

test.describe("contratos HTTP — edge functions", () => {
  test("auth-session edge foi removida do contrato público", async ({}, testInfo) => {
    test.skip(!hasRealIntegrationEnv(), "Requer edge functions reais do Supabase.");
    annotateCanonicalDoc(testInfo, docs.apiCatalog);
    annotateCanonicalDoc(testInfo, docs.edgeFunctions);

    const removedFunction = await edgeRequest("/auth-session", {
      body: { role: "admin", email: "", password: "" },
      ip: createUniqueIp("edge-auth-removed"),
    });
    expect(removedFunction.status).toBe(404);
  });

  test("enrollments e leads cobrem 400, 403 e 405 mínimos", async ({ request }, testInfo) => {
    test.skip(!hasRealIntegrationEnv(), "Requer edge functions reais do Supabase.");
    annotateCanonicalDoc(testInfo, docs.edgeFunctions);
    const { functionsBaseUrl } = getIntegrationEnv();

    const enrollmentInvalid = await request.post(`${functionsBaseUrl}/enrollments`, {
      data: { foo: "bar" },
      headers: edgeHeaders(createUniqueIp("edge-enrollments-invalid")),
    });
    expect(enrollmentInvalid.status()).toBe(400);
    await expect(enrollmentInvalid.json()).resolves.toMatchObject({
      ok: false,
      error: "Validation failed",
    });

    const routeFinancialField = await request.post("/api/enrollments", {
      data: publicEnrollmentPayload({ paymentMethod: "Pix" }),
      headers: routeHeaders(createUniqueIp("next-enrollments-financial-field")),
    });
    expect(routeFinancialField.status()).toBe(400);
    await expect(routeFinancialField.json()).resolves.toMatchObject({
      ok: false,
      error: "Validation failed",
    });

    const edgeFinancialField = await request.post(`${functionsBaseUrl}/enrollments`, {
      data: publicEnrollmentPayload({ cardCvv: "synthetic-value" }),
      headers: edgeHeaders(createUniqueIp("edge-enrollments-financial-field")),
    });
    expect(edgeFinancialField.status()).toBe(400);
    await expect(edgeFinancialField.json()).resolves.toMatchObject({
      ok: false,
      error: "Validation failed",
    });

    const enrollmentForbidden = await request.post(`${functionsBaseUrl}/enrollments`, {
      data: { foo: "bar" },
      headers: edgeHeaders(createUniqueIp("edge-enrollments-forbidden"), "https://forbidden.example"),
    });
    expect(enrollmentForbidden.status()).toBe(403);

    const enrollment405 = await request.get(`${functionsBaseUrl}/enrollments`, {
      headers: edgeHeaders(createUniqueIp("edge-enrollments-405")),
    });
    expect(enrollment405.status()).toBe(405);

    const leadInvalid = await request.post(`${functionsBaseUrl}/leads`, {
      data: { name: "Lead sem campos mínimos" },
      headers: edgeHeaders(createUniqueIp("edge-leads-invalid")),
    });
    expect(leadInvalid.status()).toBe(400);
    await expect(leadInvalid.json()).resolves.toEqual({
      ok: false,
      error: "Campos obrigatórios ausentes.",
    });

    const leadForbidden = await request.post(`${functionsBaseUrl}/leads`, {
      data: { name: "Lead sem campos mínimos" },
      headers: edgeHeaders(createUniqueIp("edge-leads-forbidden"), "https://forbidden.example"),
    });
    expect(leadForbidden.status()).toBe(403);

    const lead405 = await request.get(`${functionsBaseUrl}/leads`, {
      headers: edgeHeaders(createUniqueIp("edge-leads-405")),
    });
    expect(lead405.status()).toBe(405);
  });

  test("admin-resources cobre 401, 405 e 422", async ({ context, baseURL }, testInfo) => {
    test.skip(!hasRealIntegrationEnv(), "Requer edge functions reais do Supabase.");
    annotateCanonicalDoc(testInfo, docs.edgeFunctions);

    const unauthorized = await edgeRequest("/admin-resources", {
      body: { resource: "leads", action: "list" },
      ip: createUniqueIp("edge-admin-401"),
    });
    expect(unauthorized.status).toBe(401);
    await expect(unauthorized.json()).resolves.toEqual({
      ok: false,
      error: "Não autorizado.",
    });

    const methodNotAllowed = await edgeRequest("/admin-resources", {
      method: "GET",
      ip: createUniqueIp("edge-admin-405"),
    });
    expect(methodNotAllowed.status).toBe(405);
    await expect(methodNotAllowed.json()).resolves.toEqual({
      ok: false,
      error: "Method not allowed",
    });

    await loginWithSsrSession({
      baseURL: baseURL ?? "http://127.0.0.1:3100",
      context,
      role: "admin",
      name: "Administrador RH Cursos",
    });

    const invalidMutation = await context.request.post(
      new URL("/api/functions/admin-resources", baseURL ?? "http://127.0.0.1:3100").toString(),
      {
      data: { resource: "leads", action: "update-status", id: "lead-1", status: "status-invalido" },
      headers: {
        "x-rh-client-ip": createUniqueIp("edge-admin-422"),
      },
      }
    );
    expect(invalidMutation.status()).toBe(422);
    await expect(invalidMutation.json()).resolves.toMatchObject({
      ok: false,
      error: expect.stringMatching(/status/i),
    });
  });
});
