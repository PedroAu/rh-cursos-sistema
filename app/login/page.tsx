"use client";

import { PublicPageShell } from "@/components/next-page-shell";
import { LoginPage } from "@/views/public/Login";

export default function Page() {
  return (
    <PublicPageShell>
      <LoginPage />
    </PublicPageShell>
  );
}
