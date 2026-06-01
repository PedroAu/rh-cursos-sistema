import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { ClassCard } from "@/components/agenda/class-card";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingBlocks } from "@/components/common/loading-blocks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/app-store";
import type { TrainingClass } from "@/types";

export function CalendarView({
  filteredClasses,
  loading = false
}: {
  filteredClasses: TrainingClass[];
  loading?: boolean;
}) {
  const { courses, instructors } = useAppStore();
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(visibleMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { locale: ptBR });
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });

  const days = useMemo(() => {
    const output: Date[] = [];
    let pointer = calendarStart;

    while (pointer <= calendarEnd) {
      output.push(pointer);
      pointer = addDays(pointer, 1);
    }

    return output;
  }, [calendarEnd, calendarStart]);

  const classesForDate = (date: Date) =>
    filteredClasses.filter(
      (trainingClass) =>
        format(new Date(trainingClass.startDate), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );

  const visibleClasses = selectedDate ? classesForDate(selectedDate) : filteredClasses;
  const selectedLabel = selectedDate
    ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR })
    : "Próximas turmas";

  const goToDate = (value: string) => {
    if (!value) return;

    const [year, month, day] = value.split("-").map(Number);
    const nextDate = new Date(year, month - 1, day);
    setSelectedDate(nextDate);
    setVisibleMonth(startOfMonth(nextDate));
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setVisibleMonth(startOfMonth(today));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)] xl:items-start">
      <Card className="xl:sticky xl:top-28">
        <CardContent className="p-5">
          <div className="mb-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="ea-label">Calendário</span>
                <h3 className="mt-1 font-display text-2xl font-bold capitalize text-deep-navy">
                  {format(monthStart, "MMMM yyyy", { locale: ptBR })}
                </h3>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Mês anterior"
                  onClick={() => setVisibleMonth((current) => subMonths(current, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Próximo mês"
                  onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="sr-only" htmlFor="agenda-date">
                Selecionar data
              </label>
              <input
                id="agenda-date"
                type="date"
                value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
                onChange={(event) => goToDate(event.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-white px-3 text-sm shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-ring/30"
              />
              <Button type="button" variant="outline" onClick={goToToday}>
                Hoje
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((label) => (
              <div key={label} className="py-2">{label}</div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((day) => {
              const items = classesForDate(day);
              const isSelected =
                selectedDate &&
                format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-14 rounded-lg border p-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    isSameMonth(day, monthStart)
                      ? "bg-white hover:border-primary/30 hover:bg-secondary/50"
                      : "bg-background text-muted-foreground/70"
                  } ${isToday(day) ? "border-primary shadow-soft" : "border-border"} ${
                    isSelected ? "bg-deep-navy text-white hover:bg-deep-navy" : ""
                  }`}
                >
                  <div className="text-xs font-bold">{format(day, "d")}</div>
                  {items.length ? (
                    <div className={`mt-1 h-1.5 w-1.5 rounded-full ${isSelected ? "bg-accent" : "bg-accent"}`} />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2 text-xs font-semibold text-text-muted">
            <CalendarDays className="h-4 w-4 text-primary" />
            Clique em uma data para filtrar os cards ao lado.
          </div>
        </CardContent>
      </Card>

      <div className="space-y-5">
        <div className="apple-surface flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex rounded bg-prestige-gold px-2 py-1 text-xs font-bold uppercase tracking-[0.08em] text-white">
              {selectedLabel}
            </span>
            <h2 className="mt-1 font-display text-2xl font-bold text-deep-navy">
              {visibleClasses.length} turma{visibleClasses.length === 1 ? "" : "s"} encontrada{visibleClasses.length === 1 ? "" : "s"}
            </h2>
          </div>
          {selectedDate ? (
            <Button type="button" variant="outline" onClick={() => setSelectedDate(null)}>
              Ver todas
            </Button>
          ) : null}
        </div>

        {loading ? (
          <LoadingBlocks count={6} />
        ) : visibleClasses.length ? (
          <div className="grid gap-5 2xl:grid-cols-2">
            {visibleClasses.map((trainingClass) => {
              const course = courses.find((item) => item.id === trainingClass.courseId);
              const instructor = instructors.find((item) => item.id === trainingClass.instructorId);

              return course ? (
                <ClassCard
                  key={trainingClass.id}
                  trainingClass={trainingClass}
                  course={course}
                  instructor={instructor}
                />
              ) : null;
            })}
          </div>
        ) : (
          <EmptyState
            title="Nenhuma turma nesta seleção."
            description="Escolha outra data no calendário ou ajuste os filtros de trilha, curso, modalidade e status."
          />
        )}
      </div>
    </div>
  );
}
