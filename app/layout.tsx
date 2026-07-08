import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { ReactNode } from "react";

import "@/styles/globals.css";
import { ErrorBoundary } from "@/components/error-boundary";
import { AppToaster } from "@/components/ui/toaster";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import { company } from "@/lib/company";
import "@/lib/env-validation";

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"]
});

const merriweather = Merriweather({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-merriweather",
  weight: ["300", "400"],
  style: ["normal", "italic"]
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
      <body className={`${inter.variable} ${merriweather.variable}`}>
        <ErrorBoundary>{children}</ErrorBoundary>
        <AppToaster />
      </body>
      {GA_MEASUREMENT_ID ? <GoogleAnalytics gaId={GA_MEASUREMENT_ID} /> : null}
    </html>
  );
}
