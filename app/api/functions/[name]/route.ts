import { cookies } from "next/headers";

import { decodeSession } from "@/lib/auth";
import { requireServerRole } from "@/lib/supabase/authorize";
import {
  getSsrAuthRolloutAccounts,
  isSsrAuthRolloutAccount,
} from "@/lib/supabase/auth-rollout";
import {
  createSupabaseSSRClient,
  isSupabaseSsrConfigured,
  type SsrCookieAdapter,
} from "@/lib/supabase/session";

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

type RolloutAuthorization =
  | { mode: "legacy" }
  | { mode: "ssr"; userId: string; email: string }
  | { mode: "denied"; status: 401 | 403 | 503; error: string };

async function getCookieAdapter(): Promise<SsrCookieAdapter> {
  const cookieStore = await cookies();
  return {
    getAll: () => cookieStore.getAll().map(({ name, value }) => ({ name, value })),
    setAll: (toSet) => {
      for (const { name, value, options } of toSet) {
        cookieStore.set(name, value, options);
      }
    },
  };
}

async function authorizeAdminResourcesRollout(request: Request): Promise<RolloutAuthorization> {
  const rolloutAccounts = getSsrAuthRolloutAccounts();
  if (rolloutAccounts.size === 0) return { mode: "legacy" };

  const legacySession = await decodeSession(request.headers.get("x-rh-session") ?? undefined);

  if (!isSupabaseSsrConfigured) {
    return isSsrAuthRolloutAccount(legacySession?.email, rolloutAccounts)
      ? { mode: "denied", status: 503, error: "Auth SSR indisponível." }
      : { mode: "legacy" };
  }

  const ssrClient = createSupabaseSSRClient(await getCookieAdapter());
  if (!ssrClient) {
    return isSsrAuthRolloutAccount(legacySession?.email, rolloutAccounts)
      ? { mode: "denied", status: 503, error: "Auth SSR indisponível." }
      : { mode: "legacy" };
  }

  const userResult = await ssrClient.auth.getUser();
  const ssrUserId = userResult.data.user?.id ?? null;
  const ssrEmail = userResult.data.user?.email ?? null;
  if (isSsrAuthRolloutAccount(ssrEmail, rolloutAccounts)) {
    const authorization = await requireServerRole(ssrClient, "admin");
    if (!authorization.authorized) {
      return {
        mode: "denied",
        status: authorization.reason === "unauthenticated" ? 401 : 403,
        error:
          authorization.reason === "unauthenticated"
            ? "Sessão inválida ou expirada."
            : "Acesso não autorizado.",
      };
    }
    if (!ssrUserId) {
      return { mode: "denied", status: 401, error: "Sessão inválida ou expirada." };
    }
    return { mode: "ssr", userId: ssrUserId, email: ssrEmail! };
  }

  // Uma conta em rollout nunca pode cair silenciosamente para o HMAC.
  if (isSsrAuthRolloutAccount(legacySession?.email, rolloutAccounts)) {
    return { mode: "denied", status: 401, error: "Sessão SSR obrigatória." };
  }

  return { mode: "legacy" };
}

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
  const rolloutAuthorization =
    name === "admin-resources"
      ? await authorizeAdminResourcesRollout(request)
      : ({ mode: "legacy" } as const);

  if (rolloutAuthorization.mode === "denied") {
    return new Response(
      JSON.stringify({ ok: false, error: rolloutAuthorization.error }),
      {
        status: rolloutAuthorization.status,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  const clientIp =
    request.headers.get("x-rh-client-ip") ??
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "session-proxy";

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  if (rolloutAuthorization.mode === "ssr") {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return new Response(JSON.stringify({ ok: false, error: "Auth SSR indisponível." }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }
    headers.set("authorization", `Bearer ${serviceRoleKey}`);
    headers.set("apikey", serviceRoleKey);
    headers.set("x-rh-ssr-admin-id", rolloutAuthorization.userId);
    headers.set("x-rh-ssr-admin-email", rolloutAuthorization.email);
  } else {
    const authorization = request.headers.get("authorization");
    if (authorization) headers.set("authorization", authorization);
    const apikey = request.headers.get("apikey");
    if (apikey) headers.set("apikey", apikey);
    const sessionToken = request.headers.get("x-rh-session");
    if (sessionToken) headers.set("x-rh-session", sessionToken);
  }
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
