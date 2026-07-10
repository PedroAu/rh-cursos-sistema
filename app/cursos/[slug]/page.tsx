import type { Metadata } from "next";

import { CourseDetailClient } from "@/components/page-clients/course-detail-client";
import { mockCatalog } from "@/lib/mock-public-data";
import {
  fetchPublicCatalogFromSupabaseServer,
  fetchPublicTestimonialsFromSupabaseServer
} from "@/lib/supabase/rh-cursos-api";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getCourses() {
  try {
    const catalog = await fetchPublicCatalogFromSupabaseServer();
    return [...(catalog?.courses ?? []), ...mockCatalog.courses].filter(
      (course, index, collection) => collection.findIndex((item) => item.slug === course.slug) === index
    );
  } catch {
    return mockCatalog.courses;
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

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const [catalog, testimonials] = await Promise.all([
    fetchPublicCatalogFromSupabaseServer().catch(() => null),
    fetchPublicTestimonialsFromSupabaseServer().catch(() => [])
  ]);
  const liveCourseExists = catalog?.courses.some((course) => course.slug === slug) ?? false;
  const initialCatalog = liveCourseExists
    ? catalog
    : {
        courses: mockCatalog.courses,
        classes: mockCatalog.classes,
        instructors: mockCatalog.instructors,
        coursePublicContents: []
      };

  return (
    <CourseDetailClient
      initialData={{
        courses: initialCatalog?.courses ?? [],
        classes: initialCatalog?.classes ?? [],
        instructors: initialCatalog?.instructors ?? [],
        coursePublicContents: initialCatalog?.coursePublicContents ?? [],
        testimonials: testimonials ?? []
      }}
    />
  );
}
