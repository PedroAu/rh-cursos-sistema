import { IconCalendarEvent, IconMapPin, IconPresentationAnalytics } from "@tabler/icons-react";
import { AdminAgendaCalendar } from "@/components/admin/admin-agenda-calendar";
import { AdminArchivedList } from "@/components/admin/admin-archived-list";
import { AdminTurmasCrud } from "@/components/admin/entities/admin-turmas-crud";
import { AdminListFilters } from "@/components/admin/admin-list-filters";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminPageIntro } from "@/components/admin/admin-page-intro";
import {
  getAdminAgenda,
  getAdminCourseOptions,
  getArchivedAdminEntities,
  getAdminInstructorOptions,
} from "@/lib/admin-data";
import { getSingleSearchParam } from "@/lib/pagination";
import { Container } from "@/components/layout/container";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminAgendaPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const filters = {
    query: getSingleSearchParam(params.query) ?? "",
    status: getSingleSearchParam(params.status) ?? "todos",
    format: getSingleSearchParam(params.format) ?? "todos",
    courseId: getSingleSearchParam(params.courseId) ?? "todos",
    instructorId: getSingleSearchParam(params.instructorId) ?? "todos",
    dateFrom: getSingleSearchParam(params.dateFrom) ?? "",
    dateTo: getSingleSearchParam(params.dateTo) ?? "",
  };
  const month =
    getSingleSearchParam(params.month) ?? new Date().toISOString().slice(0, 7);

  const [allRows, courseOptions, instructorOptions, archivedRows] = await Promise.all([
    getAdminAgenda(filters),
    getAdminCourseOptions(),
    getAdminInstructorOptions(),
    getArchivedAdminEntities(),
  ]);
  const openCount = allRows.filter((row) => row.status === "Aberta").length;
  const nextThirtyDaysCount = allRows.filter((row) => {
    const startDate = new Date(row.startDate);
    const today = new Date();
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + 30);
    return startDate >= today && startDate <= threshold;
  }).length;
  const criticalOccupancyCount = allRows.filter(
    (row) => row.seatsTotal > 0 && row.seatsFilled / row.seatsTotal >= 0.9,
  ).length;
  const withoutInstructorCount = allRows.filter((row) => !row.instructorId).length;

  return (
    <Container variant="admin" padded={false}>
      <div className="space-y-8">
        <AdminPageIntro
          badge="TURMAS"
          description="Organize turmas, datas, formatos, professores e disponibilidade com visão de calendário e lista operacional."
          title="Gestão de Turmas"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <AdminMetricCard detail="Próximos 30 dias" icon={<IconCalendarEvent size={18} />} label="Agenda próxima" value={nextThirtyDaysCount} />
          <AdminMetricCard detail="Matrículas abertas" icon={<IconPresentationAnalytics size={18} />} label="Turmas abertas" value={openCount} tone="gold" />
          <AdminMetricCard detail="90% ou mais ocupadas" icon={<IconMapPin size={18} />} label="Lotação crítica" value={criticalOccupancyCount} />
          <AdminMetricCard detail="Completar alocação" icon={<IconCalendarEvent size={18} />} label="Sem professor" value={withoutInstructorCount} />
        </div>
        <AdminListFilters
          formatOptions={[
            { value: "todos", label: "Todos" },
            { value: "Online", label: "Online" },
            { value: "Presencial", label: "Presencial" },
            { value: "Hibrido", label: "Híbrido" },
          ]}
          resetHref="/admin/agenda"
          searchPlaceholder="Buscar por curso, local, horário ou ID"
          statusOptions={[
            { value: "todos", label: "Todos" },
            { value: "Aberta", label: "Aberta" },
            { value: "Encerrada", label: "Encerrada" },
            { value: "Cancelada", label: "Cancelada" },
          ]}
          selectFilters={[
            {
              label: "Curso",
              name: "courseId",
              options: [{ value: "todos", label: "Todos" }, ...courseOptions],
            },
            {
              label: "Professor",
              name: "instructorId",
              options: [{ value: "todos", label: "Todos" }, ...instructorOptions],
            },
          ]}
          dateFilters={[
            { label: "Início de", name: "dateFrom" },
            { label: "Início até", name: "dateTo" },
          ]}
          values={filters}
        />
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <AdminTurmasCrud
              courseOptions={courseOptions}
              emptyLabel="Nenhuma turma corresponde aos filtros do período."
              instructorOptions={instructorOptions}
              rows={allRows}
            />
          </div>
          <aside>
            <AdminAgendaCalendar
              basePath="/admin/agenda"
              month={month}
              params={filters}
              rows={allRows}
            />
          </aside>
        </div>
        <AdminArchivedList rows={archivedRows} />
      </div>
    </Container>
  );
}
