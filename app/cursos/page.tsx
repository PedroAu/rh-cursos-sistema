import { PublicPageShell } from "@/components/next-page-shell";
import { CoursesPage } from "@/features/public/courses/courses-page";
import { fetchPublicCatalogServerState } from "@/lib/supabase/rh-cursos-api";

export const dynamic = "force-dynamic";

export default async function Page() {
  const catalogState = await fetchPublicCatalogServerState();

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
