"use client";

import { PublicPageShell } from "@/components/next-page-shell";
import { InCompanyPage } from "@/views/public/InCompany";

export default function Page() {
  return (
    <PublicPageShell>
      <InCompanyPage />
    </PublicPageShell>
  );
}
