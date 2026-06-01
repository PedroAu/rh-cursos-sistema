"use client";

import { PublicPageShell } from "@/components/next-page-shell";
import { BlogPage } from "@/views/public/Blog";

export default function Page() {
  return (
    <PublicPageShell>
      <BlogPage />
    </PublicPageShell>
  );
}
