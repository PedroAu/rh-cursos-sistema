"use client";

import { CheckCircle2, Globe, Mail, MessageCircle, Palette, Plus, UserCog } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCell } from "@/components/admin/user-cell";
import {
  type AdminSettings,
  loadAdminSettings,
  saveAdminSettings,
} from "@/features/admin/settings/model/admin-settings";

const notificationCopy: Record<keyof AdminSettings["notifications"], { title: string; description: string }> = {
  newEnrollments: {
    title: "Novas inscrições",
    description: "Alertar o administrador quando um novo aluno se inscrever em um curso.",
  },
  confirmedPayments: {
    title: "Pagamentos confirmados",
    description: "Receber confirmação imediata de vendas aprovadas.",
  },
  monthlyReports: {
    title: "Relatórios mensais",
    description: "Enviar resumo estatístico mensal para o e-mail cadastrado.",
  },
};

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>(() => loadAdminSettings());
  const identityHeadingId = useId();

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
    <section className="page-section">
      <div className="container space-y-6">
        <div className="space-y-2">
          <span className="eyebrow">Configurações</span>
          <h1 className="text-4xl font-semibold">Painel de configurações</h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            Gerencie a identidade, comunicações e acessos da plataforma RH Cursos.
          </p>
        </div>

        <Tabs defaultValue="gerais" className="space-y-6">
          <TabsList>
            <TabsTrigger value="gerais">Configurações gerais</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="integracoes">Integrações</TabsTrigger>
            <TabsTrigger value="usuarios">Gerenciamento de usuários</TabsTrigger>
          </TabsList>

          {/* Configurações gerais */}
          <TabsContent value="gerais" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-3">
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="size-5 text-primary" aria-hidden="true" />
                    Identidade do site
                  </CardTitle>
                  <CardDescription>Nome, slogan e e-mail oficial exibidos aos alunos.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4" aria-labelledby={identityHeadingId}>
                  <FormField label="Nome do site">
                    {({ fieldId }) => (
                      <Input
                        id={fieldId}
                        value={settings.identity.siteName}
                        onChange={(event) => updateIdentity("siteName", event.target.value)}
                      />
                    )}
                  </FormField>
                  <FormField label="Slogan institucional">
                    {({ fieldId }) => (
                      <Input
                        id={fieldId}
                        value={settings.identity.tagline}
                        onChange={(event) => updateIdentity("tagline", event.target.value)}
                      />
                    )}
                  </FormField>
                  <FormField label="E-mail de contato oficial">
                    {({ fieldId }) => (
                      <Input
                        id={fieldId}
                        type="email"
                        value={settings.identity.contactEmail}
                        onChange={(event) => updateIdentity("contactEmail", event.target.value)}
                      />
                    )}
                  </FormField>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="size-5 text-primary" aria-hidden="true" />
                    Logotipo e favicon
                  </CardTitle>
                  <CardDescription>Imagens da marca usadas no site, certificados e e-mails.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <LogoUpload
                    label="Logo principal"
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
                </CardContent>
              </Card>
            </div>

            <Card accent="top">
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-2xl space-y-1">
                  <p className="text-sm font-semibold text-foreground">Resumo das alterações</p>
                  <p className="text-sm leading-6 text-label-secondary">
                    Suas alterações de identidade afetam como os alunos visualizam a marca nos certificados e e-mails
                    automáticos.
                  </p>
                </div>
                <Button onClick={handleSave}>Salvar alterações</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notificações */}
          <TabsContent value="notificacoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de notificação</CardTitle>
                <CardDescription>Escolha quais eventos disparam alertas para o administrador.</CardDescription>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                {(Object.keys(notificationCopy) as Array<keyof AdminSettings["notifications"]>).map((key) => (
                  <NotificationRow
                    key={key}
                    title={notificationCopy[key].title}
                    description={notificationCopy[key].description}
                    checked={settings.notifications[key]}
                    onCheckedChange={(value) => toggleNotification(key, value)}
                  />
                ))}
              </CardContent>
            </Card>
            <div className="flex justify-end">
              <Button onClick={handleSave}>Salvar alterações</Button>
            </div>
          </TabsContent>

          {/* Integrações */}
          <TabsContent value="integracoes" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="size-5 text-primary" aria-hidden="true" />
                    WhatsApp Business
                  </CardTitle>
                  <CardDescription>API de atendimento e envio automático.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-6 text-label-secondary">
                    Conecte sua conta do WhatsApp para enviar notificações de cursos e suporte em tempo real para seus
                    alunos.
                  </p>
                  <p className="flex items-center gap-2 text-sm font-medium text-success">
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                    Conectado · último envio hoje, 10:45
                  </p>
                  <Button variant="outline">Gerenciar webhooks</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="size-5 text-primary" aria-hidden="true" />
                    E-mail marketing
                  </CardTitle>
                  <CardDescription>RD Station · Mailchimp · ActiveCampaign</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-6 text-label-secondary">
                    Sincronize sua base de alunos com sua plataforma de marketing favorita para campanhas de
                    remarketing.
                  </p>
                  <div className="space-y-2">
                    {["RD Station CRM", "Mailchimp"].map((provider) => (
                      <div
                        key={provider}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
                      >
                        <span className="text-sm font-medium text-foreground">{provider}</span>
                        <Button variant="outline" size="sm">
                          Conectar
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Usuários */}
          <TabsContent value="usuarios" className="space-y-6">
            <Card>
              <CardHeader className="flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <UserCog className="size-5 text-primary" aria-hidden="true" />
                    Administradores do sistema
                  </CardTitle>
                  <CardDescription>Acessos com permissão de gestão da plataforma.</CardDescription>
                </div>
                <Button>
                  <Plus className="size-4" aria-hidden="true" />
                  Novo admin
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-label-secondary">
                        <th scope="col" className="px-3 py-2 font-semibold">Administrador</th>
                        <th scope="col" className="px-3 py-2 font-semibold">Permissão</th>
                        <th scope="col" className="px-3 py-2 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settings.admins.map((admin) => (
                        <tr key={admin.email} className="border-b border-border last:border-0">
                          <td className="px-3 py-3">
                            <UserCell name={admin.name} email={admin.email} />
                          </td>
                          <td className="px-3 py-3 text-foreground">{admin.role}</td>
                          <td className="px-3 py-3">
                            <Badge variant={admin.active ? "success" : "danger"}>
                              {admin.active ? "Ativo" : "Inativo"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function NotificationRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const labelId = useId();
  const descId = useId();
  return (
    <div className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="space-y-0.5">
        <p id={labelId} className="text-sm font-semibold text-foreground">
          {title}
        </p>
        <p id={descId} className="text-sm leading-6 text-label-secondary">
          {description}
        </p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-labelledby={labelId}
        aria-describedby={descId}
      />
    </div>
  );
}

function LogoUpload({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value: string | null;
  fallback: string;
  onChange: (value: string | null) => void;
}) {
  const inputId = useId();
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-muted bg-contain bg-center bg-no-repeat text-sm font-semibold text-primary"
        style={value ? { backgroundImage: `url(${value})` } : undefined}
        role="img"
        aria-label={`Pré-visualização de ${label}`}
      >
        {value ? null : fallback}
      </span>
      <div className="space-y-1">
        <label
          htmlFor={inputId}
          className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--ea-control-radius)] border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-surface-muted focus-within:ring-2 focus-within:ring-[var(--ea-focus-ring)]"
        >
          Alterar {label.toLowerCase()}
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === "string") onChange(reader.result);
            };
            reader.readAsDataURL(file);
          }}
        />
      </div>
    </div>
  );
}
