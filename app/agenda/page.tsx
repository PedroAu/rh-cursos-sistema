import type { Metadata } from "next";

import { PublicPageShell } from "@/components/next-page-shell";
import { AgendaPage } from "@/features/public/agenda/agenda-page";

export const metadata: Metadata = {
  title: "Agenda de Cursos e Treinamentos Presenciais e Online | RH Cursos",
  description:
    "Confira as próximas turmas de cursos presenciais e online da RH Cursos: eSocial, Departamento Pessoal, licitações, gestão pública e outros temas.",
  alternates: { canonical: "/agenda" },
  openGraph: {
    title: "Agenda de Cursos e Treinamentos | RH Cursos",
    description: "Próximas turmas presenciais e online da RH Cursos.",
    url: "/agenda",
    type: "website"
  }
};

export default function Page() {
  return (
    <PublicPageShell>
      <AgendaPage />
    </PublicPageShell>
  );
}
