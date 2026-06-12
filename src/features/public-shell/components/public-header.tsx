"use client";

import NextLink from "next/link";
import { Box, Button, Container, Group, Text } from "@mantine/core";

import { publicNavItems } from "@/features/public-shell/config/public-navigation";
import { PublicMobileNavigation } from "@/features/public-shell/components/public-mobile-navigation";
import { useLocation } from "@/lib/router-compat";

function isItemActive(pathname: string, to: string) {
  if (pathname === "/") {
    return to === "/cursos";
  }

  return pathname === to || pathname.startsWith(`${to}/`);
}

export function PublicHeader() {
  const location = useLocation();

  return (
    <Box component="header" className="sticky top-0 z-30 border-b border-[var(--mantine-color-gray-3)] bg-white/95 backdrop-blur-md">
      <Container size={1200} px="md">
        <Group h={72} justify="space-between" wrap="nowrap">
          <Group gap={40} wrap="nowrap">
            <Text
              component={NextLink}
              href="/"
              fw={800}
              fz="2rem"
              c="rhBlue.9"
              td="none"
              lh={1}
              style={{ letterSpacing: "-0.04em", whiteSpace: "nowrap" }}
            >
              RH Cursos
            </Text>

            <Group gap={8} visibleFrom="md" component="nav" aria-label="Navegação principal">
            {publicNavItems.map((item) => (
              <Button
                key={item.to}
                component={NextLink}
                href={item.to}
                variant="subtle"
                color={isItemActive(location.pathname, item.to) ? "rhBlue" : "gray"}
                radius={0}
                px={8}
                styles={{
                  root: {
                    height: 72,
                    borderBottom: isItemActive(location.pathname, item.to)
                      ? "3px solid var(--mantine-color-rhGold-6)"
                      : "3px solid transparent",
                    borderRadius: 0
                  },
                  label: {
                    fontSize: "0.95rem",
                    fontWeight: 600
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
            </Group>
          </Group>

          <Group gap="sm" wrap="nowrap">
            <Button
              component={NextLink}
              href="/login"
              aria-label="Área do Aluno"
              visibleFrom="md"
              color="rhBlue"
              size="md"
              radius="sm"
              styles={{
                root: {
                  minWidth: 160,
                  background: "var(--mantine-color-rhBlue-9)"
                },
                label: {
                  fontSize: "0.95rem",
                  fontWeight: 700
                }
              }}
            >
              <span className="rh-nav-visual-label" data-label={`Área do Al\u200buno`} />
            </Button>

            <Box hiddenFrom="md">
              <PublicMobileNavigation />
            </Box>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
