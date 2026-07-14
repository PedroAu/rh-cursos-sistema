const FORWARDED_HEADERS = [
  "content-type",
  "retry-after",
  "x-ratelimit-limit",
  "x-ratelimit-remaining",
  "x-ratelimit-reset",
] as const;

type RouteContext = {
  params: Promise<{ name: string }>;
};

function getServerFunctionsBaseUrl(): string | null {
  const explicit = process.env.SUPABASE_FUNCTIONS_URL ?? process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;

  return `${supabaseUrl.replace(/\/$/, "")}/functions/v1`;
}

async function proxyRequest(request: Request, context: RouteContext) {
  const { name } = await context.params;
  const baseUrl = getServerFunctionsBaseUrl();

  if (!baseUrl) {
    return new Response(JSON.stringify({ ok: false, error: "Supabase Functions não configurado." }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const upstreamUrl = new URL(`${baseUrl.replace(/\/$/, "")}/${name}`);
  const body = request.method === "GET" ? undefined : await request.text();
  const clientIp =
    request.headers.get("x-rh-client-ip") ??
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "session-proxy";

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const authorization = request.headers.get("authorization");
  if (authorization) headers.set("authorization", authorization);
  const apikey = request.headers.get("apikey");
  if (apikey) headers.set("apikey", apikey);
  const sessionToken = request.headers.get("x-rh-session");
  if (sessionToken) headers.set("x-rh-session", sessionToken);
  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  if (origin) headers.set("origin", origin);

  headers.set("x-forwarded-for", clientIp);
  headers.set("x-real-ip", clientIp);

  const upstream = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body,
  });

  const responseHeaders = new Headers();
  for (const key of FORWARDED_HEADERS) {
    const value = upstream.headers.get(key);
    if (value) responseHeaders.set(key, value);
  }

  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}
