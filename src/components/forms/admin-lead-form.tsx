"use client";

import { useActionState } from "react";
import { createLeadAction, updateLeadAction, type AdminFormState } from "@/app/actions/admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  ShadcnSelectField,
  ShadcnTextareaField,
  ShadcnTextField,
} from "@/components/shadcn/admin/form-field";
import type { AdminLeadRow, AdminSelectOption } from "@/lib/admin-data";

const initialState: AdminFormState = {
  error: null,
  success: null,
};

const typeOptions = ["Contato", "Curso", "In Company", "Especialista"].map((value) => ({
  value,
  label: value,
}));
const statusOptions = ["Novo", "Em contato", "Qualificado", "Convertido", "Perdido"].map((value) => ({
  value,
  label: value,
}));

type AdminLeadFormProps = {
  lead?: AdminLeadRow;
  courseOptions: AdminSelectOption[];
  readOnly?: boolean;
};

export function AdminLeadForm({ lead, courseOptions, readOnly = false }: AdminLeadFormProps) {
  const [state, formAction, pending] = useActionState(
    lead ? updateLeadAction : createLeadAction,
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
        {lead ? <input name="id" type="hidden" value={lead.id} /> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <ShadcnTextField disabled={readOnly} label="Nome" name="nome" defaultValue={lead?.name ?? ""} required />
          <ShadcnTextField disabled={readOnly} label="E-mail" name="email" defaultValue={lead?.email ?? ""} type="email" />
          <ShadcnTextField disabled={readOnly} label="Telefone" name="telefone" defaultValue={lead?.phone === "-" ? "" : lead?.phone ?? ""} />
          <ShadcnSelectField
            disabled={readOnly}
            label="Tipo"
            name="tipo"
            options={typeOptions}
            defaultValue={lead?.type ?? "Contato"}
          />
          <ShadcnTextField disabled={readOnly} label="Órgão/empresa" name="orgao" defaultValue={lead?.organization ?? ""} />
          <ShadcnTextField disabled={readOnly} label="Participantes" name="num_participantes" defaultValue={lead?.participants ?? 0} min={0} type="number" />
          <ShadcnTextField disabled={readOnly} label="Tema de interesse" name="tema_interesse" defaultValue={lead?.interest === "-" ? "" : lead?.interest ?? ""} />
          <ShadcnSelectField
            disabled={readOnly}
            label="Curso"
            name="curso_id"
            options={courseOptions}
            defaultValue={lead?.courseId ?? undefined}
            placeholder="Sem curso"
          />
          <ShadcnSelectField
            disabled={readOnly}
            label="Status CRM"
            name="status_crm"
            options={statusOptions}
            defaultValue={lead?.crmStatus ?? "Novo"}
          />
          <ShadcnTextField disabled={readOnly} label="Origem" name="origem" defaultValue={lead?.origin ?? ""} />
          <ShadcnTextField disabled={readOnly} label="Modalidade preferida" name="modalidade_preferida" defaultValue={lead?.preferredFormat ?? ""} />
          <ShadcnTextField disabled={readOnly} label="Tema do treinamento" name="tema_treinamento" defaultValue={lead?.trainingTheme ?? ""} />
          <ShadcnTextField disabled={readOnly} label="UTM source" name="utm_source" defaultValue={lead?.utmSource ?? ""} />
          <ShadcnTextField disabled={readOnly} label="UTM medium" name="utm_medium" defaultValue={lead?.utmMedium ?? ""} />
          <ShadcnTextField disabled={readOnly} label="UTM campaign" name="utm_campaign" defaultValue={lead?.utmCampaign ?? ""} />
          <ShadcnTextField disabled={readOnly} label="UTM term" name="utm_term" defaultValue={lead?.utmTerm ?? ""} />
          <ShadcnTextField disabled={readOnly} label="UTM content" name="utm_content" defaultValue={lead?.utmContent ?? ""} />
        </div>
        <ShadcnTextareaField disabled={readOnly} label="Mensagem" name="mensagem" defaultValue={lead?.message ?? ""} />
        <ShadcnTextareaField disabled={readOnly} label="Objetivo do treinamento" name="objetivo_treinamento" defaultValue={lead?.trainingGoal ?? ""} />
        <ShadcnTextareaField disabled={readOnly} label="Desafios principais" name="desafios_principais" defaultValue={lead?.mainChallenges ?? ""} />
        {readOnly ? null : (
          <Button disabled={pending} type="submit" variant={lead ? "default" : "gold"}>
            {lead ? "Salvar lead" : "Criar lead"}
          </Button>
        )}
      </div>
    </form>
  );
}
