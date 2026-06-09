"use client";

import { PublicPageShell } from "@/components/next-page-shell";
import { CourseDetailPage } from "@/views/public/CourseDetail";

export default function Page() {
  return (
    <PublicPageShell>
      <CourseDetailPage />
    </PublicPageShell>
  );
}
