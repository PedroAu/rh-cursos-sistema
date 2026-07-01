import type { DashboardRole } from "@/lib/auth";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarDays,
  ContactRound,
  GraduationCap,
  LayoutDashboard,
  Newspaper,
  ReceiptText,
  Settings,
  ShieldUser,
  Users
} from "lucide-react";

export type DashboardNavItem = {
  to: string;
  label: string;
  mobileLabel: string;
  icon: LucideIcon;
};

const adminNavItems: DashboardNavItem[] = [
  { to: "/admin", label: "Visão geral", mobileLabel: "Início", icon: LayoutDashboard },
  { to: "/admin/cursos", label: "Cursos", mobileLabel: "Cursos", icon: BookOpen },
  { to: "/admin/turmas", label: "Turmas", mobileLabel: "Turmas", icon: CalendarDays },
  { to: "/admin/alunos", label: "Alunos", mobileLabel: "Alunos", icon: GraduationCap },
  { to: "/admin/leads", label: "Leads", mobileLabel: "Leads", icon: Users },
  { to: "/admin/inscricoes", label: "Inscrições", mobileLabel: "Inscrições", icon: ReceiptText },
  { to: "/admin/instrutores", label: "Instrutores", mobileLabel: "Equipe", icon: ShieldUser },
  { to: "/admin/blog", label: "Blog", mobileLabel: "Blog", icon: Newspaper },
  { to: "/admin/configuracoes", label: "Configurações", mobileLabel: "Config.", icon: Settings }
];

const studentNavItems: DashboardNavItem[] = [
  { to: "/aluno", label: "Minha visão geral", mobileLabel: "Início", icon: LayoutDashboard },
  { to: "/aluno#inscricoes", label: "Inscrições", mobileLabel: "Inscr.", icon: ReceiptText },
  { to: "/aluno#perfil", label: "Perfil", mobileLabel: "Perfil", icon: ContactRound }
];

const instructorNavItems: DashboardNavItem[] = [
  { to: "/instrutor", label: "Minha visão geral", mobileLabel: "Início", icon: LayoutDashboard },
  { to: "/instrutor#turmas", label: "Turmas", mobileLabel: "Turmas", icon: CalendarDays },
  { to: "/instrutor#alunos", label: "Alunos", mobileLabel: "Alunos", icon: Users }
];

export function getDashboardNavItems(role: DashboardRole): DashboardNavItem[] {
  switch (role) {
    case "student":
      return studentNavItems;
    case "instructor":
      return instructorNavItems;
    case "admin":
    default:
      return adminNavItems;
  }
}
