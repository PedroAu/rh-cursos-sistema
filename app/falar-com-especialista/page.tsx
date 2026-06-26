"use client";

import { PublicPageShell } from "@/components/next-page-shell";
import { SpecialistContactPage } from "@/features/public/specialist/specialist-page";

export default function Page() {
  return (
    <PublicPageShell>
      <SpecialistContactPage />
    </PublicPageShell>
  );
}
