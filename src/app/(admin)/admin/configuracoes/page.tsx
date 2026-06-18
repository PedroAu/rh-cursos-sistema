import { AdminPageIntro } from "@/components/admin/admin-page-intro";
import { AdminSettingsForm } from "@/components/forms/admin-settings-form";
import { readAdminSettings } from "@/lib/admin-settings";

export default async function AdminSettingsPage() {
  const settings = await readAdminSettings();

  return (
    <div className="mx-auto w-full max-w-admin">
      <div className="space-y-8">
        <AdminPageIntro
          badge="CONFIGURAÇÕES"
          title="Painel de Configurações"
          description="Gerencie identidade, comunicações e integrações operacionais da plataforma RH Cursos."
        />
        <AdminSettingsForm settings={settings} />
      </div>
    </div>
  );
}
