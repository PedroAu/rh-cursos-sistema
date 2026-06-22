"use client";

import { useActionState } from "react";
import {
  Bell,
  CheckCircle2,
  Database,
  Mail,
  Palette,
  Save,
  Settings,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { saveAdminSettingsAction, type AdminFormState } from "@/app/actions/admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextField } from "@/components/forms/field";
import type { AdminSettings } from "@/lib/admin-settings";

const initialState: AdminFormState = {
  error: null,
  success: null,
};

type AdminSettingsFormProps = {
  settings: AdminSettings;
};

type SwitchFieldProps = {
  label: string;
  description: string;
  name: string;
  defaultChecked?: boolean;
};

type AssetFieldProps = {
  label: string;
  fileName: string;
  name: string;
  defaultValue: string;
  accept: string;
  helper: string;
  previewLabel: string;
  previewSize: "logo" | "favicon";
};

function AssetField({
  label,
  fileName,
  name,
  defaultValue,
  accept,
  helper,
  previewLabel,
  previewSize,
}: AssetFieldProps) {
  const previewClassName =
    previewSize === "logo"
      ? "h-20 w-40 rounded-md"
      : "size-16 rounded-lg";

  return (
    <div className="rounded-lg border border-border bg-muted/40 p-5">
      <div className="mb-4 flex min-h-24 items-center justify-center rounded-md bg-background p-4">
        {defaultValue ? (
          <span
            aria-label={previewLabel}
            className={`${previewClassName} block bg-contain bg-center bg-no-repeat`}
            role="img"
            style={{ backgroundImage: `url(${defaultValue})` }}
          />
        ) : (
          <span className="flex size-16 items-center justify-center rounded-md bg-primary font-heading text-lg font-extrabold text-primary-foreground">
            RH
          </span>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor={fileName}>{label}</Label>
        <Input id={fileName} name={fileName} type="file" accept={accept} />
        <Input
          aria-label={`${label} atual`}
          defaultValue={defaultValue}
          name={name}
          type="hidden"
        />
        <p className="text-sm leading-6 text-muted-foreground">{helper}</p>
        {defaultValue ? (
          <p className="break-all text-xs leading-5 text-muted-foreground">
            Arquivo atual: {defaultValue}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function SwitchField({ label, description, name, defaultChecked }: SwitchFieldProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/30 p-4">
      <div className="space-y-1">
        <Label htmlFor={name}>{label}</Label>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} id={name} name={name} />
    </div>
  );
}

export function AdminSettingsForm({ settings }: AdminSettingsFormProps) {
  const [state, formAction, pending] = useActionState(
    saveAdminSettingsAction,
    initialState,
  );

  return (
    <form action={formAction}>
      <div className="space-y-8">
        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}
        {state.success ? (
          <Alert>
            <CheckCircle2 aria-hidden className="size-4" />
            <AlertDescription>{state.success}</AlertDescription>
          </Alert>
        ) : null}

        <Tabs defaultValue="geral">
          <TabsList aria-label="Configurações administrativas">
            <TabsTrigger value="geral">
              <Settings aria-hidden className="size-4" />
              Configurações Gerais
            </TabsTrigger>
            <TabsTrigger value="notificacoes">
              <Mail aria-hidden className="size-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="integracoes">
              <Database aria-hidden className="size-4" />
              Integrações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="geral">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="space-y-6">
                <Card className="rounded-xl">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-11 items-center justify-center rounded-md bg-accent text-primary">
                        <Settings aria-hidden className="size-5" />
                      </span>
                      <div>
                        <CardTitle>Identidade do Site</CardTitle>
                        <CardDescription>
                          Dados usados em comunicações, certificados e pontos comerciais.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-5">
                    <TextField
                      defaultValue={settings.operationName}
                      label="Nome da operação"
                      name="operationName"
                    />
                    <TextField
                      defaultValue="Capacitação estratégica para gestão de pessoas e setor público."
                      description="Campo visual desta tela. A persistência atual mantém apenas os dados operacionais existentes."
                      label="Slogan institucional"
                      name="institutionalSlogan"
                    />
                    <TextField
                      defaultValue={settings.commercialEmail}
                      label="E-mail de contato oficial"
                      name="commercialEmail"
                      type="email"
                    />
                  </CardContent>
                </Card>

                <Card className="rounded-xl">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-11 items-center justify-center rounded-md bg-brand-gold/15 text-brand-gold-800">
                        <Palette aria-hidden className="size-5" />
                      </span>
                      <div>
                        <CardTitle>Logotipo e Favicon</CardTitle>
                        <CardDescription>
                          Atualize os assets principais exibidos no site e no navegador.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <AssetField
                      accept="image/svg+xml,image/png,image/jpeg,image/webp"
                      defaultValue={settings.mainLogoUrl}
                      fileName="mainLogoFile"
                      helper="Tamanho recomendado: SVG ou PNG horizontal com 320 x 96 px, fundo transparente e até 250 KB."
                      label="Alterar logo principal"
                      name="mainLogoUrl"
                      previewLabel="Prévia do logo principal"
                      previewSize="logo"
                    />
                    <AssetField
                      accept="image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml"
                      defaultValue={settings.faviconUrl}
                      fileName="faviconFile"
                      helper="Tamanho recomendado: ICO, PNG ou SVG quadrado com 32 x 32 px ou 48 x 48 px."
                      label="Alterar favicon"
                      name="faviconUrl"
                      previewLabel="Prévia do favicon"
                      previewSize="favicon"
                    />
                  </CardContent>
                </Card>
              </div>

              <Card className="h-fit rounded-xl border-0 bg-brand-navy-900 text-white">
                <CardHeader>
                  <span className="inline-flex size-12 items-center justify-center rounded-md bg-brand-gold text-brand-navy-900">
                    <ShieldCheck aria-hidden className="size-6" />
                  </span>
                  <CardTitle>Resumo das Alterações</CardTitle>
                  <CardDescription className="text-white/70">
                    Alterações de identidade afetam certificados, e-mails automáticos e pontos de contato comercial.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notificacoes">
            <Card className="max-w-3xl rounded-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-11 items-center justify-center rounded-md bg-accent text-primary">
                    <Bell aria-hidden className="size-5" />
                  </span>
                  <div>
                    <CardTitle>Preferências de Notificação</CardTitle>
                    <CardDescription>
                      Defina quais eventos operacionais devem gerar alertas administrativos.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <SwitchField
                  defaultChecked={settings.notifyEnrollments}
                  description="Alertar administrador quando um novo aluno se inscrever em um curso."
                  label="Novas inscrições"
                  name="notifyEnrollments"
                />
                <SwitchField
                  defaultChecked={settings.notifyLeads}
                  description="Receber notificação imediata quando um formulário público gerar lead."
                  label="Novos leads"
                  name="notifyLeads"
                />
                <SwitchField
                  description="Enviar resumo estatístico mensal para o e-mail cadastrado."
                  label="Relatórios mensais"
                  name="notifyReports"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integracoes">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="rounded-xl">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <span className="inline-flex size-12 items-center justify-center rounded-full bg-green-100 text-green-800">
                      <Smartphone aria-hidden className="size-6" />
                    </span>
                    <div>
                      <CardTitle>WhatsApp Business</CardTitle>
                      <CardDescription>API de atendimento e envio automático.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-5">
                  <p className="leading-7 text-muted-foreground">
                    Conecte sua conta para enviar notificações de cursos e suporte em tempo real.
                  </p>
                  <Badge className="w-fit bg-green-100 text-green-800 hover:bg-green-100">
                    Conectado
                  </Badge>
                  <TextField
                    defaultValue={settings.priorityChannel}
                    label="Canal prioritário"
                    name="priorityChannel"
                  />
                </CardContent>
              </Card>

              <Card className="rounded-xl">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <span className="inline-flex size-12 items-center justify-center rounded-full bg-accent text-primary">
                      <Database aria-hidden className="size-6" />
                    </span>
                    <div>
                      <CardTitle>Origem de dados</CardTitle>
                      <CardDescription>Supabase, CRM e relatórios.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-5">
                  <p className="leading-7 text-muted-foreground">
                    Mantenha registrada a fonte principal usada pelo painel administrativo.
                  </p>
                  <TextField
                    defaultValue={settings.dataSource}
                    label="Origem principal de dados"
                    name="dataSource"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="sticky bottom-4 z-10 rounded-xl border border-border bg-background/95 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-3xl text-sm font-semibold leading-6 text-muted-foreground">
              Revise as alterações antes de salvar. A aplicação usa estes dados em páginas públicas e comunicações.
            </p>
            <Button disabled={pending} type="submit">
              <Save aria-hidden className="size-4" />
              {pending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
