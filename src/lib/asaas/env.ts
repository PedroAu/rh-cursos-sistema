type AsaasEnv = {
  apiKey: string;
  baseUrl: string;
  userAgent: string;
  webhookAuthToken: string;
};

const ASAAS_ORIGINS = new Set([
  "https://api.asaas.com",
  "https://api-sandbox.asaas.com",
]);

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing Asaas environment variable: ${name}`);
  }

  return value;
}

export function getAsaasEnv(): AsaasEnv {
  const baseUrl = requireEnv("ASAAS_BASE_URL").replace(/\/$/, "");
  let parsedBaseUrl: URL;

  try {
    parsedBaseUrl = new URL(baseUrl);
  } catch {
    throw new Error("ASAAS_BASE_URL must be a valid HTTPS Asaas URL");
  }

  if (
    parsedBaseUrl.protocol !== "https:" ||
    !ASAAS_ORIGINS.has(parsedBaseUrl.origin) ||
    parsedBaseUrl.pathname !== "/v3" ||
    parsedBaseUrl.search ||
    parsedBaseUrl.hash
  ) {
    throw new Error("ASAAS_BASE_URL must be https://api.asaas.com/v3 or the sandbox equivalent");
  }

  const userAgent = requireEnv("ASAAS_USER_AGENT");
  const webhookAuthToken = requireEnv("ASAAS_WEBHOOK_AUTH_TOKEN");

  if (/[^\x20-\x7e]/.test(userAgent) || userAgent.length > 200) {
    throw new Error("ASAAS_USER_AGENT contains invalid characters");
  }

  if (/[^\x20-\x7e]/.test(webhookAuthToken) || webhookAuthToken.length > 256) {
    throw new Error("ASAAS_WEBHOOK_AUTH_TOKEN contains invalid characters");
  }

  return {
    apiKey: requireEnv("ASAAS_API_KEY"),
    baseUrl,
    userAgent,
    webhookAuthToken,
  };
}
