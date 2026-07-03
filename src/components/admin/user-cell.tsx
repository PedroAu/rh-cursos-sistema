import { getInitials } from "@/lib/get-initials";

/**
 * Célula de usuário com avatar de iniciais (não dependente de imagem externa)
 * + nome e e-mail empilhados, como nos protótipos de cadastros.
 */
export function UserCell({ name, email }: { name: string; email: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-tk-brand/10 text-xs font-semibold text-tk-brand"
        aria-hidden="true"
      >
        {getInitials(name)}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        <p className="truncate text-xs text-label-secondary">{email}</p>
      </div>
    </div>
  );
}
