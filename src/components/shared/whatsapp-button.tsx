import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

type WhatsAppButtonProps = {
  href: string;
};

export function WhatsAppButton({ href }: WhatsAppButtonProps) {
  return (
    <Button
      asChild
      className="fixed bottom-6 right-6 z-60 size-16 rounded-full shadow-2xl"
      size="icon"
      variant="whatsapp"
    >
      <a
        aria-label="Falar pelo WhatsApp"
        href={href}
        rel="noopener noreferrer"
        target="_blank"
        title="Falar pelo WhatsApp"
      >
        <MessageCircle className="size-8" aria-hidden="true" />
      </a>
    </Button>
  );
}
