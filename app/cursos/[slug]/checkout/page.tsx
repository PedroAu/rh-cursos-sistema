import type { Metadata } from "next";

import { CourseCheckoutClient } from "@/components/page-clients/course-checkout-client";
import {
  fetchPublicCatalogServerState,
  fetchPublicTestimonialsFromSupabaseServer,
} from "@/lib/supabase/rh-cursos-api";

// Renderização dinâmica: mesmo racional de app/cursos/[slug]/page.tsx
// (Story 16.1, AC7) — a pré-inscrição precisa refletir turmas/vagas reais a cada
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
      title: "Pré-inscrição temporariamente indisponível | RH Cursos",
      description: "Não foi possível carregar esta pré-inscrição no momento.",
    };
  }
  const course = courses.find((item) => item.slug === slug);

  if (!course) {
    return {
      title: "Pré-inscrição não encontrada | RH Cursos",
    };
  }

  return {
    title: `Pré-inscrição • ${course.title} | RH Cursos`,
    description: `Envie uma solicitação de pré-inscrição para ${course.title}.`,
  };
}

export default async function Page() {
  const [catalogState, testimonials] = await Promise.all([
    fetchPublicCatalogServerState(),
    fetchPublicTestimonialsFromSupabaseServer().catch(() => []),
  ]);

  if (catalogState.status === "unavailable") {
    console.error("Falha ao carregar catálogo público na rota de pré-inscrição:", catalogState.error);
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
