"use client";

import {
  Badge,
  Box,
  Button,
  FileButton,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Switch,
  Table,
  Tabs,
  Text,
  TextInput,
  ThemeIcon,
  Title
} from "@mantine/core";
import { CheckCircle2, Globe, Mail, MessageCircle, Palette, Plus, Upload } from "lucide-react";
import type { ReactNode } from "react";
import { useId, useState } from "react";
import { toast } from "sonner";

import {
  type AdminSettings,
  loadAdminSettings,
  saveAdminSettings
} from "@/features/admin/settings/model/admin-settings";

const notificationCopy: Record<keyof AdminSettings["notifications"], { title: string; description: string }> = {
  newEnrollments: {
    title: "Novas inscrições",
    description: "Alertar o administrador quando um novo aluno se inscrever em um curso."
  },
  confirmedPayments: {
    title: "Pagamentos confirmados",
    description: "Receber confirmação imediata de vendas aprovadas."
  },
  monthlyReports: {
    title: "Relatórios mensais",
    description: "Enviar resumo estatístico mensal para o e-mail cadastrado."
  }
};

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>(() => loadAdminSettings());

  function updateIdentity<K extends keyof AdminSettings["identity"]>(key: K, value: AdminSettings["identity"][K]) {
    setSettings((current) => ({ ...current, identity: { ...current.identity, [key]: value } }));
  }

  function toggleNotification(key: keyof AdminSettings["notifications"], value: boolean) {
    setSettings((current) => ({ ...current, notifications: { ...current.notifications, [key]: value } }));
  }

  function handleSave() {
    saveAdminSettings(settings);
    toast.success("Configurações salvas localmente.");
  }

  return (
    <Stack gap="xl">
      <Box maw={760}>
        <Title order={1} c="#0b4668" fw={800}>
          Painel de Configurações
        </Title>
        <Text mt="sm" size="lg" lh={1.7} c="#4b5563">
          Gerencie a identidade, comunicações e acessos da plataforma RH Cursos.
        </Text>
      </Box>

      <Tabs defaultValue="gerais" color="rhBlue">
        <Tabs.List>
          <Tabs.Tab value="gerais">Configurações Gerais</Tabs.Tab>
          <Tabs.Tab value="notificacoes">Notificações</Tabs.Tab>
          <Tabs.Tab value="integracoes">Integrações</Tabs.Tab>
          <Tabs.Tab value="usuarios">Gerenciamento de Usuários</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="gerais" pt="xl">
          <Stack gap="xl">
            <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="lg" verticalSpacing="lg" style={{ alignItems: "start" }}>
              <Paper radius="xl" withBorder shadow="xs" p="xl">
                <Group mb="lg">
                  <ThemeIcon variant="light" color="rhBlue" radius="xl" size={42}>
                    <Globe size={20} />
                  </ThemeIcon>
                  <Title order={2} c="#111827">
                    Identidade do Site
                  </Title>
                </Group>
                <Stack gap="md">
                  <TextInput
                    label="Nome do Site"
                    value={settings.identity.siteName}
                    onChange={(event) => updateIdentity("siteName", event.currentTarget.value)}
                  />
                  <TextInput
                    label="Slogan Institucional"
                    value={settings.identity.tagline}
                    onChange={(event) => updateIdentity("tagline", event.currentTarget.value)}
                  />
                  <TextInput
                    label="E-mail de Contato Oficial"
                    type="email"
                    value={settings.identity.contactEmail}
                    onChange={(event) => updateIdentity("contactEmail", event.currentTarget.value)}
                  />
                </Stack>
              </Paper>

              <Paper radius="xl" shadow="sm" p="xl" style={{ background: "#0b4668", color: "#ffffff" }}>
                <Title order={2} c="#ffd573">
                  Resumo das Alterações
                </Title>
                <Text mt="lg" size="lg" lh={1.7} c="rgba(255,255,255,0.84)">
                  Suas alterações de identidade afetam como os alunos visualizam a marca nos certificados e e-mails automáticos.
                </Text>
                <Button color="rhGold" c="#6a4b00" radius="md" fullWidth mt="xl" onClick={handleSave}>
                  Salvar Alterações
                </Button>
              </Paper>
            </SimpleGrid>

            <Paper radius="xl" withBorder shadow="xs" p="xl">
              <Group mb="lg">
                <ThemeIcon variant="light" color="rhBlue" radius="xl" size={42}>
                  <Palette size={20} />
                </ThemeIcon>
                <Title order={2} c="#111827">
                  Logotipo e Favicon
                </Title>
              </Group>
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                <LogoUpload
                  label="Logo Principal"
                  value={settings.identity.logo}
                  fallback="RH"
                  onChange={(value) => updateIdentity("logo", value)}
                />
                <LogoUpload
                  label="Favicon"
                  value={settings.identity.favicon}
                  fallback="RH"
                  onChange={(value) => updateIdentity("favicon", value)}
                />
              </SimpleGrid>
            </Paper>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="notificacoes" pt="xl">
          <Stack gap="lg">
            <Paper radius="xl" withBorder shadow="xs" p="xl">
              <Title order={2} c="#111827">
                Preferências de Notificação
              </Title>
              <Text mt={6} c="#667085">
                Escolha quais eventos disparam alertas para o administrador.
              </Text>

              <Stack gap={0} mt="lg">
                {(Object.keys(notificationCopy) as Array<keyof AdminSettings["notifications"]>).map((key) => (
                  <NotificationRow
                    key={key}
                    title={notificationCopy[key].title}
                    description={notificationCopy[key].description}
                    checked={settings.notifications[key]}
                    onCheckedChange={(value) => toggleNotification(key, value)}
                  />
                ))}
              </Stack>
            </Paper>

            <Group justify="flex-end">
              <Button color="rhBlue" radius="md" onClick={handleSave}>
                Salvar Alterações
              </Button>
            </Group>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="integracoes" pt="xl">
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
            <IntegrationCard
              icon={MessageCircle}
              title="WhatsApp Business"
              description="API de atendimento e envio automático."
              body="Conecte sua conta do WhatsApp para enviar notificações de cursos e suporte em tempo real para seus alunos."
              footer={
                <>
                  <Group gap="xs">
                    <CheckCircle2 size={16} color="#2f8b4f" />
                    <Text size="sm" fw={500} c="#2f8b4f">
                      Conectado · último envio hoje, 10:45
                    </Text>
                  </Group>
                  <Button variant="light" color="rhBlue">
                    Gerenciar webhooks
                  </Button>
                </>
              }
            />

            <IntegrationCard
              icon={Mail}
              title="E-mail Marketing"
              description="RD Station · Mailchimp · ActiveCampaign"
              body="Sincronize sua base de alunos com sua plataforma de marketing favorita para campanhas de remarketing."
              footer={
                <Stack gap="sm">
                  {["RD Station CRM", "Mailchimp"].map((provider) => (
                    <Paper key={provider} withBorder radius="lg" p="md" bg="#f8fafc">
                      <Group justify="space-between">
                        <Text fw={500} c="#111827">
                          {provider}
                        </Text>
                        <Button variant="default" radius="md">
                          Conectar
                        </Button>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              }
            />
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="usuarios" pt="xl">
          <Paper radius="xl" withBorder shadow="xs" p="xl">
            <Group justify="space-between" align="center" mb="lg">
              <Box>
                <Title order={2} c="#111827">
                  Administradores do Sistema
                </Title>
                <Text mt={6} c="#667085">
                  Acessos com permissão de gestão da plataforma.
                </Text>
              </Box>
              <Button color="rhGold" c="white" radius="xl" leftSection={<Plus size={16} />}>
                Novo Admin
              </Button>
            </Group>

            <Table.ScrollContainer minWidth={640}>
              <Table verticalSpacing="md" horizontalSpacing="xl">
                <Table.Thead bg="#f7f8fb">
                  <Table.Tr>
                    <Table.Th>Administrador</Table.Th>
                    <Table.Th>Permissão</Table.Th>
                    <Table.Th>Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {settings.admins.map((admin) => (
                    <Table.Tr key={admin.email}>
                      <Table.Td>
                        <Stack gap={2}>
                          <Text fw={700} c="#111827">
                            {admin.name}
                          </Text>
                          <Text size="sm" c="#667085">
                            {admin.email}
                          </Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Text c="#111827">{admin.role}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={admin.active ? "green" : "red"} variant="light" radius="xl">
                          {admin.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

function IntegrationCard({
  icon: Icon,
  title,
  description,
  body,
  footer
}: {
  icon: typeof Globe;
  title: string;
  description: string;
  body: string;
  footer: ReactNode;
}) {
  return (
    <Paper radius="xl" withBorder shadow="xs" p="xl">
      <Group align="flex-start">
        <ThemeIcon variant="light" color="rhBlue" radius="xl" size={42}>
          <Icon size={20} />
        </ThemeIcon>
        <Box>
          <Title order={2} c="#111827">
            {title}
          </Title>
          <Text size="sm" c="#667085">
            {description}
          </Text>
        </Box>
      </Group>
      <Text mt="md" lh={1.7} c="#4b5563">
        {body}
      </Text>
      <Stack mt="lg" gap="md">
        {footer}
      </Stack>
    </Paper>
  );
}

function NotificationRow({
  title,
  description,
  checked,
  onCheckedChange
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const labelId = useId();
  const descId = useId();

  return (
    <Group justify="space-between" align="flex-start" py="md" style={{ borderTop: "1px solid #e8ecf2" }}>
      <Box maw={620}>
        <Text id={labelId} fw={600} c="#111827">
          {title}
        </Text>
        <Text id={descId} size="sm" lh={1.7} c="#667085" mt={4}>
          {description}
        </Text>
      </Box>
      <Switch checked={checked} onChange={(event) => onCheckedChange(event.currentTarget.checked)} aria-labelledby={labelId} aria-describedby={descId} />
    </Group>
  );
}

function LogoUpload({
  label,
  value,
  fallback,
  onChange
}: {
  label: string;
  value: string | null;
  fallback: string;
  onChange: (value: string | null) => void;
}) {
  return (
    <Paper withBorder radius="xl" p="lg" style={{ borderStyle: "dashed" }}>
      <Stack align="center" gap="md">
        <Box
          role="img"
          aria-label={`Pré-visualização de ${label}`}
          style={{
            width: 72,
            height: 72,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            backgroundColor: value ? "#ffffff" : "#0b4668",
            backgroundImage: value ? `url(${value})` : undefined,
            backgroundPosition: "center",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            color: "#ffffff",
            fontSize: "1.6rem",
            fontWeight: 800
          }}
        >
          {value ? null : fallback}
        </Box>

        <Stack gap={4} align="center">
          <Text fw={700} c="#0b4668">
            {label}
          </Text>
          <FileButton
            accept="image/*"
            onChange={(file) => {
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === "string") onChange(reader.result);
              };
              reader.readAsDataURL(file);
            }}
          >
            {(props) => (
              <Button {...props} variant="subtle" color="rhBlue" leftSection={<Upload size={16} />}>
                Alterar {label}
              </Button>
            )}
          </FileButton>
        </Stack>
      </Stack>
    </Paper>
  );
}
