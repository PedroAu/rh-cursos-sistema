"use client";

import { PublicPageShell } from "@/components/next-page-shell";
import { HomePage } from "@/features/public/home/home-page";

export default function Page() {
  return (
    <PublicPageShell>
      <HomePage />
    </PublicPageShell>
  );
}
