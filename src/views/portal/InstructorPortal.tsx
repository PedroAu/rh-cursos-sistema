"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { fetchInstructorPortalData, type InstructorPortalData } from "@/lib/supabase/portal-data";
import { supabase } from "@/lib/supabase/client";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(value));
}

export function InstructorPortal() {
  const [data, setData] = useState<InstructorPortalData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    if (!supabase) {
      setError("Supabase não configurado para carregar o portal do instrutor.");
      setLoading(false);
      return;
    }

    void fetchInstructorPortalData(supabase)
      .then((result) => {
        if (!active) return;
        setData(result);
      })
      .catch((reason) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : "Não foi possível carregar o portal do instrutor.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-tk-ink-muted">Carregando contexto do instrutor...</p>;
  }

  if (error) {
    return (
      <div role="alert" className="rounded-lg border border-warning/25 bg-warning/10 px-4 py-3 text-sm text-warning">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Portal do instrutor indisponível</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold text-tk-ink">Portal do instrutor</h1>
        <p className="text-tk-ink-muted">Consulte turmas atribuídas e alunos vinculados às suas aulas.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-tk-ink-muted">Instrutor</p>
          <h3 className="mt-1.5 text-xl font-semibold text-tk-ink">{data.profile.name}</h3>
          <p className="mt-2 text-tk-ink">{data.profile.email || "E-mail não informado"}</p>
          <p className="text-tk-ink">{data.profile.phone || "Telefone não informado"}</p>
        </Card>
        <Card>
          <p className="text-sm text-tk-ink-muted">Especialidade</p>
          <h4 className="mt-1.5 text-lg font-semibold text-tk-ink">{data.profile.specialty || "Especialidade não informada"}</h4>
          <p className="mt-2 text-tk-ink">{data.profile.bio || "Biografia não informada."}</p>
        </Card>
        <Card>
          <p className="text-sm text-tk-ink-muted">Turmas atribuídas</p>
          <h2 className="mt-1.5 text-2xl font-bold text-tk-ink">{data.classes.length}</h2>
          <p className="mt-2 text-tk-ink">Sem ações operacionais de presença, publicação ou comunicação neste MVP.</p>
        </Card>
      </div>

      <Card id="turmas">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="text-xl font-semibold text-tk-ink">Turmas atribuídas</h3>
            <p className="text-tk-ink-muted">Somente classes associadas ao seu vínculo autenticado.</p>
          </div>
        </div>

        {data.classes.length === 0 ? (
          <div className="rounded-2xl bg-tk-surface-2 p-8 text-center">
            <p className="font-semibold text-tk-ink">Nenhuma turma vinculada</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-tk-ink-muted">
              Sua conta ainda não possui turmas atribuídas.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {data.classes.map((trainingClass) => (
              <Card key={trainingClass.id} id="alunos">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-tk-ink">{trainingClass.course?.title ?? "Curso indisponível"}</h4>
                    <p className="text-tk-ink-muted">
                      {formatDate(trainingClass.startDate)} • {trainingClass.modality}
                      {trainingClass.location ? ` • ${trainingClass.location}` : ""}
                    </p>
                  </div>
                  <Badge variant="muted">{trainingClass.status}</Badge>
                </div>

                <p className="mb-3 text-tk-ink">
                  Vagas preenchidas: {trainingClass.filledSeats} / {trainingClass.totalSeats}
                </p>

                <Table className="min-w-[720px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Organização</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainingClass.students.map((student) => (
                      <TableRow key={student.enrollmentId}>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span>{student.name}</span>
                            <span className="text-sm text-tk-ink-muted">{student.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>{student.organization || "Não informado"}</TableCell>
                        <TableCell>
                          <Badge variant="muted">{student.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
