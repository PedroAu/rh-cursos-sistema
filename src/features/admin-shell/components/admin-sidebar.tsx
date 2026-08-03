"use client";

import Image from "next/image";
import { BookOpen, LogOut, Sparkles } from "lucide-react";

import type { DashboardRole } from "@/lib/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getDashboardNavItems } from "@/features/admin-shell/config/admin-navigation";
import { useAppStore } from "@/lib/app-store";
import { getInitials } from "@/lib/get-initials";
import { Link, useLocation } from "@/lib/router-compat";
import { getDefaultDashboardPath } from "@/lib/session-routing";
import { cn } from "@/lib/utils";

function getRoleLabel(role: DashboardRole) {
  if (role === "student") return "portal do aluno";
  if (role === "instructor") return "portal do instrutor";
  return "admin";
}

export function AdminSidebar({ role }: { role: DashboardRole }) {
  const { currentSession, logout, leads } = useAppStore();
  const location = useLocation();
  const initials = getInitials(currentSession?.name ?? "Admin");
  const navItems = getDashboardNavItems(role);
  const homePath = getDefaultDashboardPath(role);
  const newLeadsCount = leads.filter((lead) => lead.status === "Novo").length;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-tk-line bg-tk-surface-2 lg:flex">
      <div className="px-6 py-8">
        <div className="flex items-start justify-between gap-2">
          <Link to="/" className="text-inherit no-underline">
            <Image src="/images/brand/logo-horizontal.png" alt="RH Cursos" width={781} height={186} priority className="h-auto w-[184px]" />
            <p className="mt-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-tk-ink-muted">
              {getRoleLabel(role)}
            </p>
          </Link>
          <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-tk-accent-soft text-tk-brand">
            <Sparkles size={18} />
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-2" aria-label="Navegação administrativa principal">
        <div className="flex flex-col gap-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const showGroup = role === "admin" && item.group !== navItems[index - 1]?.group;
            const isActive =
              item.to === homePath
                ? location.pathname === item.to
                : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

            return (
              <div key={item.to}>
                {showGroup ? (
                  <p className="mb-1 mt-4 px-3 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-tk-ink-muted first:mt-0">
                    {item.group}
                  </p>
                ) : null}
                <Link
                  to={item.to}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-[1rem] font-bold transition",
                    isActive ? "bg-tk-accent-soft text-tk-brand" : "text-tk-ink-muted hover:bg-tk-surface"
                  )}
                >
                  <Icon size={18} strokeWidth={2.2} className={isActive ? "text-tk-brand" : "text-tk-ink-muted"} />
                  <span className="flex-1">{item.label}</span>
                  {item.to === "/admin/leads" && newLeadsCount > 0 ? (
                    <span className="rounded-tk-pill bg-tk-brand px-2 py-0.5 text-xs font-bold text-white">
                      {newLeadsCount}
                    </span>
                  ) : null}
                </Link>
              </div>
            );
          })}
        </div>
      </nav>

      <div className="px-6 py-6">
        <hr className="mb-6 border-tk-line" />
        <div className="mb-4 flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-tk-accent-soft text-tk-brand">{initials || "A"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-bold text-tk-ink">{currentSession?.name ?? "Admin"}</p>
            <p className="truncate text-sm text-tk-ink-muted">{currentSession?.email ?? "Diretoria"}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button asChild variant="ghost" className="justify-start text-tk-ink hover:bg-tk-surface">
            <Link to="/cursos">
              <BookOpen size={16} />
              Catálogo de cursos
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start text-tk-ink-muted hover:bg-tk-surface hover:text-tk-ink" onClick={logout}>
            <LogOut size={16} />
            Sair
          </Button>
        </div>
      </div>
    </aside>
  );
}
