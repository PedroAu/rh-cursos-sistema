import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

const ADMIN_PATH = "/admin";
const LOGIN_PATH = "/login";

function redirect(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";

  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const { url, publishableKey } = getSupabasePublicEnv();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = createAdminClient();

  if (request.nextUrl.pathname.startsWith(ADMIN_PATH)) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = LOGIN_PATH;
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      return redirect(request, "/");
    }
  }

  if (request.nextUrl.pathname === LOGIN_PATH && user) {
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    return redirect(request, profile?.role === "admin" ? ADMIN_PATH : "/");
  }

  return response;
}
