"use client";

import { useActionState } from "react";

import { updateTurmaAction, type AdminFormState } from "@/app/actions/admin";
import { TextField } from "@/components/forms/field/text-field";
import { SelectField } from "@/components/forms/field/select-field";
import { TextareaField } from "@/components/forms/field/textarea-field";
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
          <SelectField defaultValue={turma.courseId} disabled={readOnly} label="Curso" name="curso_id" options={courseOptions} required />
          <SelectField defaultValue={turma.instructorId ?? undefined} disabled={readOnly} label="Instrutor" name="instrutor_id" options={instructorOptions} required />
          <TextField defaultValue={turma.startDate} disabled={readOnly} label="Data de início" name="data_inicio" required />
          <TextField defaultValue={turma.endDate ?? ""} disabled={readOnly} label="Data de fim" name="data_fim" />
          <TextField defaultValue={turma.schedule} disabled={readOnly} label="Horário" name="horario" required />
          <TextField defaultValue={turma.location} disabled={readOnly} label="Local" name="local" required />
          <SelectField defaultValue={turma.format} disabled={readOnly} label="Modalidade" name="modalidade" options={modalityOptions} />
          <SelectField defaultValue={turma.status} disabled={readOnly} label="Status" name="status" options={statusOptions} />
          <TextField defaultValue={turma.seatsTotal} disabled={readOnly} label="Vagas totais" min={0} name="vagas_total" type="number" />
          <TextField defaultValue={turma.seatsFilled} disabled={readOnly} label="Vagas preenchidas" min={0} name="vagas_preenchidas" type="number" />
          <TextField defaultValue={turma.classPrice} disabled={readOnly} label="Preço da turma" min={0} name="preco_turma" type="number" />
        </div>
        <TextareaField defaultValue={turma.notes} disabled={readOnly} label="Observações" name="observacoes" />
        {readOnly ? null : (
          <Button disabled={pending} type="submit">
            {pending ? "Salvando turma..." : "Salvar turma"}
          </Button>
        )}
      </div>
    </form>
  );
}
