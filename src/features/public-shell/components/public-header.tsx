"use client";

import { LockKeyhole, Search } from "lucide-react";
import Image from "next/image";

import { publicNavItems } from "@/features/public-shell/config/public-navigation";
import { PublicMobileNavigation } from "@/features/public-shell/components/public-mobile-navigation";
import { company } from "@/lib/company";
import { Link, NavLink, useLocation } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className={`material-app-bar sticky top-0 z-30 border-b border-outline-variant ${isHome ? "bg-white/78" : "bg-white/92"}`}>
      <div className="ea-container flex min-h-[72px] items-center justify-between gap-8">
        <Link to="/" className="flex items-center gap-3">
          <Image src={company.logo.src} alt={company.logo.alt} width={453} height={285} className="h-12 w-auto" priority />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {publicNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `material-nav-item relative border-b-2 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-primary"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <div className="relative hidden xl:block" role="search">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              aria-label="Buscar cursos"
              className="h-11 w-52 rounded-xl border border-outline-variant bg-white/92 pl-10 pr-4 text-sm outline-none transition focus:border-prestige-gold focus:ring-2 focus:ring-ring/25"
              placeholder="Buscar cursos..."
            />
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/login">
              <LockKeyhole className="h-4 w-4" />
              Admin
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <PublicMobileNavigation />
        </div>
      </div>
    </header>
  );
}
