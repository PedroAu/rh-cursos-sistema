import type { Metadata } from "next";

import { PublicPageShell } from "@/components/next-page-shell";
import { EnrollmentSuccessPage } from "@/features/public/enrollment-success/enrollment-success-page";

export const metadata: Metadata = {
  title: "Inscrição recebida | RH Cursos",
  robots: { index: false, follow: false },
  alternates: { canonical: "/inscricao-confirmada" }
};

export default function Page() {
  return (
    <PublicPageShell>
      <EnrollmentSuccessPage />
    </PublicPageShell>
  );
}
