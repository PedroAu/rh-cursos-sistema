"use client";

import { PublicPageShell } from "@/components/next-page-shell";
import { BlogPage } from "@/features/public/blog/blog-page";

export default function Page() {
  return (
    <PublicPageShell>
      <BlogPage />
    </PublicPageShell>
  );
}
