"use client";

import { useEffect, useState } from "react";
import { Alert, Badge, Card, Group, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";

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
    return <Text c="dimmed">Carregando contexto do instrutor...</Text>;
  }

  if (error) {
    return (
      <Alert color="yellow" title="Portal do instrutor indisponível">
        {error}
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Stack gap="xl">
      <Stack gap={6}>
        <Title order={1}>Portal do instrutor</Title>
        <Text c="dimmed">Consulte turmas atribuídas e alunos vinculados às suas aulas.</Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        <Card withBorder radius="lg" padding="lg">
          <Text size="sm" c="dimmed">Instrutor</Text>
          <Title order={3} mt={6}>{data.profile.name}</Title>
          <Text mt={8}>{data.profile.email || "E-mail não informado"}</Text>
          <Text>{data.profile.phone || "Telefone não informado"}</Text>
        </Card>
        <Card withBorder radius="lg" padding="lg">
          <Text size="sm" c="dimmed">Especialidade</Text>
          <Title order={4} mt={6}>{data.profile.specialty || "Especialidade não informada"}</Title>
          <Text mt={8}>{data.profile.bio || "Biografia não informada."}</Text>
        </Card>
        <Card withBorder radius="lg" padding="lg">
          <Text size="sm" c="dimmed">Turmas atribuídas</Text>
          <Title order={2} mt={6}>{data.classes.length}</Title>
          <Text mt={8}>Sem ações operacionais de presença, publicação ou comunicação neste MVP.</Text>
        </Card>
      </SimpleGrid>

      <Card withBorder radius="lg" padding="lg" id="turmas">
        <Group justify="space-between" align="end" mb="md">
          <div>
            <Title order={3}>Turmas atribuídas</Title>
            <Text c="dimmed">Somente classes associadas ao seu vínculo autenticado.</Text>
          </div>
        </Group>

        {data.classes.length === 0 ? (
          <Alert color="blue" title="Nenhuma turma vinculada">
            Sua conta ainda não possui turmas atribuídas.
          </Alert>
        ) : (
          <Stack gap="lg">
            {data.classes.map((trainingClass) => (
              <Card key={trainingClass.id} withBorder radius="md" padding="lg" id="alunos">
                <Group justify="space-between" align="start" mb="md">
                  <div>
                    <Title order={4}>{trainingClass.course?.title ?? "Curso indisponível"}</Title>
                    <Text c="dimmed">
                      {formatDate(trainingClass.startDate)} • {trainingClass.modality}
                      {trainingClass.location ? ` • ${trainingClass.location}` : ""}
                    </Text>
                  </div>
                  <Badge variant="light">{trainingClass.status}</Badge>
                </Group>

                <Text mb="sm">
                  Vagas preenchidas: {trainingClass.filledSeats} / {trainingClass.totalSeats}
                </Text>

                <Table.ScrollContainer minWidth={720}>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Aluno</Table.Th>
                        <Table.Th>Organização</Table.Th>
                        <Table.Th>Status</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {trainingClass.students.map((student) => (
                        <Table.Tr key={student.enrollmentId}>
                          <Table.Td>
                            <Stack gap={2}>
                              <Text>{student.name}</Text>
                              <Text size="sm" c="dimmed">{student.email}</Text>
                            </Stack>
                          </Table.Td>
                          <Table.Td>{student.organization || "Não informado"}</Table.Td>
                          <Table.Td><Badge variant="light">{student.status}</Badge></Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </Card>
            ))}
          </Stack>
        )}
      </Card>
    </Stack>
  );
}
