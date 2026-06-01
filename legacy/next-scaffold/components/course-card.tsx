"use client";

import Link from "next/link";

import type { Course } from "@/lib/site-data";

export function CourseCard({ course }: { course: Course }) {
  return (
    <>
      <article className="surface-card course-card">
        <div className="top">
          <span className="area">{course.area}</span>
          <div className="badges">
            {course.badges.map((badge) => (
              <span key={badge} className={`badge ${badge.toLowerCase().includes("últimas") ? "danger" : ""}`}>
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="stack-sm">
          <h3>{course.title}</h3>
          <p>{course.summary}</p>
        </div>

        <dl className="details">
          <div>
            <dt>Instrutor</dt>
            <dd>{course.instructor}</dd>
          </div>
          <div>
            <dt>Modalidade</dt>
            <dd>{course.modality}</dd>
          </div>
          <div>
            <dt>Carga</dt>
            <dd>{course.duration}</dd>
          </div>
          <div>
            <dt>Próxima turma</dt>
            <dd>{course.nextClass}</dd>
          </div>
        </dl>

        <div className="footer">
          <div>
            <span className="price">{course.price}</span>
            <div className="muted">{course.seats}</div>
          </div>
          <Link className="button-outline" href={`/cursos/${course.slug}`}>
            Saiba mais
          </Link>
        </div>
      </article>

      <style jsx>{`
        .course-card {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 24px;
          height: 100%;
        }

        .top,
        .footer {
          display: flex;
          justify-content: space-between;
          gap: 14px;
        }

        .area,
        .badge {
          display: inline-flex;
          align-items: center;
          min-height: 30px;
          padding: 0 12px;
          border-radius: 999px;
          font-size: 0.76rem;
          font-weight: 800;
        }

        .area {
          background: var(--color-primary-pale);
          color: var(--color-primary);
        }

        .badges {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 8px;
        }

        .badge {
          background: rgba(200, 150, 46, 0.14);
          color: var(--color-accent-dark);
        }

        .badge.danger {
          background: rgba(183, 28, 28, 0.12);
          color: var(--color-error);
        }

        h3 {
          margin: 0;
          font-family: var(--font-merriweather), serif;
          font-size: 1.4rem;
          line-height: 1.3;
        }

        p {
          margin: 0;
          line-height: 1.65;
        }

        .details {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin: 0;
        }

        dt {
          margin-bottom: 4px;
          color: var(--color-primary);
          font-size: 0.78rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        dd {
          margin: 0;
          font-weight: 600;
        }

        .price {
          display: block;
          font-family: var(--font-merriweather), serif;
          color: var(--color-primary);
          font-size: 1.35rem;
          font-weight: 900;
        }

        @media (max-width: 767px) {
          .top,
          .footer {
            flex-direction: column;
          }

          .details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
