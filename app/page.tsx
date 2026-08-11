import type { Metadata } from "next";

import { PublicPageShell } from "@/components/next-page-shell";
import { HomePage } from "@/features/public/home/home-page";

export const metadata: Metadata = {
  title: "Cursos e Treinamentos para Setor Público e Privado | RH Cursos",
  description:
    "Cursos abertos, treinamentos in company e consultoria para servidores públicos e empresas. eSocial, Departamento Pessoal, licitações e mais. Desde 2007, em todo o Brasil.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Cursos e Treinamentos para Setor Público e Privado | RH Cursos",
    description: "Cursos abertos, treinamentos in company e consultoria para servidores públicos e empresas.",
    url: "/",
    type: "website"
  }
};

export default function Page() {
  return (
    <PublicPageShell>
      <HomePage />
    </PublicPageShell>
  );
}
