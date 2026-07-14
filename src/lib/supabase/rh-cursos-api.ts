import { cache } from "react";
import type { Enrollment, Lead } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  publicTestBaselineBlogPosts,
  publicTestBaselineClasses,
  publicTestBaselineCourseCategories,
  publicTestBaselineCoursePublicContents,
  publicTestBaselineCourses,
  publicTestBaselineInstructors,
  publicTestBaselineTrainingPaths
} from "@/lib/public-test-baseline";
import { supabase } from "@/lib/supabase/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import {
  leadToInsert,
  mapAssessmentToTestimonial,
  mapBlogPost,
  mapClass,
  mapCourse,
  mapCoursePublicContent,
  mapInstructor,
  mapLead,
  mapTrainingPath,
  toDbPaymentMethod,
  toDbStudentType,
  type AssessmentWithCourseRow,
  type BlogPostRow,
  type ClassRow,
  type CourseInstructorRow,
  type CoursePublicContentRow,
  type CourseRow,
  type InstructorRow,
  type LeadRow,
  type TrilhaRow
} from "@/lib/supabase/mappers";
import { validateResponse, withRetry } from "@/lib/supabase/api-validation";
import {
  assessmentWithCourseListSchema,
  blogPostListSchema,
  courseCategoryListSchema,
  courseInstructorListSchema,
  enrollmentIdSchema,
  leadListSchema,
  leadSchema,
  publicCourseContentListSchema,
  publicClassListSchema,
  publicCourseListSchema,
  publicInstructorListSchema,
  trainingPathListSchema
} from "@/lib/supabase/schemas";

type RhCursosClient = SupabaseClient<Database>;

export class PublicCatalogUnavailableError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "PublicCatalogUnavailableError";
  }
}

type PublicCatalogResult = NonNullable<Awaited<ReturnType<typeof fetchPublicCatalog>>>;

export type PublicCatalogServerState =
  | { status: "ok"; catalog: PublicCatalogResult }
  | { status: "unavailable"; error: PublicCatalogUnavailableError };

function isPlaceholderValue(value: string | undefined) {
  return !value || value.includes("example.supabase.co") || value.includes("placeholder");
}

