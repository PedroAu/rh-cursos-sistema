"use client";

import { LayoutDashboard } from "lucide-react";

import { adminNavItems } from "@/features/admin-shell/config/admin-navigation";
import { Link, useLocation } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";

function resolveCurrentSection(pathname: string) {
  const matched = [...adminNavItems]
    .sort((left, right) => right.to.length - left.to.length)
    .find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`));

  if (!matched) {
    return {
      eyebrow: "Administração",
      title: "Painel admin"
    };
  }

  return {
    eyebrow: "Administração",
    title: matched.label
  };
}

export function AdminTopbar() {
  const location = useLocation();
  const section = resolveCurrentSection(location.pathname);

  return (
    <div className="material-app-bar border-b border-outline-variant bg-white/95 px-6 py-4">
      <div className="container flex items-center justify-between gap-4">
        <div>
          <div className="text-sm uppercase tracking-[0.16em] text-muted-foreground">{section.eyebrow}</div>
          <div className="text-lg font-semibold text-primary">{section.title}</div>
        </div>
        <Button asChild>
          <Link to="/login">
            <LayoutDashboard className="h-4 w-4" />
            Trocar acesso
          </Link>
        </Button>
      </div>
    </div>
  );
}
