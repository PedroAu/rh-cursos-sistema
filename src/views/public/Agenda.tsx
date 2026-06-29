"use client";

import { CalendarDays, CheckCircle2, Filter, List, Mail, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title
} from "@mantine/core";

import { CalendarView } from "@/components/agenda/calendar-view";
import { SearchInput } from "@/components/common/search-input";
import { useHotkey } from "@/hooks/use-hotkey";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useAppStore } from "@/lib/app-store";
import { company } from "@/lib/company";
import { useSearchParams } from "@/lib/router-compat";

export function AgendaPage() {
  const { classes, courses, instructors, trainingPaths } = useAppStore();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [path, setPath] = useState(params.get("path") ?? "");
  const [courseId, setCourseId] = useState(params.get("courseId") ?? "");
  const [modality, setModality] = useState(params.get("modality") ?? "");
  const [status, setStatus] = useState(params.get("status") ?? "");
  const searchRef = useRef<HTMLInputElement>(null);

  useHotkey(
    (event) => event.key === "/" && !["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName),
    (event) => {
      event.preventDefault();
      searchRef.current?.focus();
    }
  );

  const filteredClasses = useMemo(
    () =>
      classes.filter((trainingClass) => {
        const course = courses.find((item) => item.id === trainingClass.courseId);
        const instructor = instructors.find((item) => item.id === trainingClass.instructorId);

        return (
          (!query ||
            [course?.title, instructor?.name, trainingClass.location].join(" ").toLowerCase().includes(query.toLowerCase())) &&
          (!path || course?.pathId === path) &&
          (!courseId || trainingClass.courseId === courseId) &&
          (!modality || trainingClass.modality === modality) &&
          (!status || trainingClass.status === status)
        );
      }),
    [classes, courseId, courses, instructors, modality, path, query, status]
  );

  useEffect(() => {
    const next: Record<string, string> = {};
    if (query) next.q = query;
    if (path) next.path = path;
    if (courseId) next.courseId = courseId;
    if (modality) next.modality = modality;
    if (status) next.status = status;
    setParams(next);
  }, [courseId, modality, path, query, setParams, status]);

  const loading = useSimulatedLoading([query, path, courseId, modality, status], 400);
  const activeFiltersCount = [query, path, courseId, modality, status].filter(Boolean).length;
  const courseOptions = path ? courses.filter((item) => item.pathId === path) : courses;
  const openClassesCount = filteredClasses.filter((item) => item.status === "Inscrições abertas").length;
  const presencialCount = filteredClasses.filter((item) => item.modality === "Presencial").length;

  const clearFilters = () => {
    setQuery("");
    setPath("");
    setCourseId("");
    setModality("");
    setStatus("");
  };

  return (
    <Box bg="#f6f7fb">
      <Box component="section" bg="white" style={{ borderBottom: "1px solid #d7dee5" }}>
        <Container size={1200} px="md" py={{ base: 48, md: 56 }}>
          <Grid gap={32} align="center">
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Stack gap="md" maw={760}>
                <Text fz="sm" fw={700} c="rhBlue.9" tt="uppercase">
                  Calendário 2024
                </Text>
                <Title order={1} c="rhBlue.9">
                  Agenda de Treinamentos
                </Title>
                <Text fz="xl" c="#3d4752" maw={680}>
                  Acompanhe as próximas turmas presenciais, treinamentos ao vivo e eventos exclusivos para profissionais de RH e gestão pública.
                </Text>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Group justify="flex-end" gap="sm">
                <Button color="rhBlue.9" leftSection={<CalendarDays size={16} />}>
                  Calendário
                </Button>
                <Button variant="default" leftSection={<List size={16} />}>
                  Lista
                </Button>
              </Group>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      <Container size={1200} px="md" py="xl">
        <Grid gap={32}>
          <Grid.Col span={{ base: 12, xl: 8 }}>
            <Stack gap="xl">
              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                {[
                  { label: "Turmas encontradas", value: filteredClasses.length },
                  { label: "Inscrições abertas", value: openClassesCount },
                  { label: "Presenciais", value: presencialCount }
                ].map((item) => (
                  <Card key={item.label} radius="lg" shadow="sm" withBorder padding="lg">
                    <Text fz="xs" fw={700} c="#5f6b78" tt="uppercase">
                      {item.label}
                    </Text>
                    <Text mt={8} fz="2.25rem" fw={800} c="rhBlue.9">
                      {item.value}
                    </Text>
                  </Card>
                ))}
              </SimpleGrid>

              <CalendarView filteredClasses={filteredClasses} loading={loading} />
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, xl: 4 }}>
            <Stack gap="lg" component="aside">
              <Card radius="lg" shadow="sm" withBorder padding="lg" data-testid="ui-agenda-filters">
                <Group justify="space-between" align="flex-start" mb="lg">
                  <Title order={2} fz="1.5rem" c="rhBlue.9">
                    Filtrar Agenda
                  </Title>
                  <Badge variant="light" color="rhBlue" radius="xl" leftSection={<CheckCircle2 size={14} />}>
                    {activeFiltersCount}
                  </Badge>
                </Group>

                <Stack gap="md">
                  <Select
                    label="Categoria"
                    aria-label="Filtrar agenda por trilha"
                    placeholder="Todas as Categorias"
                    value={path || null}
                    onChange={(value) => {
                      setPath(value ?? "");
                      setCourseId("");
                    }}
                    clearable
                    data={trainingPaths.map((item) => ({ value: item.id, label: item.shortName }))}
                  />

                  <Select
                    label="Curso"
                    aria-label="Filtrar agenda por curso"
                    placeholder="Todos os cursos"
                    value={courseId || null}
                    onChange={(value) => setCourseId(value ?? "")}
                    clearable
                    searchable
                    data={courseOptions.map((item) => ({ value: item.id, label: item.title }))}
                  />

                  <Box>
                    <Text fz="sm" fw={700} c="#252b31" mb={8}>
                      Modalidade
                    </Text>
                    <Group gap="xs">
                      <Button
                        size="sm"
                        radius="xl"
                        variant={!modality ? "filled" : "outline"}
                        color="rhBlue.9"
                        onClick={() => setModality("")}
                      >
                        Todos
                      </Button>
                      {["Presencial", "Ao vivo online", "Gravado"].map((item) => (
                        <Button
                          key={item}
                          size="sm"
                          radius="xl"
                          variant={modality === item ? "filled" : "outline"}
                          color="rhBlue.9"
                          onClick={() => setModality(item)}
                        >
                          {item}
                        </Button>
                      ))}
                    </Group>
                  </Box>

                  <Box>
                    <Text fz="sm" fw={700} c="#252b31" mb={8}>
                      Busca
                    </Text>
                    <SearchInput
                      ref={searchRef}
                      placeholder="Curso, instrutor ou local"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      onClear={() => setQuery("")}
                      clearLabel="Limpar busca da agenda"
                      resultsLabel={
                        query
                          ? `${filteredClasses.length} turma${filteredClasses.length === 1 ? "" : "s"} encontrada${filteredClasses.length === 1 ? "" : "s"} para “${query}”.`
                          : "Busque por curso, instrutor ou local."
                      }
                      loading={loading}
                    />
                  </Box>

                  <Select
                    label="Status"
                    aria-label="Filtrar agenda por status"
                    placeholder="Todos"
                    value={status || null}
                    onChange={(value) => setStatus(value ?? "")}
                    clearable
                    data={["Inscrições abertas", "Poucas vagas", "Encerrada", "Em breve"]}
                  />

                  <Box pt="sm" style={{ borderTop: "1px solid #e3e8ee" }}>
                    <Button
                      fullWidth
                      variant="outline"
                      color="rhBlue.10"
                      leftSection={<X size={16} />}
                      disabled={!activeFiltersCount}
                      onClick={clearFilters}
                    >
                      Limpar Filtros
                    </Button>
                  </Box>
                </Stack>
              </Card>

              <Card radius="lg" padding="xl" style={{ background: "#0b4668" }}>
                <Title order={3} c="white">
                  Treinamento In-Company?
                </Title>
                <Text mt="md" fz="lg" c="rgba(255,255,255,0.8)">
                  Personalizamos nossos cursos para atender às necessidades específicas da sua organização ou prefeitura.
                </Text>
                <Button component="a" href="/in-company" fullWidth mt="xl" color="rhGold" c="#083b56" fw={700}>
                  Solicitar Proposta
                </Button>
              </Card>

              <Card radius="lg" shadow="sm" withBorder padding="lg">
                <ThemeIcon size={48} radius="md" color="rhGold" variant="light" mb="md">
                  <Filter size={20} />
                </ThemeIcon>
                <Title order={3} fz="1.25rem" c="#1a1c1e">
                  Fique por dentro
                </Title>
                <Text mt="xs" c="#56606a">
                  Receba as atualizações da agenda e novos cursos diretamente no seu e-mail.
                </Text>
                <TextInput type="email" aria-label="Seu melhor e-mail" placeholder="Seu melhor e-mail" mt="md" size="md" />
                <Button fullWidth mt="md" color="rhBlue.9">
                  Assinar Newsletter
                </Button>
                <Group gap="xs" mt="md" c="#56606a">
                  <Mail size={16} color="#004364" />
                  <Text fz="sm" c="#56606a">
                    {company.email}
                  </Text>
                </Group>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
}
