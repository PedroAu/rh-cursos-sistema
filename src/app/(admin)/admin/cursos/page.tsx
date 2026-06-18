import { IconBook2, IconCalendarEvent, IconChartHistogram } from "@tabler/icons-react";
import { AdminArchivedList } from "@/components/admin/admin-archived-list";
import { AdminCoursesCrud } from "@/components/admin/entities/admin-courses-crud";
import { AdminListFilters } from "@/components/admin/admin-list-filters";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminPageIntro } from "@/components/admin/admin-page-intro";
import { getAdminCourses, getArchivedAdminEntities } from "@/lib/admin-data";
import { getSingleSearchParam } from "@/lib/pagination";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminCoursesPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const filters = {
    query: getSingleSearchParam(params.query) ?? "",
    courseStatus: getSingleSearchParam(params.courseStatus) ?? "todos",
    classStatus: getSingleSearchParam(params.classStatus) ?? "todos",
    format: getSingleSearchParam(params.format) ?? "todos",
    classFormat: getSingleSearchParam(params.classFormat) ?? "todos",
    category: getSingleSearchParam(params.category) ?? "todos",
  };
  const [allRows, archivedRows] = await Promise.all([
    getAdminCourses(filters),
    getArchivedAdminEntities(),
  ]);
  const publishedCount = allRows.filter((row) => row.courseStatus !== "Rascunho").length;
  const draftCount = allRows.filter((row) => row.courseStatus === "Rascunho").length;
  const withoutClassCount = allRows.filter((row) => row.seatsLabel === "Sem turmas vinculadas").length;
  const recentCount = allRows.filter((row) => {
    const updatedAt = new Date(row.updatedAt);
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 30);
    return updatedAt >= threshold;
  }).length;
  const categoryOptions = Array.from(new Set(allRows.map((row) => row.category))).sort();

  return (
    <div className="mx-auto w-full max-w-admin">
      <div className="space-y-8">
        <AdminPageIntro
          badge="CURSOS"
          description="Administre o catálogo educacional, preços, formatos e status de publicação dos cursos."
          title="Gestão de Cursos"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <AdminMetricCard detail="Fora de rascunho" icon={<IconBook2 size={18} />} label="Cursos publicados" value={publishedCount} />
          <AdminMetricCard detail="Revisar antes de divulgar" icon={<IconCalendarEvent size={18} />} label="Rascunhos" value={draftCount} tone="gold" />
          <AdminMetricCard detail="Sem agenda ativa" icon={<IconChartHistogram size={18} />} label="Sem turma" value={withoutClassCount} />
          <AdminMetricCard detail="Últimos 30 dias" icon={<IconBook2 size={18} />} label="Atualizados" value={recentCount} />
        </div>
        <AdminListFilters
          formatOptions={[
            { value: "todos", label: "Todos" },
            { value: "Online", label: "Online" },
            { value: "Presencial", label: "Presencial" },
            { value: "Hibrido", label: "Híbrido" },
          ]}
          resetHref="/admin/cursos"
          searchPlaceholder="Buscar por curso, slug, categoria ou formato"
          selectFilters={[
            {
              label: "Status do curso",
              name: "courseStatus",
              options: [
                { value: "todos", label: "Todos" },
                { value: "Ativo", label: "Ativo" },
                { value: "Rascunho", label: "Rascunho" },
                { value: "Inativo", label: "Inativo" },
              ],
            },
            {
              label: "Status da turma",
              name: "classStatus",
              options: [
                { value: "todos", label: "Todos" },
                { value: "Aberta", label: "Aberta" },
                { value: "Encerrada", label: "Encerrada" },
                { value: "Cancelada", label: "Cancelada" },
              ],
            },
            {
              label: "Modalidade da turma",
              name: "classFormat",
              options: [
                { value: "todos", label: "Todas" },
                { value: "Online", label: "Online" },
                { value: "Presencial", label: "Presencial" },
                { value: "Hibrido", label: "Híbrido" },
              ],
            },
            {
              label: "Categoria",
              name: "category",
              options: [
                { value: "todos", label: "Todas" },
                ...categoryOptions.map((category) => ({ value: category, label: category })),
              ],
            },
          ]}
          values={filters}
        />
        <AdminCoursesCrud
          emptyLabel="Nenhum curso corresponde aos filtros atuais."
          rows={allRows}
        />
        <AdminArchivedList rows={archivedRows} />
      </div>
    </div>
  );
}
