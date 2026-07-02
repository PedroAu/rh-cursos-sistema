import Image from "next/image";
import NextLink from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { publicNavItems } from "@/features/public-shell/config/public-navigation";
import { company } from "@/lib/company";

const quickLinks = [
  { label: "Administracao", to: "/login" },
  { label: "Catalogo de cursos", to: "/cursos" },
  { label: "Consultoria", to: "/consultoria" },
  { label: "Agenda de turmas", to: "/agenda" },
  { label: "Falar com especialista", to: "/falar-com-especialista" }
];

const contactLinks: Array<{ label: string; href: string; icon: typeof Mail; external?: boolean }> = [
  { label: company.email, href: company.links.email, icon: Mail },
  { label: company.phones.whatsapp, href: company.links.whatsapp, icon: MessageCircle, external: true },
  { label: company.phones.primary, href: "tel:+556139651929", icon: Phone },
  { label: company.address.full, href: company.links.maps, icon: MapPin, external: true }
];

function FooterLinkList({ title, items }: { title: string; items: Array<{ label: string; to: string }> }) {
  return (
    <div>
      <p className="text-caption font-semibold uppercase tracking-[var(--tk-tracking-eyebrow)] text-rh-gray">{title}</p>
      <nav aria-label={title} className="mt-4 grid gap-3">
        {items.map((item) => (
          <NextLink
            key={item.to}
            href={item.to}
            className="text-sm text-tk-ink-muted transition hover:text-tk-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tk-focus focus-visible:ring-offset-2"
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
    <footer className="bg-tk-surface-2 py-12 md:py-16">
      <div className="mx-auto w-[min(var(--tk-container),calc(100%-24px))] rounded-tk-card border border-tk-line bg-tk-surface p-8 shadow-tk-card md:w-[min(var(--tk-container),calc(100%-40px))] md:p-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.7fr_0.7fr_0.9fr]">
          <div className="max-w-sm">
            <NextLink href="/" aria-label={company.logo.alt} className="inline-flex rounded-tk-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tk-focus focus-visible:ring-offset-2">
              <Image src="/images/brand/logo-horizontal.png" alt={company.logo.alt} width={453} height={285} className="h-12 w-auto" />
            </NextLink>

            <p className="mt-5 text-sm leading-6 text-tk-ink-muted">
              Cursos abertos, programas in company e consultoria para decisoes mais seguras em RH, gestao publica e rotinas operacionais.
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
                    className="inline-flex min-h-11 items-start gap-3 rounded-tk-glass border border-tk-line bg-tk-surface-2 px-4 py-3 text-sm text-tk-ink transition hover:bg-tk-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tk-focus focus-visible:ring-offset-2"
                  >
                    <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-tk-pill bg-tk-surface text-tk-accent-strong shadow-tk-glass">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="leading-5 text-tk-ink-muted">{item.label}</span>
                  </a>
                );
              })}
            </div>
          </div>

          <FooterLinkList title="Navegacao" items={publicNavItems} />
          <FooterLinkList title="Acesso rapido" items={quickLinks} />

          <div>
            <p className="text-caption font-semibold uppercase tracking-[var(--tk-tracking-eyebrow)] text-rh-gray">Atendimento</p>
            <div className="mt-4 grid gap-4 text-sm text-tk-ink-muted">
              <div className="rounded-tk-glass border border-tk-line bg-tk-surface-2 px-4 py-4">
                <p className="font-semibold text-tk-ink">Telefones</p>
                <p className="mt-2">{company.phones.primary}</p>
                <p>{company.phones.secondary}</p>
              </div>
              <div className="rounded-tk-glass border border-rh-paper-line bg-[linear-gradient(158deg,var(--rh-paper-a),var(--rh-paper-b))] px-4 py-4">
                <p className="font-semibold text-tk-ink">Base de atendimento</p>
                <p className="mt-2">{company.address.district}, {company.address.cityState}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-tk-line pt-5 text-sm text-tk-ink-muted md:flex-row md:items-center md:justify-between">
          <p>{company.legalName} · CNPJ {company.cnpj}</p>
          <p>Plataforma institucional para cursos, turmas e atendimento.</p>
        </div>
      </div>
    </footer>
  );
}
