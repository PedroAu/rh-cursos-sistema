"use client";

import Image from "next/image";
import NextLink from "next/link";

import { useLocation } from "@/lib/router-compat";
import { cn } from "@/lib/utils";

const footerColumns = [
  {
    items: [
      { label: "Cursos abertos", to: "/cursos" },
      { label: "Agenda", to: "/agenda" },
      { label: "In-company", to: "/in-company" },
      { label: "Consultoria", to: "/consultoria" }
    ],
    title: "Ofertas"
  },
  {
    items: [
      { label: "Sobre", to: "/sobre" },
      { label: "Blog", to: "/blog" },
      { label: "Instrutores", to: "/sobre" },
      { label: "Contato", to: "/contato" }
    ],
    title: "Empresa"
  },
  {
    items: [
      { label: "Área do aluno", to: "/login" },
      { label: "Área do instrutor", to: "/login" },
      { label: "Entrar", to: "/login" }
    ],
    title: "Acesso"
  }
] as const;

function isActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function PublicFooter() {
  const location = useLocation();

  return (
    <footer className="border-t border-[#ebebeb] bg-[#fafafa] px-6 py-14 md:px-10 md:pb-10">
      <div className="mx-auto w-[min(var(--tk-container),calc(100%-24px))] md:w-[min(var(--tk-container),calc(100%-40px))]">
        <div className="grid gap-10 border-b border-[#ebebeb] pb-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <NextLink
              href="/"
              aria-label="RH Cursos e Treinamentos Empresariais"
              className="inline-flex rounded-tk-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tk-focus focus-visible:ring-offset-2"
            >
              <Image
                src="/images/brand/logo-horizontal.png"
                alt="RH Cursos e Treinamentos Empresariais"
                width={453}
                height={285}
                className="h-12 w-auto"
              />
            </NextLink>
            <p className="mt-5 max-w-[34ch] text-sm leading-[1.55] text-[#4f5057]">
              Cursos, treinamento in-company e consultoria para organizações públicas e privadas.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#4f5057]">{column.title}</p>
              <div className="space-y-2.5">
                {column.items.map((item) => {
                  const active = isActive(location.pathname, item.to);

                  return (
                    <NextLink
                      key={item.to + item.label}
                      href={item.to}
                      className={cn(
                        "block text-sm text-[#222525] transition hover:text-[#0c6a83] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tk-focus focus-visible:ring-offset-2",
                        active && "font-semibold text-[#0c6a83]"
                      )}
                    >
                      {item.label}
                    </NextLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <p className="pt-6 text-xs text-[#4f5057]">© 2026 RH Cursos. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
