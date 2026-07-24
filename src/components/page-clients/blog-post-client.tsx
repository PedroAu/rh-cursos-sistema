"use client";

import { PublicPageShell } from "@/components/next-page-shell";
import type { AppStoreInitialData } from "@/lib/app-store";
import { BlogPostPage } from "@/views/public/BlogPost";

export function BlogPostClient({ initialData }: { initialData?: AppStoreInitialData }) {
  return (
    <PublicPageShell initialData={initialData} bootstrapPublicData={false}>
      <BlogPostPage />
    </PublicPageShell>
  );
}
