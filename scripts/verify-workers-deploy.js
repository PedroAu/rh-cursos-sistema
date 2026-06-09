#!/usr/bin/env node

const DEFAULT_ATTEMPTS = Number.parseInt(process.env.WORKERS_VERIFY_ATTEMPTS ?? "6", 10);
const DEFAULT_DELAY_MS = Number.parseInt(process.env.WORKERS_VERIFY_DELAY_MS ?? "5000", 10);
const canonicalUrl = process.env.DEPLOY_CANONICAL_URL ?? process.env.NEXT_PUBLIC_APP_URL;

function fail(message) {
  console.error(`\n❌ ${message}`);
  process.exit(1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getHeader(headers, name) {
  return headers.get(name) ?? headers.get(name.toLowerCase()) ?? "";
}

function expectHeader(headers, name) {
  const value = getHeader(headers, name);
  if (!value) {
    throw new Error(`Header ausente: ${name}`);
  }

  return value;
}

async function fetchWithRetry(url, options, validate, label) {
  let lastError;

  for (let attempt = 1; attempt <= DEFAULT_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "manual",
        headers: {
          "user-agent": "site-rh-cursos-workers-verifier/1.0",
        },
        ...options,
      });

      validate(response);
      console.log(`✅ ${label} (${response.status})`);
      return response;
    } catch (error) {
      lastError = error;
      const details = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️  ${label} tentativa ${attempt}/${DEFAULT_ATTEMPTS}: ${details}`);

      if (attempt < DEFAULT_ATTEMPTS) {
        await sleep(DEFAULT_DELAY_MS);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

if (!canonicalUrl) {
  fail("Defina DEPLOY_CANONICAL_URL ou NEXT_PUBLIC_APP_URL.");
}

const canonical = new URL(canonicalUrl);
const apexOrigin =
  process.env.DEPLOY_APEX_URL ??
  `${canonical.protocol}//${canonical.hostname.replace(/^www\./, "")}`;
const apex = new URL(apexOrigin);

if (canonical.hostname === apex.hostname) {
  fail("DEPLOY_APEX_URL precisa apontar para o host apex quando o canônico usa www.");
}

const requiredSecurityHeaders = [
  "Content-Security-Policy",
  "Strict-Transport-Security",
  "Permissions-Policy",
  "Referrer-Policy",
  "X-Content-Type-Options",
  "X-Frame-Options",
  "X-XSS-Protection",
];

async function main() {
  console.log("🔎 Verificando deploy em Cloudflare Workers");
  console.log(`   Canonical: ${canonical.origin}`);
  console.log(`   Apex:      ${apex.origin}`);
  console.log(`   Tentativas: ${DEFAULT_ATTEMPTS} (delay ${DEFAULT_DELAY_MS}ms)\n`);

  await fetchWithRetry(
    canonical.origin,
    {},
    (response) => {
      if (response.status !== 200) {
        throw new Error(`Esperado 200 no host canônico, recebido ${response.status}`);
      }

      for (const headerName of requiredSecurityHeaders) {
        expectHeader(response.headers, headerName);
      }
    },
    "Homepage canônica responde com headers de segurança"
  );

  const adminPath = "/admin/";
  await fetchWithRetry(
    new URL(adminPath, canonical).toString(),
    {},
    (response) => {
      if (![307, 308].includes(response.status)) {
        throw new Error(`Esperado redirect auth no admin, recebido ${response.status}`);
      }

      const location = expectHeader(response.headers, "location");
      if (!location.includes("/login?status=required")) {
        throw new Error(`Redirect inesperado do admin: ${location}`);
      }

      for (const headerName of requiredSecurityHeaders) {
        expectHeader(response.headers, headerName);
      }
    },
    "Admin exige autenticação no runtime SSR"
  );

  await fetchWithRetry(
    apex.origin,
    {},
    (response) => {
      if (![301, 308].includes(response.status)) {
        throw new Error(`Esperado redirect do apex, recebido ${response.status}`);
      }

      const location = expectHeader(response.headers, "location");
      const expectedPrefix = canonical.origin;

      if (!location.startsWith(expectedPrefix)) {
        throw new Error(`Apex redirecionou para destino inesperado: ${location}`);
      }

      for (const headerName of requiredSecurityHeaders) {
        expectHeader(response.headers, headerName);
      }
    },
    "Apex redireciona para o host canônico"
  );

  console.log("\n✅ Verificação pós-deploy concluída.");
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
