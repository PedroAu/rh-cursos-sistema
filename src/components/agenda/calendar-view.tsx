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
    <div className="space-y-8">
      <Card className="overflow-hidden border-[#d7dee5] bg-white shadow-[0_10px_24px_rgba(0,67,100,0.08)]">
        <CardContent className="p-5 md:p-6">
          <div className="mb-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="mt-1 font-display text-[2rem] font-bold capitalize text-[#0b4668]">
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
                aria-label="Selecionar data"
                value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
                onChange={(event) => goToDate(event.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-white px-3 text-sm shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-ring/30"
              />
              <Button type="button" variant="outline" onClick={goToToday}>
                Hoje
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[0.82rem] font-bold uppercase tracking-[0.08em] text-[#69737d]">
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

              const hasClasses = items.length > 0;
              const inMonth = isSameMonth(day, monthStart);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  aria-label={`${format(day, "d 'de' MMMM", { locale: ptBR })}${hasClasses ? ` — ${items.length} turma${items.length === 1 ? "" : "s"}` : ""}`}
                  aria-pressed={isSelected ? true : undefined}
                  className={`flex min-h-[92px] flex-col justify-between border p-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    inMonth
                      ? hasClasses
                        ? "bg-[#eaf5ff] hover:bg-[#dcebfa]"
                        : "bg-white hover:border-[#9ebbd1] hover:bg-[#f8fbfe]"
                      : "bg-[#f5f7fa] text-[#616971]"
                  } ${isToday(day) ? "border-[#0d5b85] shadow-soft" : "border-[#d7dee5]"} ${
                    isSelected ? "border-[#0b4668] bg-[#0b4668] text-white hover:bg-[#0b4668]" : ""
                  }`}
                >
                  <div className="self-end text-sm font-bold">{format(day, "d")}</div>
                  {hasClasses ? (
                    <div className={`mt-1 h-1 w-full rounded-full ${isSelected ? "bg-[#f6be39]" : "bg-[#004364]"}`} />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-md bg-[#f2f4f7] px-3 py-2 text-sm font-semibold text-[#58616b]">
            <CalendarDays className="h-4 w-4 text-[#004364]" />
            Clique em uma data para filtrar os cards ao lado.
          </div>
        </CardContent>
      </Card>

      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-[#cae6ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#004364]">
              {selectedLabel}
            </span>
            <h2 className="mt-2 font-display text-[2rem] font-bold text-[#1a1c1e]">
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
          <LoadingBlocks count={6} summary="Atualizando agenda filtrada..." />
        ) : visibleClasses.length ? (
          <div className="grid gap-5">
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
