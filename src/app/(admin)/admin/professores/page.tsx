import { IconBriefcase2, IconSchool, IconUserStar } from "@tabler/icons-react";
import { AdminArchivedList } from "@/components/admin/admin-archived-list";
import { AdminInstructorsCrud } from "@/components/admin/entities/admin-instructors-crud";
import { AdminListFilters } from "@/components/admin/admin-list-filters";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminPageIntro } from "@/components/admin/admin-page-intro";
import { getAdminInstructors, getArchivedAdminEntities } from "@/lib/admin-data";
import { getSingleSearchParam } from "@/lib/pagination";
import { Container } from "@/components/layout/container";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminTeachersPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const filters = {
    query: getSingleSearchParam(params.query) ?? "",
    status: getSingleSearchParam(params.status) ?? "todos",
    area: getSingleSearchParam(params.area) ?? "todos",
    allocation: getSingleSearchParam(params.allocation) ?? "todos",
  };
  const [allRows, archivedRows] = await Promise.all([
    getAdminInstructors(filters),
    getArchivedAdminEntities(),
  ]);
  const activeCount = allRows.filter((row) => row.status === "Ativo").length;
  const allocatedCount = allRows.filter((row) => row.turmaCount > 0).length;
  const withoutClassCount = allRows.filter((row) => row.turmaCount === 0).length;
  const incompleteCount = allRows.filter(
    (row) => row.email === "-" || row.specialty === "Não informado",
  ).length;
  const areaOptions = Array.from(new Set(allRows.flatMap((row) => row.areas))).sort();

  return (
    <Container variant="admin" padded={false}>
      <div className="space-y-8">
        <AdminPageIntro
          badge="PROFESSORES"
          description="Cadastre especialistas, monitore vínculos com turmas e mantenha a base de professores atualizada."
          title="Gestão de instrutores"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <AdminMetricCard detail="Base docente" icon={<IconUserStar size={18} />} label="Instrutores ativos" value={activeCount} />
          <AdminMetricCard detail="Com agenda" icon={<IconSchool size={18} />} label="Com turma vinculada" value={allocatedCount} tone="gold" />
          <AdminMetricCard detail="Disponíveis para agenda" icon={<IconBriefcase2 size={18} />} label="Sem turma" value={withoutClassCount} />
          <AdminMetricCard detail="Revisar dados essenciais" icon={<IconUserStar size={18} />} label="Cadastro incompleto" value={incompleteCount} />
        </div>
        <AdminListFilters
          resetHref="/admin/professores"
          searchPlaceholder="Buscar por nome, e-mail ou especialidade"
          statusOptions={[
            { value: "todos", label: "Todos" },
            { value: "Ativo", label: "Ativo" },
            { value: "Inativo", label: "Inativo" },
          ]}
          selectFilters={[
            {
              label: "Área",
              name: "area",
              options: [
                { value: "todos", label: "Todas" },
                ...areaOptions.map((area) => ({ value: area, label: area })),
              ],
            },
            {
              label: "Alocação",
              name: "allocation",
              options: [
                { value: "todos", label: "Todas" },
                { value: "com-turma", label: "Com turma" },
                { value: "sem-turma", label: "Sem turma" },
              ],
            },
          ]}
          values={filters}
        />
        <AdminInstructorsCrud
          emptyLabel="Nenhum instrutor corresponde aos filtros atuais."
          rows={allRows}
        />
        <AdminArchivedList rows={archivedRows} />
      </div>
    </Container>
  );
}
