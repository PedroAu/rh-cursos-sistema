import type { Metadata } from "next";

import { PublicPageShell } from "@/components/next-page-shell";
import { ContactPage } from "@/features/public/contact/contact-page";

export const metadata: Metadata = {
  title: "Contato | RH Cursos & Soluções",
  description: "Fale com a RH Cursos sobre cursos, treinamentos in company e consultoria.",
  alternates: { canonical: "/contato" }
};

export default function Page() {
  return (
    <PublicPageShell>
      <ContactPage />
    </PublicPageShell>
  );
}
