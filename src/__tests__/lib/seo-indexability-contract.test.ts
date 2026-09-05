import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("SEO indexability contract", () => {
  it("canonicalizes HTTP requests before serving public machine-readable routes", () => {
    const middleware = source("middleware.ts");

    expect(middleware).toContain('redirectUrl.protocol = "https"');
    expect(middleware).toContain('redirectUrl.host = CANONICAL_HOST');
    expect(middleware).toContain('pathname === "/robots.txt" || pathname === "/sitemap.xml"');
    expect(middleware).toContain('matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]');
  });

  it("fails closed for unknown public slugs and hides checkout from search", () => {
    const course = source("app/cursos/[slug]/page.tsx");
    const blog = source("app/blog/[slug]/page.tsx");
    const checkout = source("app/cursos/[slug]/checkout/page.tsx");

    expect(course).toContain("notFound();");
    expect(blog).toContain("notFound();");
    expect(checkout).toContain('robots: { index: false, follow: true }');
    expect(checkout).toContain('alternates: { canonical: `/cursos/${course.slug}` }');
    expect(checkout).toContain("notFound();");
  });

  it("does not publish a partial sitemap after a public data failure", () => {
    const sitemap = source("app/sitemap.ts");

    expect(sitemap).toContain('throw new Error("Dados públicos indisponíveis para gerar o sitemap.")');
    expect(sitemap).not.toContain("fetchPublicCatalogFromSupabaseServer().catch");
    expect(sitemap).not.toContain("fetchPublicBlogPostsFromSupabaseServer().catch");
  });

  it("does not expose stale editorial counts in public pages", () => {
    const home = source("src/views/public/Home.tsx");
    const about = source("src/views/public/About.tsx");
    const blog = source("src/views/public/Blog.tsx");
    const company = source("src/lib/company.ts");

    expect(home).not.toContain("Quase 80 cursos em 6 trilhas");
    expect(home).not.toContain('value: "+18 anos"');
    expect(home).not.toContain('value: "+320"');
    expect(home).not.toContain('value: "96%"');
    expect(home).toContain("getCompanyYears()");
    expect(home).toContain("company.reportedMetrics");
    expect(company).toContain("reportedMetrics");
    expect(about).not.toContain('value: "~80"');
    expect(about).not.toContain('value: "6"');
    expect(blog).toContain("const visibleCount = filteredPosts.length;");
    expect(blog).not.toContain("curatedFeaturedSlug");
    expect(blog).not.toContain("curatedGridSlugs");
    expect(blog).toContain("publishedPosts\n        .slice(0, 4)");
    expect(blog).not.toContain("14.133");
  });

  it("keeps the homepage description concise and tied to verified offerings", () => {
    const homePage = source("app/page.tsx");
    const description = homePage.match(/const HOME_META_DESCRIPTION =\s*\n\s*"([^"]+)"/)?.[1];

    expect(description).toBeDefined();
    expect(description!.length).toBeLessThanOrEqual(160);
    expect(description).toContain("eSocial");
    expect(description).toContain("Departamento Pessoal");
    expect(description).toContain("licitações");
    expect(description).toContain("in company");
    expect(homePage.match(/description: HOME_META_DESCRIPTION/g)).toHaveLength(2);
  });

  it("marks authentication flows as non-indexable while allowing cleanup crawls", () => {
    const robots = source("app/robots.txt/route.ts");
    expect(robots).toContain("Content-Signal: search=yes, ai-input=yes, ai-train=yes");
    const loginLayout = source("app/login/layout.tsx");
    const authLayout = source("app/auth/layout.tsx");
    const recoveryLayout = source("app/recuperar-senha/layout.tsx");

    for (const layout of [loginLayout, authLayout, recoveryLayout]) {
      expect(layout).toContain("robots: { index: false, follow: false }");
    }

    expect(robots).not.toContain("Disallow: /login/");
    expect(robots).not.toContain("Disallow: /auth/");
    expect(robots).not.toContain("Disallow: /recuperar-senha/");
  });
});
