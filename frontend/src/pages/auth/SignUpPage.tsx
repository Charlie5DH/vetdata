import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { isAxiosError } from "axios";

import { currentUserQueryKey } from "@/api/auth";
import { createClinic } from "@/api/clinics";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  ClinicEssentialsForm,
  type ClinicEssentialsValues,
} from "@/components/auth/clinic-essentials-form";
import { GoogleButton } from "@/components/auth/google-button";
import { frontendEnv } from "@/lib/env";
import { buildClinicPath, slugifyClinicName } from "@/lib/clinic-routes";

const signUpSchema = z.object({
  first_name: z.string().min(1, "Informe seu nome"),
  last_name: z.string().min(1, "Informe seu sobrenome"),
  email: z.email("E-mail inválido"),
  password: z.string().min(8, "Mínimo de 8 caracteres"),
  crmv: z.string().optional().or(z.literal("")),
});

type SignUpValues = z.infer<typeof signUpSchema>;

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

function StepHeader({ step, total }: { step: number; total: number }) {
  return (
    <div className="auth-steps">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={
            "auth-step-dot" +
            (i === step ? " is-active" : i < step ? " is-done" : "")
          }
        />
      ))}
      <span className="auth-step-label">
        Passo {step + 1} de {total}
      </span>
    </div>
  );
}

type StepState =
  | { kind: "account" }
  | { kind: "clinic"; skippedAccount: boolean };

