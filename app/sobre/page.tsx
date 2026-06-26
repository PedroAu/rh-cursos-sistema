"use client";

import { PublicPageShell } from "@/components/next-page-shell";
import { AboutPage } from "@/features/public/about/about-page";

export default function Page() {
  return (
    <PublicPageShell>
      <AboutPage />
    </PublicPageShell>
  );
}
