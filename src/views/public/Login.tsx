"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { AlertCircle, ShieldCheck } from "lucide-react";
import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  Paper,
  PasswordInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  UnstyledButton
} from "@mantine/core";
import { isEmail, useForm } from "@mantine/form";
import { toast } from "sonner";

import type { DashboardRole } from "@/lib/auth";
import { useNavigate } from "@/lib/router-compat";
import { useAppStore } from "@/lib/app-store";
import { getDefaultDashboardPath, isRolePathAllowed } from "@/lib/session-routing";
import { setSessionToken, setSupabaseSession } from "@/lib/supabase/session-token";
import { supabase } from "@/lib/supabase/client";

const roleOptions: Array<{
  role: DashboardRole;
  label: string;
  description: string;
}> = [
  {
    role: "admin",
    label: "Administração",
    description: "Acesso ao painel operacional e cadastro."
  },
  {
    role: "student",
    label: "Aluno",
    description: "Acompanhe inscrições e contexto das suas turmas."
  },
  {
    role: "instructor",
    label: "Instrutor",
    description: "Visualize turmas atribuídas e alunos vinculados."
  }
];

export function LoginPage() {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const { setSession } = useAppStore();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<DashboardRole>("admin");
  const status = searchParams.get("status");
  const nextPath = searchParams.get("next");

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: ""
    },
    validate: {
      email: (value) => {
        if (!value.trim()) return "Preencha o e-mail para continuar.";
        return isEmail("Informe um e-mail válido.")(value);
      },
      password: (value) => (!value.trim() ? "Preencha a senha para continuar." : null)
    }
  });

  const handleSubmit = form.onSubmit(
    async (values) => {
      setError(null);
      setIsSubmitting(true);

      try {
        const response = await fetch("/api/auth/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ role: selectedRole, email: values.email, password: values.password })
        });

        if (!response.ok) {
          setError("E-mail ou senha incorretos. Verifique seus dados e tente novamente.");
          return;
        }

        const data = (await response.json()) as {
          session: { role: DashboardRole; email: string; name: string };
          token: string;
          supabaseSession: { access_token: string; refresh_token: string } | null;
        };

        setSessionToken(data.token);

        if (data.supabaseSession && supabase) {
          setSupabaseSession(data.supabaseSession);
          await supabase.auth.setSession({
            access_token: data.supabaseSession.access_token,
            refresh_token: data.supabaseSession.refresh_token
          });
        }

        setSession(data.session);
        const nextDestination = isRolePathAllowed(data.session.role, nextPath ?? undefined)
          ? nextPath ?? getDefaultDashboardPath(data.session.role)
          : getDefaultDashboardPath(data.session.role);
        navigate(nextDestination);
      } catch {
        setError("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
      } finally {
        setIsSubmitting(false);
      }
    },
    () => {
      setError("Preencha e-mail e senha para continuar.");
    }
  );

  return (
    <Grid gap={0} mih="calc(100vh - 4.5rem)">
      <Grid.Col span={{ base: 0, lg: 6 }}>
        <Box className="relative hidden h-full overflow-hidden bg-[#072d48] lg:block">
          <Image
            src="/images/in-company-hero-ai.png"
            alt="Ambiente corporativo moderno da RH Cursos"
            fill
            sizes="50vw"
            className="object-cover opacity-35"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#051d31] via-[#072d48]/85 to-[#072d48]/45" />

          <Stack className="relative h-full justify-between p-12 text-white">
            <Text fw={800} fz="4rem" lh={0.95} style={{ letterSpacing: "-0.06em" }}>
              RH Cursos
            </Text>

            <Stack gap="xl">
              <Text maw={480} fz="2rem" fw={700} lh={1.15}>
                Capacitação estratégica para profissionais que transformam a gestão pública e empresarial.
              </Text>

              <Paper radius="lg" p="lg" bg="rgba(255,255,255,0.08)" style={{ border: "1px solid rgba(255,255,255,0.18)" }}>
                <Group align="flex-start" wrap="nowrap">
                  <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-[#f5c13a]" />
                  <Stack gap={4}>
                    <Text fw={700} fz="lg">
                      Certificado Reconhecido
                    </Text>
                    <Text c="rgba(255,255,255,0.82)">
                      Qualidade técnica com foco em resultados práticos.
                    </Text>
                  </Stack>
                </Group>
              </Paper>
            </Stack>
          </Stack>
        </Box>
      </Grid.Col>

      <Grid.Col span={{ base: 12, lg: 6 }}>
        <Box className="flex h-full items-center justify-center px-6 py-12">
          <Paper radius="lg" p={{ base: "xl", md: 40 }} shadow="sm" w="100%" maw={560} withBorder data-testid="ui-login-card">
            <Stack gap="xl">
              <Stack gap={6}>
                <Title order={1} c="rhBlue.9">
                  Acesse sua conta
                </Title>
                <Text c="#4d5f70" fz="lg">
                  Bem-vindo de volta. Entre com suas credenciais.
                </Text>
              </Stack>

              {status === "required" ? (
                <Alert color="yellow" variant="light">
                  Faça login para acessar {nextPath || getDefaultDashboardPath(selectedRole)}.
                </Alert>
              ) : null}

              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                {roleOptions.map((item) => (
                  <UnstyledButton
                    key={item.role}
                    type="button"
                    aria-pressed={selectedRole === item.role}
                    onClick={() => {
                      setSelectedRole(item.role);
                      setError(null);
                    }}
                    style={{
                      border: selectedRole === item.role ? "1px solid #0a4b72" : "1px solid #d9e1e8",
                      background: selectedRole === item.role ? "#0a4b72" : "#eef3f7",
                      color: selectedRole === item.role ? "#ffffff" : "#5b6b7b",
                      borderRadius: "12px",
                      padding: "16px",
                      textAlign: "left"
                    }}
                  >
                    <Text fw={700} fz="sm">
                      {item.label}
                    </Text>
                    <Text mt={8} fz="sm" c={selectedRole === item.role ? "rgba(255,255,255,0.82)" : "#4f5f6f"}>
                      {item.description}
                    </Text>
                  </UnstyledButton>
                ))}
              </SimpleGrid>

              {error ? (
                <Alert color="red" icon={<AlertCircle className="h-4 w-4" />} title="Falha ao entrar">
                  {error}
                </Alert>
              ) : null}

              <form onSubmit={handleSubmit}>
                <Stack gap="md">
                  <TextInput
                    key={form.key("email")}
                    label="E-mail"
                    placeholder="voce@empresa.com.br"
                    description="Conta autorizada para o papel selecionado."
                    size="md"
                    {...form.getInputProps("email")}
                    onFocus={() => setError(null)}
                    styles={{ description: { color: "#4f5f6f" } }}
                  />
                  <PasswordInput
                    key={form.key("password")}
                    label="Senha"
                    placeholder="Sua senha de acesso"
                    description={`Perfil atual: ${roleOptions.find((item) => item.role === selectedRole)?.label ?? selectedRole}.`}
                    size="md"
                    {...form.getInputProps("password")}
                    onFocus={() => setError(null)}
                    styles={{ description: { color: "#4f5f6f" } }}
                  />

                  <Button type="submit" aria-label="Entrar" color="rhBlue" loading={isSubmitting} size="lg">
                    Entrar
                  </Button>
                </Stack>
              </form>

              <Divider />

              <Group justify="space-between" align="center">
                <Button
                  variant="subtle"
                  color="rhBlue"
                  onClick={() => toast.success("Link de recuperação enviado para o seu e-mail.")}
                >
                  Esqueci minha senha
                </Button>

                <Button variant="light" color="rhBlue" onClick={() => navigate("/cursos")}>
                  Voltar ao site
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Box>
      </Grid.Col>
    </Grid>
  );
}
