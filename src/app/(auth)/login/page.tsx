import {
  IconCertificate,
  IconChevronRight,
  IconSchool,
  IconShieldCheck,
} from "@tabler/icons-react";
import Link from "next/link";
import { LoginForm } from "@/app/(auth)/login/login-form";
import { Card, CardContent } from "@/components/ui/card";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  return (
    <main className="min-h-screen overflow-hidden bg-muted/30">
      <div className="flex min-h-screen items-stretch">
        <section className="relative hidden w-1/2 overflow-hidden bg-brand-navy-900 lg:block">
          <div className="absolute inset-0 scale-[1.04] bg-[linear-gradient(135deg,rgba(8,59,86,0.88),rgba(0,67,100,0.7)),url('/hero-training-bg.png')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,160,23,0.18),transparent_34%),radial-gradient(circle_at_80%_70%,rgba(145,205,253,0.16),transparent_32%)]" />
          <div className="relative z-[1] flex min-h-screen items-center px-10">
            <div className="mx-auto w-full max-w-xl space-y-8">
              <div>
                <h2 className="font-heading text-5xl font-bold text-white">
                  RH Cursos
                </h2>
                <p className="mt-6 text-xl leading-8 text-brand-gold-200">
                  Capacitação estratégica para profissionais que transformam a
                  gestão pública e empresarial.
                </p>
              </div>

              <Card
                className="border-white/25 bg-white/10 text-white shadow-none backdrop-blur"
              >
                <CardContent className="flex items-start gap-4 p-6">
                  <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-md bg-brand-gold text-brand-navy-900">
                    <IconShieldCheck size={30} />
                  </span>
                  <div>
                    <p className="text-sm font-bold uppercase text-white">
                      Certificado reconhecido
                    </p>
                    <p className="mt-1 text-sm text-white/75">
                      Qualidade técnica com foco em resultados práticos.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-brand-gold" />
        </section>

        <section className="min-w-0 flex-1 overflow-y-auto">
          <div className="bg-brand-navy-900 px-6 py-4 lg:hidden">
            <div className="flex items-center justify-between">
              <p className="text-xl font-extrabold text-white">
                RH Cursos
              </p>
              <span className="inline-flex size-10 items-center justify-center rounded-md bg-brand-gold text-brand-navy-900">
                <IconSchool size={20} />
              </span>
            </div>
          </div>

          <div className="flex min-h-[calc(100vh-64px)] items-center px-6 py-12 md:px-12 md:py-16 xl:px-20">
            <div className="mx-auto w-full max-w-xl space-y-10">
              <Card className="border-0 shadow-sm">
                <CardContent className="space-y-8 p-6 md:p-8">
                  <div>
                    <h1 className="font-heading text-3xl font-bold text-brand-navy-700">
                      Acesse sua conta
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                      Bem-vindo de volta. Entre com suas credenciais.
                    </p>
                  </div>

                  <LoginForm nextPath={next} />

                  <hr className="border-border" />

                  <p className="text-center text-muted-foreground">
                    Ainda não possui uma conta?{" "}
                    <Link
                      href="/contato"
                      className="font-bold text-brand-navy-700 underline"
                    >
                      Fale com a equipe
                    </Link>
                  </p>
                </CardContent>
              </Card>

              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center gap-2">
                  <IconCertificate className="text-brand-navy-700" size={18} />
                  <p className="text-sm text-muted-foreground">
                    Acesso restrito a usuários autorizados.
                  </p>
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 text-sm text-brand-navy-700 no-underline hover:underline"
                >
                  <span>Voltar para a página inicial</span>
                  <IconChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
