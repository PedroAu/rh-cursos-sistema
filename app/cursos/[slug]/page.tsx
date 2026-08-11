import type { Metadata } from "next";
import { cookies } from "next/headers";

import { CourseDetailClient } from "@/components/page-clients/course-detail-client";
import {
  fetchPublicCatalogServerState,
  fetchPublicTestimonialsFromSupabaseServer,
  isServerPublicTestBaselineEnabled,
  PUBLIC_TEST_BASELINE_COOKIE_NAME
} from "@/lib/supabase/rh-cursos-api";
import { buildCourseJsonLd, getCourseMetaDescription, getPublicCourseName, SITE_URL } from "@/lib/seo";

// Renderização dinâmica: o catálogo é editado via admin e precisa refletir o
// estado real do banco a cada request, sem "assar" cursos/turmas em páginas
// estáticas geradas em build (ver Story 16.1, AC7 — corretude > performance
// de build, dado que não há cache/ISR no projeto).
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getPublicTestBaselineEnabled() {
  const cookieStore = await cookies();
  return isServerPublicTestBaselineEnabled(
    cookieStore.get(PUBLIC_TEST_BASELINE_COOKIE_NAME)?.value
  );
}

async function getCourses(usePublicTestBaseline: boolean) {
  const result = await fetchPublicCatalogServerState(usePublicTestBaseline);
  if (result.status === "unavailable") {
    return null;
  }
  return result.catalog.courses;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const courses = await getCourses(await getPublicTestBaselineEnabled());
  if (courses === null) {
    return {
      title: "Catálogo temporariamente indisponível | RH Cursos",
      description: "Não foi possível carregar os detalhes deste curso no momento."
    };
  }
  const course = courses.find((item) => item.slug === slug);

  if (!course) {
    return {
      title: "Curso não encontrado | RH Cursos"
    };
  }

  return {
    title: `${getPublicCourseName(course.title)} | RH Cursos`,
    description: getCourseMetaDescription(course),
    alternates: { canonical: `/cursos/${course.slug}` },
    openGraph: {
      title: `${getPublicCourseName(course.title)} | RH Cursos`,
      description: getCourseMetaDescription(course),
      url: `${SITE_URL}/cursos/${course.slug}/`,
      type: "website"
    }
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const usePublicTestBaseline = await getPublicTestBaselineEnabled();
  const [catalogState, testimonials] = await Promise.all([
    fetchPublicCatalogServerState(usePublicTestBaseline),
    usePublicTestBaseline
      ? Promise.resolve([])
      : fetchPublicTestimonialsFromSupabaseServer().catch(() => [])
  ]);

  if (catalogState.status === "unavailable") {
    console.error("Falha ao carregar catálogo público na rota de curso:", catalogState.error);
    throw catalogState.error;
  }

  const course = catalogState.catalog.courses.find((item) => item.slug === slug);
  const courseContent = course
    ? catalogState.catalog.coursePublicContents.find((item) => item.courseId === course.id)
    : undefined;
  const courseJsonLd = course
    ? buildCourseJsonLd(course, catalogState.catalog.classes, courseContent)
    : null;

  // Sem fallback para mockCatalog: se o curso não existir no catálogo real,
  // `courses` chega vazio e `CourseDetailPage` já renderiza o estado
  // "Curso não encontrado" existente (AC2), sem dado fictício exibido.
  return (
    <>
      {courseJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([courseJsonLd.course, courseJsonLd.faq]).replace(/</g, "\\u003c")
          }}
        />
      ) : null}
      <CourseDetailClient
        initialData={{
          courses: catalogState.catalog.courses,
          classes: catalogState.catalog.classes,
          instructors: catalogState.catalog.instructors,
          coursePublicContents: catalogState.catalog.coursePublicContents,
          testimonials: testimonials ?? []
        }}
      />
    </>
  );
}
