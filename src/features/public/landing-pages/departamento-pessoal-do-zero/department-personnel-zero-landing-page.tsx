import {
  ArrowDown,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock3,
  FileCheck2,
  GraduationCap,
  Laptop,
  LockKeyhole,
  X,
} from "lucide-react";
import Image from "next/image";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DepartmentPersonnelZeroCta } from "@/features/public/landing-pages/departamento-pessoal-do-zero/department-personnel-zero-cta";
import { departmentPersonnelZeroContent } from "@/features/public/landing-pages/departamento-pessoal-do-zero/content";

const approach = [
  {
    index: "01",
    title: "Aprenda",
    description:
      "Entenda as rotinas que aparecem nas vagas de entrada, do jeito que elas se conectam no dia a dia.",
  },
  {
    index: "02",
    title: "Pratique",
    description:
      "Transforme conteúdo em simulações de admissão, folha, férias, décimo terceiro e rescisão.",
  },
  {
    index: "03",
    title: "Demonstre",
    description:
      "Organize as entregas em um miniportfólio técnico, sem inventar experiência profissional.",
  },
] as const;

export function DepartmentPersonnelZeroLandingPage() {
  return (
    <article className="font-sans overflow-x-hidden bg-[#fff7ea] text-[#111820]">
      <section className="relative isolate overflow-hidden bg-[#fff7ea] pb-14 pt-3 md:pb-24">
        <div
          className="pointer-events-none absolute -right-40 -top-52 h-[32rem] w-[32rem] rounded-full bg-[#ffd34e] md:-right-24 md:-top-40 md:h-[42rem] md:w-[42rem]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -left-24 bottom-5 h-20 w-[112%] -rotate-[7deg] bg-[#ff685b] md:bottom-12 md:h-28"
          aria-hidden="true"
        />
        <div className="container relative grid items-center gap-10 lg:min-h-[680px] lg:grid-cols-[1.05fr_.95fr] lg:gap-14">
          <div className="relative z-10">
            <p className="inline-flex bg-[#3156f5] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white sm:text-sm">
              # Primeira vaga · DP
            </p>
            <h1 className="mt-6 max-w-[11ch] !font-sans text-[2.85rem] font-black leading-[0.9] tracking-[-0.065em] text-[#111820] sm:text-[4.7rem] lg:text-[5.55rem]">
              As vagas pedem experiência. Você pode começar criando prática
              demonstrável.
            </h1>
            <div className="mt-7 h-3 w-28 bg-[#ff685b]" aria-hidden="true" />
            <p className="mt-7 max-w-[48ch] text-lg font-bold leading-7 text-[#314255] sm:text-xl sm:leading-8">
              <strong>Departamento Pessoal do Zero</strong> é uma formação
              prática para você se preparar para disputar a sua primeira vaga.
            </p>
            <DepartmentPersonnelZeroCta className="mt-8 w-full rounded-none bg-[#3156f5] font-black shadow-[7px_7px_0_#111820] hover:bg-[#2148e8] sm:w-auto" />
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm font-black text-[#111820]">
              <span className="inline-flex items-center gap-2">
                <Laptop className="h-5 w-5 text-[#3156f5]" aria-hidden="true" />
                Online e gravado
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-5 w-5 text-[#3156f5]" aria-hidden="true" />
                40 horas
              </span>
              <span className="inline-flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-[#3156f5]" aria-hidden="true" />
                Para iniciantes
              </span>
            </div>
            <p className="relative z-10 mt-5 max-w-[58ch] bg-[#fff7ea] px-2 py-1 text-xs leading-5 text-[#314255]">
              A formação aumenta seu preparo para processos seletivos, mas não
              garante contratação, salário ou prazo individual de colocação.
            </p>
          </div>

          <div className="relative z-10 mx-auto w-full max-w-[500px] lg:ml-auto lg:mr-0">
            <div className="relative rotate-[3deg] border-[12px] border-[#111820] bg-[#111820] shadow-[16px_16px_0_#3156f5] sm:border-[16px]">
              <Image
                src="/images/courses/departamento-pessoal-do-zero-key-visual.png"
                alt="Duas pessoas estudando juntas em uma mesa de trabalho"
                width={1080}
                height={1920}
                priority
                className="aspect-[4/5] w-full object-cover object-[53%_58%]"
                sizes="(min-width: 1024px) 40vw, 88vw"
              />
            </div>
            <div className="absolute -bottom-7 -left-4 -rotate-[4deg] bg-[#ffd34e] px-5 py-4 text-sm font-black uppercase tracking-[0.08em] text-[#111820] shadow-[5px_5px_0_#111820] sm:-left-8 sm:text-base">
              Prática para começar
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-20 bg-[#3156f5] py-16 text-white md:py-24">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[.82fr_1.18fr] lg:items-end">
            <div>
              <p className="inline-flex bg-[#ffd34e] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#111820] sm:text-sm">
                Um novo ponto de partida
              </p>
              <h2 className="mt-5 max-w-[10ch] !font-sans !text-white text-4xl font-black leading-[0.9] tracking-[-0.055em] sm:text-6xl">
                Aprenda. Pratique. Demonstre.
              </h2>
            </div>
            <p className="max-w-[52ch] text-lg font-bold leading-8 text-white/90 sm:text-xl">
              Você não precisa fingir experiência para começar. Precisa aprender
              as rotinas, praticar com orientação e conseguir explicar o que
              sabe fazer.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {approach.map((item, index) => (
              <article
                key={item.title}
                className={`border-[3px] border-[#111820] bg-[#fff7ea] p-6 text-[#111820] shadow-[8px_8px_0_#111820] ${
                  index === 1 ? "md:-translate-y-5" : ""
                }`}
              >
                <span className="text-5xl font-black leading-none tracking-[-0.06em] text-[#b8403c]">
                  {item.index}
                </span>
                <h3 className="mt-8 !font-sans text-3xl font-black tracking-[-0.04em]">
                  {item.title}
                </h3>
                <p className="mt-4 leading-7 text-[#314255]">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#fff7ea] py-16 md:py-24">
        <div
          className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-[#d9e0ff]"
          aria-hidden="true"
        />
        <div className="container relative grid gap-6 lg:grid-cols-2">
          <div className="border-[3px] border-[#111820] bg-[#fff7ea] p-6 shadow-[9px_9px_0_#ffd34e] md:p-9">
            <p className="inline-flex bg-[#3156f5] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">
              Esta formação é para você que
            </p>
            <ul className="mt-7 space-y-4">
              {departmentPersonnelZeroContent.audiences.map((item) => (
                <li key={item} className="flex gap-3 font-semibold leading-7">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#05a5a5]" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-[3px] border-[#111820] bg-[#111820] p-6 text-white shadow-[9px_9px_0_#ff685b] md:p-9 lg:translate-y-8">
            <p className="inline-flex bg-[#ffd34e] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#111820]">
              Não é a formação indicada para
            </p>
            <ul className="mt-7 space-y-4">
              {departmentPersonnelZeroContent.notFor.map((item) => (
                <li key={item} className="flex gap-3 font-semibold leading-7 text-white/85">
                  <X className="mt-1 h-5 w-5 shrink-0 text-[#ff685b]" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-[#05a5a5] py-16 text-[#111820] md:py-24">
        <div className="container grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="inline-flex bg-[#111820] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">
              O que você vai praticar
            </p>
            <h2 className="mt-5 max-w-[11ch] !font-sans text-4xl font-black leading-[0.9] tracking-[-0.055em] sm:text-6xl">
              Do vocabulário à execução simulada.
            </h2>
            <p className="mt-6 max-w-[40ch] text-lg font-bold leading-8 text-[#111820]">
              A jornada conecta fundamentos, exercícios e materiais de candidatura
              para você organizar o que aprendeu com honestidade.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {departmentPersonnelZeroContent.outcomes.map((item) => (
              <div key={item} className="border-[3px] border-[#111820] bg-[#fff7ea] p-5 shadow-[5px_5px_0_#111820]">
                <Check className="h-6 w-6 text-[#3156f5]" aria-hidden="true" />
                <p className="mt-5 font-semibold leading-7 text-[#111820]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#111820] py-16 text-white md:py-24">
        <div className="container">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="inline-flex bg-[#ff685b] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#111820]">
                Rota Essencial · 36 horas
              </p>
              <h2 className="mt-5 max-w-[14ch] !font-sans !text-white text-4xl font-black leading-[0.9] tracking-[-0.055em] sm:text-6xl">
                Oito módulos para quem está começando.
              </h2>
            </div>
            <p className="max-w-[46ch] text-base leading-7 text-white/75">
              Os conteúdos de eSocial, FGTS Digital e DCTFWeb passam por
              validação técnica final da instrutora antes do relançamento.
            </p>
          </div>
          <ol className="mt-12 grid gap-4 md:grid-cols-2">
            {departmentPersonnelZeroContent.modules.map((module, index) => (
              <li key={module.title} className="border border-white/30 bg-white/[.05] p-6">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-4xl font-black leading-none tracking-[-0.06em] text-[#ffd34e]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="border border-white/35 px-3 py-1 text-xs font-bold text-white/85">
                    {module.duration}
                  </span>
                </div>
                <h3 className="mt-6 !font-sans !text-white text-xl font-black tracking-[-0.025em]">{module.title}</h3>
                <p className="mt-3 leading-7 text-white/70">{module.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#fff7ea] py-16 md:py-24">
        <div className="pointer-events-none absolute -left-32 top-20 h-60 w-[115%] -rotate-[7deg] bg-[#ff685b]" aria-hidden="true" />
        <div className="container relative grid items-center gap-10 lg:grid-cols-[1fr_.85fr]">
          <div className="border-[3px] border-[#111820] bg-[#fff7ea] p-7 shadow-[10px_10px_0_#3156f5] md:p-10">
            <p className="inline-flex bg-[#ffd34e] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#111820]">
              Projeto final · 4 horas
            </p>
            <h2 className="mt-5 max-w-[12ch] !font-sans text-4xl font-black leading-[0.9] tracking-[-0.055em] sm:text-6xl">
              Sete entregas para mostrar o que você praticou.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#314255]">
              Os exercícios viram materiais concretos para falar sobre o que
              você sabe fazer, sem apresentar como experiência profissional o
              que ainda está construindo.
            </p>
            <ol className="mt-8 grid gap-3 sm:grid-cols-2">
              {departmentPersonnelZeroContent.portfolio.map((item, index) => (
                <li key={item} className="flex gap-3 border-l-4 border-[#3156f5] bg-[#d9e0ff] p-4 font-semibold leading-6">
                  <span className="font-black text-[#111820]">{String(index + 1).padStart(2, "0")}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
          <aside className="border-[3px] border-[#111820] bg-[#ffd34e] p-7 text-[#111820] shadow-[10px_10px_0_#111820] md:p-9 lg:translate-y-12">
            <FileCheck2 className="h-10 w-10" aria-hidden="true" />
            <p className="mt-8 text-xs font-black uppercase tracking-[0.12em]">Conduzido por</p>
            <h2 className="mt-3 !font-sans text-4xl font-black leading-[0.92] tracking-[-0.05em]">Ester Lima</h2>
            <p className="mt-5 leading-7 text-[#314255]">
              A formação combina conteúdo técnico, aplicação prática e preparação
              para processos seletivos. A instrutora conduz a rota para iniciantes
              e valida tecnicamente os conteúdos regulatórios antes do relançamento.
            </p>
          </aside>
        </div>
      </section>

      <section className="bg-[#3156f5] py-16 text-white md:py-24">
        <div className="container grid items-start gap-10 lg:grid-cols-[1fr_.8fr]">
          <div>
            <p className="inline-flex bg-[#ff685b] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#111820]">
              Tudo o que está incluído
            </p>
            <h2 className="mt-5 max-w-[13ch] !font-sans !text-white text-4xl font-black leading-[0.9] tracking-[-0.055em] sm:text-6xl">
              Uma rota organizada para você começar.
            </h2>
            <ul className="mt-8 space-y-4">
              {departmentPersonnelZeroContent.included.map((item) => (
                <li key={item} className="flex gap-3 text-lg font-bold leading-7">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#ffd34e]" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <aside className="border-[4px] border-[#111820] bg-[#fff7ea] p-7 text-[#111820] shadow-[12px_12px_0_#111820] md:p-9">
            <p className="inline-flex bg-[#05a5a5] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#111820]">Curso avulso</p>
            <p className="mt-8 text-sm font-bold uppercase tracking-[0.1em] text-[#314255]">Investimento por participante</p>
            <p className="mt-2 text-6xl font-black leading-none tracking-[-0.07em]">R$ 297</p>
            <p className="mt-4 leading-6 text-[#314255]">Parcelamento conforme o meio de pagamento disponível.</p>
            <div className="mt-7 border-y-[3px] border-[#111820] py-5">
              <p className="font-black">Garantia de satisfação de 7 dias</p>
              <p className="mt-2 text-sm leading-6 text-[#314255]">Para compras online, dentro das condições aplicáveis ao período inicial de acesso.</p>
            </div>
            <DepartmentPersonnelZeroCta className="mt-8 w-full rounded-none bg-[#ff685b] font-black text-[#111820] shadow-[6px_6px_0_#111820] hover:bg-[#f75a4d]" />
            <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-[#314255]">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Inscrição e pagamento em ambiente seguro.
            </p>
          </aside>
        </div>
      </section>

      <section className="bg-[#fff7ea] py-16 md:py-24">
        <div className="container grid gap-9 lg:grid-cols-[.75fr_1.25fr]">
          <div>
            <p className="inline-flex bg-[#3156f5] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">Perguntas frequentes</p>
            <h2 className="mt-5 max-w-[10ch] !font-sans text-4xl font-black leading-[0.9] tracking-[-0.055em] sm:text-6xl">Decida com clareza.</h2>
            <p className="mt-6 max-w-[32ch] text-lg leading-8 text-[#314255]">Respostas diretas sobre a formação, o esforço necessário e o que ela realmente entrega.</p>
          </div>
          <Accordion type="single" collapsible className="border-[3px] border-[#111820] bg-white px-5 shadow-[8px_8px_0_#ffd34e] md:px-7">
            {departmentPersonnelZeroContent.faqs.map((item, index) => (
              <AccordionItem key={item.question} value={`faq-${index + 1}`}>
                <AccordionTrigger className="min-h-16 text-left font-black">{item.question}</AccordionTrigger>
                <AccordionContent className="leading-7 text-[#314255]">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#111820] py-16 text-white md:py-24">
        <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#ffd34e]" aria-hidden="true" />
        <div className="container relative text-center">
          <ArrowUpRight className="mx-auto h-11 w-11 text-[#ff685b]" aria-hidden="true" />
          <h2 className="mx-auto mt-7 max-w-[13ch] !font-sans !text-white text-4xl font-black leading-[0.9] tracking-[-0.055em] sm:text-6xl">
            Sua primeira oportunidade começa com preparo.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-bold leading-8 text-white/80">
            Aprenda as rotinas, pratique com orientação e organize evidências honestas do que você sabe fazer.
          </p>
          <DepartmentPersonnelZeroCta className="mt-9 w-full rounded-none bg-[#ffd34e] font-black text-[#111820] shadow-[7px_7px_0_#ff685b] hover:bg-[#ffc527] sm:w-auto" />
          <a href="#como-funciona" className="mx-auto mt-9 flex min-h-11 w-fit items-center gap-2 text-sm font-bold text-white/80 underline-offset-4 hover:underline">
            Conheça a rota de aprendizagem <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>
    </article>
  );
}
