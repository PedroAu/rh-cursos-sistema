import type { Metadata } from "next";

import { DepartmentPersonnelZeroCampaignShell } from "@/features/public/landing-pages/departamento-pessoal-do-zero/department-personnel-zero-campaign-shell";
import { DepartmentPersonnelZeroLandingPage } from "@/features/public/landing-pages/departamento-pessoal-do-zero/department-personnel-zero-landing-page";
import {
  DP_ZERO_LANDING_PATH,
  departmentPersonnelZeroStructuredData
} from "@/features/public/landing-pages/departamento-pessoal-do-zero/content";

export const metadata: Metadata = {
  title: "Departamento Pessoal do Zero — Formação Prática",
  description: "Formação gravada e online de 40 horas para aprender rotinas de Departamento Pessoal, praticar com simulações e construir um miniportfólio técnico.",
  alternates: { canonical: DP_ZERO_LANDING_PATH },
  openGraph: {
    title: "Departamento Pessoal do Zero — Formação Prática",
    description: "Aprenda, pratique e construa um miniportfólio para disputar vagas de entrada em Departamento Pessoal com mais preparo.",
    url: DP_ZERO_LANDING_PATH,
    type: "website",
    images: [
      {
        url: "/images/courses/departamento-pessoal-do-zero-key-visual.png",
        width: 1080,
        height: 1920,
        alt: "Duas pessoas estudando juntas em uma mesa de trabalho"
      }
    ]
  }
};

export default function Page() {
  const structuredData = JSON.stringify(Object.values(departmentPersonnelZeroStructuredData)).replace(/</g, "\\u003c");

  return (
    <DepartmentPersonnelZeroCampaignShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      <DepartmentPersonnelZeroLandingPage />
    </DepartmentPersonnelZeroCampaignShell>
  );
}
