import Image from "next/image";
import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  Group,
  List,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title
} from "@mantine/core";

import { Link } from "@/lib/router-compat";

const leadership = [
  {
    name: "Dr. Ricardo Henrique",
    role: "Diretor Executivo",
    image: "/images/courses/auditoria-tributaria.jpg"
  },
  {
    name: "Dra. Ana Silveira",
    role: "Diretora Acadêmica",
    image: "/images/courses/pessoas-lideranca.jpg"
  },
  {
    name: "Marcus Oliveira",
    role: "Head de Inovação",
    image: "/images/courses/tecnologia-inovacao.jpg"
  },
  {
    name: "Carla Mendes",
    role: "Relacionamento Institucional",
    image: "/images/courses/comunicacao-atendimento.jpg"
  }
];

const timeline = [
  {
    year: "2007",
    title: "Fundação",
    description: "Iniciamos nossas atividades com o propósito de suprir a carência de treinamentos específicos para RH no setor público em Brasília."
  },
  {
    year: "2012",
    title: "Expansão Nacional",
    description: "Consolidação como referência no Centro-Oeste e início dos primeiros treinamentos In Company em outros estados brasileiros."
  },
  {
    year: "2018",
    title: "Transformação Digital",
    description: "Lançamento da plataforma de EAD própria, democratizando o acesso a cursos de alta qualidade para municípios remotos."
  },
  {
    year: "HOJE",
    title: "Liderança em Capacitação",
    description: "Com milhares de alunos e parcerias com órgãos públicos, seguimos inovando com metodologias 100% práticas."
  }
];

const methodSteps = [
  {
    title: "1. Diagnóstico",
    description: "Entendemos contexto, papel profissional e objetivo da turma antes de sugerir a trilha."
  },
  {
    title: "2. Curadoria",
    description: "Conectamos cursos, agenda, formato e instrutores com aderência operacional."
  },
  {
    title: "3. Aplicação",
    description: "Priorizamos conteúdos que saem do campo conceitual e entram na rotina de execução."
  }
];

