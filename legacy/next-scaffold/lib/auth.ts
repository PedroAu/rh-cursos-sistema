import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type DashboardRole = "student" | "admin" | "instructor";

export type DemoSession = {
  role: DashboardRole;
  email: string;
  name: string;
};

export const SESSION_COOKIE = "rh_cursos_demo_session";

const demoUsers: Array<DemoSession & { password: string }> = [
  {
    role: "student",
    email: "ana.silva1@mockmail.com",
    password: "aluno123",
    name: "Ana Silva"
  },
  {
    role: "admin",
    email: "admin@rhcursos.demo",
    password: "admin123",
    name: "Admin RH Cursos"
  },
  {
    role: "instructor",
    email: "mariana.teles@rhcursos.com",
    password: "instrutor123",
    name: "Mariana Teles"
  }
];

export function isDemoAuthEnabled() {
  return process.env.DEMO_AUTH_ENABLED !== "false";
}

export function defaultRouteForRole(role: DashboardRole) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "instructor") return "/instrutor/dashboard";
  return "/aluno/dashboard";
}

export function encodeSession(session: DemoSession) {
  return [session.role, encodeURIComponent(session.email), encodeURIComponent(session.name)].join(":");
}

export function decodeSession(value?: string): DemoSession | null {
  if (!value) return null;

  const [role, email, name] = value.split(":");
  if (role !== "student" && role !== "admin" && role !== "instructor") return null;
  if (!email || !name) return null;

  return {
    role,
    email: decodeURIComponent(email),
    name: decodeURIComponent(name)
  };
}

export function findDemoUser(role: string, email: string, password: string) {
  return demoUsers.find(
    (user) =>
      user.role === role &&
      user.email.toLowerCase() === email.trim().toLowerCase() &&
      user.password === password
  );
}

export async function createSession(session: DemoSession) {
  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE,
    value: encodeSession(session),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  return decodeSession(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireSession(allowedRoles: DashboardRole[]) {
  const session = await getSession();

  if (!session || !allowedRoles.includes(session.role)) {
    redirect("/login?status=required");
  }

  return session;
}
