"use client";

import { PublicPageShell } from "@/components/next-page-shell";
import { EnrollmentSuccessPage } from "@/views/public/EnrollmentSuccess";

export default function Page() {
  return (
    <PublicPageShell>
      <EnrollmentSuccessPage />
    </PublicPageShell>
  );
}
