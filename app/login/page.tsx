"use client";

import { BarePageShell } from "@/components/next-page-shell";
import { LoginPage } from "@/features/public/login/login-page";

export default function Page() {
  return (
    <BarePageShell>
      <LoginPage />
    </BarePageShell>
  );
}
