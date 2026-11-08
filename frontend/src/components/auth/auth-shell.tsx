import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { VetDataLogo } from "@/components/brand/vetdata-logo";
import { cn } from "@/lib/utils";
import "./auth-shell.css";

type AuthShellProps = {
  /** Form column body — heading, form, etc. */
  children: ReactNode;
  /** Swap link under the form, e.g. "Ainda não tem conta? Criar conta". Pass null to hide. */
  swap?: {
    text: string;
    linkLabel: string;
    href: string;
  } | null;
  /** Show the legal caption under the form. Defaults to true. */
  showLegal?: boolean;
  /** Show the logo above the form. Defaults to true. */
  showBrand?: boolean;
  /** Kept for compatibility. The shell always uses the forest frame. */
  gradient?: boolean;
  /** Allow a wider form column (400px) — used by the clinic-essentials step. */
  wide?: boolean;
};

export function AuthShell({
  children,
  swap,
  showLegal = true,
  showBrand = true,
  wide = false,
}: AuthShellProps) {
  return (
    <div className="relative flex min-h-dvh overflow-hidden bg-forest-900 min-[900px]:p-2">
      <AuthDecor />

      <main className="relative z-[1] flex flex-[1.85] items-center justify-center bg-background px-5 pt-12 pb-16 min-[900px]:rounded-xl">
        <div
          className={cn(
            "flex w-full flex-col gap-3 text-center",
            wide ? "max-w-[400px]" : "max-w-[340px]",
          )}
        >
          {showBrand ? (
            <VetDataLogo size={40} aria-hidden="true" className="mx-auto" />
          ) : null}

          {children}

          {swap ? (
            <p className="mt-1 text-[13px] text-muted-foreground">
              {swap.text}{" "}
              <Link
                to={swap.href}
                className="font-semibold text-foreground underline-offset-4 hover:underline"
              >
                {swap.linkLabel}
              </Link>
            </p>
          ) : null}

          {showLegal ? (
            <p className="mt-3 text-xs leading-[1.55] text-stone-500">
              Ao continuar, você concorda com os{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground hover:underline"
              >
                Termos
              </a>{" "}
              e a{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground hover:underline"
              >
                Política de Privacidade
              </a>{" "}
              do VetData.
            </p>
          ) : null}
        </div>
      </main>

      <aside className="relative z-[1] hidden flex-1 items-center px-7 py-8 min-[900px]:flex">
        <figure className="flex max-w-[420px] flex-col gap-5">
          <span
            aria-hidden="true"
            className="grid size-14 place-items-center rounded-full bg-mint-300 text-lg font-semibold text-forest-900"
          >
            ER
          </span>
          <blockquote className="text-[19px] leading-[1.5] text-cream-200">
            O VetData reduziu pela metade o tempo que passamos com prontuários.
            O assistente rascunha as anotações enquanto ainda estou com o
            paciente.
          </blockquote>
          <figcaption className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-cream-100">
              Dra. Elena Ruiz
            </span>
            <span className="text-[13px] text-forest-300">
              Diretora clínica, Clínica Veterinária Bayview
            </span>
          </figcaption>
        </figure>
      </aside>
    </div>
  );
}

/** Outlined decor shapes on the forest frame, cropped by the cream panel. */
function AuthDecor() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 hidden size-full min-[900px]:block"
      viewBox="0 0 1000 580"
      preserveAspectRatio="xMaxYMid slice"
      aria-hidden="true"
    >
      <g className="fill-none stroke-forest-700 opacity-70" strokeWidth="1.5">
        <path d="M870 -20c40 10 60 40 40 70s-70 30-90 0 10-80 50-70z" />
        <path d="M830 120c50-20 110 10 100 60s-60 90-110 70-60-110 10-130z" />
        <circle cx="990" cy="160" r="40" />
        <path d="M760 480c40-30 100-10 110 40s-30 80-80 70-70-80-30-110z" />
        <path d="M940 430c20 40 10 110-30 140" />
      </g>
    </svg>
  );
}
