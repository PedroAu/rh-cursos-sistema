import type { Metadata } from "next";

import { CourseDetailClient } from "@/components/page-clients/course-detail-client";
import { fetchPublicCatalogFromSupabaseServer } from "@/lib/supabase/rh-cursos-api";

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

export async function generateStaticParams() {
  return (await getCourses()).map((course) => ({ slug: course.slug }));
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
  const catalog = await fetchPublicCatalogFromSupabaseServer().catch(() => null);

  return (
    <CourseDetailClient
      initialData={{
        courses: catalog?.courses ?? [],
        classes: catalog?.classes ?? [],
        instructors: catalog?.instructors ?? []
      }}
    />
  );
}
