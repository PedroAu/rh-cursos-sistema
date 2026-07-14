"use client";

import type { ReactNode } from "react";

import { PublicFooter } from "@/features/public-shell/components/public-footer";
import { PublicHeader } from "@/features/public-shell/components/public-header";
import { CommandPalette } from "@/components/common/command-palette";
import { QuoteModalProvider } from "@/components/in-company/quote-modal";
import { Outlet } from "@/lib/router-compat";

export function PublicLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>

      <QuoteModalProvider>
        <PublicHeader />

        <main id="main-content">
          {children ?? <Outlet />}
        </main>

        <PublicFooter />
        <CommandPalette />
      </QuoteModalProvider>
    </div>
  );
}
