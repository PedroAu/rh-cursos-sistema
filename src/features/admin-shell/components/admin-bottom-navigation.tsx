"use client";

import type { DashboardRole } from "@/lib/auth";
import { getDashboardNavItems } from "@/features/admin-shell/config/admin-navigation";
import { Link, useLocation } from "@/lib/router-compat";
import { getDefaultDashboardPath } from "@/lib/session-routing";
import { cn } from "@/lib/utils";

export function AdminBottomNavigation({ role }: { role: DashboardRole }) {
  const location = useLocation();
  const mobileNavItems = getDashboardNavItems(role).slice(0, 5);
  const homePath = getDefaultDashboardPath(role);

  return (
    <nav
      aria-label="Navegação administrativa"
      className="fixed inset-x-0 bottom-0 z-[120] border-t border-tk-line bg-tk-surface px-2 pt-2 shadow-lg lg:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.4rem)" }}
    >
      <div className="grid grid-cols-5 gap-1.5">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.to === homePath
              ? location.pathname === item.to
              : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-[68px] flex-col items-center justify-center gap-1.5 rounded-2xl",
                isActive ? "bg-tk-accent-soft text-tk-brand" : "text-tk-ink-muted"
              )}
            >
              <Icon size={17} />
              <span className="text-[0.68rem] font-bold">{item.mobileLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
