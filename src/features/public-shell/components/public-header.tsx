"use client";

import Image from "next/image";
import NextLink from "next/link";
import { UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PublicMobileNavigation } from "@/features/public-shell/components/public-mobile-navigation";
import { publicNavItems } from "@/features/public-shell/config/public-navigation";
import { useAppStore } from "@/lib/app-store";
import { company } from "@/lib/company";
import { useLocation } from "@/lib/router-compat";
import { getDefaultDashboardPath } from "@/lib/session-routing";
import { cn } from "@/lib/utils";

function isItemActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function PublicHeader() {
  const location = useLocation();
  const { currentSession } = useAppStore();
  const navOrder = ["/cursos", "/agenda", "/in-company", "/consultoria", "/sobre", "/blog"];
  const primaryNavItems = navOrder
    .map((to) => publicNavItems.find((item) => item.to === to))
    .filter((item): item is (typeof publicNavItems)[number] => Boolean(item));

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--tk-black-8)] bg-tk-surface">
      <div className="mx-auto flex h-[72px] w-[min(var(--tk-container),calc(100%-24px))] items-center justify-between gap-5 md:w-[min(var(--tk-container),calc(100%-40px))]">
        <NextLink
          href="/"
          aria-label={company.logo.alt}
          className="inline-flex shrink-0 rounded-tk-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tk-focus focus-visible:ring-offset-2"
        >
          <Image src="/images/brand/logo-horizontal.png" alt={company.logo.alt} width={453} height={285} priority className="h-[42px] w-auto" />
        </NextLink>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegacao principal">
          {primaryNavItems.map((item) => {
            const active = isItemActive(location.pathname, item.to);

            return (
              <NextLink
                key={item.to}
                href={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-tk-md px-3 py-2 text-[15px] font-medium leading-[1.35] text-tk-ink transition hover:bg-[var(--tk-black-5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tk-focus focus-visible:ring-offset-2",
                  active && "bg-tk-accent-soft text-tk-accent-strong"
                )}
              >
                {item.to === "/sobre" ? "Quem Somos" : item.label}
              </NextLink>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <NextLink
            href={currentSession ? getDefaultDashboardPath(currentSession.role) : "/login"}
            aria-label={currentSession ? "Ir para o painel" : "Entrar"}
            className="inline-flex h-10 items-center gap-2 rounded-tk-button px-3 text-[15px] font-medium leading-[1.35] text-tk-ink transition hover:bg-[var(--tk-black-5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tk-focus focus-visible:ring-offset-2"
          >
            <UserRound className="h-4 w-4" aria-hidden="true" />
            {currentSession ? "Ir para o painel" : "Entrar"}
          </NextLink>

          <Button asChild size="sm">
            <NextLink href="/falar-com-especialista">Fale com um especialista</NextLink>
          </Button>
        </div>

        <div className="md:hidden">
          <PublicMobileNavigation />
        </div>
      </div>
    </header>
  );
}
