import { BookOpen, CalendarDays, Home, LockKeyhole, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "@/lib/router-compat";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SearchInput } from "@/components/common/search-input";
import { useAppStore } from "@/lib/app-store";
import { useHotkey } from "@/hooks/use-hotkey";

const baseRoutes = [
  { label: "Home", href: "/", icon: Home },
  { label: "Cursos", href: "/cursos", icon: BookOpen },
  { label: "Agenda", href: "/agenda", icon: CalendarDays },
  { label: "Blog", href: "/blog", icon: Search },
  { label: "Admin", href: "/login", icon: LockKeyhole }
];

export function CommandPalette() {
  const navigate = useNavigate();
  const { courses } = useAppStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useHotkey(
    (event) => (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k",
    (event) => {
      event.preventDefault();
      setOpen((current) => !current);
    }
  );

  const results = useMemo(() => {
    const items = [
      ...baseRoutes,
      ...courses.slice(0, 10).map((course) => ({
        label: course.title,
        href: `/cursos/${course.slug}`,
        icon: BookOpen
      }))
    ];

    return items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));
  }, [courses, query]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Busca rápida</DialogTitle>
        </DialogHeader>
        <SearchInput
          autoFocus
          placeholder="Procure páginas, cursos ou atalhos..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="mt-4 grid max-h-[420px] gap-2 overflow-y-auto">
          {results.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={`${item.href}-${item.label}`}
                type="button"
                onClick={() => {
                  navigate(item.href);
                  setOpen(false);
                  setQuery("");
                }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 text-left transition hover:border-primary/30 hover:bg-secondary"
              >
                <div className="rounded-full bg-secondary p-2 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-sm font-medium">{item.label}</div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
