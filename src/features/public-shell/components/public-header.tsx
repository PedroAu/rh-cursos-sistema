"use client";

import NextLink from "next/link";
import { Anchor, Box, Button, Container, Group, Text } from "@mantine/core";
import { Mail, MapPin, MessageCircle, Phone, UserRound } from "lucide-react";

import { publicNavItems } from "@/features/public-shell/config/public-navigation";
import { PublicMobileNavigation } from "@/features/public-shell/components/public-mobile-navigation";
import { company } from "@/lib/company";
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
    <Box component="header" className="sticky top-0 z-30">
      {/* Camada 1 — top bar de utilidades */}
      <Box
        visibleFrom="md"
        style={{ background: "var(--mantine-color-rhBlue-9)", color: "#ffffff" }}
      >
        <Container size={1200} px="md">
          <Group h={40} justify="space-between" wrap="nowrap">
            <Group gap="lg" wrap="nowrap">
              <Anchor
                href={`tel:+55${company.phones.primary.replace(/\D/g, "")}`}
                c="rgba(255,255,255,0.88)"
                fz="sm"
                td="none"
              >
                <Group gap={6} wrap="nowrap">
                  <Phone size={14} />
                  <Text fz="sm" inherit>
                    {company.phones.primary}
                  </Text>
                </Group>
              </Anchor>
              <Anchor href={company.links.email} c="rgba(255,255,255,0.88)" fz="sm" td="none">
                <Group gap={6} wrap="nowrap">
                  <Mail size={14} />
                  <Text fz="sm" inherit>
                    {company.email}
                  </Text>
                </Group>
              </Anchor>
              <Anchor
                href={company.links.maps}
                target="_blank"
                rel="noreferrer"
                c="rgba(255,255,255,0.88)"
                fz="sm"
                td="none"
                visibleFrom="lg"
              >
                <Group gap={6} wrap="nowrap">
                  <MapPin size={14} />
                  <Text fz="sm" inherit>
                    {company.address.district}, {company.address.cityState}
                  </Text>
                </Group>
              </Anchor>
            </Group>

            <Group gap="lg" wrap="nowrap">
              <Anchor
                href={company.links.whatsapp}
                target="_blank"
                rel="noreferrer"
                c="rhGold.4"
                fz="sm"
                fw={600}
                td="none"
              >
                <Group gap={6} wrap="nowrap">
                  <MessageCircle size={14} />
                  <Text fz="sm" fw={600} inherit>
                    WhatsApp {company.phones.whatsapp}
                  </Text>
                </Group>
              </Anchor>
              <Anchor
                component={NextLink}
                href="/login"
                aria-label="Área do Aluno"
                c="rgba(255,255,255,0.88)"
                fz="sm"
                fw={600}
                td="none"
              >
                <Group gap={6} wrap="nowrap">
                  <UserRound size={14} />
                  <Text fz="sm" fw={600} inherit>
                    Entrar
                  </Text>
                </Group>
              </Anchor>
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Camada 2 — barra principal com logo + navegação */}
      <Box
        className="border-b border-[var(--mantine-color-gray-3)]"
        style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)" }}
      >
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
                href="/cursos"
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
                Ver cursos
              </Button>

              <Box hiddenFrom="md">
                <PublicMobileNavigation />
              </Box>
            </Group>
          </Group>
        </Container>
      </Box>
    </Box>
  );
}
