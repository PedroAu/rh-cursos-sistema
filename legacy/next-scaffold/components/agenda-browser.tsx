"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { getCourseBySlug, type CalendarEvent, type CourseArea } from "@/lib/site-data";

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric"
});

const dayFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short"
});

export function AgendaBrowser({ events }: { events: CalendarEvent[] }) {
  const months = useMemo(() => [...new Set(events.map((event) => event.date.slice(0, 7)))], [events]);
  const [view, setView] = useState<"calendario" | "lista">("calendario");
  const [month, setMonth] = useState(months[0] ?? "");
  const [area, setArea] = useState<CourseArea | "">("");

  const visibleEvents = events.filter((event) => {
    const course = getCourseBySlug(event.courseSlug);
    if (!course) {
      return false;
    }

    const matchesMonth = !month || event.date.startsWith(month);
    const matchesArea = !area || course.area === area;

    return matchesMonth && matchesArea;
  });

  const groupedByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of visibleEvents) {
      const key = event.date;
      const current = map.get(key) ?? [];
      current.push(event);
      map.set(key, current);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [visibleEvents]);

  return (
    <div className="stack-lg">
      <div className="surface-card toolbar">
        <div className="button-row">
          <button
            type="button"
            className={view === "calendario" ? "button" : "button-outline"}
            onClick={() => setView("calendario")}
          >
            Calendário
          </button>
          <button
            type="button"
            className={view === "lista" ? "button" : "button-outline"}
            onClick={() => setView("lista")}
          >
            Lista
          </button>
        </div>

        <div className="selectors">
          <select value={month} onChange={(event) => setMonth(event.target.value)}>
            {months.map((value) => (
              <option key={value} value={value}>
                {monthFormatter.format(new Date(`${value}-01T12:00:00`))}
              </option>
            ))}
          </select>

          <select value={area} onChange={(event) => setArea(event.target.value as CourseArea | "")}>
            <option value="">Todas as áreas</option>
            {["eSocial", "DP", "Compras", "Licitações", "Liderança", "IA Gov"].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {view === "calendario" ? (
        <div className="site-grid grid-3">
          {groupedByDay.map(([date, dayEvents]) => (
            <div key={date} className="surface-card day-card">
              <div className="date-block">
                <strong>{dayFormatter.format(new Date(`${date}T12:00:00`))}</strong>
                <span>{monthFormatter.format(new Date(`${date}T12:00:00`))}</span>
              </div>
              <div className="stack-sm">
                {dayEvents.map((event) => {
                  const course = getCourseBySlug(event.courseSlug);
                  if (!course) {
                    return null;
                  }
                  return (
                    <div key={`${event.courseSlug}-${event.date}`} className="event-card">
                      <span className="pill">{course.area}</span>
                      <strong>{course.title}</strong>
                      <p className="muted">
                        {event.location} • {event.status}
                      </p>
                      <Link href={`/cursos/${course.slug}#checkout`}>Inscrever-se</Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="stack-md">
          {visibleEvents.map((event) => {
            const course = getCourseBySlug(event.courseSlug);
            if (!course) {
              return null;
            }
            return (
              <article key={`${event.courseSlug}-${event.date}`} className="surface-card list-card">
                <div className="stack-sm">
                  <span className="pill">{course.area}</span>
                  <h3>{course.title}</h3>
                  <p className="muted">
                    {dayFormatter.format(new Date(`${event.date}T12:00:00`))} • {event.location}
                  </p>
                </div>
                <div className="stack-sm">
                  <strong>{course.price}</strong>
                  <span className={`status ${event.status === "Lotado" ? "lotado" : ""}`}>{event.status}</span>
                  <Link className="button-outline" href={`/cursos/${course.slug}#checkout`}>
                    Ver inscrição
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 20px;
          flex-wrap: wrap;
        }

        .selectors {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          min-width: min(100%, 420px);
        }

        select {
          min-height: 52px;
          padding: 0 16px;
          border-radius: 16px;
          border: 1px solid rgba(27, 47, 94, 0.12);
          background: rgba(255, 255, 255, 0.96);
        }

        .day-card {
          padding: 22px;
          display: grid;
          gap: 18px;
        }

        .date-block {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .date-block strong {
          font-family: var(--font-merriweather), serif;
          font-size: 1.4rem;
          color: var(--color-primary);
        }

        .event-card {
          padding: 14px;
          border-radius: 14px;
          background: rgba(232, 238, 248, 0.6);
        }

        .event-card strong,
        .list-card h3 {
          display: block;
          margin: 10px 0 8px;
          font-family: var(--font-merriweather), serif;
        }

        .list-card {
          display: flex;
          justify-content: space-between;
          gap: 22px;
          padding: 22px;
        }

        .status {
          display: inline-flex;
          width: fit-content;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(122, 88, 0, 0.12);
          color: var(--color-warning);
          font-weight: 800;
        }

        .status.lotado {
          background: rgba(183, 28, 28, 0.12);
          color: var(--color-error);
        }

        @media (max-width: 767px) {
          .selectors,
          .list-card {
            grid-template-columns: 1fr;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
