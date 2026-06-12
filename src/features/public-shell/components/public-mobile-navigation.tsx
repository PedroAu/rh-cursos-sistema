"use client";

import NextLink from "next/link";
import { Burger, Button, Divider, Drawer, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MessageCircle } from "lucide-react";

import { publicNavItems } from "@/features/public-shell/config/public-navigation";

export function PublicMobileNavigation() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Burger opened={opened} onClick={open} aria-label="Abrir menu" color="var(--mantine-color-rhBlue-9)" />

      <Drawer
        opened={opened}
        onClose={close}
        keepMounted={false}
        position="right"
        title={
          <Stack gap={2}>
            <Text fw={800} fz="1.4rem" c="rhBlue.9" style={{ letterSpacing: "-0.04em" }}>
              RH Cursos
            </Text>
            <Text c="dimmed" fz="sm">
              Navegue pelas áreas principais da plataforma.
            </Text>
          </Stack>
        }
        styles={{
          content: { background: "#f8fafc" },
          header: { background: "#f8fafc" }
        }}
      >
        <Stack gap="sm">
          {publicNavItems.map((item) => (
            <Button
              key={item.to}
              component={NextLink}
              href={item.to}
              justify="space-between"
              variant="default"
              color="gray"
              onClick={close}
              styles={{
                root: {
                  height: 52,
                  borderColor: "var(--mantine-color-gray-3)",
                  background: "#ffffff"
                },
                label: {
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "var(--mantine-color-rhBlue-9)"
                }
              }}
            >
              {item.label}
            </Button>
          ))}

          <Divider my="xs" />

          <Button component={NextLink} href="/cursos" color="rhGold" c="#0a2038" onClick={close}>
            Ver cursos
          </Button>

          <Button component={NextLink} href="/login" aria-label="Área do Aluno" color="rhBlue" onClick={close}>
            Área do Aluno
          </Button>

          <Button
            component="a"
            href="#atendimento"
            variant="light"
            color="rhBlue"
            onClick={close}
            leftSection={<MessageCircle className="h-4 w-4" />}
          >
            Falar com atendimento
          </Button>
        </Stack>
      </Drawer>
    </>
  );
}
