export type DashboardRole = "student" | "admin" | "instructor";

export type DemoSession = {
  role: DashboardRole;
  email: string;
  name: string;
};

export const SESSION_COOKIE = "rh_cursos_demo_session";
const SESSION_SECRET = process.env.AUTH_SESSION_SECRET ?? "rh-cursos-local-session-secret";

export const demoUsers: Array<DemoSession & { password: string }> = [
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

function toBase64Url(value: ArrayBuffer | string) {
  const binary =
    typeof value === "string"
      ? value
      : String.fromCharCode(...new Uint8Array(value));

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return atob(padded);
}

async function signPayload(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toBase64Url(signature);
}

function isDashboardRole(value: unknown): value is DashboardRole {
  return value === "student" || value === "admin" || value === "instructor";
}

export async function encodeSession(session: DemoSession) {
  const payload = toBase64Url(JSON.stringify(session));
  const signature = await signPayload(payload);
  return `${payload}.${signature}`;
}

export async function decodeSession(value?: string): Promise<DemoSession | null> {
  if (!value) return null;

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = await signPayload(payload);
  if (signature !== expectedSignature) return null;

  const parsed = JSON.parse(fromBase64Url(payload)) as Partial<DemoSession>;
  if (!isDashboardRole(parsed.role) || !parsed.email || !parsed.name) return null;

  return {
    role: parsed.role,
    email: parsed.email,
    name: parsed.name
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
