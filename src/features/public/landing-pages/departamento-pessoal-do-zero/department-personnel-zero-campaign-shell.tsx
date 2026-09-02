import type { ReactNode } from "react";

export function DepartmentPersonnelZeroCampaignShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fff7ea]">
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>

      <header className="bg-[#fff7ea]">
        <div className="container flex h-[76px] items-center justify-between">
          <p className="rounded-[10px] bg-[#111820] px-4 py-2 text-sm font-black uppercase tracking-[0.08em] text-white sm:text-base">
            DP do Zero
          </p>
          <span className="hidden text-xs font-black uppercase tracking-[0.12em] text-[#314255] sm:block">
            Aprenda. Pratique. Demonstre.
          </span>
        </div>
      </header>

      <main id="main-content">{children}</main>

      <footer className="bg-[#111820] py-8">
        <div className="container flex flex-col items-center justify-between gap-3 text-center text-sm font-semibold text-white/70 sm:flex-row sm:text-left">
          <span>© 2026 Departamento Pessoal do Zero.</span>
          <span className="text-xs font-black uppercase tracking-[0.1em] text-[#ffd34e]">
            Formação prática para começar
          </span>
        </div>
      </footer>
    </div>
  );
}
