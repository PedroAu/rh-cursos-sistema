import type { Metadata } from "next";
import { Inter, Manrope, Montserrat } from "next/font/google";
import type { ReactNode } from "react";

import "@/styles/globals.css";
import { MotionProvider } from "@/components/providers/motion-provider";
import { company } from "@/lib/company";
import "@/lib/env-validation";

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"]
});

const montserrat = Montserrat({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["600", "700", "800"]
});

const legacyManrope = Manrope({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-legacy-manrope",
  weight: ["600", "700", "800"]
});

export const metadata: Metadata = {
  title: "RH Cursos & Soluções",
  description:
    "Cursos, consultoria e treinamento empresarial para desenvolvimento profissional, órgãos públicos e empresas.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" }
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }]
  },
  openGraph: {
    title: company.brandName,
    description: "Cursos, consultoria e treinamento empresarial em Brasília - DF.",
    siteName: company.brandName,
    locale: "pt_BR",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${montserrat.variable} ${legacyManrope.variable}`}>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
