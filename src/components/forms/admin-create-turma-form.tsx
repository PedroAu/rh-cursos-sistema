"use client";

import { useActionState } from "react";

import {
  createTurmaAction,
  type AdminFormState,
} from "@/app/actions/admin";
import {
  ShadcnSelectField,
  ShadcnTextareaField,
  ShadcnTextField,
} from "@/components/shadcn/admin/form-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { AdminSelectOption } from "@/lib/admin-data";

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

type AdminCreateTurmaFormProps = {
  courseOptions: AdminSelectOption[];
  instructorOptions: AdminSelectOption[];
};

export function AdminCreateTurmaForm({
  courseOptions,
  instructorOptions,
}: AdminCreateTurmaFormProps) {
  const [state, formAction, pending] = useActionState(
    createTurmaAction,
    initialState,
  );
  const canCreate = courseOptions.length > 0 && instructorOptions.length > 0;

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
        {!canCreate ? (
          <Alert className="border-amber-200 bg-amber-50 text-amber-950">
            <AlertDescription>Cadastre pelo menos um curso e um professor antes de criar turmas.</AlertDescription>
          </Alert>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <ShadcnSelectField label="Curso" name="curso_id" options={courseOptions} placeholder="Selecione um curso" required />
          <ShadcnSelectField label="Instrutor" name="instrutor_id" options={instructorOptions} placeholder="Selecione um professor" required />
          <ShadcnTextField label="Data de início" name="data_inicio" placeholder="2026-08-11" required />
          <ShadcnTextField label="Data de fim" name="data_fim" placeholder="2026-08-12" />
          <ShadcnTextField label="Horário" name="horario" placeholder="09:00 às 17:00" required />
          <ShadcnTextField label="Local" name="local" placeholder="Online ao vivo" required />
          <ShadcnSelectField defaultValue="Online" label="Modalidade" name="modalidade" options={modalityOptions} />
          <ShadcnSelectField defaultValue="Aberta" label="Status" name="status" options={statusOptions} />
          <ShadcnTextField defaultValue={0} label="Vagas totais" min={0} name="vagas_total" type="number" />
          <ShadcnTextField defaultValue={0} label="Vagas preenchidas" min={0} name="vagas_preenchidas" type="number" />
          <ShadcnTextField defaultValue={0} label="Preço da turma" min={0} name="preco_turma" type="number" />
        </div>
        <ShadcnTextareaField label="Observações" name="observacoes" />
        <Button disabled={!canCreate || pending} type="submit" variant="gold">
          {pending ? "Criando turma..." : "Criar turma"}
        </Button>
      </div>
    </form>
  );
}
