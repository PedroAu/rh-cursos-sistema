"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/app-store";
import type { Course } from "@/types";

type QuoteModalContextValue = {
  openQuote: (course?: Course) => void;
  closeQuote: () => void;
};

const QuoteModalContext = createContext<QuoteModalContextValue | null>(null);

export function useQuoteModal() {
  const context = useContext(QuoteModalContext);
  if (!context) {
    throw new Error("useQuoteModal deve ser usado dentro de QuoteModalProvider.");
  }
  return context;
}

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

const initialForm = {
  organization: "",
  taxId: "",
  teamSize: "",
  location: "",
  startForecast: "",
  modality: "",
  notes: "",
  responsibleName: "",
  jobTitle: "",
  email: "",
  phone: ""
};

export function QuoteModalProvider({ children }: { children: ReactNode }) {
  const { createLead } = useAppStore();
  const [open, setOpen] = useState(false);
  const [course, setCourse] = useState<Course | undefined>(undefined);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const triggerRef = useRef<HTMLElement>(null);

  const openQuote = useCallback((nextCourse?: Course) => {
    setCourse(nextCourse);
    setOpen(true);
  }, []);

  const closeQuote = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (open) {
      // Capture active element as trigger for focus restoration on close
      triggerRef.current = document.activeElement as HTMLElement;
    } else {
      setForm(initialForm);
      setErrors({});
      setSubmitError(null);
      setIsSaving(false);
      setCourse(undefined);
    }
  }, [open]);

  const update = (key: keyof typeof form, value: string) => {
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError(null);
    setForm((current) => ({ ...current, [key]: key === "phone" ? formatPhone(value) : value }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof typeof form, string>> = {};

    if (!form.organization.trim()) nextErrors.organization = "Informe a empresa ou órgão.";
    if (!form.taxId.trim()) nextErrors.taxId = "Informe o CNPJ ou identificação fiscal.";
    if (!form.teamSize) nextErrors.teamSize = "Selecione o número de colaboradores.";
    if (!form.location.trim()) nextErrors.location = "Informe a localidade da prestação.";
    if (!form.startForecast.trim()) nextErrors.startForecast = "Informe a previsão de início.";
    if (!form.modality) nextErrors.modality = "Selecione a modalidade preferencial.";
    if (!form.responsibleName.trim() || form.responsibleName.trim().length < 3) {
      nextErrors.responsibleName = "Nome do responsável deve ter no mínimo 3 caracteres.";
    }
    if (!form.jobTitle.trim()) nextErrors.jobTitle = "Informe o cargo ou departamento.";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Informe um e-mail corporativo válido.";
    }
    if (getPhoneDigits(form.phone).length < 10) {
      nextErrors.phone = "Informe um telefone ou WhatsApp válido.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;

    setIsSaving(true);
    setSubmitError(null);
    try {
      await createLead({
        name: form.responsibleName,
        email: form.email,
        phone: form.phone,
        courseInterest: course ? course.title : "Orçamento In Company",
        organization: form.organization,
        preferredModality: form.modality,
        origin: "Orçamento In Company",
        message: [
          course ? `Curso de interesse: ${course.title}.` : "Orçamento In Company (sem curso específico).",
          `CNPJ/ID fiscal: ${form.taxId}.`,
          `Nº de colaboradores: ${form.teamSize}.`,
          `Localidade: ${form.location}.`,
          `Previsão de início: ${form.startForecast}.`,
          `Modalidade: ${form.modality}.`,
          `Responsável: ${form.responsibleName} (${form.jobTitle}).`,
          form.notes.trim() ? `Observações: ${form.notes}.` : ""
        ]
          .filter(Boolean)
          .join(" ")
      });
      toast.success("Solicitação de orçamento registrada.");
      setOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível enviar a solicitação.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const value = useMemo(() => ({ openQuote, closeQuote }), [openQuote, closeQuote]);

  return (
    <QuoteModalContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0" triggerRef={triggerRef}>
          <div className="flex max-h-[calc(100vh-2rem)] flex-col">
            <DialogHeader className="border-b border-border px-6 py-5">
              <DialogTitle>Orçamento personalizado In Company</DialogTitle>
              <DialogDescription>
                Conte o contexto da organização e o responsável; retornaremos com proposta sob medida.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="grid gap-6">
                {course ? (
                  <div className="flex items-start gap-4 rounded-xl border border-outline-variant bg-surface-muted p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-deep-navy text-prestige-gold">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-label font-bold uppercase tracking-[0.08em] text-label-secondary">Curso selecionado</p>
                      <p className="mt-1 font-semibold text-deep-navy">{course.title}</p>
                      <p className="mt-1 text-sm text-text-muted">
                        {course.durationLabel} • {course.level}
                      </p>
                    </div>
                  </div>
                ) : null}

                {submitError ? (
                  <div role="alert" className="rounded-lg border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">
                    {submitError}
                  </div>
                ) : null}

                <div>
                  <p className="text-label font-bold uppercase tracking-[0.08em] text-label-secondary">Dados da organização</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <FormField error={errors.organization} label="Empresa / órgão público" required>
                      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                        <Input id={fieldId} placeholder="Ex.: Prefeitura de..." value={form.organization} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} onChange={(event) => update("organization", event.target.value)} />
                      )}
                    </FormField>
                    <FormField error={errors.taxId} label="CNPJ / identificação fiscal" required>
                      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                        <Input id={fieldId} placeholder="00.000.000/0000-00" value={form.taxId} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} onChange={(event) => update("taxId", event.target.value)} />
                      )}
                    </FormField>
                    <FormField error={errors.teamSize} label="Número de colaboradores" required>
                      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                        <Select value={form.teamSize} onValueChange={(value) => update("teamSize", value)}>
                          <SelectTrigger id={fieldId} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid}>
                            <SelectValue placeholder="Selecione uma faixa" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Até 10 participantes">Até 10 participantes</SelectItem>
                            <SelectItem value="De 11 a 30 participantes">De 11 a 30 participantes</SelectItem>
                            <SelectItem value="De 31 a 50 participantes">De 31 a 50 participantes</SelectItem>
                            <SelectItem value="Acima de 50 participantes">Acima de 50 participantes</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </FormField>
                    <FormField error={errors.location} label="Localidade da prestação" required>
                      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                        <Input id={fieldId} placeholder="Ex.: Brasília - DF" value={form.location} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} onChange={(event) => update("location", event.target.value)} />
                      )}
                    </FormField>
                    <FormField error={errors.startForecast} label="Previsão de início" required>
                      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                        <Input id={fieldId} placeholder="Ex.: Próximo trimestre" value={form.startForecast} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} onChange={(event) => update("startForecast", event.target.value)} />
                      )}
                    </FormField>
                    <FormField error={errors.modality} label="Modalidade preferencial" required>
                      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                        <Select value={form.modality} onValueChange={(value) => update("modality", value)}>
                          <SelectTrigger id={fieldId} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid}>
                            <SelectValue placeholder="Selecione a modalidade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Presencial">Presencial</SelectItem>
                            <SelectItem value="Ao vivo (online)">Ao vivo (online)</SelectItem>
                            <SelectItem value="Híbrido">Híbrido</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </FormField>
                    <FormField className="md:col-span-2" label="Observações ou necessidades específicas">
                      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                        <Textarea id={fieldId} placeholder="Descreva conteúdos, normas ou condições especiais." value={form.notes} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} onChange={(event) => update("notes", event.target.value)} />
                      )}
                    </FormField>
                  </div>
                </div>

                <div>
                  <p className="text-label font-bold uppercase tracking-[0.08em] text-label-secondary">Responsável</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <FormField error={errors.responsibleName} label="Nome completo" required>
                      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                        <Input id={fieldId} placeholder="Ex.: Ana Souza" value={form.responsibleName} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} onChange={(event) => update("responsibleName", event.target.value)} />
                      )}
                    </FormField>
                    <FormField error={errors.jobTitle} label="Cargo / departamento" required>
                      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                        <Input id={fieldId} placeholder="Ex.: Gestor de RH" value={form.jobTitle} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} onChange={(event) => update("jobTitle", event.target.value)} />
                      )}
                    </FormField>
                    <FormField error={errors.email} label="E-mail corporativo" required>
                      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                        <Input id={fieldId} type="email" placeholder="voce@empresa.com.br" value={form.email} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} onChange={(event) => update("email", event.target.value)} />
                      )}
                    </FormField>
                    <FormField error={errors.phone} label="Telefone / WhatsApp" required>
                      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                        <Input id={fieldId} type="tel" inputMode="tel" placeholder="(61) 99999-9999" value={form.phone} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} onChange={(event) => update("phone", event.target.value)} />
                      )}
                    </FormField>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-border px-6 py-5">
              <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button variant="outline" onClick={closeQuote}>
                  Cancelar
                </Button>
                <Button loading={isSaving} onClick={submit}>
                  Enviar solicitação
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </QuoteModalContext.Provider>
  );
}
