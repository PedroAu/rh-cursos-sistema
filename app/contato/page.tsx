"use client";

import { PublicPageShell } from "@/components/next-page-shell";
import { ContactPage } from "@/features/public/contact/contact-page";

export default function Page() {
  return (
    <PublicPageShell>
      <ContactPage />
    </PublicPageShell>
  );
}
