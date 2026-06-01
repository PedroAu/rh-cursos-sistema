"use client";

import { PublicPageShell } from "@/components/next-page-shell";
import { AgendaPage } from "@/views/public/Agenda";

export default function Page() {
  return (
    <PublicPageShell>
      <AgendaPage />
    </PublicPageShell>
  );
}
