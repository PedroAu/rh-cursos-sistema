"use client";

import { PublicPageShell } from "@/components/next-page-shell";
import { InCompanyPage } from "@/features/public/in-company/in-company-page";

export default function Page() {
  return (
    <PublicPageShell>
      <InCompanyPage />
    </PublicPageShell>
  );
}
