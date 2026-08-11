import type { Metadata } from "next";

import { PublicPageShell } from "@/components/next-page-shell";
import { InCompanyPage } from "@/features/public/in-company/in-company-page";

export const metadata: Metadata = {
  title: "Treinamento In Company para Órgãos Públicos e Empresas | RH Cursos",
  description:
    "Treinamento in company sob medida: eSocial, Departamento Pessoal, licitações, contabilidade pública e gestão. Turmas fechadas no seu órgão ou empresa, em todo o Brasil.",
  alternates: { canonical: "/in-company" },
  openGraph: {
    title: "Treinamento In Company para Órgãos Públicos e Empresas | RH Cursos",
    description: "Programas de capacitação sob medida para sua equipe, em todo o Brasil.",
    url: "/in-company",
    type: "website"
  }
};

export default function Page() {
  return (
    <PublicPageShell>
      <InCompanyPage />
    </PublicPageShell>
  );
}
