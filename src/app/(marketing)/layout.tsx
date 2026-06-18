import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-white text-foreground">
      <a
        href="#main-content"
        className="skip-link"
      >
        Pular para o conteúdo
      </a>
      <PublicHeader />
      <main id="main-content">{children}</main>
      <PublicFooter />
    </div>
  );
}
