import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/styles/globals.css";
import { company } from "@/lib/company";
import "@/lib/env-validation";

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
      <body>{children}</body>
    </html>
  );
}
