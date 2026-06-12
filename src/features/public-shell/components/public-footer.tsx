import NextLink from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { ActionIcon, Box, Container, Grid, Group, Stack, Text } from "@mantine/core";

import { publicNavItems } from "@/features/public-shell/config/public-navigation";
import { company } from "@/lib/company";

const quickLinks = [
  { label: "Administração", to: "/login" },
  { label: "Catálogo de cursos", to: "/cursos" },
  { label: "Agenda de turmas", to: "/agenda" }
];

export function PublicFooter() {
  return (
    <Box component="footer" bg="#0a4b72" c="white" py={56}>
      <Container size={1200} px="md">
        <Grid gap="xl">
          <Grid.Col span={{ base: 12, md: 3.5 }}>
            <Stack gap="md">
              <Text fw={800} fz="2rem" lh={1} style={{ letterSpacing: "-0.04em" }}>
                RH Cursos
              </Text>
              <Text c="rgba(255,255,255,0.78)" maw={280}>
                Desenvolvemos cursos, consultoria e treinamento empresarial com foco em resultados práticos.
              </Text>
              <Group gap="sm">
                <ActionIcon
                  component="a"
                  href={company.links.email}
                  aria-label="Contato institucional por correio eletrônico"
                  variant="subtle"
                  color="white"
                  radius="xl"
                >
                  <Mail className="h-4 w-4" />
                </ActionIcon>
                <ActionIcon
                  component="a"
                  href={company.links.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Contato institucional por WhatsApp"
                  variant="subtle"
                  color="white"
                  radius="xl"
                >
                  <MessageCircle className="h-4 w-4" />
                </ActionIcon>
                <ActionIcon
                  component="a"
                  href="tel:+556139651929"
                  aria-label="Contato institucional por telefone"
                  variant="subtle"
                  color="white"
                  radius="xl"
                >
                  <Phone className="h-4 w-4" />
                </ActionIcon>
              </Group>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 6, md: 2.5 }}>
            <Stack gap="sm">
              <Text fw={700} fz="sm" c="#f5c13a">
                Navegação
              </Text>
              <Stack gap={8} component="nav" aria-label="Navegação do rodapé">
                {publicNavItems.map((item) => (
                  <Text key={item.to} component={NextLink} href={item.to} td="none" c="rgba(255,255,255,0.86)">
                    {item.label}
                  </Text>
                ))}
              </Stack>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 6, md: 3 }}>
            <Stack gap="sm">
              <Text fw={700} fz="sm" c="#f5c13a">
                Atendimento
              </Text>
              <Text c="rgba(255,255,255,0.86)">{company.phones.primary}</Text>
              <Text c="rgba(255,255,255,0.86)">{company.phones.secondary}</Text>
              <Text c="rgba(255,255,255,0.7)">
                {company.address.district}, {company.address.cityState}
              </Text>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 3 }}>
            <Stack gap="sm">
              <Text fw={700} fz="sm" c="#f5c13a">
                Acesso rápido
              </Text>
              <Stack gap={8} component="nav" aria-label="Acesso rápido do rodapé">
                {quickLinks.map((item) => (
                  <Text key={item.to} component={NextLink} href={item.to} td="none" c="rgba(255,255,255,0.86)">
                    {item.label}
                  </Text>
                ))}
              </Stack>
            </Stack>
          </Grid.Col>
        </Grid>

        <Group justify="space-between" mt={48} pt={18} style={{ borderTop: "1px solid rgba(255,255,255,0.16)" }}>
          <Text c="rgba(255,255,255,0.68)" fz="sm">
            {company.legalName} • CNPJ {company.cnpj}
          </Text>
          <Text c="rgba(255,255,255,0.72)" fz="sm">
            Plataforma institucional para cursos, turmas e atendimento.
          </Text>
        </Group>
      </Container>
    </Box>
  );
}
