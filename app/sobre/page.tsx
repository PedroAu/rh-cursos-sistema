import type { Metadata } from "next";

import { PublicPageShell } from "@/components/next-page-shell";
import { AboutPage } from "@/features/public/about/about-page";

export const metadata: Metadata = {
  title: "Quem Somos — RH Cursos & Soluções, desde 2007 em Brasília | RH Cursos",
  description:
    "Conheça a RH Cursos & Soluções: empresa de capacitação e consultoria fundada em 2007 em Brasília-DF, com atuação nacional no setor público e privado.",
  alternates: { canonical: "/sobre" },
  openGraph: {
    title: "Quem Somos | RH Cursos & Soluções",
    description: "Capacitação e consultoria para o setor público e privado desde 2007.",
    url: "/sobre",
    type: "website"
  }
};

export default function Page() {
  return (
    <PublicPageShell>
      <AboutPage />
    </PublicPageShell>
  );
}
