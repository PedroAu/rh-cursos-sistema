import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  if (/confirm|conclu|ativo|convertido|publicado|abertas/i.test(status)) {
    return <Badge variant="success">{status}</Badge>;
  }

  if (/poucas|aguardando|pendente|rascunho|em breve|atendimento/i.test(status)) {
    return <Badge variant="warning">{status}</Badge>;
  }

  if (/cancel|encerr|esgot|perdido|inativo|arquivado/i.test(status)) {
    return <Badge variant="danger">{status}</Badge>;
  }

  return <Badge variant="muted">{status}</Badge>;
}
