import { useState } from "react";
import { Info } from "lucide-react";
import { useNavigate } from "@/lib/router-compat";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/app-store";
import type { UserRole } from "@/types";

const roleOptions: Array<{ value: Exclude<UserRole, "lead">; label: string }> = [
  { value: "student", label: "Aluno" },
  { value: "instructor", label: "Instrutor" },
  { value: "admin", label: "Admin" }
];

export function LoginPage() {
  const navigate = useNavigate();
  const { demoAccessList, setSession } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Exclude<UserRole, "lead">>("student");

  const autofill = (nextRole: Exclude<UserRole, "lead">) => {
    const access = demoAccessList.find((item) => item.role === nextRole);
    if (!access) return;
    setRole(nextRole);
    setEmail(access.email);
    setPassword(access.password);
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      toast.error("Preencha e-mail e senha para continuar.");
      return;
    }

    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ role, email, password })
    });

    if (!response.ok) {
      toast.error("Credenciais inválidas para este perfil.");
      return;
    }

    const data = (await response.json()) as {
      session: { role: Exclude<UserRole, "lead">; email: string; name: string };
    };

    setSession(data.session);

    navigate(data.session.role === "student" ? "/aluno" : data.session.role === "instructor" ? "/instrutor" : "/admin");
  };

  return (
    <section className="page-section">
      <div className="container grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="hidden overflow-hidden rounded-xl border border-slate-200 shadow-card lg:block">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7DebIlmzv9LgUlHDHU5X_rejTalnViMi8_wOJ-MInrVZ6DzGOOydKcGVECWGh37BP50Ve2zNK-Wtthr56fd8BmP_fe347liuNsVSXTIdNDqvQWwWAS016wCanv4rV9rpliUnssELG4jRvJ-2YROMrG5WzNlAdo9ojV_B-ynuQQn_HdUHagoUOB_vlhxy1Ud-u3cnvbGaMW9M9m8L7cY9-E3eZk3beW6JoKIdKNNLX9WWb96WN__ksDLNe0EV27a59B81x1SkWpgE"
            alt="Aluno em ambiente profissional"
            className="h-[680px] w-full object-cover"
          />
        </div>
        <Card className="w-full">
          <CardContent className="space-y-6 p-8">
            <div className="space-y-3">
              <span className="eyebrow">Portal do aluno</span>
              <h1 className="text-4xl font-extrabold text-primary">Acesse sua trilha profissional</h1>
              <p className="text-base leading-7 text-muted-foreground">
                Entre para acompanhar cursos, materiais, certificados e dados da sua inscricao.
              </p>
            </div>

            <div className="rounded-lg bg-secondary/60 p-4 text-sm text-primary">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-4 w-4" />
                <p>Ambiente demonstrativo com acessos de teste para aluno, instrutor e administracao.</p>
              </div>
            </div>

            <div className="grid gap-3">
              {demoAccessList
                .filter((item) => item.role === "student" || item.role === "admin")
                .map((access) => (
                  <button
                    key={access.role}
                    type="button"
                    onClick={() => autofill(access.role)}
                    className="rounded-lg border border-border bg-white p-4 text-left transition hover:border-accent hover:bg-secondary/40"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          Login de teste: {access.role === "student" ? "Aluno" : "Admin"}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">{access.description}</div>
                      </div>
                      <div className="text-xs leading-6 text-primary">
                        <div>E-mail: {access.email}</div>
                        <div>Senha: {access.password}</div>
                      </div>
                    </div>
                  </button>
                ))}
            </div>

            <div className="grid gap-4">
              <Input placeholder="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} />
              <Input type="password" placeholder="Senha" value={password} onChange={(event) => setPassword(event.target.value)} />
              <div className="grid gap-3 sm:grid-cols-3">
                {roleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value)}
                    className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                      role === option.value ? "border-primary bg-primary text-white" : "border-border bg-muted text-muted-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={handleSubmit}>Entrar</Button>
              <Button variant="outline" onClick={() => toast.success("Link de recuperação simulado enviado.")}>
                Esqueci minha senha
              </Button>
              <Button variant="ghost" onClick={() => navigate("/cursos")}>
                Ainda não sou aluno
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
