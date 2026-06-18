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
import type { AdminSettings } from "@/lib/admin-settings";

const initialState: AdminFormState = {
  error: null,
  success: null,
};

type AdminSettingsFormProps = {
  settings: AdminSettings;
};

type FieldProps = {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  helper?: string;
};

type SwitchFieldProps = {
  label: string;
  description: string;
  name: string;
  defaultChecked?: boolean;
};

function Field({ label, name, defaultValue, type = "text", helper }: FieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input defaultValue={defaultValue} id={name} name={name} type={type} />
      {helper ? <p className="text-sm leading-6 text-muted-foreground">{helper}</p> : null}
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
                    <Field
                      defaultValue={settings.operationName}
                      label="Nome da operação"
                      name="operationName"
                    />
                    <Field
                      defaultValue="Capacitação estratégica para gestão de pessoas e setor público."
                      helper="Campo visual desta tela. A persistência atual mantém apenas os dados operacionais existentes."
                      label="Slogan institucional"
                      name="institutionalSlogan"
                    />
                    <Field
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
                          Área preparada para evolução futura de upload de marca.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-border bg-muted/40 p-5 text-center">
                      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-md bg-primary font-heading text-lg font-extrabold text-primary-foreground">
                        RH
                      </div>
                      <Button type="button" variant="secondary">
                        Alterar Logo Principal
                      </Button>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/40 p-5 text-center">
                      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-md bg-primary font-heading font-extrabold text-primary-foreground">
                        RH
                      </div>
                      <Button type="button" variant="secondary">
                        Alterar Favicon
                      </Button>
                    </div>
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
                  <Field
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
                  <Field
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
