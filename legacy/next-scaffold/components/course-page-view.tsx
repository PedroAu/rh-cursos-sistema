"use client";

import Link from "next/link";

import { CheckoutWizard } from "@/components/checkout-wizard";
import { CourseCard } from "@/components/course-card";
import { TestimonialCard } from "@/components/testimonial-card";
import type { Course, Testimonial } from "@/lib/site-data";

export function CoursePageView({
  course,
  testimonials,
  related
}: {
  course: Course;
  testimonials: Testimonial[];
  related: Course[];
}) {
  return (
    <>
      <section className="section">
        <div className="container stack-lg">
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <Link href="/">Início</Link>
            <span>/</span>
            <Link href="/cursos">Cursos</Link>
            <span>/</span>
            <span>{course.area}</span>
            <span>/</span>
            <span>{course.title}</span>
          </nav>

          <div className="course-hero">
            <div className="stack-lg">
              <span className="eyebrow">M03 • Página de venda</span>
              <div className="stack-md">
                <h1>{course.title}</h1>
                <p className="lede">{course.subtitle}</p>
              </div>
              <div className="pill-row">
                {["Certificado reconhecido", "NF-e disponível", "Vagas limitadas", "Instrutor especialista"].map(
                  (item) => (
                    <span key={item} className="pill">
                      {item}
                    </span>
                  )
                )}
              </div>
              <div className="surface-card logistics">
                {course.logistics.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>
            </div>

            <aside className="surface-card signup-box">
              <div className="stack-sm">
                <span className="pill">{course.area}</span>
                <h2>{course.price}</h2>
                <p className="muted">
                  {course.nextClass} • {course.seats}
                </p>
              </div>
              <div className="button-row">
                <a className="button" href="#checkout">
                  Inscrever-se agora
                </a>
                <a
                  className="button-outline"
                  href="https://wa.me/5561999999999?text=Quero%20saber%20mais%20sobre%20este%20curso"
                  target="_blank"
                  rel="noreferrer"
                >
                  Falar no WhatsApp
                </a>
              </div>
            </aside>
          </div>

          <div className="course-body">
            <div className="stack-lg">
              <section className="surface-card detail-card">
                <h2>O que você vai aprender</h2>
                <div className="stack-sm">
                  {course.modules.map((module) => (
                    <details key={module.title} open>
                      <summary>{module.title}</summary>
                      <ul>
                        {module.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </div>
              </section>

              <section className="surface-card detail-card">
                <h2>A quem se destina</h2>
                <div className="site-grid grid-2">
                  {course.audience.map((item) => (
                    <div key={item} className="audience-item">
                      {item}
                    </div>
                  ))}
                </div>
                <p className="muted" style={{ marginTop: "16px" }}>
                  <strong>Pré-requisitos:</strong>{" "}
                  {course.requirements ??
                    "Nenhum pré-requisito — qualquer profissional pode participar."}
                </p>
              </section>

              <section className="surface-card detail-card">
                <h2>Instrutor</h2>
                <div className="instructor">
                  <div className="instructor-photo">Foto oficial pendente</div>
                  <div className="stack-sm">
                    <strong>{course.instructor}</strong>
                    <p>
                      Especialista com vivência direta em capacitação para equipes públicas,
                      foco em aplicação prática e tradução de complexidade em clareza.
                    </p>
                  </div>
                </div>
              </section>

              {testimonials.length ? (
                <section className="stack-md">
                  <h2>Depoimentos deste curso</h2>
                  <div className="site-grid grid-3">
                    {testimonials.map((testimonial) => (
                      <TestimonialCard
                        key={`${testimonial.name}-${testimonial.organization}`}
                        testimonial={testimonial}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {related.length ? (
                <section className="stack-md">
                  <h2>Você também pode se interessar</h2>
                  <div className="site-grid grid-3">
                    {related.map((item) => (
                      <CourseCard key={item.slug} course={item} />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>

            <div className="checkout-column">
              <CheckoutWizard course={course} />
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .breadcrumb {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          color: rgba(61, 61, 61, 0.72);
          font-size: 0.92rem;
        }

        h1,
        h2 {
          margin: 0;
          font-family: var(--font-merriweather), serif;
          color: var(--color-primary);
        }

        .course-hero {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 28px;
          align-items: start;
        }

        .logistics {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          padding: 20px;
        }

        .signup-box {
          position: sticky;
          top: 104px;
          padding: 24px;
          display: grid;
          gap: 20px;
        }

        .signup-box h2 {
          font-size: 2rem;
        }

        .course-body {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 28px;
          align-items: start;
        }

        .detail-card {
          padding: 24px;
        }

        details {
          padding: 16px 0;
          border-top: 1px solid rgba(27, 47, 94, 0.08);
        }

        details:first-child {
          border-top: 0;
        }

        summary {
          cursor: pointer;
          font-weight: 800;
          color: var(--color-primary);
        }

        ul {
          margin: 12px 0 0;
          padding-left: 18px;
          line-height: 1.7;
        }

        .audience-item {
          padding: 16px;
          border-radius: 16px;
          background: rgba(232, 238, 248, 0.62);
          font-weight: 700;
        }

        .instructor {
          display: grid;
          grid-template-columns: 160px 1fr;
          gap: 18px;
          align-items: center;
        }

        .instructor-photo {
          min-height: 180px;
          border-radius: 20px;
          display: flex;
          align-items: flex-end;
          padding: 14px;
          background:
            linear-gradient(180deg, rgba(44, 74, 143, 0.16), rgba(27, 47, 94, 0.88)),
            linear-gradient(135deg, #d8c09e, #6f83a2);
          color: var(--color-white);
          font-weight: 700;
        }

        @media (max-width: 1199px) {
          .course-hero,
          .course-body,
          .instructor {
            grid-template-columns: 1fr;
          }

          .signup-box {
            position: static;
          }
        }

        @media (max-width: 767px) {
          .logistics {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
