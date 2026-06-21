"use client";

import { useActionState } from "react";

import {
  createInstructorAction,
  type AdminFormState,
} from "@/app/actions/admin";
import { TextField } from "@/components/forms/field/text-field";
import { SelectField } from "@/components/forms/field/select-field";
import { TextareaField } from "@/components/forms/field/textarea-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const initialState: AdminFormState = {
  error: null,
  success: null,
};

const statusOptions = ["Ativo", "Inativo", "Planejado"].map((value) => ({
  value,
  label: value,
}));

export function AdminCreateInstructorForm() {
  const [state, formAction, pending] = useActionState(
    createInstructorAction,
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
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Nome" name="nome" placeholder="Nome do instrutor" required />
          <TextField label="E-mail" name="email" placeholder="instrutor@rhcursos.com" type="email" />
          <TextField label="Telefone" name="telefone" placeholder="(11) 99999-9999" />
          <TextField label="Especialidade" name="especialidade" placeholder="Ex.: Licitações e contratos" required />
          <TextField label="URL da foto" name="foto_url" type="url" />
          <TextField defaultValue={0} label="Rating" max={5} min={0} name="rating" step={0.1} type="number" />
          <SelectField defaultValue="Ativo" label="Status" name="status" options={statusOptions} />
        </div>
        <TextareaField label="Áreas de atuação" name="areas_atuacao" placeholder="Uma área por linha" required />
        <TextareaField label="Bio" name="bio" />
        <TextareaField label="Formação" name="formacao" />
        <Button disabled={pending} type="submit" variant="gold">
          {pending ? "Criando instrutor..." : "Criar instrutor"}
        </Button>
      </div>
    </form>
  );
}
