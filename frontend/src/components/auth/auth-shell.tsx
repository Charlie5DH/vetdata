import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import "./auth-shell.css";

type AuthShellProps = {
  /** Card body — heading, form, etc. */
  children: ReactNode;
  /** Bottom swap link, e.g. "Ainda não tem conta? Criar conta". Pass null to hide. */
  swap?: {
    text: string;
    linkLabel: string;
    href: string;
  } | null;
  /** Show the legal disclaimer below the card. Defaults to true. */
  showLegal?: boolean;
  /** Show the brand mark above the card. Defaults to true. */
  showBrand?: boolean;
  /** Use the warm radial-gradient background instead of plain. Defaults to true. */
  gradient?: boolean;
  /** Allow a wider card (480px) — used by the clinic-essentials step. */
  wide?: boolean;
};

export function AuthShell({
  children,
  swap,
  showLegal = true,
  showBrand = true,
  gradient = true,
  wide = false,
}: AuthShellProps) {
  return (
    <div className={"auth-stage" + (gradient ? " auth-stage--gradient" : "")}>
      <div className={"auth-wrapper" + (wide ? " auth-wrapper--wide" : "")}>
        {showBrand ? (
          <div className="auth-brand">
            <div className="auth-brand__mark" aria-hidden="true">
              V
            </div>
            <div className="auth-brand__name">VetData</div>
          </div>
        ) : null}

        <div className="auth-card">{children}</div>

        {swap ? (
          <div className="auth-swap-line">
            {swap.text}{" "}
            <Link to={swap.href} className="auth-link">
              {swap.linkLabel}
            </Link>
          </div>
        ) : null}

        {showLegal ? (
          <div className="auth-legal">
            Ao continuar, você concorda com os{" "}
            <a href="/terms" target="_blank" rel="noreferrer">
              Termos
            </a>{" "}
            e a{" "}
            <a href="/privacy" target="_blank" rel="noreferrer">
              Política de Privacidade
            </a>{" "}
            do VetData.
          </div>
        ) : null}
      </div>
    </div>
  );
}
