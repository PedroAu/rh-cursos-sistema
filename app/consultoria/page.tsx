import type { Metadata } from "next";

import { PublicPageShell } from "@/components/next-page-shell";
import { SpecialistContactPage } from "@/features/public/specialist/specialist-page";

export const metadata: Metadata = {
  title: "Consultoria em eSocial, Departamento Pessoal, Licitações e Gestão Pública | RH Cursos",
  description:
    "Consultoria especializada para órgãos públicos e empresas: eSocial, folha de pagamento, licitações e contratos, contabilidade pública. Fale com um especialista.",
  alternates: { canonical: "/consultoria" },
  openGraph: {
    title: "Consultoria em eSocial, Departamento Pessoal, Licitações e Gestão Pública",
    description: "Apoio especializado para transformar normas e requisitos em execução segura.",
    url: "/consultoria",
    type: "website"
  }
};

export default function Page() {
  return (
    <PublicPageShell>
      <SpecialistContactPage leadOrigin="Consultoria" />
    </PublicPageShell>
  );
}
