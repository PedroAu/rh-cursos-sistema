"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  label
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setCount(value);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) {
          return;
        }

        const start = performance.now();
        const duration = 1200;

        const animate = (timestamp: number) => {
          const progress = Math.min((timestamp - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(value * eased));

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
        observer.disconnect();
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="surface-card counter-card">
      <div className="value">
        {prefix}
        {count}
        {suffix}
      </div>
      <p>{label}</p>
      <style jsx>{`
        .counter-card {
          padding: 28px 24px;
          border-top: 4px solid var(--color-accent);
        }

        .value {
          margin-bottom: 12px;
          color: var(--color-accent);
          font-family: var(--font-merriweather), serif;
          font-size: clamp(2.4rem, 5vw, 3.4rem);
          font-weight: 900;
        }

        p {
          margin: 0;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}
