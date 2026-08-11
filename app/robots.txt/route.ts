import { NextResponse } from "next/server";

import { SITE_URL } from "@/lib/seo";

export function GET() {
  const body = [
    "User-agent: *",
    "User-agent: GPTBot",
    "User-agent: ClaudeBot",
    "User-agent: CCBot",
    "User-agent: PerplexityBot",
    "User-agent: Google-Extended",
    "User-agent: Bytespider",
    "Content-Signal: search=yes, ai-input=yes, ai-train=no",
    "Allow: /",
    "Disallow: /admin/",
    "Disallow: /api/",
    "Disallow: /aluno/",
    "Disallow: /instrutor/",
    "Disallow: /login/",
    "Disallow: /auth/",
    "Disallow: /recuperar-senha/",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    ""
  ].join("\n");

  return new NextResponse(body, {
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Content-Signal": "search=yes, ai-input=yes, ai-train=no",
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
