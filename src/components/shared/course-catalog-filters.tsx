"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type CourseCatalogFiltersProps = {
  trails: string[];
  currentTrail: string;
  formats: string[];
  currentFormat: string;
  durations: string[];
  currentDuration: string;
  audiences: string[];
  currentAudience: string;
  availabilityOptions: string[];
  currentAvailability: string;
  levels: string[];
  currentLevel: string;
  searchQuery: string;
  resultsCount: number;
};

type FilterState = {
  trilha: string;
  modalidade: string;
  duracao: string;
  publico: string;
  turma: string;
  nivel: string;
  busca: string;
};

type FilterSelectProps = {
  label: string;
  ariaLabel: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

function createFilterHref(filters: FilterState) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "Todos" && value.trim()) {
      params.set(key, value.trim());
    }
  });

  const query = params.toString();
  return query ? `/cursos?${query}` : "/cursos";
}

function FilterSelect({ label, ariaLabel, value, options, onChange }: FilterSelectProps) {
  return (
    <div className="grid gap-2">
      <Label className="text-xs font-extrabold uppercase tracking-[0.04em] text-brand-navy-800">
        {label}
      </Label>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger aria-label={ariaLabel} className="h-11 bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function CourseCatalogFilters({
  trails,
  currentTrail,
  formats,
  currentFormat,
  durations,
  currentDuration,
  audiences,
  currentAudience,
  availabilityOptions,
  currentAvailability,
  levels,
  currentLevel,
  searchQuery,
  resultsCount,
}: CourseCatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const lastSyncedQuery = useRef(searchQuery.trim());

  const activeFilters =
    currentTrail !== "Todos" ||
    currentFormat !== "Todos" ||
    currentDuration !== "Todos" ||
    currentAudience !== "Todos" ||
    currentAvailability !== "Todos" ||
    currentLevel !== "Todos" ||
    searchQuery.trim().length > 0;
  const resultLabel = resultsCount === 1 ? "curso encontrado" : "cursos encontrados";
  const normalizedDebouncedQuery = debouncedQuery.trim();
  const currentFilters = useMemo<FilterState>(
    () => ({
      trilha: currentTrail,
      modalidade: currentFormat,
      duracao: currentDuration,
      publico: currentAudience,
      turma: currentAvailability,
      nivel: currentLevel,
      busca: normalizedDebouncedQuery,
    }),
    [
      currentAudience,
      currentAvailability,
      currentDuration,
      currentFormat,
      currentLevel,
      currentTrail,
      normalizedDebouncedQuery,
    ],
  );

  const trailLinks = useMemo(
    () =>
      trails.map((trail) => ({
        trail,
        href: createFilterHref({ ...currentFilters, trilha: trail }),
        active: trail === currentTrail,
      })),
    [currentFilters, currentTrail, trails],
  );
  const filterBadges = [
    currentTrail !== "Todos"
      ? { key: "trilha" as const, label: "Trilha", value: currentTrail }
      : null,
    searchQuery ? { key: "busca" as const, label: "Busca", value: searchQuery } : null,
    currentFormat !== "Todos"
      ? { key: "modalidade" as const, label: "Modalidade", value: currentFormat }
      : null,
    currentDuration !== "Todos"
      ? { key: "duracao" as const, label: "Carga horária", value: currentDuration }
      : null,
    currentAudience !== "Todos"
      ? { key: "publico" as const, label: "Público", value: currentAudience }
      : null,
    currentAvailability !== "Todos"
      ? { key: "turma" as const, label: "Turma", value: currentAvailability }
      : null,
    currentLevel !== "Todos"
      ? { key: "nivel" as const, label: "Nível", value: currentLevel }
      : null,
  ].filter(
    (filter): filter is { key: keyof FilterState; label: string; value: string } =>
      Boolean(filter),
  );

  function updateFilter(key: keyof FilterState, value: string) {
    router.replace(createFilterHref({ ...currentFilters, [key]: value }), {
      scroll: false,
    });
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query), 350);
    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (normalizedDebouncedQuery === lastSyncedQuery.current) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (normalizedDebouncedQuery) {
      params.set("busca", normalizedDebouncedQuery);
    } else {
      params.delete("busca");
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    lastSyncedQuery.current = normalizedDebouncedQuery;
    router.replace(nextUrl, { scroll: false });
  }, [normalizedDebouncedQuery, pathname, router, searchParams]);

  return (
    <Card className="relative overflow-hidden rounded-xl shadow-md">
      <CardContent className="space-y-6 p-6 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-start">
          <div className="max-w-xl space-y-3">
            <Badge variant="gold">Busca inteligente</Badge>
            <h2 className="font-heading text-2xl font-bold leading-tight text-foreground md:text-3xl">
              Encontre a trilha certa com menos atrito
            </h2>
            <p className="leading-7 text-muted-foreground">
              Filtre por área de conhecimento ou busque por tema, formato, carga horária e objetivo do curso.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Badge variant="secondary">
              {resultsCount} {resultLabel}
            </Badge>
            {filterBadges.map((filter) => (
              <Badge key={filter.key} variant={filter.key === "trilha" ? "gold" : "outline"}>
                <Link
                  aria-label={`Remover filtro ${filter.label}`}
                  href={createFilterHref({ ...currentFilters, [filter.key]: "Todos" })}
                >
                  {filter.label}: {filter.value}
                </Link>
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="flex flex-wrap gap-2">
            {trailLinks.map(({ trail, href, active }) => (
              <Button
                asChild
                className={cn("rounded-full", !active && "text-foreground")}
                key={trail}
                size="sm"
                variant={active ? "default" : "secondary"}
              >
                <Link href={href}>{trail}</Link>
              </Button>
            ))}
          </div>

          {activeFilters ? (
            <Button asChild className="w-full lg:w-auto" variant="ghost">
              <Link href="/cursos">Limpar filtros</Link>
            </Button>
          ) : null}
        </div>

        <div className="relative">
          <Search aria-hidden className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Buscar curso pelo nome"
            className="h-12 pl-10 text-base"
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Buscar por curso, tema ou formato"
            value={query}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <FilterSelect
            ariaLabel="Filtrar por modalidade"
            label="Modalidade"
            onChange={(value) => updateFilter("modalidade", value)}
            options={formats}
            value={currentFormat}
          />
          <FilterSelect
            ariaLabel="Filtrar por carga horária"
            label="Carga horária"
            onChange={(value) => updateFilter("duracao", value)}
            options={durations}
            value={currentDuration}
          />
          <FilterSelect
            ariaLabel="Filtrar por público-alvo"
            label="Público-alvo"
            onChange={(value) => updateFilter("publico", value)}
            options={audiences}
            value={currentAudience}
          />
          <FilterSelect
            ariaLabel="Filtrar por próxima turma"
            label="Próxima turma"
            onChange={(value) => updateFilter("turma", value)}
            options={availabilityOptions}
            value={currentAvailability}
          />
          <FilterSelect
            ariaLabel="Filtrar por nível"
            label="Nível"
            onChange={(value) => updateFilter("nivel", value)}
            options={levels}
            value={currentLevel}
          />
        </div>
      </CardContent>
    </Card>
  );
}
