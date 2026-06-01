"use client";

import { PublicPageShell } from "@/components/next-page-shell";
import { AboutPage } from "@/views/public/About";

export default function Page() {
  return (
    <PublicPageShell>
      <AboutPage />
    </PublicPageShell>
  );
}
