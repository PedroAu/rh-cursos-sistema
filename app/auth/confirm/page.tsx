"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { BarePageShell } from "@/components/next-page-shell";
import { useNavigate } from "@/lib/router-compat";

function ConfirmContent() {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");

    if (code || tokenHash) {
      void (async () => {
        try {
          const response = await fetch("/api/auth/password-recovery/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...(code ? { code } : { tokenHash }) }),
          });
          if (!response.ok) throw new Error("confirm");
          navigate("/recuperar-senha?mode=update");
        } catch {
          setError("Não foi possível validar o link. Solicite uma nova recuperação.");
        }
      })();
      return;
    }

    if (!accessToken || !refreshToken) {
      setError("Link de recuperação inválido ou expirado.");
      return;
    }

    void (async () => {
      try {
        const response = await fetch("/api/auth/password-recovery/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken, refreshToken }),
        });
        if (!response.ok) throw new Error("session");
        window.history.replaceState(null, "", "/auth/confirm");
        navigate("/recuperar-senha?mode=update");
      } catch {
        setError("Não foi possível validar o link. Solicite uma nova recuperação.");
      }
    })();
  }, [navigate, searchParams]);

  return (
    <BarePageShell>
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <p role={error ? "alert" : "status"} className="text-center text-body-small text-tk-ink-muted">
          {error ?? "Validando seu link de recuperação…"}
        </p>
      </main>
    </BarePageShell>
  );
}

export default function Page() {
  return <Suspense fallback={<main className="flex min-h-screen items-center justify-center px-6 py-12" /> }><ConfirmContent /></Suspense>;
}
