"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ClipboardCheck,
  Send,
  ShieldCheck,
  Target,
  Users
} from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useQuoteModal } from "@/components/in-company/quote-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/lib/router-compat";
import { useAppStore } from "@/lib/app-store";
import { cn } from "@/lib/utils";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inCompanySchema = z.object({
  name: z.string().trim().min(1, "Preencha o nome completo."),
  email: z
    .string()
    .trim()
    .min(1, "Informe um e-mail corporativo válido.")
    .refine((value) => emailRegex.test(value), "Informe um e-mail corporativo válido."),
  company: z.string().trim().min(1, "Preencha o nome da empresa."),
  phone: z.string().trim().refine((value) => getPhoneDigits(value).length >= 10, "Informe um telefone ou WhatsApp válido."),
  groupSize: z
    .string()
    .trim()
    .refine((value) => Boolean(value) && Number(value) > 0, "Informe o tamanho da equipe."),
  modality: z.string().trim().min(1, "Selecione a modalidade."),
  trainingObjective: z.string().trim().min(1, "Informe o objetivo do treinamento."),
  trainingTheme: z.string().trim().min(1, "Informe o tema a ser abordado."),
  mainChallenges: z.string().trim().min(1, "Informe os desafios principais."),
  consent: z.boolean()
});

type InCompanyFormValues = z.infer<typeof inCompanySchema>;

const defaultValues: InCompanyFormValues = {
  name: "",
  email: "",
  company: "",
  phone: "",
  groupSize: "",
  modality: "",
  trainingObjective: "",
  trainingTheme: "",
  mainChallenges: "",
  consent: false
};

const modalityOptions = ["Online ao vivo", "Presencial", "Híbrido", "In company"] as const;

const heroPoints = [
  {
    description: "Exercícios e exemplos partem dos processos e normas da sua organização.",
    icon: ClipboardCheck,
    title: "Conteúdo com o seu caso"
  },
  {
    description: "Datas e formato definidos com você, sem parar a operação.",
    icon: CalendarDays,
    title: "No seu calendário"
  },
  {
    description: "Uma linguagem comum entre áreas, do gestor ao operacional.",
    icon: Users,
    title: "Time todo alinhado"
  }
];

const benefits = [
  {
    description: "Mapeamos o nível da equipe e os pontos críticos antes de montar o conteúdo.",
    icon: Target,
    title: "Diagnóstico prévio"
  },
  {
    description: "Apostilas, modelos e checklists prontos para usar na rotina depois do curso.",
    icon: BookOpen,
    title: "Material personalizado"
  },
  {
    description: "Certificado para cada participante e um relatório de evolução para a gestão.",
    icon: ShieldCheck,
    title: "Certificação e relatório"
  }
];

const steps = [
  {
    description: "Entendemos o objetivo, o perfil da equipe e as normas aplicáveis.",
    number: "1",
    title: "Conversa inicial"
  },
  {
    description: "Escopo, carga horária, formato e investimento em uma proposta clara.",
    number: "2",
    title: "Proposta sob medida"
  },
  {
    description: "Turma conduzida por especialista, presencial ou online ao vivo.",
    number: "3",
    title: "Realização"
  },
  {
    description: "Relatório de resultados e suporte para aplicar o aprendizado.",
    number: "4",
    title: "Acompanhamento"
  }
];

const themes = [
  "Nova Lei de Licitações (14.133/21)",
  "LGPD e proteção de dados",
  "Gestão e fiscalização de contratos",
  "Compliance e integridade",
  "Pregão eletrônico",
  "Governança e gestão de riscos",
  "Planejamento orçamentário",
  "Prevenção à fraude e corrupção"
];

const stats = [
  {
    label: "organizações públicas e privadas capacitadas in-company",
    value: "+80"
  },
  {
    label: "turmas realizadas dentro das organizações",
    value: "+320"
  },
  {
    label: "de recomendação média das equipes formadas",
    value: "96%"
  },
  {
    label: "prazo médio para montar e iniciar um programa",
    value: "15 dias"
  }
];

const clientWordmarks = ["Prefeitura Municipal", "Tribunal de Contas", "Secretaria de Saúde", "Grupo Andrade"] as const;

