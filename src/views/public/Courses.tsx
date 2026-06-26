"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  BookOpenCheck,
  Calculator,
  ClipboardCheck,
  MessageSquareText,
  Scale,
  Users,
  X
} from "lucide-react";
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
  Title
} from "@mantine/core";

import { EmptyState } from "@/components/common/empty-state";
import { LoadingBlocks } from "@/components/common/loading-blocks";
import { SearchInput } from "@/components/common/search-input";
import { CourseCard } from "@/components/courses/course-card";
import { useHotkey } from "@/hooks/use-hotkey";
import { useAppStore } from "@/lib/app-store";
import { Link, useSearchParams } from "@/lib/router-compat";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";

const pathIcons = {
  Calculator,
  Scale,
  Users,
  MessageSquareText,
  ClipboardCheck,
  BarChart3
} as const;

export function CoursesPage() {
  const { courses, classes, trainingPaths } = useAppStore();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const searchRef = useRef<HTMLInputElement>(null);

  const filters = {
    path: params.get("path") ?? "",
    modality: params.get("modality") ?? "",
    duration: params.get("duration") ?? "",
    level: params.get("level") ?? ""
  };

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value.startsWith("all-")) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setParams(next);
  };

  const setSearch = (value: string) => {
    setQuery(value);
    const next = new URLSearchParams(params);
    if (value.trim()) {
      next.set("q", value);
    } else {
      next.delete("q");
    }
    setParams(next);
  };

  useEffect(() => {
    setQuery(params.get("q") ?? "");
  }, [params]);

  useHotkey(
    (event) => event.key === "/" && !["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName),
    (event) => {
      event.preventDefault();
      searchRef.current?.focus();
    }
  );

  const filteredCourses = useMemo(() => {
    const normalized = query.toLowerCase();

    return courses.filter((course) => {
      const durationMatch =
        !filters.duration ||
        (filters.duration === "Até 8h" && course.durationHours <= 8) ||
        (filters.duration === "De 9h a 16h" && course.durationHours >= 9 && course.durationHours <= 16) ||
        (filters.duration === "De 17h a 24h" && course.durationHours >= 17 && course.durationHours <= 24) ||
        (filters.duration === "Mais de 24h" && course.durationHours > 24);

      return (
        (!normalized ||
          [course.title, course.pathName, course.shortDescription].join(" ").toLowerCase().includes(normalized)) &&
        (!filters.path || course.pathId === filters.path) &&
        (!filters.modality || course.modality === filters.modality) &&
        (!filters.level || course.level === filters.level || course.level.includes(filters.level)) &&
        durationMatch
      );
    });
  }, [courses, filters.duration, filters.level, filters.modality, filters.path, query]);

  const loading = useSimulatedLoading([query, filters.path, filters.modality, filters.duration, filters.level]);
  const activeFiltersCount = [query, filters.path, filters.modality, filters.duration, filters.level].filter(Boolean).length;
  const featuredCoursesCount = courses.filter((course) => course.featured).length;
  const upcomingClassesCount = classes.filter((item) => item.status === "Inscrições abertas" || item.status === "Poucas vagas").length;
  const activePathName = trainingPaths.find((path) => path.id === filters.path)?.shortName;
  const activeFilterLabels = [
    query ? `Busca: ${query}` : null,
    activePathName ? `Trilha: ${activePathName}` : null,
    filters.modality ? `Modalidade: ${filters.modality}` : null,
    filters.duration ? `Carga: ${filters.duration}` : null,
    filters.level ? `Nível: ${filters.level}` : null
  ].filter(Boolean) as string[];

  const visibleCourses = filteredCourses
    .slice()
    .sort((left, right) => Number(right.featured) - Number(left.featured) || left.title.localeCompare(right.title));

  const clearFilters = () => {
    setQuery("");
    setParams({});
  };

  return (
    <Box bg="#f6f7fb">
      <Box component="section" py={{ base: 56, md: 64 }} style={{ background: "#0b4668", borderBottom: "1px solid #d7dee5" }}>
        <Container size={1200} px="md">
          <Stack gap="md" maw={760}>
            <Badge
              variant="light"
              color="rhGold"
              size="lg"
              radius="sm"
              styles={{ root: { background: "rgba(246,190,57,0.12)", color: "#f6be39" } }}
            >
              Catálogo oficial
            </Badge>
            <Title order={1} c="white">
              Catálogo de Cursos
            </Title>
            <Text fz="lg" c="rgba(255,255,255,0.8)" maw={620}>
              Capacitação de excelência para profissionais de RH e Gestão Pública com foco em resultados práticos e conformidade legal.
            </Text>
          </Stack>
        </Container>
      </Box>

      <Box component="section" bg="white" style={{ borderBottom: "1px solid #d7dee5" }}>
        <Container size={1200} px="md" py="lg">
          <Grid gap="lg" data-testid="ui-courses-filters">
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Stack gap="md">
                <Group gap="sm">
                  <Button
                    variant={!filters.path ? "filled" : "outline"}
                    color="rhBlue.9"
                    radius="xl"
                    size="sm"
                    onClick={() => setFilter("path", "")}
                    aria-pressed={!filters.path}
                  >
                    Todos
                  </Button>
                  {trainingPaths.map((path) => {
                    const Icon = pathIcons[path.icon as keyof typeof pathIcons] ?? BookOpenCheck;
                    const active = filters.path === path.id;

                    return (
                      <Button
                        key={path.id}
                        variant={active ? "filled" : "outline"}
                        color="rhBlue.9"
                        radius="xl"
                        size="sm"
                        leftSection={<Icon size={16} />}
                        onClick={() => setFilter("path", path.id)}
                        aria-pressed={active}
                      >
                        {path.shortName}
                      </Button>
                    );
                  })}
                </Group>

                <SimpleGrid cols={{ base: 1, md: 2, xl: 4 }} spacing="sm">
                  <Select
                    aria-label="Filtrar por modalidade"
                    placeholder="Modalidade"
                    value={filters.modality || null}
                    onChange={(value) => setFilter("modality", value ?? "")}
                    clearable
                    data={["Ao vivo online", "Presencial", "In company", "Híbrido", "Gravado"]}
                  />
                  <Select
                    aria-label="Filtrar por carga horária"
                    placeholder="Carga horária"
                    value={filters.duration || null}
                    onChange={(value) => setFilter("duration", value ?? "")}
                    clearable
                    data={["Até 8h", "De 9h a 16h", "De 17h a 24h", "Mais de 24h"]}
                  />
                  <Select
                    aria-label="Filtrar por nível"
                    placeholder="Nível"
                    value={filters.level || null}
                    onChange={(value) => setFilter("level", value ?? "")}
                    clearable
                    data={["Básico", "Intermediário", "Avançado"]}
                  />
                  <Button
                    variant="default"
                    leftSection={<X size={16} />}
                    disabled={!activeFiltersCount}
                    onClick={clearFilters}
                  >
                    Limpar filtros
                  </Button>
                </SimpleGrid>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 4 }}>
              <SearchInput
                ref={searchRef}
                value={query}
                onChange={(event) => setSearch(event.target.value)}
                onClear={() => setSearch("")}
                clearLabel="Limpar busca do catálogo"
                placeholder="Buscar curso..."
                resultsLabel={
                  query
                    ? `${filteredCourses.length} resultado${filteredCourses.length === 1 ? "" : "s"} para “${query}”.`
                    : "Digite um termo para filtrar o catálogo."
                }
                loading={loading}
              />
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      <Container size={1200} px="md" py="xl">
        <Stack gap="xl">
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
            {[
              { label: "Cursos no catálogo", value: courses.length },
              { label: "Programas em destaque", value: featuredCoursesCount },
              { label: "Turmas com vagas", value: upcomingClassesCount }
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

          {activeFilterLabels.length ? (
            <Group gap="xs">
              {activeFilterLabels.map((label) => (
                <Badge key={label} variant="light" color="rhBlue" radius="xl" size="lg">
                  {label}
                </Badge>
              ))}
            </Group>
          ) : null}

          {loading ? (
            <LoadingBlocks count={6} summary="Atualizando catálogo..." />
          ) : visibleCourses.length ? (
            <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="lg">
              {visibleCourses.map((course) => {
                const nextClass = classes.find((item) => item.id === course.nextClassId);
                return <CourseCard key={course.id} course={course} nextClass={nextClass} />;
              })}
            </SimpleGrid>
          ) : (
            <EmptyState
              title="Nenhum curso encontrado."
              description="Ajuste os filtros de trilha, modalidade, carga ou termo pesquisado."
            />
          )}
        </Stack>
      </Container>

      <Box component="section" pb="xl">
        <Container size={1200} px="md">
          <Card radius="lg" padding={48} style={{ background: "#0b4668" }} ta="center">
            <Title order={2} c="white">
              Precisa de um treinamento personalizado?
            </Title>
            <Text mx="auto" mt="md" maw={680} fz="lg" c="rgba(255,255,255,0.8)">
              Nossas soluções In Company são adaptadas às necessidades específicas da sua organização ou órgão público.
            </Text>
            <Group justify="center" gap="md" mt="xl">
              <Button component={Link} to="/in-company" color="rhGold" c="#083b56" size="md" fw={700}>
                Solicitar Proposta
              </Button>
              <Button
                component={Link}
                to="/agenda"
                variant="outline"
                color="gray.0"
                size="md"
                styles={{ root: { borderColor: "rgba(255,255,255,0.7)" }, label: { color: "#ffffff" } }}
              >
                Ver Agenda de Turmas
              </Button>
            </Group>
          </Card>
        </Container>
      </Box>
    </Box>
  );
}
