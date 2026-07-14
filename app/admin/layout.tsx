import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { DashboardPageShell } from "@/components/next-page-shell";
import { getServerSession } from "@/lib/server-session";
import { fetchPublicCatalogServerState } from "@/lib/supabase/rh-cursos-api";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  if (!session || session.role !== "admin") {
    redirect("/login?status=required&next=/admin");
  }

  const catalogState = await fetchPublicCatalogServerState();
  const initialData = catalogState.status === "ok"
    ? {
        courses: catalogState.catalog.courses,
        classes: catalogState.catalog.classes,
        instructors: catalogState.catalog.instructors,
        trainingPaths: catalogState.catalog.trainingPaths,
        coursePublicContents: catalogState.catalog.coursePublicContents,
        courseCategories: catalogState.catalog.courseCategories,
      }
    : undefined;

  return (
    <DashboardPageShell role="admin" initialSession={session} initialData={initialData}>
      {children}
    </DashboardPageShell>
  );
}
