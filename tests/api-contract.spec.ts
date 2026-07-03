import { expect, test } from "@playwright/test";

import {
  annotateCanonicalDoc,
  createUniqueIp,
  ensureAuthUser,
  getCanonicalDocs,
  getIntegrationEnv,
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
  };
}

async function loginAsAdmin(request: import("@playwright/test").APIRequestContext) {
  const { adminEmail, adminPassword } = getIntegrationEnv();

  await ensureAuthUser({
    email: adminEmail,
    name: "Administrador RH Cursos",
    password: adminPassword,
    role: "admin",
  });

  const response = await request.post("/api/auth/session", {
    data: { role: "admin", email: adminEmail, password: adminPassword },
    headers: { "x-forwarded-for": createUniqueIp("api-contract-admin-login") },
  });

  expect(response.ok()).toBeTruthy();
  return (await response.json()) as { token: string };
}

async function loginAsAdminEdge(request: import("@playwright/test").APIRequestContext) {
  const { adminEmail, adminPassword, functionsBaseUrl } = getIntegrationEnv();

  await ensureAuthUser({
    email: adminEmail,
    name: "Administrador RH Cursos",
    password: adminPassword,
    role: "admin",
  });

  const response = await request.post(`${functionsBaseUrl}/auth-session`, {
    data: { role: "admin", email: adminEmail, password: adminPassword },
    headers: edgeHeaders(createUniqueIp("edge-admin-login")),
  });

  expect(response.ok()).toBeTruthy();
  return (await response.json()) as { token: string };
}

test.describe("contratos HTTP — route handler auth-session", () => {
  test("POST valida payload, credenciais, autorização e rate limit", async ({ request }, testInfo) => {
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
      headers: { "x-forwarded-for": createUniqueIp("next-auth-invalid-body") },
    });
    expect(invalidBody.status()).toBe(400);
    await expect(invalidBody.json()).resolves.toEqual({
      ok: false,
      error: "Dados de login invalidos.",
    });

    const invalidCredentials = await request.post("/api/auth/session", {
      data: { role: "admin", email: "nao-existe@rhcursos.test", password: "senha-errada" },
      headers: { "x-forwarded-for": createUniqueIp("next-auth-invalid-credentials") },
    });
    expect(invalidCredentials.status()).toBe(401);
    await expect(invalidCredentials.json()).resolves.toEqual({
      ok: false,
      error: "Credenciais invalidas.",
    });

    const unauthorizedRole = await request.post("/api/auth/session", {
      data: { role: "admin", email: studentEmail, password: studentPassword },
      headers: { "x-forwarded-for": createUniqueIp("next-auth-unauthorized-role") },
    });
    expect(unauthorizedRole.status()).toBe(403);
    await expect(unauthorizedRole.json()).resolves.toEqual({
      ok: false,
      error: "Acesso nao autorizado.",
    });

    const rateLimitIp = createUniqueIp("next-auth-rate-limit");
    let rateLimited: Awaited<ReturnType<typeof request.post>> | null = null;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      rateLimited = await request.post("/api/auth/session", {
        data: { role: "admin", email: "nao-existe@rhcursos.test", password: "senha-errada" },
        headers: { "x-forwarded-for": rateLimitIp },
      });
    }

    expect(rateLimited?.status()).toBe(429);
    expect(Number(rateLimited?.headers()["retry-after"] ?? "0")).toBeGreaterThan(0);
    await expect(rateLimited?.json() ?? Promise.resolve(null)).resolves.toEqual({
      ok: false,
      error: "Muitas tentativas. Tente novamente mais tarde.",
    });
  });

  test("DELETE mantém contrato local-only quando não recebe access token", async ({ request }, testInfo) => {
    annotateCanonicalDoc(testInfo, docs.authSession);

    const response = await request.delete("/api/auth/session", {
      data: {},
      headers: { "x-forwarded-for": createUniqueIp("next-auth-delete") },
    });

    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      mode: "local-only",
      revoked: false,
    });
  });
});

test.describe("contratos HTTP — edge functions", () => {
  test("auth-session cobre 400, 403 e 405", async ({ request }, testInfo) => {
    annotateCanonicalDoc(testInfo, docs.apiCatalog);
    annotateCanonicalDoc(testInfo, docs.edgeFunctions);
    const { functionsBaseUrl } = getIntegrationEnv();

    const invalidBody = await request.post(`${functionsBaseUrl}/auth-session`, {
      data: { role: "admin", email: "", password: "" },
      headers: edgeHeaders(createUniqueIp("edge-auth-invalid-body")),
    });
    expect(invalidBody.status()).toBe(400);
    await expect(invalidBody.json()).resolves.toEqual({
      ok: false,
      error: "Dados de login inválidos.",
    });

    const forbiddenOrigin = await request.post(`${functionsBaseUrl}/auth-session`, {
      data: { role: "admin", email: "", password: "" },
      headers: edgeHeaders(createUniqueIp("edge-auth-forbidden"), "https://forbidden.example"),
    });
    expect(forbiddenOrigin.status()).toBe(403);
    await expect(forbiddenOrigin.json()).resolves.toEqual({
      ok: false,
      error: "Origin not allowed",
    });

    const methodNotAllowed = await request.get(`${functionsBaseUrl}/auth-session`, {
      headers: edgeHeaders(createUniqueIp("edge-auth-405")),
    });
    expect(methodNotAllowed.status()).toBe(405);
    await expect(methodNotAllowed.json()).resolves.toEqual({
      ok: false,
      error: "Method not allowed",
    });
  });

  test("enrollments e leads cobrem 400, 403 e 405 mínimos", async ({ request }, testInfo) => {
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

  test("admin-resources cobre 401, 405 e 422", async ({ request }, testInfo) => {
    annotateCanonicalDoc(testInfo, docs.edgeFunctions);
    const { functionsBaseUrl } = getIntegrationEnv();

    const unauthorized = await request.post(`${functionsBaseUrl}/admin-resources`, {
      data: { resource: "leads", action: "list" },
      headers: edgeHeaders(createUniqueIp("edge-admin-401")),
    });
    expect(unauthorized.status()).toBe(401);
    await expect(unauthorized.json()).resolves.toEqual({
      ok: false,
      error: "Não autorizado.",
    });

    const methodNotAllowed = await request.get(`${functionsBaseUrl}/admin-resources`, {
      headers: edgeHeaders(createUniqueIp("edge-admin-405")),
    });
    expect(methodNotAllowed.status()).toBe(405);
    await expect(methodNotAllowed.json()).resolves.toEqual({
      ok: false,
      error: "Method not allowed",
    });

    const { token } = await loginAsAdminEdge(request);

    const invalidMutation = await request.post(`${functionsBaseUrl}/admin-resources`, {
      data: { resource: "leads", action: "update-status", id: "lead-1", status: "status-invalido" },
      headers: {
        ...edgeHeaders(createUniqueIp("edge-admin-422")),
        "x-rh-session": token,
      },
    });
    expect(invalidMutation.status()).toBe(422);
    await expect(invalidMutation.json()).resolves.toMatchObject({
      ok: false,
      error: expect.any(String),
    });
  });
});
