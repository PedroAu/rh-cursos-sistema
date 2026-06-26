"use client";

import {
  AlertTriangle,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Cpu,
  MessageSquareText,
  Scale,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title
} from "@mantine/core";

import { useAppStore } from "@/lib/app-store";
import { Link } from "@/lib/router-compat";

const heroTrustMetrics = [
  { icon: BriefcaseBusiness, value: "2.500+", label: "Alunos", helper: "DE ENTREGA" },
  { icon: ClipboardList, value: "180+", label: "Cursos", helper: "ATIVAS" },
  { icon: ShieldCheck, value: "98%", label: "Satisfação", helper: "AVALIAÇÃO MÉDIA" }
];

const problemCards = [
  {
    icon: AlertTriangle,
    title: "Risco de auditoria",
    description: "Erros técnicos detectados em fiscalizações geram multas, retrabalho e exposição para toda a equipe."
  },
  {
    icon: BookOpen,
    title: "Cursos teóricos demais",
    description: "Muito conteúdo promete capacitação, mas pouco prepara você para aplicar no dia seguinte."
  },
  {
    icon: Sparkles,
    title: "Legislação em mudança",
    description: "eSocial, NR-1, licitações e outras normas não esperam. Quem não se atualiza fica para trás."
  }
];

const processSteps = [
  {
    number: "1",
    title: "Escolha sua trilha",
    description: "Identifique o desafio técnico do cargo ou da equipe e encontre a trilha ideal para suprir essa lacuna."
  },
  {
    number: "2",
    title: "Aprenda na prática",
    description: "Estude com casos reais, legislação atual e ferramentas que você já utiliza no seu cotidiano profissional."
  },
  {
    number: "3",
    title: "Aplique e veja resultado",
    description: "Saia pronto para aplicar o conteúdo e acompanhar a evolução dos processos com mais segurança jurídica."
  }
];

const faqItems = [
  {
    value: "faq-1",
    question: "Como faço minha inscrição?",
    answer: "Você pode realizar a inscrição diretamente pelo nosso site em cada página de curso, ou falar com a equipe para atendimento consultivo."
  },
  {
    value: "faq-2",
    question: "Recebo certificado após o curso?",
    answer: "Sim. Todos os nossos cursos oferecem certificado válido em todo o território nacional conforme a carga horária da turma."
  },
  {
    value: "faq-3",
    question: "Órgãos públicos podem contratar?",
    answer: "Sim. Somos especialistas no atendimento à administração pública direta e indireta, incluindo contratação por inexigibilidade e empenho."
  }
];

const pathIconMap = {
  "path-dp": Users,
  "path-licitacoes": Scale,
  "path-pessoas": Building2,
  "path-comunicacao": MessageSquareText,
  "path-auditoria": BriefcaseBusiness,
  "path-tech": Cpu
} as const;

