import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  CreditCard,
  Landmark,
  LockKeyhole,
  QrCode,
  ShieldCheck,
  TicketPercent,
} from "lucide-react";
import { useLocation, useNavigate } from "@/lib/router-compat";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/app-store";
import { courseCoverByPath, defaultCourseCover } from "@/lib/course-covers";
import { cn } from "@/lib/utils";
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

function formatCNPJ(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function formatCEP(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

type CheckoutModalProps = {
  course: Course;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialClassId?: string;
};

type PaymentMethod = "Cartão" | "Pix" | "Boleto" | "Empenho";
type BuyerType = "pf" | "pj";

type CheckoutFormState = {
  buyerType: BuyerType;
  classId: string;
  studentName: string;
  email: string;
  phone: string;
  cpf: string;
  organization: string;
  cnpj: string;
  contactName: string;
  zipCode: string;
  street: string;
  streetNumber: string;
  complement: string;
  neighborhood: string;
  city: string;
  stateCode: string;
  paymentMethod: PaymentMethod;
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  installments: string;
  commitmentUnit: string;
  commitmentCode: string;
  couponCode: string;
  acceptedTerms: boolean;
};

const initialForm: CheckoutFormState = {
  buyerType: "pf",
  classId: "",
  studentName: "",
  email: "",
  phone: "",
  cpf: "",
  organization: "",
  cnpj: "",
  contactName: "",
  zipCode: "",
  street: "",
  streetNumber: "",
  complement: "",
  neighborhood: "",
  city: "",
  stateCode: "",
  paymentMethod: "Cartão",
  cardName: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvv: "",
  installments: "3",
  commitmentUnit: "",
  commitmentCode: "",
  couponCode: "",
  acceptedTerms: false,
};

const ENROLLMENT_SUCCESS_STORAGE_KEY = "__latest_enrollment_success__";
const VALID_COUPON = "RHCURSOS10";

function Stepper({ currentStep }: { currentStep: number }) {
  const steps = ["Dados", "Pagamento", "Confirmação"];

  return (
    <div className="mx-auto flex max-w-[520px] items-start justify-center">
      {steps.map((label, index) => {
        const status = index < currentStep ? "done" : index === currentStep ? "active" : "todo";
        const isDone = status === "done";
        const isActive = status === "active";

        return (
          <div key={label} className="flex flex-1 items-start">
            <div className="flex w-full flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold transition",
                  isDone && "border-tk-brand bg-tk-brand text-white",
                  isActive && "border-tk-brand bg-tk-brand text-white shadow-[0_0_0_4px_var(--tk-accent-soft)]",
                  status === "todo" && "border-tk-line bg-white text-tk-ink-muted",
                )}
                aria-current={isActive ? "step" : undefined}
              >
                {isDone ? <Check className="h-4 w-4" aria-hidden="true" /> : <span>{index + 1}</span>}
              </div>
              <span
                className={cn(
                  "text-caption font-semibold",
                  status === "todo" ? "text-tk-ink-muted" : "text-tk-ink",
                )}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <div
                className={cn(
                  "mt-[19px] h-0.5 flex-1",
                  index < currentStep ? "bg-tk-brand" : "bg-tk-line",
                )}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-5">
      <h2 className="font-display text-[1.625rem] font-bold tracking-[-0.01em] text-tk-ink">{title}</h2>
      {description ? <p className="mt-1 text-sm text-tk-ink-muted">{description}</p> : null}
    </div>
  );
}

function Field({
  label,
  error,
  required = false,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-tk-ink">
      <span>
        {label}
        {required ? <span className="ml-1 text-tk-error">*</span> : null}
      </span>
      {children}
      {error ? (
        <span className="text-caption text-tk-error" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function PaymentCard({
  checked,
  title,
  description,
  icon,
  onClick,
}: {
  checked: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-label={title}
      onClick={onClick}
      className={cn(
        "flex items-start gap-4 rounded-[14px] border p-4 text-left transition",
        checked ? "border-tk-brand bg-tk-accent-soft shadow-[inset_0_0_0_1px_var(--tk-brand)]" : "border-tk-line bg-white hover:border-tk-accent",
      )}
    >
      <span
        className={cn(
          "mt-1 flex h-4 w-4 shrink-0 rounded-full border-2 shadow-[inset_0_0_0_2.5px_#fff]",
          checked ? "border-tk-brand bg-tk-brand" : "border-tk-line bg-white",
        )}
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-sm font-semibold text-tk-ink">
          {icon}
          {title}
        </span>
        <span className="mt-1 block text-caption text-tk-ink-muted">{description}</span>
      </span>
    </button>
  );
}

export function CheckoutModal({ course, open, onOpenChange, initialClassId }: CheckoutModalProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { classes, createEnrollment } = useAppStore();
  const triggerRef = useRef<HTMLElement>(null);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CheckoutFormState>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [couponStatus, setCouponStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [isSaving, setIsSaving] = useState(false);

  const courseClasses = useMemo(
    () => classes.filter((item) => item.courseId === course.id),
    [classes, course.id],
  );

  const selectedClass = courseClasses.find((item) => item.id === form.classId) ?? courseClasses[0] ?? null;
  const effectiveClassId = form.classId || selectedClass?.id || "";
  const coverImage = course.image || courseCoverByPath[course.pathId] || defaultCourseCover;
  const hasDiscount = couponStatus === "valid";
  const discountValue = hasDiscount ? Math.round(course.price * 0.1 * 100) / 100 : 0;
  const total = Math.max(course.price - discountValue, 0);
  const installments = Number(form.installments) || 1;

  useEffect(() => {
    if (!open) {
      setStep(0);
      setForm(initialForm);
      setFieldErrors({});
      setSubmitError(null);
      setCouponStatus("idle");
      setIsSaving(false);
      return;
    }

    triggerRef.current = document.activeElement as HTMLElement;
    const selectedClassId =
      initialClassId && courseClasses.some((item) => item.id === initialClassId)
        ? initialClassId
        : courseClasses[0]?.id ?? "";

    setStep(0);
    setFieldErrors({});
    setSubmitError(null);
    setCouponStatus("idle");
    setIsSaving(false);
    setForm((current) => ({
      ...initialForm,
      classId: selectedClassId,
      paymentMethod: current.paymentMethod,
      installments: current.installments,
    }));
  }, [courseClasses, initialClassId, open]);

  const updateField = <K extends keyof CheckoutFormState>(key: K, value: CheckoutFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key as string]) return current;
      const next = { ...current };
      delete next[key as string];
      return next;
    });
    if (submitError) setSubmitError(null);
  };

  const validateStep = () => {
    const nextErrors: Record<string, string> = {};

    if (step === 0) {
      if (!effectiveClassId) {
        nextErrors.classId = "Selecione uma turma para continuar.";
      }

      if (form.buyerType === "pf") {
        if (!form.studentName.trim() || form.studentName.trim().length < 3) {
          nextErrors.studentName = "Nome deve ter no mínimo 3 caracteres.";
        }
      } else {
        if (!form.organization.trim()) {
          nextErrors.organization = "Informe a razão social.";
        }
        if (form.cnpj.replace(/\D/g, "").length !== 14) {
          nextErrors.cnpj = "CNPJ deve ter 14 dígitos.";
        }
        if (!form.contactName.trim() || form.contactName.trim().length < 3) {
          nextErrors.contactName = "Informe o nome do responsável.";
        }
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

    if (step === 1) {
      if (form.paymentMethod === "Cartão") {
        if (!form.cardName.trim()) nextErrors.cardName = "Informe o nome impresso no cartão.";
        if (form.cardNumber.replace(/\D/g, "").length < 16) nextErrors.cardNumber = "Informe um número de cartão válido.";
        if (!/^\d{2}\/\d{2}$/.test(form.cardExpiry)) nextErrors.cardExpiry = "Use o formato MM/AA.";
        if (form.cardCvv.replace(/\D/g, "").length < 3) nextErrors.cardCvv = "Informe um CVV válido.";
      }

      if (form.paymentMethod === "Empenho" && !form.commitmentUnit.trim()) {
        nextErrors.commitmentUnit = "Informe o órgão ou entidade.";
      }

      if (!form.acceptedTerms) {
        nextErrors.acceptedTerms = "Você precisa aceitar os termos para finalizar a compra.";
      }
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goToPayment = () => {
    if (!validateStep()) return;
    setForm((current) => ({ ...current, classId: effectiveClassId }));
    setStep(1);
  };

  const applyCoupon = () => {
    const normalized = form.couponCode.trim().toUpperCase();
    setCouponStatus(normalized === VALID_COUPON ? "valid" : "invalid");
  };

  const enrollmentType =
    form.paymentMethod === "Empenho"
      ? "Órgão público"
      : form.buyerType === "pj"
        ? "Empresa"
        : "Pessoa física";

  const buyerName = form.buyerType === "pf" ? form.studentName.trim() : form.contactName.trim();

  const finish = async () => {
    if (!validateStep()) return;

    if (!effectiveClassId) {
      setFieldErrors((current) => ({ ...current, classId: "Selecione uma turma para continuar." }));
      setStep(0);
      return;
    }

    setIsSaving(true);
    setSubmitError(null);

    try {
      await createEnrollment({
        studentName: buyerName,
        email: form.email,
        phone: form.phone,
        cpf: form.cpf,
        organization: form.organization.trim(),
        jobTitle: "",
        enrollmentType,
        paymentMethod: form.paymentMethod,
        courseId: course.id,
        classId: effectiveClassId,
        notes: "Inscrição gerada pelo checkout Trust Keith.",
      });

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          ENROLLMENT_SUCCESS_STORAGE_KEY,
          JSON.stringify({
            courseId: course.id,
            classId: effectiveClassId,
            studentName: buyerName,
            paymentMethod: form.paymentMethod,
          }),
        );
      }

      onOpenChange(false);
      const successParams = new URLSearchParams({
        courseId: course.id,
        classId: effectiveClassId,
        studentName: buyerName,
        paymentMethod: form.paymentMethod,
      });
      navigate(`/inscricao-confirmada?${successParams.toString()}`, {
        state: {
          courseId: course.id,
          classId: effectiveClassId,
          studentName: buyerName,
          paymentMethod: form.paymentMethod,
          redirectFrom: location.pathname,
        },
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
      <DialogContent className="max-w-[min(96vw,1180px)] p-0" triggerRef={triggerRef}>
        <div className="max-h-[calc(100vh-2rem)] overflow-y-auto bg-[#eef0f2]">
          <div className="mx-auto overflow-hidden rounded-[20px] border border-tk-line bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)]">
            <nav
              aria-label="Navegação principal do checkout"
              className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 bg-white px-6 py-4 md:px-10"
            >
              <div>
                <p className="font-display text-xl font-bold text-tk-ink">RH Cursos</p>
                <p className="text-caption text-tk-ink-muted">Finalizar inscrição</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-tk-ink-muted">
                <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                Ambiente de compra seguro
              </div>
            </nav>

            <header className="border-b border-tk-line bg-[radial-gradient(circle_at_50%_-20%,#f7f9fc_30%,#ebf3ff_130%)] px-6 py-8 md:px-10">
              <div className="mx-auto max-w-[1100px]">
                <div className="mb-5 flex flex-wrap items-center gap-2 text-caption text-tk-ink-muted">
                  <span>Home</span>
                  <span>/</span>
                  <span>Cursos</span>
                  <span>/</span>
                  <span className="text-tk-ink">Finalizar inscrição</span>
                </div>
                <h1 className="mb-6 font-display text-[2rem] font-bold tracking-[-0.02em] text-tk-ink">
                  Finalizar inscrição
                </h1>
                <Stepper currentStep={step} />
              </div>
            </header>

            <div className="mx-auto grid max-w-[1100px] gap-11 px-6 py-11 md:grid-cols-[minmax(0,1fr)_372px] md:px-10">
              <main className="grid gap-6">
                {step === 0 ? (
                  <>
                    <section className="rounded-tk-card border border-tk-line bg-white p-6 shadow-tk-glass md:p-8">
                      <SectionTitle title="Escolha a turma" description={course.title} />

                      <div aria-label="Escolha a turma" className="grid gap-2" role="radiogroup">
                        {courseClasses.map((trainingClass) => {
                          const checked = effectiveClassId === trainingClass.id;
                          const startDate = new Intl.DateTimeFormat("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(trainingClass.startDate));
                          const vacancyLabel =
                            trainingClass.availableSeats <= 3 ? "Últimas vagas" : "Abertas";

                          return (
                            <button
                              key={trainingClass.id}
                              type="button"
                              role="radio"
                              aria-checked={checked}
                              aria-label={`Selecionar turma de ${startDate} às ${trainingClass.time}`}
                              onClick={() => updateField("classId", trainingClass.id)}
                              className={cn(
                                "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition",
                                checked
                                  ? "border-tk-brand bg-tk-accent-soft shadow-[inset_0_0_0_1px_var(--tk-brand)]"
                                  : "border-tk-line bg-white hover:border-tk-accent",
                              )}
                            >
                              <span
                                className={cn(
                                  "h-4 w-4 shrink-0 rounded-full border-2 shadow-[inset_0_0_0_2.5px_#fff]",
                                  checked ? "border-tk-brand bg-tk-brand" : "border-tk-line bg-white",
                                )}
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold text-tk-ink">{startDate}</span>
                                <span className="mt-0.5 block text-caption text-tk-ink-muted">
                                  {trainingClass.modality} · {trainingClass.time}
                                </span>
                              </span>
                              <span
                                className={cn(
                                  "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                                  trainingClass.availableSeats <= 3
                                    ? "bg-[#fdecee] text-tk-error"
                                    : "bg-[#e6f4ef] text-tk-success",
                                )}
                              >
                                {vacancyLabel}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {fieldErrors.classId ? (
                        <p className="mt-3 text-caption text-tk-error" role="alert">
                          {fieldErrors.classId}
                        </p>
                      ) : null}
                    </section>

                    <section className="rounded-tk-card border border-tk-line bg-white p-6 shadow-tk-glass md:p-8">
                      <SectionTitle title="Dados do comprador" />

                      <div className="mb-5 grid grid-cols-2 gap-1 rounded-[10px] border border-tk-line bg-[var(--tk-surface-2)] p-1">
                        <button
                          type="button"
                          onClick={() => updateField("buyerType", "pf")}
                          className={cn(
                            "rounded-[7px] px-4 py-2.5 text-sm font-semibold transition",
                            form.buyerType === "pf" ? "bg-white text-tk-brand shadow-sm" : "text-tk-ink-muted",
                          )}
                        >
                          Pessoa física
                        </button>
                        <button
                          type="button"
                          onClick={() => updateField("buyerType", "pj")}
                          className={cn(
                            "rounded-[7px] px-4 py-2.5 text-sm font-semibold transition",
                            form.buyerType === "pj" ? "bg-white text-tk-brand shadow-sm" : "text-tk-ink-muted",
                          )}
                        >
                          Pessoa jurídica (nota fiscal)
                        </button>
                      </div>

                      {form.buyerType === "pf" ? (
                        <div className="mb-5 grid gap-4 md:grid-cols-2">
                          <div className="md:col-span-2">
                            <Field label="Nome completo" required error={fieldErrors.studentName}>
                              <Input
                                value={form.studentName}
                                onChange={(event) => updateField("studentName", event.target.value)}
                                placeholder="Seu nome completo"
                              />
                            </Field>
                          </div>
                          <Field label="CPF" required error={fieldErrors.cpf}>
                            <Input
                              value={form.cpf}
                              onChange={(event) => updateField("cpf", formatCPF(event.target.value))}
                              placeholder="000.000.000-00"
                            />
                          </Field>
                          <Field label="Telefone" required error={fieldErrors.phone}>
                            <Input
                              type="tel"
                              value={form.phone}
                              onChange={(event) => updateField("phone", formatPhone(event.target.value))}
                              placeholder="(00) 00000-0000"
                            />
                          </Field>
                          <div className="md:col-span-2">
                            <Field label="E-mail" required error={fieldErrors.email}>
                              <Input
                                type="email"
                                value={form.email}
                                onChange={(event) => updateField("email", event.target.value)}
                                placeholder="voce@email.com.br"
                              />
                            </Field>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-5 grid gap-4 md:grid-cols-2">
                          <div className="md:col-span-2">
                            <Field label="Razão social" required error={fieldErrors.organization}>
                              <Input
                                value={form.organization}
                                onChange={(event) => updateField("organization", event.target.value)}
                                placeholder="Nome da empresa"
                              />
                            </Field>
                          </div>
                          <Field label="CNPJ" required error={fieldErrors.cnpj}>
                            <Input
                              value={form.cnpj}
                              onChange={(event) => updateField("cnpj", formatCNPJ(event.target.value))}
                              placeholder="00.000.000/0000-00"
                            />
                          </Field>
                          <Field label="Nome do responsável" required error={fieldErrors.contactName}>
                            <Input
                              value={form.contactName}
                              onChange={(event) => updateField("contactName", event.target.value)}
                              placeholder="Quem vai participar"
                            />
                          </Field>
                          <Field label="Telefone" required error={fieldErrors.phone}>
                            <Input
                              type="tel"
                              value={form.phone}
                              onChange={(event) => updateField("phone", formatPhone(event.target.value))}
                              placeholder="(00) 00000-0000"
                            />
                          </Field>
                          <Field label="E-mail" required error={fieldErrors.email}>
                            <Input
                              type="email"
                              value={form.email}
                              onChange={(event) => updateField("email", event.target.value)}
                              placeholder="financeiro@empresa.com.br"
                            />
                          </Field>
                          <div className="md:col-span-2">
                            <Field label="CPF do responsável" required error={fieldErrors.cpf}>
                              <Input
                                value={form.cpf}
                                onChange={(event) => updateField("cpf", formatCPF(event.target.value))}
                                placeholder="000.000.000-00"
                              />
                            </Field>
                          </div>
                        </div>
                      )}

                      <div className="mb-4 border-t border-tk-line pt-4">
                        <p className="mb-3 text-caption font-semibold uppercase tracking-[0.06em] text-tk-ink-muted">
                          Endereço de cobrança
                        </p>
                        <div className="grid gap-4 md:grid-cols-3">
                          <Field label="CEP">
                            <Input
                              value={form.zipCode}
                              onChange={(event) => updateField("zipCode", formatCEP(event.target.value))}
                              placeholder="00000-000"
                            />
                          </Field>
                          <div className="md:col-span-2">
                            <Field label="Endereço">
                              <Input
                                value={form.street}
                                onChange={(event) => updateField("street", event.target.value)}
                                placeholder="Rua, avenida..."
                              />
                            </Field>
                          </div>
                          <Field label="Número">
                            <Input
                              value={form.streetNumber}
                              onChange={(event) => updateField("streetNumber", event.target.value)}
                              placeholder="123"
                            />
                          </Field>
                          <Field label="Complemento">
                            <Input
                              value={form.complement}
                              onChange={(event) => updateField("complement", event.target.value)}
                              placeholder="Sala, bloco..."
                            />
                          </Field>
                          <Field label="Bairro">
                            <Input
                              value={form.neighborhood}
                              onChange={(event) => updateField("neighborhood", event.target.value)}
                              placeholder="Bairro"
                            />
                          </Field>
                          <Field label="Cidade">
                            <Input
                              value={form.city}
                              onChange={(event) => updateField("city", event.target.value)}
                              placeholder="Cidade"
                            />
                          </Field>
                          <Field label="Estado">
                            <select
                              aria-label="Estado"
                              className="h-11 rounded-tk-input border border-tk-line bg-white px-3 text-sm text-tk-ink outline-none transition focus-visible:ring-2 focus-visible:ring-tk-focus"
                              value={form.stateCode}
                              onChange={(event) => updateField("stateCode", event.target.value)}
                            >
                              <option value="">UF</option>
                              <option value="DF">DF</option>
                              <option value="GO">GO</option>
                              <option value="MG">MG</option>
                              <option value="PR">PR</option>
                              <option value="RJ">RJ</option>
                              <option value="RS">RS</option>
                              <option value="SP">SP</option>
                            </select>
                          </Field>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button size="lg" onClick={goToPayment}>
                          Continuar para pagamento →
                        </Button>
                      </div>
                    </section>
                  </>
                ) : (
                  <section className="rounded-tk-card border border-tk-line bg-white p-6 shadow-tk-glass md:p-8">
                    <SectionTitle title="Forma de pagamento" />

                    <div className="grid gap-2" role="radiogroup" aria-label="Forma de pagamento">
                      <PaymentCard
                        checked={form.paymentMethod === "Cartão"}
                        title="Cartão de crédito"
                        description="Em até 6x sem juros"
                        icon={<CreditCard className="h-4 w-4 text-tk-brand" aria-hidden="true" />}
                        onClick={() => updateField("paymentMethod", "Cartão")}
                      />
                      <PaymentCard
                        checked={form.paymentMethod === "Pix"}
                        title="Pix"
                        description="Pagamento à vista com confirmação rápida"
                        icon={<QrCode className="h-4 w-4 text-tk-brand" aria-hidden="true" />}
                        onClick={() => updateField("paymentMethod", "Pix")}
                      />
                      <PaymentCard
                        checked={form.paymentMethod === "Boleto"}
                        title="Boleto bancário"
                        description="Vencimento em 3 dias úteis"
                        icon={<TicketPercent className="h-4 w-4 text-tk-brand" aria-hidden="true" />}
                        onClick={() => updateField("paymentMethod", "Boleto")}
                      />
                      <PaymentCard
                        checked={form.paymentMethod === "Empenho"}
                        title="Nota de empenho"
                        description="Para órgãos públicos, sem pagamento online"
                        icon={<Landmark className="h-4 w-4 text-tk-brand" aria-hidden="true" />}
                        onClick={() => updateField("paymentMethod", "Empenho")}
                      />
                    </div>

                    {form.paymentMethod === "Cartão" ? (
                      <div className="mt-5 grid gap-4 rounded-[14px] border border-[#ead9b0] bg-[var(--tk-cream)] p-5 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <Field label="Nome impresso no cartão" required error={fieldErrors.cardName}>
                            <Input
                              value={form.cardName}
                              onChange={(event) => updateField("cardName", event.target.value)}
                              placeholder="Como está no cartão"
                            />
                          </Field>
                        </div>
                        <div className="md:col-span-2">
                          <Field label="Número do cartão" required error={fieldErrors.cardNumber}>
                            <Input
                              value={form.cardNumber}
                              onChange={(event) => updateField("cardNumber", event.target.value)}
                              placeholder="0000 0000 0000 0000"
                            />
                          </Field>
                        </div>
                        <Field label="Validade" required error={fieldErrors.cardExpiry}>
                          <Input
                            value={form.cardExpiry}
                            onChange={(event) =>
                              updateField("cardExpiry", event.target.value.replace(/[^\d/]/g, "").slice(0, 5))
                            }
                            placeholder="MM/AA"
                          />
                        </Field>
                        <Field label="CVV" required error={fieldErrors.cardCvv}>
                          <Input
                            value={form.cardCvv}
                            onChange={(event) => updateField("cardCvv", event.target.value.replace(/\D/g, "").slice(0, 4))}
                            placeholder="123"
                          />
                        </Field>
                        <div className="md:col-span-2">
                          <Field label="Parcelamento">
                            <select
                              aria-label="Parcelamento"
                              className="h-11 w-full rounded-tk-input border border-tk-line bg-white px-3 text-sm text-tk-ink outline-none transition focus-visible:ring-2 focus-visible:ring-tk-focus"
                              value={form.installments}
                              onChange={(event) => updateField("installments", event.target.value)}
                            >
                              {Array.from({ length: 6 }, (_, index) => index + 1).map((option) => (
                                <option key={option} value={String(option)}>
                                  {option === 1 ? "1x sem juros" : `${option}x sem juros`}
                                </option>
                              ))}
                            </select>
                          </Field>
                        </div>
                      </div>
                    ) : null}

                    {form.paymentMethod === "Pix" || form.paymentMethod === "Boleto" ? (
                      <div className="mt-5 flex gap-3 rounded-[14px] border border-[#ead9b0] bg-[var(--tk-cream)] p-5 text-sm leading-6 text-tk-ink-muted">
                        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-tk-brand" aria-hidden="true" />
                        <p>
                          O código de pagamento é gerado assim que você finalizar a compra. A vaga é confirmada
                          após a identificação do pagamento.
                        </p>
                      </div>
                    ) : null}

                    {form.paymentMethod === "Empenho" ? (
                      <div className="mt-5 grid gap-4 rounded-[14px] border border-[#ead9b0] bg-[var(--tk-cream)] p-5 md:grid-cols-2">
                        <div className="md:col-span-2 flex gap-3 text-sm leading-6 text-tk-ink-muted">
                          <Landmark className="mt-0.5 h-5 w-5 shrink-0 text-tk-brand" aria-hidden="true" />
                          <p>
                            Para órgãos públicos, a vaga é reservada mediante nota de empenho. Nossa equipe envia
                            a documentação após a finalização.
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <Field label="Órgão / entidade" required error={fieldErrors.commitmentUnit}>
                            <Input
                              value={form.commitmentUnit}
                              onChange={(event) => updateField("commitmentUnit", event.target.value)}
                              placeholder="Nome do órgão"
                            />
                          </Field>
                        </div>
                        <Field label="Código UASG (opcional)">
                          <Input
                            value={form.commitmentCode}
                            onChange={(event) => updateField("commitmentCode", event.target.value)}
                            placeholder="000000"
                          />
                        </Field>
                      </div>
                    ) : null}

                    <div className="mt-6 border-t border-tk-line pt-4">
                      <label className="flex items-start gap-3 text-sm text-tk-ink">
                        <Checkbox
                          checked={form.acceptedTerms}
                          onCheckedChange={(checked) => updateField("acceptedTerms", checked)}
                          aria-label="Li e aceito os termos de uso e a política de cancelamento"
                        />
                        <span>Li e aceito os termos de uso e a política de cancelamento</span>
                      </label>
                      {fieldErrors.acceptedTerms ? (
                        <div
                          className="mt-3 rounded-lg border border-[#f7ccd2] bg-[#fdeef0] px-3 py-2 text-sm text-tk-error"
                          role="alert"
                        >
                          {fieldErrors.acceptedTerms}
                        </div>
                      ) : null}
                    </div>

                    {submitError ? (
                      <div className="mt-4 rounded-lg border border-[#f7ccd2] bg-[#fdeef0] px-4 py-3 text-sm text-tk-error" role="alert">
                        {submitError}
                      </div>
                    ) : null}

                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                      <Button size="lg" variant="secondary" onClick={() => setStep(0)}>
                        ← Voltar
                      </Button>
                      <Button size="lg" loading={isSaving} onClick={finish}>
                        Finalizar compra →
                      </Button>
                    </div>
                  </section>
                )}
              </main>

              <aside className="grid gap-4 md:sticky md:top-6 md:self-start">
                <div className="overflow-hidden rounded-tk-card border border-tk-line bg-white shadow-card">
                  <div className="h-[140px] overflow-hidden bg-[var(--tk-surface-2)]">
                    <img alt={course.title} className="h-full w-full object-cover" src={coverImage} />
                  </div>
                  <div className="p-6">
                    <p className="mb-1 text-caption font-semibold uppercase tracking-[0.06em] text-tk-ink-muted">
                      Você está comprando
                    </p>
                    <h3 className="font-display text-lg font-bold tracking-[-0.01em] text-tk-ink">{course.title}</h3>
                    <p className="mt-1 text-sm text-tk-ink-muted">
                      {selectedClass
                        ? `${new Intl.DateTimeFormat("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(selectedClass.startDate))} · ${selectedClass.modality} · ${selectedClass.time}`
                        : "Selecione uma turma para ver o resumo."}
                    </p>

                    <div className="mt-5 grid gap-2 border-t border-tk-line pt-4 text-sm text-tk-ink-muted">
                      <div className="flex items-center justify-between">
                        <span>Subtotal</span>
                        <span>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(course.price)}</span>
                      </div>
                      {hasDiscount ? (
                        <div className="flex items-center justify-between text-tk-success">
                          <span>Desconto (cupom {form.couponCode.trim().toUpperCase()})</span>
                          <span>-{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(discountValue)}</span>
                        </div>
                      ) : null}
                      <div className="flex items-center justify-between border-t border-tk-line pt-3">
                        <span className="font-semibold text-tk-ink">Total</span>
                        <span className="font-display text-2xl font-bold text-tk-brand">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(total)}
                        </span>
                      </div>
                      <div className="text-caption">
                        {form.paymentMethod === "Cartão"
                          ? `em ${installments}x de ${new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(total / installments)} sem juros`
                          : form.paymentMethod === "Empenho"
                            ? "sem pagamento online — aguarda empenho"
                            : "pagamento à vista"}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Input
                        aria-label="Cupom de desconto"
                        value={form.couponCode}
                        onChange={(event) => {
                          updateField("couponCode", event.target.value);
                          setCouponStatus("idle");
                        }}
                        placeholder="Cupom de desconto"
                      />
                      <Button size="sm" variant="secondary" onClick={applyCoupon}>
                        Aplicar
                      </Button>
                    </div>
                    {couponStatus === "invalid" ? (
                      <p className="mt-2 text-caption text-tk-error">Cupom inválido ou expirado.</p>
                    ) : null}
                    {couponStatus === "valid" ? (
                      <p className="mt-2 text-caption text-tk-success">Cupom aplicado com sucesso!</p>
                    ) : null}
                  </div>
                </div>

                <div className="flex gap-3 rounded-2xl border border-tk-line bg-white px-5 py-4 text-sm leading-6 text-tk-ink-muted">
                  <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-tk-brand" aria-hidden="true" />
                  <p>
                    <strong className="text-tk-ink">Compra 100% segura.</strong> Seus dados são protegidos e o
                    pagamento é processado com criptografia de ponta a ponta.
                  </p>
                </div>

                {step === 1 ? (
                  <div className="flex gap-3 rounded-2xl border border-[#bfe0e9] bg-tk-accent-soft px-5 py-4 text-sm leading-6 text-tk-ink-muted">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-tk-brand" aria-hidden="true" />
                    <p>
                      {form.paymentMethod === "Cartão"
                        ? "Enviaremos o comprovante da compra e as orientações da turma para o e-mail informado."
                        : form.paymentMethod === "Empenho"
                          ? "Nossa equipe entrará em contato em até 1 dia útil com a documentação para a nota de empenho."
                          : "O código de pagamento será enviado por e-mail após a finalização da inscrição."}
                    </p>
                  </div>
                ) : null}
              </aside>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
