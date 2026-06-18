import { IconMessageCircle2, IconProgressCheck, IconSparkles } from "@tabler/icons-react";
import { AdminLeadsCrud } from "@/components/admin/entities/admin-leads-crud";
import { AdminListFilters } from "@/components/admin/admin-list-filters";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminPageIntro } from "@/components/admin/admin-page-intro";
import { getAdminCourseOptions, getAdminLeads } from "@/lib/admin-data";
import { getSingleSearchParam } from "@/lib/pagination";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminLeadsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const filters = {
    query: getSingleSearchParam(params.query) ?? "",
    status: getSingleSearchParam(params.status) ?? "todos",
    type: getSingleSearchParam(params.type) ?? "todos",
    courseId: getSingleSearchParam(params.courseId) ?? "todos",
    source: getSingleSearchParam(params.source) ?? "todos",
    dateFrom: getSingleSearchParam(params.dateFrom) ?? "",
    dateTo: getSingleSearchParam(params.dateTo) ?? "",
  };
  const [allRows, courseOptions] = await Promise.all([
    getAdminLeads(filters),
    getAdminCourseOptions(),
  ]);
  const newCount = allRows.filter((row) => row.crmStatus === "Novo").length;
  const activeCount = allRows.filter((row) => row.crmStatus !== "Convertido").length;
  const convertedCount = allRows.filter((row) => row.crmStatus === "Convertido").length;
  const recentCount = allRows.filter((row) => {
    const createdAt = new Date(row.createdAt);
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 7);
    return createdAt >= threshold;
  }).length;
  const exportHref = `/admin/leads/export?${new URLSearchParams(
    Object.entries(filters).filter(([, value]) => value),
  ).toString()}`;

  return (
    <div className="mx-auto w-full max-w-admin">
      <div className="space-y-8">
        <AdminPageIntro
          badge="LEADS"
          description="Acompanhe os contatos dos formulários públicos, priorize retornos e atualize o status comercial."
          title="Fila comercial e consultiva"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <AdminMetricCard detail="Base comercial" icon={<IconMessageCircle2 size={18} />} label="Leads totais" value={allRows.length} />
          <AdminMetricCard detail="Últimos 7 dias" icon={<IconSparkles size={18} />} label="Leads recentes" value={recentCount} tone="gold" />
          <AdminMetricCard detail="Não convertidos" icon={<IconProgressCheck size={18} />} label="Em acompanhamento" value={activeCount} />
          <AdminMetricCard detail={`${newCount} aguardam triagem`} icon={<IconMessageCircle2 size={18} />} label="Convertidos" value={convertedCount} />
        </div>
        <AdminListFilters
          resetHref="/admin/leads"
          searchPlaceholder="Buscar por nome, e-mail, telefone, origem ou interesse"
          statusOptions={[
            { value: "todos", label: "Todos" },
            { value: "Novo", label: "Novo" },
            { value: "Convertido", label: "Convertido" },
          ]}
          typeOptions={[
            { value: "todos", label: "Todos" },
            { value: "Contato", label: "Contato" },
            { value: "Inscricao", label: "Inscricao" },
            { value: "In Company", label: "In Company" },
            { value: "Especialista", label: "Especialista" },
          ]}
          selectFilters={[
            {
              label: "Curso",
              name: "courseId",
              options: [{ value: "todos", label: "Todos" }, ...courseOptions],
            },
            {
              label: "Origem",
              name: "source",
              options: [
                { value: "todos", label: "Todas" },
                { value: "Site", label: "Site" },
                { value: "Google", label: "Google" },
                { value: "Instagram", label: "Instagram" },
                { value: "LinkedIn", label: "LinkedIn" },
                { value: "WhatsApp", label: "WhatsApp" },
              ],
            },
          ]}
          dateFilters={[
            { label: "De", name: "dateFrom" },
            { label: "Até", name: "dateTo" },
          ]}
          values={filters}
        />
        <AdminLeadsCrud
          courseOptions={courseOptions}
          emptyLabel="Nenhum lead corresponde aos filtros selecionados."
          exportHref={exportHref}
          rows={allRows}
        />
      </div>
    </div>
  );
}
