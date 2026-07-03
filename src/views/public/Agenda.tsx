"use client";

import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  List,
  MapPin,
  Search,
  UserRound,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useHotkey } from "@/hooks/use-hotkey";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useAppStore } from "@/lib/app-store";
import { Link, useSearchParams } from "@/lib/router-compat";
import { cn, currency } from "@/lib/utils";
import type { Course, Instructor, TrainingClass } from "@/types";

type AgendaMode = "Online" | "Presencial";
type AgendaView = "lista" | "calendario";
type SortMode = "data" | "preco-asc" | "preco-desc";

type AgendaEntry = {
  category: string;
  course: Course;
  date: Date;
  dateKey: string;
  day: string;
  weekday: string;
  monthKey: string;
  monthLabel: string;
  monthShort: string;
  instructor: Instructor | undefined;
  mode: AgendaMode;
  modeClassName: string;
  modeLabel: string;
  place: string;
  price: number;
  spotBgClass: string;
  spotColorClass: string;
  spotLabel: string;
  trainingClass: TrainingClass;
};

const ONLINE_MODALITIES = new Set(["Ao vivo online", "Gravado"]);
const AGENDA_CATEGORY_ORDER = [
  "Licitações e Contratos",
  "LGPD e Privacidade",
  "Gestão Pública",
  "Compliance"
] as const;

function normalizeCategory(course: Course) {
  return course.category ?? course.pathName;
}

function normalizeAgendaMode(trainingClass: TrainingClass): AgendaMode {
  return ONLINE_MODALITIES.has(trainingClass.modality) ? "Online" : "Presencial";
}

function formatPlace(trainingClass: TrainingClass) {
  if (normalizeAgendaMode(trainingClass) === "Online") {
    return "Online ao vivo";
  }

  const value = trainingClass.location;

  if (/Bras[ií]lia/i.test(value)) {
    return "Brasília · DF";
  }

  if (/S[aã]o Paulo/i.test(value)) {
    return "São Paulo · SP";
  }

  return value.replace(",", " ·");
}

function createSpotMeta(trainingClass: TrainingClass) {
  if (trainingClass.status === "Poucas vagas") {
    return {
      bgClass: "bg-[#fdeef0]",
      colorClass: "text-[#c0293b]",
      label: "Poucas vagas"
    };
  }

  if (trainingClass.status === "Em breve") {
    return {
      bgClass: "bg-[#e0eeff]",
      colorClass: "text-[#2459b3]",
      label: "Turma nova"
    };
  }

  return {
    bgClass: "bg-[#e8f7f2]",
    colorClass: "text-[#0f6f5f]",
    label: "Inscrições abertas"
  };
}

function buildAgendaEntries(courses: Course[], classes: TrainingClass[], instructors: Instructor[]) {
  const coursesById = new Map(courses.map((course) => [course.id, course]));
  const instructorsById = new Map(instructors.map((instructor) => [instructor.id, instructor]));

  return classes
    .filter((trainingClass) => trainingClass.status !== "Encerrada")
    .map((trainingClass) => {
      const course = coursesById.get(trainingClass.courseId);

      if (!course) {
        return null;
      }

      const date = new Date(trainingClass.startDate);
      const mode = normalizeAgendaMode(trainingClass);
      const spot = createSpotMeta(trainingClass);

      return {
        category: normalizeCategory(course),
        course,
        date,
        dateKey: format(date, "yyyy-MM-dd"),
        day: format(date, "dd", { locale: ptBR }),
        weekday: format(date, "EEE", { locale: ptBR }),
        monthKey: format(date, "MMMM yyyy", { locale: ptBR }),
        monthLabel: format(date, "MMMM", { locale: ptBR }),
        monthShort: format(date, "MMM", { locale: ptBR }).replace(".", "").toUpperCase(),
        instructor: instructorsById.get(trainingClass.instructorId),
        mode,
        modeClassName:
          mode === "Online" ? "bg-[#e0eeff] text-[#2459b3]" : "bg-[#fdeef0] text-[#c0293b]",
        modeLabel: mode === "Online" ? "Online ao vivo" : "Presencial",
        place: formatPlace(trainingClass),
        price: trainingClass.price || course.price,
        spotBgClass: spot.bgClass,
        spotColorClass: spot.colorClass,
        spotLabel: spot.label,
        trainingClass
      } satisfies AgendaEntry;
    })
    .filter((entry): entry is AgendaEntry => Boolean(entry))
    .sort((left, right) => left.date.getTime() - right.date.getTime());
}

