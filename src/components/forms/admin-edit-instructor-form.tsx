"use client";

import { useActionState } from "react";

import {
  updateInstructorAction,
  type AdminFormState,
} from "@/app/actions/admin";
import {
  ShadcnSelectField,
  ShadcnTextareaField,
  ShadcnTextField,
} from "@/components/shadcn/admin/form-field";
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
          <ShadcnTextField defaultValue={instructor.name} disabled={readOnly} label="Nome" name="nome" required />
          <ShadcnTextField defaultValue={instructor.email === "-" ? "" : instructor.email} disabled={readOnly} label="E-mail" name="email" type="email" />
          <ShadcnTextField defaultValue={instructor.phone} disabled={readOnly} label="Telefone" name="telefone" />
          <ShadcnTextField defaultValue={instructor.specialty} disabled={readOnly} label="Especialidade" name="especialidade" required />
          <ShadcnTextField defaultValue={instructor.photoUrl} disabled={readOnly} label="URL da foto" name="foto_url" type="url" />
          <ShadcnTextField defaultValue={instructor.rating} disabled={readOnly} label="Rating" max={5} min={0} name="rating" step={0.1} type="number" />
          <ShadcnSelectField defaultValue={instructor.status} disabled={readOnly} label="Status" name="status" options={statusOptions} />
        </div>
        <ShadcnTextareaField defaultValue={instructor.areas.join("\n")} disabled={readOnly} label="Áreas de atuação" name="areas_atuacao" required />
        <ShadcnTextareaField defaultValue={instructor.bio} disabled={readOnly} label="Bio" name="bio" />
        <ShadcnTextareaField defaultValue={instructor.education} disabled={readOnly} label="Formação" name="formacao" />
        {readOnly ? null : (
          <Button disabled={pending} type="submit">
            {pending ? "Salvando instrutor..." : "Salvar instrutor"}
          </Button>
        )}
      </div>
    </form>
  );
}
