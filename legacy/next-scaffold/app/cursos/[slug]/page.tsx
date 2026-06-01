import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CoursePageView } from "@/components/course-page-view";
import { getCourseBySlug, getRelatedCourses, getTestimonialsByCourse, courses } from "@/lib/site-data";

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);

  if (!course) {
    return {};
  }

  return {
    title: course.title,
    description: course.subtitle
  };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  const testimonials = getTestimonialsByCourse(course.slug);
  const related = getRelatedCourses(course.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.subtitle,
    provider: {
      "@type": "Organization",
      name: "RH Cursos & Soluções"
    }
  };

  return (
    <>
      <CoursePageView course={course} testimonials={testimonials} related={related} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
