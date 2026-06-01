"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "rhcursos-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!window.localStorage.getItem(STORAGE_KEY));
  }, []);

  const save = (value: "accepted" | "preferences") => {
    window.localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <>
      <aside className="cookie-banner" aria-live="polite">
        <div className="stack-sm">
          <strong>Consentimento LGPD</strong>
          <p>
            Este site usa cookies para melhorar a navegação e ativar métricas somente
            após consentimento.
          </p>
        </div>

        <div className="actions">
          <button type="button" className="button-outline" onClick={() => save("preferences")}>
            Gerenciar preferências
          </button>
          <button type="button" className="button" onClick={() => save("accepted")}>
            Aceitar
          </button>
        </div>
      </aside>

      <style jsx>{`
        .cookie-banner {
          position: fixed;
          left: 18px;
          right: 18px;
          bottom: 18px;
          z-index: 60;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 18px;
          padding: 18px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(27, 47, 94, 0.08);
          box-shadow: var(--shadow-card);
        }

        p {
          margin: 0;
          max-width: 640px;
          line-height: 1.6;
        }

        .actions {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }

        @media (max-width: 767px) {
          .cookie-banner,
          .actions {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </>
  );
}
