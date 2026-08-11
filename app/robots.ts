import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: ["*", "GPTBot", "ClaudeBot", "CCBot", "PerplexityBot", "Google-Extended", "Bytespider"],
      allow: "/",
      disallow: ["/admin/", "/api/", "/aluno/", "/instrutor/", "/login/", "/auth/", "/recuperar-senha/"]
    },
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
