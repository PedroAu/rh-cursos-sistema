"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import Image from "next/image";
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
          className="fixed inset-y-0 left-0 z-[140] flex w-[min(84vw,320px)] flex-col border-r border-tk-line bg-tk-surface-2 shadow-xl focus:outline-none lg:hidden"
        >
          <div className="flex items-start justify-between gap-2 px-6 py-6">
            <div>
              <DialogPrimitive.Title asChild>
                <div>
                  <Image src="/images/brand/logo-horizontal.png" alt="RH Cursos" width={781} height={186} className="h-auto w-[184px]" />
                </div>
              </DialogPrimitive.Title>
              <p className="mt-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-tk-ink-muted">
                {getRoleLabel(role)}
              </p>
            </div>
            <DialogPrimitive.Close
              aria-label="Fechar navegação"
              className="rounded-full p-2 text-tk-ink-muted transition hover:bg-tk-surface"
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
                      <p className="mb-1 mt-4 px-3 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-tk-ink-muted first:mt-0">
                        {item.group}
                      </p>
                    ) : null}
                    <Link
                      to={item.to}
                      onClick={close}
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

          <div className="px-4 py-6">
            <hr className="mb-4 border-tk-line" />
            <div className="flex flex-col gap-2">
              <Link
                to="/cursos"
                onClick={close}
                className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 font-bold text-tk-ink transition hover:bg-tk-surface"
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
                className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-left font-bold text-tk-ink-muted transition hover:bg-tk-surface hover:text-tk-ink"
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
