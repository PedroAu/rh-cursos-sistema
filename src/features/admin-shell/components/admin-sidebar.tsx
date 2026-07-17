"use client";

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
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col bg-[#0e4666] lg:flex">
      <div className="px-6 py-8">
        <div className="flex items-start justify-between gap-2">
          <Link to="/" className="text-inherit no-underline">
            <p className="text-[1.9rem] font-extrabold leading-none text-white">RH Cursos</p>
            <p className="mt-1.5 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-white/64">
              {getRoleLabel(role)}
            </p>
          </Link>
          <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-[#ffe09b]/25 text-[#ffe09b]">
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
                  <p className="mb-1 mt-4 px-3 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/48 first:mt-0">
                    {item.group}
                  </p>
                ) : null}
                <Link
                  to={item.to}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-[1rem] font-bold transition",
                    isActive ? "bg-[#ffe09b] text-[#1c1c1c]" : "text-white/78 hover:bg-white/10"
                  )}
                >
                  <Icon size={18} strokeWidth={2.2} className={isActive ? "text-[#2a2210]" : "text-white/78"} />
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
        <hr className="mb-6 border-white/12" />
        <div className="mb-4 flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-[#ffe09b] text-[#1c1c1c]">{initials || "A"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-bold text-white">{currentSession?.name ?? "Admin"}</p>
            <p className="truncate text-sm text-white/62">{currentSession?.email ?? "Diretoria"}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button asChild variant="ghost" className="justify-start bg-white/8 text-white hover:bg-white/16">
            <Link to="/cursos">
              <BookOpen size={16} />
              Catálogo de cursos
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start text-white/85 hover:bg-white/10" onClick={logout}>
            <LogOut size={16} />
            Sair
          </Button>
        </div>
      </div>
    </aside>
  );
}
