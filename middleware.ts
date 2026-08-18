import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { applySecurityHeaders } from "@/lib/security-headers";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

const CANONICAL_HOST = "www.rhcursos.com.br";
const APEX_HOST = "rhcursos.com.br";

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase().split(":")[0];
  const { pathname } = request.nextUrl;
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol ?? request.nextUrl.protocol.replace(":", "");
  const isCanonicalHost = host === CANONICAL_HOST || host === APEX_HOST;

  // Cloudflare should enforce HTTPS at the edge for every request, including
  // robots.txt and sitemap.xml. This application-level guard keeps the
  // canonical host invariant intact when traffic reaches the Worker directly
  // or when the edge rule is accidentally removed.
  if (isCanonicalHost && protocol !== "https") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.protocol = "https";
    redirectUrl.host = CANONICAL_HOST;

    return applySecurityHeaders(NextResponse.redirect(redirectUrl, 308));
  }

  if (pathname === "/curso" || pathname === "/curso/") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/cursos";
    redirectUrl.search = "";

    if (host === APEX_HOST) {
      redirectUrl.protocol = "https";
      redirectUrl.host = CANONICAL_HOST;
    }

    return applySecurityHeaders(NextResponse.redirect(redirectUrl, 301));
  }

  if (host === APEX_HOST) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.protocol = "https";
    redirectUrl.host = CANONICAL_HOST;

    return applySecurityHeaders(NextResponse.redirect(redirectUrl, 308));
  }

  // These machine-readable routes do not need a Supabase session refresh.
  // They still pass through the canonicalization guard above so HTTP variants
  // cannot expose duplicate sitemap/robots resources.
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") {
    return applySecurityHeaders(NextResponse.next());
  }

  return applySecurityHeaders(await updateSupabaseSession(request));
}

export const config = {
  runtime: "experimental-edge",
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
