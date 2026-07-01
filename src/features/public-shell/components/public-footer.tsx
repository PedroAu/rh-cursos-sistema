import Image from "next/image";
import NextLink from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { publicNavItems } from "@/features/public-shell/config/public-navigation";
import { company } from "@/lib/company";

const quickLinks = [
  { label: "Administração", to: "/login" },
  { label: "Catálogo de cursos", to: "/cursos" },
  { label: "Consultoria", to: "/consultoria" },
  { label: "Agenda de turmas", to: "/agenda" },
  { label: "Falar com especialista", to: "/falar-com-especialista" }
];

const contactLinks: Array<{
  label: string;
  href: string;
  icon: typeof Mail;
  external?: boolean;
}> = [
  {
    label: company.email,
    href: company.links.email,
    icon: Mail
  },
  {
    label: company.phones.whatsapp,
    href: company.links.whatsapp,
    icon: MessageCircle,
    external: true
  },
  {
    label: company.phones.primary,
    href: "tel:+556139651929",
    icon: Phone
  },
  {
    label: company.address.full,
    href: company.links.maps,
    icon: MapPin,
    external: true
  }
];

function FooterLinkList({
  title,
  items
}: {
  title: string;
  items: Array<{ label: string; to: string }>;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0c6a83]">{title}</p>
      <nav aria-label={title} className="mt-4 grid gap-3">
        {items.map((item) => (
          <NextLink
            key={item.to}
            href={item.to}
            className="text-sm text-[#1f2a33]/78 transition hover:text-[#0c6a83] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1791a9] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            {item.label}
          </NextLink>
        ))}
      </nav>
    </div>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-[#eef0f2] pb-12 pt-6 md:pb-16">
      <div className="mx-auto w-[min(1180px,calc(100%-24px))] rounded-[24px] border border-[rgba(12,106,131,0.12)] bg-white px-6 py-10 shadow-[0_24px_70px_-38px_rgba(0,0,0,0.25)] md:w-[min(1180px,calc(100%-40px))] md:px-10 md:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.7fr_0.7fr_0.9fr]">
          <div className="max-w-sm">
            <NextLink
              href="/"
              aria-label={company.logo.alt}
              className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1791a9] focus-visible:ring-offset-2"
            >
              <Image
                src={company.logo.src}
                alt={company.logo.alt}
                width={453}
                height={285}
                className="h-[48px] w-auto"
              />
            </NextLink>

            <p className="mt-5 text-sm leading-6 text-[#5b6670]">
              Cursos abertos, programas in company e consultoria para decisões mais seguras em RH,
              gestão pública e rotinas operacionais.
            </p>

            <div className="mt-6 grid gap-3">
              {contactLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noreferrer" : undefined}
                    className="inline-flex min-h-11 items-start gap-3 rounded-[16px] border border-[rgba(12,106,131,0.12)] bg-[#f7f8f9] px-4 py-3 text-sm text-[#1f2a33] transition hover:border-[rgba(12,106,131,0.2)] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1791a9] focus-visible:ring-offset-2"
                  >
                    <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#0c6a83] shadow-[0_8px_20px_rgba(12,106,131,0.08)]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="leading-5 text-[#5b6670]">{item.label}</span>
                  </a>
                );
              })}
            </div>
          </div>

          <FooterLinkList title="Navegação" items={publicNavItems} />
          <FooterLinkList title="Acesso rápido" items={quickLinks} />

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0c6a83]">Atendimento</p>
            <div className="mt-4 grid gap-4 text-sm text-[#5b6670]">
              <div className="rounded-[18px] border border-[rgba(12,106,131,0.12)] bg-[#f7f8f9] px-4 py-4">
                <p className="font-semibold text-[#1f2a33]">Telefones</p>
                <p className="mt-2">{company.phones.primary}</p>
                <p>{company.phones.secondary}</p>
              </div>

              <div className="rounded-[18px] border border-[rgba(12,106,131,0.12)] bg-[#f3f0e8] px-4 py-4">
                <p className="font-semibold text-[#1f2a33]">Base de atendimento</p>
                <p className="mt-2">
                  {company.address.district}, {company.address.cityState}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[rgba(12,106,131,0.12)] pt-5 text-sm text-[#5b6670] md:flex-row md:items-center md:justify-between">
          <p>
            {company.legalName} · CNPJ {company.cnpj}
          </p>
          <p>Plataforma institucional para cursos, turmas e atendimento.</p>
        </div>
      </div>
    </footer>
  );
}
