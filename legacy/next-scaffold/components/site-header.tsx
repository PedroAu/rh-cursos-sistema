"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { navLinks } from "@/lib/site-data";

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 80);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className={`site-header ${isScrolled ? "scrolled" : ""}`}>
        <div className="container shell">
          <Link href="/" className="brand" aria-label="RH Cursos & Soluções">
            <span className="brand-mark">RH</span>
            <span className="brand-copy">
              <strong>RH Cursos</strong>
              <span>& Soluções</span>
            </span>
          </Link>

          <nav className="desktop-nav" aria-label="Navegação principal">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="actions">
            <Link className="button cta" href="/cursos">
              Inscreva-se
            </Link>
            <button
              className="menu-button"
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label="Abrir menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <aside id="mobile-nav" className={`mobile-drawer ${menuOpen ? "open" : ""}`}>
        <div className="drawer-panel">
          <div className="drawer-top">
            <span className="eyebrow">Navegação</span>
            <button type="button" onClick={() => setMenuOpen(false)} aria-label="Fechar menu">
              Fechar
            </button>
          </div>
          <nav className="mobile-nav">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link className="button" href="/cursos" onClick={() => setMenuOpen(false)}>
              Ver cursos
            </Link>
          </nav>
        </div>
      </aside>

      <style jsx>{`
        .site-header {
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(18px);
          transition: background 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
          border-bottom: 1px solid transparent;
        }

        .site-header.scrolled {
          background: rgba(27, 47, 94, 0.92);
          box-shadow: 0 14px 32px rgba(10, 16, 38, 0.22);
          border-color: rgba(255, 255, 255, 0.08);
        }

        .shell {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 84px;
          gap: 20px;
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: var(--color-primary);
          flex-shrink: 0;
        }

        .site-header.scrolled .brand,
        .site-header.scrolled .desktop-nav a {
          color: var(--color-white);
        }

        .brand-mark {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(140deg, var(--color-accent), #e0b14e);
          color: var(--color-primary);
          font-family: var(--font-merriweather), serif;
          font-weight: 900;
        }

        .brand-copy {
          display: flex;
          flex-direction: column;
          line-height: 1;
          gap: 4px;
        }

        .brand-copy strong {
          font-size: 1rem;
        }

        .brand-copy span {
          font-size: 0.82rem;
          opacity: 0.75;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .desktop-nav a {
          font-weight: 600;
          color: var(--color-primary);
          opacity: 0.88;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cta {
          min-width: 176px;
        }

        .menu-button {
          display: none;
          width: 48px;
          height: 48px;
          padding: 0;
          border: 1px solid rgba(27, 47, 94, 0.14);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.92);
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 4px;
        }

        .menu-button span {
          width: 18px;
          height: 2px;
          border-radius: 999px;
          background: var(--color-primary);
        }

        .mobile-drawer {
          position: fixed;
          inset: 0;
          z-index: 49;
          background: rgba(8, 14, 28, 0.38);
          opacity: 0;
          pointer-events: none;
          transition: opacity 180ms ease;
        }

        .mobile-drawer.open {
          opacity: 1;
          pointer-events: auto;
        }

        .drawer-panel {
          margin-left: auto;
          width: min(360px, calc(100% - 36px));
          height: 100%;
          background: linear-gradient(180deg, #ffffff, #f7f5f0);
          padding: 24px;
          transform: translateX(100%);
          transition: transform 220ms ease;
          box-shadow: -18px 0 40px rgba(27, 47, 94, 0.18);
        }

        .mobile-drawer.open .drawer-panel {
          transform: translateX(0);
        }

        .drawer-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 24px;
        }

        .drawer-top button {
          border: 0;
          background: transparent;
          color: var(--color-primary);
          font-weight: 700;
        }

        .mobile-nav {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .mobile-nav a:not(.button) {
          padding: 12px 0;
          border-bottom: 1px solid rgba(27, 47, 94, 0.08);
          color: var(--color-primary);
          font-weight: 700;
        }

        @media (max-width: 1023px) {
          .desktop-nav,
          .cta {
            display: none;
          }

          .menu-button {
            display: inline-flex;
          }
        }
      `}</style>
    </>
  );
}
