import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleHelp, ShieldCheck } from "lucide-react";
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

const initialForm = {
  studentName: "",
  email: "",
  phone: "",
  cpf: "",
  organization: "",
  jobTitle: "",
  enrollmentType: "Pessoa física" as const,
  paymentMethod: "Pix" as const,
  classId: ""
};

const checkoutSteps = [
  { title: "Dados pessoais", description: "Informações básicas para reservar a vaga." },
  { title: "Contexto profissional", description: "Ajuste o formato de inscrição ao seu cenário." },
  { title: "Escolha da turma", description: "Selecione a agenda com melhor aderência." },
  { title: "Confirmação", description: "Revise o pedido e defina o pagamento." }
] as const;

export function CheckoutModal({ course, open, onOpenChange }: CheckoutModalProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { classes, createEnrollment } = useAppStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const courseClasses = useMemo(() => classes.filter((item) => item.courseId === course.id), [classes, course.id]);
  const selectedClass = courseClasses.find((item) => item.id === form.classId);
  const nextClass = courseClasses[0];
  const requiresOrganizationContext = form.enrollmentType !== "Pessoa física";

  useEffect(() => {
    if (!open) {
      setStep(1);
      setForm(initialForm);
      setFieldErrors({});
      setSubmitError(null);
      setIsSaving(false);
    }
  }, [open]);

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

    if (step === 2) {
      if (requiresOrganizationContext && !form.organization.trim()) {
        nextErrors.organization = "Informe a empresa ou órgão responsável pela inscrição.";
      }
      if (requiresOrganizationContext && !form.jobTitle.trim()) {
        nextErrors.jobTitle = "Informe o cargo ou área de atuação.";
      }
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
      <DialogContent className="max-w-5xl p-0">
        <div className="grid max-h-[calc(100vh-2rem)] md:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.55fr)]">
          <div className="flex min-h-0 flex-col">
            <DialogHeader className="border-b border-border px-6 py-5">
              <DialogTitle>Inscrição guiada</DialogTitle>
              <DialogDescription>
                Confirme o curso, escolha a turma e finalize a reserva com contexto claro antes do pagamento.
              </DialogDescription>
            </DialogHeader>

            <div className="border-b border-border bg-surface-muted/70 px-6 py-4">
              <div className="grid gap-3 md:grid-cols-4">
                {checkoutSteps.map((item, index) => (
                  <div
                    key={item.title}
                    className={`rounded-lg border px-3 py-3 text-left transition ${
                      step === index + 1
                        ? "border-deep-navy bg-deep-navy text-white"
                        : step > index + 1
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-outline-variant bg-white text-text-muted"
                    }`}
                  >
                    <div className="text-label font-bold uppercase tracking-[0.08em]">{index + 1}. etapa</div>
                    <div className="mt-2 text-sm font-semibold">{item.title}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="grid gap-6">
                <div aria-live="polite" className="rounded-xl border border-outline-variant bg-white px-5 py-4">
                  <p className="text-label font-bold uppercase tracking-[0.08em] text-label-secondary">
                    {checkoutSteps[step - 1]?.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-text-muted">
                    {checkoutSteps[step - 1]?.description}
                  </p>
                </div>

                {step === 1 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField error={fieldErrors.studentName} hint="Nome que será usado nos comunicados da turma." label="Nome completo" required>
                      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                        <Input
                          id={fieldId}
                          placeholder="Ex.: João da Silva"
                          value={form.studentName}
                          aria-describedby={ariaDescribedBy}
                          aria-invalid={ariaInvalid}
                          onChange={(event) => {
                            setFieldErrors((current) => ({ ...current, studentName: "" }));
                            setForm((current) => ({ ...current, studentName: event.target.value }));
                          }}
                        />
                      )}
                    </FormField>
                    <FormField error={fieldErrors.email} hint="Usaremos este e-mail para confirmação e orientações." label="E-mail" required>
                      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                        <Input
                          id={fieldId}
                          type="email"
                          placeholder="voce@empresa.com.br"
                          value={form.email}
                          aria-describedby={ariaDescribedBy}
                          aria-invalid={ariaInvalid}
                          onChange={(event) => {
                            setFieldErrors((current) => ({ ...current, email: "" }));
                            setForm((current) => ({ ...current, email: event.target.value }));
                          }}
                        />
                      )}
                    </FormField>
                    <FormField error={fieldErrors.phone} hint="Preferencialmente WhatsApp para avisos rápidos da equipe." label="Telefone / WhatsApp" required>
                      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                        <Input
                          id={fieldId}
                          type="tel"
                          placeholder="(61) 99999-9999"
                          value={form.phone}
                          aria-describedby={ariaDescribedBy}
                          aria-invalid={ariaInvalid}
                          onChange={(event) => {
                            setFieldErrors((current) => ({ ...current, phone: "" }));
                            setForm((current) => ({ ...current, phone: formatPhone(event.target.value) }));
                          }}
                        />
                      )}
                    </FormField>
                    <FormField error={fieldErrors.cpf} hint="Obrigatório para emissão da inscrição." label="CPF" required>
                      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                        <Input
                          id={fieldId}
                          placeholder="000.000.000-00"
                          value={form.cpf}
                          aria-describedby={ariaDescribedBy}
                          aria-invalid={ariaInvalid}
                          onChange={(event) => {
                            setFieldErrors((current) => ({ ...current, cpf: "" }));
                            setForm((current) => ({ ...current, cpf: formatCPF(event.target.value) }));
                          }}
                        />
                      )}
                    </FormField>
                  </div>
                ) : null}

                {step === 2 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField hint="Escolha como a inscrição será tratada pela equipe comercial." label="Tipo de inscrição" required>
                      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                        <Select
                          value={form.enrollmentType}
                          onValueChange={(value) => setForm((current) => ({ ...current, enrollmentType: value as typeof form.enrollmentType }))}
                        >
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
                    <div className="rounded-xl border border-outline-variant bg-surface-muted px-4 py-4 text-sm leading-6 text-text-muted">
                      {requiresOrganizationContext
                        ? "Para inscrições corporativas ou por órgão público, coletamos empresa e cargo para alinhar proposta e faturamento."
                        : "Para pessoa física, empresa e cargo são opcionais. Você pode informar agora ou concluir sem esse contexto."}
                    </div>
                    <FormField
                      error={fieldErrors.organization}
                      hint={requiresOrganizationContext ? "Obrigatório para propostas corporativas e empenho." : "Opcional, se quiser que a equipe contextualize o atendimento."}
                      label="Empresa / órgão"
                      required={requiresOrganizationContext}
                    >
                      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                        <Input
                          id={fieldId}
                          placeholder="Ex.: Câmara Municipal..."
                          value={form.organization}
                          aria-describedby={ariaDescribedBy}
                          aria-invalid={ariaInvalid}
                          onChange={(event) => {
                            setFieldErrors((current) => ({ ...current, organization: "" }));
                            setForm((current) => ({ ...current, organization: event.target.value }));
                          }}
                        />
                      )}
                    </FormField>
                    <FormField
                      error={fieldErrors.jobTitle}
                      hint={requiresOrganizationContext ? "Ajuda a direcionar linguagem, material e atendimento." : "Opcional para adaptar a comunicação da turma ao seu contexto."}
                      label="Cargo / área"
                      required={requiresOrganizationContext}
                    >
                      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                        <Input
                          id={fieldId}
                          placeholder="Ex.: Analista de DP"
                          value={form.jobTitle}
                          aria-describedby={ariaDescribedBy}
                          aria-invalid={ariaInvalid}
                          onChange={(event) => {
                            setFieldErrors((current) => ({ ...current, jobTitle: "" }));
                            setForm((current) => ({ ...current, jobTitle: event.target.value }));
                          }}
                        />
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
                        className={`rounded-xl border p-5 text-left transition ${
                          form.classId === trainingClass.id ? "border-deep-navy bg-secondary/60" : "border-border bg-white hover:border-accent"
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <div className="font-semibold text-deep-navy">
                              {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(trainingClass.startDate))}
                              {" · "}
                              {new Intl.DateTimeFormat("pt-BR", { year: "numeric" }).format(new Date(trainingClass.startDate))}
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              {trainingClass.time} • {trainingClass.modality} • {trainingClass.location}
                            </div>
                          </div>
                          <div className="rounded-full border border-outline-variant bg-surface-muted px-3 py-1.5 text-label font-bold text-deep-navy">
                            {trainingClass.availableSeats} vaga(s)
                          </div>
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
                    <div className="rounded-xl border border-outline-variant bg-surface-muted px-5 py-5">
                      <p className="text-label font-bold uppercase tracking-[0.08em] text-label-secondary">Resumo do pedido</p>
                      <dl className="mt-4 grid gap-4 md:grid-cols-2">
                        <div>
                          <dt className="text-label font-bold uppercase tracking-[0.08em] text-label-secondary">Curso</dt>
                          <dd className="mt-1 font-semibold text-deep-navy">{course.title}</dd>
                        </div>
                        <div>
                          <dt className="text-label font-bold uppercase tracking-[0.08em] text-label-secondary">Tipo</dt>
                          <dd className="mt-1 font-semibold text-deep-navy">{form.enrollmentType}</dd>
                        </div>
                        <div>
                          <dt className="text-label font-bold uppercase tracking-[0.08em] text-label-secondary">Turma</dt>
                          <dd className="mt-1 font-semibold text-deep-navy">
                            {selectedClass
                              ? `${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(selectedClass.startDate))} • ${selectedClass.time}`
                              : "Selecione uma turma para concluir"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-label font-bold uppercase tracking-[0.08em] text-label-secondary">Investimento</dt>
                          <dd className="mt-1 font-semibold text-deep-navy">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(course.price)}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    <FormField hint="A equipe confirma a forma escolhida no contato de pós-inscrição." label="Forma de pagamento" required>
                      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                        <Select
                          value={form.paymentMethod}
                          onValueChange={(value) => setForm((current) => ({ ...current, paymentMethod: value as typeof form.paymentMethod }))}
                        >
                          <SelectTrigger id={fieldId} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid}>
                            <SelectValue placeholder="Selecione a forma de pagamento" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pix">Pix</SelectItem>
                            <SelectItem value="Cartão">Cartão</SelectItem>
                            <SelectItem value="Boleto">Boleto</SelectItem>
                            <SelectItem value="Empenho">Empenho</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </FormField>
                  </div>
                ) : null}
              </div>
            </div>

            <DialogFooter className="border-t border-border px-6 py-5">
              <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button variant="outline" onClick={() => (step === 1 ? onOpenChange(false) : setStep((current) => current - 1))}>
                  {step === 1 ? "Cancelar" : "Voltar"}
                </Button>
                {step < 4 ? (
                  <Button onClick={nextStep}>Avançar</Button>
                ) : (
                  <Button loading={isSaving} onClick={finish}>
                    Confirmar inscrição
                  </Button>
                )}
              </div>
            </DialogFooter>
          </div>

          <aside className="hidden border-l border-border bg-deep-navy text-white md:flex md:min-h-0 md:flex-col">
            <div className="space-y-6 overflow-y-auto px-6 py-6">
              <div className="space-y-3">
                <p className="text-label font-bold uppercase tracking-[0.08em] text-white/70">Curso selecionado</p>
                <h3 className="font-display text-3xl font-bold">{course.title}</h3>
                <p className="text-sm leading-6 text-white/72">{course.shortDescription}</p>
              </div>

              <div className="rounded-2xl border border-white/12 bg-white/8 p-5">
                <p className="text-label font-bold uppercase tracking-[0.08em] text-white/70">Resumo executivo</p>
                <dl className="mt-4 space-y-4 text-sm">
                  <div>
                    <dt className="text-white/65">Investimento</dt>
                    <dd className="mt-1 text-2xl font-bold text-prestige-gold">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(course.price)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-white/65">Próxima turma</dt>
                    <dd className="mt-1 font-semibold">
                      {nextClass
                        ? `${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(nextClass.startDate))} • ${nextClass.modality}`
                        : "Em breve"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-white/65">Vagas disponíveis</dt>
                    <dd className="mt-1 font-semibold">{nextClass ? `${nextClass.availableSeats} para reserva` : "Sob consulta"}</dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-3">
                {[
                  "Confirmação por e-mail com o resumo da inscrição.",
                  "Atendimento comercial para ajustes de faturamento quando necessário.",
                  "Orientações da turma enviadas após reserva."
                ].map((item) => (
                  <div key={item} className="flex gap-3 text-sm leading-6 text-white/80">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-dashed border-white/18 p-5 text-sm leading-6 text-white/72">
                <div className="mb-2 flex items-center gap-2 font-semibold text-white">
                  <CircleHelp className="h-4 w-4 text-prestige-gold" />
                  Precisa de apoio antes de concluir?
                </div>
                Nossa equipe confirma turma, pagamento e condições especiais sem perder a reserva iniciada aqui.
              </div>

              <div className="rounded-2xl bg-white px-5 py-4 text-sm leading-6 text-deep-navy">
                <div className="mb-2 flex items-center gap-2 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  Itens incluídos
                </div>
                Material de apoio, confirmação operacional e acompanhamento da equipe RH Cursos.
              </div>
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}
