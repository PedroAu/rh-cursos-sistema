import type { Metadata } from "next";

import { CourseCheckoutClient } from "@/components/page-clients/course-checkout-client";
import {
  fetchPublicCatalogServerState,
  fetchPublicTestimonialsFromSupabaseServer,
} from "@/lib/supabase/rh-cursos-api";

// Renderização dinâmica: mesmo racional de app/cursos/[slug]/page.tsx
// (Story 16.1, AC7) — o checkout precisa refletir turmas/vagas reais a cada
// request, sem páginas estáticas "assadas" em build.
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getCourses() {
  const result = await fetchPublicCatalogServerState();
  if (result.status === "unavailable") {
    return null;
  }
  return result.catalog.courses;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const courses = await getCourses();
  if (courses === null) {
    return {
      title: "Checkout temporariamente indisponível | RH Cursos",
      description: "Não foi possível carregar este checkout no momento.",
    };
  }
  const course = courses.find((item) => item.slug === slug);

  if (!course) {
    return {
      title: "Checkout não encontrado | RH Cursos",
    };
  }

  return {
    title: `Checkout • ${course.title} | RH Cursos`,
    description: `Finalize a inscrição para ${course.title}.`,
  };
}

export default async function Page() {
  const [catalogState, testimonials] = await Promise.all([
    fetchPublicCatalogServerState(),
    fetchPublicTestimonialsFromSupabaseServer().catch(() => []),
  ]);

  if (catalogState.status === "unavailable") {
    console.error("Falha ao carregar catálogo público na rota de checkout:", catalogState.error);
    throw catalogState.error;
  }

  // Sem fallback para mockCatalog: se o curso/turma não existir no catálogo
  // real, `CourseCheckoutPage` já renderiza seu estado de "não encontrado"
  // existente a partir de `courses`/`classes` vazios (AC3).
  return (
    <CourseCheckoutClient
      initialData={{
        courses: catalogState.catalog.courses,
        classes: catalogState.catalog.classes,
        instructors: catalogState.catalog.instructors,
        coursePublicContents: catalogState.catalog.coursePublicContents,
        testimonials: testimonials ?? [],
      }}
    />
  );
}
