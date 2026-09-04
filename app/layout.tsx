import type { Metadata } from "next";
import { Fraunces, Inter, Merriweather } from "next/font/google";
import type { ReactNode } from "react";

import "@/styles/globals.css";
import { ErrorBoundary } from "@/components/error-boundary";
import { AppToaster } from "@/components/ui/toaster";
import { AnalyticsConsent } from "@/components/analytics-consent";
import { company } from "@/lib/company";
import "@/lib/env-validation";
import { organizationJsonLd, SITE_URL } from "@/lib/seo";

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"]
});

const fraunces = Fraunces({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["700"],
  style: ["normal", "italic"]
});

const merriweather = Merriweather({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-merriweather",
  weight: ["300", "400", "700"],
  style: ["normal", "italic"]
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "RH Cursos & Soluções",
  description:
    "Cursos, consultoria e treinamento empresarial para desenvolvimento profissional, órgãos públicos e empresas.",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true }
  },
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
  const organizationSchema = JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c");

  return (
    <html lang="pt-BR" className={`${inter.variable} ${fraunces.variable} ${merriweather.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationSchema }} />
        <ErrorBoundary>{children}</ErrorBoundary>
        <AppToaster />
        <AnalyticsConsent />
      </body>
    </html>
  );
}