function buildCalendarDays(monthDate: Date) {
  const firstDay = startOfMonth(monthDate);
  const lastDay = endOfMonth(monthDate);
  const start = startOfWeek(firstDay, { locale: ptBR });
  const end = endOfWeek(lastDay, { locale: ptBR });
  const days: Date[] = [];
  let cursor = start;

  while (cursor <= end) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return days;
}

function formatResultsLabel(count: number) {
  return `${count} turma${count === 1 ? "" : "s"} encontrada${count === 1 ? "" : "s"}`;
}

export function AgendaPage() {
  const { classes, courses, instructors } = useAppStore();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [mode, setMode] = useState<"" | AgendaMode>((params.get("mode") as AgendaMode | "") ?? "");
  const [area, setArea] = useState(params.get("area") ?? "");
  const [city, setCity] = useState(params.get("city") ?? "");
  const [sort, setSort] = useState<SortMode>((params.get("sort") as SortMode) || "data");
  const [view, setView] = useState<AgendaView>((params.get("view") as AgendaView) || "lista");
  const searchRef = useRef<HTMLInputElement>(null);

  useHotkey(
    (event) => event.key === "/" && !["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName),
    (event) => {
      event.preventDefault();
      searchRef.current?.focus();
    }
  );

  const agendaEntries = useMemo(
    () => buildAgendaEntries(courses, classes, instructors),
    [classes, courses, instructors]
  );

  const areaOptions = useMemo(
    () =>
      [...new Set(agendaEntries.map((entry) => entry.category))].sort((left, right) => {
        const leftIndex = AGENDA_CATEGORY_ORDER.indexOf(left as (typeof AGENDA_CATEGORY_ORDER)[number]);
        const rightIndex = AGENDA_CATEGORY_ORDER.indexOf(right as (typeof AGENDA_CATEGORY_ORDER)[number]);

        if (leftIndex !== -1 || rightIndex !== -1) {
          return (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex) - (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex);
        }

        return left.localeCompare(right);
      }),
    [agendaEntries]
  );

  const cityOptions = useMemo(
    () => [...new Set(agendaEntries.map((entry) => entry.place))].sort((left, right) => left.localeCompare(right)),
    [agendaEntries]
  );

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const next = agendaEntries.filter((entry) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          entry.course.title,
          entry.category,
          entry.instructor?.name ?? "",
          entry.place
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return (
        matchesQuery &&
        (!mode || entry.mode === mode) &&
        (!area || entry.category === area) &&
        (!city || entry.place === city)
      );
    });

    if (sort === "preco-asc") {
      return [...next].sort((left, right) => left.price - right.price || left.date.getTime() - right.date.getTime());
    }

    if (sort === "preco-desc") {
      return [...next].sort((left, right) => right.price - left.price || left.date.getTime() - right.date.getTime());
    }

    return next;
  }, [agendaEntries, area, city, mode, query, sort]);

  const [calendarDate, setCalendarDate] = useState(() => {
    if (filteredEntries[0]) {
      return startOfMonth(filteredEntries[0].date);
    }

    return startOfMonth(new Date());
  });

  useEffect(() => {
    const next = new URLSearchParams();

    if (query.trim()) {
      next.set("q", query.trim());
    }

    if (mode) {
      next.set("mode", mode);
    }

    if (area) {
      next.set("area", area);
    }

    if (city) {
      next.set("city", city);
    }

    if (sort !== "data") {
      next.set("sort", sort);
    }

    if (view !== "lista") {
      next.set("view", view);
    }

    setParams(next);
  }, [area, city, mode, query, setParams, sort, view]);

  useEffect(() => {
    if (!filteredEntries.length) {
      setCalendarDate(startOfMonth(new Date()));
      return;
    }

    const hasEntryInVisibleMonth = filteredEntries.some((entry) => isSameMonth(entry.date, calendarDate));
    if (!hasEntryInVisibleMonth) {
      setCalendarDate(startOfMonth(filteredEntries[0].date));
    }
  }, [calendarDate, filteredEntries]);

  const loading = useSimulatedLoading([query, mode, area, city, sort, view], 350);
  const hasActiveFilters = Boolean(query || mode || area || city || sort !== "data");

  const activeChips = [
    query ? { key: "q", label: `Busca: ${query}`, onRemove: () => setQuery("") } : null,
    mode ? { key: "mode", label: mode === "Online" ? "Modalidade: Online" : "Modalidade: Presencial", onRemove: () => setMode("") } : null,
    area ? { key: "area", label: `Área: ${area}`, onRemove: () => setArea("") } : null,
    city ? { key: "city", label: `Local: ${city}`, onRemove: () => setCity("") } : null,
    sort !== "data"
      ? {
          key: "sort",
          label: sort === "preco-asc" ? "Preço: menor primeiro" : "Preço: maior primeiro",
          onRemove: () => setSort("data")
        }
      : null
  ].filter((chip): chip is { key: string; label: string; onRemove: () => void } => Boolean(chip));

  const months = useMemo(() => {
    const groups: Array<{ key: string; label: string; items: AgendaEntry[] }> = [];

    filteredEntries.forEach((entry) => {
      const current = groups[groups.length - 1];

      if (!current || current.key !== entry.monthKey) {
        groups.push({
          key: entry.monthKey,
          label: entry.monthLabel,
          items: [entry]
        });
        return;
      }

      current.items.push(entry);
    });

    return groups;
  }, [filteredEntries]);

  const calendarDays = useMemo(() => buildCalendarDays(calendarDate), [calendarDate]);

  const monthEntries = useMemo(
    () => filteredEntries.filter((entry) => isSameMonth(entry.date, calendarDate)),
    [calendarDate, filteredEntries]
  );

  const entryCountByDate = useMemo(() => {
    const counts = new Map<string, number>();

    monthEntries.forEach((entry) => {
      counts.set(entry.dateKey, (counts.get(entry.dateKey) ?? 0) + 1);
    });

    return counts;
  }, [monthEntries]);

  const firstEntryByDate = useMemo(() => {
    const map = new Map<string, AgendaEntry>();

    monthEntries.forEach((entry) => {
      if (!map.has(entry.dateKey)) {
        map.set(entry.dateKey, entry);
      }
    });

    return map;
  }, [monthEntries]);

  const clearFilters = () => {
    setQuery("");
    setMode("");
    setArea("");
    setCity("");
    setSort("data");
  };

  return (
    <div className="bg-[#eef0f2]">
      <section className="border-b border-[#ebebeb] bg-[radial-gradient(circle_at_50%_-10%,#f7f9fc_30%,#ebf3ff_130%)] py-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 xl:px-10">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full bg-[#dff3fb] px-4 py-2 text-sm font-semibold text-[#0c6a83]">
                <span className="mr-2 h-2 w-2 rounded-full bg-[#1791a9]" />
                Agenda
              </div>
              <h1 className="max-w-[20ch] font-display text-[2.75rem] font-bold leading-[1.08] tracking-[-0.02em] text-[#222525]">
                Próximas turmas, em <em className="italic text-[#0c6a83]">ordem</em> de data
              </h1>
              <p className="max-w-[58ch] font-serif text-[1.35rem] font-light leading-[1.45] text-[#4f5057]">
                Todas as turmas presenciais e online ao vivo confirmadas no calendário. Busque pelo nome do curso ou refine
                por modalidade, área e local.
              </p>
            </div>

            <div className="space-y-4" data-testid="ui-agenda-filters">
              <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
                <label className="relative block min-w-[240px] flex-1 lg:max-w-[360px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7f8c94]" />
                  <input
                    ref={searchRef}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    aria-label="Buscar por curso, tema ou instrutor"
                    placeholder="Buscar por curso, tema ou instrutor..."
                    className="h-11 w-full rounded-[4px] border border-[#ebebeb] bg-white px-11 pr-12 text-sm text-[#222525] outline-none transition focus:border-[#1791a9] focus:ring-4 focus:ring-[#e0f2f6]"
                  />
                  {query ? (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label="Limpar busca da agenda"
                      className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#7f8c94] transition hover:bg-[#f3f4f6] hover:text-[#222525]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </label>

                <div className="flex h-11 flex-wrap rounded-[6px] border border-[#ebebeb] bg-white p-1">
                  {[
                    { label: "Todas", value: "" },
                    { label: "Online", value: "Online" },
                    { label: "Presencial", value: "Presencial" }
                  ].map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setMode(option.value as "" | AgendaMode)}
                      className={cn(
                        "rounded-[4px] px-4 text-sm font-medium text-[#4f5057] transition",
                        mode === option.value && "bg-[#0c6a83] font-semibold text-white"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <select
                  aria-label="Filtrar agenda por área"
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                  className={cn(
                    "h-11 min-w-[210px] rounded-[4px] border border-[#ebebeb] bg-white px-3 text-sm text-[#222525] outline-none transition",
                    area && "border-[#0c6a83] bg-[#e0f2f6] font-semibold text-[#0c6a83]"
                  )}
                >
                  <option value="">Todas as áreas</option>
                  {areaOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Filtrar agenda por local"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className={cn(
                    "h-11 min-w-[210px] rounded-[4px] border border-[#ebebeb] bg-white px-3 text-sm text-[#222525] outline-none transition",
                    city && "border-[#0c6a83] bg-[#e0f2f6] font-semibold text-[#0c6a83]"
                  )}
                >
                  <option value="">Todos os locais</option>
                  {cityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <div className="hidden flex-1 lg:block" />

                <select
                  aria-label="Ordenar agenda"
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortMode)}
                  className="h-11 min-w-[210px] rounded-[4px] border border-[#ebebeb] bg-white px-3 text-sm text-[#222525] outline-none transition focus:border-[#1791a9]"
                >
                  <option value="data">Data · mais próxima</option>
                  <option value="preco-asc">Preço · menor primeiro</option>
                  <option value="preco-desc">Preço · maior primeiro</option>
                </select>

                <div className="flex h-11 rounded-[6px] border border-[#ebebeb] bg-white p-1">
                  {[
                    { icon: List, label: "Lista", value: "lista" },
                    { icon: CalendarDays, label: "Calendário", value: "calendario" }
                  ].map((option) => {
                    const Icon = option.icon;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setView(option.value as AgendaView)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-[4px] px-4 text-sm font-medium text-[#4f5057] transition",
                          view === option.value && "bg-[#0c6a83] text-white"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {hasActiveFilters ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-[#4f5057]">Filtrando por:</span>
                  {activeChips.map((chip) => (
                    <button
                      key={chip.key}
                      type="button"
                      onClick={chip.onRemove}
                      className="inline-flex items-center gap-2 rounded-full border border-[#ebebeb] bg-[#fafafa] px-3 py-1.5 text-sm text-[#222525] transition hover:border-[#1791a9]"
                    >
                      {chip.label}
                      <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-black/5 text-[11px]">
                        ×
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-medium text-[#0c6a83] transition hover:text-[#084f63]"
                  >
                    Limpar tudo
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 xl:px-10">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#222525]">
              <strong className="font-semibold">{loading ? "..." : filteredEntries.length}</strong> {formatResultsLabel(filteredEntries.length)}
            </p>
            <Link to="/cursos" className="text-sm font-medium text-[#0c6a83] transition hover:text-[#084f63]">
              Ver catálogo completo →
            </Link>
          </div>

          {loading ? (
            <div className="py-16 text-center text-[#4f5057]">Atualizando agenda...</div>
          ) : filteredEntries.length ? (
            view === "calendario" ? (
              <section>
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-bold capitalize text-[#222525]">
                      {format(calendarDate, "MMMM yyyy", { locale: ptBR })}
                    </h2>
                    <p className="text-xs text-[#4f5057]">{monthEntries.length} turmas</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Mês anterior"
                      onClick={() => setCalendarDate((current) => subMonths(current, 1))}
                      className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[6px] border border-[#ebebeb] text-[#4f5057] transition hover:border-[#1791a9] hover:text-[#1791a9]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarDate(startOfMonth(new Date()))}
                      className="inline-flex h-[38px] items-center rounded-[6px] border border-[#ebebeb] px-4 text-sm font-medium text-[#222525] transition hover:border-[#1791a9] hover:text-[#1791a9]"
                    >
                      Hoje
                    </button>
                    <button
                      type="button"
                      aria-label="Próximo mês"
                      onClick={() => setCalendarDate((current) => addMonths(current, 1))}
                      className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[6px] border border-[#ebebeb] text-[#4f5057] transition hover:border-[#1791a9] hover:text-[#1791a9]"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-2 grid grid-cols-7 gap-2">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((label) => (
                    <div
                      key={label}
                      className="py-2 text-center text-[11px] font-semibold uppercase tracking-[0.06em] text-[#4f5057]"
                    >
                      {label}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day) => {
                    const key = format(day, "yyyy-MM-dd");
                    const entry = firstEntryByDate.get(key);
                    const count = entryCountByDate.get(key) ?? 0;
                    const inMonth = isSameMonth(day, calendarDate);

                    return (
                      <div
                        key={key}
                        className={cn(
                          "flex min-h-[104px] flex-col gap-1 rounded-xl border p-[10px]",
                          !inMonth && "border-dashed border-[#ebebeb] bg-[#fafafa]",
                          inMonth && !entry && "border-[#ebebeb] bg-white",
                          inMonth && entry && "border-[#1791a9] bg-white shadow-[inset_0_0_0_1px_#e0f2f6]"
                        )}
                      >
                        <span className={cn("text-sm font-semibold", entry ? "text-[#0c6a83]" : "text-[#4f5057]")}>
                          {format(day, "d")}
                        </span>
                        {entry ? (
                          <>
                            <span className={cn("inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold", entry.modeClassName)}>
                              {entry.modeLabel}
                            </span>
                            <span className="line-clamp-2 text-[11.5px] font-semibold leading-[1.25] text-[#222525]">
                              {entry.course.title}
                            </span>
                            {count > 1 ? (
                              <span className="mt-auto text-[11px] text-[#4f5057]">+{count - 1} turma{count - 1 === 1 ? "" : "s"}</span>
                            ) : null}
                          </>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : (
              <div className="space-y-11">
                {months.map((month) => (
                  <section key={month.key}>
                    <div className="mb-[18px] flex items-baseline gap-3 border-b border-[#ebebeb] pb-3">
                      <h2 className="font-display text-2xl font-bold capitalize text-[#222525]">{month.label}</h2>
                      <p className="text-xs text-[#4f5057]">{month.items.length} turmas</p>
                    </div>

                    <div className="space-y-4">
                      {month.items.map((entry) => (
                        <article
                          key={entry.trainingClass.id}
                          className="grid gap-5 rounded-[24px] border border-[#ebebeb] bg-white px-6 py-5 shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_2px_16px_rgba(0,0,0,0.02),0_16px_64px_rgba(0,0,0,0.12)] md:grid-cols-[96px_minmax(0,1fr)] lg:grid-cols-[96px_minmax(0,1fr)_170px] lg:items-center lg:gap-[26px]"
                        >
                          <div className="border-b border-[#ebebeb] pb-4 text-center md:border-b-0 md:border-r md:pb-0 md:pr-5">
                            <div className="font-display text-[34px] font-bold leading-none tracking-[-0.02em] text-[#0c6a83]">
                              {entry.day}
                            </div>
                            <div className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#4f5057]">
                              {entry.monthShort}
                            </div>
                            <div className="mt-1 text-[11px] capitalize text-[#4f5057]">{entry.weekday}</div>
                          </div>

                          <div>
                            <div className="mb-[7px] flex flex-wrap items-center gap-2 text-xs text-[#4f5057]">
                              <span className={cn("inline-flex rounded-full px-2.5 py-1 font-semibold", entry.modeClassName)}>
                                {entry.modeLabel}
                              </span>
                              <span>{entry.category}</span>
                            </div>
                            <h3 className="mb-2 font-display text-[1.25rem] font-bold leading-[1.25] tracking-[-0.01em] text-[#222525]">
                              {entry.course.title}
                            </h3>
                            <div className="flex flex-wrap gap-x-5 gap-y-3 text-xs text-[#4f5057]">
                              <span className="inline-flex items-center gap-2">
                                <Clock3 className="h-4 w-4 text-[#1791a9]" />
                                {entry.trainingClass.time} · {entry.course.durationLabel}
                              </span>
                              <span className="inline-flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-[#1791a9]" />
                                {entry.place}
                              </span>
                              <span className="inline-flex items-center gap-2">
                                <UserRound className="h-4 w-4 text-[#1791a9]" />
                                {entry.instructor?.name ?? "Instrutor a definir"}
                              </span>
                            </div>
                          </div>

                          <div className="flex min-w-[150px] flex-col gap-3 lg:items-end lg:text-right">
                            <span
                              className={cn(
                                "inline-flex w-fit rounded-full px-[11px] py-1 text-[11px] font-semibold",
                                entry.spotBgClass,
                                entry.spotColorClass
                              )}
                            >
                              {entry.spotLabel}
                            </span>
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.08em] text-[#4f5057]">a partir de</p>
                              <p className="font-display text-[20px] font-bold text-[#0c6a83]">{currency(entry.price)}</p>
                            </div>
                            <Button asChild size="sm" className="min-w-[130px]">
                              <Link to={`/cursos/${entry.course.slug}?checkout=1`}>Inscrever-se →</Link>
                            </Button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )
          ) : (
            <div className="rounded-[24px] border border-[#ebebeb] bg-[#fafafa] px-8 py-14 text-center">
              <h2 className="font-display text-[2rem] font-bold text-[#222525]">Nenhuma turma nesse filtro</h2>
              <p className="mx-auto mt-3 max-w-[52ch] text-[#4f5057]">
                Ajuste a busca ou fale com um especialista para montar uma turma aderente ao calendário da sua equipe.
              </p>
              <Button asChild variant="outline" className="mt-6">
                <Link to="/falar-com-especialista">Falar com especialista →</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#eef0f2] pb-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 xl:px-10">
          <div className="rounded-[24px] border border-[#ded8c9] bg-[linear-gradient(158deg,#f4f1e9,#e9e4d8)] px-8 py-10 shadow-[0_2px_16px_rgba(0,0,0,0.02),0_16px_64px_rgba(0,0,0,0.12)] md:flex md:items-center md:justify-between md:gap-8">
            <div className="max-w-[620px]">
              <h2 className="font-display text-[2rem] font-bold leading-tight text-[#222525]">
                Nenhuma data serve para a sua equipe?
              </h2>
              <p className="mt-3 font-serif text-xl font-light leading-[1.45] text-[#4f5057]">
                Montamos uma turma fechada com o seu tema, no seu calendário e com o contexto da sua organização.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 md:mt-0">
              <Button asChild>
                <Link to="/in-company">Conhecer in-company →</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/falar-com-especialista">Solicitar proposta</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
