"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Building2, CalendarDays, Clock3, Search } from "lucide-react";

import { useQuoteModal } from "@/components/in-company/quote-modal";
import { Button } from "@/components/ui/button";
import { useHotkey } from "@/hooks/use-hotkey";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useAppStore } from "@/lib/app-store";
import { Link, useSearchParams } from "@/lib/router-compat";
import { cn, currency } from "@/lib/utils";
import type { Course, TrainingClass } from "@/types";

type CatalogEntry = {
  category: string;
  course: Course;
  gradient: string;
  price: number;
  spotColorClass: string;
  spotLabel: string;
  trainingClass: TrainingClass;
};

const CATEGORY_GRADIENTS = [
  "linear-gradient(135deg,#235875,#2f7599)",
  "linear-gradient(135deg,#5b8def,#70a4ff)",
  "linear-gradient(135deg,#1b8b69,#27a57d)",
  "linear-gradient(135deg,#6d4fd5,#8b68f0)",
  "linear-gradient(135deg,#a86d18,#e0a342)",
  "linear-gradient(135deg,#1d7f8f,#16967f)"
] as const;

const CATEGORY_ORDER = [
  "Licitações e Contratos",
  "LGPD e Privacidade",
  "Gestão Pública",
  "Compliance"
] as const;

const CATEGORY_ALIASES: Record<string, string> = {
  "DP, Folha & eSocial": "Departamento Pessoal",
  Comunicação: "Comunicação",
  Compliance: "Compliance",
  "Departamento Pessoal": "Departamento Pessoal",
  "Gestão de Pessoas": "Gestão de Pessoas",
  "Gestão Pública": "Gestão Pública",
  Liderança: "Liderança",
  "LGPD e Privacidade": "LGPD e Privacidade",
  "Licitações e Contratos": "Licitações e Contratos",
  Tecnologia: "Tecnologia",
  eSocial: "eSocial"
};

function normalizeCategory(course: Course) {
  const source = course.category ?? course.pathName;
  return CATEGORY_ALIASES[source] ?? source;
}

function createCategoryGradient(category: string) {
  const hash = Array.from(category).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return CATEGORY_GRADIENTS[hash % CATEGORY_GRADIENTS.length];
}

function createSpotMeta(trainingClass: TrainingClass) {
  if (trainingClass.status === "Poucas vagas") {
    return { label: "Poucas vagas", colorClass: "text-[#c0293b]" };
  }

  if (trainingClass.status === "Em breve") {
    return { label: "Turma nova", colorClass: "text-[#2459b3]" };
  }

  return { label: "Inscrições abertas", colorClass: "text-[#0f6f5f]" };
}

function formatCatalogDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value)).replace(".", "");
}

function buildCatalogEntries(courses: Course[], classes: TrainingClass[]) {
  const coursesById = new Map(courses.map((course) => [course.id, course]));

  return classes
    .filter((trainingClass) => {
      const course = coursesById.get(trainingClass.courseId);
      return course && trainingClass.status !== "Encerrada";
    })
    .map((trainingClass) => {
      const course = coursesById.get(trainingClass.courseId)!;
      const category = normalizeCategory(course);
      const spot = createSpotMeta(trainingClass);

      return {
        category,
        course,
        gradient: createCategoryGradient(category),
        price: trainingClass.price || course.price,
        spotColorClass: spot.colorClass,
        spotLabel: spot.label,
        trainingClass
      } satisfies CatalogEntry;
    })
    .sort((left, right) => left.trainingClass.startDate.localeCompare(right.trainingClass.startDate));
}

