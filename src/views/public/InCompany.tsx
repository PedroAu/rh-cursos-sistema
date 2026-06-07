import { CheckCircle2, Clock3, GraduationCap, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SectionTitle } from "@/components/common/section-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/app-store";

const benefits = [
  {
    title: "Programa sob medida",
    description: "Cada módulo é adaptado aos desafios, indicadores e maturidade da equipe.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCCxTUJIFi9FBUVhCytkWZGRIpKW8h9QpDo9nzq3jSJjoDxGuAg3jiYwazwjX3mNbWSxng_y0PI7TMD9eZYdf8HZY6CaPuR7J-2lI4qWIp4Jt0lMq8YiZPUCaNpg3zK8HUxyJXlWU6ofUKbw8tTx_mHbxVLyIN-yBrQ3e513eUCFlHB7jnu5bRvMJah61TRv17ZtpKuVheXMMdlxdSSBnk5WsrpeHLT93L643YFwCGO_4bdqqrORYYwZ3efmOLMxxMTeQR2jXKb-Ws"
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
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAvPzGaDxombDDeqjt0KTF9QyG8Yq3Dbqo9UC8jbD7aFMx85PCEvD1rpHdtb2jjuZ4GEq2OXD4YFwUyVOAtBlBbG4teTlRiG4enWHB1D8ANNVbiItiTPMfVfjbHgJAQvAU03bXOqpuiOn8LAlxSIM3KG9gS4gIImbr-aLYd8n6KObW27WYm9nkhe-HeUTJiyPQUAevemRd91-5wQfXtlyVX8WplejipGC0hlSP09mNSR5WWdYCGD3zt5y2CdALAXQ-VYopioeSQBz0"
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

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = () => {
    if (!form.name.trim()) {
      toast.error("Preencha o nome completo.");
      return;
    }

    if (!isValidEmail(form.email)) {
      toast.error("Informe um e-mail corporativo válido.");
      return;
    }

    if (!form.company.trim()) {
      toast.error("Preencha o nome da empresa.");
      return;
    }

    if (getPhoneDigits(form.phone).length < 10) {
      toast.error("Informe um telefone/WhatsApp válido.");
      return;
    }

    if (!form.groupSize || Number(form.groupSize) <= 0) {
      toast.error("Informe o tamanho da equipe.");
      return;
    }

    if (!form.modality) {
      toast.error("Selecione a modalidade.");
      return;
    }

    if (!form.trainingObjective.trim()) {
      toast.error("Informe o objetivo do treinamento.");
      return;
    }

    if (!form.trainingTheme.trim()) {
      toast.error("Informe o tema a ser abordado.");
      return;
    }

    if (!form.mainChallenges.trim()) {
      toast.error("Informe os desafios principais.");
      return;
    }

    createLead({
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
    toast.success("Proposta registrada para atendimento consultivo.");
  };

  return (
    <>
      <section className="relative overflow-hidden bg-deep-navy py-24 text-white">
        <div className="absolute inset-0 opacity-45">
          <img
            src="/images/in-company-hero-ai.png"
            alt="Equipe corporativa em programa de capacitação in company"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,23,54,0.98),rgba(0,23,54,0.88)_39%,rgba(0,23,54,0.28)_100%)]" />
        <div className="ea-container relative grid gap-16 lg:grid-cols-[minmax(0,0.88fr)_minmax(520px,1.12fr)] lg:items-center">
          <div className="max-w-3xl">
            <span className="inline-flex rounded bg-prestige-gold px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.05em] text-white">Excelência Corporativa</span>
            <h1 className="mt-4 text-white">Soluções de capacitação para quem precisa transformar equipes, processos e resultados.</h1>
            <p className="mt-6 max-w-xl text-[18px] leading-[1.6] text-white/80">
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
            <div className="aspect-[5/4] overflow-hidden rounded-lg border border-white/10 shadow-card xl:-mr-10">
              <img
                src="/images/in-company-hero-ai.png"
                alt="Equipe em treinamento corporativo in company"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="apple-material absolute -bottom-5 -left-5 max-w-[240px] rounded-lg border border-white p-4 shadow-card">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
              <p className="font-display text-[28px] font-extrabold leading-none text-deep-navy">98%</p>
              <p className="mt-1 font-display text-base font-bold text-deep-navy">de satisfação</p>
              <p className="mt-2 text-xs leading-5 text-text-muted">Avaliação de equipes após programas in company.</p>
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
                    <img src={benefit.image} alt="" className="h-48 w-full rounded-lg object-cover md:w-64" />
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
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
          <div className="apple-surface mt-10 grid gap-6 p-8 md:grid-cols-2 md:p-12">
            <Input placeholder="Nome completo" value={form.name} onChange={(event) => update("name", event.target.value)} />
            <Input type="email" inputMode="email" placeholder="E-mail corporativo" value={form.email} onChange={(event) => update("email", event.target.value.trim().toLowerCase())} />
            <Input placeholder="Nome da empresa" value={form.company} onChange={(event) => update("company", event.target.value)} />
            <Input inputMode="tel" placeholder="Telefone/WhatsApp" value={form.phone} onChange={(event) => update("phone", formatPhone(event.target.value))} />
            <Input inputMode="numeric" placeholder="Tamanho da equipe" value={form.groupSize} onChange={(event) => update("groupSize", formatTeamSize(event.target.value))} />
            <Select value={form.modality} onValueChange={(value) => update("modality", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Modalidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Presencial">Presencial</SelectItem>
                <SelectItem value="Online ao vivo">Online ao vivo</SelectItem>
                <SelectItem value="Híbrido">Híbrido</SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder="Objetivo do treinamento" value={form.trainingObjective} onChange={(event) => update("trainingObjective", event.target.value)} />
            <Textarea placeholder="Tema que será abordado" value={form.trainingTheme} onChange={(event) => update("trainingTheme", event.target.value)} />
            <Textarea className="md:col-span-2" placeholder="Desafios principais" value={form.mainChallenges} onChange={(event) => update("mainChallenges", event.target.value)} />
            <Button className="md:col-span-2" size="lg" onClick={submit}>
              Enviar solicitação de proposta
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
