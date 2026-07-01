export type PublicNavItem = {
  to: string;
  label: string;
};

export const publicNavItems: PublicNavItem[] = [
  { to: "/", label: "Home" },
  { to: "/cursos", label: "Cursos" },
  { to: "/consultoria", label: "Consultoria" },
  { to: "/in-company", label: "In Company" },
  { to: "/agenda", label: "Agenda" },
  { to: "/blog", label: "Blog" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" }
];
