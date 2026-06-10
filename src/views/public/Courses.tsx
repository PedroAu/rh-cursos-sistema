import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpenCheck,
  CheckCircle2,
  GraduationCap,
  Search,
  SlidersHorizontal,
  Target,
  X
} from "lucide-react";
import { useSearchParams } from "@/lib/router-compat";

import { EmptyState } from "@/components/common/empty-state";
import { LoadingBlocks } from "@/components/common/loading-blocks";
import { SearchInput } from "@/components/common/search-input";
import { CourseCard } from "@/components/courses/course-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/lib/app-store";
import { useHotkey } from "@/hooks/use-hotkey";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";

export function CoursesPage() {
  const { courses, classes, trainingPaths } = useAppStore();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const searchRef = useRef<HTMLInputElement>(null);

  const filters = {
    path: params.get("path") ?? "",
    modality: params.get("modality") ?? "",
    duration: params.get("duration") ?? "",
    level: params.get("level") ?? ""
  };

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value.startsWith("all-")) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setParams(next);
  };

  const setSearch = (value: string) => {
    setQuery(value);
    const next = new URLSearchParams(params);
    if (value.trim()) {
      next.set("q", value);
    } else {
      next.delete("q");
    }
    setParams(next);
  };

  useEffect(() => {
    setQuery(params.get("q") ?? "");
  }, [params]);

  const clearFilters = () => {
    setQuery("");
    setParams({});
  };

  useHotkey(
    (event) => event.key === "/" && !["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName),
    (event) => {
      event.preventDefault();
      searchRef.current?.focus();
    }
  );

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();

    return courses.filter((course) => {
      const durationMatch =
        !filters.duration ||
        (filters.duration === "Até 8h" && course.durationHours <= 8) ||
        (filters.duration === "De 9h a 16h" && course.durationHours >= 9 && course.durationHours <= 16) ||
        (filters.duration === "De 17h a 24h" && course.durationHours >= 17 && course.durationHours <= 24) ||
        (filters.duration === "Mais de 24h" && course.durationHours > 24);

      return (
        (!normalized ||
          [course.title, course.pathName, course.shortDescription].join(" ").toLowerCase().includes(normalized)) &&
        (!filters.path || course.pathId === filters.path) &&
        (!filters.modality || course.modality === filters.modality) &&
        (!filters.level || course.level === filters.level || course.level.includes(filters.level)) &&
        durationMatch
      );
    });
  }, [courses, filters.duration, filters.level, filters.modality, filters.path, query]);

  const loading = useSimulatedLoading([query, filters.path, filters.modality, filters.duration, filters.level]);
  const activeFiltersCount = [query, filters.path, filters.modality, filters.duration, filters.level].filter(Boolean).length;
  const featuredCoursesCount = courses.filter((course) => course.featured).length;
  const activePathName = trainingPaths.find((path) => path.id === filters.path)?.shortName;
  const upcomingClassesCount = classes.filter((item) => item.status === "Inscrições abertas" || item.status === "Poucas vagas").length;
  const activeFilterLabels = [
    query ? `Busca: ${query}` : null,
    activePathName ? `Trilha: ${activePathName}` : null,
    filters.modality ? `Modalidade: ${filters.modality}` : null,
    filters.duration ? `Carga: ${filters.duration}` : null,
    filters.level ? `Nível: ${filters.level}` : null,
  ].filter(Boolean) as string[];

  return (
    <>
    <section className="bg-deep-navy px-4 py-12 text-white sm:px-6 sm:py-14">
      <div className="ea-container overflow-hidden rounded-xl bg-deep-navy px-6 py-12 text-white shadow-card sm:px-10 sm:py-14">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-prestige-gold/45 bg-prestige-gold/15 px-4 py-2 text-label font-bold uppercase tracking-[0.08em] text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-prestige-gold" />
            Programas profissionais
          </span>
          <h1 className="mt-6 max-w-4xl font-display text-h1-alt font-extrabold text-white sm:text-hero">
            Encontre a formação certa para sua equipe evoluir com segurança.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">
            Filtre cursos por trilha, modalidade, carga horária e nível. O catálogo reúne
            capacitações práticas para rotinas públicas, gestão, tecnologia e comunicação.
          </p>
          <div className="mt-8">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="gap-2 px-8"
              onClick={() => {
                searchRef.current?.focus();
                searchRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
              }}
            >
              <Search className="h-4 w-4" />
              Explorar cursos
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-12 grid w-full max-w-4xl gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-3">
          {[
            { label: "Trilhas especializadas", value: trainingPaths.length, icon: Target },
            { label: "Cursos no catálogo", value: courses.length, icon: BookOpenCheck },
            { label: "Programas em destaque", value: featuredCoursesCount, icon: GraduationCap }
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-center justify-center bg-white/10 px-5 py-5"
              >
                <div className="flex items-center gap-3 text-left">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-prestige-gold/15 text-prestige-gold">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <strong className="block font-display text-3xl leading-none text-white">{item.value}</strong>
                    <span className="mt-1 block text-sm font-medium text-white/85">{item.label}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>

    <section className="bg-surface-muted">
      <div className="ea-container py-10">
        <div className="grid gap-8 lg:grid-cols-[340px_1fr] lg:items-start">
          <aside className="surface-card p-6 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
            <div className="mb-6 flex items-center justify-between gap-4 border-b border-outline-variant pb-5">
              <span className="eyebrow">Filtros</span>
              <div className="flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2 text-label font-bold text-deep-navy">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                {filtered.length}/{courses.length}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <span className="ea-label mb-3 flex items-center gap-2">
                  <Search className="h-3.5 w-3.5" />
                  Busca
                </span>
                <SearchInput
                  ref={searchRef}
                  value={query}
                  onChange={(event) => setSearch(event.target.value)}
                  onClear={() => setSearch("")}
                  clearLabel="Limpar busca do catálogo"
                  placeholder="Buscar cursos, temas ou trilhas"
                  resultsLabel={
                    query
                      ? `${filtered.length} resultado${filtered.length === 1 ? "" : "s"} para “${query}”.`
                      : "Digite um termo para filtrar o catálogo por curso, tema ou trilha."
                  }
                  loading={loading}
                />
              </div>

              <div>
                <span className="ea-label mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Trilhas
                </span>
                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => setFilter("path", "")}
                    className={`w-full rounded-lg border px-3 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-prestige-gold hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${!filters.path ? "border-deep-navy bg-deep-navy text-white" : "border-outline-variant bg-surface-muted text-text-main"}`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className={`text-label font-bold uppercase tracking-[0.05em] ${!filters.path ? "text-white/75" : "text-text-muted"}`}>Todas</span>
                      <span className="rounded bg-surface-muted px-2 py-1 text-label font-bold text-deep-navy">{courses.length}</span>
                    </span>
                    <span className="mt-1 block text-sm font-bold leading-tight">Todas as trilhas</span>
                  </button>
                  {trainingPaths.map((path) => (
                    <button
                      key={path.id}
                      type="button"
                      onClick={() => setFilter("path", path.id)}
                      className={`w-full rounded-lg border px-3 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-prestige-gold hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${filters.path === path.id ? "border-deep-navy bg-deep-navy text-white" : "border-outline-variant bg-surface-muted text-text-main"}`}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className={`text-label font-bold uppercase tracking-[0.05em] ${filters.path === path.id ? "text-white/75" : "text-text-muted"}`}>Trilha</span>
                        <span className={`rounded px-2 py-1 text-label font-bold ${filters.path === path.id ? "bg-white/12 text-white" : "bg-surface-muted text-deep-navy"}`}>
                          {path.courseCount}
                        </span>
                      </span>
                      <span className="mt-1 block text-sm font-bold leading-tight">{path.shortName}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="ea-label mb-3 block">Modalidade</span>
                <Select value={filters.modality || "all-modalities"} onValueChange={(value) => setFilter("modality", value)}>
                  <SelectTrigger><SelectValue placeholder="Modalidade" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-modalities">Todas</SelectItem>
                    {["Ao vivo online", "Presencial", "In company", "Híbrido", "Gravado"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <span className="ea-label mb-3 block">Carga horária</span>
                <Select value={filters.duration || "all-durations"} onValueChange={(value) => setFilter("duration", value)}>
                  <SelectTrigger><SelectValue placeholder="Carga horária" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-durations">Qualquer carga</SelectItem>
                    {["Até 8h", "De 9h a 16h", "De 17h a 24h", "Mais de 24h"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <span className="ea-label mb-3 block">Nível</span>
                <Select value={filters.level || "all-levels"} onValueChange={(value) => setFilter("level", value)}>
                  <SelectTrigger><SelectValue placeholder="Nível" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-levels">Todos</SelectItem>
                    {["Básico", "Intermediário", "Avançado"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                disabled={!activeFiltersCount}
                onClick={clearFilters}
              >
                <X className="h-4 w-4" />
                Limpar filtros
              </Button>
            </div>
          </aside>

          <div className="space-y-5">
            <div className="surface-card overflow-hidden">
              <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div aria-live="polite">
                  <span className="ea-label">Cursos disponíveis</span>
                  <h2 className="mt-2 flex items-baseline gap-2 font-display font-bold text-deep-navy">
                    <span className="text-4xl leading-none">{filtered.length}</span>
                    <span className="text-xl">
                      resultado{filtered.length === 1 ? "" : "s"} encontrado{filtered.length === 1 ? "" : "s"}
                    </span>
                  </h2>
                </div>
                <div className="rounded-lg border border-outline-variant bg-surface-muted px-4 py-3 text-sm font-semibold text-deep-navy">
                  {activePathName ? `Trilha: ${activePathName}` : "Todas as trilhas"}
                </div>
              </div>

              <div className="grid gap-px border-t border-outline-variant bg-outline-variant md:grid-cols-3">
                {[
                  { label: "Turmas abertas", value: upcomingClassesCount },
                  { label: "Programas em destaque", value: featuredCoursesCount },
                  { label: "Filtros ativos", value: activeFiltersCount },
                ].map((item) => (
                  <div key={item.label} className="bg-surface-raised px-6 py-4">
                    <p className="text-label font-bold uppercase tracking-[0.08em] text-label-secondary">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>

              {activeFilterLabels.length > 0 ? (
                <div className="flex flex-wrap gap-2 border-t border-outline-variant px-6 py-4">
                  {activeFilterLabels.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-outline-variant bg-surface-muted px-3 py-1.5 text-label font-bold text-deep-navy"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {loading ? (
              <LoadingBlocks count={6} summary="Atualizando cursos do catálogo..." />
            ) : filtered.length ? (
              <div className="grid items-stretch gap-6 lg:grid-cols-2">
                {filtered.map((course) => (
                  <CourseCard key={course.id} course={course} nextClass={classes.find((item) => item.id === course.nextClassId)} compact />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nenhum curso encontrado."
                description="Tente ampliar sua busca, mudar a trilha ou falar com o atendimento para encontrar a capacitação ideal."
                actionLabel="Limpar filtros"
                onAction={clearFilters}
              />
            )}
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
