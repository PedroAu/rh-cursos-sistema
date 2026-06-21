import { notFound } from "next/navigation";

import { CheckoutClient } from "@/components/payment/checkout-client";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { getPublicCourseBySlug } from "@/lib/public-data";

type PaymentPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    enrollmentRef?: string;
    nome?: string;
    cpf?: string;
    e2eMockCheckout?: string;
  }>;
};

export default async function PaymentPage({ params, searchParams }: PaymentPageProps) {
  const { slug } = await params;
  const { enrollmentRef, nome, cpf, e2eMockCheckout } = await searchParams;

  const course = await getPublicCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  return (
    <main className="bg-muted/30">
      <Section as="div" size="md">
        <Container variant="prose" as="section">
          <div className="space-y-8">
            <h1 className="font-heading text-3xl font-bold leading-tight text-brand-navy-700 md:text-4xl">
              Pagamento — {course.title}
            </h1>
            <CheckoutClient
              courseSlug={slug}
              enrollmentRef={enrollmentRef}
              customer={{ name: nome ?? "", cpfCnpj: cpf ?? "" }}
              mockMode={process.env.NODE_ENV !== "production" && e2eMockCheckout === "1"}
            />
          </div>
        </Container>
      </Section>
    </main>
  );
}
