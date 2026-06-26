import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Course, Enrollment, Lead, Student, TrainingClass } from "@/types";

type RealTimeMetricsData = {
  courses: Course[];
  classes: TrainingClass[];
  students: Student[];
  leads: Lead[];
  enrollments: Enrollment[];
};

export function useRealTimeMetrics(
  initialData: RealTimeMetricsData
): RealTimeMetricsData {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    const channels = [
      supabase
        .channel("real-time:courses")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "cursos" },
          () => {
            window.dispatchEvent(new CustomEvent("metrics-updated"));
          }
        )
        .subscribe(),
      supabase
        .channel("real-time:enrollments")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "inscricoes" },
          () => {
            window.dispatchEvent(new CustomEvent("metrics-updated"));
          }
        )
        .subscribe(),
      supabase
        .channel("real-time:leads")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "leads" },
          () => {
            window.dispatchEvent(new CustomEvent("metrics-updated"));
          }
        )
        .subscribe()
    ];

    const handleMetricsUpdate = () => {
      setData(initialData);
    };

    window.addEventListener("metrics-updated", handleMetricsUpdate);

    return () => {
      channels.forEach((channel) => {
        supabase?.removeChannel(channel);
      });
      window.removeEventListener("metrics-updated", handleMetricsUpdate);
    };
  }, [initialData]);

  return data;
}
