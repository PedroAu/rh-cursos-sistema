import type { Metadata } from "next";

import { CourseDetailClient } from "@/components/page-clients/course-detail-client";
import { mockCourses } from "@/data";
import { fetchPublicCatalogFromSupabase } from "@/lib/supabase/rh-cursos-api";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getCourses() {
  try {
    const catalog = await fetchPublicCatalogFromSupabase();
    return catalog?.courses.length ? catalog.courses : mockCourses;
  } catch {
    return mockCourses;
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

export default function Page() {
  return <CourseDetailClient />;
}
