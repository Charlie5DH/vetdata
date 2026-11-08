import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { isAxiosError } from "axios";

import { currentUserQueryKey } from "@/api/auth";
import { createClinic } from "@/api/clinics";
import { EyeOffIcon, Loader2Icon } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  ClinicEssentialsForm,
  type ClinicEssentialsValues,
} from "@/components/auth/clinic-essentials-form";
import { GoogleButton } from "@/components/auth/google-button";
import {
  ClinicIcon,
  EyeIcon,
  OwnerIcon,
} from "@/components/icons/vetdata-icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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

const SIGN_UP_STEPS = [
  { label: "Conta", Icon: OwnerIcon },
  { label: "Clínica", Icon: ClinicIcon },
] as const;

function StepHeader({ step }: { step: number }) {
  return (
    <nav
      aria-label={`Passo ${step + 1} de ${SIGN_UP_STEPS.length}`}
      className="flex items-center justify-center gap-2.5 text-[12.5px]"
    >
      {SIGN_UP_STEPS.map(({ label, Icon }, i) => (
        <Fragment key={label}>
          {i > 0 ? (
            <span aria-hidden="true" className="text-stone-400">
              ·
            </span>
          ) : null}
          <span
            aria-current={i === step ? "step" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 border-b-2 border-transparent py-1.5",
              i < step && "font-semibold text-foreground",
              i === step && "border-forest-900 font-semibold text-foreground",
              i > step && "text-stone-400",
            )}
          >
            <Icon size={14} />
            {label}
          </span>
        </Fragment>
      ))}
    </nav>
  );
}

function FieldError({ children }: { children: ReactNode }) {
  return <p className="px-5 text-xs text-destructive">{children}</p>;
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
          <StepHeader step={0} />
          <div className="auth-heading">
            <h1>Criar sua conta</h1>
            <p>Comece a organizar sua clínica em minutos</p>
          </div>

          <form
            onSubmit={handleSubmit(onAccountSubmit)}
            className="flex flex-col gap-3 text-left"
            noValidate
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="sr-only" htmlFor="first-name">
                  Nome
                </label>
                <Input
                  id="first-name"
                  aria-invalid={Boolean(errors.first_name)}
                  placeholder="Nome"
                  autoComplete="given-name"
                  disabled={submitting}
                  {...register("first_name")}
                />
                {errors.first_name ? (
                  <FieldError>{errors.first_name.message}</FieldError>
                ) : null}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="sr-only" htmlFor="last-name">
                  Sobrenome
                </label>
                <Input
                  id="last-name"
                  aria-invalid={Boolean(errors.last_name)}
                  placeholder="Sobrenome"
                  autoComplete="family-name"
                  disabled={submitting}
                  {...register("last_name")}
                />
                {errors.last_name ? (
                  <FieldError>{errors.last_name.message}</FieldError>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="sr-only" htmlFor="signup-email">
                E-mail
              </label>
              <Input
                id="signup-email"
                type="email"
                aria-invalid={Boolean(errors.email)}
                placeholder="E-mail"
                autoComplete="email"
                disabled={submitting}
                {...register("email")}
              />
              {errors.email ? (
                <FieldError>{errors.email.message}</FieldError>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="sr-only" htmlFor="signup-password">
                Senha
              </label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  aria-invalid={Boolean(errors.password)}
                  className="pr-12"
                  placeholder="Senha (mínimo de 8 caracteres)"
                  autoComplete="new-password"
                  disabled={submitting}
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-1 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-stone-500 transition-colors hover:bg-accent hover:text-foreground"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={
                    showPassword ? "Ocultar senha" : "Mostrar senha"
                  }
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon size={16} />
                  )}
                </button>
              </div>
              {errors.password ? (
                <FieldError>{errors.password.message}</FieldError>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="sr-only" htmlFor="signup-crmv">
                CRMV (opcional)
              </label>
              <Input
                id="signup-crmv"
                placeholder="CRMV (opcional), ex.: SP-12345"
                disabled={submitting}
                {...register("crmv")}
              />
            </div>

            {submitError ? (
              <Alert variant="destructive">{submitError}</Alert>
            ) : null}

            <Button
              type="submit"
              variant="cta"
              className="h-10 w-full"
              disabled={submitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="animate-spin" /> Criando conta…
                </>
              ) : (
                "Continuar"
              )}
            </Button>
          </form>

          {googleEnabled ? (
            <>
              <div className="auth-divider">
                <span>ou</span>
              </div>
              <GoogleButton
                onCredential={onGoogleCredential}
                disabled={submitting}
                label="Cadastrar com Google"
              />
            </>
          ) : null}
        </div>
      ) : (
        <div className="auth-mode-fade">
          <StepHeader step={1} />
          <div className="auth-heading">
            <h1>Sua clínica</h1>
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
