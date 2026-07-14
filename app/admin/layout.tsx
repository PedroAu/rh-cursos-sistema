import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { DashboardPageShell } from "@/components/next-page-shell";
import { getServerSession } from "@/lib/server-session";
import {
  fetchAdminBlogPostsFromSupabaseServer,
  fetchAdminCatalogFromSupabaseServer,
} from "@/lib/supabase/rh-cursos-api";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  if (!session || session.role !== "admin") {
    redirect("/login?status=required&next=/admin");
  }

  const [catalog, blogPosts] = await Promise.all([
    fetchAdminCatalogFromSupabaseServer().catch(() => null),
    fetchAdminBlogPostsFromSupabaseServer().catch(() => null),
  ]);
  const initialData = catalog
    ? {
        courses: catalog.courses,
        classes: catalog.classes,
        instructors: catalog.instructors,
        trainingPaths: catalog.trainingPaths,
        coursePublicContents: catalog.coursePublicContents,
        courseCategories: catalog.courseCategories,
        blogPosts: blogPosts ?? [],
      }
    : undefined;

  return (
    <DashboardPageShell
      role="admin"
      initialSession={session}
      initialData={initialData}
      bootstrapPublicData={false}
    >
      {children}
    </DashboardPageShell>
  );
}
