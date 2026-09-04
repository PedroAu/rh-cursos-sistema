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
    "Content-Signal: search=yes, ai-input=yes, ai-train=yes",
    "Allow: /",
    "Disallow: /admin/",
    "Disallow: /api/",
    "Disallow: /aluno/",
    "Disallow: /instrutor/",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    ""
  ].join("\n");

  return new NextResponse(body, {
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Content-Signal": "search=yes, ai-input=yes, ai-train=yes",
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
