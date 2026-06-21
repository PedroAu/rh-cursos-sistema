import Link from "next/link";
import { Search, X } from "lucide-react";

import { SelectField } from "@/components/forms/field/select-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FilterOption = {
  value: string;
  label: string;
};

type SelectFilter = {
  name: string;
  label: string;
  options: FilterOption[];
  value?: string;
};

type DateFilter = {
  name: string;
  label: string;
  value?: string;
};

type AdminListFiltersProps = {
  resetHref: string;
  searchPlaceholder: string;
  statusOptions?: FilterOption[];
  formatOptions?: FilterOption[];
  roleOptions?: FilterOption[];
  typeOptions?: FilterOption[];
  selectFilters?: SelectFilter[];
  dateFilters?: DateFilter[];
  values?: {
    query?: string;
    [key: string]: string | undefined;
  };
};

function isActiveFilter(value: string | undefined) {
  return Boolean(value && value !== "todos" && value !== "Todos");
}

function getFilterLabel(options: FilterOption[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function buildHref(resetHref: string, values: Record<string, string | undefined>, removeKey: string) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    if (key !== removeKey && isActiveFilter(value)) {
      params.set(key, value ?? "");
    }
  }

  const query = params.toString();
  return query ? `${resetHref}?${query}` : resetHref;
}

export function AdminListFilters({
  resetHref,
  searchPlaceholder,
  statusOptions = [],
  formatOptions = [],
  roleOptions = [],
  typeOptions = [],
  selectFilters = [],
  dateFilters = [],
  values,
}: AdminListFiltersProps) {
  const normalizedValues = values ?? {};
  const legacySelectFilters: SelectFilter[] = [];

  if (statusOptions.length > 0) {
    legacySelectFilters.push({ label: "Status", name: "status", options: statusOptions, value: normalizedValues.status });
  }

  if (formatOptions.length > 0) {
    legacySelectFilters.push({ label: "Formato", name: "format", options: formatOptions, value: normalizedValues.format });
  }

  if (roleOptions.length > 0) {
    legacySelectFilters.push({ label: "Tipo", name: "role", options: roleOptions, value: normalizedValues.role });
  }

  if (typeOptions.length > 0) {
    legacySelectFilters.push({ label: "Tipo", name: "type", options: typeOptions, value: normalizedValues.type });
  }
  const allSelectFilters = [...legacySelectFilters, ...selectFilters];
  const activeFilters = [
    isActiveFilter(normalizedValues.query)
      ? { key: "query", label: "Busca", value: normalizedValues.query ?? "" }
      : null,
    ...allSelectFilters.map((filter) =>
      isActiveFilter(normalizedValues[filter.name] ?? filter.value)
        ? {
            key: filter.name,
            label: filter.label,
            value: getFilterLabel(filter.options, normalizedValues[filter.name] ?? filter.value ?? ""),
          }
        : null,
    ),
    ...dateFilters.map((filter) =>
      isActiveFilter(normalizedValues[filter.name] ?? filter.value)
        ? {
            key: filter.name,
            label: filter.label,
            value: normalizedValues[filter.name] ?? filter.value ?? "",
          }
        : null,
    ),
  ].filter((filter): filter is { key: string; label: string; value: string } => Boolean(filter));
  const formId = `admin-filter-${resetHref.replace(/[^a-z0-9]/gi, "-")}`;

  return (
    <Card className="bg-muted/35">
      <CardContent className="space-y-4 p-4">
        <form method="get">
          <div className="grid items-end gap-4 md:grid-cols-2 xl:grid-cols-12">
            <div className="space-y-2 xl:col-span-4">
              <Label htmlFor={`${formId}-query`}>Busca</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  className="pl-9"
                  defaultValue={normalizedValues.query ?? ""}
                  id={`${formId}-query`}
                  name="query"
                  placeholder={searchPlaceholder}
                />
              </div>
            </div>

            {allSelectFilters.map((filter) => (
              <SelectField
                className="xl:col-span-2"
                defaultValue={normalizedValues[filter.name] ?? filter.value ?? "todos"}
                id={`${formId}-${filter.name}`}
                key={filter.name}
                label={filter.label}
                name={filter.name}
                options={filter.options}
              />
            ))}

            {dateFilters.map((filter) => (
              <div className="space-y-2 xl:col-span-2" key={filter.name}>
                <Label htmlFor={`${formId}-${filter.name}`}>{filter.label}</Label>
                <Input
                  defaultValue={normalizedValues[filter.name] ?? filter.value ?? ""}
                  id={`${formId}-${filter.name}`}
                  name={filter.name}
                  type="date"
                />
              </div>
            ))}

            <div className="flex flex-col gap-2 sm:flex-row xl:col-span-3">
              <Button className="w-full sm:w-auto" type="submit">
                Aplicar filtros
              </Button>
              <Button asChild className="w-full sm:w-auto" type="button" variant="outline">
                <Link href={resetHref}>
                  <X className="size-4" aria-hidden="true" />
                  Limpar
                </Link>
              </Button>
            </div>
          </div>
        </form>
        {activeFilters.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2" aria-label="Filtros ativos">
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Filtros ativos
            </span>
            {activeFilters.map((filter) => (
              <Badge className="gap-2 pr-1" key={filter.key} variant="secondary">
                {filter.label}: {filter.value}
                <Button
                  asChild
                  aria-label={`Remover filtro ${filter.label}`}
                  className="size-5 rounded-full p-0"
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <Link href={buildHref(resetHref, normalizedValues, filter.key)}>
                    <X className="size-3" aria-hidden="true" />
                  </Link>
                </Button>
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
