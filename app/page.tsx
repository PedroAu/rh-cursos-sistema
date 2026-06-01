"use client";

import { PublicPageShell } from "@/components/next-page-shell";
import { HomePage } from "@/views/public/Home";

export default function Page() {
  return (
    <PublicPageShell>
      <HomePage />
    </PublicPageShell>
  );
}
