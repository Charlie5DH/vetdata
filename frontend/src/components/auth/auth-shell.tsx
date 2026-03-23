import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { HeartPulse, ShieldCheck, Stethoscope, Waves } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  alternateLabel: string;
  alternateHref: string;
  alternateText: string;
  children: ReactNode;
};

const highlights = [
  {
    icon: ShieldCheck,
    title: "Rotina protegida",
    description:
      "A equipe acessa o sistema com segurança para consultar dados clínicos e agir com rastreabilidade.",
  },
  {
    icon: Stethoscope,
    title: "Atendimento contínuo",
    description:
      "Pacientes, tutores, templates e sessões ficam centralizados no mesmo fluxo operacional.",
  },
  {
    icon: Waves,
    title: "Monitoramento ativo",
    description:
      "O painel acompanha registros, alertas e evolução das sessões para apoiar decisões da equipe.",
  },
];

export function AuthShell({
  eyebrow,
  title,
  description,
  alternateLabel,
  alternateHref,
  alternateText,
  children,
}: AuthShellProps) {
  return (
    <div className="relative min-h-svh overflow-hidden bg-[linear-gradient(135deg,color-mix(in_oklch,var(--background)_84%,var(--chart-1)_16%),color-mix(in_oklch,var(--background)_90%,var(--chart-2)_10%))] text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_color-mix(in_oklch,var(--primary)_22%,transparent),transparent_36%),radial-gradient(circle_at_bottom_right,_color-mix(in_oklch,var(--chart-2)_16%,transparent),transparent_28%)]" />
      <div className="relative mx-auto flex min-h-svh w-full flex-col justify-center px-6 py-10 lg:px-12 xl:px-24">
        <div className="mx-auto w-full max-w-[1600px] grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16 xl:gap-24">
          <section className="space-y-8 rounded-[2rem] border border-white/35 bg-white/55 p-8 shadow-xl backdrop-blur lg:p-12 dark:border-white/10 dark:bg-black/10">
            <div className="inline-flex w-fit items-center gap-3 rounded-full border border-primary/20 bg-background/80 px-4 py-2 text-sm font-medium text-primary shadow-sm">
              <HeartPulse className="size-4" />
              Plataforma VetData
            </div>
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/80">
                {eyebrow}
              </p>
              <h1 className="max-w-3xl font-[var(--theme-font-serif)] text-4xl leading-tight sm:text-5xl xl:text-6xl">
                {title}
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                {description}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {highlights.map(
                ({
                  icon: Icon,
                  title: itemTitle,
                  description: itemDescription,
                }) => (
                  <Card
                    key={itemTitle}
                    className="border-white/45 bg-background/80 py-0 shadow-sm backdrop-blur"
                    size="sm"
                  >
                    <CardContent className="space-y-3 py-5">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="font-medium text-base">{itemTitle}</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {itemDescription}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ),
              )}
            </div>
          </section>

          <section className="flex flex-col items-center justify-center lg:px-8 xl:px-16">
            <div className="w-full max-w-[480px] rounded-[3rem] border border-white/60 bg-background/95 p-6 shadow-2xl backdrop-blur sm:p-10 dark:border-white/10 dark:bg-black/40">
              <div className="mb-8 flex flex-col items-start gap-5 border-b border-border/70 pb-8">
                <div className="space-y-2 text-left">
                  <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-primary/90">
                    {alternateLabel}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {alternateText}
                  </p>
                </div>
                <Link
                  to={alternateHref}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-primary/30 px-6 text-sm font-medium text-primary transition-colors hover:bg-primary/5 active:bg-primary/10"
                >
                  {alternateHref === "/sign-in"
                    ? "Ir para login"
                    : "Criar conta da clínica"}
                </Link>
              </div>
              <div className="w-full">{children}</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
