"use client";

import { useActionState } from "react";

import { updateTurmaAction, type AdminFormState } from "@/app/actions/admin";
import {
  ShadcnSelectField,
  ShadcnTextareaField,
  ShadcnTextField,
} from "@/components/shadcn/admin/form-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { AdminAgendaRow, AdminSelectOption } from "@/lib/admin-data";

const initialState: AdminFormState = {
  error: null,
  success: null,
};

const modalityOptions = [
  { value: "Online", label: "Online" },
  { value: "Presencial", label: "Presencial" },
  { value: "Hibrido", label: "Híbrido" },
];

const statusOptions = ["Aberta", "Encerrada", "Cancelada"].map((value) => ({
  value,
  label: value,
}));

type AdminEditTurmaFormProps = {
  turma: AdminAgendaRow;
  courseOptions: AdminSelectOption[];
  instructorOptions: AdminSelectOption[];
  readOnly?: boolean;
};

export function AdminEditTurmaForm({
  turma,
  courseOptions,
  instructorOptions,
  readOnly = false,
}: AdminEditTurmaFormProps) {
  const [state, formAction, pending] = useActionState(
    updateTurmaAction,
    initialState,
  );

  return (
    <form action={formAction}>
      <div className="space-y-4">
        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}
        {state.success ? (
          <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
            <AlertDescription>{state.success}</AlertDescription>
          </Alert>
        ) : null}
        <input name="id" type="hidden" value={turma.id} />
        <div className="grid gap-4 md:grid-cols-2">
          <ShadcnSelectField defaultValue={turma.courseId} disabled={readOnly} label="Curso" name="curso_id" options={courseOptions} required />
          <ShadcnSelectField defaultValue={turma.instructorId ?? undefined} disabled={readOnly} label="Instrutor" name="instrutor_id" options={instructorOptions} required />
          <ShadcnTextField defaultValue={turma.startDate} disabled={readOnly} label="Data de início" name="data_inicio" required />
          <ShadcnTextField defaultValue={turma.endDate ?? ""} disabled={readOnly} label="Data de fim" name="data_fim" />
          <ShadcnTextField defaultValue={turma.schedule} disabled={readOnly} label="Horário" name="horario" required />
          <ShadcnTextField defaultValue={turma.location} disabled={readOnly} label="Local" name="local" required />
          <ShadcnSelectField defaultValue={turma.format} disabled={readOnly} label="Modalidade" name="modalidade" options={modalityOptions} />
          <ShadcnSelectField defaultValue={turma.status} disabled={readOnly} label="Status" name="status" options={statusOptions} />
          <ShadcnTextField defaultValue={turma.seatsTotal} disabled={readOnly} label="Vagas totais" min={0} name="vagas_total" type="number" />
          <ShadcnTextField defaultValue={turma.seatsFilled} disabled={readOnly} label="Vagas preenchidas" min={0} name="vagas_preenchidas" type="number" />
          <ShadcnTextField defaultValue={turma.classPrice} disabled={readOnly} label="Preço da turma" min={0} name="preco_turma" type="number" />
        </div>
        <ShadcnTextareaField defaultValue={turma.notes} disabled={readOnly} label="Observações" name="observacoes" />
        {readOnly ? null : (
          <Button disabled={pending} type="submit">
            {pending ? "Salvando turma..." : "Salvar turma"}
          </Button>
        )}
      </div>
    </form>
  );
}
