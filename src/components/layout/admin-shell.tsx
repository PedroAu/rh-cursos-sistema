"use client";

import { useState } from "react";
import { Bell, CircleHelp, ExternalLink, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Button } from "@/components/ui/button";
import { adminNavItems } from "@/lib/site-data";

type AdminShellProps = {
  profileLabel: string;
  children: React.ReactNode;
  signOutAction: () => Promise<void>;
};

export function AdminShell({
  profileLabel,
  children,
  signOutAction,
}: AdminShellProps) {
  const [opened, setOpened] = useState(false);
  const pathname = usePathname();
  const currentPage =
    adminNavItems.find((item) => item.href === pathname)?.label ?? "Painel";

  return (
    <div className="min-h-dvh bg-muted/50 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
      <a href="#admin-main-content" className="skip-link">
        Pular para o conteúdo
      </a>

      <div className="hidden lg:block">
        <div className="sticky top-0 h-dvh">
          <AdminSidebar profileLabel={profileLabel} />
        </div>
      </div>

      {opened ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu administrativo">
          <button
            aria-label="Fechar menu administrativo"
            className="absolute inset-0 bg-black/55"
            onClick={() => setOpened(false)}
            type="button"
          />
          <div className="relative h-full w-80 max-w-[86vw] shadow-2xl">
            <AdminSidebar
              onNavigate={() => setOpened(false)}
              profileLabel={profileLabel}
            />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6 xl:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                aria-label={opened ? "Fechar menu administrativo" : "Abrir menu administrativo"}
                className="lg:hidden"
                onClick={() => setOpened((current) => !current)}
                size="icon"
                type="button"
                variant="ghost"
              >
                {opened ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
              </Button>
              <h1 className="truncate font-heading text-2xl font-bold text-brand-navy-700">
                {currentPage}
              </h1>
            </div>

            <div className="flex min-w-0 items-center gap-2 md:gap-3">
              <Button aria-label="Notificações" className="hidden sm:inline-flex" size="icon" type="button" variant="ghost">
                <Bell aria-hidden className="size-5" />
              </Button>
              <Button aria-label="Ajuda" className="hidden sm:inline-flex" size="icon" type="button" variant="ghost">
                <CircleHelp aria-hidden className="size-5" />
              </Button>
              <span className="hidden max-w-44 truncate text-sm text-muted-foreground xl:inline">
                {profileLabel}
              </span>
              <Button asChild variant="ghost">
                <Link href="/">
                  Site
                  <ExternalLink aria-hidden className="size-4" />
                </Link>
              </Button>
              <form action={signOutAction}>
                <Button type="submit" variant="outline">
                  <LogOut aria-hidden className="size-4" />
                  Sair
                </Button>
              </form>
            </div>
          </div>
        </header>

        <main className="min-w-0 p-4 md:p-6 xl:p-8" id="admin-main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
