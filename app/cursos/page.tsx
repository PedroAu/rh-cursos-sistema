"use client";

import { PublicPageShell } from "@/components/next-page-shell";
import { CoursesPage } from "@/views/public/Courses";

export default function Page() {
  return (
    <PublicPageShell>
      <CoursesPage />
    </PublicPageShell>
  );
}
