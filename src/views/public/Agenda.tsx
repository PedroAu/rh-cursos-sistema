import { CalendarDays, CheckCircle2, Filter, Search, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { CalendarView } from "@/components/agenda/calendar-view";
import { SearchInput } from "@/components/common/search-input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/lib/app-store";
import { useHotkey } from "@/hooks/use-hotkey";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";

export function AgendaPage() {
  const { classes, courses, instructors, trainingPaths } = useAppStore();
  const [query, setQuery] = useState("");
  const [path, setPath] = useState("");
  const [courseId, setCourseId] = useState("");
  const [modality, setModality] = useState("");
  const [status, setStatus] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useHotkey(
    (event) => event.key === "/" && !["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName),
    (event) => {
      event.preventDefault();
      searchRef.current?.focus();
    }
  );

  const filteredClasses = useMemo(
    () =>
      classes.filter((trainingClass) => {
        const course = courses.find((item) => item.id === trainingClass.courseId);
        const instructor = instructors.find((item) => item.id === trainingClass.instructorId);
        return (
          (!query ||
            [course?.title, instructor?.name, trainingClass.location].join(" ").toLowerCase().includes(query.toLowerCase())) &&
          (!path || course?.pathId === path) &&
          (!courseId || trainingClass.courseId === courseId) &&
          (!modality || trainingClass.modality === modality) &&
          (!status || trainingClass.status === status)
        );
      }),
    [classes, courseId, courses, instructors, modality, path, query, status]
  );

  const loading = useSimulatedLoading([query, path, courseId, modality, status], 400);
  const activeFiltersCount = [query, path, courseId, modality, status].filter(Boolean).length;
  const courseOptions = path ? courses.filter((item) => item.pathId === path) : courses;
  const clearFilters = () => {
    setQuery("");
    setPath("");
    setCourseId("");
    setModality("");
    setStatus("");
  };

  return (
    <section className="bg-surface-muted">
      <div className="border-b border-outline-variant bg-white/90">
        <div className="container grid gap-6 py-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
          <div className="max-w-3xl">
            <span className="eyebrow">Agenda de turmas</span>
            <h1 className="mt-4 max-w-3xl font-display text-h1-mobile font-extrabold text-deep-navy md:text-display">
              Consulte datas, modalidades e vagas das próximas turmas.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-text-muted">
              Use a agenda para encontrar rapidamente a turma ideal por trilha, curso,
              modalidade, local e status de inscrição.
            </p>
          </div>
          <div className="apple-surface p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-primary">
                <CalendarDays className="h-6 w-6" />
              </span>
              <div>
                <strong className="font-display text-3xl leading-none text-deep-navy">
                  {filteredClasses.length}
                </strong>
                <p className="mt-1 text-sm font-semibold text-text-muted">
                  turma{filteredClasses.length === 1 ? "" : "s"} encontrada{filteredClasses.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container space-y-8 py-10">
        <div className="apple-surface space-y-5 p-5 md:p-6">
          <div className="flex flex-col gap-4 border-b border-outline-variant pb-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/70 text-primary">
                <Filter className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold text-deep-navy">Pesquisar turmas</h2>
                <p className="text-sm text-text-muted">Combine filtros para encontrar uma data disponível.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2 text-xs font-bold text-deep-navy">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                {activeFiltersCount} filtro{activeFiltersCount === 1 ? "" : "s"} ativo{activeFiltersCount === 1 ? "" : "s"}
              </span>
              <Button type="button" variant="outline" size="sm" className="gap-2" disabled={!activeFiltersCount} onClick={clearFilters}>
                <X className="h-4 w-4" />
                Limpar
              </Button>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
            <div>
              <span className="ea-label mb-2 flex items-center gap-2">
                <Search className="h-3.5 w-3.5" />
                Busca
              </span>
              <SearchInput
                ref={searchRef}
                placeholder="Curso, instrutor ou local"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div>
              <span className="ea-label mb-2 block">Trilha</span>
              <Select
                value={path || "all-paths"}
                onValueChange={(value) => {
                  const nextPath = value === "all-paths" ? "" : value;
                  setPath(nextPath);
                  setCourseId("");
                }}
              >
                <SelectTrigger><SelectValue placeholder="Trilha" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-paths">Todas as trilhas</SelectItem>
                  {trainingPaths.map((item) => <SelectItem key={item.id} value={item.id}>{item.shortName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <span className="ea-label mb-2 block">Curso</span>
              <Select value={courseId || "all-courses"} onValueChange={(value) => setCourseId(value === "all-courses" ? "" : value)}>
                <SelectTrigger><SelectValue placeholder="Curso" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-courses">Todos os cursos</SelectItem>
                  {courseOptions.map((item) => <SelectItem key={item.id} value={item.id}>{item.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <span className="ea-label mb-2 block">Modalidade</span>
              <Select value={modality || "all-modalities"} onValueChange={(value) => setModality(value === "all-modalities" ? "" : value)}>
                <SelectTrigger><SelectValue placeholder="Modalidade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-modalities">Todas</SelectItem>
                  {["Ao vivo online", "Presencial", "In company", "Híbrido", "Gravado"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <span className="ea-label mb-2 block">Status</span>
              <Select value={status || "all-status"} onValueChange={(value) => setStatus(value === "all-status" ? "" : value)}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">Todos</SelectItem>
                  {["Inscrições abertas", "Poucas vagas", "Encerrada", "Em breve"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <CalendarView filteredClasses={filteredClasses} loading={loading} />
      </div>
    </section>
  );
}
