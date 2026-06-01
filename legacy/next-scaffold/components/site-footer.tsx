"use client";

import Link from "next/link";

import { institutionalLinks, navLinks } from "@/lib/site-data";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="stack-md">
          <div>
            <div className="footer-brand">RH Cursos & Soluções</div>
            <p className="muted">
              Desde 2007, formando quem transforma. Capacitação com linguagem clara,
              aplicação prática e foco em resultado.
            </p>
          </div>
          <div className="socials">
            <a href="https://wa.me/5561999999999" target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <a href="mailto:contato@rhcursos.com.br">Email</a>
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </div>
        </div>

        <div>
          <h3>Navegação</h3>
          <ul>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Contato</h3>
          <ul>
            <li>
              <a href="https://wa.me/5561999999999" target="_blank" rel="noreferrer">
                +55 (61) 99999-9999
              </a>
            </li>
            <li>
              <a href="mailto:contato@rhcursos.com.br">contato@rhcursos.com.br</a>
            </li>
            <li>Brasília, DF</li>
            <li>Resposta comercial em até 24h úteis</li>
          </ul>
        </div>

        <div>
          <h3>Legal & acesso</h3>
          <ul>
            {institutionalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>RH Cursos & Soluções • Brasília • 2007–2026</span>
        <span>Site estruturado para SEO, conversão e evolução por CMS/headless.</span>
      </div>

      <style jsx>{`
        .footer {
          padding: 72px 0 28px;
          background: linear-gradient(180deg, #102043 0%, #08132d 100%);
          color: var(--color-white);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr;
          gap: 28px;
        }

        .footer-brand {
          font-family: var(--font-merriweather), serif;
          font-size: 1.5rem;
          margin-bottom: 12px;
        }

        h3 {
          margin: 0 0 14px;
          font-family: var(--font-merriweather), serif;
          font-size: 1rem;
        }

        ul {
          margin: 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 10px;
        }

        li,
        a {
          color: rgba(255, 255, 255, 0.76);
        }

        .socials {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .socials a {
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
        }

        .footer-bottom {
          margin-top: 30px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          justify-content: space-between;
          gap: 20px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.92rem;
        }

        @media (max-width: 1199px) {
          .footer-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .footer-bottom {
            flex-direction: column;
          }
        }

        @media (max-width: 767px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
}
