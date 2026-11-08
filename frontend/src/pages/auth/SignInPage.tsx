import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";

import { EyeOffIcon, Loader2Icon } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleButton } from "@/components/auth/google-button";
import { EyeIcon } from "@/components/icons/vetdata-icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
          <h1>Entrar no VetData</h1>
          <p>Acesse o painel da sua clínica</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3 text-left"
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <label className="sr-only" htmlFor="email">
              E-mail
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="E-mail"
              aria-invalid={Boolean(errors.email)}
              disabled={submitting}
              {...register("email")}
            />
            {errors.email ? (
              <p className="px-5 text-xs text-destructive">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="sr-only" htmlFor="password">
              Senha
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Senha"
                aria-invalid={Boolean(errors.password)}
                disabled={submitting}
                className="pr-12"
                {...register("password")}
              />
              <button
                type="button"
                className="absolute top-1/2 right-1 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-stone-500 transition-colors hover:bg-accent hover:text-foreground"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOffIcon className="size-4" />
                ) : (
                  <EyeIcon size={16} />
                )}
              </button>
            </div>
            {errors.password ? (
              <p className="px-5 text-xs text-destructive">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-stone-700 select-none">
              <Checkbox
                checked={remember}
                onCheckedChange={(checked) => setRemember(checked === true)}
              />
              Lembrar de mim
            </label>
            <button
              type="button"
              className="cursor-pointer text-[13px] font-semibold text-foreground underline-offset-4 hover:underline"
              onClick={(event) => event.preventDefault()}
            >
              Esqueceu a senha?
            </button>
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
                <Loader2Icon className="animate-spin" /> Aguarde…
              </>
            ) : (
              "Entrar"
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
            />
          </>
        ) : null}
      </div>
    </AuthShell>
  );
}
