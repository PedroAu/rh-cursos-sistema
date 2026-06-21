"use client";

import { useActionState, useState } from "react";
import {
  Barcode,
  CreditCard,
  FileText,
  Lock,
  Receipt,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { submitEnrollmentAction, type PublicFormState } from "@/app/actions/public";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { TextField } from "@/components/forms/field/text-field";
import type { EnrollmentClassOption } from "@/lib/public-data";
import { cn } from "@/lib/utils";

type PublicEnrollmentFormProps = {
  courseId: string | null;
  courseTitle: string;
  courseSlug: string;
  classOptions: EnrollmentClassOption[];
};

const initialState: PublicFormState = {
  error: null,
  success: null,
};

const paymentOptions: Array<{ value: string; label: string; Icon: LucideIcon }> = [
  { value: "cartao", label: "Cartão", Icon: CreditCard },
  { value: "pix", label: "PIX", Icon: Receipt },
  { value: "boleto", label: "Boleto", Icon: Barcode },
  { value: "empenho", label: "Empenho", Icon: FileText },
];

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-border pb-4">
      <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-primary-foreground">
        {number}
      </span>
      <h2 className="font-heading text-2xl font-bold text-brand-navy-700">
        {title}
      </h2>
    </div>
  );
}

export function PublicEnrollmentForm({
  courseId,
  courseTitle,
  courseSlug,
  classOptions,
}: PublicEnrollmentFormProps) {
  const [state, formAction, pending] = useActionState(
    submitEnrollmentAction,
    initialState,
  );
  const [paymentMethod, setPaymentMethod] = useState("cartao");
  const defaultClassId = classOptions[0]?.value ?? "";

  return (
    <form action={formAction}>
      <div className="grid gap-8">
        <input name="course_id" type="hidden" value={courseId ?? ""} />
        <input name="course_title" type="hidden" value={courseTitle} />
        <input name="path_to_revalidate" type="hidden" value={`/inscricao/${courseSlug}`} />
        <input name="cargo" type="hidden" value="Participante" />
        <input name="orgao" type="hidden" value="Não informado" />
        {defaultClassId ? <input name="turma_id" type="hidden" value={defaultClassId} /> : null}

        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}
        {state.success ? (
          <Alert>
            <AlertDescription>{state.success}</AlertDescription>
          </Alert>
        ) : null}

        <section className="grid gap-5">
          <SectionTitle number="1" title="Dados do Aluno" />
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              autoComplete="name"
              className="md:col-span-2"
              label="Nome Completo"
              name="nome"
              placeholder="Seu nome como no certificado"
              required
            />
            <TextField
              autoComplete="email"
              label="E-mail"
              name="email"
              placeholder="contato@exemplo.com"
              required
              type="email"
            />
            <TextField label="CPF" name="cpf" placeholder="000.000.000-00" required />
          </div>
        </section>

        <section className="grid gap-5">
          <SectionTitle number="2" title="Dados da Empresa" />
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              autoComplete="organization"
              className="md:col-span-2"
              label="Razão Social"
              name="empresa_razao"
              placeholder="Nome da empresa"
            />
            <TextField label="CNPJ" name="empresa_cnpj" placeholder="00.000.000/0000-00" />
            <TextField
              autoComplete="tel"
              label="Telefone Corporativo"
              name="telefone"
              placeholder="(00) 0000-0000"
              required
            />
          </div>
        </section>

        <section className="grid gap-5">
          <SectionTitle number="3" title="Pagamento ou Empenho" />
          <fieldset className="grid gap-3">
            <legend className="sr-only">Forma de pagamento</legend>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {paymentOptions.map(({ value, label, Icon }) => {
                const id = `pagamento-${value}`;
                const active = paymentMethod === value;

                return (
                  <div key={value}>
                    <input
                      checked={active}
                      className="sr-only"
                      id={id}
                      name="pagamento_metodo"
                      onChange={() => setPaymentMethod(value)}
                      required
                      type="radio"
                      value={value}
                    />
                    <label
                      className={cn(
                        "flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-border bg-background p-4 text-center transition-colors focus-within:ring-2 focus-within:ring-ring",
                        active && "border-primary bg-accent text-accent-foreground",
                      )}
                      htmlFor={id}
                    >
                      <Icon aria-hidden className="size-6 text-primary" />
                      <span className="font-extrabold">{label}</span>
                    </label>
                  </div>
                );
              })}
            </div>
          </fieldset>

          {paymentMethod === "cartao" ? (
            <Card className="rounded-xl bg-muted/40">
              <CardContent className="grid gap-4 p-5">
                <p className="font-extrabold text-brand-navy-700">Dados do cartão</p>
                <TextField
                  label="Número do Cartão"
                  placeholder="0000 0000 0000 0000"
                  rightIcon={<CreditCard aria-hidden className="size-4" />}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label="Validade" placeholder="MM/AA" />
                  <TextField label="CVV" placeholder="123" />
                </div>
                <div className="grid gap-2">
                  <Label>Parcelamento</Label>
                  <Select defaultValue="1x">
                    <SelectTrigger aria-label="Parcelamento">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1x">1x sem juros</SelectItem>
                      <SelectItem value="2x">2x sem juros</SelectItem>
                      <SelectItem value="6x">6x sem juros</SelectItem>
                      <SelectItem value="12x">12x com juros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {paymentMethod === "pix" ? (
            <Card className="rounded-xl bg-muted/40">
              <CardContent className="space-y-2 p-5">
                <p className="font-extrabold text-brand-navy-700">Pagamento por PIX</p>
                <p className="leading-7 text-muted-foreground">
                  Após o envio da inscrição, nossa equipe confirma a disponibilidade da turma
                  e encaminha as instruções de pagamento por PIX.
                </p>
              </CardContent>
            </Card>
          ) : null}

          {paymentMethod === "boleto" ? (
            <Card className="rounded-xl bg-muted/40">
              <CardContent className="space-y-2 p-5">
                <p className="font-extrabold text-brand-navy-700">Pagamento por boleto</p>
                <p className="leading-7 text-muted-foreground">
                  A solicitação será registrada e o boleto será emitido após validação dos
                  dados da inscrição e da turma selecionada.
                </p>
              </CardContent>
            </Card>
          ) : null}

          {paymentMethod === "empenho" ? (
            <Card className="rounded-xl bg-muted/40">
              <CardContent className="grid gap-4 p-5">
                <div className="space-y-2">
                  <p className="font-extrabold text-brand-navy-700">Inscrição com nota de empenho</p>
                  <p className="leading-7 text-muted-foreground">
                    Informe observações administrativas para que a equipe comercial oriente
                    documentação, prazos e dados necessários para o órgão público.
                  </p>
                </div>
                <TextField
                  label="Observações para empenho"
                  name="observacoes"
                  placeholder="Ex.: dados do órgão, processo interno, prazo de emissão ou contato responsável"
                />
              </CardContent>
            </Card>
          ) : null}
        </section>

        <section className="grid gap-5">
          <SectionTitle number="4" title="LGPD" />
          <Card className="rounded-lg bg-muted/60">
            <CardContent className="grid gap-4 p-4">
              <p className="text-sm leading-7 text-muted-foreground">
                Em conformidade com a <strong>LGPD (Lei Geral de Proteção de Dados)</strong>,
                seus dados serão usados para inscrição, comunicação da turma, emissão de
                certificado e processamento administrativo.
              </p>
              <div className="flex items-start gap-3">
                <Checkbox id="aceite_lgpd" name="aceite_lgpd" required />
                <Label className="text-sm leading-6" htmlFor="aceite_lgpd">
                  Li e concordo com a Política de Privacidade e autorizo o processamento dos meus dados.
                </Label>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5">
          <SectionTitle number="5" title="Revisão" />
          <Card className="rounded-xl">
            <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-extrabold uppercase text-muted-foreground">Curso</p>
                <p className="font-bold">{courseTitle}</p>
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase text-muted-foreground">Forma de pagamento</p>
                <p className="font-bold">
                  {paymentOptions.find((item) => item.value === paymentMethod)?.label ?? "Cartão"}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        <div className="grid gap-3">
          <Button
            className="min-h-14 w-full shadow-[0_14px_32px_rgba(212,160,23,0.24)]"
            disabled={!courseId || !defaultClassId || pending}
            type="submit"
            variant="gold"
          >
            <Lock aria-hidden className="size-5" />
            {pending ? "FINALIZANDO..." : "FINALIZAR INSCRIÇÃO AGORA"}
          </Button>
          <div className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
            <ShieldCheck aria-hidden className="size-4" />
            <span>Seus dados estão protegidos por criptografia de ponta a ponta.</span>
          </div>
        </div>
      </div>
    </form>
  );
}
