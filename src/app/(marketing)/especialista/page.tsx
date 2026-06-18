import { IconArrowRight, IconBuildingBank, IconChecklist, IconTargetArrow } from "@tabler/icons-react";
import Link from "next/link";

import { PublicLeadForm } from "@/components/forms/public-lead-form";
import { PageHero } from "@/components/shared/page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const fitItems = [
  "Indicação do curso ou trilha mais adequada para o seu contexto.",
  "Orientação para turma aberta, turma fechada ou solução In Company.",
  "Alinhamento inicial de tema, público, urgência, formato e próximo passo.",
];

export default function SpecialistPage() {
  return (
    <>
      <PageHero
        eyebrow="ATENDIMENTO CONSULTIVO"
        title="Fale com um especialista da RH Cursos"
        description="Conte o que sua equipe precisa aprender, o prazo desejado e o formato de atendimento. A RH Cursos orienta o melhor caminho para inscrição, turma fechada ou proposta In Company sem excesso de etapas."
        meta={["Análise objetiva", "Orientação comercial", "Retorno direcionado"]}
        panelEyebrow="Direcionamento"
        panelTitle="Sua demanda no caminho certo"
        panelDescription="Use este canal para transformar uma dúvida sobre curso, turma ou formato em uma orientação comercial clara."
        panelItems={[
          {
            title: "Diagnóstico Personalisado",
            text: "Analisamos as dores específicas do seu departamento antes de propor qualquer solução.",
            icon: <IconTargetArrow size={18} color="#083b56" />,
          },
          {
            title: "Expertise em Setor Público",
            text: "Especialistas com anos de experiência no setor público.",
            icon: <IconBuildingBank size={18} color="#083b56" />,
          },
        ]}
      />

      <section className="py-12 md:py-16 xl:py-24">
        <div className="mx-auto w-full max-w-page px-6">
          <div className="grid items-stretch gap-8 xl:grid-cols-2 xl:gap-12">
            <div>
              <Card className="h-full">
                <CardContent className="flex h-full flex-col gap-8 p-6 xl:p-10">
                  <div className="space-y-4">
                    <Badge className="w-fit bg-brand-gold text-brand-navy-900" variant="gold">
                      Diagnóstico consultivo
                    </Badge>
                    <h2 className="text-balance font-heading text-3xl font-bold leading-tight text-brand-navy-700 md:text-4xl">
                      Receba orientação antes de decidir o formato da capacitação
                    </h2>
                    <p className="text-lg leading-8 text-muted-foreground">
                      Use este canal quando houver dúvida sobre curso, agenda, contratação ou
                      adequação de conteúdo. A resposta deve ajudar você a sair da página com uma
                      decisão mais clara.
                    </p>
                  </div>

                  <ul className="space-y-4">
                    {fitItems.map((item) => (
                      <li className="flex gap-3 text-sm leading-6 text-foreground" key={item}>
                        <IconChecklist className="mt-1 size-4 shrink-0 text-brand-navy-600" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex flex-wrap gap-3">
                    <Button asChild variant="secondary">
                      <Link href="/cursos">Ver cursos</Link>
                    </Button>
                    <Button asChild variant="ghost">
                      <Link href="/in-company">
                        Soluções In Company
                        <IconArrowRight size={16} />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="h-full" id="formulario">
                <CardContent className="space-y-6 p-6 xl:p-10">
                  <div>
                    <Badge className="mb-3 w-fit" variant="secondary">
                      Solicitar contato
                    </Badge>
                    <h2 className="font-heading text-3xl font-bold text-brand-navy-700">
                      Fale com especialista
                    </h2>
                    <p className="mt-2 leading-7 text-muted-foreground">
                      Preencha os dados essenciais para que a equipe retorne com uma orientação objetiva.
                    </p>
                  </div>

                  <PublicLeadForm
                    hiddenFields={{
                      tipo: "Especialista",
                      origem: "Especialista site RH Cursos",
                      path_to_revalidate: "/especialista",
                    }}
                    submitLabel="Enviar solicitação"
                    showDescriptions={false}
                    labels={{
                      nome: "Nome completo",
                      email: "E-mail profissional",
                      telefone: "WhatsApp",
                      orgao: "Órgão ou empresa",
                      tema_interesse: "Tema de interesse",
                      mensagem: "Contexto da necessidade",
                    }}
                    placeholders={{
                      nome: "Seu nome",
                      email: "voce@instituicao.com",
                      telefone: "(61) 99999-9999",
                      orgao: "Nome da instituição",
                      tema_interesse: "Ex.: eSocial, retenções, liderança",
                      mensagem: "Descreva objetivo, prazo, formato desejado e principal dúvida.",
                    }}
                    fields={[
                      "nome",
                      "email",
                      "telefone",
                      "orgao",
                      "tema_interesse",
                      "mensagem",
                    ]}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-page px-6 py-12 md:py-16 xl:py-24">
        <Card className="border-0 bg-brand-navy-700 text-white">
          <CardContent className="flex flex-col gap-8 p-6 md:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-content space-y-4">
              <Badge className="w-fit bg-brand-gold text-brand-navy-900" variant="gold">
                Próximo passo
              </Badge>
              <h2 className="text-balance font-heading text-3xl font-bold leading-tight text-white md:text-4xl">
                Precisa de uma orientação antes de escolher o curso?
              </h2>
              <p className="text-lg leading-8 text-white/80">
                Envie sua demanda pelo formulário. A equipe da RH Cursos avalia o contexto e
                direciona o melhor caminho para inscrição, agenda ou proposta personalizada.
              </p>
            </div>
            <Button asChild size="lg" variant="gold">
              <a href="#formulario">
                Voltar ao formulário
                <IconArrowRight size={18} />
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
