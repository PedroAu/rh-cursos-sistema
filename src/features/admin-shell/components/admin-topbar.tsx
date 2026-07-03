"use client";

import { Bell, CircleHelp, Menu, Search } from "lucide-react";

import type { DashboardRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDashboardNavItems } from "@/features/admin-shell/config/admin-navigation";
import { useLocation } from "@/lib/router-compat";
import { getDefaultDashboardPath } from "@/lib/session-routing";

function resolvePlaceholder(pathname: string, role: DashboardRole) {
  const navItems = getDashboardNavItems(role);
  const homePath = getDefaultDashboardPath(role);
  const matched = [...navItems]
    .sort((left, right) => right.to.length - left.to.length)
    .find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`));

  if (!matched) {
    return role === "admin" ? "Buscar no painel..." : "Buscar no portal...";
  }

  if (matched.to === "/admin/alunos") return "Buscar aluno ou curso...";
  if (matched.to === "/admin/cursos") return "Buscar curso...";
  if (matched.to === "/admin/turmas") return "Buscar turma...";
  if (matched.to === "/aluno#inscricoes") return "Buscar inscrição...";
  if (matched.to === "/instrutor#turmas") return "Buscar turma atribuída...";
  if (matched.to === homePath) {
    return role === "admin" ? "Buscar no painel..." : "Buscar no portal...";
  }

  return role === "admin" ? "Buscar no painel..." : "Buscar no portal...";
}

export function AdminTopbar({
  opened,
  onToggle,
  role
}: {
  opened: boolean;
  onToggle: () => void;
  role: DashboardRole;
}) {
  const location = useLocation();
  const placeholder = resolvePlaceholder(location.pathname, role);

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-[72px] items-center gap-3 border-b border-[#d9dee7] bg-white/96 px-4 backdrop-blur-md sm:px-5 lg:left-[248px] lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        aria-expanded={opened}
        aria-label="Alternar navegação"
        className="rounded-full lg:hidden"
      >
        <Menu size={20} />
      </Button>

      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="relative hidden w-full max-w-[19rem] sm:block">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tk-ink-muted"
            aria-hidden="true"
          />
          <Input
            aria-label={placeholder}
            placeholder={placeholder}
            className="h-11 border-[#d5dae2] bg-[#f5f6f8] pl-10"
          />
        </div>
        <Button variant="ghost" size="icon" className="rounded-full text-tk-ink" aria-label="Notificações">
          <Bell size={19} />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full text-tk-ink" aria-label="Ajuda">
          <CircleHelp size={19} />
        </Button>
      </div>
    </header>
  );
}
