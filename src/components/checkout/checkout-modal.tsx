import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "@/lib/router-compat";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/lib/app-store";
import type { Course } from "@/types";

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatCPF(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

type CheckoutModalProps = {
  course: Course;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CheckoutModal({ course, open, onOpenChange }: CheckoutModalProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { classes, createEnrollment } = useAppStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    studentName: "",
    email: "",
    phone: "",
    cpf: "",
    organization: "",
    jobTitle: "",
    enrollmentType: "Pessoa física" as const,
    paymentMethod: "Pix" as const,
    classId: ""
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const courseClasses = useMemo(() => classes.filter((item) => item.courseId === course.id), [classes, course.id]);

  const nextStep = () => {
    const nextErrors: Record<string, string> = {};

    if (step === 1) {
      if (!form.studentName.trim() || form.studentName.trim().length < 3) {
        nextErrors.studentName = "Nome deve ter no mínimo 3 caracteres.";
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        nextErrors.email = "Informe um e-mail válido.";
      }
      if (form.phone.replace(/\D/g, "").length < 10) {
        nextErrors.phone = "Telefone deve ter no mínimo 10 dígitos.";
      }
      if (form.cpf.replace(/\D/g, "").length !== 11) {
        nextErrors.cpf = "CPF deve ter 11 dígitos.";
      }
    }

    if (step === 2 && (!form.organization || !form.jobTitle)) {
      if (!form.organization) nextErrors.organization = "Informe a empresa ou órgão.";
      if (!form.jobTitle) nextErrors.jobTitle = "Informe o cargo.";
    }

    if (step === 3 && !form.classId) {
      nextErrors.classId = "Escolha uma turma antes de avançar.";
    }

    setFieldErrors(nextErrors);
    setSubmitError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setStep((current) => Math.min(4, current + 1));
  };

  const finish = async () => {
    if (!form.classId) {
      setFieldErrors({ classId: "Selecione uma turma para concluir." });
      return;
    }

    setIsSaving(true);
    setSubmitError(null);

    try {
      await createEnrollment({
        ...form,
        courseId: course.id,
        notes: "Inscrição gerada pelo checkout simulado."
      });

      onOpenChange(false);
      navigate("/inscricao-confirmada", {
        state: {
          courseId: course.id,
          classId: form.classId,
          studentName: form.studentName,
          paymentMethod: form.paymentMethod,
          redirectFrom: location.pathname
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível concluir a inscrição.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0">
        <div className="flex max-h-[calc(100vh-2rem)] flex-col">
          <DialogHeader className="border-b border-border px-6 py-5">
            <DialogTitle>Secure Enrollment</DialogTitle>
            <DialogDescription>Preencha seus dados, escolha a turma e confirme a forma de pagamento.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="grid gap-6">
              <div className="grid gap-2 md:grid-cols-4">
                {["Dados", "Profissional", "Turma", "Pagamento"].map((label, index) => (
                  <div
                    key={label}
                    className={`rounded-lg px-3 py-2 text-center text-sm font-semibold ${
                      step === index + 1 ? "bg-deep-navy text-white" : "bg-surface-muted text-text-muted"
                    }`}
                  >
                    {index + 1}. {label}
                  </div>
                ))}
              </div>

              {step === 1 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField error={fieldErrors.studentName} label="Nome completo" required>
                    {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                      <Input id={fieldId} placeholder="Ex.: João da Silva" value={form.studentName} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} onChange={(event) => {
                        setFieldErrors((current) => ({ ...current, studentName: "" }));
                        setForm((current) => ({ ...current, studentName: event.target.value }));
                      }} />
                    )}
                  </FormField>
                  <FormField error={fieldErrors.email} label="E-mail" required>
                    {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                      <Input id={fieldId} type="email" placeholder="voce@empresa.com.br" value={form.email} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} onChange={(event) => {
                        setFieldErrors((current) => ({ ...current, email: "" }));
                        setForm((current) => ({ ...current, email: event.target.value }));
                      }} />
                    )}
                  </FormField>
                  <FormField error={fieldErrors.phone} label="Telefone / WhatsApp" required>
                    {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                      <Input id={fieldId} type="tel" placeholder="(61) 99999-9999" value={form.phone} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} onChange={(event) => {
                        setFieldErrors((current) => ({ ...current, phone: "" }));
                        setForm((current) => ({ ...current, phone: formatPhone(event.target.value) }));
                      }} />
                    )}
                  </FormField>
                  <FormField error={fieldErrors.cpf} label="CPF" required>
                    {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                      <Input id={fieldId} placeholder="000.000.000-00" value={form.cpf} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} onChange={(event) => {
                        setFieldErrors((current) => ({ ...current, cpf: "" }));
                        setForm((current) => ({ ...current, cpf: formatCPF(event.target.value) }));
                      }} />
                    )}
                  </FormField>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField error={fieldErrors.organization} label="Empresa / órgão" required>
                    {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                      <Input id={fieldId} placeholder="Ex.: Câmara Municipal..." value={form.organization} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} onChange={(event) => {
                        setFieldErrors((current) => ({ ...current, organization: "" }));
                        setForm((current) => ({ ...current, organization: event.target.value }));
                      }} />
                    )}
                  </FormField>
                  <FormField error={fieldErrors.jobTitle} label="Cargo" required>
                    {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                      <Input id={fieldId} placeholder="Ex.: Analista de DP" value={form.jobTitle} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} onChange={(event) => {
                        setFieldErrors((current) => ({ ...current, jobTitle: "" }));
                        setForm((current) => ({ ...current, jobTitle: event.target.value }));
                      }} />
                    )}
                  </FormField>
                  <FormField label="Tipo de inscrição" required>
                    {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                      <Select value={form.enrollmentType} onValueChange={(value) => setForm((current) => ({ ...current, enrollmentType: value as typeof form.enrollmentType }))}>
                        <SelectTrigger id={fieldId} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid}>
                          <SelectValue placeholder="Selecione o tipo de inscrição" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pessoa física">Pessoa física</SelectItem>
                          <SelectItem value="Empresa">Empresa</SelectItem>
                          <SelectItem value="Órgão público">Órgão público</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </FormField>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="grid gap-4">
                  {fieldErrors.classId ? (
                    <div className="rounded-lg border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
                      {fieldErrors.classId}
                    </div>
                  ) : null}
                  {courseClasses.map((trainingClass) => (
                    <button
                      key={trainingClass.id}
                      type="button"
                      onClick={() => {
                        setFieldErrors((current) => ({ ...current, classId: "" }));
                        setForm((current) => ({ ...current, classId: trainingClass.id }));
                      }}
                      className={`rounded-lg border p-4 text-left transition ${
                        form.classId === trainingClass.id ? "border-primary bg-secondary/60" : "border-border bg-white hover:border-accent"
                      }`}
                    >
                      <div className="font-semibold">{new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(trainingClass.startDate))}</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {trainingClass.time} • {trainingClass.modality} • {trainingClass.location}
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}

              {step === 4 ? (
                <div className="grid gap-4">
                  {submitError ? (
                    <div className="rounded-lg border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
                      {submitError}
                    </div>
                  ) : null}
                  <FormField label="Forma de pagamento" required>
                    {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                      <Select value={form.paymentMethod} onValueChange={(value) => setForm((current) => ({ ...current, paymentMethod: value as typeof form.paymentMethod }))}>
                        <SelectTrigger id={fieldId} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid}>
                          <SelectValue placeholder="Selecione a forma de pagamento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pix">Pix</SelectItem>
                          <SelectItem value="Cartão">Cartão</SelectItem>
                          <SelectItem value="Boleto">Boleto</SelectItem>
                          <SelectItem value="Empenho">Empenho / nota</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </FormField>
                  <div className="rounded-lg border border-outline-variant bg-surface-muted p-4 text-sm leading-6 text-text-muted">
                    Pagamento protegido com confirmação de inscrição e envio de próximos passos por e-mail.
                  </div>
                  <div className="surface-card space-y-4 p-5">
                    <h4 className="text-lg font-semibold">Resumo da inscrição</h4>
                    <div className="grid gap-2 text-sm text-muted-foreground">
                      <div>Curso: {course.title}</div>
                      <div>Aluno: {form.studentName}</div>
                      <div>Forma de pagamento: {form.paymentMethod}</div>
                      <div>Tipo de inscrição: {form.enrollmentType}</div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <DialogFooter className="border-t border-border px-6 py-4 sm:justify-between">
            <Button variant="outline" onClick={() => setStep((current) => Math.max(1, current - 1))}>
              Voltar
            </Button>
            {step < 4 ? <Button onClick={nextStep}>Continuar</Button> : <Button loading={isSaving} onClick={finish}>Finalizar inscrição</Button>}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
