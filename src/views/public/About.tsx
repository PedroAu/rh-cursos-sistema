import { Building2, ShieldCheck, Sparkles, Users } from "lucide-react";

import { CTASection } from "@/components/common/cta-section";
import { SectionTitle } from "@/components/common/section-title";
import { Card, CardContent } from "@/components/ui/card";

export function AboutPage() {
  return (
    <>
      <section className="page-section">
        <div className="container grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <SectionTitle
              eyebrow="Sobre nós"
              title="Capacitação profissional construída com clareza, segurança e aplicação prática."
              description="A empresa atua com cursos, treinamentos e capacitações para setor público e privado, com foco em atualização normativa, segurança técnica e desenvolvimento de competências."
            />
            <div className="grid gap-4 md:grid-cols-2">
              {[
                "Conteúdo técnico e aplicável",
                "Atendimento consultivo",
                "Cursos voltados a realidade de quem executa",
                "Flexibilidade para turmas abertas e in company"
              ].map((item) => (
                <Card key={item}>
                  <CardContent className="p-6 font-medium">{item}</CardContent>
                </Card>
              ))}
            </div>
          </div>
          <Card className="overflow-hidden bg-primary text-white">
            <CardContent className="space-y-5 p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Users, value: "1.500+", label: "Alunos capacitados" },
                  { icon: Building2, value: "120+", label: "Organizações atendidas" },
                  { icon: ShieldCheck, value: "4.8/5", label: "Avaliação média" },
                  { icon: Sparkles, value: "25", label: "Programas no catalogo" }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-lg bg-white/10 p-6">
                      <Icon className="h-5 w-5 text-green-200" />
                      <div className="mt-4 text-3xl font-semibold">{item.value}</div>
                      <div className="mt-2 text-sm text-blue-50/80">{item.label}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="page-section bg-white">
        <div className="container grid gap-5 xl:grid-cols-3">
          {[
            {
              title: "Missão",
              description: "Ajudar profissionais e equipes a executar melhor, com mais confiança e menos retrabalho."
            },
            {
              title: "Visão",
              description: "Ser referência em capacitação aplicada, orientada à realidade operacional do aluno."
            },
            {
              title: "Valores",
              description: "Clareza, responsabilidade técnica, humanização, atualização constante e compromisso com resultado."
            }
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="space-y-3 p-6">
                <h3 className="text-2xl font-semibold">{item.title}</h3>
                <p className="text-sm leading-7 text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <CTASection />
        </div>
      </section>
    </>
  );
}
