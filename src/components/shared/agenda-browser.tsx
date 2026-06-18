"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import {
  BellRing,
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  List,
  MapPin,
  Search,
  Ticket,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AgendaItem } from "@/lib/public-data";
import { cn } from "@/lib/utils";

type AgendaView = "calendario" | "lista";

type AgendaBrowserProps = {
  items: AgendaItem[];
  initialSearch?: string;
  initialStatus?: string;
  initialFormat?: string;
  initialLocation?: string;
  initialMonth?: string;
  initialView?: AgendaView;
};

function normalizeSearchValue(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function getSearchableAgendaText(item: AgendaItem) {
  return [item.courseTitle, item.format, item.location, item.status, item.startDate, item.endDate, item.schedule].join(" ");
}

function formatDate(value: string) {
  return dayjs(value).locale("pt-br").format("DD [de] MMMM [de] YYYY");
}

function createUrl(
  pathname: string,
  search: string,
  status: string,
  format: string,
  location: string,
  month: string,
  view: AgendaView,
) {
  const params = new URLSearchParams();

  if (search.trim()) params.set("busca", search.trim());
  if (status !== "Todos") params.set("status", status);
  if (format !== "Todos") params.set("modalidade", format);
  if (location !== "Todos") params.set("local", location);
  if (month !== "Todos") params.set("mes", month);
  if (view !== "calendario") params.set("visualizacao", view);

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function getMonthDays(date: Date) {
  const start = dayjs(date).startOf("month");
  const gridStart = start.subtract(start.day(), "day");
  return Array.from({ length: 42 }, (_, index) => gridStart.add(index, "day"));
}

function AgendaFilters({
  search,
  status,
  format,
  location,
  month,
  view,
  statuses,
  formats,
  locations,
  months,
  activeFilters,
  onSearchChange,
  onStatusChange,
  onFormatChange,
  onLocationChange,
  onMonthChange,
  onViewChange,
}: {
  search: string;
  status: string;
  format: string;
  location: string;
  month: string;
  view: AgendaView;
  statuses: string[];
  formats: string[];
  locations: string[];
  months: string[];
  activeFilters: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onFormatChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onViewChange: (value: AgendaView) => void;
}) {
  const activeBadges = [
    status !== "Todos" ? `Status: ${status}` : null,
    format !== "Todos" ? `Modalidade: ${format}` : null,
    location !== "Todos" ? `Local: ${location}` : null,
    month !== "Todos" ? `Mês: ${dayjs(`${month}-01`).locale("pt-br").format("MMM YYYY")}` : null,
    search.trim() ? `Busca: ${search.trim()}` : null,
  ].filter(Boolean);

  return (
    <Card>
      <CardContent className="space-y-8 p-6 xl:p-8">
        <div className="max-w-3xl space-y-2">
          <Badge className="w-fit bg-brand-gold text-brand-navy-900" variant="gold">
            Consulta de turmas
          </Badge>
          <h2 className="font-heading text-2xl font-bold text-foreground">Encontre a próxima data ideal</h2>
          <p className="text-sm text-muted-foreground">
            Escolha a melhor data, veja disponibilidade e acesse rapidamente a página do curso.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="agenda-search">Busca</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              aria-label="Buscar turma"
              className="h-12 bg-muted/40 pl-10 text-sm font-medium"
              id="agenda-search"
              onChange={(event) => onSearchChange(event.currentTarget.value)}
              placeholder="Curso, local, formato, status, horário ou data"
              value={search}
            />
          </div>
        </div>

        <div className="grid items-end gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="agenda-status">Status</Label>
            <Select onValueChange={onStatusChange} value={status}>
              <SelectTrigger aria-label="Filtrar por status" className="h-12 bg-muted/40" id="agenda-status" value={status}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
              {statuses.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agenda-format">Modalidade</Label>
            <Select onValueChange={onFormatChange} value={format}>
              <SelectTrigger aria-label="Filtrar por modalidade" className="h-12 bg-muted/40" id="agenda-format" value={format}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formats.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agenda-location">Local</Label>
            <Select onValueChange={onLocationChange} value={location}>
              <SelectTrigger aria-label="Filtrar por local" className="h-12 bg-muted/40" id="agenda-location" value={location}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locations.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agenda-month">Mês</Label>
            <Select onValueChange={onMonthChange} value={month}>
              <SelectTrigger aria-label="Filtrar por mês" className="h-12 bg-muted/40" id="agenda-month" value={month}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item === "Todos" ? "Todos" : dayjs(`${item}-01`).locale("pt-br").format("MMMM YYYY")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Visualização</Label>
            <div className="grid grid-cols-2 rounded-md border bg-muted/40 p-1">
              <Button aria-pressed={view === "calendario"} onClick={() => onViewChange("calendario")} type="button" variant={view === "calendario" ? "default" : "ghost"}>
                <CalendarDays className="size-4" aria-hidden="true" />
                Calendário
              </Button>
              <Button aria-pressed={view === "lista"} onClick={() => onViewChange("lista")} type="button" variant={view === "lista" ? "default" : "ghost"}>
                <List className="size-4" aria-hidden="true" />
                Lista
              </Button>
            </div>
          </div>

          <Button asChild className="w-full" disabled={!activeFilters && view === "calendario"} variant="ghost">
            <a href="/agenda">Limpar filtros</a>
          </Button>
        </div>

        {activeBadges.length > 0 ? (
          <div className="flex flex-wrap gap-2" aria-label="Filtros ativos da agenda">
            {activeBadges.map((badge) => (
              <Badge className="bg-brand-gold/15 text-brand-navy-900" key={badge} variant="secondary">
                {badge}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function AgendaEventCard({ item, compact = false }: { item: AgendaItem; compact?: boolean }) {
  return (
    <Card className={cn("overflow-hidden", compact ? "min-h-55" : "min-h-70")}>
      <div className="flex items-center justify-between gap-4 bg-brand-navy-50 px-6 py-4">
        <div>
          <p className={cn("font-heading font-black leading-none text-brand-navy-800", compact ? "text-2xl" : "text-3xl")}>{dayjs(item.startDate).format("DD")}</p>
          <p className="text-xs font-extrabold uppercase text-brand-navy-600">{dayjs(item.startDate).locale("pt-br").format("MMM YYYY")}</p>
        </div>
        <Badge className="bg-brand-gold text-brand-navy-900" variant="gold">{item.status}</Badge>
      </div>

      <CardContent className={cn("flex flex-1 flex-col gap-5", compact ? "p-5" : "p-6")}>
        <div className="flex-1 space-y-2">
          <h3 className={cn("text-balance font-heading font-bold leading-tight", compact ? "text-xl" : "text-2xl")}>{item.courseTitle}</h3>
          <p className="text-muted-foreground">{item.format}</p>
        </div>

        <div className="space-y-2 border-t pt-4">
          <p className="flex items-center gap-2 text-sm">
            <Ticket className="size-4 text-muted-foreground" aria-hidden="true" />
            Início: {formatDate(item.startDate)}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4" aria-hidden="true" />
            {item.schedule} · {item.location}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {typeof item.remainingSeats === "number" ? <Badge variant="secondary">{item.remainingSeats} vagas restantes</Badge> : <Badge variant="outline">Vagas sob consulta</Badge>}
          <Button asChild variant={compact ? "outline" : "default"}>
            <a href={`/cursos/${item.courseSlug}`}>Ver curso</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AgendaCalendarView({
  calendarDate,
  monthItems,
  rowsByDate,
  onCalendarDateChange,
}: {
  calendarDate: Date;
  monthItems: AgendaItem[];
  rowsByDate: Map<string, AgendaItem[]>;
  onCalendarDateChange: (value: Date) => void;
}) {
  const current = dayjs(calendarDate);

  return (
    <Card>
      <CardContent className="space-y-8 p-6 xl:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl font-bold">Calendário de turmas</h2>
            <p className="text-muted-foreground">Dias destacados indicam turmas abertas ou em planejamento.</p>
          </div>
          <Badge className="bg-brand-gold/15 text-brand-navy-900" variant="secondary">{current.locale("pt-br").format("MMMM [de] YYYY")}</Badge>
        </div>

        <div className="rounded-xl border bg-muted/35 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Button aria-label="Mês anterior" onClick={() => onCalendarDateChange(current.subtract(1, "month").toDate())} size="icon" type="button" variant="outline">
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Button>
            <p className="font-heading text-lg font-bold capitalize">{current.locale("pt-br").format("MMMM YYYY")}</p>
            <Button aria-label="Próximo mês" onClick={() => onCalendarDateChange(current.add(1, "month").toDate())} size="icon" type="button" variant="outline">
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase text-muted-foreground">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => <div key={day}>{day}</div>)}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {getMonthDays(calendarDate).map((date) => {
              const dateKey = date.format("YYYY-MM-DD");
              const count = rowsByDate.get(dateKey)?.length ?? 0;
              const inMonth = date.format("YYYY-MM") === current.format("YYYY-MM");

              return (
                <button className={cn("min-h-14 rounded-md border p-1 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", count ? "border-brand-navy-200 bg-brand-navy-50" : "border-transparent bg-white")} key={dateKey} onClick={() => onCalendarDateChange(date.toDate())} type="button">
                  <span className={cn("block text-sm font-extrabold", !inMonth && "text-muted-foreground")}>{date.date()}</span>
                  {count > 0 ? <span className={cn("mt-1 inline-flex rounded-full bg-brand-navy-700 px-2 py-0.5 text-2xs font-bold text-white", !inMonth && "opacity-60")}>{count}</span> : null}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Badge className="bg-brand-navy-700 text-white">1</Badge>
            <p className="text-xs text-muted-foreground">Dias com turmas</p>
          </div>
        </div>

        <div className="rounded-xl border bg-muted/35 p-5">
          <div className="space-y-5">
            <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-brand-navy-700">Turmas do mês</p>
            {monthItems.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {monthItems.slice(0, 4).map((item) => <AgendaEventCard key={item.id} item={item} compact />)}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhuma turma encontrada para este mês com os filtros atuais.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AgendaListView({ items }: { items: AgendaItem[] }) {
  return (
    <div className="space-y-4">
      <h2 className="font-heading text-3xl font-bold">Lista de turmas</h2>
      {items.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:gap-6">
          {items.map((item) => <AgendaEventCard key={item.id} item={item} />)}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="font-heading text-2xl font-bold">Nenhuma turma encontrada</h3>
            <p className="mt-2 text-muted-foreground">Ajuste a busca ou remova o filtro de status para visualizar novas datas.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AgendaHighlights({ items }: { items: AgendaItem[] }) {
  return (
    <div className="space-y-5">
      <Card className="bg-brand-navy-900 text-white">
        <CardContent className="space-y-4 p-6">
          <Badge className="w-fit bg-brand-gold text-brand-navy-900" variant="gold">Próximas datas</Badge>
          <h2 className="font-heading text-2xl font-bold text-white">Turmas em destaque</h2>
          <p className="text-white/80">Priorize as próximas oportunidades com data, formato e disponibilidade.</p>
        </CardContent>
      </Card>

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex gap-4 p-4">
                <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-navy-50 text-brand-navy-800">
                  <span className="text-lg font-black leading-none">{dayjs(item.startDate).format("DD")}</span>
                  <span className="text-2xs font-extrabold uppercase">{dayjs(item.startDate).locale("pt-br").format("MMM")}</span>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="font-extrabold leading-snug">{item.courseTitle}</p>
                  <p className="text-sm text-muted-foreground">{item.schedule} · {item.location}</p>
                  <div className="flex items-center justify-between gap-3">
                    <Badge className="bg-brand-gold/15 text-brand-navy-900" variant="secondary">{item.status}</Badge>
                    <Button asChild size="sm" variant="ghost">
                      <a href={`/cursos/${item.courseSlug}`}>Ver curso</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card><CardContent className="p-6"><p className="text-muted-foreground">Nenhuma turma em destaque com os filtros atuais.</p></CardContent></Card>
      )}
    </div>
  );
}

function AgendaSupportCard() {
  return (
    <Card className="bg-brand-navy-900 text-white">
      <CardContent className="space-y-6 p-6">
        <div className="flex size-14 items-center justify-center rounded-full bg-brand-gold text-brand-navy-900">
          <CalendarRange className="size-7" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <Badge className="w-fit bg-brand-gold text-brand-navy-900" variant="gold">Turma sob medida</Badge>
          <h2 className="font-heading text-2xl font-bold text-white">Precisa de uma data específica?</h2>
          <p className="text-white/80">Solicite uma proposta In Company quando a agenda pública não atender o prazo da sua equipe.</p>
        </div>
        <Button asChild size="lg" variant="gold">
          <a href="/in-company">Solicitar proposta</a>
        </Button>
      </CardContent>
    </Card>
  );
}

function AgendaNewsletterCta() {
  return (
    <section className="rounded-xl border border-white/15 bg-[radial-gradient(circle_at_top_left,rgba(212,160,23,0.22),transparent_28%),linear-gradient(135deg,#0A2E45_0%,#0F4363_58%,#1D6B8D_100%)] p-6 text-white xl:p-8">
      <div className="grid items-center gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="flex gap-4">
          <div className="flex size-13 shrink-0 items-center justify-center rounded-full bg-brand-gold text-brand-navy-900">
            <BellRing className="size-6" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <Badge className="w-fit bg-brand-gold text-brand-navy-900" variant="gold">Aviso de novas turmas</Badge>
            <h2 className="font-heading text-2xl font-bold text-white">Não encontrou a data ideal?</h2>
            <p className="text-white/85">Receba um aviso quando novas turmas forem abertas ou solicite uma agenda alinhada à necessidade da sua equipe.</p>
          </div>
        </div>
        <div>
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <Input aria-label="E-mail para newsletter" className="h-13 bg-white/95 font-semibold text-brand-navy-900" disabled placeholder="Seu e-mail profissional" />
            <Button asChild className="h-13" variant="inverse"><a href="/contato">Receber aviso</a></Button>
          </div>
          <p className="mt-2 text-xs text-white/70">Captura real pendente de integração com banco de dados e administração.</p>
        </div>
      </div>
    </section>
  );
}

export function AgendaBrowser({
  items,
  initialSearch = "",
  initialStatus = "Todos",
  initialFormat = "Todos",
  initialLocation = "Todos",
  initialMonth = "Todos",
  initialView = "calendario",
}: AgendaBrowserProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [format, setFormat] = useState(initialFormat);
  const [location, setLocation] = useState(initialLocation);
  const [month, setMonth] = useState(initialMonth);
  const [view, setView] = useState<AgendaView>(initialView);
  const [calendarDate, setCalendarDate] = useState(() => {
    const firstItem = items[0];
    return initialMonth !== "Todos"
      ? dayjs(`${initialMonth}-01`).toDate()
      : firstItem
        ? dayjs(firstItem.startDate).toDate()
        : new Date();
  });
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const lastSyncedUrl = useRef(createUrl(pathname, initialSearch, initialStatus, initialFormat, initialLocation, initialMonth, initialView));

  const statuses = useMemo(() => ["Todos", ...Array.from(new Set(items.map((item) => item.status)))], [items]);
  const formats = useMemo(() => ["Todos", ...Array.from(new Set(items.map((item) => item.format)))], [items]);
  const locations = useMemo(() => ["Todos", ...Array.from(new Set(items.map((item) => item.location)))], [items]);
  const months = useMemo(() => ["Todos", ...Array.from(new Set(items.map((item) => item.startDate.slice(0, 7))))], [items]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(search);

    return items
      .filter((item) => status === "Todos" || item.status === status)
      .filter((item) => format === "Todos" || item.format === format)
      .filter((item) => location === "Todos" || item.location === location)
      .filter((item) => month === "Todos" || item.startDate.startsWith(month))
      .filter((item) => normalizedQuery ? normalizeSearchValue(getSearchableAgendaText(item)).includes(normalizedQuery) : true)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [format, items, location, month, search, status]);

  const rowsByDate = useMemo(() => {
    const buckets = new Map<string, AgendaItem[]>();
    filteredItems.forEach((item) => {
      const bucket = buckets.get(item.startDate) ?? [];
      bucket.push(item);
      buckets.set(item.startDate, bucket);
    });
    return buckets;
  }, [filteredItems]);

  const monthKey = dayjs(calendarDate).format("YYYY-MM");
  const monthItems = filteredItems.filter((item) => item.startDate.startsWith(monthKey));
  const featuredItems = filteredItems.slice(0, 4);
  const activeFilters = search.trim().length > 0 || status !== "Todos" || format !== "Todos" || location !== "Todos" || month !== "Todos";

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const nextUrl = createUrl(pathname, debouncedSearch, status, format, location, month, view);
    if (nextUrl === lastSyncedUrl.current) return;
    lastSyncedUrl.current = nextUrl;
    router.replace(nextUrl, { scroll: false });
  }, [debouncedSearch, format, location, month, pathname, router, status, view]);

  return (
    <div className="space-y-10">
      <AgendaFilters
        activeFilters={activeFilters}
        format={format}
        formats={formats}
        location={location}
        locations={locations}
        month={month}
        months={months}
        onFormatChange={setFormat}
        onLocationChange={setLocation}
        onMonthChange={(value) => {
          setMonth(value);
          if (value !== "Todos") {
            setCalendarDate(dayjs(`${value}-01`).toDate());
          }
        }}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onViewChange={setView}
        search={search}
        status={status}
        statuses={statuses}
        view={view}
      />

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] xl:gap-12">
        {view === "calendario" ? (
          <AgendaCalendarView calendarDate={calendarDate} monthItems={monthItems} onCalendarDateChange={setCalendarDate} rowsByDate={rowsByDate} />
        ) : (
          <AgendaListView items={filteredItems} />
        )}
        {view === "calendario" ? <AgendaHighlights items={featuredItems} /> : <AgendaSupportCard />}
      </div>

      <AgendaNewsletterCta />
    </div>
  );
}
