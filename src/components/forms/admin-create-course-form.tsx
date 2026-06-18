"use client";

import { useActionState } from "react";

import { createCourseAction, type AdminFormState } from "@/app/actions/admin";
import {
  ShadcnCheckboxField,
  ShadcnSelectField,
  ShadcnTextareaField,
  ShadcnTextField,
} from "@/components/shadcn/admin/form-field";
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
          <ShadcnTextField label="Título" name="titulo" placeholder="Nome do curso" required />
          <ShadcnTextField label="Slug" name="slug" placeholder="nome-do-curso" required />
          <ShadcnTextField label="Categoria" name="categoria" placeholder="Categoria" />
          <ShadcnTextField label="Trilha ID" name="trilha_id" />
          <ShadcnTextField label="Trilha nome" name="trilha_nome" />
          <ShadcnTextField label="Tipo de público" name="tipo_publico" />
          <ShadcnTextField label="Imagem de capa" name="imagem_capa" type="url" />
          <ShadcnTextField defaultValue={8} label="Carga horária" min={1} name="carga_horaria" type="number" />
          <ShadcnTextField defaultValue={0} label="Preço base" min={0} name="preco_base" type="number" />
          <ShadcnTextField defaultValue={0} label="Rating" max={5} min={0} name="rating" step={0.1} type="number" />
          <ShadcnTextField defaultValue={0} label="Total de alunos" min={0} name="total_alunos" type="number" />
          <ShadcnSelectField defaultValue="Online" label="Modalidade" name="modalidade" options={modalityOptions} />
          <ShadcnSelectField defaultValue="Basico" label="Nível" name="nivel" options={levelOptions} />
          <ShadcnSelectField defaultValue="Rascunho" label="Status" name="status" options={statusOptions} />
        </div>
        <ShadcnTextareaField label="Descrição curta" name="descricao_curta" />
        <ShadcnTextareaField label="Descrição" name="descricao" />
        <ShadcnTextareaField label="Ementa" name="ementa" placeholder="Um item por linha" required />
        <ShadcnTextareaField label="Objetivos" name="objetivos" placeholder="Um item por linha" required />
        <ShadcnTextareaField label="Benefícios" name="beneficios" placeholder="Um item por linha" required />
        <ShadcnTextareaField label="Público-alvo" name="publico_alvo" placeholder="Um item por linha" required />
        <ShadcnCheckboxField label="Destaque" name="destaque" />
        <Button disabled={pending} type="submit" variant="gold">
          {pending ? "Criando curso..." : "Criar curso"}
        </Button>
      </div>
    </form>
  );
}
