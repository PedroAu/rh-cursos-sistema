import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "RH Cursos & Soluções",
  description:
    "Plataforma de cursos, treinamentos e capacitação profissional com foco em clareza, credibilidade e jornada comercial simplificada."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
