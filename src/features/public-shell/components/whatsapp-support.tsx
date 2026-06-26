"use client";

import { useState } from "react";
import { Button, Group, Modal, SimpleGrid, Stack, Text, Textarea, ThemeIcon, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MessageCircle, PhoneCall } from "lucide-react";
import { toast } from "sonner";

import { company } from "@/lib/company";
import { trackEvent } from "@/lib/analytics";
import { useAppStore } from "@/lib/app-store";

const supportOptions = [
  "Quero saber sobre cursos",
  "Quero orçamento para empresa",
  "Quero turma in company",
  "Quero ajuda com inscrição",
  "Quero informações sobre pagamento"
];

export function WhatsAppSupport() {
  const { createLead } = useAppStore();
  const [opened, { open, close }] = useDisclosure(false);
  const [message, setMessage] = useState("");

  return (
    <>
      <UnstyledButton
        id="atendimento"
        onClick={open}
        aria-label="Abrir atendimento"
        className="fixed bottom-5 right-5 z-40"
      >
        <ThemeIcon radius="xl" size={58} color="rhGold" c="#0a2038" style={{ boxShadow: "0 16px 36px rgba(10, 32, 56, 0.2)" }}>
          <MessageCircle className="h-6 w-6" />
        </ThemeIcon>
      </UnstyledButton>

      <Modal
        opened={opened}
        onClose={close}
        keepMounted={false}
        title="Atendimento rápido"
        centered
        size="lg"
        styles={{ body: { paddingTop: 0 } }}
      >
        <Stack gap="md">
          <Text c="dimmed">
            Escolha um assunto inicial ou escreva sua solicitação para a equipe de atendimento.
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            {supportOptions.map((option) => (
              <UnstyledButton
                key={option}
                onClick={() => setMessage(option)}
                style={{
                  border: "1px solid var(--mantine-color-gray-3)",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  background: "#f8fafc",
                  fontSize: "0.92rem",
                  fontWeight: 600,
                  textAlign: "left"
                }}
              >
                {option}
              </UnstyledButton>
            ))}
          </SimpleGrid>

          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Escreva sua mensagem para a equipe de atendimento"
            minRows={4}
            autosize
          />

          <Group grow>
            <Button
              color="rhBlue"
              leftSection={<PhoneCall className="h-4 w-4" />}
              onClick={async () => {
                try {
                  await createLead({
                    name: "Lead do atendimento",
                    email: company.email,
                    phone: company.phones.whatsapp,
                    courseInterest: "Atendimento geral",
                    origin: "WhatsApp",
                    message: message || "Solicitação enviada pelo atendimento rápido"
                  });
                  trackEvent("lead_enviado", { origin: "atendimento_rapido" });
                  toast.success("A equipe vai retornar pelo canal institucional.");
                  close();
                  setMessage("");
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Não foi possível enviar a solicitação.");
                }
              }}
            >
              Enviar solicitação
            </Button>
            <Button component="a" href={company.links.whatsapp} target="_blank" rel="noreferrer" variant="light" color="rhBlue">
              Ir para WhatsApp
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
