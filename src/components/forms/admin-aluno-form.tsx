"use client";

import { useActionState } from "react";
import { createAlunoAction, updateAlunoAction, type AdminFormState } from "@/app/actions/admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  ShadcnSelectField,
  ShadcnTextField,
} from "@/components/shadcn/admin/form-field";
import type { AdminAlunoRow } from "@/lib/admin-data";

const initialState: AdminFormState = {
  error: null,
  success: null,
};

const studentTypeOptions = [
  { value: "PF", label: "Pessoa física" },
  { value: "PJ", label: "Pessoa jurídica" },
];

type AdminAlunoFormProps = {
  aluno?: AdminAlunoRow;
  readOnly?: boolean;
};

export function AdminAlunoForm({ aluno, readOnly = false }: AdminAlunoFormProps) {
  const [state, formAction, pending] = useActionState(
    aluno ? updateAlunoAction : createAlunoAction,
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
        {aluno ? <input name="id" type="hidden" value={aluno.id} /> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <ShadcnTextField
            autoComplete="name"
            defaultValue={aluno?.fullName ?? ""}
            disabled={readOnly}
            label="Nome completo"
            name="nome_completo"
            required
          />
          <ShadcnTextField
            autoComplete="email"
            defaultValue={aluno?.email ?? ""}
            disabled={readOnly}
            label="E-mail"
            name="email"
            required
            type="email"
          />
          <ShadcnTextField
            autoComplete="off"
            defaultValue={aluno?.cpf ?? ""}
            disabled={readOnly}
            label="CPF"
            name="cpf"
            placeholder="Somente números ou formatado"
          />
          <ShadcnTextField
            autoComplete="tel"
            defaultValue={aluno?.phone ?? ""}
            disabled={readOnly}
            label="Telefone"
            name="telefone"
            placeholder="DDD + número"
          />
          <ShadcnTextField
            defaultValue={aluno?.role ?? ""}
            disabled={readOnly}
            label="Cargo"
            name="cargo"
          />
          <ShadcnTextField
            autoComplete="organization"
            defaultValue={aluno?.organization ?? ""}
            disabled={readOnly}
            label="Órgão/empresa"
            name="orgao"
          />
          <ShadcnSelectField
            options={studentTypeOptions}
            defaultValue={aluno?.studentType ?? "PF"}
            disabled={readOnly}
            label="Tipo de aluno"
            name="tipo_aluno"
            required
          />
          <ShadcnTextField
            defaultValue={aluno?.userId ?? ""}
            disabled={readOnly}
            label="User ID"
            name="user_id"
            placeholder="UUID do Supabase Auth"
          />
        </div>
        {readOnly ? null : (
          <Button disabled={pending} type="submit" variant={aluno ? "default" : "gold"}>
            {aluno ? "Salvar aluno" : "Criar aluno"}
          </Button>
        )}
      </div>
    </form>
  );
}
