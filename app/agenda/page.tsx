"use client";

import { PublicPageShell } from "@/components/next-page-shell";
import { AgendaPage } from "@/features/public/agenda/agenda-page";

export default function Page() {
  return (
    <PublicPageShell>
      <AgendaPage />
    </PublicPageShell>
  );
}
