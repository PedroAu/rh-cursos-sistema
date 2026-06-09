"use client";

import { PublicPageShell } from "@/components/next-page-shell";
import { LoginPage } from "@/features/public/login/login-page";

export default function Page() {
  return (
    <PublicPageShell>
      <LoginPage />
    </PublicPageShell>
  );
}
