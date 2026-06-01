import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "@/lib/router-compat";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

  const courseClasses = useMemo(() => classes.filter((item) => item.courseId === course.id), [classes, course.id]);

  const nextStep = () => {
    if (step === 1) {
      if (!form.studentName.trim() || form.studentName.trim().length < 3) {
        toast.error("Nome deve ter no mínimo 3 caracteres.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        toast.error("E-mail inválido.");
        return;
      }
      if (form.phone.replace(/\D/g, "").length < 10) {
        toast.error("Telefone deve ter no mínimo 10 dígitos.");
        return;
      }
      if (form.cpf.replace(/\D/g, "").length !== 11) {
        toast.error("CPF deve ter 11 dígitos.");
        return;
      }
    }

    if (step === 2 && (!form.organization || !form.jobTitle)) {
      toast.error("Preencha os dados profissionais para continuar.");
      return;
    }

    if (step === 3 && !form.classId) {
      toast.error("Escolha uma turma antes de avançar.");
      return;
    }

    setStep((current) => Math.min(4, current + 1));
  };

  const finish = () => {
    if (!form.classId) {
      toast.error("Selecione uma turma para concluir.");
      return;
    }

    createEnrollment({
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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Secure Enrollment</DialogTitle>
        </DialogHeader>
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
              <Input placeholder="Nome completo" value={form.studentName} onChange={(event) => setForm((current) => ({ ...current, studentName: event.target.value }))} />
              <Input type="email" placeholder="E-mail" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
              <Input type="tel" placeholder="Telefone / WhatsApp" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: formatPhone(event.target.value) }))} />
              <Input placeholder="CPF" value={form.cpf} onChange={(event) => setForm((current) => ({ ...current, cpf: formatCPF(event.target.value) }))} />
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Empresa / órgão" value={form.organization} onChange={(event) => setForm((current) => ({ ...current, organization: event.target.value }))} />
              <Input placeholder="Cargo" value={form.jobTitle} onChange={(event) => setForm((current) => ({ ...current, jobTitle: event.target.value }))} />
              <Select value={form.enrollmentType} onValueChange={(value) => setForm((current) => ({ ...current, enrollmentType: value as typeof form.enrollmentType }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de inscrição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pessoa física">Pessoa física</SelectItem>
                  <SelectItem value="Empresa">Empresa</SelectItem>
                  <SelectItem value="Órgão público">Órgão público</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-4">
              {courseClasses.map((trainingClass) => (
                <button
                  key={trainingClass.id}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, classId: trainingClass.id }))}
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
              <Select value={form.paymentMethod} onValueChange={(value) => setForm((current) => ({ ...current, paymentMethod: value as typeof form.paymentMethod }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pix">Pix</SelectItem>
                  <SelectItem value="Cartão">Cartão</SelectItem>
                  <SelectItem value="Boleto">Boleto</SelectItem>
                  <SelectItem value="Empenho">Empenho / nota</SelectItem>
                </SelectContent>
              </Select>
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

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => setStep((current) => Math.max(1, current - 1))}>
              Voltar
            </Button>
            {step < 4 ? <Button onClick={nextStep}>Continuar</Button> : <Button onClick={finish}>Finalizar inscrição</Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
