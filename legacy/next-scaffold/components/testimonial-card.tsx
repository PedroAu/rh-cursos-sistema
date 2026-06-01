"use client";

import type { Testimonial } from "@/lib/site-data";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const initials = testimonial.name
    .split(" ")
    .slice(0, 2)
    .map((piece) => piece[0])
    .join("");

  return (
    <>
      <article className="surface-card testimonial-card">
        <div className="top">
          <div className="avatar">{initials}</div>
          <div>
            <strong>{testimonial.name}</strong>
            <div className="muted">
              {testimonial.role} • {testimonial.organization}
            </div>
          </div>
        </div>
        <p>{testimonial.text}</p>
        <div className="bottom">
          <span className="pill">{testimonial.area}</span>
          {testimonial.result ? <span className="result">{testimonial.result}</span> : null}
        </div>
      </article>

      <style jsx>{`
        .testimonial-card {
          display: grid;
          gap: 18px;
          padding: 24px;
          border-left: 4px solid var(--color-accent);
          height: 100%;
        }

        .top,
        .bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .avatar {
          width: 54px;
          height: 54px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
          color: var(--color-white);
          font-weight: 800;
        }

        .top {
          align-items: center;
          justify-content: flex-start;
        }

        p {
          margin: 0;
          line-height: 1.7;
        }

        .result {
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(200, 150, 46, 0.14);
          color: var(--color-accent-dark);
          font-weight: 800;
          font-size: 0.85rem;
        }
      `}</style>
    </>
  );
}
