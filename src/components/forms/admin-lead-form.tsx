"use client";

import { useActionState } from "react";
import { createLeadAction, updateLeadAction, type AdminFormState } from "@/app/actions/admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/forms/field/text-field";
import { SelectField } from "@/components/forms/field/select-field";
import { TextareaField } from "@/components/forms/field/textarea-field";
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
          <TextField disabled={readOnly} label="Nome" name="nome" defaultValue={lead?.name ?? ""} required />
          <TextField disabled={readOnly} label="E-mail" name="email" defaultValue={lead?.email ?? ""} type="email" />
          <TextField disabled={readOnly} label="Telefone" name="telefone" defaultValue={lead?.phone === "-" ? "" : lead?.phone ?? ""} />
          <SelectField
            disabled={readOnly}
            label="Tipo"
            name="tipo"
            options={typeOptions}
            defaultValue={lead?.type ?? "Contato"}
          />
          <TextField disabled={readOnly} label="Órgão/empresa" name="orgao" defaultValue={lead?.organization ?? ""} />
          <TextField disabled={readOnly} label="Participantes" name="num_participantes" defaultValue={lead?.participants ?? 0} min={0} type="number" />
          <TextField disabled={readOnly} label="Tema de interesse" name="tema_interesse" defaultValue={lead?.interest === "-" ? "" : lead?.interest ?? ""} />
          <SelectField
            disabled={readOnly}
            label="Curso"
            name="curso_id"
            options={courseOptions}
            defaultValue={lead?.courseId ?? undefined}
            placeholder="Sem curso"
          />
          <SelectField
            disabled={readOnly}
            label="Status CRM"
            name="status_crm"
            options={statusOptions}
            defaultValue={lead?.crmStatus ?? "Novo"}
          />
          <TextField disabled={readOnly} label="Origem" name="origem" defaultValue={lead?.origin ?? ""} />
          <TextField disabled={readOnly} label="Modalidade preferida" name="modalidade_preferida" defaultValue={lead?.preferredFormat ?? ""} />
          <TextField disabled={readOnly} label="Tema do treinamento" name="tema_treinamento" defaultValue={lead?.trainingTheme ?? ""} />
          <TextField disabled={readOnly} label="UTM source" name="utm_source" defaultValue={lead?.utmSource ?? ""} />
          <TextField disabled={readOnly} label="UTM medium" name="utm_medium" defaultValue={lead?.utmMedium ?? ""} />
          <TextField disabled={readOnly} label="UTM campaign" name="utm_campaign" defaultValue={lead?.utmCampaign ?? ""} />
          <TextField disabled={readOnly} label="UTM term" name="utm_term" defaultValue={lead?.utmTerm ?? ""} />
          <TextField disabled={readOnly} label="UTM content" name="utm_content" defaultValue={lead?.utmContent ?? ""} />
        </div>
        <TextareaField disabled={readOnly} label="Mensagem" name="mensagem" defaultValue={lead?.message ?? ""} />
        <TextareaField disabled={readOnly} label="Objetivo do treinamento" name="objetivo_treinamento" defaultValue={lead?.trainingGoal ?? ""} />
        <TextareaField disabled={readOnly} label="Desafios principais" name="desafios_principais" defaultValue={lead?.mainChallenges ?? ""} />
        {readOnly ? null : (
          <Button disabled={pending} type="submit" variant={lead ? "default" : "gold"}>
            {lead ? "Salvar lead" : "Criar lead"}
          </Button>
        )}
      </div>
    </form>
  );
}
