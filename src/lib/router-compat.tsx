"use client";

"use client";

import NextLink from "next/link";
import { useParams as useNextParams, usePathname, useRouter } from "next/navigation";
import { createElement, useCallback, useEffect, useState, type AnchorHTMLAttributes, type ReactNode } from "react";

const NAVIGATION_STATE_STORAGE_KEY = "__router_compat_navigation_state__";

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className"> & {
  to: string;
  href?: string;
  children?: ReactNode;
  end?: boolean;
  className?: string | ((props: { isActive: boolean }) => string);
  state?: unknown;
};

export function Link({ to, href, className, children, ...props }: LinkProps) {
  const resolvedClassName = typeof className === "function" ? undefined : className;

  return (
    <NextLink href={href ?? to} className={resolvedClassName} {...props}>
      {children}
    </NextLink>
  );
}

export function NavLink({ to, href, className, children, end, ...props }: LinkProps) {
  const pathname = usePathname();
  const target = href ?? to;
  const isActive = end ? pathname === target : pathname === target || pathname.startsWith(`${target}/`);
  const resolvedClassName = typeof className === "function" ? className({ isActive }) : className;

  return (
    <NextLink href={target} className={resolvedClassName} {...props}>
      {children}
    </NextLink>
  );
}

export function Outlet() {
  return null;
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const router = useRouter();

  if (typeof window !== "undefined") {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }

  return null;
}

export function useNavigate() {
  const router = useRouter();

  return (to: string, options?: { replace?: boolean; state?: unknown }) => {
    if (options?.state && typeof window !== "undefined") {
      window.sessionStorage.setItem(
        NAVIGATION_STATE_STORAGE_KEY,
        JSON.stringify({
          to,
          state: options.state
        })
      );
    }

    if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };
}

export function useLocation() {
  const pathname = usePathname();
  const [params] = useSearchParams();
  const search = params.toString() ? `?${params.toString()}` : "";
  let state = typeof window !== "undefined" ? window.history.state : null;

  if (typeof window !== "undefined") {
    const storedValue = window.sessionStorage.getItem(NAVIGATION_STATE_STORAGE_KEY);

    if (storedValue) {
      try {
        const parsed = JSON.parse(storedValue) as { to?: string; state?: unknown };
        const currentPath = `${pathname}${search}`;

        if (parsed.to === currentPath || parsed.to === pathname) {
          state = parsed.state ?? null;
        }
      } catch {
        // Mantém o state atual caso o payload armazenado esteja inválido.
      }
    }
  }

  return { pathname, search, state };
}

export function useParams() {
  return useNextParams<Record<string, string | string[]>>();
}

export function useSearchParams(): [URLSearchParams, (next: URLSearchParams | Record<string, string>) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const [current, setCurrent] = useState(() => new URLSearchParams());

  useEffect(() => {
    setCurrent(new URLSearchParams(window.location.search));
  }, [pathname]);

  const setParams = useCallback((next: URLSearchParams | Record<string, string>) => {
    const normalized = next instanceof URLSearchParams ? next : new URLSearchParams(next);
    const query = normalized.toString();
    setCurrent(normalized);
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router]);

  return [current, setParams];
}

export function BrowserRouter({ children }: { children: ReactNode }) {
  return createElement("div", null, children);
}

export function Routes({ children }: { children: ReactNode }) {
  return createElement("div", null, children);
}

export function Route() {
  return null;
}
