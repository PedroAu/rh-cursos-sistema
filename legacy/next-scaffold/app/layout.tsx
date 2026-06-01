import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { CookieBanner } from "@/components/cookie-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppFloat } from "@/components/whatsapp-float";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-merriweather"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rhcursos.com.br"),
  title: {
    default: "RH Cursos & Soluções",
    template: "%s | RH Cursos & Soluções"
  },
  description:
    "Desde 2007, formando quem transforma. Cursos, trilhas, agenda, conteúdos e soluções In Company para RH, eSocial, DP, Compras e Licitações.",
  openGraph: {
    title: "RH Cursos & Soluções",
    description:
      "Capacitação prática para profissionais e equipes que precisam de resultado — não só de certificado.",
    url: "https://rhcursos.com.br",
    siteName: "RH Cursos & Soluções",
    locale: "pt_BR",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${merriweather.variable}`}>
      <body>
        <div className="page-shell">
          <SiteHeader />
          <main className="site-main">{children}</main>
          <SiteFooter />
          <WhatsAppFloat />
          <CookieBanner />
        </div>
      </body>
    </html>
  );
}
