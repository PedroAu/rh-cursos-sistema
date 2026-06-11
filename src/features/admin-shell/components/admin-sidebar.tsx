"use client";

import { BookOpen, LogOut, Settings, User } from "lucide-react";
import Image from "next/image";

import { adminNavItems } from "@/features/admin-shell/config/admin-navigation";
import { useAppStore } from "@/lib/app-store";
import { company } from "@/lib/company";
import { Link, NavLink } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";

export function AdminSidebar({ role }: { role: "admin" }) {
  const { currentSession, logout } = useAppStore();

  return (
    <aside className="material-drawer hidden border-r border-white/10 bg-[var(--ea-footer-bg,#083b56)] text-white lg:flex lg:w-80 lg:flex-col">
      <div className="border-b border-white/10 p-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="inline-flex rounded-lg bg-white p-2">
            <Image src={company.logo.src} alt={company.logo.alt} width={453} height={285} className="h-10 w-auto" />
          </div>
          <div>
            <div className="font-semibold text-white">{company.brandName}</div>
            <div className="text-xs uppercase tracking-[0.18em] text-white/55">{role}</div>
          </div>
        </Link>
      </div>

      <div className="border-b border-white/10 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 p-3 text-[var(--ea-color-prestige-gold,#ffc641)]">
            <User className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-white">{currentSession?.name ?? "Usuário demo"}</div>
            <div className="text-sm text-white/65">{currentSession?.email}</div>
          </div>
        </div>
      </div>

      <nav className="grid gap-2 p-4">
        {adminNavItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) =>
                `material-nav-item flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[var(--ea-color-prestige-gold,#ffc641)] text-[var(--ea-button-primary-fg,#083b56)] shadow-soft"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2 border-t border-white/10 p-4">
        <Button asChild variant="outline" className="justify-start border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
          <Link to="/cursos">
            <BookOpen className="h-4 w-4" />
            Ver cursos
          </Link>
        </Button>
        <Button asChild variant="outline" className="justify-start border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
          <Link to="/sobre">
            <Settings className="h-4 w-4" />
            Sobre a empresa
          </Link>
        </Button>
        <Button variant="ghost" className="justify-start text-white/80 hover:bg-white/10 hover:text-white" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
