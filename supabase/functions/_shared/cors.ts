// CORS para Edge Functions, restrito aos domínios do RH Cursos.
// Portado de src/lib/cors.ts.

export type CorsConfig = {
  allowLocalhost: boolean;
  appUrl: string | null;
  extraAllowedOrigins: string[];
};

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/$/, "");
}

function getAllowedOrigins(config: CorsConfig): string[] {
  const origins = [
    "https://rhcursos.com.br",
    "https://www.rhcursos.com.br",
  ];

  if (config.appUrl) origins.push(normalizeOrigin(config.appUrl));
  config.extraAllowedOrigins.forEach((origin) => {
    const trimmed = normalizeOrigin(origin.trim());
    if (trimmed) origins.push(trimmed);
  });

  if (config.allowLocalhost) {
    origins.push("http://localhost:3000", "http://127.0.0.1:3000");
  }

  return origins;
}

function isLoopbackOrigin(origin: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(origin.replace(/\/$/, ""));
}

function getEnvValue(key: string): string | undefined {
  const denoRuntime = globalThis as typeof globalThis & {
    Deno?: {
      env: {
        get(name: string): string | undefined;
      };
    };
  };

  return denoRuntime.Deno?.env.get(key);
}

function getCorsConfigFromEnv(): CorsConfig {
  const extra = getEnvValue("EXTRA_ALLOWED_ORIGINS");

  return {
    allowLocalhost: getEnvValue("ALLOW_LOCALHOST") === "true",
    appUrl: getEnvValue("PUBLIC_APP_URL") ?? null,
    extraAllowedOrigins: extra ? extra.split(",") : [],
  };
}

export function isOriginAllowedWithConfig(origin: string | null, config: CorsConfig): boolean {
  if (!origin) return false;
  const normalized = normalizeOrigin(origin);
  return getAllowedOrigins(config).includes(normalized) || (config.allowLocalhost && isLoopbackOrigin(normalized));
}

export function isOriginAllowed(origin: string | null): boolean {
  return isOriginAllowedWithConfig(origin, getCorsConfigFromEnv());
}

export function corsHeaders(origin: string | null): Record<string, string> {
  const config = getCorsConfigFromEnv();
  const allowed = isOriginAllowedWithConfig(origin, config);
  const fallbackOrigin = getAllowedOrigins(config)[0];
  // Origem não permitida continua recebendo um fallback estável com credentials.
  // O browser bloqueia o acesso cross-origin porque `Access-Control-Allow-Origin`
  // não corresponde à origem chamadora; isso é intencional e não explorável.
  return {
    "Access-Control-Allow-Origin": allowed ? origin! : fallbackOrigin,
    "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, apikey, content-type, x-rh-session",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "3600",
    Vary: "Origin",
  };
}

/** Resposta padrão de preflight OPTIONS. */
export function handleOptions(request: Request): Response | null {
  if (request.method !== "OPTIONS") return null;
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}

/** Helper para respostas JSON já com headers de CORS + segurança. */
export function jsonResponse(
  data: unknown,
  status: number,
  request: Request,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      ...corsHeaders(request.headers.get("origin")),
      ...extraHeaders,
    },
  });
}
