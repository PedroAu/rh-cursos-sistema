"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { BookOpen, LogOut, X } from "lucide-react";

import type { DashboardRole } from "@/lib/auth";
import { getDashboardNavItems } from "@/features/admin-shell/config/admin-navigation";
import { useAppStore } from "@/lib/app-store";
import { Link, useLocation } from "@/lib/router-compat";
import { getDefaultDashboardPath } from "@/lib/session-routing";
import { cn } from "@/lib/utils";

export const ADMIN_MOBILE_DRAWER_ID = "admin-mobile-drawer";

function getRoleLabel(role: DashboardRole) {
  if (role === "student") return "portal do aluno";
  if (role === "instructor") return "portal do instrutor";
  return "admin";
}

export function AdminMobileDrawer({
  opened,
  onOpenChange,
  role
}: {
  opened: boolean;
  onOpenChange: (open: boolean) => void;
  role: DashboardRole;
}) {
  const { logout, leads } = useAppStore();
  const location = useLocation();
  const navItems = getDashboardNavItems(role);
  const homePath = getDefaultDashboardPath(role);
  const newLeadsCount = leads.filter((lead) => lead.status === "Novo").length;

  const close = () => onOpenChange(false);

  return (
    <DialogPrimitive.Root open={opened} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[130] bg-tk-brand-hover/45 lg:hidden" />
        <DialogPrimitive.Content
          id={ADMIN_MOBILE_DRAWER_ID}
          aria-label="Navegação administrativa"
          className="fixed inset-y-0 left-0 z-[140] flex w-[min(84vw,320px)] flex-col bg-[#0e4666] shadow-xl focus:outline-none lg:hidden"
        >
          <div className="flex items-start justify-between gap-2 px-6 py-6">
            <div>
              <DialogPrimitive.Title className="text-[1.6rem] font-extrabold leading-none text-white">
                RH Cursos
              </DialogPrimitive.Title>
              <p className="mt-1.5 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-white/64">
                {getRoleLabel(role)}
              </p>
            </div>
            <DialogPrimitive.Close
              aria-label="Fechar navegação"
              className="rounded-full p-2 text-white/80 transition hover:bg-white/10"
            >
              <X size={20} />
            </DialogPrimitive.Close>
          </div>

          <nav aria-label="Navegação administrativa completa" className="flex-1 overflow-y-auto px-4 py-2">
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
                      onClick={close}
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

          <div className="px-4 py-6">
            <hr className="mb-4 border-white/12" />
            <div className="flex flex-col gap-2">
              <Link
                to="/cursos"
                onClick={close}
                className="flex items-center gap-3 rounded-[14px] bg-white/8 px-3 py-2.5 font-bold text-white transition hover:bg-white/16"
              >
                <BookOpen size={16} />
                Catálogo de cursos
              </Link>
              <button
                type="button"
                onClick={() => {
                  close();
                  logout();
                }}
                className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-left font-bold text-white/85 transition hover:bg-white/10"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
