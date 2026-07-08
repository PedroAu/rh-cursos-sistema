"use client";

import Image from "next/image";
import NextLink from "next/link";
import { ArrowRight, Menu, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useDisclosure } from "@/hooks/use-disclosure";
import { publicNavItems } from "@/features/public-shell/config/public-navigation";
import { useAppStore } from "@/lib/app-store";
import { company } from "@/lib/company";
import { getDefaultDashboardPath } from "@/lib/session-routing";

export function PublicMobileNavigation() {
  const [opened, { open, close }] = useDisclosure(false);
  const { currentSession } = useAppStore();

  return (
    <Dialog
      open={opened}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          open();
          return;
        }
        close();
      }}
    >
      <button
        type="button"
        aria-label="Abrir menu"
        aria-expanded={opened}
        onClick={open}
        className="inline-flex h-11 w-11 items-center justify-center rounded-tk-button border border-[var(--tk-black-8)] bg-tk-surface text-[#0c6a83] transition hover:bg-[var(--tk-black-5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tk-focus focus-visible:ring-offset-2"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <DialogContent className="left-auto right-0 top-0 h-screen w-[min(24rem,100vw)] translate-x-0 translate-y-0 rounded-none border-l border-[#ddd7c7] bg-[#f3f0e8] p-0">
        <DialogHeader className="border-b border-[#ddd7c7] px-6 py-5">
          <DialogTitle className="sr-only">Menu principal</DialogTitle>
          <DialogDescription className="sr-only">
            Navegação móvel principal do site RH Cursos.
          </DialogDescription>
          <Image
            src={company.logo.src}
            alt={company.logo.alt}
            width={260}
            height={164}
            className="h-12 w-auto"
          />
        </DialogHeader>

        <div className="grid gap-2 px-6 py-5">
          {publicNavItems.map((item) => (
            <NextLink
              key={item.to}
              href={item.to}
              onClick={close}
              className="rounded-lg border border-[#ddd7c7] bg-white px-4 py-3 text-sm font-semibold text-[#1f2a33] transition hover:border-[#0c6a83] hover:text-[#0c6a83] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1791a9] focus-visible:ring-offset-2"
            >
              {item.label}
            </NextLink>
          ))}
        </div>

        <div className="grid gap-3 border-t border-[#ddd7c7] px-6 py-5">
          <Button asChild className="bg-[#0c6a83] text-white hover:bg-[#084f63]" onClick={close}>
            <NextLink href="/falar-com-especialista">
              Fale com um especialista
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </NextLink>
          </Button>

          <Button
            asChild
            variant="secondary"
            className="border-[#ddd7c7] bg-white text-[#0c6a83] hover:bg-[#ebe5d8]"
            onClick={close}
          >
            <NextLink href="/agenda">Ver agenda de cursos</NextLink>
          </Button>

          <Button
            asChild
            variant="ghost"
            className="text-[#1f2a33] hover:bg-white/70"
            onClick={close}
          >
            <NextLink href={currentSession ? getDefaultDashboardPath(currentSession.role) : "/login"}>
              <UserRound className="h-4 w-4" aria-hidden="true" />
              {currentSession ? "Ir para o painel" : "Entrar"}
            </NextLink>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
