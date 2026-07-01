import { Send, ShieldCheck, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/app-store";
import type { LeadOrigin } from "@/types";

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function getPhoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

const guarantees = [
  {
    icon: ShieldCheck,
    title: "Diagnóstico personalizado",
    description: "Analisamos as dores específicas do seu departamento antes de propor qualquer solução."
  },
  {
    icon: Users,
    title: "Expertise em setor público",
    description: "Especialistas com anos de experiência em licitações e RH governamental."
  }
];

type SpecialistContactPageProps = {
  leadOrigin?: Extract<LeadOrigin, "Consultoria" | "Especialista">;
};

export function SpecialistContactPage({ leadOrigin = "Especialista" }: SpecialistContactPageProps) {
  const { createLead } = useAppStore();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    interestArea: "",
    message: ""
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const update = (key: keyof typeof form, value: string) => {
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError(null);
    setSubmitSuccess(null);
    if (key === "phone") {
      setForm((current) => ({ ...current, [key]: formatPhone(value) }));
    } else {
      setForm((current) => ({ ...current, [key]: value }));
    }
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof typeof form, string>> = {};

    if (!form.name.trim() || form.name.trim().length < 3) {
      nextErrors.name = "Nome deve ter no mínimo 3 caracteres.";
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Informe um e-mail válido.";
    }
    if (getPhoneDigits(form.phone).length < 10) {
      nextErrors.phone = "Informe um telefone ou WhatsApp válido.";
    }
    if (!form.organization.trim()) {
      nextErrors.organization = "Informe a empresa ou órgão.";
    }
    if (!form.interestArea) {
      nextErrors.interestArea = "Selecione a área de interesse.";
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      nextErrors.message = "Mensagem deve ter no mínimo 10 caracteres.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await createLead({
        name: form.name,
        email: form.email,
        phone: form.phone,
        type: "Consultoria",
        organization: form.organization,
        courseInterest: form.interestArea,
        trainingTheme: form.interestArea,
        origin: leadOrigin,
        message: form.message
      });
      toast.success("Solicitação registrada para atendimento especializado.");
      setForm({ name: "", email: "", phone: "", organization: "", interestArea: "", message: "" });
      setErrors({});
      setSubmitError(null);
      setSubmitSuccess(
        "Solicitação registrada. Um especialista retorna com diagnóstico e próximos passos."
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível enviar sua solicitação.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="bg-deep-navy py-20 text-white">
        <div className="ea-container">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex rounded bg-prestige-gold px-3 py-1.5 text-label font-bold uppercase tracking-[0.05em] text-[var(--ea-button-primary-fg,#083b56)]">
              Consultoria exclusiva
            </span>
            <h1 className="text-white">Fale com um especialista da RH Cursos.</h1>
            <p className="max-w-2xl text-lead text-white/80">
              Conte o desafio da sua equipe e receba um diagnóstico orientado antes de qualquer proposta.
            </p>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="ea-container grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="space-y-4">
              <p className="text-label font-bold uppercase tracking-[0.08em] text-prestige-gold">Diagnóstico personalizado</p>
              <h2 className="text-deep-navy">Entenda o caminho antes de propor a solução.</h2>
              <p className="max-w-2xl text-body-lg leading-8 text-text-muted">
                O atendimento começa pelo contexto da equipe para orientar o formato mais adequado, com foco em
                gestão pública, treinamento e resultado prático.
              </p>
            </div>

            <div className="grid gap-4">
              {guarantees.map((item) => {
                const Icon = item.icon;

                return (
                  <Card key={item.title} className="border-outline-variant bg-surface-container-lowest shadow-card">
                    <CardContent className="flex items-start gap-4 p-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-display text-xl font-bold text-deep-navy">{item.title}</h3>
                        <p className="text-sm leading-6 text-text-muted">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="overflow-hidden border-outline-variant bg-deep-navy text-white">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border border-white/15">
                    <AvatarFallback className="bg-secondary-container font-display text-xl text-[var(--ea-button-primary-fg,#083b56)]">
                      MS
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-label font-bold uppercase tracking-[0.08em] text-white/70">Atendimento</p>
                    <p className="text-lg font-semibold leading-7">Mariana Silva</p>
                    <p className="text-sm text-white/70">Coordenadora de Consultoria</p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-white/80">
                  &ldquo;Nossa meta é simplificar a burocracia através da educação continuada de alta performance.&rdquo;
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-outline-variant bg-surface-container-lowest shadow-card" data-testid="ui-specialist-form">
            <CardContent className="grid gap-6 p-8 md:p-10">
              <div className="space-y-2">
                <p className="text-label font-bold uppercase tracking-[0.08em] text-primary">Formulário</p>
                <h2 className="font-display text-h2-compact font-bold text-deep-navy">Solicite o contato</h2>
                <p className="text-sm leading-7 text-text-muted">
                  Preencha os dados e o tema; retornaremos com orientação objetiva.
                </p>
              </div>
              {submitError ? (
                <div role="alert" className="rounded-lg border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">
                  {submitError}
                </div>
              ) : null}
              {submitSuccess ? (
                <div aria-live="polite" className="rounded-lg border border-success/25 bg-success/10 px-4 py-3 text-sm text-success">
                  {submitSuccess}
                </div>
              ) : null}
              <FormField error={errors.name} label="Nome completo" required>
                {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                  <Input
                    id={fieldId}
                    placeholder="Ex.: Maria Oliveira"
                    value={form.name}
                    aria-describedby={ariaDescribedBy}
                    aria-invalid={ariaInvalid}
                    onChange={(event) => update("name", event.target.value)}
                  />
                )}
              </FormField>
              <FormField error={errors.email} label="E-mail corporativo" required>
                {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                  <Input
                    id={fieldId}
                    type="email"
                    placeholder="voce@empresa.com.br"
                    value={form.email}
                    aria-describedby={ariaDescribedBy}
                    aria-invalid={ariaInvalid}
                    onChange={(event) => update("email", event.target.value)}
                  />
                )}
              </FormField>
              <FormField error={errors.phone} label="WhatsApp" required>
                {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                  <Input
                    id={fieldId}
                    type="tel"
                    inputMode="tel"
                    placeholder="(61) 99999-9999"
                    value={form.phone}
                    aria-describedby={ariaDescribedBy}
                    aria-invalid={ariaInvalid}
                    onChange={(event) => update("phone", event.target.value)}
                  />
                )}
              </FormField>
              <FormField error={errors.organization} label="Empresa ou órgão" required>
                {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                  <Input
                    id={fieldId}
                    placeholder="Ex.: Secretaria de Gestão"
                    value={form.organization}
                    aria-describedby={ariaDescribedBy}
                    aria-invalid={ariaInvalid}
                    onChange={(event) => update("organization", event.target.value)}
                  />
                )}
              </FormField>
              <FormField error={errors.interestArea} label="Área de interesse" required>
                {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                  <Select value={form.interestArea} onValueChange={(value) => update("interestArea", value)}>
                    <SelectTrigger id={fieldId} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid}>
                      <SelectValue placeholder="Selecione uma área" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Recursos Humanos (RH)">Recursos Humanos (RH)</SelectItem>
                      <SelectItem value="Licitações e Contratos">Licitações e Contratos</SelectItem>
                      <SelectItem value="Gestão Pública">Gestão Pública</SelectItem>
                      <SelectItem value="Treinamento In Company">Treinamento In Company</SelectItem>
                      <SelectItem value="Outros Assuntos">Outros Assuntos</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </FormField>
              <FormField error={errors.message} label="Como podemos ajudar?" required>
                {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                  <Textarea
                    id={fieldId}
                    placeholder="Descreva o desafio, o contexto da equipe e o tipo de apoio desejado."
                    value={form.message}
                    aria-describedby={ariaDescribedBy}
                    aria-invalid={ariaInvalid}
                    onChange={(event) => update("message", event.target.value)}
                  />
                )}
              </FormField>
              <Button
                size="lg"
                loading={isSubmitting}
                onClick={submit}
                className="justify-center bg-[var(--color-primary-hover)] hover:bg-[var(--color-primary-light)]"
              >
                <Send className="h-4 w-4" />
                Solicitar contato
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
