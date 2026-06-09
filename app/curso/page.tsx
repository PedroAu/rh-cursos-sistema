"use client";

import { PublicPageShell } from "@/components/next-page-shell";
import { CourseDetailPage } from "@/features/public/course-detail/course-detail-page";

export default function Page() {
  return (
    <PublicPageShell>
      <CourseDetailPage />
    </PublicPageShell>
  );
}
