import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";

import { useAuth } from "@/components/auth/auth-provider";
import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleButton } from "@/components/auth/google-button";
import { frontendEnv } from "@/lib/env";

const signInSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
});

type SignInFormValues = z.infer<typeof signInSchema>;

function extractErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
  }
  return fallback;
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" />
      <path d="M9.9 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.4 4.3" />
      <path d="M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7c1.7 0 3.2-.4 4.5-1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

export default function SignInPage() {
  const { status, signInWithPassword, signInWithGoogle } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [googlePending, setGooglePending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: SignInFormValues) => {
    setSubmitError(null);
    try {
      await signInWithPassword(values.email.trim(), values.password);
      const params = new URLSearchParams(location.search);
      const redirect = params.get("redirect_url") ?? "/";
      navigate(redirect, { replace: true });
    } catch (error) {
      setSubmitError(extractErrorMessage(error, "Não foi possível entrar."));
    }
  };

  const onGoogleCredential = async (idToken: string) => {
    setSubmitError(null);
    setGooglePending(true);
    try {
      await signInWithGoogle(idToken);
      const params = new URLSearchParams(location.search);
      const redirect = params.get("redirect_url") ?? "/";
      navigate(redirect, { replace: true });
    } catch (error) {
      setSubmitError(
        extractErrorMessage(error, "Não foi possível entrar com Google."),
      );
    } finally {
      setGooglePending(false);
    }
  };

  if (status === "authenticated") {
    return <Navigate to="/" replace />;
  }

  const submitting = isSubmitting || googlePending;
  const googleEnabled = Boolean(frontendEnv.googleOauthClientId);

  return (
    <AuthShell
      swap={{
        text: "Ainda não tem conta?",
        linkLabel: "Criar conta",
        href: "/sign-up",
      }}
    >
      <div className="auth-mode-fade">
        <div className="auth-heading">
          <h1>
            Entrar no <em>VetData</em>
          </h1>
          <p>Acesse o painel da sua clínica</p>
        </div>

        {googleEnabled ? (
          <>
            <GoogleButton
              onCredential={onGoogleCredential}
              disabled={submitting}
            />
            <div className="auth-divider">
              <span>ou</span>
            </div>
          </>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
          <div className="auth-field">
            <label className="auth-field-label" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="voce@clinica.com"
              aria-invalid={Boolean(errors.email)}
              disabled={submitting}
              className={
                "auth-input" + (errors.email ? " auth-input--error" : "")
              }
              {...register("email")}
            />
            {errors.email ? (
              <div className="auth-field-error">{errors.email.message}</div>
            ) : null}
          </div>

          <div className="auth-field">
            <label className="auth-field-label" htmlFor="password">
              Senha
            </label>
            <div className="auth-input-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Sua senha"
                aria-invalid={Boolean(errors.password)}
                disabled={submitting}
                className={
                  "auth-input auth-input--with-action" +
                  (errors.password ? " auth-input--error" : "")
                }
                {...register("password")}
              />
              <button
                type="button"
                className="auth-input-eye"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {errors.password ? (
              <div className="auth-field-error">{errors.password.message}</div>
            ) : null}
          </div>

          <div className="auth-helper-row">
            <label className="auth-check">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              <span className="auth-check__box">
                <CheckIcon />
              </span>
              <span>Lembrar de mim</span>
            </label>
            <button
              type="button"
              className="auth-link"
              onClick={(event) => event.preventDefault()}
            >
              Esqueceu a senha?
            </button>
          </div>

          {submitError ? (
            <div className="auth-error-banner" role="alert">
              {submitError}
            </div>
          ) : null}

          <button
            type="submit"
            className="auth-btn-primary"
            disabled={submitting}
          >
            {isSubmitting ? (
              <>
                <span className="auth-spinner" /> Aguarde…
              </>
            ) : (
              <>
                Entrar <ArrowRight />
              </>
            )}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
