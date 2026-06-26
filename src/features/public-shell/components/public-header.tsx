"use client";

import NextLink from "next/link";
import NextImage from "next/image";
import { Anchor, Box, Button, Container, Group, Text } from "@mantine/core";
import { useWindowScroll } from "@mantine/hooks";
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

/** Altura da top bar de utilidades, recolhida no scroll. */
const TOP_BAR_HEIGHT = 40;

export function PublicHeader() {
  const location = useLocation();
  const [scroll] = useWindowScroll();
  const isScrolled = scroll.y > 8;

  return (
    <Box component="header" className="sticky top-0 z-30">
      {/* Camada 1 — top bar de utilidades (recolhe no scroll) */}
      <Box
        visibleFrom="md"
        aria-hidden={isScrolled}
        style={{
          background: "var(--mantine-color-rhBlue-9)",
          color: "#ffffff",
          maxHeight: isScrolled ? 0 : TOP_BAR_HEIGHT,
          opacity: isScrolled ? 0 : 1,
          overflow: "hidden",
          transition: "max-height 0.3s ease, opacity 0.2s ease"
        }}
      >
        <Container size={1200} px="md">
          <Group h={TOP_BAR_HEIGHT} justify="space-between" wrap="nowrap">
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

      {/* Camada 2 — barra principal: logo + navegação */}
      <Box
        className="border-b border-[var(--mantine-color-gray-3)]"
        style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)" }}
      >
        <Container size={1200} px="md">
          <Group
            h={isScrolled ? 64 : 76}
            justify="space-between"
            wrap="nowrap"
            style={{ position: "relative", transition: "height 0.3s ease" }}
          >
            <Box
              component={NextLink}
              href="/"
              aria-label={company.logo.alt}
              style={{ display: "inline-flex", alignItems: "center", lineHeight: 0 }}
            >
              <NextImage
                src={company.logo.src}
                alt={company.logo.alt}
                width={453}
                height={285}
                priority
                style={{
                  height: isScrolled ? 40 : 52,
                  width: "auto",
                  transition: "height 0.3s ease"
                }}
              />
            </Box>

            <Group
              className="absolute left-1/2 -translate-x-1/2"
              gap={4}
              visibleFrom="md"
              wrap="nowrap"
              component="nav"
              aria-label="Navegação principal"
              style={{ position: "absolute" }}
            >
              {publicNavItems.map((item) => {
                const active = isItemActive(location.pathname, item.to);
                const barHeight = isScrolled ? 64 : 76;

                return (
                  <Button
                    key={item.to}
                    component={NextLink}
                    href={item.to}
                    variant="subtle"
                    color="gray"
                    radius={0}
                    px={14}
                    styles={{
                      root: {
                        height: barHeight,
                        color: active
                          ? "var(--mantine-color-rhBlue-9)"
                          : "var(--mantine-color-gray-7)",
                        background: "transparent",
                        borderBottom: active
                          ? "3px solid var(--mantine-color-rhGold-6)"
                          : "3px solid transparent",
                        borderRadius: 0,
                        transition: "height 0.3s ease"
                      },
                      label: {
                        fontSize: "var(--mantine-font-size-sm)",
                        fontWeight: 600,
                        letterSpacing: "0.01em"
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Group>

            <Box hiddenFrom="md">
              <PublicMobileNavigation />
            </Box>
          </Group>
        </Container>
      </Box>
    </Box>
  );
}
