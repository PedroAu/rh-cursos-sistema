import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  Newspaper,
  ReceiptText,
  ShieldUser,
  Users
} from "lucide-react";

export type AdminNavItem = {
  to: string;
  label: string;
  mobileLabel: string;
  icon: LucideIcon;
};

export const adminNavItems: AdminNavItem[] = [
  { to: "/admin", label: "Visão geral", mobileLabel: "Início", icon: LayoutDashboard },
  { to: "/admin/cursos", label: "Cursos", mobileLabel: "Cursos", icon: BookOpen },
  { to: "/admin/turmas", label: "Turmas", mobileLabel: "Turmas", icon: CalendarDays },
  { to: "/admin/alunos", label: "Alunos", mobileLabel: "Alunos", icon: GraduationCap },
  { to: "/admin/leads", label: "Leads", mobileLabel: "Leads", icon: Users },
  { to: "/admin/inscricoes", label: "Inscrições", mobileLabel: "Inscrições", icon: ReceiptText },
  { to: "/admin/instrutores", label: "Instrutores", mobileLabel: "Equipe", icon: ShieldUser },
  { to: "/admin/blog", label: "Blog", mobileLabel: "Blog", icon: Newspaper }
];