export default function SignUpPage() {
  const { status, signUp, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<StepState>({ kind: "account" });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [googlePending, setGooglePending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      crmv: "",
    },
  });

  const createClinicMutation = useMutation({
    mutationFn: createClinic,
    onSuccess: async (clinic) => {
      // Refresh the cached current-user so AuthBootstrap sees has_clinic=true.
      await queryClient.invalidateQueries({ queryKey: currentUserQueryKey });
      navigate(buildClinicPath(slugifyClinicName(clinic.name)), { replace: true });
    },
  });

  const onAccountSubmit = async (values: SignUpValues) => {
    setSubmitError(null);
    try {
      await signUp({
        email: values.email.trim(),
        password: values.password,
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        crmv: values.crmv?.trim() || null,
      });
      setStep({ kind: "clinic", skippedAccount: false });
    } catch (error) {
      setSubmitError(
        extractErrorMessage(error, "Não foi possível criar sua conta."),
      );
    }
  };

  const onGoogleCredential = async (idToken: string) => {
    setSubmitError(null);
    setGooglePending(true);
    try {
      await signInWithGoogle(idToken);
      // Backend auto-creates the user; if they already had a clinic, jump
      // to the dashboard instead of forcing the clinic step.
      setStep({ kind: "clinic", skippedAccount: true });
    } catch (error) {
      setSubmitError(
        extractErrorMessage(error, "Não foi possível continuar com Google."),
      );
    } finally {
      setGooglePending(false);
    }
  };

  const onClinicSubmit = async (values: ClinicEssentialsValues) => {
    setSubmitError(null);
    try {
      await createClinicMutation.mutateAsync({
        name: values.name.trim(),
        contact_email: values.contact_email.trim() || undefined,
        contact_phone: values.contact_phone.trim() || undefined,
        city: values.city.trim() || undefined,
        state: values.state.trim().toUpperCase() || undefined,
      });
    } catch (error) {
      setSubmitError(
        extractErrorMessage(error, "Não foi possível criar a clínica."),
      );
    }
  };

  // Already authenticated and has a clinic — nothing to do here.
  if (status === "authenticated" && user?.has_clinic) {
    return <Navigate to="/" replace />;
  }

  // Authenticated without a clinic and not mid-signup — defer to /clinic/setup so
  // there's a single canonical clinic-creation surface for that case.
  if (
    status === "authenticated" &&
    !user?.has_clinic &&
    step.kind === "account"
  ) {
    return <Navigate to="/clinic/setup" replace />;
  }

  const accountValues = getValues();
  const prefilledEmail = user?.email ?? accountValues.email ?? null;
  const submitting =
    isSubmitting || googlePending || createClinicMutation.isPending;
  const googleEnabled = Boolean(frontendEnv.googleOauthClientId);

  return (
    <AuthShell
      swap={
        step.kind === "account"
          ? {
              text: "Já tem uma conta?",
              linkLabel: "Entrar",
              href: "/sign-in",
            }
          : null
      }
    >
      {step.kind === "account" ? (
        <div className="auth-mode-fade">
          <StepHeader step={0} total={2} />
          <div className="auth-heading">
            <h1>
              Criar sua <em>conta</em>
            </h1>
            <p>Comece a organizar sua clínica em minutos</p>
          </div>

          {googleEnabled ? (
            <>
              <GoogleButton
                onCredential={onGoogleCredential}
                disabled={submitting}
                label="Cadastrar com Google"
              />
              <div className="auth-divider">
                <span>ou</span>
              </div>
            </>
          ) : null}

          <form
            onSubmit={handleSubmit(onAccountSubmit)}
            className="auth-form"
            noValidate
          >
            <div className="auth-row">
              <div className="auth-field">
                <label className="auth-field-label" htmlFor="first-name">
                  Nome
                </label>
                <input
                  id="first-name"
                  className={
                    "auth-input" +
                    (errors.first_name ? " auth-input--error" : "")
                  }
                  placeholder="Ana"
                  autoComplete="given-name"
                  disabled={submitting}
                  {...register("first_name")}
                />
                {errors.first_name ? (
                  <div className="auth-field-error">
                    {errors.first_name.message}
                  </div>
                ) : null}
              </div>
              <div className="auth-field">
                <label className="auth-field-label" htmlFor="last-name">
                  Sobrenome
                </label>
                <input
                  id="last-name"
                  className={
                    "auth-input" +
                    (errors.last_name ? " auth-input--error" : "")
                  }
                  placeholder="Ribeiro"
                  autoComplete="family-name"
                  disabled={submitting}
                  {...register("last_name")}
                />
                {errors.last_name ? (
                  <div className="auth-field-error">
                    {errors.last_name.message}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-field-label" htmlFor="signup-email">
                E-mail
              </label>
              <input
                id="signup-email"
                type="email"
                className={
                  "auth-input" + (errors.email ? " auth-input--error" : "")
                }
                placeholder="voce@clinica.com"
                autoComplete="email"
                disabled={submitting}
                {...register("email")}
              />
              {errors.email ? (
                <div className="auth-field-error">{errors.email.message}</div>
              ) : null}
            </div>

            <div className="auth-field">
              <label className="auth-field-label" htmlFor="signup-password">
                Senha
              </label>
              <div className="auth-input-wrap">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  className={
                    "auth-input auth-input--with-action" +
                    (errors.password ? " auth-input--error" : "")
                  }
                  placeholder="Mínimo de 8 caracteres"
                  autoComplete="new-password"
                  disabled={submitting}
                  {...register("password")}
                />
                <button
                  type="button"
                  className="auth-input-eye"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={
                    showPassword ? "Ocultar senha" : "Mostrar senha"
                  }
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {errors.password ? (
                <div className="auth-field-error">
                  {errors.password.message}
                </div>
              ) : null}
            </div>

            <div className="auth-field">
              <label className="auth-field-label" htmlFor="signup-crmv">
                CRMV <span className="auth-field-hint">· opcional</span>
              </label>
              <input
                id="signup-crmv"
                className="auth-input"
                placeholder="Ex.: SP-12345"
                disabled={submitting}
                {...register("crmv")}
              />
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
                  <span className="auth-spinner" /> Criando conta…
                </>
              ) : (
                <>
                  Continuar <ArrowRight />
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="auth-mode-fade">
          <StepHeader step={1} total={2} />
          <div className="auth-heading">
            <h1>
              Sua <em>clínica</em>
            </h1>
            <p>
              {step.skippedAccount
                ? `Olá, ${user?.first_name || "doutor(a)"}. Vamos criar a clínica.`
                : "Apenas o essencial — você pode completar o resto depois."}
            </p>
          </div>

          <ClinicEssentialsForm
            prefilledEmail={prefilledEmail}
            onSubmit={onClinicSubmit}
            onBack={
              step.skippedAccount ? undefined : () => setStep({ kind: "account" })
            }
            backDisabled={step.skippedAccount}
            submitting={createClinicMutation.isPending}
            externalError={submitError}
          />
        </div>
      )}
    </AuthShell>
  );
}
