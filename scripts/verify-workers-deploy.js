#!/usr/bin/env node

const attempts = Number.parseInt(process.env.WORKERS_VERIFY_ATTEMPTS ?? "6", 10);
const delayMs = Number.parseInt(process.env.WORKERS_VERIFY_DELAY_MS ?? "5000", 10);
const canonicalUrl = process.env.DEPLOY_CANONICAL_URL;
const apexUrl = process.env.DEPLOY_APEX_URL;

function fail(message) {
  console.error(`\nDeploy verification failed: ${message}`);
  process.exit(1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, validate, label) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "manual",
        headers: {
          "user-agent": "rh-cursos-workers-verifier/1.0",
        },
      });

      await validate(response);
      console.log(`${label}: ${response.status}`);
      return;
    } catch (error) {
      lastError = error;
      const details = error instanceof Error ? error.message : String(error);
      console.warn(`${label} attempt ${attempt}/${attempts}: ${details}`);

      if (attempt < attempts) {
        await sleep(delayMs);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function expectBodyIncludes(response, text) {
  const body = await response.text();

  if (!body.includes(text)) {
    throw new Error(`Body does not include expected text: ${text}`);
  }
}

async function main() {
  if (!canonicalUrl || !apexUrl) {
    fail("Set DEPLOY_CANONICAL_URL and DEPLOY_APEX_URL.");
  }

  const canonical = new URL(canonicalUrl);
  const apex = new URL(apexUrl);

  await fetchWithRetry(
    canonical.origin,
    async (response) => {
      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }

      await expectBodyIncludes(response, "RH Cursos");
    },
    "canonical homepage",
  );

  await fetchWithRetry(
    new URL("/cursos", canonical).toString(),
    async (response) => {
      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }

      await expectBodyIncludes(response, "Cursos");
    },
    "course catalog",
  );

  await fetchWithRetry(
    apex.origin,
    async (response) => {
      if (![200, 301, 302, 307, 308].includes(response.status)) {
        throw new Error(`Expected public apex response, got ${response.status}`);
      }
    },
    "apex route",
  );

  console.log("Deploy verification completed.");
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
