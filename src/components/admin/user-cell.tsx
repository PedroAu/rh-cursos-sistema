function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Célula de usuário com avatar de iniciais (não dependente de imagem externa)
 * + nome e e-mail empilhados, como nos protótipos de cadastros.
 */
export function UserCell({ name, email }: { name: string; email: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
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
