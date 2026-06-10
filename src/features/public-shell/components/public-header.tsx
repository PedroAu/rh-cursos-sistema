"use client";

import { LockKeyhole } from "lucide-react";
import Image from "next/image";
import { FormEvent, useState } from "react";

import { SearchInput } from "@/components/common/search-input";
import { publicNavItems } from "@/features/public-shell/config/public-navigation";
import { PublicMobileNavigation } from "@/features/public-shell/components/public-mobile-navigation";
import { Button } from "@/components/ui/button";
import { company } from "@/lib/company";
import { Link, NavLink, useLocation, useNavigate } from "@/lib/router-compat";

export function PublicHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const [query, setQuery] = useState("");

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = query.trim();
    navigate(normalized ? `/cursos?q=${encodeURIComponent(normalized)}` : "/cursos");
    setQuery("");
  };

  return (
    <header className={`material-app-bar sticky top-0 z-30 border-b border-outline-variant ${isHome ? "bg-white/78" : "bg-white/92"}`}>
      <div className="ea-container flex min-h-[72px] items-center justify-between gap-8">
        <Link to="/" className="flex items-center gap-3">
          <Image src={company.logo.src} alt={company.logo.alt} width={453} height={285} className="h-12 w-auto" />
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
          <form className="hidden xl:block xl:w-72" onSubmit={submitSearch}>
            <SearchInput
              aria-label="Buscar cursos"
              placeholder="Buscar cursos, trilhas ou temas"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onClear={() => setQuery("")}
              clearLabel="Limpar busca global"
              resultsLabel={query ? `Buscar por “${query}” abrirá o catálogo com o termo aplicado.` : "A busca global abre o catálogo com o termo aplicado."}
            />
          </form>
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