function shouldUsePublicTestBaseline() {
  return (
    isPlaceholderValue(process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    isPlaceholderValue(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  );
}

/**
 * Categorias distintas já cadastradas em `curso`, para alimentar as
 * sugestões do combobox de categorias no formulário de cursos (ADR-015 F2).
 * A query é coberta pelo índice parcial `curso_categoria_idx`; o filtro
 * `deleted_at is null` é aplicado pela RLS `catalogo_publico_curso_select`
 * (mesmo padrão das demais queries de `curso` neste arquivo).
 */
export async function fetchCourseCategories(client: RhCursosClient): Promise<string[]> {
  const result = await withRetry(
    () => client.from("curso").select("categoria").not("categoria", "is", null).order("categoria"),
    { label: "fetchPublicCatalog:curso_categoria" }
  );

  if (result.error) throw result.error;

  const rows = validateResponse(result.data, courseCategoryListSchema, {
    endpoint: "fetchCourseCategories",
    resource: "curso_categoria",
    schema: "courseCategoryListSchema"
  });

  const categories = new Set<string>();
  for (const row of rows) {
    if (row.categoria) categories.add(row.categoria);
  }

  return Array.from(categories).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

async function fetchPublicCatalog(client: RhCursosClient | null) {
  if (shouldUsePublicTestBaseline()) {
    return {
      courses: publicTestBaselineCourses,
      classes: publicTestBaselineClasses,
      instructors: publicTestBaselineInstructors,
      trainingPaths: publicTestBaselineTrainingPaths,
      coursePublicContents: publicTestBaselineCoursePublicContents,
      courseCategories: publicTestBaselineCourseCategories
    };
  }

  if (!client) return null;

  const [
    coursesResult,
    classesResult,
    instructorsResult,
    courseInstructorsResult,
    trainingPathsResult,
    coursePublicContentResult,
    courseCategories
  ] = await Promise.all([
      withRetry(
        () =>
          client
            .from("curso")
            .select("id,titulo,slug,descricao_curta,descricao,ementa,objetivos,beneficios,publico_alvo,carga_horaria,modalidade,modalidades,nivel,categoria,trilha_id,trilha_nome,preco_base,status,destaque,imagem_capa,rating,total_alunos")
            .order("titulo"),
        { label: "fetchPublicCatalog:curso" }
      ),
      withRetry(
        () =>
          client
            .from("turma")
            .select("id,curso_id,instrutor_id,data_inicio,data_fim,horario,local,vagas_total,vagas_preenchidas,vagas_restantes,preco_turma,modalidade,status,observacoes")
            .order("data_inicio"),
        { label: "fetchPublicCatalog:turma" }
      ),
      withRetry(
        () =>
          client
            .from("instrutor")
            .select("id,nome,email,telefone,bio,foto_url,formacao,especialidade,rating,status")
            .order("nome"),
        { label: "fetchPublicCatalog:instrutor" }
      ),
      withRetry(() => client.from("curso_instrutor").select("id,curso_id,instrutor_id,principal"), {
        label: "fetchPublicCatalog:curso_instrutor"
      }),
      withRetry(
        () =>
          client
            .from("trilha")
            .select("id,codigo,nome,nome_curto,slug,descricao,icone,ordem,ativa")
            .eq("ativa", true)
            .order("ordem"),
        { label: "fetchPublicCatalog:trilha" }
      ),
      withRetry(
        () =>
          client
            .from("curso_public_content")
            .select("id,curso_id,hero_subtitle,highlights,faq_items,sidebar,corporate_cta,testimonial_override,published,created_at,updated_at,deleted_at")
            .eq("published", true)
            .order("created_at"),
        { label: "fetchPublicCatalog:curso_public_content" }
      ),
      fetchCourseCategories(client)
    ]);

  if (coursesResult.error) throw coursesResult.error;
  if (classesResult.error) throw classesResult.error;
  if (instructorsResult.error) throw instructorsResult.error;
  if (courseInstructorsResult.error) throw courseInstructorsResult.error;
  if (trainingPathsResult.error) throw trainingPathsResult.error;

  const courseRows = validateResponse(coursesResult.data, publicCourseListSchema, {
    endpoint: "fetchPublicCatalog",
    resource: "curso",
    schema: "publicCourseListSchema"
  }) as CourseRow[];
  const classRows = validateResponse(classesResult.data, publicClassListSchema, {
    endpoint: "fetchPublicCatalog",
    resource: "turma",
    schema: "publicClassListSchema"
  }) as ClassRow[];
  const instructorRows = validateResponse(instructorsResult.data, publicInstructorListSchema, {
    endpoint: "fetchPublicCatalog",
    resource: "instrutor",
    schema: "publicInstructorListSchema"
  }) as InstructorRow[];
  const courseInstructorRows = validateResponse(courseInstructorsResult.data, courseInstructorListSchema, {
    endpoint: "fetchPublicCatalog",
    resource: "curso_instrutor",
    schema: "courseInstructorListSchema"
  }) as CourseInstructorRow[];
  const trainingPathRows = validateResponse(trainingPathsResult.data, trainingPathListSchema, {
    endpoint: "fetchPublicCatalog",
    resource: "trilha",
    schema: "trainingPathListSchema"
  }) as TrilhaRow[];
  const coursePublicContentRows = coursePublicContentResult.error
    ? []
    : (validateResponse(coursePublicContentResult.data, publicCourseContentListSchema, {
        endpoint: "fetchPublicCatalog",
        resource: "curso_public_content",
        schema: "publicCourseContentListSchema"
      }) as CoursePublicContentRow[]);

  // Contagem de cursos por trilha derivada dos dados reais do catálogo, evitando
  // o `courseCount` hardcoded (e propenso a drift) do antigo mock estático.
  const courseCountByPath = courseRows.reduce<Record<string, number>>((acc, course) => {
    if (course.trilha_id) {
      acc[course.trilha_id] = (acc[course.trilha_id] ?? 0) + 1;
    }
    return acc;
  }, {});

  return {
    courses: courseRows.map((course) => mapCourse(course, courseInstructorRows, classRows)),
    classes: classRows.map(mapClass),
    instructors: instructorRows.map((instructor) => mapInstructor(instructor, courseInstructorRows)),
    trainingPaths: trainingPathRows.map((path) => mapTrainingPath(path, courseCountByPath[path.id] ?? 0)),
    coursePublicContents: coursePublicContentRows.map(mapCoursePublicContent),
    courseCategories
  };
}

export async function fetchPublicClassesFromSupabase() {
  if (!supabase) return null;
  const client = supabase;

  const result = await withRetry(
    () =>
      client
        .from("turma")
        .select("id,curso_id,instrutor_id,data_inicio,data_fim,horario,local,vagas_total,vagas_preenchidas,vagas_restantes,preco_turma,modalidade,status,observacoes")
        .order("data_inicio"),
    { label: "fetchPublicClasses:turma" }
  );

  if (result.error) throw result.error;

  const rows = validateResponse(result.data, publicClassListSchema, {
    endpoint: "fetchPublicClasses",
    resource: "turma",
    schema: "publicClassListSchema"
  }) as ClassRow[];

  return rows.map(mapClass);
}

async function fetchPublicBlogPosts(client: RhCursosClient | null) {
  if (shouldUsePublicTestBaseline()) {
    return publicTestBaselineBlogPosts;
  }

  if (!client) return null;

  const result = await withRetry(
    () =>
      client
        .from("post_blog")
        .select("id,titulo,slug,resumo,conteudo,categoria,tags,autor,publicado_em,tempo_leitura,status,imagem_url,curso_id,created_at")
        .eq("status", "Publicado")
        .order("publicado_em", { ascending: false }),
    { label: "fetchPublicBlogPosts:post_blog" }
  );

  if (result.error) throw result.error;

  const rows = validateResponse(result.data, blogPostListSchema, {
    endpoint: "fetchPublicBlogPosts",
    resource: "post_blog",
    schema: "blogPostListSchema"
  }) as BlogPostRow[];

  return rows.map(mapBlogPost);
}

export function fetchPublicCatalogFromSupabase() {
  return fetchPublicCatalog(supabase);
}

// Memoizado por request (React cache()): com dynamic = "force-dynamic" nas
// páginas públicas, generateMetadata e o componente de página chamam esta
// função independentemente — sem cache() isso vira 2 round-trips completos
// ao Supabase por view.
export const fetchPublicCatalogFromSupabaseServer = cache(function fetchPublicCatalogFromSupabaseServer() {
  return fetchPublicCatalog(createSupabaseServerClient());
});

export const fetchPublicCatalogServerState = cache(async function fetchPublicCatalogServerState(): Promise<PublicCatalogServerState> {
  try {
    const catalog = await fetchPublicCatalogFromSupabaseServer();
    if (!catalog) {
      throw new PublicCatalogUnavailableError("Supabase indisponível para carregar o catálogo público.");
    }
    return { status: "ok", catalog };
  } catch (error) {
    return {
      status: "unavailable",
      error: error instanceof PublicCatalogUnavailableError
        ? error
        : new PublicCatalogUnavailableError("Não foi possível carregar o catálogo público.", { cause: error })
    };
  }
});

export function fetchPublicBlogPostsFromSupabase() {
  return fetchPublicBlogPosts(supabase);
}

export function fetchPublicBlogPostsFromSupabaseServer() {
  return fetchPublicBlogPosts(createSupabaseServerClient());
}

export async function fetchPublicTestimonialsFromSupabase() {
  if (!supabase) return null;

  // `avaliacao` has public RLS for published rows, but current migrations do not
  // grant explicit anon Data API access. Keep this isolated from catalog loading.
  const client = supabase;
  const result = await withRetry(
    () =>
      client
        .from("avaliacao")
        .select("id,inscricao_id,turma_id,nota,comentario,publicar,created_at,updated_at,deleted_at,turma(curso(titulo))")
        .eq("publicar", true)
        .not("comentario", "is", null)
        .order("created_at", { ascending: false }),
    { label: "fetchPublicTestimonials:avaliacao" }
  );

  if (result.error) throw result.error;

  const rows = validateResponse(result.data, assessmentWithCourseListSchema, {
    endpoint: "fetchPublicTestimonials",
    resource: "avaliacao",
    schema: "assessmentWithCourseListSchema"
  }) as AssessmentWithCourseRow[];

  return rows.map(mapAssessmentToTestimonial);
}

export async function fetchPublicTestimonialsFromSupabaseServer() {
  const client = createSupabaseServerClient();
  if (!client) return null;

  const result = await withRetry(
    () =>
      client
        .from("avaliacao")
        .select("id,inscricao_id,turma_id,nota,comentario,publicar,created_at,updated_at,deleted_at,turma(curso(titulo))")
        .eq("publicar", true)
        .not("comentario", "is", null)
        .order("created_at", { ascending: false }),
    { label: "fetchPublicTestimonialsServer:avaliacao" }
  );

  if (result.error) throw result.error;

  const rows = validateResponse(result.data, assessmentWithCourseListSchema, {
    endpoint: "fetchPublicTestimonialsServer",
    resource: "avaliacao",
    schema: "assessmentWithCourseListSchema"
  }) as AssessmentWithCourseRow[];

  return rows.map(mapAssessmentToTestimonial);
}

export async function fetchLeadsFromSupabase() {
  if (!supabase) return null;

  const client = supabase;
  const result = await withRetry(
    () => client.from("lead").select("*").order("created_at", { ascending: false }),
    { label: "fetchLeads:lead" }
  );
  if (result.error) throw result.error;

  const rows = validateResponse(result.data, leadListSchema, {
    endpoint: "fetchLeads",
    resource: "lead",
    schema: "leadListSchema"
  }) as LeadRow[];

  return rows.map(mapLead);
}

export async function createLeadInSupabase(payload: Omit<Lead, "id" | "createdAt" | "status">) {
  if (!supabase) return null;

  const client = supabase;
  const result = await withRetry(() => client.from("lead").insert(leadToInsert(payload)).select("*").single(), {
    label: "createLead:lead"
  });
  if (result.error) throw result.error;

  const row = validateResponse(result.data, leadSchema, {
    endpoint: "createLead",
    resource: "lead",
    schema: "leadSchema"
  }) as LeadRow;

  return mapLead(row);
}

export async function createEnrollmentInSupabase(payload: Omit<Enrollment, "id" | "createdAt" | "status">) {
  if (!supabase) return null;

  const client = supabase;
  const result = await withRetry(
    () =>
      client.rpc("registrar_inscricao_publica", {
        p_nome_completo: payload.studentName,
        p_email: payload.email,
        p_cpf: payload.cpf,
        p_telefone: payload.phone,
        p_cargo: payload.jobTitle,
        p_orgao: payload.organization,
        p_tipo_aluno: toDbStudentType(payload.enrollmentType),
        p_turma_id: payload.classId,
        p_tipo_inscricao: payload.enrollmentType,
        p_forma_pagamento: toDbPaymentMethod(payload.paymentMethod),
        p_observacoes: payload.notes
      }),
    { label: "createEnrollment:registrar_inscricao_publica" }
  );

  if (result.error) throw result.error;

  return validateResponse(result.data, enrollmentIdSchema, {
    endpoint: "createEnrollment",
    resource: "registrar_inscricao_publica",
    schema: "enrollmentIdSchema"
  });
}
