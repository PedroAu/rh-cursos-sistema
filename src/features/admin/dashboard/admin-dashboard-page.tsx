"use client";

import { useCallback, useMemo } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Title
} from "@mantine/core";
import { ArrowRight, BookOpen, CircleDollarSign, Download, Pencil, TrendingUp, Trash2, UserPlus, Users } from "lucide-react";

import {
  buildPerformanceStats,
  buildRecentActivities,
  formatRelativeTime,
  type DashboardActivity
} from "@/features/admin/dashboard/model/dashboard-activity";
import { buildDashboardMetrics } from "@/features/admin/dashboard/model/dashboard-metrics";
import { useAppStore } from "@/lib/app-store";
import { useAdminSearch } from "@/lib/hooks/useAdminSearch";
import { useRealTimeMetrics } from "@/lib/hooks/useRealTimeMetrics";
import { exportToCSV } from "@/lib/utils/csv-export";
import { Link } from "@/lib/router-compat";

function pickMetric(
  metrics: ReturnType<typeof buildDashboardMetrics>,
  label: string,
  fallbackValue = "0",
  fallbackHelper = ""
) {
  return metrics.find((metric) => metric.label === label) ?? { label, value: fallbackValue, helper: fallbackHelper };
}

function getActivityIcon(kind: DashboardActivity["kind"]) {
  if (kind === "lead") return UserPlus;
  if (kind === "payment") return CircleDollarSign;
  return BookOpen;
}

function getActivityTone(kind: DashboardActivity["kind"]) {
  if (kind === "lead") return { background: "#fff2dc", color: "#b56d06" };
  if (kind === "payment") return { background: "#e7f5ec", color: "#2d8a4f" };
  return { background: "#eaf3fb", color: "#0b4668" };
}

