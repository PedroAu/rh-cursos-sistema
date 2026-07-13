import type { Metadata } from "next";

import { CourseCheckoutClient } from "@/components/page-clients/course-checkout-client";
import {
  fetchPublicCatalogFromSupabaseServer,
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
      title: "Checkout não encontrado | RH Cursos",
    };
  }

  return {
    title: `Checkout • ${course.title} | RH Cursos`,
    description: `Finalize a inscrição para ${course.title}.`,
  };
}

export default async function Page() {
  const [catalog, testimonials] = await Promise.all([
    fetchPublicCatalogFromSupabaseServer().catch(() => null),
    fetchPublicTestimonialsFromSupabaseServer().catch(() => []),
  ]);

  // Sem fallback para mockCatalog: se o curso/turma não existir no catálogo
  // real, `CourseCheckoutPage` já renderiza seu estado de "não encontrado"
  // existente a partir de `courses`/`classes` vazios (AC3).
  return (
    <CourseCheckoutClient
      initialData={{
        courses: catalog?.courses ?? [],
        classes: catalog?.classes ?? [],
        instructors: catalog?.instructors ?? [],
        coursePublicContents: catalog?.coursePublicContents ?? [],
        testimonials: testimonials ?? [],
      }}
    />
  );
}
