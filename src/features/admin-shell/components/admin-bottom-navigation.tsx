"use client";

import { Paper, SimpleGrid, Text, UnstyledButton } from "@mantine/core";

import type { DashboardRole } from "@/lib/auth";
import { getDashboardNavItems } from "@/features/admin-shell/config/admin-navigation";
import { Link, useLocation } from "@/lib/router-compat";
import { getDefaultDashboardPath } from "@/lib/session-routing";

export function AdminBottomNavigation({ role }: { role: DashboardRole }) {
  const location = useLocation();
  const mobileNavItems = getDashboardNavItems(role).slice(0, 5);
  const homePath = getDefaultDashboardPath(role);

  return (
    <Paper
      component="nav"
      aria-label="Navegação administrativa"
      hiddenFrom="lg"
      radius={0}
      px="xs"
      pt="xs"
      pb="calc(env(safe-area-inset-bottom,0px) + 0.4rem)"
      shadow="lg"
      style={{
        position: "fixed",
        insetInline: 0,
        bottom: 0,
        zIndex: 120,
        borderTop: "1px solid #d5dae2",
        background: "rgba(255,255,255,0.98)"
      }}
    >
      <SimpleGrid cols={5} spacing={6}>
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.to === homePath
              ? location.pathname === item.to
              : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

          return (
            <UnstyledButton
              key={item.to}
              component={Link}
              to={item.to}
              style={{
                minHeight: 68,
                borderRadius: 16,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                backgroundColor: isActive ? "#0e4666" : "transparent",
                color: isActive ? "#ffffff" : "#5f6876"
              }}
            >
              <Icon size={17} />
              <Text size="0.68rem" fw={700}>
                {item.mobileLabel}
              </Text>
            </UnstyledButton>
          );
        })}
      </SimpleGrid>
    </Paper>
  );
}
