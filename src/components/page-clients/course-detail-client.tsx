"use client";

import { PublicPageShell } from "@/components/next-page-shell";
import { CourseDetailPage } from "@/views/public/CourseDetail";

export function CourseDetailClient() {
  return (
    <PublicPageShell>
      <CourseDetailPage />
    </PublicPageShell>
  );
}
