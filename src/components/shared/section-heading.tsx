import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  inverse?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  inverse = false,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "space-y-3",
        centered ? "mx-auto max-w-content-lg text-center" : "max-w-content text-left",
      )}
    >
      <p
        className={cn(
          "text-sm font-extrabold uppercase tracking-[0.08em]",
          inverse ? "text-brand-gold" : "text-brand-navy-700",
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={cn(
          "text-balance font-heading text-3xl font-bold leading-tight md:text-4xl",
          inverse ? "text-white" : "text-foreground",
          centered ? "mx-auto max-w-content" : "max-w-content-sm",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "text-pretty text-lg leading-8",
            inverse ? "text-white/75" : "text-muted-foreground",
            centered ? "mx-auto max-w-content" : "max-w-content-sm",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
