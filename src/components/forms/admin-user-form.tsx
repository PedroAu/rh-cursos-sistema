"use client";

import { useActionState } from "react";
import {
  createSystemUserAction,
  updateSystemUserAction,
  type AdminFormState,
} from "@/app/actions/admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  ShadcnSelectField,
  ShadcnTextField,
} from "@/components/shadcn/admin/form-field";
import type { AdminUserRow } from "@/lib/admin-data";

const initialState: AdminFormState = {
  error: null,
  success: null,
};

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "professor", label: "Professor" },
  { value: "aluno", label: "Aluno" },
];

const statusOptions = [
  { value: "ativo", label: "Ativo" },
  { value: "pendente", label: "Pendente" },
  { value: "inativo", label: "Inativo" },
];

type AdminUserFormProps = {
  user?: AdminUserRow;
  readOnly?: boolean;
};

export function AdminUserForm({ user, readOnly = false }: AdminUserFormProps) {
  const [state, formAction, pending] = useActionState(
    user ? updateSystemUserAction : createSystemUserAction,
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
        {user ? <input name="id" type="hidden" value={user.id} /> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <ShadcnTextField disabled={readOnly} label="Nome" name="nome" defaultValue={user?.name ?? ""} required />
          <ShadcnTextField disabled={readOnly} label="E-mail" name="email" defaultValue={user?.email ?? ""} required type="email" />
          {user ? null : (
            <ShadcnTextField
              disabled={readOnly}
              label="Senha provisória"
              minLength={8}
              name="password"
              required
              type="password"
            />
          )}
          <ShadcnSelectField
            options={roleOptions}
            defaultValue={user?.role ?? "professor"}
            disabled={readOnly}
            label="Perfil"
            name="role"
          />
          <ShadcnSelectField
            options={statusOptions}
            defaultValue={user?.status ?? "ativo"}
            disabled={readOnly}
            label="Status"
            name="status"
          />
        </div>
        {readOnly ? null : (
          <Button disabled={pending} type="submit">
            {user ? "Salvar usuário" : "Criar usuário"}
          </Button>
        )}
      </div>
    </form>
  );
}
