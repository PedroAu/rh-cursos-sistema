import { loadEnvFile } from "node:process";

import { createClient } from "@supabase/supabase-js";
import type { TestInfo } from "@playwright/test";

type IntegrationEnv = {
  adminEmail: string;
  adminPassword: string;
  functionsBaseUrl: string;
  publishableKey: string;
  serviceRoleKey: string;
  supabaseUrl: string;
};

type AuthRole = "admin" | "student";

const FALLBACK_ADMIN_PASSWORD = "SenhaForte#2026";
const FALLBACK_STUDENT_PASSWORD = "AlunoForte#2026";

const CANONICAL_DOCS = {
  apiCatalog: "docs/api/README.md",
  authSession: "docs/api/auth-session.md",
  edgeFunctions: "docs/api/edge-functions.md",
} as const;

let envCache: IntegrationEnv | null = null;
let serviceClientCache: ReturnType<typeof createClient> | null = null;

function ensureEnvLoaded() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.SUPABASE_URL) {
    try {
      loadEnvFile(".env.local");
    } catch {
      // O arquivo pode não existir em alguns ambientes; a validação abaixo cobre isso.
    }
  }
}

export function getCanonicalDocs() {
  return CANONICAL_DOCS;
}

export function annotateCanonicalDoc(testInfo: TestInfo, docPath: string) {
  testInfo.annotations.push({ type: "canonical-doc", description: docPath });
}

export function getIntegrationEnv(): IntegrationEnv {
  if (envCache) return envCache;

  ensureEnvLoaded();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "";
  const functionsBaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL?.replace(/\/$/, "") ??
    (supabaseUrl ? `${supabaseUrl.replace(/\/$/, "")}/functions/v1` : "");

  const adminEmail = process.env.E2E_ADMIN_EMAIL ?? "admin-contract@rhcursos.test";
  const adminPassword = process.env.ADMIN_PASSWORD ?? FALLBACK_ADMIN_PASSWORD;

  const missing = [
    !supabaseUrl && "NEXT_PUBLIC_SUPABASE_URL",
    !publishableKey && "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    !serviceRoleKey && "SUPABASE_SERVICE_ROLE_KEY",
    !functionsBaseUrl && "NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL",
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`Ambiente de integração incompleto: ${missing.join(", ")}.`);
  }

  envCache = {
    adminEmail,
    adminPassword,
    functionsBaseUrl,
    publishableKey,
    serviceRoleKey,
    supabaseUrl,
  };

  return envCache;
}

export function createServiceRoleClient() {
  if (serviceClientCache) return serviceClientCache;

  const { serviceRoleKey, supabaseUrl } = getIntegrationEnv();
  serviceClientCache = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return serviceClientCache;
}

async function findUserByEmail(email: string) {
  const supabase = createServiceRoleClient();
  let page = 1;
  const perPage = 200;

  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const found = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) ?? null;
    if (found) return found;
    if (data.users.length < perPage) return null;

    page += 1;
  }
}

export async function ensureAuthUser(options: {
  email: string;
  name: string;
  password?: string;
  role: AuthRole;
}) {
  const supabase = createServiceRoleClient();
  const password =
    options.password ?? (options.role === "admin" ? getIntegrationEnv().adminPassword : FALLBACK_STUDENT_PASSWORD);
  const existing = await findUserByEmail(options.email);

  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      app_metadata: { ...existing.app_metadata, role: options.role },
      user_metadata: { ...existing.user_metadata, name: options.name },
    });

    if (error) throw error;
    return { email: options.email, password };
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: options.email,
    password,
    email_confirm: true,
    app_metadata: { role: options.role },
    user_metadata: { name: options.name },
  });

  if (error) throw error;
  if (!data.user) throw new Error(`Não foi possível criar o usuário ${options.email}.`);

  return { email: options.email, password };
}

export async function cleanupEnrollmentArtifacts(email: string) {
  const supabase = createServiceRoleClient();
  const normalizedEmail = email.toLowerCase();

  const { data: students, error: studentLookupError } = await supabase
    .from("aluno")
    .select("id")
    .ilike("email", normalizedEmail);

  if (studentLookupError) throw studentLookupError;
  if (!students || students.length === 0) return;

  const studentIds = students.map((student) => student.id);

  const { error: enrollmentDeleteError } = await supabase
    .from("inscricao")
    .delete()
    .in("aluno_id", studentIds);

  if (enrollmentDeleteError) throw enrollmentDeleteError;

  const { error: studentDeleteError } = await supabase
    .from("aluno")
    .delete()
    .in("id", studentIds);

  if (studentDeleteError) throw studentDeleteError;
}

export async function resolveAvailableCheckoutCoursePath() {
  const target = await resolveAvailableCheckoutTarget();
  return target.coursePath;
}

export async function resolveAvailableCheckoutTarget() {
  const supabase = createServiceRoleClient();

  const { data: classes, error: classesError } = await supabase
    .from("turma")
    .select("id,curso_id,data_inicio,horario,modalidade,local,status,vagas_restantes")
    .in("status", ["Aberta", "PoucasVagas"])
    .gt("vagas_restantes", 0)
    .is("deleted_at", null)
    .order("vagas_restantes", { ascending: false })
    .order("data_inicio", { ascending: true })
    .limit(20);

  if (classesError) throw classesError;
  if (!classes || classes.length === 0) {
    throw new Error("Nenhuma turma disponível para checkout foi encontrada no ambiente de integração.");
  }

  const courseIds = [...new Set(classes.map((item) => item.curso_id))];
  const { data: courses, error: coursesError } = await supabase
    .from("curso")
    .select("id,slug")
    .in("id", courseIds)
    .in("status", ["Ativo", "Destaque"])
    .is("deleted_at", null);

  if (coursesError) throw coursesError;

  const selectedClass = classes.find((item) =>
    courses?.some((course) => course.id === item.curso_id && Boolean(course.slug))
  );
  const course = selectedClass
    ? courses?.find((item) => item.id === selectedClass.curso_id && Boolean(item.slug))
    : null;

  if (!selectedClass || !course) {
    throw new Error("Nenhum curso ativo com turma disponível foi encontrado no ambiente de integração.");
  }

  return {
    classId: selectedClass.id,
    coursePath: `/cursos/${course.slug}`,
    location: selectedClass.local,
    modality: selectedClass.modalidade,
    startDate: selectedClass.data_inicio,
    time: selectedClass.horario
  };
}

export function createUniqueEmail(prefix: string) {
  const slug = prefix.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  return `${slug}-${Date.now()}@rhcursos.test`;
}

export function createUniqueIp(seed: string) {
  const normalized = seed.replace(/[^a-z0-9]/gi, "");
  let hash = 0;

  for (const char of normalized) {
    hash = (hash * 31 + char.charCodeAt(0)) % 250;
  }

  return `198.51.100.${Math.max(1, hash)}`;
}
