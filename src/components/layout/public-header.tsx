"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { marketingNavItems } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const pathname = usePathname();
  const [opened, setOpened] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-sky-100/90 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex w-full max-w-page items-center justify-between gap-6 px-6 py-4">
          <div className="flex min-w-0 items-center gap-8">
            <Link
              aria-label="Ir para a página inicial"
              className="flex shrink-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href="/"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-navy-700 to-brand-navy-500 text-sm font-extrabold text-white shadow-lg shadow-sky-950/15">
                RH
              </span>
              <span className="hidden xs:block">
                <span className="block font-heading text-base font-extrabold leading-tight tracking-tight text-brand-navy-900">
                  RH Cursos
                </span>
                <span className="block text-xs text-muted-foreground">Capacitação aplicada</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
              {marketingNavItems.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-md border px-4 text-sm font-bold transition-colors",
                      active
                        ? "border-brand-gold/50 bg-brand-gold/20 text-brand-navy-900"
                        : "border-transparent text-brand-navy-800 hover:bg-muted",
                    )}
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild className="hidden sm:inline-flex" variant="gold">
              <Link href="/login">
                Portal do aluno
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              aria-label={opened ? "Fechar menu" : "Abrir menu"}
              className="md:hidden"
              onClick={() => setOpened(true)}
              size="icon"
              type="button"
              variant="outline"
            >
              <Menu className="size-5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>

      <Dialog open={opened} onOpenChange={setOpened}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Navegação</DialogTitle>
          </DialogHeader>
          <nav className="grid gap-2" aria-label="Navegação mobile">
            {marketingNavItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "bg-brand-gold text-brand-navy-900" : "hover:bg-muted",
                  )}
                  href={item.href}
                  key={item.href}
                  onClick={() => setOpened(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <Button asChild className="mt-2" variant="gold">
              <Link href="/login" onClick={() => setOpened(false)}>
                Portal do aluno
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </nav>
        </DialogContent>
      </Dialog>
    </>
  );
}
