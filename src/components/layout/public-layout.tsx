import { LockKeyhole, Menu, MessageCircle, PhoneCall, Search } from "lucide-react";
import Image from "next/image";
import { useMemo, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation } from "@/lib/router-compat";

import { CommandPalette } from "@/components/common/command-palette";
import { AppToaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/app-store";
import { company } from "@/lib/company";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/cursos", label: "Cursos" },
  { to: "/in-company", label: "In Company" },
  { to: "/agenda", label: "Agenda" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" }
];

function WhatsAppSupport() {
  const { createLead } = useAppStore();
  const [message, setMessage] = useState("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          id="atendimento"
          className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-accent text-white shadow-card transition hover:-translate-y-0.5 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Abrir atendimento"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atendimento rápido</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              "Quero saber sobre cursos",
              "Quero orçamento para empresa",
              "Quero turma in company",
              "Quero ajuda com inscrição",
              "Quero informações sobre pagamento"
            ].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMessage(option)}
                className="rounded-lg border border-border bg-muted px-4 py-3 text-left text-sm font-medium hover:border-accent hover:bg-secondary/60"
              >
                {option}
              </button>
            ))}
          </div>
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Escreva sua mensagem para a equipe de atendimento"
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() =>
                createLead({
                  name: "Lead do atendimento",
                  email: company.email,
                  phone: company.phones.whatsapp,
                  courseInterest: "Atendimento geral",
                  origin: "WhatsApp",
                  message: message || "Solicitação enviada pelo atendimento rápido"
                })
              }
            >
              <PhoneCall className="h-4 w-4" />
              Enviar solicitação
            </Button>
            <Button asChild variant="outline">
              <a href={company.links.whatsapp} target="_blank" rel="noreferrer">
                Ir para WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PublicLayout({ children }: { children?: ReactNode }) {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [open, setOpen] = useState(false);

  const headerClasses = useMemo(
    () =>
      `sticky top-0 z-30 border-b border-outline-variant transition-all duration-300 ${
        isHome ? "apple-material" : "apple-material"
      }`,
    [isHome]
  );

  return (
    <div className="min-h-screen">
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <header className={headerClasses}>
        <div className="ea-container flex min-h-[72px] items-center justify-between gap-8">
          <Link to="/" className="flex items-center gap-3">
            <Image src={company.logo.src} alt={company.logo.alt} width={453} height={285} className="h-12 w-auto" priority />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `relative border-b-2 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-primary"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <div className="relative hidden xl:block" role="search">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                aria-label="Buscar cursos"
                className="h-11 w-48 rounded-lg border border-outline-variant bg-white/85 pl-10 pr-4 text-sm outline-none transition focus:border-prestige-gold focus:ring-2 focus:ring-ring/25"
                placeholder="Buscar cursos..."
              />
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/login">
                <LockKeyhole className="h-4 w-4" />
                Admin
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Abrir menu"
                  className="border-primary/20 bg-white/85"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="space-y-6 border-primary/10 bg-background">
                <div>
                  <Image src={company.logo.src} alt={company.logo.alt} width={453} height={285} className="h-20 w-auto" />
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    Acesso rápido às principais áreas do site.
                  </p>
                </div>
                <div className="grid gap-3">
                  {navItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="rounded-lg border border-primary/10 bg-white px-4 py-4 font-medium text-foreground shadow-soft"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div className="grid gap-3">
                  <Button asChild variant="secondary" className="w-full">
                    <Link to="/cursos" onClick={() => setOpen(false)}>
                      Ver cursos
                    </Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link to="/login" onClick={() => setOpen(false)}>
                      Admin
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full">
                    <a href="#atendimento" onClick={() => setOpen(false)}>
                      <MessageCircle className="h-4 w-4" />
                      Falar com atendimento
                    </a>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main id="main-content">
        {children ?? <Outlet />}
      </main>

      <footer className="relative overflow-hidden bg-primary text-white">
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
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                Navegação
              </div>
              <div className="grid gap-3 text-sm text-white/80">
                {navItems.map((item) => (
                  <Link key={item.to} to={item.to} className="transition hover:text-white">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
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
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
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

          <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-8 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
            <span>{company.legalName} • CNPJ {company.cnpj}</span>
            <span>Plataforma institucional para cursos, turmas e atendimento.</span>
          </div>
        </div>
      </footer>

      <WhatsAppSupport />
      <CommandPalette />
      <AppToaster />
    </div>
  );
}
