"use client";

import Link from "next/link";

import { AnimatedCounter } from "@/components/animated-counter";
import { BlogCard } from "@/components/blog-card";
import { CourseCard } from "@/components/course-card";
import { TestimonialCard } from "@/components/testimonial-card";
import { blogPosts, courses, guideProofs, impactNumbers, pains, steps, testimonials } from "@/lib/site-data";

export default function HomePage() {
  return (
    <>
      <section className="section hero section-dark">
        <div className="container hero-grid">
          <div className="stack-lg">
            <span className="eyebrow">StoryBrand • Conversão em até 90 segundos</span>
            <div className="stack-md">
              <h1 className="display-title">Desde 2007, formando quem transforma.</h1>
              <p className="lede">
                Para profissionais e equipes que precisam de resultado — não só de
                certificado.
              </p>
            </div>
            <div className="button-row">
              <Link className="button" href="/cursos">
                Ver cursos
              </Link>
              <a
                className="button-ghost"
                href="https://wa.me/5561999999999?text=Quero%20falar%20com%20um%20especialista"
                target="_blank"
                rel="noreferrer"
              >
                Falar com especialista
              </a>
            </div>
            <div className="credibility">19 anos • +30 trilhas • Brasília</div>
          </div>

          <div className="hero-panel surface-card">
            <div className="photo-placeholder">
              <span>Espaço para foto oficial de Ester e Nilson</span>
            </div>
            <div className="stack-sm">
              <strong>Ester & Nilson</strong>
              <p className="muted">
                Visual hammer do projeto: fundadores reais, com nome, rosto e método que
                conecta técnica com transformação mensurável.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="container">
          <div className="site-grid grid-4">
            {impactNumbers.map((item) => (
              <AnimatedCounter key={item.label} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Stakes</span>
            <h2>Você domina o que faz. Mas a legislação não para de mudar.</h2>
            <p>
              Entendemos essa pressão. Por isso tudo que ensinamos é aplicável no dia
              seguinte.
            </p>
          </div>
          <div className="site-grid grid-3">
            {pains.map((pain) => (
              <article key={pain} className="surface-card stake-card">
                <h3>{pain}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container guide-grid">
          <div className="guide-photo">
            <div className="photo-placeholder warm">
              <span>Retrato institucional em contexto de ensino</span>
            </div>
          </div>
          <div className="stack-md guide-copy">
            <span className="eyebrow">Guia</span>
            <h2>Ester e Nilson: autoridade técnica com compromisso humano.</h2>
            <p>
              A RH Cursos & Soluções nasceu em Brasília em 2007 com um posicionamento
              simples: capacitação boa é a que muda a prática, não a que impressiona no
              slide.
            </p>
            <p>
              O caminho sempre foi o oposto do genérico. Menos volume vazio, mais clareza,
              acompanhamento e resultado mensurável para quem atua sob pressão real.
            </p>
            <blockquote>
              “Quem serve ao público merece capacitação que funciona.”
            </blockquote>
            <div className="site-grid grid-2">
              {guideProofs.map((item) => (
                <div key={item} className="proof">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Como funciona</span>
            <h2>Uma jornada simples para sair da urgência e entrar na clareza.</h2>
          </div>
          <div className="site-grid grid-3">
            {steps.map((step) => (
              <article key={step.number} className="surface-card step-card">
                <span className="step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
          <div style={{ marginTop: "28px" }}>
            <Link className="button" href="/cursos">
              Ver todas as trilhas
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="container stack-lg">
          <div className="section-heading">
            <span className="eyebrow">Cursos em destaque</span>
            <h2>Escolha a trilha certa para sua realidade técnica.</h2>
          </div>
          <div className="pill-row">
            {["Todos", "eSocial", "DP", "Compras", "Licitações", "Liderança", "IA Gov"].map((item) => (
              <span key={item} className="pill">
                {item}
              </span>
            ))}
          </div>
          <div className="site-grid grid-3">
            {courses.slice(0, 6).map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
          <div>
            <Link className="button-outline" href="/cursos">
              Ver todos os +30 cursos
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container stack-lg">
          <div className="section-heading">
            <span className="eyebrow">Prova social</span>
            <h2>Resultados que reforçam confiança antes da compra.</h2>
          </div>
          <div className="site-grid grid-3">
            {testimonials.slice(0, 3).map((testimonial) => (
              <TestimonialCard
                key={`${testimonial.name}-${testimonial.organization}`}
                testimonial={testimonial}
              />
            ))}
          </div>
          <div>
            <Link className="button-outline" href="/depoimentos">
              Ver todos os depoimentos
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="container stack-lg">
          <div className="section-heading">
            <span className="eyebrow">SEO & autoridade</span>
            <h2>Conhecimento que transforma em tráfego e confiança.</h2>
          </div>
          <div className="site-grid grid-3">
            {blogPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container cta-banner">
          <div className="stack-sm">
            <span className="eyebrow">CTA final</span>
            <h2>Pronto para ser a referência técnica da sua área?</h2>
          </div>
          <div className="button-row">
            <Link className="button" href="/cursos">
              Ver cursos
            </Link>
            <Link className="button-ghost" href="/in-company">
              Falar sobre In Company
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .hero {
          padding-top: 56px;
        }

        .hero-grid,
        .guide-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.95fr;
          gap: 28px;
          align-items: center;
        }

        .credibility {
          color: rgba(255, 255, 255, 0.78);
          font-weight: 700;
        }

        .hero-panel,
        .guide-photo {
          padding: 22px;
          background: rgba(255, 255, 255, 0.1);
        }

        .photo-placeholder {
          min-height: 420px;
          border-radius: 22px;
          display: flex;
          align-items: flex-end;
          padding: 24px;
          background:
            linear-gradient(180deg, rgba(27, 47, 94, 0.1), rgba(27, 47, 94, 0.85)),
            linear-gradient(135deg, #d7d2c4, #7c8db6);
          color: rgba(255, 255, 255, 0.92);
          font-weight: 700;
        }

        .photo-placeholder.warm {
          min-height: 520px;
          background:
            linear-gradient(180deg, rgba(200, 150, 46, 0.08), rgba(27, 47, 94, 0.9)),
            linear-gradient(135deg, #c9a07b, #4c617d);
        }

        .stake-card,
        .step-card {
          padding: 28px;
        }

        .stake-card h3,
        .step-card h3 {
          margin: 0 0 10px;
          font-family: var(--font-merriweather), serif;
          font-size: 1.45rem;
        }

        .stake-card h3 {
          line-height: 1.4;
        }

        .step-number {
          display: inline-flex;
          margin-bottom: 18px;
          color: var(--color-accent);
          font-family: var(--font-merriweather), serif;
          font-size: 3rem;
          font-weight: 900;
        }

        .guide-copy {
          border-left: 6px solid var(--color-accent);
          padding-left: 24px;
        }

        blockquote {
          margin: 0;
          font-family: var(--font-merriweather), serif;
          font-style: italic;
          font-size: 1.3rem;
          color: rgba(255, 255, 255, 0.84);
        }

        .proof {
          padding: 14px 0 14px 18px;
          border-left: 3px solid rgba(200, 150, 46, 0.6);
          color: rgba(255, 255, 255, 0.78);
        }

        .cta-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        @media (max-width: 1199px) {
          .hero-grid,
          .guide-grid,
          .cta-banner {
            grid-template-columns: 1fr;
            flex-direction: column;
            align-items: stretch;
          }

          .photo-placeholder {
            min-height: 320px;
          }
        }
      `}</style>
    </>
  );
}
