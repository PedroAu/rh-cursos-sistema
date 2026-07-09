import { motion, useReducedMotion } from "framer-motion";

type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  /**
   * Quando true, renderiza o marcador de barra gold antes do título
   * (padrão das seções do detalhe de curso em `curso-detalhe.html`).
   * Opt-in para não afetar as demais rotas.
   */
  accentBar?: boolean;
};

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "left",
  accentBar = false
}: SectionTitleProps) {
  const prefersReducedMotion = useReducedMotion();
  const className = align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl";

  const heading = (
    <h2 className="mt-4 flex max-w-4xl items-center gap-3 font-tk-display text-h2 font-bold leading-tight tracking-[var(--tk-tracking-display)] text-tk-ink">
      {accentBar ? (
        <span aria-hidden className="h-1 w-8 shrink-0 rounded-full bg-tk-accent" />
      ) : null}
      {title}
    </h2>
  );

  if (prefersReducedMotion) {
    return (
      <div className={className}>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        {heading}
        {description ? (
          <p className="mt-4 max-w-2xl text-sm leading-7 text-tk-ink-muted md:text-base">
            {description}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.35 }}
      className={className}
    >
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      {heading}
      {description ? (
        <p className="mt-4 max-w-2xl text-sm leading-7 text-tk-ink-muted md:text-base">
          {description}
        </p>
      ) : null}
    </motion.div>
  );
}
