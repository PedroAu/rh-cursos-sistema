import { cookies } from "next/headers";

import { PublicPageShell } from "@/components/next-page-shell";
import { CoursesPage } from "@/features/public/courses/courses-page";
import {
  fetchPublicCatalogServerState,
  isServerPublicTestBaselineEnabled,
  PUBLIC_TEST_BASELINE_COOKIE_NAME
} from "@/lib/supabase/rh-cursos-api";

export const dynamic = "force-dynamic";

export default async function Page() {
  const cookieStore = await cookies();
  const usePublicTestBaseline = isServerPublicTestBaselineEnabled(
    cookieStore.get(PUBLIC_TEST_BASELINE_COOKIE_NAME)?.value
  );
  const catalogState = await fetchPublicCatalogServerState(usePublicTestBaseline);

  if (catalogState.status === "unavailable") {
    console.error("Falha ao carregar catálogo público na rota /cursos:", catalogState.error);
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
        courseCategories: catalogState.catalog.courseCategories,
      }}
    >
      <CoursesPage />
    </PublicPageShell>
  );
}
