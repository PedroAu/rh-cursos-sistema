type AsaasEnv = {
  apiKey: string;
  baseUrl: string;
  userAgent: string;
  webhookAuthToken: string;
};

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing Asaas environment variable: ${name}`);
  }

  return value;
}

export function getAsaasEnv(): AsaasEnv {
  return {
    apiKey: requireEnv("ASAAS_API_KEY"),
    baseUrl: requireEnv("ASAAS_BASE_URL"),
    userAgent: requireEnv("ASAAS_USER_AGENT"),
    webhookAuthToken: requireEnv("ASAAS_WEBHOOK_AUTH_TOKEN"),
  };
}
