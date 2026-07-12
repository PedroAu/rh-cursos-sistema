"use client";

import { PublicPageShell } from "@/components/next-page-shell";
import type { AppStoreInitialData } from "@/lib/app-store";
import { CourseCheckoutPage } from "@/views/public/CourseCheckout";

export function CourseCheckoutClient({ initialData }: { initialData?: AppStoreInitialData }) {
  return (
    <PublicPageShell initialData={initialData}>
      <CourseCheckoutPage />
    </PublicPageShell>
  );
}
