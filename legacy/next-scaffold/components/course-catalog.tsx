"use client";

import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { CourseCard } from "@/components/course-card";
import type { Course } from "@/lib/site-data";

type Filters = {
  query?: string;
  area?: string;
  modality?: string;
  level?: string;
};

const areaOptions = ["eSocial", "DP", "Compras", "Licitações", "Liderança", "IA Gov"];
const modalityOptions = ["Presencial", "Online", "Híbrido", "In Company"];
const levelOptions = ["Iniciante", "Intermediário", "Avançado"];

export function CourseCatalog({
  courses,
  initialFilters = {}
}: {
  courses: Course[];
  initialFilters?: Filters;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialFilters.query ?? "");
  const [area, setArea] = useState(initialFilters.area ?? "");
  const [modality, setModality] = useState(initialFilters.modality ?? "");
  const [level, setLevel] = useState(initialFilters.level ?? "");
  const deferredQuery = useDeferredValue(query);

  const filteredCourses = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesQuery =
        !normalized ||
        [course.title, course.instructor, course.summary, course.area]
          .join(" ")
          .toLowerCase()
          .includes(normalized);

      const matchesArea = !area || course.area === area;
      const matchesModality = !modality || course.modality === modality;
      const matchesLevel = !level || course.level === level;

      return matchesQuery && matchesArea && matchesModality && matchesLevel;
    });
  }, [area, courses, deferredQuery, level, modality]);

  const updateRoute = (next: Filters) => {
    const params = new URLSearchParams();

    if (next.query) params.set("query", next.query);
    if (next.area) params.set("area", next.area);
    if (next.modality) params.set("modality", next.modality);
    if (next.level) params.set("level", next.level);

    startTransition(() => {
      router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname, {
        scroll: false
      });
    });
  };

  const highlightTerm = (text: string) => {
    const normalized = deferredQuery.trim();
    if (!normalized) {
      return text;
    }

    const pattern = new RegExp(`(${normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
    const pieces = text.split(pattern);

    return pieces.map((piece, index) =>
      pattern.test(piece) ? (
        <mark key={`${piece}-${index}`}>{piece}</mark>
      ) : (
        <span key={`${piece}-${index}`}>{piece}</span>
      )
    );
  };

  return (
    <div className="stack-lg">
      <div className="surface-card filter-panel">
        <div className="search">
          <label className="sr-only" htmlFor="course-search">
            Buscar cursos
          </label>
          <input
            id="course-search"
            value={query}
            onChange={(event) => {
              const nextQuery = event.target.value;
              setQuery(nextQuery);
              updateRoute({ query: nextQuery, area, modality, level });
            }}
            placeholder="Busque por título, instrutor ou palavra-chave"
          />
        </div>

        <div className="pill-row">
          {areaOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`pill-button ${area === option ? "active" : ""}`}
              onClick={() => {
                const next = area === option ? "" : option;
                setArea(next);
                updateRoute({ query, area: next, modality, level });
              }}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="selectors">
          <select
            value={modality}
            onChange={(event) => {
              const next = event.target.value;
              setModality(next);
              updateRoute({ query, area, modality: next, level });
            }}
          >
            <option value="">Todas as modalidades</option>
            {modalityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            value={level}
            onChange={(event) => {
              const next = event.target.value;
              setLevel(next);
              updateRoute({ query, area, modality, level: next });
            }}
          >
            <option value="">Todos os níveis</option>
            {levelOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="results-header">
        <div>
          <strong>Exibindo {filteredCourses.length}</strong> de {courses.length} cursos
        </div>
        {deferredQuery ? (
          <div className="query-summary">Resultados para {highlightTerm(deferredQuery)}</div>
        ) : null}
      </div>

      <div className="site-grid grid-3">
        {filteredCourses.map((course) => (
          <CourseCard key={course.slug} course={course} />
        ))}
      </div>

      {!filteredCourses.length ? (
        <div className="surface-card empty-state">
          Nenhum curso combinou com esses filtros. Tente ampliar a busca ou fale com a
          equipe para uma trilha sob medida.
        </div>
      ) : null}

      <style jsx>{`
        .filter-panel {
          display: grid;
          gap: 18px;
          padding: 22px;
        }

        .search input,
        .selectors select {
          width: 100%;
          min-height: 54px;
          padding: 0 16px;
          border-radius: 16px;
          border: 1px solid rgba(27, 47, 94, 0.12);
          background: rgba(255, 255, 255, 0.96);
        }

        .selectors {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .pill-button {
          min-height: 40px;
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

        .results-header {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: center;
          flex-wrap: wrap;
        }

        .query-summary :global(mark) {
          background: rgba(200, 150, 46, 0.24);
          color: inherit;
          padding: 0 2px;
        }

        .empty-state {
          padding: 26px;
          text-align: center;
          line-height: 1.7;
        }

        @media (max-width: 767px) {
          .selectors {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
