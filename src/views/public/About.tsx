import { Check, Diamond, Gem, Scale, Section, SquareDashedMousePointer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/lib/router-compat";

const institutionalStats = [
  { label: "Ano de fundação", value: "2007" },
  { label: "Cursos no portfólio", value: "~80" },
  { label: "Trilhas de conhecimento", value: "6" },
  { label: "Alcance de atuação", value: "Nacional" }
];

const values = [
  "Ética e transparência em todas as relações.",
  "Responsabilidade, comprometimento e honestidade em cada treinamento.",
  "Busca constante por resultados, multiplicação da tecnologia e expansão do conhecimento.",
  "Estímulo à iniciativa, motivação, criatividade e comunicação."
];

const solutions = [
  {
    description:
      "Presenciais e online, com temas atualizados para as áreas pública e privada, focados em qualificação técnica e atualização profissional.",
    icon: Section,
    tint: "linear-gradient(135deg,#235875,#2f7599)",
    title: "Cursos abertos"
  },
  {
    description:
      "Programas personalizados conforme as necessidades de cada instituição, com adequação de horário, agenda e conteúdo e redução de custos para o cliente.",
    icon: Diamond,
    tint: "linear-gradient(135deg,#4285f4,#6aa2ff)",
    title: "Treinamentos in company"
  },
  {
    description:
      "Apoio especializado a órgãos públicos e empresas na estruturação de processos, conformidade legal e desenvolvimento de pessoas.",
    icon: Gem,
    tint: "linear-gradient(135deg,#7a4fd6,#9a74e6)",
    title: "Consultoria empresarial"
  }
];

const tracks = [
  {
    audience: "Servidores do DP, RH, gestores de contratos e contadores da Administração Pública.",
    count: "14 cursos",
    description: "Da legislação trabalhista à conformidade digital com eSocial, FGTS Digital e LGPD.",
    icon: Section,
    tint: "linear-gradient(135deg,#235875,#2f7599)",
    title: "Departamento Pessoal, Folha & eSocial"
  },
  {
    audience: "Pregoeiros, gestores e fiscais de contratos, equipes de licitação e procurement público.",
    count: "12 cursos",
    description: "Da legislação básica à fiscalização avançada, com cobertura completa da Lei nº 14.133/2021.",
    icon: Scale,
    tint: "linear-gradient(135deg,#2f7599,#068466)",
    title: "Licitações, Compras & Contratos"
  },
  {
    audience: "Gestores, líderes de equipe, servidores e profissionais de RH dos setores público e privado.",
    count: "14 cursos",
    description: "Formação humanizada para líderes e equipes: inteligência emocional, cultura e gestão por resultados.",
    icon: Gem,
    tint: "linear-gradient(135deg,#235875,#3a7d5f)",
    title: "Gestão de Pessoas & Liderança"
  },
  {
    audience: "Servidores, ouvidores, assessores de comunicação, profissionais jurídicos e atendentes.",
    count: "10 cursos",
    description: "Do atendimento ao cidadão à redação oficial, oratória, mídias digitais e conformidade com LAI/LGPD.",
    icon: SquareDashedMousePointer,
    tint: "linear-gradient(135deg,#c98a3a,#e0a94f)",
    title: "Comunicação, Redação & Atendimento"
  },
  {
    audience: "Contadores, auditores, controllers, analistas financeiros e servidores das áreas de controle.",
    count: "19 cursos",
    description: "Domínio técnico em contabilidade pública, obrigações acessórias, Tesouro Gerencial, SIAFI e auditoria.",
    icon: Diamond,
    tint: "linear-gradient(135deg,#4285f4,#235875)",
    title: "Auditoria, Contabilidade & Tributos"
  },
  {
    audience: "Servidores, analistas de TI, gestores de processos e inovação, e todos que usam tecnologia no trabalho.",
    count: "11 cursos",
    description: "Ferramentas digitais, análise de dados, modelagem de processos, IA e governança.",
    icon: Gem,
    tint: "linear-gradient(135deg,#7a4fd6,#9a74e6)",
    title: "Tecnologia, Dados & Inovação"
  }
];

function SectionEyebrow({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#3b97b5]">
      {children}
    </p>
  );
}

export function AboutPage() {
  return (
    <div className="bg-white text-[#222525]">
      <section className="border-b border-[#e7ecef] bg-[radial-gradient(circle_at_50%_-10%,#f7f9fc_30%,#ebf3ff_130%)]">
        <div className="mx-auto w-[min(var(--tk-container),calc(100%-24px))] py-14 md:w-[min(var(--tk-container),calc(100%-40px))] md:py-16">
          <span className="inline-flex rounded-full bg-[#dff2f7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#287f98]">
            Documento institucional · Desde 2007
          </span>
          <h1 className="mt-5 max-w-[10ch] font-display text-[2.75rem] font-bold leading-[1.03] tracking-[-0.03em] text-[#2d3135] md:text-[3rem]">
            Transformando vidas por meio do <em className="italic">conhecimento</em>
          </h1>
          <p className="mt-4 max-w-[62ch] font-serif text-[1.14rem] font-light leading-[1.45] text-[#59646d]">
            A RH Cursos &amp; Soluções é uma empresa brasileira de educação corporativa, consultoria e treinamento
            empresarial, sediada em Brasília – DF, especializada na capacitação de servidores públicos e profissionais
            do setor privado.
          </p>
        </div>
      </section>

      <section className="border-b border-[#e7ecef] bg-white">
        <div className="mx-auto grid w-[min(var(--tk-container),calc(100%-24px))] md:w-[min(var(--tk-container),calc(100%-40px))] md:grid-cols-2 xl:grid-cols-4">
          {institutionalStats.map((item, index) => (
            <div
              key={item.label}
              className={["px-5 py-8", index < institutionalStats.length - 1 ? "xl:border-r xl:border-[#edf1f4]" : ""].join(" ")}
            >
              <p className="font-display text-[2rem] font-bold tracking-[-0.02em] text-[#0c6a83]">{item.value}</p>
              <p className="mt-1 text-sm text-[#69747e]">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid w-[min(var(--tk-container),calc(100%-24px))] gap-12 md:w-[min(var(--tk-container),calc(100%-40px))] lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionEyebrow>Nossa história</SectionEyebrow>
            <h2 className="mt-2 max-w-[12ch] font-display text-[2rem] font-bold leading-[1.08] tracking-[-0.02em] text-[#2d3135]">
              Nascida do sonho de compartilhar conhecimento
            </h2>
          </div>
          <div className="space-y-5 text-[15px] leading-8 text-[#59646d]">
            <p>
              Fundada em 2007, a RH Cursos &amp; Soluções nasceu da união do casal <strong className="text-[#2d3135]">Ester e Nilson</strong>,
              que combinaram suas experiências em advocacia, consultoria e ensino para construir uma instituição voltada a transformar vidas por meio do conhecimento.
            </p>
            <p>
              Originalmente constituída no Distrito Federal e sediada em Taguatinga, a empresa estruturou-se para oferecer cursos abertos e treinamentos in company em todo o território nacional, consolidando um histórico robusto em temas técnicos de alta relevância para o setor público, como GFIP/SEFIP, SIAFI/CPR, escrituração fiscal digital, cálculos trabalhistas, fiscalização de contratos e legislação previdenciária.
            </p>
            <p>
              Hoje, a empresa organiza seu portfólio em trilhas de conhecimento, com progressão lógica do nível básico ao avançado dentro de cada área de especialização.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#ded8c9] bg-[#f4f1e9] py-16">
        <div className="mx-auto w-[min(var(--tk-container),calc(100%-24px))] md:w-[min(var(--tk-container),calc(100%-40px))]">
          <SectionEyebrow>Propósito</SectionEyebrow>
          <h2 className="mt-2 font-display text-[2rem] font-bold leading-[1.08] tracking-[-0.02em] text-[#2d3135]">
            Missão, visão e filosofia
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[
              {
                body: "Subsidiar, por meio do conhecimento, a formação do indivíduo para desempenhar suas funções no mercado de trabalho, de forma que as instituições potencializem seus negócios e maximizem seus resultados.",
                title: "Missão"
              },
              {
                body: "Buscar a excelência para ser a melhor empresa de cursos e treinamentos no circuito nacional.",
                title: "Visão"
              },
              {
                body: "Ética, transparência e metodologias participativas, aulas expositivas, dinâmicas de grupo e trabalho em equipe, com aplicação de conhecimento técnico-científico.",
                title: "Filosofia"
              }
            ].map((item) => (
              <Card
                key={item.title}
                className="rounded-[24px] border-[#e0e6ea] bg-white shadow-[0_2px_0_rgba(17,24,39,0.03),0_18px_40px_rgba(17,24,39,0.08)]"
              >
                <CardContent className="p-8">
                  <h3 className="font-display text-[1.5rem] font-bold tracking-[-0.02em] text-[#0c6a83]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#59646d]">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-10">
            <SectionEyebrow>Valores que nos orientam</SectionEyebrow>
            <div className="mt-4 grid gap-x-10 gap-y-4 md:grid-cols-2">
              {values.map((item) => (
                <div key={item} className="flex gap-3 text-sm leading-6 text-[#59646d]">
                  <div className="mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#dff2f7] text-[#2a7a93]">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto w-[min(var(--tk-container),calc(100%-24px))] md:w-[min(var(--tk-container),calc(100%-40px))]">
          <SectionEyebrow>O que fazemos</SectionEyebrow>
          <h2 className="mt-2 font-display text-[2rem] font-bold leading-[1.08] tracking-[-0.02em] text-[#2d3135]">
            Soluções educacionais integradas
          </h2>
          <p className="mt-3 max-w-[60ch] text-[15px] leading-8 text-[#59646d]">
            Um conjunto de soluções educacionais e de consultoria adaptadas à realidade de cada cliente.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {solutions.map((item) => {
              const Icon = item.icon;

              return (
                <Card
                  key={item.title}
                  className="rounded-[24px] border-[#e0e6ea] bg-white shadow-[0_2px_0_rgba(17,24,39,0.03),0_18px_40px_rgba(17,24,39,0.08)]"
                >
                  <CardContent className="p-8">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-[12px] text-white"
                      style={{ background: item.tint }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-display text-[1.5rem] font-bold tracking-[-0.02em] text-[#2d3135]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#59646d]">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-[#e7ecef] bg-[#fafbfc] py-16">
        <div className="mx-auto w-[min(var(--tk-container),calc(100%-24px))] md:w-[min(var(--tk-container),calc(100%-40px))]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionEyebrow>Áreas de conhecimento</SectionEyebrow>
              <h2 className="mt-2 font-display text-[2rem] font-bold leading-[1.08] tracking-[-0.02em] text-[#2d3135]">
                6 trilhas, aproximadamente 80 cursos
              </h2>
            </div>
            <p className="max-w-[38ch] text-sm leading-7 text-[#59646d]">
              Cada trilha oferece progressão lógica do básico ao avançado, agrupando cursos correlacionados por especialização.
            </p>
          </div>

          <div className="mt-8 grid gap-5 xl:grid-cols-2">
            {tracks.map((track) => {
              const Icon = track.icon;

              return (
                <Card
                  key={track.title}
                  className="rounded-[24px] border-[#e0e6ea] bg-white shadow-[0_2px_0_rgba(17,24,39,0.03),0_18px_40px_rgba(17,24,39,0.08)]"
                >
                  <CardContent className="flex gap-5 p-7">
                    <div
                      className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[14px] text-white"
                      style={{ background: track.tint }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-baseline gap-2">
                        <h3 className="font-display text-base font-bold tracking-[-0.01em] text-[#2d3135]">{track.title}</h3>
                        <span className="text-[11px] font-semibold text-[#0c6a83]">{track.count}</span>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-[#59646d]">{track.description}</p>
                      <p className="mt-2 text-xs leading-6 text-[#69747e]">
                        <strong className="text-[#2d3135]">Público:</strong> {track.audience}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid w-[min(var(--tk-container),calc(100%-24px))] gap-12 md:w-[min(var(--tk-container),calc(100%-40px))] lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionEyebrow>Metodologia</SectionEyebrow>
            <h2 className="mt-2 max-w-[10ch] font-display text-[2rem] font-bold leading-[1.08] tracking-[-0.02em] text-[#2d3135]">
              Aprender fazendo, aplicar no mesmo dia
            </h2>
          </div>
          <div className="space-y-5 text-[15px] leading-8 text-[#59646d]">
            <p>
              Adotamos uma abordagem participativa e prática, valorizando a aplicação imediata do conhecimento. As capacitações combinam aulas expositivas, dinâmicas de grupo, trabalho em equipe e exercícios práticos, muitas vezes com uso de computador para temas que envolvem sistemas e ferramentas digitais como SIAFI, Tesouro Gerencial, eSocial, Excel e Power BI.
            </p>
            <p>
              Os cursos são oferecidos nas modalidades presencial e online, com turmas em diferentes horários. Cada curso é estruturado por nível, básico, intermediário ou avançado, para que o participante avance de forma consistente dentro de sua trilha de interesse.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#0c6a83] py-16 text-center text-white">
        <div className="mx-auto w-[min(var(--tk-container),calc(100%-24px))] md:w-[min(var(--tk-container),calc(100%-40px))]">
          <p className="text-sm text-white/78">Pronto para capacitar sua equipe?</p>
          <h2 className="mt-3 font-display text-[2.2rem] font-bold tracking-[-0.03em]">Fale com um especialista</h2>
          <p className="mx-auto mt-4 max-w-[52ch] font-serif text-[1.14rem] font-light leading-[1.5] text-white/82">
            Fale com um especialista sobre cursos abertos, treinamentos in company e consultoria para o setor público e privado.
          </p>
          <div className="mt-8">
            <Button asChild variant="secondary" size="lg" className="bg-white text-[#0c6a83] hover:bg-white/90">
              <Link to="/falar-com-especialista">Fale com um especialista →</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
