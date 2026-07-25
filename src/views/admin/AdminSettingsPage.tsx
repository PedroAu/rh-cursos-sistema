"use client";

import { Bell, Building2, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import {
  type AdminSettings,
  loadAdminSettings,
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
  const settings = useMemo<AdminSettings>(() => loadAdminSettings(), []);

  return (
    <div className="mx-auto max-w-[1440px] space-y-7">
      <header>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-tk-accent-strong">Administração</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-tk-brand md:text-4xl">Configurações</h1>
          <p className="mt-2 text-base text-tk-ink-muted">Preferências institucionais e notificações são informativas neste painel.</p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <SettingsCard
          icon={<Building2 className="h-5 w-5" />}
          title="Dados da empresa"
          description="Informações institucionais exibidas nos canais da RH Cursos."
          className="xl:row-span-2"
        >
          <p className="rounded-2xl bg-tk-surface-2 px-4 py-3 text-sm leading-6 text-tk-ink-muted">
            A identidade institucional é mantida pelo catálogo e pela configuração de implantação. Não há edição local persistente neste painel.
          </p>
        </SettingsCard>

        <SettingsCard
          icon={<Bell className="h-5 w-5" />}
          title="Notificações"
          description="Escolha quais atualizações devem gerar alertas."
        >
          <div className="divide-y divide-tk-line">
            {(Object.keys(notificationCopy) as Array<keyof AdminSettings["notifications"]>).map((key) => (
              <div key={key} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <span>
                  <span className="block font-semibold text-tk-ink">{notificationCopy[key].title}</span>
                  <span className="mt-1 block text-sm leading-6 text-tk-ink-muted">{notificationCopy[key].description}</span>
                </span>
                <span className="rounded-full bg-tk-surface-2 px-3 py-1 text-xs font-semibold text-tk-ink-muted">Informativo</span>
              </div>
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