export function HomePage() {
  const { trainingPaths, testimonials } = useAppStore();
  const [testimonialPage, setTestimonialPage] = useState(0);

  const highlightedTestimonials = testimonials.slice(0, 4);
  const pages = Math.max(1, Math.ceil(highlightedTestimonials.length / 2));
  const visibleTestimonials = highlightedTestimonials.slice(testimonialPage * 2, testimonialPage * 2 + 2);

  return (
    <>
      <Box
        component="section"
        data-testid="ui-hero-home"
        py={{ base: 64, md: 112 }}
        style={{
          background: "linear-gradient(135deg, #08324d 0%, #0b4d74 100%)",
          color: "#ffffff"
        }}
      >
        <Container size={1200} px="md">
          <Stack gap="lg" maw={760}>
            <Badge
              variant="light"
              color="rhGold"
              size="lg"
              radius="sm"
              styles={{ root: { background: "rgba(245,182,29,0.16)", color: "#f5b61d" } }}
            >
              TREINAMENTO DE ALTA PERFORMANCE, DESDE 2007.
            </Badge>
            <Title order={1} c="white">
              Formando quem transforma,
              <Text component="span" inherit c="rhGold.5">
                {" "}há 19 anos.
              </Text>
            </Title>
            <Text fz="lg" c="rgba(255,255,255,0.82)" maw={620}>
              Capacitação 100% prática para profissionais de RH, Gestão Pública e Auditoria que buscam segurança jurídica e excelência operacional.
            </Text>

            <Group gap="md" mt="sm">
              <Button component={Link} to="/cursos" color="rhGold" c="#08324d" size="lg" fw={700}>
                Ver Trilhas de Conhecimento
              </Button>
              <Button
                component={Link}
                to="/falar-com-especialista"
                variant="outline"
                color="gray.0"
                size="lg"
                styles={{ root: { borderColor: "rgba(255,255,255,0.4)" }, label: { color: "#ffffff" } }}
              >
                Falar com Especialista
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>

      <Container size={1200} px="md" mt={{ base: -32, md: -48 }} style={{ position: "relative", zIndex: 1 }}>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          {heroTrustMetrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <Card key={metric.label} radius="lg" shadow="sm" withBorder padding="lg">
                <Group gap="md" wrap="nowrap">
                  <ThemeIcon size={48} radius="md" variant="light" color="rhBlue">
                    <Icon size={20} />
                  </ThemeIcon>
                  <Box>
                    <Text fw={800} fz="1.5rem" c="rhBlue.9" lh={1.1}>
                      {metric.value}{" "}
                      <Text component="span" fw={600} fz="sm" c="#4d5f70">
                        {metric.label}
                      </Text>
                    </Text>
                    <Text fz="xs" fw={600} c="#5f6b78">
                      {metric.helper}
                    </Text>
                  </Box>
                </Group>
              </Card>
            );
          })}
        </SimpleGrid>
      </Container>

      <Box component="section" py={{ base: 64, md: 96 }} mt={{ base: 48, md: 64 }} style={{ background: "#08324d", color: "#ffffff" }}>
        <Container size={1200} px="md">
          <Stack gap="sm" maw={720} mb="xl">
            <Text fz="sm" fw={700} c="rhGold.5">
              O PROBLEMA REAL
            </Text>
            <Title order={2} c="white">
              A burocracia muda. Quem não se atualiza, erra.
            </Title>
            <Text c="rgba(255,255,255,0.78)">
              DP, eSocial, Lei 14.133 e IA aplicada ao serviço público avançam rápido. Enquanto o volume técnico aumenta, o tempo para aprender diminui. E cada erro pode virar multa, retrabalho ou risco para a equipe.
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            {problemCards.map((item) => {
              const Icon = item.icon;

              return (
                <Card
                  key={item.title}
                  radius="lg"
                  padding="xl"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  <ThemeIcon size={48} radius="md" color="rhGold" variant="light" mb="md">
                    <Icon size={20} />
                  </ThemeIcon>
                  <Title order={3} fz="1.25rem" c="white" mb={8}>
                    {item.title}
                  </Title>
                  <Text c="rgba(255,255,255,0.74)">{item.description}</Text>
                </Card>
              );
            })}
          </SimpleGrid>
        </Container>
      </Box>

      <Box component="section" py={{ base: 64, md: 96 }} bg="#f4f6f9">
        <Container size={1200} px="md">
          <Stack gap="sm" align="center" ta="center" maw={680} mx="auto" mb="xl">
            <Text fz="sm" fw={700} c="rhBlue.7">
              NOSSO CURRÍCULO
            </Text>
            <Title order={2} c="rhBlue.9">
              Escolha sua trilha de capacitação
            </Title>
            <Text c="#4d5f70">+80 cursos em 6 trilhas, prontas para você começar sua transformação profissional</Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {trainingPaths.map((path) => {
              const Icon = pathIconMap[path.id as keyof typeof pathIconMap] ?? BriefcaseBusiness;

              return (
                <Card key={path.id} radius="lg" shadow="sm" withBorder padding="xl">
                  <Group justify="space-between" align="center" mb="md">
                    <ThemeIcon size={40} radius="md" variant="light" color="rhBlue">
                      <Icon size={16} />
                    </ThemeIcon>
                    <Badge variant="light" color="rhBlue" radius="sm">
                      {path.courseCount} CURSOS
                    </Badge>
                  </Group>
                  <Title order={3} fz="1.2rem" c="rhBlue.9" mb={8}>
                    {path.name}
                  </Title>
                  <Text c="#4d5f70" mb="md">
                    {path.description}
                  </Text>
                  <Anchor component={Link} to="/cursos" c="rhBlue.7" fw={600}>
                    Ver cursos da trilha
                  </Anchor>
                </Card>
              );
            })}
          </SimpleGrid>

          <Group justify="center" mt="xl">
            <Button component={Link} to="/cursos" color="rhBlue.9" size="lg">
              Ver todos os cursos
            </Button>
          </Group>
        </Container>
      </Box>

      <Box component="section" py={{ base: 64, md: 96 }}>
        <Container size={1200} px="md">
          <Grid gap={48} align="center">
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Stack gap="sm">
                <Text fz="sm" fw={700} c="rhBlue.7">
                  TESTEMUNHOS
                </Text>
                <Title order={2} c="rhBlue.9">
                  Resultados percebidos por quem participou.
                </Title>
                <Text c="#4d5f70">
                  Ouvimos centenas de profissionais que já transformaram suas rotinas após nossos treinamentos práticos.
                </Text>
                <Group gap="sm" mt="sm">
                  <ActionIcon
                    size={44}
                    radius="md"
                    variant="default"
                    aria-label="Depoimentos anteriores"
                    disabled={testimonialPage === 0}
                    onClick={() => setTestimonialPage((current) => Math.max(0, current - 1))}
                  >
                    <ChevronLeft size={16} />
                  </ActionIcon>
                  <ActionIcon
                    size={44}
                    radius="md"
                    variant="default"
                    aria-label="Próximos depoimentos"
                    disabled={testimonialPage >= pages - 1}
                    onClick={() => setTestimonialPage((current) => Math.min(pages - 1, current + 1))}
                  >
                    <ChevronRight size={16} />
                  </ActionIcon>
                </Group>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 7 }}>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                {visibleTestimonials.map((testimonial) => (
                  <Card key={testimonial.id} radius="lg" shadow="sm" withBorder padding="xl">
                    <Group gap="md" mb="md" wrap="nowrap">
                      <ThemeIcon size={44} radius="xl" variant="light" color="rhBlue">
                        <Text fw={700} fz="sm">
                          {testimonial.name.slice(0, 2).toUpperCase()}
                        </Text>
                      </ThemeIcon>
                      <Box>
                        <Title order={3} fz="1rem" c="rhBlue.9">
                          {testimonial.name}
                        </Title>
                        <Text fz="sm" c="#4d5f70">
                          {testimonial.organization}
                        </Text>
                      </Box>
                    </Group>
                    <Text c="rhGold.7" aria-label={`${testimonial.rating} de 5 estrelas`} mb={8}>
                      {"★".repeat(testimonial.rating)}
                    </Text>
                    <Text c="#304255" fs="italic">
                      “{testimonial.text}”
                    </Text>
                  </Card>
                ))}
              </SimpleGrid>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      <Box component="section" py={{ base: 64, md: 96 }} bg="#f4f6f9">
        <Container size={1200} px="md">
          <Stack gap="sm" align="center" ta="center" maw={680} mx="auto" mb="xl">
            <Text fz="sm" fw={700} c="rhBlue.7">
              COMO FUNCIONA
            </Text>
            <Title order={2} c="rhBlue.9">
              Três passos para transformar resultado
            </Title>
          </Stack>

          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            {processSteps.map((step) => (
              <Card key={step.number} radius="lg" shadow="sm" withBorder padding="xl">
                <ThemeIcon size={48} radius="xl" color="rhBlue" mb="md">
                  <Text fw={800} fz="lg" c="white">
                    {step.number}
                  </Text>
                </ThemeIcon>
                <Title order={3} fz="1.2rem" c="rhBlue.9" mb={8}>
                  {step.title}
                </Title>
                <Text c="#4d5f70">{step.description}</Text>
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Box component="section" py={{ base: 64, md: 96 }}>
        <Container size={760} px="md">
          <Title order={2} c="rhBlue.9" ta="center" mb="xl">
            Dúvidas Frequentes
          </Title>
          <Accordion variant="separated" radius="md" chevronPosition="right" transitionDuration={0}>
            {faqItems.map((item) => (
              <Accordion.Item key={item.value} value={item.value}>
                <Accordion.Control>
                  <Text fw={600} c="rhBlue.9">
                    {item.question}
                  </Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Text c="#4d5f70">{item.answer}</Text>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </Container>
      </Box>

      <Box component="section" py={{ base: 56, md: 80 }} style={{ background: "#08324d", color: "#ffffff" }}>
        <Container size={1200} px="md">
          <Group justify="space-between" align="center" gap="xl" wrap="wrap">
            <Box maw={560}>
              <Title order={2} c="white" mb={8}>
                Pronto para ser referência?
              </Title>
              <Text c="rgba(255,255,255,0.8)">
                Inicie agora sua jornada de atualização técnica e ganhe a segurança que seu cargo exige.
              </Text>
            </Box>
            <Group gap="md">
              <Button component={Link} to="/cursos" color="rhGold" c="#08324d" size="lg" fw={700}>
                Ver trilhas agora
              </Button>
              <Button
                component="a"
                href="https://wa.me/5561991129682"
                rel="noreferrer"
                target="_blank"
                variant="outline"
                color="gray.0"
                size="lg"
                styles={{ root: { borderColor: "rgba(255,255,255,0.4)" }, label: { color: "#ffffff" } }}
              >
                WhatsApp Consultoria
              </Button>
            </Group>
          </Group>
        </Container>
      </Box>
    </>
  );
}
