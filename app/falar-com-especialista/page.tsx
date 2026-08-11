import type { Metadata } from "next";

import { PublicPageShell } from "@/components/next-page-shell";
import { SpecialistContactPage } from "@/features/public/specialist/specialist-page";

export const metadata: Metadata = {
  title: "Fale com um Especialista | RH Cursos",
  description: "Receba orientação sobre capacitação, consultoria e treinamentos para sua equipe.",
  alternates: { canonical: "/falar-com-especialista" }
};

export default function Page() {
  return (
    <PublicPageShell>
      <SpecialistContactPage />
    </PublicPageShell>
  );
}
