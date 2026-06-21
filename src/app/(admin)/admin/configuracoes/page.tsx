import { AdminPageIntro } from "@/components/admin/admin-page-intro";
import { AdminSettingsForm } from "@/components/forms/admin-settings-form";
import { readAdminSettings } from "@/lib/admin-settings";
import { Container } from "@/components/layout/container";

export default async function AdminSettingsPage() {
  const settings = await readAdminSettings();

  return (
    <Container variant="admin" padded={false}>
      <div className="space-y-8">
        <AdminPageIntro
          badge="CONFIGURAÇÕES"
          title="Painel de Configurações"
          description="Gerencie identidade, comunicações e integrações operacionais da plataforma RH Cursos."
        />
        <AdminSettingsForm settings={settings} />
      </div>
    </Container>
  );
}
