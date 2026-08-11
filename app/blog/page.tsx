import { cookies } from "next/headers";
import type { Metadata } from "next";

import { PublicPageShell } from "@/components/next-page-shell";
import { BlogPage } from "@/features/public/blog/blog-page";
import {
  fetchPublicBlogPostsFromSupabaseServer,
  isPublicTestBaselineBuildEnabled,
  isServerPublicTestBaselineEnabled,
  PUBLIC_TEST_BASELINE_COOKIE_NAME
} from "@/lib/supabase/rh-cursos-api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog RH Cursos — eSocial, Departamento Pessoal, Licitações e Gestão Pública",
  description:
    "Artigos práticos sobre eSocial, Departamento Pessoal, licitações, gestão pública, LGPD e compliance para aplicar a norma com segurança.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog RH Cursos — eSocial, Departamento Pessoal, Licitações e Gestão Pública",
    description: "A norma explicada de um jeito que você usa.",
    url: "/blog",
    type: "website"
  }
};

export default async function Page() {
  const cookieStore = await cookies();
  const usePublicTestBaseline =
    isPublicTestBaselineBuildEnabled() ||
    isServerPublicTestBaselineEnabled(cookieStore.get(PUBLIC_TEST_BASELINE_COOKIE_NAME)?.value);
  const blogPosts = await fetchPublicBlogPostsFromSupabaseServer(usePublicTestBaseline).catch(() => null);

  return (
    <PublicPageShell initialData={{ blogPosts: blogPosts ?? undefined }}>
      <BlogPage />
    </PublicPageShell>
  );
}
