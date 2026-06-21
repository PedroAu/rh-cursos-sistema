import type { Metadata } from "next";
import { readAdminSettings } from "@/lib/admin-settings";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await readAdminSettings();

  return {
    title: settings.operationName,
    description:
      "Capacitação de excelência para profissionais de RH e Gestão Pública.",
    icons: {
      icon: settings.faviconUrl || "/favicon.ico",
      shortcut: settings.faviconUrl || "/favicon.ico",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
