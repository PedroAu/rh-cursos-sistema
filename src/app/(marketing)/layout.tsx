import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { readAdminSettings } from "@/lib/admin-settings";

export default async function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await readAdminSettings();

  return (
    <div className="min-h-screen bg-white text-foreground">
      <a
        href="#main-content"
        className="skip-link"
      >
        Pular para o conteúdo
      </a>
      <PublicHeader
        mainLogoUrl={settings.mainLogoUrl}
        operationName={settings.operationName}
      />
      <main id="main-content">{children}</main>
      <PublicFooter />
    </div>
  );
}
