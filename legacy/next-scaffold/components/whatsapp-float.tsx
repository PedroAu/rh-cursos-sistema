"use client";

export function WhatsAppFloat() {
  return (
    <>
      <a
        className="wa-float"
        href="https://wa.me/5561999999999?text=Quero%20falar%20com%20um%20especialista%20da%20RH%20Cursos"
        target="_blank"
        rel="noreferrer"
        aria-label="Fale conosco pelo WhatsApp"
      >
        <span>WhatsApp</span>
      </a>

      <style jsx>{`
        .wa-float {
          position: fixed;
          right: 18px;
          bottom: 18px;
          z-index: 61;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 128px;
          min-height: 56px;
          padding: 0 18px;
          border-radius: 999px;
          background: #25d366;
          color: #083c21;
          font-weight: 800;
          box-shadow: 0 18px 36px rgba(37, 211, 102, 0.24);
        }

        .wa-float::before {
          content: "Fale conosco";
          position: absolute;
          right: calc(100% + 10px);
          padding: 8px 10px;
          border-radius: 999px;
          background: rgba(8, 19, 45, 0.9);
          color: var(--color-white);
          white-space: nowrap;
          font-size: 0.8rem;
          opacity: 0;
          transform: translateX(4px);
          transition: opacity 180ms ease, transform 180ms ease;
          pointer-events: none;
        }

        .wa-float:hover::before {
          opacity: 1;
          transform: translateX(0);
        }
      `}</style>
    </>
  );
}
