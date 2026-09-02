import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@/__tests__/utils";
import { DepartmentPersonnelZeroLandingPage } from "@/features/public/landing-pages/departamento-pessoal-do-zero/department-personnel-zero-landing-page";
import {
  DP_ZERO_CHECKOUT_PATH,
  DP_ZERO_CTA_LABEL,
  departmentPersonnelZeroContent,
  departmentPersonnelZeroStructuredData
} from "@/features/public/landing-pages/departamento-pessoal-do-zero/content";
import { staticRoutes } from "../../../../app/sitemap";
import { metadata } from "../../../../app/lp/departamento-pessoal-do-zero/page";

const mocks = vi.hoisted(() => ({
  trackEvent: vi.fn()
}));

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  )
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: mocks.trackEvent
}));

describe("DepartmentPersonnelZeroLandingPage", () => {
  it("renderiza a oferta aprovada e a integridade da promessa", () => {
    render(<DepartmentPersonnelZeroLandingPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "As vagas pedem experiência. Você pode começar criando prática demonstrável."
      })
    ).toBeInTheDocument();
    expect(screen.getAllByText("Departamento Pessoal do Zero").length).toBeGreaterThan(0);
    expect(screen.getAllByText("40 horas").length).toBeGreaterThan(0);
    expect(screen.getByText("R$ 297")).toBeInTheDocument();
    expect(screen.getByText("Rota Essencial · 36 horas")).toBeInTheDocument();
    expect(screen.getByText("Projeto final · 4 horas")).toBeInTheDocument();
    expect(screen.getAllByText(/não garante contratação/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/depoimento/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/certificado/i)).not.toBeInTheDocument();
  });

  it("mostra os oito módulos e as sete entregas aprovadas", () => {
    render(<DepartmentPersonnelZeroLandingPage />);

    for (const moduleData of departmentPersonnelZeroContent.modules) {
      expect(screen.getByRole("heading", { name: moduleData.title })).toBeInTheDocument();
    }

    for (const item of departmentPersonnelZeroContent.portfolio) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it("mantém todos os CTAs no mesmo destino e registra analytics sem PII", async () => {
    const user = userEvent.setup();
    render(<DepartmentPersonnelZeroLandingPage />);

    const ctas = screen.getAllByRole("link", { name: DP_ZERO_CTA_LABEL });
    expect(ctas.length).toBeGreaterThanOrEqual(3);
    ctas.forEach((cta) => expect(cta).toHaveAttribute("href", DP_ZERO_CHECKOUT_PATH));

    await user.click(ctas[0]);

    expect(mocks.trackEvent).toHaveBeenCalledWith("inscricao_cta", {
      course: "departamento-pessoal-do-zero",
      origin: "lp_departamento_pessoal_do_zero"
    });
    expect(mocks.trackEvent.mock.calls[0]?.[1]).not.toHaveProperty("email");
    expect(mocks.trackEvent.mock.calls[0]?.[1]).not.toHaveProperty("name");
  });
});

describe("Departamento Pessoal do Zero SEO", () => {
  it("publica metadata factual e canonical próprio", () => {
    expect(metadata.title).toContain("Departamento Pessoal do Zero");
    expect(metadata.alternates).toMatchObject({ canonical: "/lp/departamento-pessoal-do-zero" });
    expect(metadata.openGraph).toMatchObject({
      url: "/lp/departamento-pessoal-do-zero",
      type: "website"
    });
  });

  it("gera Course e FAQPage sem prova social inventada", () => {
    expect(departmentPersonnelZeroStructuredData.course).toMatchObject({
      "@type": "Course",
      timeRequired: "PT40H",
      offers: { price: "297", priceCurrency: "BRL" }
    });
    expect(departmentPersonnelZeroStructuredData.faq).toMatchObject({ "@type": "FAQPage" });
    expect(JSON.stringify(departmentPersonnelZeroStructuredData)).not.toContain("aggregateRating");
  });

  it("inclui a rota dedicada no sitemap", () => {
    expect(staticRoutes).toContain("/lp/departamento-pessoal-do-zero");
  });
});
