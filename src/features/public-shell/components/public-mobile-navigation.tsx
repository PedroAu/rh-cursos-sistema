"use client";

import Image from "next/image";
import NextLink from "next/link";
import { Burger, Drawer } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ArrowRight, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { publicNavItems } from "@/features/public-shell/config/public-navigation";
import { company } from "@/lib/company";

export function PublicMobileNavigation() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Burger opened={opened} onClick={open} aria-label="Abrir menu" color="#0c6a83" />

      <Drawer
        opened={opened}
        onClose={close}
        keepMounted={false}
        position="right"
        title={
          <Image
            src={company.logo.src}
            alt={company.logo.alt}
            width={260}
            height={164}
            className="h-12 w-auto"
          />
        }
        styles={{
          content: { background: "#f3f0e8" },
          header: { background: "#f3f0e8", borderBottom: "1px solid #ddd7c7" },
          title: { lineHeight: 0 }
        }}
      >
        <div className="grid gap-2">
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

        <div className="mt-5 grid gap-3 border-t border-[#ddd7c7] pt-5">
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
            <NextLink href="/login">
              <UserRound className="h-4 w-4" aria-hidden="true" />
              Entrar
            </NextLink>
          </Button>
        </div>
      </Drawer>
    </>
  );
}
