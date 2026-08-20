import type { DashboardRole } from "@/lib/auth";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarDays,
  ContactRound,
  GraduationCap,
  LayoutDashboard,
  PanelsTopLeft,
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
  group?: "Visão geral" | "Gestão" | "Conteúdo" | "Sistema";
};

const adminNavItems: DashboardNavItem[] = [
  { to: "/admin", label: "Visão geral", mobileLabel: "Início", icon: LayoutDashboard, group: "Visão geral" },
  { to: "/admin/cursos", label: "Cursos", mobileLabel: "Cursos", icon: BookOpen, group: "Gestão" },
  { to: "/admin/turmas", label: "Turmas", mobileLabel: "Turmas", icon: CalendarDays, group: "Gestão" },
  { to: "/admin/alunos", label: "Alunos", mobileLabel: "Alunos", icon: GraduationCap, group: "Gestão" },
  { to: "/admin/leads", label: "Leads", mobileLabel: "Leads", icon: Users, group: "Gestão" },
  {
    to: "/admin/inscricoes",
    label: "Pré-inscrições e matrículas",
    mobileLabel: "Pré-inscrições e matrículas",
    icon: ReceiptText,
    group: "Gestão",
  },
  { to: "/admin/instrutores", label: "Instrutores", mobileLabel: "Equipe", icon: ShieldUser, group: "Gestão" },
  { to: "/admin/blog", label: "Blog", mobileLabel: "Blog", icon: Newspaper, group: "Conteúdo" },
  { to: "/admin/paginas", label: "Páginas", mobileLabel: "Páginas", icon: PanelsTopLeft, group: "Conteúdo" },
  { to: "/admin/configuracoes", label: "Configurações", mobileLabel: "Config.", icon: Settings, group: "Sistema" }
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
