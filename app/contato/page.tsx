"use client";

import { PublicPageShell } from "@/components/next-page-shell";
import { ContactPage } from "@/views/public/Contact";

export default function Page() {
  return (
    <PublicPageShell>
      <ContactPage />
    </PublicPageShell>
  );
}
