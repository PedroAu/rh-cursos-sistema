import { ExternalLink, FileText, Globe2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SITE_PAGES } from "@/features/admin/pages/model/site-pages";

export function AdminPagesPage() {
  return (
    <div className="min-w-0 space-y-8">
      <header className="max-w-3xl space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-tk-brand">Páginas do site</h1>
        <p className="text-base leading-7 text-tk-ink-muted md:text-lg">
          Consulte as páginas públicas existentes e abra cada endereço para revisar o conteúdo publicado.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl border border-tk-line bg-tk-surface p-8 shadow-tk-card">
          <div className="flex items-start justify-between gap-4">
            <p className="font-extrabold text-tk-ink-muted">Páginas públicas</p>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-tk-accent-soft text-tk-brand">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-10 text-[2.2rem] font-extrabold text-tk-ink">{SITE_PAGES.length}</p>
          <p className="mt-1.5 font-semibold text-tk-success">Rotas reais disponíveis no site.</p>
        </section>

        <section className="rounded-3xl border border-tk-line bg-tk-surface p-8 shadow-tk-card">
          <div className="flex items-start justify-between gap-4">
            <p className="font-extrabold text-tk-ink-muted">Modo de acesso</p>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-tk-accent-soft text-tk-brand">
              <Globe2 className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-10 text-[2.2rem] font-extrabold text-tk-ink">Leitura</p>
          <p className="mt-1.5 font-semibold text-tk-success">Sem edição simulada ou conteúdo fictício.</p>
        </section>
      </div>

      <section className="min-w-0 overflow-hidden rounded-3xl border border-tk-line bg-tk-surface p-6 shadow-tk-card">
        <div className="mb-6 space-y-1">
          <h2 className="text-2xl font-semibold text-tk-brand">Inventário de páginas</h2>
          <p className="text-sm leading-6 text-tk-ink-muted">
            A gestão de conteúdo continua nos fluxos que já possuem persistência, como Blog e Cursos.
          </p>
        </div>

        <Table aria-label="Páginas públicas do site" className="hidden min-w-full sm:table">
          <TableHeader className="bg-tk-surface-2">
            <TableRow className="hover:bg-tk-surface-2">
              <TableHead>Página</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Finalidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SITE_PAGES.map((page) => (
              <TableRow key={page.path}>
                <TableCell className="font-semibold text-tk-ink">{page.title}</TableCell>
                <TableCell className="font-mono text-xs text-tk-ink-muted">{page.path}</TableCell>
                <TableCell>{page.purpose}</TableCell>
                <TableCell><Badge variant="success">Publicada</Badge></TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm">
                    <a href={page.path} target="_blank" rel="noreferrer">
                      Abrir <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only"> {page.title}</span>
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="grid gap-3 sm:hidden" aria-label="Páginas públicas do site">
          {SITE_PAGES.map((page) => (
            <article key={page.path} className="min-w-0 rounded-2xl border border-tk-line bg-tk-surface-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-tk-ink">{page.title}</h3>
                  <p className="mt-1 break-all font-mono text-xs text-tk-ink-muted">{page.path}</p>
                </div>
                <Badge variant="success">Publicada</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-tk-ink-muted">{page.purpose}</p>
              <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                <a href={page.path} target="_blank" rel="noreferrer">
                  Abrir {page.title} <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
