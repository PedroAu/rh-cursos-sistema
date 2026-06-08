import { BookOpen, LayoutDashboard, LogOut, Settings, User } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { Link, NavLink, Outlet } from "@/lib/router-compat";

import { Button } from "@/components/ui/button";
import { AppToaster } from "@/components/ui/toaster";
import { useAppStore } from "@/lib/app-store";
import { company } from "@/lib/company";

const adminLinks: Array<{ to: string; label: string }> = [
  { to: "/admin", label: "Visão geral" },
  { to: "/admin/cursos", label: "Cursos" },
  { to: "/admin/turmas", label: "Turmas" },
  { to: "/admin/alunos", label: "Alunos" },
  { to: "/admin/leads", label: "Leads" },
  { to: "/admin/inscricoes", label: "Inscrições" },
  { to: "/admin/instrutores", label: "Instrutores" },
  { to: "/admin/blog", label: "Blog" }
];

export function DashboardShell({ role, children }: { role: "admin"; children?: ReactNode }) {
  const { currentSession, logout } = useAppStore();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-r border-outline-variant bg-surface-muted lg:w-72">
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
              <div className="rounded-lg bg-secondary/60 p-3 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-text-main">{currentSession?.name ?? "Usuário demo"}</div>
                <div className="text-sm text-muted-foreground">{currentSession?.email}</div>
              </div>
            </div>
          </div>

          <nav className="grid gap-2 p-4">
            {adminLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/admin"}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 text-sm font-semibold transition ${
                    isActive ? "bg-primary text-white" : "text-muted-foreground hover:bg-secondary hover:text-primary"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
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

        <main className="flex-1">
          <div className="border-b border-outline-variant bg-white px-6 py-4">
            <div className="container flex items-center justify-between gap-4">
              <div>
                <div className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Administração</div>
                <div className="text-lg font-semibold text-primary">Painel admin</div>
              </div>
              <Button asChild>
                <Link to="/login">
                  <LayoutDashboard className="h-4 w-4" />
                  Trocar acesso
                </Link>
              </Button>
            </div>
          </div>
          {children ?? <Outlet />}
        </main>
      </div>

      <AppToaster />
    </div>
  );
}
