"use client";

import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminAgendaRow } from "@/lib/admin-data";

type AdminAgendaCalendarProps = {
  rows: AdminAgendaRow[];
  month: string;
  basePath: string;
  params?: Record<string, string | undefined>;
};

function buildHref(
  basePath: string,
  month: string,
  params: Record<string, string | undefined>,
) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  searchParams.set("month", month);

  return `${basePath}?${searchParams.toString()}`;
}

function getMonthDays(month: string) {
  const start = dayjs(`${month}-01`).startOf("month");
  const leading = start.day();
  const gridStart = start.subtract(leading, "day");

  return Array.from({ length: 42 }, (_, index) => gridStart.add(index, "day"));
}

export function AdminAgendaCalendar({
  rows,
  month,
  basePath,
  params = {},
}: AdminAgendaCalendarProps) {
  const router = useRouter();
  const monthDate = dayjs(`${month}-01`);
  const rowsByDate = new Map<string, AdminAgendaRow[]>();

  rows.forEach((row) => {
    const bucket = rowsByDate.get(row.startDate) ?? [];
    bucket.push(row);
    rowsByDate.set(row.startDate, bucket);
  });

  const monthRows = rows
    .filter((row) => row.startDate.startsWith(month))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  function pushMonth(nextMonth: string) {
    router.push(buildHref(basePath, nextMonth, params));
  }

  return (
    <Card>
      <CardHeader className="gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle>Calendário mensal</CardTitle>
          <CardDescription>Visão mensal das turmas com navegação por mês.</CardDescription>
        </div>
        <Badge className="w-fit bg-brand-gold/15 text-brand-navy-900" variant="secondary">
          {monthDate.locale("pt-br").format("MMMM [de] YYYY")}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Button
            aria-label="Mês anterior"
            onClick={() => pushMonth(monthDate.subtract(1, "month").format("YYYY-MM"))}
            size="icon"
            type="button"
            variant="outline"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>
          <p className="font-heading text-lg font-bold capitalize text-foreground">
            {monthDate.locale("pt-br").format("MMMM YYYY")}
          </p>
          <Button
            aria-label="Próximo mês"
            onClick={() => pushMonth(monthDate.add(1, "month").format("YYYY-MM"))}
            size="icon"
            type="button"
            variant="outline"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase text-muted-foreground">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {getMonthDays(month).map((date) => {
            const dateKey = date.format("YYYY-MM-DD");
            const count = rowsByDate.get(dateKey)?.length ?? 0;
            const inMonth = date.format("YYYY-MM") === month;

            return (
              <div
                className={`min-h-16 rounded-md border p-2 text-center ${count ? "border-brand-navy-200 bg-brand-navy-50" : "border-transparent bg-muted/30"} ${inMonth ? "" : "opacity-35"}`}
                key={dateKey}
              >
                <p className="text-sm font-bold">{date.date()}</p>
                {count > 0 ? (
                  <span className="mt-1 inline-flex rounded-full bg-brand-navy-700 px-2 py-0.5 text-2xs font-bold text-white">
                    {count} turma{count > 1 ? "s" : ""}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-brand-navy-700">
            Turmas do mês
          </p>
          {monthRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma turma programada para este mês.</p>
          ) : (
            <div className="space-y-3">
              {monthRows.slice(0, 8).map((row) => (
                <div className="flex items-start justify-between gap-3" key={row.id}>
                  <div>
                    <p className="text-sm font-semibold">{row.courseTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.startDate} · {row.schedule} · {row.location}
                    </p>
                  </div>
                  <Badge variant="secondary">{row.status}</Badge>
                </div>
              ))}
              {monthRows.length > 8 ? (
                <p className="text-xs text-muted-foreground">+{monthRows.length - 8} turmas neste mês</p>
              ) : null}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
