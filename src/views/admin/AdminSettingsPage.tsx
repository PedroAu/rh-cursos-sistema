"use client";

import { Bell, Building2, Save, ShieldCheck, Upload } from "lucide-react";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  type AdminSettings,
  loadAdminSettings,
  saveAdminSettings
} from "@/features/admin/settings/model/admin-settings";
import { cn } from "@/lib/utils";

const notificationCopy: Record<keyof AdminSettings["notifications"], { title: string; description: string }> = {
  newEnrollments: {
    title: "Novas inscrições",
    description: "Receber um alerta quando uma nova inscrição for registrada."
  },
  confirmedPayments: {
    title: "Pagamentos confirmados",
    description: "Receber a confirmação de pagamentos aprovados."
  },
  monthlyReports: {
    title: "Relatório mensal",
    description: "Receber por e-mail um resumo mensal da operação."
  }
};

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>(() => loadAdminSettings());

  function updateIdentity<K extends keyof AdminSettings["identity"]>(key: K, value: AdminSettings["identity"][K]) {
    setSettings((current) => ({ ...current, identity: { ...current.identity, [key]: value } }));
  }

  function toggleNotification(key: keyof AdminSettings["notifications"], value: boolean) {
    setSettings((current) => ({ ...current, notifications: { ...current.notifications, [key]: value } }));
  }

  function handleSave() {
    saveAdminSettings(settings);
    toast.success("Configurações salvas localmente.");
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-tk-accent-strong">Administração</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-tk-brand md:text-4xl">Configurações</h1>
          <p className="mt-2 text-base text-tk-ink-muted">Gerencie os dados e as preferências do painel.</p>
        </div>
        <Button onClick={handleSave} className="sm:self-center">
          <Save className="h-4 w-4" />
          Salvar alterações
        </Button>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <SettingsCard
          icon={<Building2 className="h-5 w-5" />}
          title="Dados da empresa"
          description="Informações institucionais exibidas nos canais da RH Cursos."
          className="xl:row-span-2"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Nome da empresa"
                value={settings.identity.siteName}
                onChange={(event) => updateIdentity("siteName", event.currentTarget.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Descrição institucional"
                value={settings.identity.tagline}
                onChange={(event) => updateIdentity("tagline", event.currentTarget.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="E-mail de contato"
                type="email"
                value={settings.identity.contactEmail}
                onChange={(event) => updateIdentity("contactEmail", event.currentTarget.value)}
              />
            </div>
          </div>
          <div className="mt-6 border-t border-tk-line pt-6">
            <LogoUpload value={settings.identity.logo} onChange={(value) => updateIdentity("logo", value)} />
          </div>
        </SettingsCard>

        <SettingsCard
          icon={<Bell className="h-5 w-5" />}
          title="Notificações"
          description="Escolha quais atualizações devem gerar alertas."
        >
          <div className="divide-y divide-tk-line">
            {(Object.keys(notificationCopy) as Array<keyof AdminSettings["notifications"]>).map((key) => (
              <label key={key} className="flex cursor-pointer items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <span>
                  <span className="block font-semibold text-tk-ink">{notificationCopy[key].title}</span>
                  <span className="mt-1 block text-sm leading-6 text-tk-ink-muted">{notificationCopy[key].description}</span>
                </span>
                <Switch
                  checked={settings.notifications[key]}
                  onCheckedChange={(value) => toggleNotification(key, value)}
                  aria-label={notificationCopy[key].title}
                />
              </label>
            ))}
          </div>
        </SettingsCard>

        <SettingsCard
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Equipe de acesso"
          description="Pessoas com acesso administrativo atualmente registrado."
        >
          <ul className="divide-y divide-tk-line" aria-label="Equipe de acesso">
            {settings.admins.map((admin) => (
              <li key={admin.email} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-tk-ink">{admin.name}</p>
                  <p className="truncate text-sm text-tk-ink-muted">{admin.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-medium text-tk-ink-muted">{admin.role}</span>
                  <Badge variant={admin.active ? "success" : "danger"}>{admin.active ? "Ativo" : "Inativo"}</Badge>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-5 rounded-2xl bg-tk-surface-2 px-4 py-3 text-sm leading-6 text-tk-ink-muted">
            A gestão de permissões não está disponível neste painel.
          </p>
        </SettingsCard>
      </div>
    </div>
  );
}

function SettingsCard({ icon, title, description, children, className }: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-3xl border border-tk-line bg-tk-surface p-6 shadow-tk-card md:p-8", className)}>
      <div className="mb-6 flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-tk-accent-soft text-tk-brand">{icon}</span>
        <div>
          <h2 className="text-xl font-bold text-tk-ink">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-tk-ink-muted">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function LogoUpload({ value, onChange }: { value: string | null; onChange: (value: string | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div
          role="img"
          aria-label="Pré-visualização do logotipo"
          className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-tk-brand font-extrabold text-white"
          style={{
            backgroundColor: value ? "var(--tk-surface)" : "var(--tk-brand)",
            backgroundImage: value ? `url(${value})` : undefined,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain"
          }}
        >
          {value ? null : "RH"}
        </div>
        <div>
          <p className="font-semibold text-tk-ink">Logotipo</p>
          <p className="text-sm text-tk-ink-muted">Imagem usada na identificação da empresa.</p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        aria-label="Selecionar logotipo"
        className="sr-only"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === "string") onChange(reader.result);
          };
          reader.readAsDataURL(file);
        }}
      />
      <Button variant="outline" type="button" onClick={() => inputRef.current?.click()}>
        <Upload className="h-4 w-4" />
        Alterar logo
      </Button>
    </div>
  );
}
