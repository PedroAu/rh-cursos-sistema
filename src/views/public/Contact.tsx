import { Mail, MapPin, MessageCircle, PhoneCall } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SectionTitle } from "@/components/common/section-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/app-store";
import { company } from "@/lib/company";

const contactItems = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: company.phones.whatsapp
  },
  {
    icon: PhoneCall,
    label: "Telefone",
    value: `${company.phones.primary} / ${company.phones.secondary}`
  },
  {
    icon: Mail,
    label: "E-mail",
    value: company.email
  },
  {
    icon: MapPin,
    label: "Localização",
    value: `${company.address.district}, ${company.address.cityState}`
  }
];

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function getPhoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function ContactPage() {
  const { createLead } = useAppStore();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = (key: keyof typeof form, value: string) => {
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError(null);
    if (key === "phone") {
      setForm((current) => ({ ...current, [key]: formatPhone(value) }));
    } else {
      setForm((current) => ({ ...current, [key]: value }));
    }
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof typeof form, string>> = {};

    if (!form.name.trim() || form.name.trim().length < 3) {
      nextErrors.name = "Nome deve ter no mínimo 3 caracteres.";
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Informe um e-mail válido.";
    }
    if (form.phone && getPhoneDigits(form.phone).length < 10) {
      nextErrors.phone = "Informe um telefone válido com pelo menos 10 dígitos.";
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      nextErrors.message = "Mensagem deve ter no mínimo 10 caracteres.";
    }

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
        courseInterest: "Contato pelo site",
        origin: "Site",
        message: form.message
      });
      toast.success("Mensagem registrada para atendimento.");
      setForm({ name: "", email: "", phone: "", message: "" });
      setErrors({});
      setSubmitError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível enviar sua mensagem.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="bg-deep-navy py-20 text-white">
        <div className="ea-container">
          <span className="inline-flex rounded bg-prestige-gold px-3 py-1.5 text-label font-bold uppercase tracking-[0.05em] text-white">Contato</span>
          <h1 className="mt-4 max-w-3xl text-white">
            Fale com a RH Cursos e encontre a capacitação certa.
          </h1>
          <p className="mt-6 max-w-2xl text-lead text-white/78">
            Tire dúvidas sobre cursos, trilhas, agenda, propostas in company e atendimento para órgãos públicos.
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/62">
            {company.legalName} • CNPJ {company.cnpj} • {company.address.full}
          </p>
        </div>
      </section>

      <section className="page-section">
        <div className="ea-container grid gap-8 xl:grid-cols-[0.9fr_1.1fr] xl:items-start">
          <div className="space-y-6">
            <SectionTitle
              eyebrow="Atendimento"
              title="Canais diretos para falar com a nossa equipe."
              description="Escolha o melhor canal ou envie uma mensagem pelo formulário. Um especialista poderá orientar o próximo passo."
            />
            <div className="grid gap-4">
              {contactItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Card key={item.label} className="border-outline-variant bg-white/95">
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[0.05em] text-text-muted">
                          {item.label}
                        </p>
                        <p className="mt-1 font-display text-xl font-bold text-deep-navy">
                          {item.value}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <a href={company.links.whatsapp} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  Chamar no WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={company.links.email}>
                  <Mail className="h-4 w-4" />
                  Enviar e-mail
                </a>
              </Button>
            </div>
          </div>

          <Card className="border-outline-variant bg-white/95 shadow-card">
            <CardContent className="grid gap-5 p-8 md:p-10">
              <div>
                <h2 className="font-display text-h2-compact font-bold text-deep-navy">
                  Envie sua mensagem
                </h2>
                <p className="mt-3 text-sm leading-7 text-text-muted">
                  Conte o que você procura e retornaremos com orientação objetiva.
                </p>
              </div>
              {submitError ? (
                <div role="alert" className="rounded-lg border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">
                  {submitError}
                </div>
              ) : null}
              <FormField error={errors.name} label="Nome completo" required>
                {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                  <Input
                    id={fieldId}
                    placeholder="Ex.: Maria Oliveira"
                    value={form.name}
                    aria-describedby={ariaDescribedBy}
                    aria-invalid={ariaInvalid}
                    onChange={(event) => update("name", event.target.value)}
                  />
                )}
              </FormField>
              <FormField error={errors.email} label="E-mail" required>
                {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                  <Input
                    id={fieldId}
                    type="email"
                    placeholder="voce@empresa.com.br"
                    value={form.email}
                    aria-describedby={ariaDescribedBy}
                    aria-invalid={ariaInvalid}
                    onChange={(event) => update("email", event.target.value)}
                  />
                )}
              </FormField>
              <FormField error={errors.phone} hint="Opcional, mas recomendado para agilizar o retorno." label="Telefone">
                {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                  <Input
                    id={fieldId}
                    type="tel"
                    inputMode="tel"
                    placeholder="(61) 99999-9999"
                    value={form.phone}
                    aria-describedby={ariaDescribedBy}
                    aria-invalid={ariaInvalid}
                    onChange={(event) => update("phone", event.target.value)}
                  />
                )}
              </FormField>
              <FormField error={errors.message} label="Mensagem" required>
                {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                  <Textarea
                    id={fieldId}
                    placeholder="Explique o que você procura, seu contexto e o tipo de ajuda desejada."
                    value={form.message}
                    aria-describedby={ariaDescribedBy}
                    aria-invalid={ariaInvalid}
                    onChange={(event) => update("message", event.target.value)}
                  />
                )}
              </FormField>
              <Button size="lg" loading={isSubmitting} onClick={submit}>
                <PhoneCall className="h-4 w-4" />
                Enviar mensagem
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
