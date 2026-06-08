"use client";

import { useEffect, useState, type ReactNode } from "react";

import { useNavigate } from "@/lib/router-compat";
import { useAppStore } from "@/lib/app-store";

/**
 * Guard de sessão para o painel admin no export estático.
 *
 * Como o HTML do /admin é servido publicamente pela Locaweb, esta é a barreira
 * de UX: se não houver sessão admin após a hidratação, redireciona para /login.
 * A proteção real dos DADOS permanece na Edge Function `admin-resources`
 * (token HMAC) — este guard apenas evita exibir a interface sem sessão.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { currentSession } = useAppStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!currentSession || currentSession.role !== "admin") {
      navigate("/login?status=required&next=/admin");
      return;
    }
    setChecked(true);
  }, [currentSession, navigate]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}
