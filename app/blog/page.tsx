import { cookies } from "next/headers";

import { PublicPageShell } from "@/components/next-page-shell";
import { BlogPage } from "@/features/public/blog/blog-page";
import {
  fetchPublicBlogPostsFromSupabaseServer,
  isPublicTestBaselineBuildEnabled,
  isServerPublicTestBaselineEnabled,
  PUBLIC_TEST_BASELINE_COOKIE_NAME
} from "@/lib/supabase/rh-cursos-api";

export const dynamic = "force-dynamic";

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
