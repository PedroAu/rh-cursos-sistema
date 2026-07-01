"use client";

import { Mail, MapPin, MessageCircle, PhoneCall, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title
} from "@mantine/core";

import { useAppStore } from "@/lib/app-store";
import { company } from "@/lib/company";

const contactItems = [
  {
    icon: PhoneCall,
    title: "TELEFONES",
    headline: company.phones.primary,
    detail: `${company.phones.whatsapp} (WhatsApp)`
  },
  {
    icon: MapPin,
    title: "LOCALIZAÇÃO",
    headline: `${company.address.district}, ${company.address.cityState}`,
    detail: "Atendimento de Segunda a Sexta, das 08h às 18h."
  }
];

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function getPhoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function ContactPage() {
  const { createLead } = useAppStore();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    courseInterest: "",
    message: ""
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const update = (key: keyof typeof form, value: string) => {
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError(null);
    setSubmitSuccess(null);
    if (key === "phone") {
      setForm((current) => ({ ...current, [key]: formatPhone(value) }));
    } else {
      setForm((current) => ({ ...current, [key]: value }));
    }
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof typeof form, string>> = {};

    if (!form.name.trim() || form.name.trim().length < 3) {
      nextErrors.name = "Nome deve ter no mínimo 3 caracteres.";
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Informe um e-mail válido.";
    }
    if (form.phone && getPhoneDigits(form.phone).length < 10) {
      nextErrors.phone = "Informe um telefone válido com pelo menos 10 dígitos.";
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      nextErrors.message = "Mensagem deve ter no mínimo 10 caracteres.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await createLead({
        name: form.name,
        email: form.email,
        phone: form.phone,
        type: "Contato",
        courseInterest: form.courseInterest.trim() || "Contato pelo site",
        organization: form.organization.trim() || undefined,
        origin: "Contato",
        message: form.message
      });

      const successMessage = "Mensagem registrada. Nossa equipe retorna com orientação inicial e próximos passos.";
      toast.success("Mensagem registrada para atendimento.");
      setForm({ name: "", email: "", phone: "", organization: "", courseInterest: "", message: "" });
      setErrors({});
      setSubmitError(null);
      setSubmitSuccess(successMessage);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível enviar sua mensagem.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box bg="#f6f7fb">
      <Box component="section" bg="white" style={{ borderBottom: "1px solid #d7dee5" }}>
        <Container size={1200} px="md" py={{ base: 48, md: 56 }}>
          <Stack gap="md" maw={840}>
            <Title order={1} c="rhBlue.9">
              Entre em Contato
            </Title>
            <Text fz="1.12rem" c="#414b56" maw={780}>
              Estamos prontos para atender suas dúvidas sobre treinamentos corporativos e gestão pública. Fale conosco através do formulário ou nossos canais diretos.
            </Text>
          </Stack>
        </Container>
      </Box>

      <Container size={1200} px="md" py="xl">
        <Grid gap={32}>
          <Grid.Col span={{ base: 12, xl: 5 }}>
            <Stack gap="lg">
              {contactItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Card key={item.title} radius="lg" shadow="sm" withBorder padding="xl">
                    <Group align="flex-start" gap="lg" wrap="nowrap">
                      <ThemeIcon size={48} radius="lg" variant="light" color="rhBlue">
                        <Icon size={20} />
                      </ThemeIcon>
                      <Box>
                        <Text fz="sm" fw={700} c="rhBlue.7" tt="uppercase">
                          {item.title}
                        </Text>
                        <Text mt={8} fz="1.1rem" fw={700} c="#23292f">
                          {item.headline}
                        </Text>
                        <Text mt={4} c="#55606a">
                          {item.detail}
                        </Text>
                      </Box>
                    </Group>
                  </Card>
                );
              })}

              <Box
                h={280}
                style={{
                  overflow: "hidden",
                  borderRadius: "var(--mantine-radius-lg)",
                  border: "1px solid #cfd7df",
                  backgroundImage:
                    "linear-gradient(rgba(60,63,69,0.48), rgba(60,63,69,0.48)), url('/images/home-hero-reference.jpg')",
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  filter: "grayscale(1)"
                }}
                role="img"
                aria-label="Mapa da região de Brasília"
              />

              <Group gap="sm">
                <Button
                  component="a"
                  href={company.links.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  color="rhBlue.9"
                  leftSection={<MessageCircle size={16} />}
                >
                  WhatsApp
                </Button>
                <Button
                  component="a"
                  href={company.links.email}
                  variant="default"
                  c="rhBlue.7"
                  leftSection={<Mail size={16} />}
                >
                  E-mail
                </Button>
              </Group>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, xl: 7 }}>
            <Card radius="lg" shadow="sm" withBorder padding="xl" data-testid="ui-contact-form">
              <Group align="center" gap="lg" mb="xl">
                <Box w={4} h={48} bg="rhGold" aria-hidden />
                <Title order={2} c="rhBlue.9">
                  Envie uma mensagem
                </Title>
              </Group>

              {submitError ? (
                <Alert role="alert" color="red" mb="lg">
                  {submitError}
                </Alert>
              ) : null}

              {submitSuccess ? (
                <Alert color="green" mb="lg" aria-live="polite">
                  {submitSuccess}
                </Alert>
              ) : null}

              <Stack gap="md">
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  <TextInput
                    label="Nome completo"
                    withAsterisk
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                    error={errors.name}
                    placeholder="Seu nome"
                    autoComplete="name"
                  />
                  <TextInput
                    label="E-mail"
                    withAsterisk
                    type="email"
                    value={form.email}
                    onChange={(event) => update("email", event.target.value)}
                    error={errors.email}
                    placeholder="email@empresa.com.br"
                    autoComplete="email"
                  />
                </SimpleGrid>

                <TextInput
                  label="Telefone / WhatsApp"
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  error={errors.phone}
                  placeholder="(00) 00000-0000"
                  autoComplete="tel"
                />

                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  <TextInput
                    label="Empresa / órgão"
                    value={form.organization}
                    onChange={(event) => update("organization", event.target.value)}
                    placeholder="Prefeitura ou empresa"
                    autoComplete="organization"
                  />
                  <TextInput
                    label="Curso ou tema de interesse"
                    value={form.courseInterest}
                    onChange={(event) => update("courseInterest", event.target.value)}
                    placeholder="Ex.: eSocial"
                  />
                </SimpleGrid>

                <Textarea
                  label="Mensagem"
                  withAsterisk
                  value={form.message}
                  onChange={(event) => update("message", event.target.value)}
                  error={errors.message}
                  placeholder="Como podemos ajudar sua organização?"
                  minRows={6}
                  autosize
                />

                <Button
                  onClick={() => void submit()}
                  loading={isSubmitting}
                  color="rhGold"
                  c="#3d2c00"
                  size="lg"
                  fw={700}
                  rightSection={<Send size={18} />}
                  w="fit-content"
                  mt="sm"
                >
                  {isSubmitting ? "Enviando..." : "Enviar mensagem"}
                </Button>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
}
