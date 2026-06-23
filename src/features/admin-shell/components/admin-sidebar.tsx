"use client";

import {
  AppShell,
  Avatar,
  Box,
  Button,
  Divider,
  Group,
  NavLink as MantineNavLink,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon
} from "@mantine/core";
import { BookOpen, LogOut, Settings, Sparkles } from "lucide-react";

import { adminNavItems } from "@/features/admin-shell/config/admin-navigation";
import { useAppStore } from "@/lib/app-store";
import { getInitials } from "@/lib/get-initials";
import { Link, useLocation } from "@/lib/router-compat";

export function AdminSidebar({ role }: { role: "admin" }) {
  const { currentSession, logout } = useAppStore();
  const location = useLocation();
  const initials = getInitials(currentSession?.name ?? "Admin");

  return (
    <AppShell.Navbar
      p={0}
      style={{
        background: "#0e4666",
        borderInlineEnd: "1px solid rgba(255,255,255,0.08)"
      }}
    >
      <AppShell.Section px="lg" py="xl">
        <Stack gap={8}>
          <Group justify="space-between" align="flex-start">
            <Box component={Link} to="/" style={{ textDecoration: "none", color: "inherit" }}>
              <Text fw={800} c="white" size="1.9rem" lh={1}>
                RH Cursos
              </Text>
              <Text c="rgba(255,255,255,0.64)" fz="0.72rem" tt="uppercase" fw={700} mt={6} lts="0.16em">
                {role}
              </Text>
            </Box>
            <ThemeIcon radius="xl" size={38} color="rhGold" variant="light">
              <Sparkles size={18} />
            </ThemeIcon>
          </Group>
        </Stack>
      </AppShell.Section>

      <AppShell.Section grow component={ScrollArea} px="md" py="sm" scrollbarSize={6}>
        <Stack gap={8}>
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === "/admin"
                ? location.pathname === item.to
                : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

            return (
              <MantineNavLink
                key={item.to}
                component={Link}
                to={item.to}
                label={item.label}
                leftSection={<Icon size={18} strokeWidth={2.2} />}
                active={isActive}
                variant="filled"
                styles={{
                  root: {
                    borderRadius: 14,
                    color: isActive ? "#1c1c1c" : "rgba(255,255,255,0.78)",
                    backgroundColor: isActive ? "#ffe09b" : "transparent"
                  },
                  label: {
                    fontWeight: 700,
                    fontSize: "1rem"
                  },
                  section: {
                    color: isActive ? "#2a2210" : "rgba(255,255,255,0.78)"
                  }
                }}
              />
            );
          })}
        </Stack>
      </AppShell.Section>

      <AppShell.Section px="lg" py="lg">
        <Divider color="rgba(255,255,255,0.12)" mb="lg" />
        <Group wrap="nowrap" align="center" mb="md">
          <Avatar radius="xl" color="rhGold" variant="filled">
            {initials || "A"}
          </Avatar>
          <Box style={{ minWidth: 0 }}>
            <Text fw={700} c="white" truncate>
              {currentSession?.name ?? "Admin"}
            </Text>
            <Text size="sm" c="rgba(255,255,255,0.62)" truncate>
              {currentSession?.email ?? "Diretoria"}
            </Text>
          </Box>
        </Group>

        <Stack gap="xs">
          <Button
            component={Link}
            to="/cursos"
            justify="flex-start"
            variant="light"
            color="rhSlate"
            leftSection={<BookOpen size={16} />}
            styles={{
              root: { backgroundColor: "rgba(255,255,255,0.08)", color: "#ffffff" }
            }}
          >
            Catálogo de cursos
          </Button>
          <Button
            component={Link}
            to="/sobre"
            justify="flex-start"
            variant="light"
            color="rhSlate"
            leftSection={<Settings size={16} />}
            styles={{
              root: { backgroundColor: "rgba(255,255,255,0.08)", color: "#ffffff" }
            }}
          >
            Informações institucionais
          </Button>
          <Button
            justify="flex-start"
            variant="subtle"
            color="gray"
            leftSection={<LogOut size={16} />}
            onClick={logout}
            styles={{ root: { color: "rgba(255,255,255,0.85)" } }}
          >
            Sair
          </Button>
        </Stack>
      </AppShell.Section>
    </AppShell.Navbar>
  );
}
