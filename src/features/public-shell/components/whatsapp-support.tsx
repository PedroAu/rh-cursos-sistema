"use client";

import { MessageCircle, PhoneCall } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { company } from "@/lib/company";
import { useAppStore } from "@/lib/app-store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const supportOptions = [
  "Quero saber sobre cursos",
  "Quero orçamento para empresa",
  "Quero turma in company",
  "Quero ajuda com inscrição",
  "Quero informações sobre pagamento"
];

export function WhatsAppSupport() {
  const { createLead } = useAppStore();
  const [message, setMessage] = useState("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          id="atendimento"
          className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white shadow-card transition hover:-translate-y-0.5 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Abrir atendimento"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Atendimento rápido</DialogTitle>
          <DialogDescription>
            Escolha um assunto inicial ou escreva sua solicitação para a equipe de atendimento.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {supportOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMessage(option)}
                className="rounded-xl border border-border bg-muted px-4 py-3 text-left text-sm font-medium hover:border-accent hover:bg-secondary/60"
              >
                {option}
              </button>
            ))}
          </div>
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Escreva sua mensagem para a equipe de atendimento"
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
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
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Não foi possível enviar a solicitação.");
                }
              }}
            >
              <PhoneCall className="h-4 w-4" />
              Enviar solicitação
            </Button>
            <Button asChild variant="outline">
              <a href={company.links.whatsapp} target="_blank" rel="noreferrer">
                Ir para WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
