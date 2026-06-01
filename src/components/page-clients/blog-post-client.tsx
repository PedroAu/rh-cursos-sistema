"use client";

import { PublicPageShell } from "@/components/next-page-shell";
import { BlogPostPage } from "@/views/public/BlogPost";

export function BlogPostClient() {
  return (
    <PublicPageShell>
      <BlogPostPage />
    </PublicPageShell>
  );
}
