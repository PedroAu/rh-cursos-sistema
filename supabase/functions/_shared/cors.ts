// CORS para Edge Functions, restrito aos domínios do RH Cursos.
// Portado de src/lib/cors.ts.

function getAllowedOrigins(): string[] {
  const origins = [
    "https://rhcursos.com.br",
    "https://www.rhcursos.com.br",
  ];

  const appUrl = Deno.env.get("PUBLIC_APP_URL");
  if (appUrl) origins.push(appUrl.replace(/\/$/, ""));

  const extra = Deno.env.get("EXTRA_ALLOWED_ORIGINS");
  if (extra) {
    extra.split(",").forEach((o) => {
      const trimmed = o.trim().replace(/\/$/, "");
      if (trimmed) origins.push(trimmed);
    });
  }

  if (Deno.env.get("ALLOW_LOCALHOST") === "true") {
    origins.push("http://localhost:3000", "http://127.0.0.1:3000");
  }

  return origins;
}

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return getAllowedOrigins().includes(origin.replace(/\/$/, ""));
}

export function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = isOriginAllowed(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin! : getAllowedOrigins()[0],
    "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, apikey, content-type, x-rh-session, x-csrf-token",
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
