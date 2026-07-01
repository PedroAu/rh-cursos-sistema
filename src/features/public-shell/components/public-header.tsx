"use client";

import Image from "next/image";
import NextLink from "next/link";
import { ArrowRight, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PublicMobileNavigation } from "@/features/public-shell/components/public-mobile-navigation";
import { publicNavItems } from "@/features/public-shell/config/public-navigation";
import { company } from "@/lib/company";
import { useLocation } from "@/lib/router-compat";
import { cn } from "@/lib/utils";

const primaryNavItems = publicNavItems.filter((item) =>
  ["/cursos", "/agenda", "/in-company", "/consultoria", "/blog"].includes(item.to)
);

function isItemActive(pathname: string, to: string) {
  if (to === "/") {
    return pathname === "/";
  }

  return pathname === to || pathname.startsWith(`${to}/`);
}

export function PublicHeader() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header
      className={cn(
        "z-30",
        isHome
          ? "bg-[#eef0f2] pt-8 md:pt-10"
          : "sticky top-0 border-b border-[#ebebeb] bg-white/95 shadow-[0_10px_30px_-28px_rgba(0,0,0,0.35)] backdrop-blur-md"
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-[72px] w-[min(1180px,calc(100%-24px))] items-center justify-between gap-5 md:w-[min(1180px,calc(100%-40px))]",
          isHome &&
            "rounded-t-[24px] border border-b-0 border-[rgba(12,106,131,0.12)] bg-[#ebebeb] px-4 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)] md:px-10"
        )}
      >
        <NextLink
          href="/"
          aria-label={company.logo.alt}
          className="inline-flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1791a9] focus-visible:ring-offset-2"
        >
          <Image
            src={company.logo.src}
            alt={company.logo.alt}
            width={453}
            height={285}
            priority
            className="h-[42px] w-auto md:h-[46px]"
          />
        </NextLink>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          {primaryNavItems.map((item) => {
            const active = isItemActive(location.pathname, item.to);

            return (
              <NextLink
                key={item.to}
                href={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-[#222525]/80 transition hover:bg-black/[0.04] hover:text-[#222525] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1791a9] focus-visible:ring-offset-2",
                  active && "bg-[#e0f2f6] text-[#0c6a83]"
                )}
              >
                {item.label}
              </NextLink>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <NextLink
            href="/login"
            aria-label="Entrar"
            className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-[#222525]/80 transition hover:bg-black/[0.04] hover:text-[#222525] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1791a9] focus-visible:ring-offset-2"
          >
            <UserRound className="h-4 w-4" aria-hidden="true" />
            Entrar
          </NextLink>

          <Button asChild size="sm" className="bg-[#0c6a83] text-white hover:bg-[#084f63]">
            <NextLink href="/falar-com-especialista">
              Fale com um especialista
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </NextLink>
          </Button>
        </div>

        <div className="md:hidden">
          <PublicMobileNavigation />
        </div>
      </div>
    </header>
  );
}
