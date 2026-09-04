"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";

import { ANALYTICS_CONSENT_STORAGE_KEY, GA_MEASUREMENT_ID } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

type ConsentChoice = "granted" | "denied" | null;

/** Carrega GA4 somente após consentimento explícito para métricas. */
export function AnalyticsConsent() {
  const [choice, setChoice] = useState<ConsentChoice>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
      if (stored === "granted" || stored === "denied") setChoice(stored);
    } catch {
      setChoice("denied");
    }
  }, []);

  function choose(nextChoice: Exclude<ConsentChoice, null>) {
    try {
      window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, nextChoice);
    } catch {
      nextChoice = "denied";
    }
    setChoice(nextChoice);
  }

  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      {choice === "granted" ? <GoogleAnalytics gaId={GA_MEASUREMENT_ID} /> : null}
      {choice === null ? (
        <aside
          aria-label="Preferências de privacidade"
          className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-3xl flex-col gap-4 rounded-tk-card border border-tk-line bg-tk-surface p-5 shadow-tk-card sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="max-w-2xl text-sm leading-6 text-tk-ink-muted">
            Usamos métricas agregadas do Google Analytics para melhorar o site. Você pode aceitar ou recusar esse uso não essencial.
          </p>
          <div className="flex shrink-0 gap-3">
            <Button type="button" variant="outline" size="sm" onClick={() => choose("denied")}>
              Recusar
            </Button>
            <Button type="button" size="sm" onClick={() => choose("granted")}>
              Aceitar métricas
            </Button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
