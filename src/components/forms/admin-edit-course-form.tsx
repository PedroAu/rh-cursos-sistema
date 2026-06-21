"use client";

import { useActionState } from "react";

import { updateCourseAction, type AdminFormState } from "@/app/actions/admin";
import { TextField } from "@/components/forms/field/text-field";
import { SelectField } from "@/components/forms/field/select-field";
import { TextareaField } from "@/components/forms/field/textarea-field";
import { CheckboxField } from "@/components/forms/field/checkbox-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { AdminCourseRow } from "@/lib/admin-data";

const initialState: AdminFormState = {
  error: null,
  success: null,
};

const modalityOptions = [
  { value: "Online", label: "Online" },
  { value: "Presencial", label: "Presencial" },
  { value: "Hibrido", label: "Híbrido" },
];

const levelOptions = [
  { value: "Basico", label: "Básico" },
  { value: "Intermediario", label: "Intermediário" },
  { value: "Avancado", label: "Avançado" },
];

const statusOptions = ["Ativo", "Rascunho", "Destaque", "Arquivado"].map((value) => ({
  value,
  label: value,
}));

type AdminEditCourseFormProps = {
  course: AdminCourseRow;
  readOnly?: boolean;
};

export function AdminEditCourseForm({ course, readOnly = false }: AdminEditCourseFormProps) {
  const [state, formAction, pending] = useActionState(
    updateCourseAction,
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
        <input name="id" type="hidden" value={course.id} />
        <div className="grid gap-4 md:grid-cols-2">
          <TextField defaultValue={course.title} disabled={readOnly} label="Título" name="titulo" required />
          <TextField defaultValue={course.slug} disabled={readOnly} label="Slug" name="slug" required />
          <TextField defaultValue={course.category} disabled={readOnly} label="Categoria" name="categoria" />
          <TextField defaultValue={course.trackId} disabled={readOnly} label="Trilha ID" name="trilha_id" />
          <TextField defaultValue={course.trackName} disabled={readOnly} label="Trilha nome" name="trilha_nome" />
          <TextField defaultValue={course.publicType} disabled={readOnly} label="Tipo de público" name="tipo_publico" />
          <TextField defaultValue={course.coverImage} disabled={readOnly} label="Imagem de capa" name="imagem_capa" type="url" />
          <TextField defaultValue={course.workload} disabled={readOnly} label="Carga horária" min={0} name="carga_horaria" type="number" />
          <TextField defaultValue={course.basePrice} disabled={readOnly} label="Preço base" min={0} name="preco_base" type="number" />
          <TextField defaultValue={course.rating} disabled={readOnly} label="Rating" max={5} min={0} name="rating" step={0.1} type="number" />
          <TextField defaultValue={course.totalStudents} disabled={readOnly} label="Total de alunos" min={0} name="total_alunos" type="number" />
          <SelectField
            defaultValue={course.courseFormat}
            disabled={readOnly}
            label="Modalidade base"
            name="modalidade"
            options={modalityOptions}
          />
          <SelectField
            defaultValue={course.level}
            disabled={readOnly}
            label="Nível"
            name="nivel"
            options={levelOptions}
          />
          <SelectField
            defaultValue={course.courseStatus}
            disabled={readOnly}
            label="Status do curso"
            name="status"
            options={statusOptions}
          />
        </div>
        <TextareaField defaultValue={course.shortDescription} disabled={readOnly} label="Descrição curta" name="descricao_curta" />
        <TextareaField defaultValue={course.description} disabled={readOnly} label="Descrição" name="descricao" />
        <TextareaField defaultValue={course.syllabus.join("\n")} disabled={readOnly} label="Ementa" name="ementa" required />
        <TextareaField defaultValue={course.objectives.join("\n")} disabled={readOnly} label="Objetivos" name="objetivos" required />
        <TextareaField defaultValue={course.benefits.join("\n")} disabled={readOnly} label="Benefícios" name="beneficios" required />
        <TextareaField defaultValue={course.audience.join("\n")} disabled={readOnly} label="Público-alvo" name="publico_alvo" required />
        <CheckboxField
          defaultChecked={course.highlighted}
          disabled={readOnly}
          label="Marcar como destaque"
          name="destaque"
        />
        {readOnly ? null : (
          <Button disabled={pending} type="submit">
            {pending ? "Salvando curso..." : "Salvar curso"}
          </Button>
        )}
      </div>
    </form>
  );
}
