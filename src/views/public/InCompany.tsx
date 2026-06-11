import { CheckCircle2, Clock3, GraduationCap, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import { SectionTitle } from "@/components/common/section-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/app-store";

const benefits = [
  {
    title: "Programa sob medida",
    description: "Cada módulo é adaptado aos desafios, indicadores e maturidade da equipe.",
    image: "/images/in-company-hero-ai.png"
  },
  {
    title: "Entrega Personalizada",
    description: "Presencial, online ao vivo ou híbrido, com agenda alinhada à operação da empresa."
  },
  {
    title: "Resultado mensurável",
    description: "Acompanhamento de impacto, aprendizagem e evolução da equipe."
  },
  {
    title: "Instrutores especialistas",
    description: "Os melhores profissionais do mercado com experiência prática, preparados para transformar sua equipe.",
    image: "/images/in-company-hero-ai.png"
  }
];

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

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getPhoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function InCompanyPage() {
  const { createLead } = useAppStore();
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    groupSize: "",
    modality: "",
    trainingObjective: "",
    trainingTheme: "",
    mainChallenges: ""
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const update = (key: keyof typeof form, value: string) => {
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError(null);
    setSubmitSuccess(null);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof typeof form, string>> = {};

    if (!form.name.trim()) nextErrors.name = "Preencha o nome completo.";
    if (!isValidEmail(form.email)) nextErrors.email = "Informe um e-mail corporativo válido.";
    if (!form.company.trim()) nextErrors.company = "Preencha o nome da empresa.";
    if (getPhoneDigits(form.phone).length < 10) nextErrors.phone = "Informe um telefone ou WhatsApp válido.";
    if (!form.groupSize || Number(form.groupSize) <= 0) nextErrors.groupSize = "Informe o tamanho da equipe.";
    if (!form.modality) nextErrors.modality = "Selecione a modalidade.";
    if (!form.trainingObjective.trim()) nextErrors.trainingObjective = "Informe o objetivo do treinamento.";
    if (!form.trainingTheme.trim()) nextErrors.trainingTheme = "Informe o tema a ser abordado.";
    if (!form.mainChallenges.trim()) nextErrors.mainChallenges = "Informe os desafios principais.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await createLead({
        name: form.name,
        email: form.email,
        phone: form.phone,
        courseInterest: "Treinamento In-Company",
        organization: form.company,
        teamSize: Number(form.groupSize),
        preferredModality: form.modality,
        trainingObjective: form.trainingObjective,
        mainChallenges: form.mainChallenges,
        origin: "Site",
        message: `Empresa: ${form.company}. Telefone/WhatsApp: ${form.phone}. Tamanho da equipe: ${form.groupSize} pessoa(s). Modalidade: ${form.modality}. Objetivo: ${form.trainingObjective}. Tema: ${form.trainingTheme}. Desafios principais: ${form.mainChallenges}`
      });
      setForm({
        name: "",
        email: "",
        company: "",
        phone: "",
        groupSize: "",
        modality: "",
        trainingObjective: "",
        trainingTheme: "",
        mainChallenges: ""
      });
      setErrors({});
      toast.success("Proposta registrada para atendimento consultivo.");
      setSubmitSuccess("Solicitação registrada. A equipe retorna com recomendação de formato, trilha e próximos passos.");
      setSubmitError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível enviar a proposta.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="relative overflow-hidden bg-deep-navy py-24 text-white">
        <div className="absolute inset-0 opacity-45">
          <Image
            src="/images/in-company-hero-ai.png"
            alt="Equipe corporativa em programa de capacitação in company"
            fill
            sizes="100vw"
            priority
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,23,54,0.98),rgba(0,23,54,0.88)_39%,rgba(0,23,54,0.28)_100%)]" />
        <div className="ea-container relative grid gap-16 lg:grid-cols-[minmax(0,0.88fr)_minmax(520px,1.12fr)] lg:items-center">
          <div className="max-w-3xl">
            <span className="inline-flex rounded bg-prestige-gold px-3 py-1.5 text-label font-bold uppercase tracking-[0.05em] text-white">Excelência Corporativa</span>
            <h1 className="mt-4 text-white">Soluções de capacitação para quem precisa transformar equipes, processos e resultados.</h1>
            <p className="mt-6 max-w-xl text-lead text-white/80">
              Programas adaptados aos objetivos estratégicos da organização, com trilhas, turmas e relatórios de impacto mensurável.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild variant="secondary" size="lg">
                <a href="#proposta">Solicitar Proposta</a>
              </Button>
              <div className="flex items-center gap-3 font-medium text-white/90">
                <CheckCircle2 className="h-5 w-5 text-white" />
                Atendimento consultivo para empresas
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative aspect-[5/4] overflow-hidden rounded-lg border border-white/10 shadow-card xl:-mr-10">
              <Image
                src="/images/in-company-hero-ai.png"
                alt="Equipe em treinamento corporativo in company"
                fill
                sizes="(min-width: 1280px) 40vw, 0px"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="surface-card absolute -bottom-5 -left-5 max-w-[240px] p-4 shadow-card">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
              <p className="font-display text-stat font-extrabold leading-none text-deep-navy">98%</p>
              <p className="mt-1 font-display text-base font-bold text-deep-navy">de satisfação</p>
              <p className="mt-2 text-label leading-5 text-text-muted">Avaliação de equipes após programas in company.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="ea-container">
          <SectionTitle
            eyebrow="Por que para sua equipe"
            title="Treinamento sob medida, com execução simples e resultado mensurável"
            description="O formato in-company combina diagnóstico, planejamento da turma, entrega e acompanhamento. Nossos especialistas trabalham junto com você para entender os desafios e entregar um programa de capacitação que realmente faça a diferença no desempenho."
            align="center"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {benefits.map((benefit, index) => (
              <Card key={benefit.title} className={`${index === 0 || index === 3 ? "md:col-span-2" : ""} ${index === 1 || index === 2 ? "bg-deep-navy text-white" : ""}`}>
                <CardContent className="grid gap-6 p-8 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    {index === 1 ? <Clock3 className="mb-4 h-9 w-9 text-prestige-gold" /> : <GraduationCap className="mb-4 h-9 w-9 text-prestige-gold" />}
                    <h3 className={index === 1 || index === 2 ? "text-white" : "text-deep-navy"}>{benefit.title}</h3>
                    <p className={index === 1 || index === 2 ? "mt-3 text-sm leading-7 text-white/75" : "mt-3 text-sm leading-7 text-text-muted"}>{benefit.description}</p>
                  </div>
                  {benefit.image ? (
                    <Image src={benefit.image} alt="" width={256} height={192} className="h-48 w-full rounded-lg object-cover md:w-64" />
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section bg-surface-muted">
        <div className="ea-container">
          <SectionTitle
            eyebrow="Como funciona"
            title="Como funciona a implementação"
            description="Do diagnóstico à medição de eficácia, conduzimos cada etapa junto com a sua equipe."
            align="center"
          />
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Diagnóstico",
                description: "Análise profunda das necessidades e lacunas de competência da equipe."
              },
              {
                title: "Personalização",
                description: "Adaptação do programa pedagógico e seleção do instrutor especialista no tema."
              },
              {
                title: "Execução e avaliação",
                description: "Entrega do treinamento com suporte contínuo e medição de eficácia pós-curso."
              }
            ].map((step, index) => (
              <li key={step.title} className="surface-card relative p-6" data-accent="top">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-deep-navy font-display text-lg font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-display text-xl font-bold text-deep-navy">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-text-muted">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="proposta" className="page-section bg-white">
        <div className="ea-container max-w-4xl">
          <SectionTitle
            eyebrow="Solicitar proposta"
            title="Conte como podemos transformar a sua equipe."
            description="Preparamos uma recomendação consultiva de trilha, modalidade e próximos passos."
            align="center"
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                label: "Escopo coletado",
                value: "Equipe + objetivo",
                helper: "O briefing já sai com tamanho da turma, modalidade e desafios."
              },
              {
                label: "Retorno",
                value: "Consultivo",
                helper: "A resposta considera agenda, público e aderência do conteúdo."
              },
              {
                label: "Formato",
                value: "Sob medida",
                helper: "Presencial, online ao vivo ou híbrido conforme a operação."
              }
            ].map((item) => (
              <div key={item.label} className="surface-card p-5">
                <p className="text-label font-bold uppercase tracking-[0.08em] text-label-secondary">{item.label}</p>
                <p className="mt-2 font-display text-2xl font-bold text-deep-navy">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-text-muted">{item.helper}</p>
              </div>
            ))}
          </div>
          <div className="surface-card mt-6 grid gap-6 p-8 md:grid-cols-2 md:p-12">
            {submitError ? (
              <div role="alert" className="rounded-lg border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger md:col-span-2">
                {submitError}
              </div>
            ) : null}
            {submitSuccess ? (
              <div aria-live="polite" className="rounded-lg border border-success/25 bg-success/10 px-4 py-3 text-sm text-success md:col-span-2">
                {submitSuccess}
              </div>
            ) : null}
            <FormField error={errors.name} label="Nome completo" required>
              {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                <Input id={fieldId} placeholder="Ex.: Ana Souza" value={form.name} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} onChange={(event) => update("name", event.target.value)} />
              )}
            </FormField>
            <FormField error={errors.email} label="E-mail corporativo" required>
              {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                <Input id={fieldId} type="email" inputMode="email" placeholder="voce@empresa.com.br" value={form.email} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} onChange={(event) => update("email", event.target.value.trim().toLowerCase())} />
              )}
            </FormField>
            <FormField error={errors.company} label="Nome da empresa" required>
              {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                <Input id={fieldId} placeholder="Ex.: Prefeitura de..." value={form.company} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} onChange={(event) => update("company", event.target.value)} />
              )}
            </FormField>
            <FormField error={errors.phone} label="Telefone ou WhatsApp" required>
              {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                <Input id={fieldId} inputMode="tel" placeholder="(61) 99999-9999" value={form.phone} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} onChange={(event) => update("phone", formatPhone(event.target.value))} />
              )}
            </FormField>
            <FormField error={errors.groupSize} hint="Ajuda a estimar dinâmica, carga e proposta comercial." label="Tamanho da equipe" required>
              {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                <Input id={fieldId} inputMode="numeric" placeholder="Ex.: 35" value={form.groupSize} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} onChange={(event) => update("groupSize", formatTeamSize(event.target.value))} />
              )}
            </FormField>
            <FormField error={errors.modality} label="Modalidade preferida" required>
              {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                <Select value={form.modality} onValueChange={(value) => update("modality", value)}>
                  <SelectTrigger id={fieldId} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid}>
                    <SelectValue placeholder="Selecione a modalidade desejada" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Presencial">Presencial</SelectItem>
                    <SelectItem value="Online ao vivo">Online ao vivo</SelectItem>
                    <SelectItem value="Híbrido">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </FormField>
            <FormField error={errors.trainingObjective} hint="Exponha o resultado esperado pela liderança ou área demandante." label="Objetivo do treinamento" required>
              {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                <Textarea id={fieldId} placeholder="Ex.: atualizar a equipe para nova legislação e reduzir retrabalho." value={form.trainingObjective} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} onChange={(event) => update("trainingObjective", event.target.value)} />
              )}
            </FormField>
            <FormField error={errors.trainingTheme} hint="Liste conteúdos, normas ou competências que precisam entrar no programa." label="Tema a ser abordado" required>
              {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                <Textarea id={fieldId} placeholder="Ex.: eSocial, DP estratégico, licitações, liderança..." value={form.trainingTheme} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} onChange={(event) => update("trainingTheme", event.target.value)} />
              )}
            </FormField>
            <FormField className="md:col-span-2" error={errors.mainChallenges} label="Desafios principais" required>
              {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                <Textarea id={fieldId} className="md:col-span-2" placeholder="Descreva os principais gargalos, riscos ou objetivos da equipe." value={form.mainChallenges} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} onChange={(event) => update("mainChallenges", event.target.value)} />
              )}
            </FormField>
            <Button className="md:col-span-2" size="lg" loading={isSubmitting} onClick={submit}>
              Enviar solicitação de proposta
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
