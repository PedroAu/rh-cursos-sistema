"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";

import { submitLeadAction, type PublicFormState } from "@/app/actions/public";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type PublicLeadFormProps = {
  hiddenFields: Record<string, string>;
  submitLabel: string;
  submitColor?: string;
  submitTextColor?: string;
  showDescriptions?: boolean;
  labels?: Partial<Record<PublicLeadField, string>>;
  placeholders?: Partial<Record<PublicLeadField, string>>;
  fields?: Array<PublicLeadField>;
};

type PublicLeadField =
  | "nome"
  | "email"
  | "telefone"
  | "orgao"
  | "num_participantes"
  | "tema_interesse"
  | "tema_treinamento"
  | "objetivo_treinamento"
  | "desafios_principais"
  | "mensagem";

type FieldProps = {
  label: string;
  name: string;
  placeholder?: string;
  description?: string;
  autoComplete?: string;
  required?: boolean;
  type?: string;
};

type TextareaFieldProps = Omit<FieldProps, "type">;

const initialState: PublicFormState = {
  error: null,
  success: null,
};

function Field({
  label,
  name,
  placeholder,
  description,
  autoComplete,
  required,
  type = "text",
}: FieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <Input
        autoComplete={autoComplete}
        id={name}
        min={type === "number" ? 1 : undefined}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
      {description ? <p className="text-sm leading-6 text-muted-foreground">{description}</p> : null}
    </div>
  );
}

function TextareaField({
  label,
  name,
  placeholder,
  description,
  required,
}: TextareaFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <Textarea id={name} name={name} placeholder={placeholder} required={required} />
      {description ? <p className="text-sm leading-6 text-muted-foreground">{description}</p> : null}
    </div>
  );
}

function getSubmitVariant(submitColor: string): ButtonProps["variant"] {
  if (submitColor === "gold") return "gold";
  if (submitColor === "navy") return "navy";
  if (submitColor === "green") return "whatsapp";

  return "default";
}

function getSubmitClassName(submitTextColor: string) {
  return cn("w-full sm:w-auto", submitTextColor === "white" && "text-white");
}

export function PublicLeadForm({
  hiddenFields,
  submitLabel,
  submitColor = "gold",
  submitTextColor = "navy.9",
  showDescriptions = true,
  labels = {},
  placeholders = {},
  fields = ["nome", "email", "telefone", "mensagem"],
}: PublicLeadFormProps) {
  const [state, formAction, pending] = useActionState(
    submitLeadAction,
    initialState,
  );

  return (
    <form action={formAction}>
      <div className="grid gap-5">
        {Object.entries(hiddenFields).map(([name, value]) => (
          <input key={name} name={name} type="hidden" value={value} />
        ))}

        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}
        {state.success ? (
          <Alert>
            <CheckCircle2 aria-hidden className="size-4" />
            <AlertDescription>{state.success}</AlertDescription>
          </Alert>
        ) : null}

        {fields.includes("nome") ? (
          <Field
            autoComplete="name"
            label={labels.nome ?? "Nome"}
            name="nome"
            placeholder={placeholders.nome ?? "Seu nome completo"}
            required
          />
        ) : null}

        <div className="grid gap-5 md:grid-cols-2">
          {fields.includes("email") ? (
            <Field
              autoComplete="email"
              description={showDescriptions ? "Usaremos este e-mail para o retorno comercial." : undefined}
              label={labels.email ?? "E-mail"}
              name="email"
              placeholder={placeholders.email ?? "voce@empresa.com"}
              required
              type="email"
            />
          ) : null}
          {fields.includes("telefone") ? (
            <Field
              autoComplete="tel"
              description={showDescriptions ? "Inclua DDD para agilizar o contato." : undefined}
              label={labels.telefone ?? "Telefone"}
              name="telefone"
              placeholder={placeholders.telefone ?? "(11) 99999-9999"}
            />
          ) : null}
        </div>

        {fields.includes("orgao") ? (
          <Field
            autoComplete="organization"
            label={labels.orgao ?? "Órgão ou empresa"}
            name="orgao"
            placeholder={placeholders.orgao ?? "Nome da instituicao"}
          />
        ) : null}
        {fields.includes("num_participantes") ? (
          <Field
            description={showDescriptions ? "Estimativa inicial para dimensionar a proposta." : undefined}
            label={labels.num_participantes ?? "Numero de participantes"}
            name="num_participantes"
            type="number"
          />
        ) : null}
        {fields.includes("tema_interesse") ? (
          <Field
            label={labels.tema_interesse ?? "Tema de interesse"}
            name="tema_interesse"
            placeholder={placeholders.tema_interesse ?? "Tema principal"}
          />
        ) : null}
        {fields.includes("tema_treinamento") ? (
          <Field
            label={labels.tema_treinamento ?? "Tema do treinamento"}
            name="tema_treinamento"
            placeholder={placeholders.tema_treinamento ?? "Tema desejado"}
          />
        ) : null}
        {fields.includes("objetivo_treinamento") ? (
          <TextareaField
            description={showDescriptions ? "Explique qual resultado a equipe precisa alcançar." : undefined}
            label={labels.objetivo_treinamento ?? "Objetivo do treinamento"}
            name="objetivo_treinamento"
            placeholder={placeholders.objetivo_treinamento}
          />
        ) : null}
        {fields.includes("desafios_principais") ? (
          <TextareaField
            description={showDescriptions ? "Liste os principais pontos de risco, gargalo ou atualização." : undefined}
            label={labels.desafios_principais ?? "Desafios principais"}
            name="desafios_principais"
            placeholder={placeholders.desafios_principais}
          />
        ) : null}
        {fields.includes("mensagem") ? (
          <TextareaField
            description={showDescriptions ? "Se preferir, descreva contexto, urgência e público." : undefined}
            label={labels.mensagem ?? "Mensagem"}
            name="mensagem"
            placeholder={placeholders.mensagem ?? "Como podemos ajudar?"}
          />
        ) : null}

        <Button
          className={getSubmitClassName(submitTextColor)}
          disabled={pending}
          type="submit"
          variant={getSubmitVariant(submitColor)}
        >
          {pending ? "Enviando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
