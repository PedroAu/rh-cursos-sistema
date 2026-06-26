"use client";

import { PublicPageShell } from "@/components/next-page-shell";
import { CoursesPage } from "@/features/public/courses/courses-page";

export default function Page() {
  return (
    <PublicPageShell>
      <CoursesPage />
    </PublicPageShell>
  );
}
