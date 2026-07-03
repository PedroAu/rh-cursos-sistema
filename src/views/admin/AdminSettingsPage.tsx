"use client";

import { CheckCircle2, Globe, Mail, MessageCircle, Palette, Plus, Upload } from "lucide-react";
import type { ReactNode } from "react";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type AdminSettings,
  loadAdminSettings,
  saveAdminSettings
} from "@/features/admin/settings/model/admin-settings";
import { cn } from "@/lib/utils";

const notificationCopy: Record<keyof AdminSettings["notifications"], { title: string; description: string }> = {
  newEnrollments: {
    title: "Novas inscrições",
    description: "Alertar o administrador quando um novo aluno se inscrever em um curso."
  },
  confirmedPayments: {
    title: "Pagamentos confirmados",
    description: "Receber confirmação imediata de vendas aprovadas."
  },
  monthlyReports: {
    title: "Relatórios mensais",
    description: "Enviar resumo estatístico mensal para o e-mail cadastrado."
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
    <div className="space-y-8">
      <div className="max-w-3xl space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0b4668]">Painel de Configurações</h1>
        <p className="text-base leading-7 text-slate-600 md:text-lg">
          Gerencie a identidade, comunicações e acessos da plataforma RH Cursos.
        </p>
      </div>

      <Tabs defaultValue="gerais" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto rounded-2xl bg-slate-100 p-2">
          <TabsTrigger value="gerais">Configurações Gerais</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
          <TabsTrigger value="usuarios">Gerenciamento de Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="gerais" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <SectionCard>
              <div className="mb-6 flex items-start gap-4">
                <IconChip>
                  <Globe className="h-5 w-5" />
                </IconChip>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Identidade do Site</h2>
                </div>
              </div>
              <div className="space-y-4">
                <Input
                  label="Nome do Site"
                  value={settings.identity.siteName}
                  onChange={(event) => updateIdentity("siteName", event.currentTarget.value)}
                />
                <Input
                  label="Slogan Institucional"
                  value={settings.identity.tagline}
                  onChange={(event) => updateIdentity("tagline", event.currentTarget.value)}
                />
                <Input
                  label="E-mail de Contato Oficial"
                  type="email"
                  value={settings.identity.contactEmail}
                  onChange={(event) => updateIdentity("contactEmail", event.currentTarget.value)}
                />
              </div>
            </SectionCard>

            <div className="rounded-2xl bg-[#0b4668] p-8 text-white shadow-sm">
              <h2 className="text-xl font-semibold text-[#ffd573]">Resumo das Alterações</h2>
              <p className="mt-6 text-base leading-7 text-white/85">
                Suas alterações de identidade afetam como os alunos visualizam a marca nos certificados e e-mails automáticos.
              </p>
              <Button className="mt-8 w-full bg-[#ffd573] text-[#6a4b00] hover:bg-[#f3ca63]" onClick={handleSave}>
                Salvar Alterações
              </Button>
            </div>
          </div>

          <SectionCard>
            <div className="mb-6 flex items-start gap-4">
              <IconChip>
                <Palette className="h-5 w-5" />
              </IconChip>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Logotipo e Favicon</h2>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <LogoUpload
                label="Logo Principal"
                value={settings.identity.logo}
                fallback="RH"
                onChange={(value) => updateIdentity("logo", value)}
              />
              <LogoUpload
                label="Favicon"
                value={settings.identity.favicon}
                fallback="RH"
                onChange={(value) => updateIdentity("favicon", value)}
              />
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-6">
          <SectionCard>
            <h2 className="text-xl font-semibold text-slate-900">Preferências de Notificação</h2>
            <p className="mt-1 text-sm text-slate-500">
              Escolha quais eventos disparam alertas para o administrador.
            </p>

            <div className="mt-6">
              {(Object.keys(notificationCopy) as Array<keyof AdminSettings["notifications"]>).map((key, index) => (
                <NotificationRow
                  key={key}
                  title={notificationCopy[key].title}
                  description={notificationCopy[key].description}
                  checked={settings.notifications[key]}
                  first={index === 0}
                  onCheckedChange={(value) => toggleNotification(key, value)}
                />
              ))}
            </div>
          </SectionCard>

          <div className="flex justify-end">
            <Button onClick={handleSave}>Salvar Alterações</Button>
          </div>
        </TabsContent>

        <TabsContent value="integracoes">
          <div className="grid gap-6 lg:grid-cols-2">
            <IntegrationCard
              icon={MessageCircle}
              title="WhatsApp Business"
              description="API de atendimento e envio automático."
              body="Conecte sua conta do WhatsApp para enviar notificações de cursos e suporte em tempo real para seus alunos."
              footer={
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#2f8b4f]" />
                    <span className="text-sm font-medium text-[#2f8b4f]">
                      Conectado · último envio hoje, 10:45
                    </span>
                  </div>
                  <Button variant="outline">Gerenciar webhooks</Button>
                </>
              }
            />

            <IntegrationCard
              icon={Mail}
              title="E-mail Marketing"
              description="RD Station · Mailchimp · ActiveCampaign"
              body="Sincronize sua base de alunos com sua plataforma de marketing favorita para campanhas de remarketing."
              footer={
                <div className="space-y-3">
                  {["RD Station CRM", "Mailchimp"].map((provider) => (
                    <div key={provider} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <span className="font-medium text-slate-900">{provider}</span>
                      <Button variant="outline">Conectar</Button>
                    </div>
                  ))}
                </div>
              }
            />
          </div>
        </TabsContent>

        <TabsContent value="usuarios">
          <SectionCard>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Administradores do Sistema</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Acessos com permissão de gestão da plataforma.
                </p>
              </div>
              <Button className="rounded-full bg-[#d39b10] hover:bg-[#ba870d]">
                <Plus className="h-4 w-4" />
                Novo Admin
              </Button>
            </div>

            <Table className="min-w-[640px]">
              <TableHeader className="bg-slate-50">
                <TableRow className="hover:bg-slate-50">
                  <TableHead>Administrador</TableHead>
                  <TableHead>Permissão</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.admins.map((admin) => (
                  <TableRow key={admin.email}>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-900">{admin.name}</div>
                        <div className="text-sm text-slate-500">{admin.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-900">{admin.role}</TableCell>
                    <TableCell>
                      <Badge variant={admin.active ? "success" : "danger"}>
                        {admin.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SectionCard({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-3xl border border-slate-200 bg-white p-8 shadow-sm", className)}>{children}</section>;
}

function IconChip({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8f1f6] text-[#0b4668]">
      {children}
    </div>
  );
}

function IntegrationCard({
  icon: Icon,
  title,
  description,
  body,
  footer
}: {
  icon: typeof Globe;
  title: string;
  description: string;
  body: string;
  footer: ReactNode;
}) {
  return (
    <SectionCard>
      <div className="flex items-start gap-4">
        <IconChip>
          <Icon className="h-5 w-5" />
        </IconChip>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-600">{body}</p>
      <div className="mt-6 space-y-4">{footer}</div>
    </SectionCard>
  );
}

function NotificationRow({
  title,
  description,
  checked,
  first,
  onCheckedChange
}: {
  title: string;
  description: string;
  checked: boolean;
  first: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const labelId = useId();
  const descId = useId();

  return (
    <div className={cn("flex flex-col gap-4 py-5 sm:flex-row sm:items-start sm:justify-between", !first && "border-t border-slate-200")}>
      <div className="max-w-2xl">
        <p id={labelId} className="font-semibold text-slate-900">
          {title}
        </p>
        <p id={descId} className="mt-1 text-sm leading-7 text-slate-500">
          {description}
        </p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-labelledby={labelId} aria-describedby={descId} />
    </div>
  );
}

function LogoUpload({
  label,
  value,
  fallback,
  onChange
}: {
  label: string;
  value: string | null;
  fallback: string;
  onChange: (value: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-3xl border border-dashed border-slate-300 p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          role="img"
          aria-label={`Pré-visualização de ${label}`}
          className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-2xl bg-[#0b4668] text-[1.6rem] font-extrabold text-white"
          style={{
            backgroundColor: value ? "#ffffff" : "#0b4668",
            backgroundImage: value ? `url(${value})` : undefined,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain"
          }}
        >
          {value ? null : fallback}
        </div>

        <div className="space-y-1">
          <p className="font-semibold text-[#0b4668]">{label}</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            aria-label={`Selecionar arquivo para ${label}`}
            className="hidden"
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
          <Button variant="ghost" type="button" onClick={() => inputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Alterar {label}
          </Button>
        </div>
      </div>
    </div>
  );
}