export function AboutPage() {
  return (
    <Box bg="#f6f7fb">
      <Box component="section" style={{ borderBottom: "1px solid #d7dee5", background: "#0b4668" }}>
        <Container size={1200} px="md" py={{ base: 56, md: 72 }}>
          <Stack gap="md" maw={640}>
            <Text fz="sm" fw={700} c="rhGold.5" tt="uppercase">
              Desde 2007
            </Text>
            <Title order={1} c="white">
              Formando quem transforma o setor público.
            </Title>
            <Text fz="lg" c="rgba(255,255,255,0.8)">
              Somos parceiros estratégicos na capacitação de gestores e profissionais de Recursos Humanos, entregando conhecimento prático e soluções inovadoras para a administração moderna.
            </Text>
          </Stack>
        </Container>
      </Box>

      <Container size={1200} px="md" py="xl">
        <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md">
          <Card radius="lg" shadow="sm" withBorder padding="xl">
            <ThemeIcon size={40} radius="md" variant="light" color="rhBlue">
              ◎
            </ThemeIcon>
            <Title order={3} mt="md" c="rhBlue.9">
              Missão
            </Title>
            <Text mt="md" c="#56606a">
              Capacitar profissionais através de treinamentos de alta performance, unindo teoria robusta e prática aplicável.
            </Text>
          </Card>

          <Card radius="lg" padding="xl" style={{ background: "#0b4668" }} c="white">
            <ThemeIcon size={40} radius="md" color="rhGold" c="#715300">
              ◉
            </ThemeIcon>
            <Title order={3} mt="md" c="white">
              Visão
            </Title>
            <Text mt="md" c="rgba(255,255,255,0.8)">
              Ser a principal referência nacional em educação corporativa para o setor público, reconhecida pela excelência técnica e pelo impacto transformador.
            </Text>
            <Group gap="sm" mt={64} c="rgba(255,255,255,0.8)">
              <Box w={96} h={2} bg="rhGold" />
              <Text fz="xs" fw={700} tt="uppercase">
                Progresso
              </Text>
            </Group>
          </Card>

          <Stack gap="md">
            <Card radius="lg" shadow="sm" withBorder padding="xl">
              <ThemeIcon size={40} radius="md" variant="light" color="rhBlue">
                ◌
              </ThemeIcon>
              <Title order={3} mt="md" c="rhBlue.9">
                Valores
              </Title>
              <List mt="md" spacing="sm" c="#56606a" listStyleType="none">
                <List.Item>• Excelência Técnica</List.Item>
                <List.Item>• Ética e Transparência</List.Item>
                <List.Item>• Foco em Resultados</List.Item>
                <List.Item>• Inovação Contínua</List.Item>
              </List>
            </Card>
            <Card radius="lg" padding="xl" style={{ background: "#1d6c98" }} c="white">
              <Text fz="3rem" fw={800} lh={1}>
                15k+
              </Text>
              <Text mt="xs" fz="sm" fw={700} tt="uppercase" c="rgba(255,255,255,0.8)">
                Alunos formados
              </Text>
            </Card>
          </Stack>
        </SimpleGrid>
      </Container>

      <Box component="section" bg="white" style={{ borderTop: "1px solid #d7dee5", borderBottom: "1px solid #d7dee5" }}>
        <Container size={1200} px="md" py={{ base: 48, md: 56 }}>
          <Grid gap={48}>
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Text fz="sm" fw={700} c="rhGold.8" tt="uppercase">
                Leitura institucional
              </Text>
              <Title order={2} c="rhBlue.9" mt="xs">
                Nossa Trajetória
              </Title>
              <Text mt="md" c="#56606a">
                Desde a nossa fundação em 2007, evoluímos junto com as necessidades da administração pública brasileira.
              </Text>
              <Box mt="xl" style={{ overflow: "hidden", borderRadius: "var(--mantine-radius-lg)", border: "1px solid #d7dee5" }}>
                <Image
                  src="/images/home-hero-reference.jpg"
                  alt="Trajetória RH Cursos"
                  width={480}
                  height={320}
                  style={{ height: 220, width: "100%", objectFit: "cover" }}
                />
              </Box>
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Stack gap="xl">
                {timeline.map((item) => (
                  <Group key={item.title} align="flex-start" gap="lg" wrap="nowrap">
                    <Box mt={8} w={16} h={16} bg="rhBlue.9" style={{ borderRadius: 999, flexShrink: 0 }} />
                    <Box style={{ flex: 1 }}>
                      <Title order={3} c="rhBlue.9">
                        {item.title}
                      </Title>
                      <Text mt={8} c="#56606a">
                        {item.description}
                      </Text>
                    </Box>
                    <Text fz="3rem" fw={800} lh={1} c="#7f93a6" ta="right">
                      {item.year}
                    </Text>
                  </Group>
                ))}
              </Stack>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      <Container size={1200} px="md" py="xl">
        <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md">
          {methodSteps.map((item) => (
            <Card key={item.title} radius="lg" shadow="sm" withBorder padding="lg" bg="#f8fafc">
              <Text fz="xs" fw={700} c="rhGold.8" tt="uppercase">
                {item.title}
              </Text>
              <Text mt="md" c="#56606a">
                {item.description}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      </Container>

      <Container size={1200} px="md" py={{ base: 48, md: 56 }}>
        <Stack gap="md" align="center" ta="center" maw={680} mx="auto">
          <Title order={2} c="rhBlue.9">
            Nossa Liderança
          </Title>
          <Text c="#56606a">
            Especialistas comprometidos com a excelência acadêmica e a transformação institucional.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, md: 2, xl: 4 }} spacing="lg" mt="xl">
          {leadership.map((person) => (
            <Card key={person.name} radius="lg" shadow="sm" padding={0}>
              <Image
                src={person.image}
                alt={person.name}
                width={320}
                height={420}
                style={{ height: 292, width: "100%", objectFit: "cover" }}
              />
              <Box p="md">
                <Title order={3} fz="1.1rem" c="#1a1c1e">
                  {person.name}
                </Title>
                <Text mt={4} fz="sm" c="rhBlue.9">
                  {person.role}
                </Text>
              </Box>
            </Card>
          ))}
        </SimpleGrid>
      </Container>

      <Box component="section" pb="xl">
        <Container size={1200} px="md">
          <Card radius="lg" padding={48} style={{ background: "#0b4668" }} ta="center">
            <Title order={2} c="white">
              Pronto para transformar sua gestão?
            </Title>
            <Text mx="auto" mt="md" maw={680} fz="lg" c="rgba(255,255,255,0.8)">
              Conheça nossos cursos ou solicite uma proposta personalizada para sua instituição.
            </Text>
            <Group justify="center" gap="md" mt="xl">
              <Button component={Link} to="/cursos" color="rhGold" c="#083b56" fw={700}>
                Ver Catálogo de Cursos
              </Button>
              <Button
                component={Link}
                to="/falar-com-especialista"
                variant="outline"
                color="gray.0"
                styles={{ root: { borderColor: "rgba(255,255,255,0.7)" }, label: { color: "#ffffff" } }}
              >
                Falar com Consultor
              </Button>
            </Group>
          </Card>
        </Container>
      </Box>
    </Box>
  );
}
