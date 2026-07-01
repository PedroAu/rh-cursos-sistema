"use client";

import { CheckSquare, PiggyBank, Send, ShieldCheck, Users } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  Grid,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title
} from "@mantine/core";

import { useQuoteModal } from "@/components/in-company/quote-modal";
import { useAppStore } from "@/lib/app-store";

const benefits = [
  {
    icon: CheckSquare,
    title: "Conteúdo 100% Customizado",
    description:
      "Nossos especialistas adaptam a ementa, os estudos de caso e a linguagem técnica para a realidade da sua empresa ou órgão público."
  },
  {
    icon: ShieldCheck,
    title: "Flexibilidade Total",
    description:
      "Escolha as datas, horários e formato presencial ou online ao vivo que melhor se adaptam à jornada de trabalho da sua equipe.",
    dark: true
  },
  {
    icon: PiggyBank,
    title: "Redução de Custos",
    description:
      "Economize com deslocamentos e hospedagens. O treinamento coletivo reduz o investimento por colaborador significativamente."
  }
];

const heroHighlights = [
  {
    icon: ShieldCheck,
    title: "Diagnóstico Personalizado",
    description: "Analisamos as dores específicas do seu departamento antes de propor qualquer solução."
  },
  {
    icon: Users,
    title: "Expertise em Setor Público",
    description: "Especialistas com anos de experiência em licitações e RH governamental."
  }
];

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatTeamSize(value: string) {
  return value.replace(/\D/g, "").slice(0, 5);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getPhoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function InCompanyPage() {
  const { createLead } = useAppStore();
  const { openQuote } = useQuoteModal();
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    groupSize: "",
    modality: "",
    trainingObjective: "",
    trainingTheme: "",
    mainChallenges: "",
    consent: false
  });
  const [errors, setErrors] = useState<Partial<Record<Exclude<keyof typeof form, "consent">, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const update = (key: keyof typeof form, value: string | boolean) => {
    if (key !== "consent") {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
    setSubmitError(null);
    setSubmitSuccess(null);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<Exclude<keyof typeof form, "consent">, string>> = {};

    if (!form.name.trim()) nextErrors.name = "Preencha o nome completo.";
    if (!isValidEmail(form.email)) nextErrors.email = "Informe um e-mail corporativo válido.";
    if (!form.company.trim()) nextErrors.company = "Preencha o nome da empresa.";
    if (getPhoneDigits(form.phone).length < 10) nextErrors.phone = "Informe um telefone ou WhatsApp válido.";
    if (!form.groupSize || Number(form.groupSize) <= 0) nextErrors.groupSize = "Informe o tamanho da equipe.";
    if (!form.modality) nextErrors.modality = "Selecione a modalidade.";
    if (!form.trainingObjective.trim()) nextErrors.trainingObjective = "Informe o objetivo do treinamento.";
    if (!form.trainingTheme.trim()) nextErrors.trainingTheme = "Informe o tema a ser abordado.";
    if (!form.mainChallenges.trim()) nextErrors.mainChallenges = "Informe os desafios principais.";

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
        type: "InCompany",
        courseInterest: "Treinamento In-Company",
        organization: form.company,
        teamSize: Number(form.groupSize),
        preferredModality: form.modality,
        trainingObjective: form.trainingObjective,
        trainingTheme: form.trainingTheme,
        mainChallenges: form.mainChallenges,
        origin: "Site",
        message: `Empresa: ${form.company}. Telefone/WhatsApp: ${form.phone}. Tamanho da equipe: ${form.groupSize} pessoa(s). Modalidade: ${form.modality}. Objetivo: ${form.trainingObjective}. Tema: ${form.trainingTheme}. Desafios principais: ${form.mainChallenges}`
      });

      setForm({
        name: "",
        email: "",
        company: "",
        phone: "",
        groupSize: "",
        modality: "",
        trainingObjective: "",
        trainingTheme: "",
        mainChallenges: "",
        consent: false
      });
      setErrors({});
      toast.success("Proposta registrada para atendimento consultivo.");
      setSubmitSuccess("Solicitação registrada. A equipe retorna com recomendação de formato, trilha e próximos passos.");
      setSubmitError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível enviar a proposta.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box bg="#f6f7fb">
      <Box component="section" style={{ overflow: "hidden", borderBottom: "1px solid #d7dee5" }} bg="white">
        <Grid gap={0} maw={1440} mx="auto">
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Box px={{ base: 24, lg: 56 }} py={{ base: 56, lg: 80 }} style={{ background: "#0a4568", color: "#ffffff", height: "100%" }}>
              <Stack gap="lg">
                <Box
                  w="fit-content"
                  px="md"
                  py={8}
                  style={{ background: "#f3cf74", borderRadius: 999, color: "#4f3500", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}
                >
                  Consultoria Exclusiva
                </Box>
                <Title order={1} c="white" maw={520}>
                  Fale com um especialista em gestão.
                </Title>
                <Text fz="1.08rem" c="rgba(255,255,255,0.8)" maw={560}>
                  Entenda como nossas soluções de treinamento e consultoria podem transformar a eficiência da sua equipe e otimizar seus processos públicos.
                </Text>

                <Group gap="md">
                  <Button onClick={() => openQuote()} color="rhGold" c="#08324d" fw={700}>
                    Solicitar orçamento
                  </Button>
                  <Button
                    component="a"
                    href="#formulario-in-company"
                    variant="outline"
                    color="gray.0"
                    styles={{ root: { borderColor: "rgba(255,255,255,0.55)" }, label: { color: "#ffffff" } }}
                  >
                    Saiba mais
                  </Button>
                </Group>

                <Stack gap="xl" mt="md">
                  {heroHighlights.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Group key={item.title} align="flex-start" gap="md" wrap="nowrap">
                        <ThemeIcon size={48} radius="md" variant="light" color="rhBlue">
                          <Icon size={20} />
                        </ThemeIcon>
                        <Box>
                          <Title order={3} fz="1.25rem" c="white">
                            {item.title}
                          </Title>
                          <Text mt={8} c="rgba(255,255,255,0.75)" maw={520}>
                            {item.description}
                          </Text>
                        </Box>
                      </Group>
                    );
                  })}
                </Stack>

                <Card radius="lg" padding="lg" maw={520} mt="md" c="#222a31">
                  <Group align="center" gap="md">
                    <Image
                      src="/images/courses/pessoas-lideranca.jpg"
                      alt="Mariana Silva"
                      width={60}
                      height={60}
                      style={{ height: 60, width: 60, borderRadius: 12, objectFit: "cover" }}
                    />
                    <Box>
                      <Text fz="1.5rem" fw={700} c="rhBlue.9">
                        Mariana Silva
                      </Text>
                      <Text fz="sm" c="#4f5963">
                        Coordenadora de Consultoria
                      </Text>
                    </Box>
                  </Group>
                  <Text mt="lg" fz="1.05rem" fs="italic" c="#4a535d">
                    &ldquo;Nossa meta é simplificar a burocracia através da educação continuada de alta performance.&rdquo;
                  </Text>
                </Card>
              </Stack>
            </Box>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Box bg="white" px={{ base: 16, lg: 40 }} py={{ base: 40, lg: 64 }}>
              <Card id="formulario-in-company" radius="lg" shadow="md" withBorder padding="xl" data-testid="ui-incompany-form">
                {submitError ? (
                  <Alert role="alert" color="red" mb="md">
                    {submitError}
                  </Alert>
                ) : null}

                {submitSuccess ? (
                  <Alert color="green" mb="md" aria-live="polite">
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
                      placeholder="Ex: João da Silva"
                      autoComplete="name"
                    />
                    <TextInput
                      label="E-mail corporativo"
                      withAsterisk
                      type="email"
                      value={form.email}
                      onChange={(event) => update("email", event.target.value)}
                      error={errors.email}
                      placeholder="nome@empresa.com.br"
                      autoComplete="email"
                    />
                  </SimpleGrid>

                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    <TextInput
                      label="Telefone ou WhatsApp"
                      withAsterisk
                      value={form.phone}
                      onChange={(event) => update("phone", formatPhone(event.target.value))}
                      error={errors.phone}
                      placeholder="(00) 00000-0000"
                      autoComplete="tel"
                    />
                    <TextInput
                      label="Nome da empresa"
                      withAsterisk
                      value={form.company}
                      onChange={(event) => update("company", event.target.value)}
                      error={errors.company}
                      placeholder="Prefeitura ou empresa"
                      autoComplete="organization"
                    />
                  </SimpleGrid>

                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    <TextInput
                      label="Tamanho da equipe"
                      withAsterisk
                      value={form.groupSize}
                      onChange={(event) => update("groupSize", formatTeamSize(event.target.value))}
                      error={errors.groupSize}
                      placeholder="Ex.: 35"
                      inputMode="numeric"
                    />
                    <Select
                      label="Área de Interesse"
                      withAsterisk
                      aria-label="Área de Interesse"
                      placeholder="Selecione uma área"
                      value={form.modality || null}
                      onChange={(value) => update("modality", value ?? "")}
                      error={errors.modality}
                      data={["Online ao vivo", "Presencial", "Híbrido", "In company"]}
                    />
                  </SimpleGrid>

                  <TextInput
                    label="Objetivo do treinamento"
                    withAsterisk
                    value={form.trainingObjective}
                    onChange={(event) => update("trainingObjective", event.target.value)}
                    error={errors.trainingObjective}
                    placeholder="Como podemos ajudar?"
                  />

                  <TextInput
                    label="Tema a ser abordado"
                    withAsterisk
                    value={form.trainingTheme}
                    onChange={(event) => update("trainingTheme", event.target.value)}
                    error={errors.trainingTheme}
                    placeholder="Ex.: Licitações e Contratos"
                  />

                  <Textarea
                    label="Desafios principais"
                    withAsterisk
                    value={form.mainChallenges}
                    onChange={(event) => update("mainChallenges", event.target.value)}
                    error={errors.mainChallenges}
                    placeholder="Descreva brevemente o seu desafio ou necessidade..."
                    minRows={6}
                    autosize
                  />

                  <Checkbox
                    checked={form.consent}
                    onChange={(event) => update("consent", event.currentTarget.checked)}
                    label="Concordo em receber comunicações e aceito a Política de Privacidade da RH Cursos."
                  />

                  <Button
                    onClick={() => void submit()}
                    loading={isSubmitting}
                    fullWidth
                    color="rhGold"
                    c="white"
                    size="lg"
                    fw={700}
                    tt="uppercase"
                    rightSection={<Send size={18} />}
                    styles={{ root: { background: "#8f6800" } }}
                  >
                    {isSubmitting ? "Enviando..." : "Enviar solicitação de proposta"}
                  </Button>
                  <Text ta="center" fz="sm" c="#5c6672">
                    Responderemos em até 24 horas úteis.
                  </Text>
                </Stack>
              </Card>
            </Box>
          </Grid.Col>
        </Grid>
      </Box>

      <Container size={1200} px="md" pb="xl" mt="xl">
        <Grid gap="lg">
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              <Card radius="lg" shadow="sm" withBorder padding="xl" style={{ gridColumn: "1 / -1" }}>
                <Group gap="lg" align="center" wrap="nowrap">
                  <Image
                    src="/images/courses/tecnologia-inovacao.jpg"
                    alt="Logística simplificada"
                    width={320}
                    height={220}
                    style={{ height: 160, width: 208, borderRadius: 8, objectFit: "cover" }}
                  />
                  <Box>
                    <Title order={3} c="rhGold.8">
                      Logística Simplificada
                    </Title>
                    <Text mt="sm" c="#56606a">
                      Nós cuidamos de toda a infraestrutura educacional, material didático e certificados. Sua única preocupação é reunir o time.
                    </Text>
                  </Box>
                </Group>
              </Card>

              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <Card
                    key={benefit.title}
                    radius="lg"
                    shadow="sm"
                    withBorder
                    padding="xl"
                    style={benefit.dark ? { background: "#0b4668", borderColor: "#0b4668", color: "#ffffff" } : undefined}
                  >
                    <Icon size={32} color={benefit.dark ? "#f6be39" : "#004364"} />
                    <Title order={3} mt="lg" c={benefit.dark ? "white" : "rhBlue.9"}>
                      {benefit.title}
                    </Title>
                    <Text mt="md" c={benefit.dark ? "rgba(255,255,255,0.75)" : "#56606a"}>
                      {benefit.description}
                    </Text>
                  </Card>
                );
              })}
            </SimpleGrid>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Card radius="lg" padding="xl" style={{ background: "#f3cf74" }} c="#4f3500" h="100%">
              <Stack gap="md">
                <Title order={2} c="#4f3500">
                  Precisa de algo ainda mais específico?
                </Title>
                <Text fz="lg">Fale diretamente com nosso consultor técnico pelo WhatsApp.</Text>
                <Button
                  component="a"
                  href="https://wa.me/5561991129682"
                  target="_blank"
                  rel="noreferrer"
                  color="rhBlue.9"
                  w="fit-content"
                >
                  Falar com Consultor
                </Button>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
}
