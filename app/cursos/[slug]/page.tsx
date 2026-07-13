import type { Metadata } from "next";

import { CourseDetailClient } from "@/components/page-clients/course-detail-client";
import {
  fetchPublicCatalogFromSupabaseServer,
  fetchPublicTestimonialsFromSupabaseServer
} from "@/lib/supabase/rh-cursos-api";

// Renderização dinâmica: o catálogo é editado via admin e precisa refletir o
// estado real do banco a cada request, sem "assar" cursos/turmas em páginas
// estáticas geradas em build (ver Story 16.1, AC7 — corretude > performance
// de build, dado que não há cache/ISR no projeto).
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getCourses() {
  try {
    const catalog = await fetchPublicCatalogFromSupabaseServer();
    return catalog?.courses ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = (await getCourses()).find((item) => item.slug === slug);

  if (!course) {
    return {
      title: "Curso não encontrado | RH Cursos"
    };
  }

  return {
    title: `${course.title} | RH Cursos`,
    description: course.shortDescription
  };
}

export default async function Page() {
  const [catalog, testimonials] = await Promise.all([
    fetchPublicCatalogFromSupabaseServer().catch(() => null),
    fetchPublicTestimonialsFromSupabaseServer().catch(() => [])
  ]);

  // Sem fallback para mockCatalog: se o curso não existir no catálogo real,
  // `courses` chega vazio e `CourseDetailPage` já renderiza o estado
  // "Curso não encontrado" existente (AC2), sem dado fictício exibido.
  return (
    <CourseDetailClient
      initialData={{
        courses: catalog?.courses ?? [],
        classes: catalog?.classes ?? [],
        instructors: catalog?.instructors ?? [],
        coursePublicContents: catalog?.coursePublicContents ?? [],
        testimonials: testimonials ?? []
      }}
    />
  );
}
