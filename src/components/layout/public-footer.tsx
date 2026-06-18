import {
  Mail,
  MapPin,
  Phone,
  Share2,
  Smartphone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { marketingNavItems } from "@/lib/site-data";

const whatsappHref = `https://wa.me/5561991129682?text=${encodeURIComponent(
  "Olá, quero falar com um consultor da RH Cursos.",
)}`;

const quickLinks = [
  { href: "/admin", label: "Administração" },
  { href: "/cursos", label: "Catálogo de cursos" },
  { href: "/agenda", label: "Agenda de turmas" },
  { href: whatsappHref, label: "WhatsApp", external: true },
];

const serviceLinks = [
  { href: "/in-company", label: "Treinamentos In Company" },
  { href: "/especialista", label: "Falar com especialista" },
  { href: "/contato", label: "Contato comercial" },
];

function FooterLink({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  return (
    <a
      className="text-sm text-white/75 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
      href={href}
      rel={external ? "noopener noreferrer" : undefined}
      target={external ? "_blank" : undefined}
    >
      {label}
    </a>
  );
}

export function PublicFooter() {
  return (
    <footer className="mt-20 bg-brand-navy-700 text-white">
      <div className="mx-auto w-full max-w-page px-6 py-16 md:py-24 xl:py-32">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr_1fr_1fr] xl:gap-14">
          <div className="space-y-5">
            <h2 className="font-heading text-2xl font-bold text-white">RH Cursos</h2>
            <p className="max-w-sm leading-7 text-white/80">
              Desde 2007, cursos, consultoria e treinamento empresarial com foco em resultados práticos para o setor público e privado.
            </p>
            <div className="flex gap-3">
              <Button asChild className="rounded-full" size="icon" variant="gold">
                <a aria-label="Compartilhar" href="/contato">
                  <Share2 className="size-5" aria-hidden="true" />
                </a>
              </Button>
              <Button asChild className="rounded-full" size="icon" variant="gold">
                <a aria-label="Enviar e-mail" href="mailto:atendimento@rhcursos.com.br">
                  <Mail className="size-5" aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-brand-gold">Navegação</p>
            <ul className="space-y-3">
              {marketingNavItems.map((item) => (
                <li key={item.href}>
                  <FooterLink href={item.href} label={item.label} />
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-brand-gold">Atendimento</p>
            <div className="space-y-3">
              <p className="flex items-start gap-2 text-sm text-white/75">
                <Phone className="mt-0.5 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                (61) 3965-1929
              </p>
              <a className="flex items-start gap-2 text-sm text-white/75 hover:text-white" href={whatsappHref} rel="noopener noreferrer" target="_blank">
                <Smartphone className="mt-0.5 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                (61) 99112-9682
              </a>
              <p className="flex items-start gap-2 text-sm text-white/75">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                Águas Claras, Brasília - DF
              </p>
              <a className="flex items-start gap-2 text-sm text-white/75 hover:text-white" href="mailto:atendimento@rhcursos.com.br">
                <Mail className="mt-0.5 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                atendimento@rhcursos.com.br
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-brand-gold">Acesso rápido</p>
            <ul className="space-y-3">
              {[...quickLinks, ...serviceLinks].map((item) => (
                <li key={`${item.href}-${item.label}`}>
                  <FooterLink
                    external={"external" in item ? Boolean(item.external) : false}
                    href={item.href}
                    label={item.label}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/55 md:flex-row">
          <p>RH Cursos & Soluções LTDA • CNPJ 08.703.044/0001-90</p>
          <p>Plataforma institucional para cursos, turmas e atendimento.</p>
        </div>
      </div>

      <WhatsAppButton href={whatsappHref} />
    </footer>
  );
}
