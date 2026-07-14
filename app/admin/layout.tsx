import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { DashboardPageShell } from "@/components/next-page-shell";
import { getServerSession } from "@/lib/server-session";
import {
  fetchPublicBlogPostsFromSupabaseServer,
  fetchPublicCatalogServerState,
} from "@/lib/supabase/rh-cursos-api";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  if (!session || session.role !== "admin") {
    redirect("/login?status=required&next=/admin");
  }

  const [catalogState, blogPosts] = await Promise.all([
    fetchPublicCatalogServerState(),
    fetchPublicBlogPostsFromSupabaseServer().catch((error) => {
      console.error("Falha ao carregar blog público no layout admin:", error);
      return null;
    }),
  ]);

  const initialData =
    catalogState.status === "ok"
      ? {
          courses: catalogState.catalog.courses,
          classes: catalogState.catalog.classes,
          instructors: catalogState.catalog.instructors,
          trainingPaths: catalogState.catalog.trainingPaths,
          coursePublicContents: catalogState.catalog.coursePublicContents,
          courseCategories: catalogState.catalog.courseCategories,
          blogPosts: blogPosts ?? [],
        }
      : {
          blogPosts: blogPosts ?? [],
        };

  if (catalogState.status === "unavailable") {
    console.error("Falha ao carregar catálogo público no layout admin:", catalogState.error);
  }

  return (
    <DashboardPageShell role="admin" initialSession={session} initialData={initialData}>
      {children}
    </DashboardPageShell>
  );
}