export function AdminDashboardPage() {
  const appStore = useAppStore();
  const { courses, classes, students, leads, enrollments } = appStore;

  // Real-time metrics subscription
  const rtData = useRealTimeMetrics({ courses, classes, students, leads, enrollments });

  // Memoized metrics calculations
  const metrics = useMemo(
    () => buildDashboardMetrics({ courses: rtData.courses, classes: rtData.classes, students: rtData.students, leads: rtData.leads, enrollments: rtData.enrollments }),
    [rtData.courses, rtData.classes, rtData.students, rtData.leads, rtData.enrollments]
  );

  const activities = useMemo(
    () => buildRecentActivities({ enrollments: rtData.enrollments, leads: rtData.leads, courses: rtData.courses }),
    [rtData.enrollments, rtData.leads, rtData.courses]
  );

  const performanceStats = useMemo(
    () => buildPerformanceStats({ enrollments: rtData.enrollments, leads: rtData.leads }),
    [rtData.enrollments, rtData.leads]
  );

  // Search functionality
  const { results: searchedCourses, handleSearch, query: searchQuery } = useAdminSearch(
    rtData.courses.slice(0, 100),
    (course, q) => {
      const lowerQ = q.toLowerCase();
      return course.title.toLowerCase().includes(lowerQ) || (course.category?.toLowerCase() ?? "").includes(lowerQ);
    },
    { debounceMs: 300, minChars: 1 }
  );

  // CSV export handler
  const handleExportCourses = useCallback(() => {
    const exportData = rtData.courses.map((course) => ({
      id: course.id,
      title: course.title,
      category: course.category,
      status: course.status,
      price: course.price,
      enrollments: rtData.enrollments.filter((e) => e.courseId === course.id).length
    }));
    exportToCSV(exportData, { filename: `courses-export-${new Date().toISOString().split("T")[0]}.csv` });
  }, [rtData.courses, rtData.enrollments]);

  const kpis = useMemo(
    () => [
      {
        label: "TOTAL DE ALUNOS",
        value: pickMetric(metrics, "Total de alunos").value,
        helper: pickMetric(metrics, "Total de alunos").helper,
        accent: "+12% este mês",
        accentTone: "#2f8b4f",
        icon: Users,
        iconTone: { background: "#edf5fb", color: "#0b4668" }
      },
      {
        label: "CURSOS ATIVOS",
        value: pickMetric(metrics, "Total de cursos").value,
        helper: "Catálogo publicado",
        accent: `${rtData.courses.filter((course) => course.status === "Ativo" || course.status === "Destaque").length} em destaque`,
        accentTone: "#4b5563",
        icon: BookOpen,
        iconTone: { background: "#fff8e2", color: "#8f6a00" }
      },
      {
        label: "VENDAS DO MÊS",
        value: pickMetric(metrics, "Receita total").value,
        helper: "Receita confirmada",
        accent: `${pickMetric(metrics, "Taxa de conversão").value} de conversão`,
        accentTone: "#2f8b4f",
        icon: CircleDollarSign,
        iconTone: { background: "#e8f5ea", color: "#2f8b4f" }
      },
      {
        label: "NOVOS LEADS",
        value: pickMetric(metrics, "Leads").value,
        helper: "Funil comercial",
        accent: `${rtData.leads.filter((lead) => lead.status === "Novo").length} aguardando retorno`,
        accentTone: "#cc4f4f",
        icon: TrendingUp,
        iconTone: { background: "#fff1f1", color: "#d17a00" }
      }
    ],
    [metrics, rtData.courses, rtData.leads]
  );

  const highlightedCourses = useMemo(
    () =>
      (searchQuery ? searchedCourses : rtData.courses).slice(0, 4).map((course) => {
        const courseEnrollments = rtData.enrollments.filter((item) => item.courseId === course.id);
        const category = course.pathName ?? course.category ?? "Geral";
        const isDraft = course.status === "Em breve" || course.status === "Inativo";

        return {
          id: course.id,
          title: course.title,
          category,
          status: isDraft ? "Rascunho" : "Ativo",
          tone: isDraft ? "#d17a00" : "#2f8b4f",
          detail: `ID: #${course.id.replace(/\D/g, "").slice(-4) || course.id.slice(-4)}`,
          students: `${courseEnrollments.length} inscriç${courseEnrollments.length === 1 ? "ão" : "ões"}`
        };
      }),
    [searchQuery, searchedCourses, rtData.courses, rtData.enrollments]
  );

  return (
    <Stack gap="xl">
      <Box>
        <Title order={1} c="#0b4668" fw={800}>
          Visão Geral
        </Title>
      </Box>

      <SimpleGrid cols={{ base: 1, md: 2, xl: 4 }} spacing="lg">
        {kpis.map((metric) => {
          const Icon = metric.icon;

          return (
            <Paper key={metric.label} radius="xl" p="xl" withBorder shadow="xs">
              <Group justify="space-between" align="flex-start">
                <Text maw={140} size="0.9rem" fw={800} c="#303744">
                  {metric.label}
                </Text>
                <ThemeIcon
                  radius="md"
                  size={48}
                  variant="light"
                  style={{ background: metric.iconTone.background, color: metric.iconTone.color }}
                >
                  <Icon size={20} />
                </ThemeIcon>
              </Group>
              <Text mt="xl" fz="2.2rem" fw={800} c="#101828">
                {metric.value}
              </Text>
              <Text mt={6} fw={600} c={metric.accentTone}>
                {metric.accent}
              </Text>
              <Text mt={4} size="sm" c="#667085">
                {metric.helper}
              </Text>
            </Paper>
          );
        })}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="lg" verticalSpacing="lg" style={{ alignItems: "start" }}>
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Title order={2} c="#0b4668">
              Gerenciar Cursos
            </Title>
            <Group gap="sm">
              <Button color="rhGold" c="white" radius="xl" leftSection={<Download size={16} />} onClick={handleExportCourses} size="sm">
                Exportar CSV
              </Button>
              <Button color="rhGold" c="white" radius="xl" leftSection={<Users size={16} />}>
                Novo Cadastro
              </Button>
            </Group>
          </Group>

          <TextInput
            placeholder="Buscar por título ou categoria..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.currentTarget.value)}
            radius="lg"
            size="sm"
          />

          <Paper radius="xl" withBorder shadow="xs" style={{ overflow: "hidden" }}>
            <Table.ScrollContainer minWidth={720}>
              <Table verticalSpacing="lg" horizontalSpacing="xl">
                <Table.Thead bg="#f8fafc">
                  <Table.Tr>
                    <Table.Th>Título</Table.Th>
                    <Table.Th>Categoria</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th style={{ textAlign: "right" }}>Ações</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {highlightedCourses.map((course) => (
                    <Table.Tr key={course.id}>
                      <Table.Td>
                        <Text fw={700} c="#111827">
                          {course.title}
                        </Text>
                        <Text size="sm" c="#5f6876" mt={4}>
                          {course.detail}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge radius="xl" color="rhBlue" variant="light">
                          {course.category}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={4}>
                          <Group gap={8}>
                            <Box
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: 999,
                                background: course.tone
                              }}
                            />
                            <Text fw={600} c={course.tone}>
                              {course.status}
                            </Text>
                          </Group>
                          <Text size="sm" c="#667085">
                            {course.students}
                          </Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Group justify="flex-end" gap="xs">
                          <ActionIcon variant="subtle" color="dark" aria-label={`Editar ${course.title}`}>
                            <Pencil size={18} />
                          </ActionIcon>
                          <ActionIcon variant="subtle" color="red" aria-label={`Excluir ${course.title}`}>
                            <Trash2 size={18} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>

            <Group justify="space-between" px="xl" py="md">
              <Text size="sm" c="#5f6876">
                Mostrando {highlightedCourses.length} de {courses.length} cursos
              </Text>
              <Group gap="xs">
                <ActionIcon variant="default" aria-label="Página anterior">
                  <Text component="span">‹</Text>
                </ActionIcon>
                <ActionIcon variant="default" color="rhBlue" aria-label="Próxima página">
                  <Text component="span">›</Text>
                </ActionIcon>
              </Group>
            </Group>
          </Paper>
        </Stack>

        <Stack gap="md">
          <Title order={2} c="#0b4668">
            Atividades Recentes
          </Title>
          <Paper radius="xl" withBorder shadow="xs" p="lg">
            <Stack gap="lg">
              {activities.map((activity) => {
                const Icon = getActivityIcon(activity.kind);
                const tone = getActivityTone(activity.kind);

                return (
                  <Group key={activity.id} align="flex-start" wrap="nowrap">
                    <ThemeIcon radius="md" size={44} variant="light" style={{ background: tone.background, color: tone.color }}>
                      <Icon size={20} />
                    </ThemeIcon>
                    <Box>
                      <Text fw={500} lh={1.55} c="#111827">
                        {activity.description}
                      </Text>
                      <Text size="sm" c="#5f6876" mt={4}>
                        {formatRelativeTime(new Date(activity.timestamp).toISOString())}
                      </Text>
                    </Box>
                  </Group>
                );
              })}
            </Stack>
            <Button
              component={Link}
              to="/admin/leads"
              variant="subtle"
              color="rhBlue"
              mt="lg"
              px={0}
              rightSection={<ArrowRight size={16} />}
            >
              Ver todo o histórico
            </Button>
          </Paper>
        </Stack>
      </SimpleGrid>

      <Paper radius="xl" p="xl" shadow="sm" style={{ background: "#0b4668", color: "#ffffff" }}>
        <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="xl">
          <Stack gap="lg">
            <Box>
              <Title order={2} c="white">
                Relatório de Performance
              </Title>
              <Text mt="md" size="lg" c="rgba(255,255,255,0.82)" maw={760}>
                Analise o engajamento dos alunos por departamento e identifique as turmas com melhor aproveitamento do conteúdo.
              </Text>
            </Box>
            <Group>
              <Button color="rhGold" c="#5f4700" radius="md">
                Gerar Relatório PDF
              </Button>
              <Button variant="outline" color="gray" radius="md">
                Configurar Alertas
              </Button>
            </Group>
          </Stack>

          <SimpleGrid cols={2} spacing="md">
            {performanceStats.map((stat) => (
              <Paper
                key={stat.label}
                radius="lg"
                p="md"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <Text size="xs" fw={700} c="rgba(255,255,255,0.74)">
                  {stat.label}
                </Text>
                <Text mt="sm" fz="2rem" fw={800}>
                  {stat.value}
                </Text>
                <Divider my="sm" color="rgba(255,255,255,0.1)" />
                <Text size="sm" c="rgba(255,255,255,0.74)">
                  {stat.helper}
                </Text>
              </Paper>
            ))}
          </SimpleGrid>
        </SimpleGrid>
      </Paper>
    </Stack>
  );
}
