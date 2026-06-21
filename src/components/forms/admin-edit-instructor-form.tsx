"use client";

import { useActionState } from "react";

import {
  updateInstructorAction,
  type AdminFormState,
} from "@/app/actions/admin";
import { TextField } from "@/components/forms/field/text-field";
import { SelectField } from "@/components/forms/field/select-field";
import { TextareaField } from "@/components/forms/field/textarea-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { AdminInstructorRow } from "@/lib/admin-data";

const initialState: AdminFormState = {
  error: null,
  success: null,
};

const statusOptions = ["Ativo", "Inativo", "Planejado"].map((value) => ({
  value,
  label: value,
}));

type AdminEditInstructorFormProps = {
  instructor: AdminInstructorRow;
  readOnly?: boolean;
};

export function AdminEditInstructorForm({
  instructor,
  readOnly = false,
}: AdminEditInstructorFormProps) {
  const [state, formAction, pending] = useActionState(
    updateInstructorAction,
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
        <input name="id" type="hidden" value={instructor.id} />
        <div className="grid gap-4 md:grid-cols-2">
          <TextField defaultValue={instructor.name} disabled={readOnly} label="Nome" name="nome" required />
          <TextField defaultValue={instructor.email === "-" ? "" : instructor.email} disabled={readOnly} label="E-mail" name="email" type="email" />
          <TextField defaultValue={instructor.phone} disabled={readOnly} label="Telefone" name="telefone" />
          <TextField defaultValue={instructor.specialty} disabled={readOnly} label="Especialidade" name="especialidade" required />
          <TextField defaultValue={instructor.photoUrl} disabled={readOnly} label="URL da foto" name="foto_url" type="url" />
          <TextField defaultValue={instructor.rating} disabled={readOnly} label="Rating" max={5} min={0} name="rating" step={0.1} type="number" />
          <SelectField defaultValue={instructor.status} disabled={readOnly} label="Status" name="status" options={statusOptions} />
        </div>
        <TextareaField defaultValue={instructor.areas.join("\n")} disabled={readOnly} label="Áreas de atuação" name="areas_atuacao" required />
        <TextareaField defaultValue={instructor.bio} disabled={readOnly} label="Bio" name="bio" />
        <TextareaField defaultValue={instructor.education} disabled={readOnly} label="Formação" name="formacao" />
        {readOnly ? null : (
          <Button disabled={pending} type="submit">
            {pending ? "Salvando instrutor..." : "Salvar instrutor"}
          </Button>
        )}
      </div>
    </form>
  );
}
