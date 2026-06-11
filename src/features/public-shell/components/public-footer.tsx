import Image from "next/image";

import { publicNavItems } from "@/features/public-shell/config/public-navigation";
import { company } from "@/lib/company";
import { Link } from "@/lib/router-compat";

export function PublicFooter() {
  return (
    <footer className="relative overflow-hidden bg-[var(--ea-footer-bg)] text-white">
      <div className="ea-container relative py-20">
        <div className="grid gap-8 border-b border-white/10 pb-12 xl:grid-cols-[1.3fr_repeat(3,minmax(0,1fr))]">
          <div className="space-y-5">
            <div className="space-y-3">
              <div className="inline-flex rounded-lg bg-white p-3">
                <Image src={company.logo.src} alt={company.logo.alt} width={453} height={285} className="h-24 w-auto" />
              </div>
              <p className="max-w-md text-sm leading-7 text-white/70">
                Desde {company.foundedYear}, cursos, consultoria e treinamento empresarial.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={company.links.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-lg border border-white/12 bg-white/10 px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/12"
              >
                WhatsApp
              </a>
              <a
                href={company.links.email}
                className="inline-flex items-center rounded-lg border border-white/12 bg-white/10 px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/12"
              >
                E-mail
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
              Navegação
            </div>
            <div className="grid gap-3 text-sm text-white/80">
              {publicNavItems.map((item) => (
                <Link key={item.to} to={item.to} className="transition hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
              Atendimento
            </div>
            <div className="grid gap-3 text-sm text-white/80">
              <span>{company.phones.primary} / {company.phones.secondary}</span>
              <span>{company.phones.whatsapp}</span>
              <span>{company.address.district}, {company.address.cityState}</span>
              <span>Turmas abertas e in company</span>
              <span>Resposta em até 24h úteis</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
              Acesso rápido
            </div>
            <div className="grid gap-3 text-sm text-white/80">
              <Link to="/login" className="transition hover:text-white">
                Administração
              </Link>
              <Link to="/cursos" className="transition hover:text-white">
                Catálogo de cursos
              </Link>
              <Link to="/agenda" className="transition hover:text-white">
                Agenda de turmas
              </Link>
              <Link to="/blog" className="transition hover:text-white">
                Conteúdos do Blog
              </Link>
            </div>
          </div>
        </div>

        <form
          className="mt-12 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-8 md:grid-cols-[1.4fr_minmax(0,1fr)] md:items-end"
          onSubmit={(event) => event.preventDefault()}
          aria-labelledby="footer-newsletter-title"
        >
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Newsletter</div>
            <h2 id="footer-newsletter-title" className="text-xl font-semibold text-white">
              Receba turmas abertas e conteúdos
            </h2>
            <p className="max-w-md text-sm leading-7 text-white/70">
              Novidades de cursos, agenda de turmas e materiais — sem spam.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="footer-newsletter-email" className="sr-only">
              Assinar a newsletter
            </label>
            <input
              id="footer-newsletter-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="seu@email.com"
              className="h-12 w-full rounded-lg border border-white/15 bg-white/10 px-4 text-sm text-white placeholder:text-white/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            />
            <button
              type="submit"
              className="h-12 shrink-0 rounded-lg bg-[var(--ea-button-primary-bg,#ffc641)] px-6 text-sm font-semibold text-[var(--ea-button-primary-fg,#083b56)] transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Inscrever
            </button>
          </div>
        </form>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-8 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <span>{company.legalName} • CNPJ {company.cnpj}</span>
          <span>Plataforma institucional para cursos, turmas e atendimento.</span>
        </div>
      </div>
    </footer>
  );
}
