import { NextRequest, NextResponse } from "next/server";

import { decodeSession, SESSION_COOKIE, type DashboardRole } from "@/lib/auth";

const protectedRoutes: Array<{ prefix: string; role: DashboardRole }> = [
  { prefix: "/admin", role: "admin" },
  { prefix: "/aluno", role: "student" },
  { prefix: "/instrutor", role: "instructor" }
];

export async function proxy(request: NextRequest) {
  const match = protectedRoutes.find((route) => request.nextUrl.pathname.startsWith(route.prefix));

  if (!match) {
    return NextResponse.next();
  }

  const session = await decodeSession(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session || session.role !== match.role) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("status", "required");
    url.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/aluno/:path*", "/instrutor/:path*"]
};