const checklistItems = ["Sem compromisso", "Proposta em até 2 dias úteis", "Atendimento por especialista"] as const;

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatTeamSize(value: string) {
  return value.replace(/\D/g, "").slice(0, 5);
}

function getPhoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

function SectionEyebrow({ children, tone = "accent" }: { children: string; tone?: "accent" | "brand" }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]",
        tone === "accent" ? "bg-[#dff2f7] text-[#1f6d85]" : "bg-[#0c6a83] text-white"
      )}
    >
      {children}
    </span>
  );
}

export function InCompanyPage() {
  const { createLead } = useAppStore();
  const { openQuote } = useQuoteModal();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset
  } = useForm<InCompanyFormValues>({
    defaultValues,
    resolver: zodResolver(inCompanySchema)
  });

  const clearFeedback = () => {
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  const submit = handleSubmit(async (values) => {
    clearFeedback();

    try {
      await createLead({
        courseInterest: "Treinamento In-Company",
        email: values.email,
        mainChallenges: values.mainChallenges,
        message: `Empresa: ${values.company}. Telefone/WhatsApp: ${values.phone}. Tamanho da equipe: ${values.groupSize} pessoa(s). Modalidade: ${values.modality}. Objetivo: ${values.trainingObjective}. Tema: ${values.trainingTheme}. Desafios principais: ${values.mainChallenges}`,
        name: values.name,
        organization: values.company,
        origin: "Site",
        phone: values.phone,
        preferredModality: values.modality,
        teamSize: Number(values.groupSize),
        trainingObjective: values.trainingObjective,
        trainingTheme: values.trainingTheme,
        type: "InCompany"
      });

      reset(defaultValues);
      toast.success("Proposta registrada para atendimento consultivo.");
      setSubmitSuccess("Solicitação registrada. A equipe retorna com recomendação de formato, trilha e próximos passos.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível enviar a proposta.";
      setSubmitError(message);
      toast.error(message);
    }
  });

  return (
    <div className="bg-white text-[#222525]">
      <section className="border-b border-[#e7ecef] bg-[radial-gradient(circle_at_50%_-10%,#f7f9fc_30%,#ebf3ff_130%)]">
        <div className="mx-auto w-[min(var(--tk-container),calc(100%-24px))] py-14 md:w-[min(var(--tk-container),calc(100%-40px))] md:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
            <div>
              <SectionEyebrow>Treinamento in-company · Para organizações</SectionEyebrow>
              <h1 className="mt-5 max-w-[11ch] font-display text-[2.85rem] font-bold leading-[0.98] tracking-[-0.03em] text-[#2d3135] md:text-[3.75rem]">
                A capacitação vai até a <em className="italic">sua</em> equipe
              </h1>
              <p className="mt-5 max-w-[48ch] font-serif text-[1.22rem] font-light leading-[1.45] text-[#59646d]">
                Programas sob medida, no seu contexto operacional, com o seu calendário e os seus casos reais: do
                curso pontual à trilha de formação contínua para o time inteiro.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  size="lg"
                  className="min-w-[220px]"
                  onClick={() => openQuote()}
                  aria-label="Solicitar orçamento"
                >
                  Solicitar proposta
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button asChild variant="outline" size="lg" className="min-w-[220px]">
                  <a href="#temas-in-company">Baixar catálogo de temas</a>
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {["Conteúdo aplicado à sua realidade", "Presencial ou online ao vivo", "Certificação para toda a turma"].map((item) => (
                  <div
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-[#dde4e8] bg-white px-4 py-2 text-sm font-medium text-[#4f5963]"
                  >
                    <span className="h-2 w-2 rounded-full bg-[#3bb56a]" aria-hidden />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <Card className="rounded-[24px] border-[#e0e6ea] bg-white shadow-[0_2px_0_rgba(17,24,39,0.03),0_18px_40px_rgba(17,24,39,0.08)]">
              <CardContent className="p-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5f6972]">Por que in-company</p>
                <div className="mt-5 space-y-5">
                  {heroPoints.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.title} className={cn(index < heroPoints.length - 1 && "border-b border-[#edf1f4] pb-5")}>
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#dff2f7] text-[#0c6a83]">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h2 className="text-base font-semibold text-[#2d3135]">{item.title}</h2>
                            <p className="mt-1 text-sm leading-6 text-[#66727b]">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e7ecef] bg-white">
        <div className="mx-auto flex w-[min(var(--tk-container),calc(100%-24px))] flex-wrap items-center justify-between gap-5 py-9 text-sm text-[#6b7680] md:w-[min(var(--tk-container),calc(100%-40px))]">
          <p>Organizações que já treinaram com a RH Cursos</p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {clientWordmarks.map((wordmark) => (
              <span key={wordmark} className="font-display text-[1.18rem] font-bold tracking-[-0.01em] text-[#7b8288]">
                {wordmark}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto w-[min(var(--tk-container),calc(100%-24px))] md:w-[min(var(--tk-container),calc(100%-40px))]">
          <div className="max-w-[620px]">
            <SectionEyebrow>Feito para a sua operação</SectionEyebrow>
            <h2 className="mt-5 max-w-[13ch] font-display text-[2.4rem] font-bold leading-[1.06] tracking-[-0.03em] text-[#2d3135] md:text-[3rem]">
              Mais do que um curso: uma formação com contexto
            </h2>
            <p className="mt-4 max-w-[40ch] font-serif text-[1.16rem] font-light leading-[1.45] text-[#59646d]">
              Desenhamos cada programa a partir das exigências legais que se aplicam ao seu órgão ou empresa e da
              forma como a sua equipe trabalha.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {benefits.map((item) => {
              const Icon = item.icon;

              return (
                <Card
                  key={item.title}
                  className="rounded-[24px] border-[#e0e6ea] bg-white shadow-[0_2px_0_rgba(17,24,39,0.03),0_18px_40px_rgba(17,24,39,0.08)]"
                >
                  <CardContent className="space-y-4 p-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#dff2f7] text-[#0c6a83]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-[1.55rem] font-bold leading-[1.18] tracking-[-0.02em] text-[#2d3135]">
                      {item.title}
                    </h3>
                    <p className="text-[15px] leading-7 text-[#66727b]">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto w-[min(var(--tk-container),calc(100%-24px))] md:w-[min(var(--tk-container),calc(100%-40px))]">
          <h2 className="font-display text-[2rem] font-bold leading-[1.08] tracking-[-0.02em] text-[#2d3135]">
            Como montamos o seu programa
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((item) => (
              <div key={item.number} className="pt-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0c6a83] font-display text-lg font-bold text-white">
                  {item.number}
                </div>
                <h3 className="mt-4 font-display text-[1.38rem] font-bold tracking-[-0.015em] text-[#2d3135]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#66727b]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="temas-in-company" className="border-y border-[#ded8c9] bg-[#f4f1e9] py-20">
        <div className="mx-auto grid w-[min(var(--tk-container),calc(100%-24px))] gap-14 md:w-[min(var(--tk-container),calc(100%-40px))] lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <SectionEyebrow tone="brand">Temas mais pedidos</SectionEyebrow>
            <h2 className="mt-5 max-w-[12ch] font-display text-[2.4rem] font-bold leading-[1.06] tracking-[-0.03em] text-[#2d3135] md:text-[3rem]">
              Qualquer tema, levado para dentro da sua organização
            </h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {themes.map((theme) => (
                <div
                  key={theme}
                  className="flex items-center gap-3 rounded-[16px] border border-[#e0e6ea] bg-white px-4 py-3 text-[15px] text-[#2d3135]"
                >
                  <span className="h-2 w-2 rounded-full bg-[#0c6a83]" aria-hidden />
                  <span>{theme}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm text-[#59646d]">
              Não encontrou o seu tema?{" "}
              <Link to="/falar-com-especialista" className="font-semibold text-[#0c6a83]">
                Fale com um especialista →
              </Link>
            </p>
          </div>

          <Card className="rounded-[24px] border-[#e0e6ea] bg-white shadow-[0_2px_0_rgba(17,24,39,0.03),0_18px_40px_rgba(17,24,39,0.08)]">
            <CardContent className="flex h-full flex-col justify-between p-8">
              <blockquote className="font-display text-[2rem] font-bold leading-[1.06] tracking-[-0.025em] text-[#2d3135]">
                “Treinaram nossa equipe de compras no nosso próprio fluxo de licitação. Saímos com processos prontos,
                não só teoria.”
              </blockquote>
              <div className="mt-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dff2f7] text-sm font-semibold text-[#0c6a83]">
                    RM
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2d3135]">Ricardo Menezes</p>
                    <p className="text-xs text-[#69747e]">Diretor Administrativo, Secretaria de Saúde</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid w-[min(var(--tk-container),calc(100%-24px))] gap-8 md:w-[min(var(--tk-container),calc(100%-40px))] md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.value} className="text-center">
              <p className="font-display text-[3rem] font-bold leading-none tracking-[-0.03em] text-[#0c6a83]">{item.value}</p>
              <p className="mx-auto mt-3 max-w-[22ch] text-sm leading-6 text-[#66727b]">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto w-[min(var(--tk-container),calc(100%-24px))] md:w-[min(var(--tk-container),calc(100%-40px))]">
          <Card
            id="formulario-in-company"
            className="overflow-hidden rounded-[24px] border-[#e0e6ea] bg-white shadow-[0_2px_0_rgba(17,24,39,0.03),0_18px_40px_rgba(17,24,39,0.08)]"
            data-testid="ui-incompany-form"
          >
            <CardContent className="grid p-0 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="bg-[#0c6a83] p-8 text-white md:p-10">
                <h2 className="max-w-[10ch] font-display text-[2.25rem] font-bold leading-[1.08] tracking-[-0.025em] text-white">
                  Vamos montar o programa da sua equipe
                </h2>
                <p className="mt-4 max-w-[26ch] font-serif text-[1.08rem] font-light leading-[1.55] text-white/86">
                  Conte um pouco sobre a sua organização. Um especialista retorna com uma proposta em até 2 dias úteis.
                </p>
                <div className="mt-8 space-y-4">
                  {checklistItems.map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm">
                      <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/15">
                        <Check className="h-4 w-4" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 md:p-10">
                {submitError ? (
                  <div role="alert" className="mb-6 rounded-lg border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">
                    {submitError}
                  </div>
                ) : null}

                {submitSuccess ? (
                  <div aria-live="polite" className="rounded-lg border border-success/25 bg-success/10 px-4 py-3 text-sm text-success">
                    {submitSuccess}
                  </div>
                ) : null}

                {submitSuccess ? null : (
                  <form noValidate className="grid gap-5" onSubmit={submit}>
                    <div className="grid gap-5 md:grid-cols-2">
                      <FormField error={errors.name?.message} label="Nome completo" required>
                        {({ ariaDescribedBy, ariaInvalid, fieldId }) => (
                          <Input
                            id={fieldId}
                            autoComplete="name"
                            placeholder="Seu nome"
                            aria-describedby={ariaDescribedBy}
                            aria-invalid={ariaInvalid}
                            {...register("name", { onChange: clearFeedback })}
                          />
                        )}
                      </FormField>

                      <FormField error={errors.email?.message} label="E-mail corporativo" required>
                        {({ ariaDescribedBy, ariaInvalid, fieldId }) => (
                          <Input
                            id={fieldId}
                            type="email"
                            autoComplete="email"
                            placeholder="voce@organizacao.gov.br"
                            aria-describedby={ariaDescribedBy}
                            aria-invalid={ariaInvalid}
                            {...register("email", { onChange: clearFeedback })}
                          />
                        )}
                      </FormField>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <FormField error={errors.company?.message} label="Nome da empresa" required>
                        {({ ariaDescribedBy, ariaInvalid, fieldId }) => (
                          <Input
                            id={fieldId}
                            autoComplete="organization"
                            placeholder="Nome da organização"
                            aria-describedby={ariaDescribedBy}
                            aria-invalid={ariaInvalid}
                            {...register("company", { onChange: clearFeedback })}
                          />
                        )}
                      </FormField>

                      <Controller
                        control={control}
                        name="phone"
                        render={({ field }) => (
                          <FormField error={errors.phone?.message} label="Telefone ou WhatsApp" required>
                            {({ ariaDescribedBy, ariaInvalid, fieldId }) => (
                              <Input
                                id={fieldId}
                                autoComplete="tel"
                                inputMode="tel"
                                placeholder="(00) 00000-0000"
                                value={field.value}
                                aria-describedby={ariaDescribedBy}
                                aria-invalid={ariaInvalid}
                                onChange={(event) => {
                                  clearFeedback();
                                  field.onChange(formatPhone(event.target.value));
                                }}
                              />
                            )}
                          </FormField>
                        )}
                      />
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <Controller
                        control={control}
                        name="modality"
                        render={({ field }) => (
                          <FormField error={errors.modality?.message} label="Área de interesse" required>
                            {({ ariaDescribedBy, ariaInvalid, fieldId, labelId }) => (
                              <Select
                                value={field.value}
                                onValueChange={(value) => {
                                  clearFeedback();
                                  field.onChange(value);
                                }}
                              >
                                <SelectTrigger
                                  id={fieldId}
                                  aria-describedby={ariaDescribedBy}
                                  aria-invalid={ariaInvalid}
                                  aria-labelledby={labelId}
                                >
                                  <SelectValue placeholder="Selecione uma área" />
                                </SelectTrigger>
                                <SelectContent>
                                  {modalityOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </FormField>
                        )}
                      />

                      <Controller
                        control={control}
                        name="groupSize"
                        render={({ field }) => (
                          <FormField error={errors.groupSize?.message} label="Tamanho da equipe" required>
                            {({ ariaDescribedBy, ariaInvalid, fieldId }) => (
                              <Input
                                id={fieldId}
                                inputMode="numeric"
                                placeholder="Até 15 pessoas"
                                value={field.value}
                                aria-describedby={ariaDescribedBy}
                                aria-invalid={ariaInvalid}
                                onChange={(event) => {
                                  clearFeedback();
                                  field.onChange(formatTeamSize(event.target.value));
                                }}
                              />
                            )}
                          </FormField>
                        )}
                      />
                    </div>

                    <FormField error={errors.trainingObjective?.message} label="Objetivo do treinamento" required>
                      {({ ariaDescribedBy, ariaInvalid, fieldId }) => (
                        <Input
                          id={fieldId}
                          placeholder="Conte o objetivo do treinamento e o contexto da sua equipe"
                          aria-describedby={ariaDescribedBy}
                          aria-invalid={ariaInvalid}
                          {...register("trainingObjective", { onChange: clearFeedback })}
                        />
                      )}
                    </FormField>

                    <FormField error={errors.trainingTheme?.message} label="Tema a ser abordado" required>
                      {({ ariaDescribedBy, ariaInvalid, fieldId }) => (
                        <Input
                          id={fieldId}
                          placeholder="Ex.: Licitações e Contratos"
                          aria-describedby={ariaDescribedBy}
                          aria-invalid={ariaInvalid}
                          {...register("trainingTheme", { onChange: clearFeedback })}
                        />
                      )}
                    </FormField>

                    <FormField error={errors.mainChallenges?.message} label="Desafios principais" required>
                      {({ ariaDescribedBy, ariaInvalid, fieldId }) => (
                        <Textarea
                          id={fieldId}
                          rows={5}
                          placeholder="Descreva brevemente o seu desafio ou necessidade..."
                          aria-describedby={ariaDescribedBy}
                          aria-invalid={ariaInvalid}
                          {...register("mainChallenges", { onChange: clearFeedback })}
                        />
                      )}
                    </FormField>

                    <p className="text-xs leading-5 text-[#69747e]">
                      Ao enviar, você concorda em ser contatado pela equipe da RH Cursos.
                    </p>

                    <Button
                      type="submit"
                      size="lg"
                      loading={isSubmitting}
                      className="w-full"
                      aria-label={isSubmitting ? "Enviando..." : "Enviar solicitação de proposta"}
                    >
                      <Send className="h-4 w-4" />
                      {isSubmitting ? "Enviando..." : "Solicitar proposta"}
                    </Button>

                    <p className="text-center text-xs text-[#69747e]">Responderemos em até 24 horas úteis.</p>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
