import { IconId, IconUserCheck, IconUsers, IconUserX } from "@tabler/icons-react";
import { AdminArchivedList } from "@/components/admin/admin-archived-list";
import { AdminListFilters } from "@/components/admin/admin-list-filters";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminPageIntro } from "@/components/admin/admin-page-intro";
import { AdminAlunosCrud } from "@/components/admin/entities/admin-alunos-crud";
import { getAdminAlunos, getArchivedAdminEntities } from "@/lib/admin-data";
import { getSingleSearchParam } from "@/lib/pagination";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminAlunosPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const filters = {
    query: getSingleSearchParam(params.query) ?? "",
    type: getSingleSearchParam(params.type) ?? "todos",
    ...(getSingleSearchParam(params.access)
      ? { access: getSingleSearchParam(params.access) }
      : {}),
    ...(getSingleSearchParam(params.completeness)
      ? { completeness: getSingleSearchParam(params.completeness) }
      : {}),
  };
  const [allRows, archivedRows] = await Promise.all([
    getAdminAlunos(filters),
    getArchivedAdminEntities(),
  ]);
  const pfCount = allRows.filter((row) => row.studentType === "PF").length;
  const pjCount = allRows.filter((row) => row.studentType === "PJ").length;
  const linkedCount = allRows.filter((row) => row.userId.length > 0).length;
  const incompleteCount = allRows.filter((row) => !row.cpf || !row.phone).length;

  return (
    <div className="mx-auto w-full max-w-admin">
      <div className="space-y-8">
        <AdminPageIntro
          badge="ALUNOS"
          description="Gerencie os cadastros de alunos vinculados a inscrições, certificados e acesso ao portal."
          title="Gestão de alunos"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <AdminMetricCard detail="Base ativa" icon={<IconUsers size={18} />} label="Total de alunos" value={allRows.length} />
          <AdminMetricCard detail="Pessoa física" icon={<IconId size={18} />} label="PF" value={pfCount} tone="gold" />
          <AdminMetricCard detail="Pessoa jurídica" icon={<IconUserCheck size={18} />} label="PJ" value={pjCount} />
          <AdminMetricCard detail={`${linkedCount} com Auth`} icon={<IconUserX size={18} />} label="Cadastro incompleto" negative value={incompleteCount} />
        </div>
        <AdminListFilters
          resetHref="/admin/alunos"
          searchPlaceholder="Buscar por nome, e-mail, CPF, telefone ou órgão"
          typeOptions={[
            { value: "todos", label: "Todos" },
            { value: "PF", label: "PF" },
            { value: "PJ", label: "PJ" },
          ]}
          selectFilters={[
            {
              label: "Acesso",
              name: "access",
              options: [
                { value: "todos", label: "Todos" },
                { value: "com-acesso", label: "Com acesso" },
                { value: "sem-acesso", label: "Sem acesso" },
              ],
            },
            {
              label: "Cadastro",
              name: "completeness",
              options: [
                { value: "todos", label: "Todos" },
                { value: "incompleto", label: "Incompleto" },
              ],
            },
          ]}
          values={filters}
        />
        <AdminAlunosCrud
          emptyLabel="Nenhum aluno corresponde aos filtros atuais."
          rows={allRows}
        />
        <AdminArchivedList rows={archivedRows} />
      </div>
    </div>
  );
}
