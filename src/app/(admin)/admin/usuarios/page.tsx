import { IconShieldCheck, IconUserCircle, IconUserOff, IconUsers } from "@tabler/icons-react";
import { AdminUsersCrud } from "@/components/admin/entities/admin-users-crud";
import { AdminListFilters } from "@/components/admin/admin-list-filters";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminPageIntro } from "@/components/admin/admin-page-intro";
import { getAdminUsers } from "@/lib/admin-data";
import { getSingleSearchParam } from "@/lib/pagination";
import { Container } from "@/components/layout/container";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const filters = {
    query: getSingleSearchParam(params.query) ?? "",
    status: getSingleSearchParam(params.status) ?? "todos",
    role: getSingleSearchParam(params.role) ?? "todos",
  };
  const allRows = await getAdminUsers(filters);
  const activeCount = allRows.filter((row) => row.status === "ativo").length;
  const adminCount = allRows.filter((row) => row.role === "admin").length;
  const pendingCount = allRows.filter((row) => row.status === "pendente").length;

  return (
    <Container variant="admin" padded={false}>
      <div className="space-y-8">
        <AdminPageIntro
          badge="USUÁRIOS"
          description="Administre alunos, professores e administradores com leitura rápida de status e permissões."
          title="Gestão de Cadastros"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <AdminMetricCard detail="+12% este mês" icon={<IconUsers size={18} />} label="Total de usuários" value={allRows.length} />
          <AdminMetricCard detail="Base validada" icon={<IconUserCircle size={18} />} label="Ativos" value={activeCount} tone="gold" />
          <AdminMetricCard detail="Acesso restrito" icon={<IconShieldCheck size={18} />} label="Admins" value={adminCount} />
          <AdminMetricCard detail="Aguardam confirmação" icon={<IconUserOff size={18} />} label="Pendentes" negative value={pendingCount} />
        </div>
        <AdminListFilters
          resetHref="/admin/usuarios"
          roleOptions={[
            { value: "todos", label: "Todos" },
            { value: "admin", label: "Admin" },
            { value: "professor", label: "Professor" },
            { value: "aluno", label: "Aluno" },
          ]}
          searchPlaceholder="Filtrar por e-mail, perfil ou status"
          statusOptions={[
            { value: "todos", label: "Todos" },
            { value: "ativo", label: "Ativo" },
            { value: "pendente", label: "Pendente" },
            { value: "inativo", label: "Inativo" },
          ]}
          values={filters}
        />
        <AdminUsersCrud
          emptyLabel="Nenhum usuário corresponde aos filtros atuais."
          rows={allRows}
        />
      </div>
    </Container>
  );
}
