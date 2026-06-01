"use client";

import { useMemo, useState } from "react";

import { TestimonialCard } from "@/components/testimonial-card";
import { courses, type Testimonial } from "@/lib/site-data";

const areas = ["Todos", "eSocial", "DP", "Compras", "Licitações", "Liderança"];

export function TestimonialsExplorer({ items }: { items: Testimonial[] }) {
  const [area, setArea] = useState("Todos");
  const [course, setCourse] = useState("");

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const matchesArea = area === "Todos" || item.area === area;
        const matchesCourse = !course || item.courseSlug === course;
        return matchesArea && matchesCourse;
      }),
    [area, course, items]
  );

  return (
    <div className="stack-lg">
      <div className="surface-card filter-panel">
        <div className="pill-row">
          {areas.map((option) => (
            <button
              key={option}
              type="button"
              className={`pill-button ${area === option ? "active" : ""}`}
              onClick={() => setArea(option)}
            >
              {option}
            </button>
          ))}
        </div>
        <select value={course} onChange={(event) => setCourse(event.target.value)}>
          <option value="">Todos os cursos</option>
          {courses.map((courseItem) => (
            <option key={courseItem.slug} value={courseItem.slug}>
              {courseItem.title}
            </option>
          ))}
        </select>
      </div>

      <div className="surface-card counter">
        {filtered.length} profissionais e equipes que transformaram seus resultados.
      </div>

      <div className="site-grid grid-3">
        {filtered.map((item) => (
          <TestimonialCard key={`${item.name}-${item.organization}`} testimonial={item} />
        ))}
      </div>

      <style jsx>{`
        .filter-panel {
          display: grid;
          gap: 16px;
          padding: 20px;
        }

        select {
          min-height: 52px;
          padding: 0 16px;
          border-radius: 16px;
          border: 1px solid rgba(27, 47, 94, 0.12);
          background: rgba(255, 255, 255, 0.96);
        }

        .pill-button {
          min-height: 38px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid rgba(27, 47, 94, 0.12);
          background: rgba(255, 255, 255, 0.9);
          font-weight: 700;
        }

        .pill-button.active {
          background: var(--color-primary);
          color: var(--color-white);
        }

        .counter {
          padding: 18px 20px;
          font-weight: 800;
          color: var(--color-primary);
        }
      `}</style>
    </div>
  );
}
