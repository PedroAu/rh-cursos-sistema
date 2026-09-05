import { cookies } from "next/headers";
import type { Metadata } from "next";

import { PublicPageShell } from "@/components/next-page-shell";
import { HomePage } from "@/features/public/home/home-page";
import {
  fetchPublicCatalogServerState,
  isServerPublicTestBaselineEnabled,
  PUBLIC_TEST_BASELINE_COOKIE_NAME
} from "@/lib/supabase/rh-cursos-api";

export const dynamic = "force-dynamic";

const HOME_META_DESCRIPTION =
  "Cursos, treinamentos in company e consultoria em eSocial, Departamento Pessoal e licitações para órgãos públicos e empresas. Desde 2007, em todo o Brasil.";

export const metadata: Metadata = {
  title: "Cursos e Treinamentos para Setor Público e Privado | RH Cursos",
  description: HOME_META_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Cursos e Treinamentos para Setor Público e Privado | RH Cursos",
    description: HOME_META_DESCRIPTION,
    url: "/",
    type: "website"
  }
};

export default async function Page() {
  const cookieStore = await cookies();
  const usePublicTestBaseline = isServerPublicTestBaselineEnabled(
    cookieStore.get(PUBLIC_TEST_BASELINE_COOKIE_NAME)?.value
  );
  const catalogState = await fetchPublicCatalogServerState(usePublicTestBaseline);

  if (catalogState.status === "unavailable") {
    console.error("Falha ao carregar catálogo público na rota /:", catalogState.error);
    throw catalogState.error;
  }

  return (
    <PublicPageShell
      initialData={{
        courses: catalogState.catalog.courses,
        classes: catalogState.catalog.classes,
        instructors: catalogState.catalog.instructors,
        trainingPaths: catalogState.catalog.trainingPaths,
        coursePublicContents: catalogState.catalog.coursePublicContents,
        courseCategories: catalogState.catalog.courseCategories
      }}
    >
      <HomePage />
    </PublicPageShell>
  );
}
