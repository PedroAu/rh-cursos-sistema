import type { MetadataRoute } from "next";

import { fetchPublicBlogPostsFromSupabaseServer, fetchPublicCatalogFromSupabaseServer } from "@/lib/supabase/rh-cursos-api";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

const staticRoutes = [
  "/",
  "/cursos",
  "/agenda",
  "/sobre",
  "/in-company",
  "/consultoria",
  "/blog",
  "/contato",
  "/falar-com-especialista"
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [catalog, blogPosts] = await Promise.all([
    fetchPublicCatalogFromSupabaseServer().catch(() => null),
    fetchPublicBlogPostsFromSupabaseServer().catch(() => null)
  ]);

  const pages: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "/" : `${path}/`}`,
    changeFrequency: path === "/blog" || path === "/agenda" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/cursos" || path === "/agenda" ? 0.9 : 0.7
  }));

  const courses = catalog?.courses.map((course) => ({
    url: `${SITE_URL}/cursos/${course.slug}/`,
    changeFrequency: "weekly" as const,
    priority: 0.8
  })) ?? [];

  const posts = blogPosts?.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}/`,
    lastModified: post.date,
    changeFrequency: "monthly" as const,
    priority: 0.7
  })) ?? [];

  return [...pages, ...courses, ...posts];
}
