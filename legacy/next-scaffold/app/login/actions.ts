"use server";

import { redirect } from "next/navigation";

import {
  createSession,
  defaultRouteForRole,
  deleteSession,
  findDemoUser,
  isDemoAuthEnabled,
  type DashboardRole
} from "@/lib/auth";

function sanitizeNext(value: FormDataEntryValue | null, role: DashboardRole) {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return defaultRouteForRole(role);
  }

  if (role === "admin" && value.startsWith("/admin")) return value;
  if (role === "student" && value.startsWith("/aluno")) return value;
  if (role === "instructor" && value.startsWith("/instrutor")) return value;

  return defaultRouteForRole(role);
}

export async function loginAction(formData: FormData) {
  if (!isDemoAuthEnabled()) {
    redirect("/login?status=disabled");
  }

  const role = String(formData.get("role") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const user = findDemoUser(role, email, password);

  if (!user) {
    redirect("/login?status=invalid");
  }

  await createSession({
    role: user.role,
    email: user.email,
    name: user.name
  });

  redirect(sanitizeNext(formData.get("next"), user.role));
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login?status=logged-out");
}
