import { useState } from "react";
import { Info, Copy, Check } from "lucide-react";
import { useNavigate } from "@/lib/router-compat";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/app-store";
import { invokeFunction, isFunctionsConfigured } from "@/lib/supabase/functions-client";
import { setSessionToken } from "@/lib/supabase/session-token";

export function LoginPage() {
  const navigate = useNavigate();
  const { demoAccessList, setSession } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const autofill = () => {
    const access = demoAccessList.find((item) => item.role === "admin");
    if (!access) return;
    setEmail(access.email);
    setPassword(access.password);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copiado para a área de transferência");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      toast.error("Preencha e-mail e senha para continuar.");
      return;
    }

    if (!isFunctionsConfigured) {
      toast.error("Autenticação indisponível: Supabase Functions não configurado.");
      return;
    }

    const response = await invokeFunction("auth-session", {
      body: { role: "admin", email, password }
    });

    if (!response.ok) {
      toast.error("Credenciais inválidas para este perfil.");
      return;
    }

    const data = (await response.json()) as {
      session: { role: "admin"; email: string; name: string };
      token: string;
    };

    setSessionToken(data.token);
    setSession(data.session);

    navigate("/admin");
  };

  return (
    <section className="page-section">
      <div className="container grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="hidden overflow-hidden rounded-xl border border-slate-200 shadow-card lg:block">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7DebIlmzv9LgUlHDHU5X_rejTalnViMi8_wOJ-MInrVZ6DzGOOydKcGVECWGh37BP50Ve2zNK-Wtthr56fd8BmP_fe347liuNsVSXTIdNDqvQWwWAS016wCanv4rV9rpliUnssELG4jRvJ-2YROMrG5WzNlAdo9ojV_B-ynuQQn_HdUHagoUOB_vlhxy1Ud-u3cnvbGaMW9M9m8L7cY9-E3eZk3beW6JoKIdKNNLX9WWb96WN__ksDLNe0EV27a59B81x1SkWpgE"
            alt="Profissional em ambiente corporativo"
            className="h-[680px] w-full object-cover"
          />
        </div>
        <Card className="w-full">
          <CardContent className="space-y-6 p-8">
            <div className="space-y-3">
              <span className="eyebrow">Administração</span>
              <h1 className="text-4xl font-extrabold text-primary">Acesse o painel admin</h1>
              <p className="text-base leading-7 text-muted-foreground">
                Entre para administrar cursos, turmas, datas, leads, inscrições e conteúdos do site.
              </p>
            </div>

            <div className="rounded-lg bg-secondary/60 p-4 text-sm text-primary">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-4 w-4" />
                <p>Ambiente demonstrativo com acesso restrito para administração.</p>
              </div>
            </div>

            <div className="grid gap-3">
              {demoAccessList
                .filter((item) => item.role === "admin")
                .map((access) => (
                  <button
                    key={access.role}
                    type="button"
                    onClick={autofill}
                    className="rounded-lg border border-border bg-white p-4 text-left transition hover:border-accent hover:bg-secondary/40"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          Login de teste: Admin
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">{access.description}</div>
                      </div>
                      <div className="flex flex-col gap-2 text-xs">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(access.email, "email");
                          }}
                          className="flex items-center gap-2 rounded px-2 py-1.5 text-primary hover:bg-secondary/40 transition"
                        >
                          {copiedField === "email" ? (
                            <>
                              <Check className="h-4 w-4" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              {access.email}
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(access.password, "password");
                          }}
                          className="flex items-center gap-2 rounded px-2 py-1.5 text-primary hover:bg-secondary/40 transition"
                        >
                          {copiedField === "password" ? (
                            <>
                              <Check className="h-4 w-4" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              Copiar senha
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </button>
                ))}
            </div>

            <div className="grid gap-4">
              <Input placeholder="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} />
              <Input type="password" placeholder="Senha" value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={handleSubmit}>Entrar</Button>
              <Button variant="outline" onClick={() => toast.success("Link de recuperação simulado enviado.")}>
                Esqueci minha senha
              </Button>
              <Button variant="ghost" onClick={() => navigate("/cursos")}>
                Voltar aos cursos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
