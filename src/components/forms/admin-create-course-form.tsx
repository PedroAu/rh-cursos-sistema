"use client";

import { useActionState } from "react";

import { createCourseAction, type AdminFormState } from "@/app/actions/admin";
import { TextField } from "@/components/forms/field/text-field";
import { SelectField } from "@/components/forms/field/select-field";
import { TextareaField } from "@/components/forms/field/textarea-field";
import { CheckboxField } from "@/components/forms/field/checkbox-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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

export function AdminCreateCourseForm() {
  const [state, formAction, pending] = useActionState(
    createCourseAction,
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
          <TextField label="Título" name="titulo" placeholder="Nome do curso" required />
          <TextField label="Slug" name="slug" placeholder="nome-do-curso" required />
          <TextField label="Categoria" name="categoria" placeholder="Categoria" />
          <TextField label="Trilha ID" name="trilha_id" />
          <TextField label="Trilha nome" name="trilha_nome" />
          <TextField label="Tipo de público" name="tipo_publico" />
          <TextField label="Imagem de capa" name="imagem_capa" type="url" />
          <TextField defaultValue={8} label="Carga horária" min={1} name="carga_horaria" type="number" />
          <TextField defaultValue={0} label="Preço base" min={0} name="preco_base" type="number" />
          <TextField defaultValue={0} label="Rating" max={5} min={0} name="rating" step={0.1} type="number" />
          <TextField defaultValue={0} label="Total de alunos" min={0} name="total_alunos" type="number" />
          <SelectField defaultValue="Online" label="Modalidade" name="modalidade" options={modalityOptions} />
          <SelectField defaultValue="Basico" label="Nível" name="nivel" options={levelOptions} />
          <SelectField defaultValue="Rascunho" label="Status" name="status" options={statusOptions} />
        </div>
        <TextareaField label="Descrição curta" name="descricao_curta" />
        <TextareaField label="Descrição" name="descricao" />
        <TextareaField label="Ementa" name="ementa" placeholder="Um item por linha" required />
        <TextareaField label="Objetivos" name="objetivos" placeholder="Um item por linha" required />
        <TextareaField label="Benefícios" name="beneficios" placeholder="Um item por linha" required />
        <TextareaField label="Público-alvo" name="publico_alvo" placeholder="Um item por linha" required />
        <CheckboxField label="Destaque" name="destaque" />
        <Button disabled={pending} type="submit" variant="gold">
          {pending ? "Criando curso..." : "Criar curso"}
        </Button>
      </div>
    </form>
  );
}
