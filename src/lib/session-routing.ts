import type { DashboardRole } from "@/lib/auth";

export function getDefaultDashboardPath(role: DashboardRole): string {
  switch (role) {
    case "student":
      return "/aluno";
    case "instructor":
      return "/instrutor";
    case "admin":
    default:
      return "/admin";
  }
}

export function isRolePathAllowed(role: DashboardRole, path: string | null | undefined): boolean {
  if (!path) return false;

  if (role === "admin") {
    return path === "/admin" || path.startsWith("/admin/");
  }

  if (role === "student") {
    return path === "/aluno" || path.startsWith("/aluno/");
  }

  return path === "/instrutor" || path.startsWith("/instrutor/");
}
