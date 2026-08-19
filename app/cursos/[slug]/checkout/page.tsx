import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CourseCheckoutClient } from "@/components/page-clients/course-checkout-client";
import {
  fetchPublicCatalogServerState,
  fetchPublicTestimonialsFromSupabaseServer,
} from "@/lib/supabase/rh-cursos-api";
import { getPublicCourseName, SITE_URL } from "@/lib/seo";

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
      robots: { index: false, follow: false }
    };
  }
  const course = courses.find((item) => item.slug === slug);

  if (!course) {
    return {
      title: "Pré-inscrição não encontrada | RH Cursos",
      robots: { index: false, follow: false }
    };
  }

  return {
    title: `Pré-inscrição • ${getPublicCourseName(course.title)} | RH Cursos`,
    description: `Envie uma solicitação de pré-inscrição para ${getPublicCourseName(course.title)}.`,
    robots: { index: false, follow: true },
    alternates: { canonical: `/cursos/${course.slug}` },
    openGraph: {
      title: `Pré-inscrição • ${getPublicCourseName(course.title)} | RH Cursos`,
      description: `Envie uma solicitação de pré-inscrição para ${getPublicCourseName(course.title)}.`,
      url: `${SITE_URL}/cursos/${course.slug}/checkout/`,
      type: "website"
    }
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const [catalogState, testimonials] = await Promise.all([
    fetchPublicCatalogServerState(),
    fetchPublicTestimonialsFromSupabaseServer().catch(() => []),
  ]);

  if (catalogState.status === "unavailable") {
    console.error("Falha ao carregar catálogo público na rota de pré-inscrição:", catalogState.error);
    throw catalogState.error;
  }

  if (!catalogState.catalog.courses.some((course) => course.slug === slug)) {
    notFound();
  }

  // A pré-inscrição é uma etapa transacional, não uma landing page indexável.
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
