import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { applySecurityHeaders } from "@/lib/security-headers";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

const CANONICAL_HOST = "www.rhcursos.com.br";
const APEX_HOST = "rhcursos.com.br";

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase();
  const { pathname } = request.nextUrl;

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

  return applySecurityHeaders(await updateSupabaseSession(request));
}

export const config = {
  runtime: "experimental-edge",
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"]
};
