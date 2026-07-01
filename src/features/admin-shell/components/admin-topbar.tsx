"use client";

import { ActionIcon, AppShell, Burger, Group, TextInput } from "@mantine/core";
import { Bell, CircleHelp, Search } from "lucide-react";

import type { DashboardRole } from "@/lib/auth";
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
    <AppShell.Header
      style={{
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid #d9dee7"
      }}
    >
      <Group h="100%" px={{ base: "md", sm: "lg", lg: "xl" }} justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <Burger opened={opened} onClick={onToggle} hiddenFrom="lg" size="sm" aria-label="Alternar navegação" />
        </Group>

        <Group gap="sm" justify="flex-end" wrap="nowrap" style={{ flex: 1 }}>
          <TextInput
            aria-label={placeholder}
            placeholder={placeholder}
            leftSection={<Search size={18} />}
            visibleFrom="sm"
            styles={{
              root: { width: "100%", maxWidth: "19rem" },
              input: {
                height: 44,
                backgroundColor: "#f5f6f8",
                borderColor: "#d5dae2"
              }
            }}
          />
          <ActionIcon variant="subtle" color="dark" radius="xl" size={42} aria-label="Notificações">
            <Bell size={19} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="dark" radius="xl" size={42} aria-label="Ajuda">
            <CircleHelp size={19} />
          </ActionIcon>
        </Group>
      </Group>
    </AppShell.Header>
  );
}
