"use client";

import { PublicPageShell } from "@/components/next-page-shell";
import { EnrollmentSuccessPage } from "@/features/public/enrollment-success/enrollment-success-page";

export default function Page() {
  return (
    <PublicPageShell>
      <EnrollmentSuccessPage />
    </PublicPageShell>
  );
}
