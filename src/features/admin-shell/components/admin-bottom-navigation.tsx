"use client";

import { adminNavItems } from "@/features/admin-shell/config/admin-navigation";
import { NavLink } from "@/lib/router-compat";

const mobileNavItems = adminNavItems.slice(0, 5);

export function AdminBottomNavigation() {
  return (
    <nav
      aria-label="Navegação administrativa"
      className="material-bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant bg-white/96 px-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.35rem)] pt-2 backdrop-blur lg:hidden"
    >
      <div className="grid grid-cols-5 gap-1">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) =>
                `material-bottom-nav-item flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition ${
                  isActive ? "bg-primary text-white shadow-soft" : "text-muted-foreground hover:bg-secondary/70 hover:text-primary"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.mobileLabel}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