export function CoursesPage() {
  const { courses, classes } = useAppStore();
  const { openQuote } = useQuoteModal();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const searchRef = useRef<HTMLInputElement>(null);

  const activeCategory = params.get("category") ?? "";

  useEffect(() => {
    setQuery(params.get("q") ?? "");
  }, [params]);

  useHotkey(
    (event) => event.key === "/" && !["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName),
    (event) => {
      event.preventDefault();
      searchRef.current?.focus();
    }
  );

  const catalogEntries = useMemo(() => buildCatalogEntries(courses, classes), [classes, courses]);
  const categories = useMemo(
    () =>
      [...new Set(catalogEntries.map((entry) => entry.category))].sort((left, right) => {
        const leftIndex = CATEGORY_ORDER.indexOf(left as (typeof CATEGORY_ORDER)[number]);
        const rightIndex = CATEGORY_ORDER.indexOf(right as (typeof CATEGORY_ORDER)[number]);

        if (leftIndex !== -1 || rightIndex !== -1) {
          return (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex) - (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex);
        }

        return left.localeCompare(right);
      }),
    [catalogEntries]
  );

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return catalogEntries.filter((entry) => {
      const matchesQuery =
        !normalizedQuery ||
        [entry.course.title, entry.category, entry.course.pathName, entry.course.shortDescription]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesCategory = !activeCategory || entry.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [activeCategory, catalogEntries, query]);

  const loading = useSimulatedLoading([query, activeCategory]);

  const syncParams = (nextQuery: string, nextCategory: string) => {
    const next = new URLSearchParams();

    if (nextQuery.trim()) {
      next.set("q", nextQuery.trim());
    }

    if (nextCategory) {
      next.set("category", nextCategory);
    }

    setParams(next);
  };

  const clearFilters = () => {
    setQuery("");
    setParams({});
  };

  return (
    <div className="bg-[#eef0f2]">
      <section className="border-b border-[#ded8c9] bg-[radial-gradient(circle_at_50%_-10%,#f7f9fc_30%,#ebf3ff_130%)] py-16">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6 xl:px-10">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full bg-[#dff3fb] px-4 py-2 text-sm font-semibold text-[#0c6a83]">
                <span className="mr-2 h-2 w-2 rounded-full bg-[#1791a9]" />
                Cursos abertos · Agenda 2026
              </div>
              <h1 className="max-w-[20ch] font-display text-[2.75rem] font-bold leading-[1.08] tracking-[-0.02em] text-[#252b31]">
                Cursos para aplicar a norma <em className="italic text-[#0c6a83]">na prática</em>
              </h1>
              <p className="max-w-[58ch] font-serif text-[1.35rem] font-light leading-[1.45] text-[#5f6b72]">
                Turmas presenciais e online ao vivo, com certificação e conteúdo atualizado às exigências legais e regulatórias
                {" "}
                para profissionais de organizações públicas e privadas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4" data-testid="ui-courses-filters">
              <div role="search" className="relative w-full max-w-[360px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7f8c94]" />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setQuery(nextValue);
                    syncParams(nextValue, activeCategory);
                  }}
                  aria-label="Buscar no catálogo"
                  placeholder="Buscar por tema, área ou palavra-chave"
                  className="h-12 w-full rounded-md border border-[#ded8c9] bg-white px-11 pr-12 text-sm text-[#252b31] shadow-sm outline-none transition focus:border-[#1791a9] focus:ring-4 focus:ring-[#e0f2f6]"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    aria-label="Limpar busca do catálogo"
                    className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#7f8c94] transition hover:bg-[#f4f1e9] hover:text-[#252b31]"
                  >
                    ×
                  </button>
                ) : null}
              </div>
              <p className="text-sm text-[#4c5560]">
                <strong className="font-semibold text-[#252b31]">{catalogEntries.length}</strong>
                {" "}
                turmas na agenda
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6 xl:px-10">
          <div className="mb-8 flex flex-wrap gap-[9px]">
            <button
              type="button"
              onClick={() => syncParams(query, "")}
              className={cn(
                "rounded-full border px-4 py-[9px] text-sm font-medium transition",
                !activeCategory
                  ? "border-[#0c6a83] bg-[#0c6a83] text-white"
                  : "border-[#ded8c9] bg-white text-[#252b31] hover:border-[#1791a9]"
              )}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => syncParams(query, category)}
                className={cn(
                  "rounded-full border px-4 py-[9px] text-sm font-medium transition",
                  activeCategory === category
                    ? "border-[#0c6a83] bg-[#0c6a83] text-white"
                    : "border-[#ded8c9] bg-white text-[#252b31] hover:border-[#1791a9]"
                )}
              >
                {category}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-16 text-center text-[#5f6b72]">Atualizando catálogo...</div>
          ) : filteredEntries.length ? (
            <div className="grid gap-[22px] md:grid-cols-2 xl:grid-cols-3">
              {filteredEntries.map((entry) => (
                <CatalogSessionCard key={entry.trainingClass.id} entry={entry} onOpenQuote={openQuote} />
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-[#ded8c9] bg-white px-8 py-16 text-center shadow-[0_26px_60px_-34px_rgba(25,40,58,0.28)]">
              <h2 className="font-display text-2xl font-bold text-[#252b31]">Nenhuma turma encontrada</h2>
              <p className="mx-auto mt-3 max-w-[44ch] font-serif text-lg font-light leading-8 text-[#5f6b72]">
                Ajuste a busca ou fale com um especialista para uma turma sob medida.
              </p>
              <Button asChild variant="outline" className="mt-6">
                <Link to="/falar-com-especialista">Falar com especialista</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-[#ded8c9] bg-[#f4f1e9] py-14">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-10 px-4 sm:px-6 xl:px-10">
          <div className="max-w-[50ch]">
            <div className="inline-flex rounded-full bg-[#0c6a83] px-4 py-2 text-sm font-semibold text-white">Para equipes</div>
            <h2 className="mt-4 max-w-[18ch] font-display text-[2rem] font-bold leading-[1.15] tracking-[-0.02em] text-[#252b31]">
              Não achou a turma ideal para o seu time?
            </h2>
            <p className="mt-3 font-serif text-[1.3rem] font-light leading-[1.45] text-[#5f6b72]">
              Levamos qualquer tema para dentro da sua organização, com o seu contexto e o seu calendário.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/in-company">Conhecer in-company</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/in-company#quote-form">Solicitar proposta</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function CatalogSessionCard({
  entry,
  onOpenQuote
}: {
  entry: CatalogEntry;
  onOpenQuote: (course: Course) => void;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-[24px] border border-[#ded8c9] bg-white shadow-[0_26px_60px_-34px_rgba(25,40,58,0.28)] transition duration-300 hover:-translate-y-[3px]">
      <div className="flex h-28 items-start justify-between p-[16px_18px]" style={{ background: entry.gradient }}>
        <span className="rounded-full bg-[rgba(0,0,0,0.22)] px-[10px] py-[5px] text-[11px] font-semibold uppercase tracking-[0.04em] text-white">
          {entry.category}
        </span>
        <span className={cn("rounded-full bg-white px-[10px] py-[5px] text-[11px] font-semibold", entry.spotColorClass)}>
          {entry.spotLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-[14px] p-[20px_22px_24px]">
        <h3 className="font-display text-[1.25rem] font-bold leading-[1.25] tracking-[-0.01em] text-[#252b31]">
          {entry.course.title}
        </h3>

        <div className="space-y-2 text-[0.82rem] text-[#5f6b72]">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-[15px] w-[15px]" />
            <span>{formatCatalogDate(entry.trainingClass.startDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="h-[15px] w-[15px]" />
            <span>{entry.trainingClass.modality} · {entry.course.durationLabel}</span>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-[#ece6d8] pt-[14px]">
          <div>
            <div className="text-[0.82rem] text-[#5f6b72]">a partir de</div>
            <div className="font-display text-xl font-bold text-[#0c6a83]">{currency(entry.price)}</div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Link
              to={`/cursos/${entry.course.slug}`}
              className="text-sm font-semibold text-[#0c6a83] transition hover:text-[#084f63]"
            >
              Ver turma →
            </Link>
            <button
              type="button"
              onClick={() => onOpenQuote(entry.course)}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#6b4f00] transition hover:text-[#4e3900]"
            >
              <Building2 className="h-3.5 w-3.5" />
              Orçamento In Company
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
