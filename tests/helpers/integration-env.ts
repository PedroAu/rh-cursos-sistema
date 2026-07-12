import { loadEnvFile } from "node:process";
import { randomBytes } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import type { Page, TestInfo } from "@playwright/test";

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
let publishableClientCache: ReturnType<typeof createClient> | null = null;

export type CheckoutTarget = {
  classId: string;
  courseId: string;
  courseTitle: string;
  coursePath: string;
  location: string | null;
  modality: string;
  startDate: string;
  time: string;
};

function isPlaceholderValue(value: string) {
  return (
    !value ||
    value.includes("example.supabase.co") ||
    value.includes("placeholder")
  );
}

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

export function hasRealIntegrationEnv() {
  ensureEnvLoaded();

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  return ![
    supabaseUrl,
    publishableKey,
    serviceRoleKey,
  ].some(isPlaceholderValue);
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

export function createPublishableClient() {
  if (publishableClientCache) return publishableClientCache;

  const { publishableKey, supabaseUrl } = getIntegrationEnv();
  publishableClientCache = createClient(supabaseUrl, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return publishableClientCache;
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

export async function resolveAvailableCheckoutTargets(limit = 10): Promise<CheckoutTarget[]> {
  const supabase = createPublishableClient();

  const { data: classes, error: classesError } = await supabase
    .from("turma")
    .select("id,curso_id,data_inicio,horario,modalidade,local,status,vagas_restantes")
    .order("data_inicio", { ascending: true });

  if (classesError) throw classesError;
  const visibleOpenClasses = (classes ?? [])
    .filter((item) => ["Aberta", "PoucasVagas"].includes(item.status) && item.vagas_restantes > 0)
    .sort((left, right) => left.data_inicio.localeCompare(right.data_inicio));

  if (visibleOpenClasses.length === 0) {
    throw new Error("Nenhuma turma pública disponível para checkout foi encontrada no ambiente de integração.");
  }

  const courseIds = [...new Set(visibleOpenClasses.map((item) => item.curso_id))];
  const { data: courses, error: coursesError } = await supabase
    .from("curso")
    .select("id,slug,titulo")
    .in("id", courseIds)
    .in("status", ["Ativo", "Destaque"]);

  if (coursesError) throw coursesError;

  const availableCourses = new Map(
    (courses ?? [])
      .filter((course) => Boolean(course.slug))
      .map((course) => [course.id, course])
  );

  const targets = visibleOpenClasses
    .map((trainingClass) => {
      const course = availableCourses.get(trainingClass.curso_id);
      if (!course?.slug) return null;

      return {
        classId: trainingClass.id,
        courseId: trainingClass.curso_id,
        courseTitle: course.titulo,
        coursePath: `/cursos/${course.slug}`,
        location: trainingClass.local,
        modality: trainingClass.modalidade,
        startDate: trainingClass.data_inicio,
        time: trainingClass.horario
      } satisfies CheckoutTarget;
    })
    .filter((target): target is CheckoutTarget => Boolean(target));

  const uniqueTargets = targets.filter(
    (target, index, collection) => collection.findIndex((item) => item.courseId === target.courseId) === index
  );

  if (uniqueTargets.length === 0) {
    throw new Error("Nenhum curso público com turma disponível foi encontrado no ambiente de integração.");
  }

  return uniqueTargets.slice(0, limit);
}

export async function resolveAvailableCheckoutTarget() {
  const [target] = await resolveAvailableCheckoutTargets(1);
  return target;
}

export async function resolveUsableCheckoutTarget(page: Page, limit = 10) {
  const targets = await resolveAvailableCheckoutTargets(limit);
  const attempts: string[] = [];

  for (const target of targets) {
    await page.goto(target.coursePath, { waitUntil: "networkidle" });

    const button = page.getByRole("button", { name: "Inscrever-se agora" }).first();
    if ((await button.count()) === 0) {
      attempts.push(`${target.coursePath} (CTA ausente)`);
      continue;
    }

    const openClassesLabel = await page
      .locator("text=/turmas abertas no calendário/")
      .first()
      .textContent()
      .catch(() => null);

    if (await button.isEnabled()) {
      return target;
    }

    attempts.push(`${target.coursePath} (${openClassesLabel ?? "CTA desabilitado"})`);
  }

  throw new Error(`Nenhum curso com checkout utilizável foi encontrado no frontend. Tentativas: ${attempts.join("; ")}`);
}

export function createUniqueEmail(prefix: string) {
  const slug = prefix.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  return `${slug}-${Date.now()}@rhcursos.test`;
}

export function createUniqueIp(seed: string) {
  const random = randomBytes(8).toString("hex");
  const seedFragment = Buffer.from(seed).toString("hex").slice(0, 8).padEnd(8, "0");
  return `2001:db8:${seedFragment.slice(0, 4)}:${seedFragment.slice(4, 8)}:${random.slice(0, 4)}:${random.slice(4, 8)}:${random.slice(8, 12)}:${random.slice(12, 16)}`;
}
