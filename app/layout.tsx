import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import type { ReactNode } from "react";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@/styles/globals.css";
import { AppMantineProvider } from "@/components/providers/mantine-provider";
import { MotionProvider } from "@/components/providers/motion-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
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
    <html lang="pt-BR" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body className={`${inter.variable} ${montserrat.variable}`}>
        <ErrorBoundary>
          <AppMantineProvider>
            <MotionProvider>{children}</MotionProvider>
          </AppMantineProvider>
        </ErrorBoundary>
      </body>
      {GA_MEASUREMENT_ID ? <GoogleAnalytics gaId={GA_MEASUREMENT_ID} /> : null}
    </html>
  );
}
