import { IconMapPin, IconPhone } from "@tabler/icons-react";
import { PublicLeadForm } from "@/components/forms/public-lead-form";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <section className="mx-auto w-full max-w-wide px-6 py-16 md:py-24 xl:py-32">
      <div className="space-y-8">
        <div className="max-w-content space-y-4">
          <h1 className="font-heading text-4xl font-bold leading-tight text-brand-navy-700 md:text-5xl">
            Entre em Contato
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            Estamos prontos para atender suas dúvidas sobre treinamentos corporativos e gestão pública.
            Fale conosco através do formulário ou nossos canais diretos.
          </p>
        </div>

        <div className="grid items-stretch gap-6 xl:gap-8 lg:grid-cols-[0.72fr_1fr]">
          <div className="flex h-full flex-col gap-6">
              <Card>
                <CardContent className="flex items-start gap-6 p-6 md:p-8">
                  <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-navy-50 text-brand-navy-700">
                    <IconPhone size={22} />
                  </span>
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-brand-navy-700">
                      Telefones
                    </p>
                    <p className="text-xl font-extrabold text-brand-navy-900">
                      (61) 3965-1929
                    </p>
                    <p className="flex flex-wrap items-center gap-1 text-muted-foreground">
                      <span>(61) 99112-9682</span>
                      <span className="font-bold text-emerald-700">
                        (WhatsApp)
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-start gap-6 p-6 md:p-8">
                  <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-navy-50 text-brand-navy-700">
                    <IconMapPin size={22} />
                  </span>
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-brand-navy-700">
                      Localização
                    </p>
                    <p className="font-bold text-foreground">Águas Claras, Brasília - DF</p>
                    <p className="text-sm text-muted-foreground">
                      Atendimento de segunda a sexta, das 08h às 18h.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="min-h-64 overflow-hidden md:min-h-80">
                <CardContent className="flex h-full min-h-64 items-center justify-center bg-[linear-gradient(135deg,rgba(8,59,86,0.88),rgba(13,91,133,0.72)),radial-gradient(circle_at_18%_24%,rgba(255,255,255,0.38)_0_1px,transparent_2px),radial-gradient(circle_at_70%_52%,rgba(255,255,255,0.3)_0_1px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:auto,92px_92px,128px_128px,44px_44px,44px_44px] p-8 text-center text-white md:min-h-80">
                  <div className="flex flex-col items-center gap-3">
                    <span className="inline-flex size-14 items-center justify-center rounded-full bg-white text-brand-navy-700">
                      <IconMapPin size={26} />
                    </span>
                    <p className="font-extrabold">
                      Brasília, DF
                    </p>
                    <p className="max-w-xs text-sm text-white/80">
                      Referência visual da localização para atendimento comercial e treinamentos corporativos.
                    </p>
                  </div>
                </CardContent>
              </Card>
          </div>

          <div>
            <Card className="h-full">
              <CardContent className="space-y-8 p-6 md:p-12">
                <div className="flex items-center gap-4">
                  <span className="h-10 w-1 bg-brand-gold" />
                  <h2 className="font-heading text-3xl font-bold text-brand-navy-700">
                    Envie uma mensagem
                  </h2>
                </div>

                <PublicLeadForm
                  hiddenFields={{
                    tipo: "Contato",
                    origem: "Contato site RH Cursos",
                    path_to_revalidate: "/contato",
                    tema_interesse: "Contato pelo site",
                  }}
                  submitLabel="Enviar Mensagem"
                  showDescriptions={false}
                  labels={{
                    nome: "Nome Completo",
                    email: "E-mail Corporativo",
                    telefone: "Telefone / WhatsApp",
                    mensagem: "Mensagem",
                  }}
                  placeholders={{
                    nome: "Seu nome",
                    email: "email@empresa.com.br",
                    telefone: "(00) 00000-0000",
                    mensagem: "Como podemos ajudar sua organização?",
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
