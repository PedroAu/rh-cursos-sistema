"use client";

import { useActionState } from "react";

import { updateCourseAction, type AdminFormState } from "@/app/actions/admin";
import {
  ShadcnCheckboxField,
  ShadcnSelectField,
  ShadcnTextareaField,
  ShadcnTextField,
} from "@/components/shadcn/admin/form-field";
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
          <ShadcnTextField defaultValue={course.title} disabled={readOnly} label="Título" name="titulo" required />
          <ShadcnTextField defaultValue={course.slug} disabled={readOnly} label="Slug" name="slug" required />
          <ShadcnTextField defaultValue={course.category} disabled={readOnly} label="Categoria" name="categoria" />
          <ShadcnTextField defaultValue={course.trackId} disabled={readOnly} label="Trilha ID" name="trilha_id" />
          <ShadcnTextField defaultValue={course.trackName} disabled={readOnly} label="Trilha nome" name="trilha_nome" />
          <ShadcnTextField defaultValue={course.publicType} disabled={readOnly} label="Tipo de público" name="tipo_publico" />
          <ShadcnTextField defaultValue={course.coverImage} disabled={readOnly} label="Imagem de capa" name="imagem_capa" type="url" />
          <ShadcnTextField defaultValue={course.workload} disabled={readOnly} label="Carga horária" min={0} name="carga_horaria" type="number" />
          <ShadcnTextField defaultValue={course.basePrice} disabled={readOnly} label="Preço base" min={0} name="preco_base" type="number" />
          <ShadcnTextField defaultValue={course.rating} disabled={readOnly} label="Rating" max={5} min={0} name="rating" step={0.1} type="number" />
          <ShadcnTextField defaultValue={course.totalStudents} disabled={readOnly} label="Total de alunos" min={0} name="total_alunos" type="number" />
          <ShadcnSelectField
            defaultValue={course.courseFormat}
            disabled={readOnly}
            label="Modalidade base"
            name="modalidade"
            options={modalityOptions}
          />
          <ShadcnSelectField
            defaultValue={course.level}
            disabled={readOnly}
            label="Nível"
            name="nivel"
            options={levelOptions}
          />
          <ShadcnSelectField
            defaultValue={course.courseStatus}
            disabled={readOnly}
            label="Status do curso"
            name="status"
            options={statusOptions}
          />
        </div>
        <ShadcnTextareaField defaultValue={course.shortDescription} disabled={readOnly} label="Descrição curta" name="descricao_curta" />
        <ShadcnTextareaField defaultValue={course.description} disabled={readOnly} label="Descrição" name="descricao" />
        <ShadcnTextareaField defaultValue={course.syllabus.join("\n")} disabled={readOnly} label="Ementa" name="ementa" required />
        <ShadcnTextareaField defaultValue={course.objectives.join("\n")} disabled={readOnly} label="Objetivos" name="objetivos" required />
        <ShadcnTextareaField defaultValue={course.benefits.join("\n")} disabled={readOnly} label="Benefícios" name="beneficios" required />
        <ShadcnTextareaField defaultValue={course.audience.join("\n")} disabled={readOnly} label="Público-alvo" name="publico_alvo" required />
        <ShadcnCheckboxField
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
