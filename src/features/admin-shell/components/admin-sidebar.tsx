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
    <aside className="material-drawer hidden border-r border-outline-variant bg-surface-muted lg:flex lg:w-80 lg:flex-col">
      <div className="border-b p-6">
        <Link to="/" className="flex items-center gap-3">
          <Image src={company.logo.src} alt={company.logo.alt} width={453} height={285} className="h-14 w-auto" />
          <div>
            <div className="font-semibold text-primary">{company.brandName}</div>
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{role}</div>
          </div>
        </Link>
      </div>

      <div className="border-b p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-secondary/60 p-3 text-primary">
            <User className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-text-main">{currentSession?.name ?? "Usuário demo"}</div>
            <div className="text-sm text-muted-foreground">{currentSession?.email}</div>
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
                  isActive ? "bg-primary text-white shadow-soft" : "text-muted-foreground hover:bg-secondary hover:text-primary"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2 p-4">
        <Button asChild variant="outline" className="justify-start">
          <Link to="/cursos">
            <BookOpen className="h-4 w-4" />
            Ver cursos
          </Link>
        </Button>
        <Button asChild variant="outline" className="justify-start">
          <Link to="/sobre">
            <Settings className="h-4 w-4" />
            Sobre a empresa
          </Link>
        </Button>
        <Button variant="ghost" className="justify-start" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
