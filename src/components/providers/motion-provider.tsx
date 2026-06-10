"use client";

import { MotionConfig, MotionGlobalConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Faz o framer-motion respeitar `prefers-reduced-motion` do sistema.
 *
 * - `MotionConfig reducedMotion="user"` desativa animações de transform/layout,
 *   mas o framer preserva fades de opacity por design.
 * - `MotionGlobalConfig.skipAnimations` completa TODA animação instantaneamente
 *   (inclusive opacity e `transition` explícitos) — necessário porque o bloco
 *   CSS de reduced motion em globals.css não alcança animações inline/WAAPI.
 *   Sem isso, a medição de contraste (axe) captura cores mescladas no meio
 *   dos fades de entrada (as 70 falsas violações do baseline da Story 1.1).
 *
 * A sincronização vive no escopo do módulo (não no render, que deve ser puro;
 * não em useEffect, que rodaria DEPOIS das animações de mount partirem): o
 * chunk carrega antes da hidratação, então o flag vale antes de qualquer
 * animação iniciar.
 */
if (typeof window !== "undefined") {
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const syncSkipAnimations = () => {
    MotionGlobalConfig.skipAnimations = reducedMotionQuery.matches;
  };
  syncSkipAnimations();
  reducedMotionQuery.addEventListener("change", syncSkipAnimations);
}

export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
