"use client";

import { PublicPageShell } from "@/components/next-page-shell";
import type { AppStoreInitialData } from "@/lib/app-store";
import { CourseDetailPage } from "@/views/public/CourseDetail";

export function CourseDetailClient({ initialData }: { initialData?: AppStoreInitialData }) {
  return (
    <PublicPageShell initialData={initialData}>
      <CourseDetailPage />
    </PublicPageShell>
  );
}
