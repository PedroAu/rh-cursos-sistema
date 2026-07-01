import React from "react";

type TrustKeithHeroCardProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
};

const shellStyle: React.CSSProperties = {
  background:
    "linear-gradient(135deg, var(--tk-color-surface) 0%, var(--tk-color-panel) 52%, var(--tk-color-accent-soft) 100%)",
  border: "1px solid var(--tk-color-border)",
  borderRadius: "var(--tk-radius-xl)",
  boxShadow: "var(--tk-shadow-glass)",
  color: "var(--tk-color-text)",
  overflow: "hidden"
};

const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: "var(--tk-color-brand)",
  border: "1px solid var(--tk-color-brand)",
  borderRadius: "var(--tk-radius-button)",
  color: "#ffffff",
  cursor: "pointer",
  fontFamily: "var(--tk-font-body)",
  fontSize: "var(--tk-text-button-size)",
  fontWeight: 500,
  padding: "1rem 1.25rem",
  transition: "background-color var(--tk-duration-base) var(--tk-ease-standard)"
};

const secondaryButtonStyle: React.CSSProperties = {
  backgroundColor: "rgba(0, 0, 0, 0.05)",
  border: "1px solid var(--tk-color-border)",
  borderRadius: "var(--tk-radius-button)",
  color: "var(--tk-color-text)",
  cursor: "pointer",
  fontFamily: "var(--tk-font-body)",
  fontSize: "var(--tk-text-button-size)",
  fontWeight: 500,
  padding: "1rem 1.25rem"
};

export function TrustKeithHeroCard({
  eyebrow = "Product strategy for leaders",
  title = "Clarify the hard decision before your team spends another sprint on the wrong one.",
  description = "Use this as a branded consultation or lead-capture hero. The visual system keeps Trust Keith's roomy layout, serif-forward hierarchy, soft surfaces, and blue primary CTA.",
  primaryCtaLabel = "Book a strategy call",
  secondaryCtaLabel = "See how it works"
}: TrustKeithHeroCardProps) {
  return (
    <section style={shellStyle}>
      <div
        style={{
          display: "grid",
          gap: "var(--tk-space-xl)",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 0.9fr)",
          padding: "clamp(1.5rem, 4vw, 3rem)"
        }}
      >
        <div style={{ display: "grid", gap: "var(--tk-space-lg)" }}>
          <div
            style={{
              alignItems: "center",
              color: "var(--tk-color-text-muted)",
              display: "inline-flex",
              fontFamily: "var(--tk-font-body)",
              fontSize: "var(--tk-text-caption-size)",
              fontWeight: 500,
              gap: "0.5rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase"
            }}
          >
            <span
              aria-hidden="true"
              style={{
                backgroundColor: "var(--tk-color-brand)",
                borderRadius: "999px",
                display: "inline-block",
                height: "0.5rem",
                width: "0.5rem"
              }}
            />
            {eyebrow}
          </div>

          <div style={{ display: "grid", gap: "var(--tk-space-md)", maxWidth: "38rem" }}>
            <h2
              style={{
                fontFamily: "var(--tk-font-display)",
                fontSize: "clamp(2.5rem, 5vw, var(--tk-text-display-hero-size))",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                margin: 0
              }}
            >
              {title}
            </h2>

            <p
              style={{
                color: "var(--tk-color-text-muted)",
                fontFamily: "var(--tk-font-heading)",
                fontSize: "var(--tk-text-subheading-size)",
                lineHeight: 1.4,
                margin: 0
              }}
            >
              {description}
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            <button style={primaryButtonStyle} type="button">
              {primaryCtaLabel}
            </button>
            <button style={secondaryButtonStyle} type="button">
              {secondaryCtaLabel}
            </button>
          </div>
        </div>

        <aside
          style={{
            alignSelf: "stretch",
            backgroundColor: "rgba(255, 255, 255, 0.92)",
            border: "1px solid var(--tk-color-border)",
            borderRadius: "var(--tk-radius-xl)",
            boxShadow: "var(--tk-shadow-glass)",
            display: "grid",
            gap: "var(--tk-space-lg)",
            padding: "var(--tk-space-xl)"
          }}
        >
          <div style={{ display: "grid", gap: "0.5rem" }}>
            <span
              style={{
                color: "var(--tk-color-text-muted)",
                fontFamily: "var(--tk-font-body)",
                fontSize: "var(--tk-text-caption-size)",
                textTransform: "uppercase"
              }}
            >
              Fit
            </span>
            <strong
              style={{
                fontFamily: "var(--tk-font-display)",
                fontSize: "var(--tk-text-section-heading-size)",
                lineHeight: 1.2
              }}
            >
              Advisory, positioning, and founder-led service pages
            </strong>
          </div>

          <ul
            style={{
              display: "grid",
              gap: "0.875rem",
              listStyle: "none",
              margin: 0,
              padding: 0
            }}
          >
            {[
              "Primary CTA leans on Keith blue and compact button corners.",
              "Roomy card spacing mirrors the source layout density.",
              "Display serif + editorial subheading keeps the extracted tone."
            ].map((item) => (
              <li
                key={item}
                style={{
                  alignItems: "flex-start",
                  color: "var(--tk-color-text)",
                  display: "flex",
                  fontFamily: "var(--tk-font-body)",
                  fontSize: "var(--tk-text-body-small-size)",
                  gap: "0.75rem",
                  lineHeight: 1.5
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    backgroundColor: "var(--tk-color-accent-soft)",
                    borderRadius: "999px",
                    color: "var(--tk-color-accent-strong)",
                    display: "inline-flex",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    height: "1.5rem",
                    justifyContent: "center",
                    marginTop: "0.125rem",
                    minWidth: "1.5rem",
                    width: "1.5rem"
                  }}
                >
                  +
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}

export default TrustKeithHeroCard;
