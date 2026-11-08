import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { ShieldCheckIcon } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

import {
  changeCurrentUserPassword,
  currentUserQueryKey,
  updateCurrentUser,
  useCurrentUser,
} from "@/api/auth";
import { useAuth } from "@/components/auth/auth-provider";
import { PageLayout } from "@/components/layout/page-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ClockIcon,
  InfoIcon,
  LogoutIcon,
  MailIcon,
  OwnerIcon,
  PhoneIcon,
} from "@/components/icons/vetdata-icons";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const profileSchema = z.object({
  first_name: z.string().max(120).optional().or(z.literal("")),
  last_name: z.string().max(120).optional().or(z.literal("")),
  phone_number: z.string().max(40).optional().or(z.literal("")),
  avatar_url: z.string().max(2048).optional().or(z.literal("")),
  crmv: z.string().max(40).optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Informe sua senha atual."),
    new_password: z
      .string()
      .min(8, "A nova senha precisa ter ao menos 8 caracteres."),
    confirm_password: z.string().min(8, "Confirme a nova senha."),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "As senhas não conferem.",
    path: ["confirm_password"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

function buildInitials(displayName: string) {
  return (
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((segment) => segment[0]?.toUpperCase() ?? "")
      .join("") || "VD"
  );
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
  }
  return fallback;
}

export default function Profile() {
  const queryClient = useQueryClient();
  const { signOut } = useAuth();
  const { data: currentUser } = useCurrentUser();

  const displayName = currentUser?.display_name ?? "Equipe VetData";
  const email = currentUser?.email ?? "";
  const avatarUrl = currentUser?.avatar_url ?? "";
  const phoneNumber = currentUser?.phone_number ?? null;
  const initials = buildInitials(displayName);
  const supportsPassword =
    currentUser?.auth_methods?.includes("password") ?? false;

  return (
    <PageLayout title="Perfil">
      <div className="flex w-full max-w-4xl flex-col gap-6 pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="size-16 shrink-0 rounded-full">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="rounded-full bg-mint-300 text-lg font-semibold text-forest-900">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1.5">
            <h2 className="text-2xl font-semibold text-balance text-foreground">
              {displayName}
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13.5px] text-muted-foreground">
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <MailIcon size={14} className="shrink-0" />
                <span className="break-all">{email || "—"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <PhoneIcon size={14} className="shrink-0" />
                {phoneNumber ?? "Nenhum telefone configurado."}
              </span>
              {currentUser?.last_sign_in_at ? (
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon size={14} className="shrink-0" />
                  Último acesso{" "}
                  {new Date(currentUser.last_sign_in_at).toLocaleString(
                    "pt-BR",
                  )}
                </span>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              Métodos de login:{" "}
              <span className="font-semibold text-foreground">
                {(currentUser?.auth_methods ?? []).join(", ") || "—"}
              </span>
            </p>
          </div>
        </div>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b px-5 pt-5">
            <CardTitle className="text-base">Gerencie sua identidade</CardTitle>
            <CardDescription>
              Edite seus dados de acesso, troque sua senha e encerre sua sessão.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <Tabs defaultValue="dados" className="w-full">
              <TabsList variant="line" className="mb-5">
                <TabsTrigger value="dados">
                  <OwnerIcon size={14} />
                  Dados pessoais
                </TabsTrigger>
                <TabsTrigger value="seguranca">
                  <ShieldCheckIcon className="size-3.5" />
                  Segurança
                </TabsTrigger>
                <TabsTrigger value="sessao">
                  <LogoutIcon size={14} />
                  Sessão
                </TabsTrigger>
              </TabsList>
              <TabsContent value="dados">
                <ProfileForm queryClient={queryClient} />
              </TabsContent>
              <TabsContent value="seguranca">
                {supportsPassword ? (
                  <PasswordForm />
                ) : (
                  <Alert variant="info">
                    <InfoIcon />
                    <AlertDescription>
                      Sua conta usa login com Google. Gerencie sua senha
                      diretamente no Google.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
              <TabsContent value="sessao">
                <SessionPanel onSignOut={signOut} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

function ProfileForm({
  queryClient,
}: {
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const { data: currentUser } = useCurrentUser();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: currentUser?.first_name ?? "",
      last_name: currentUser?.last_name ?? "",
      phone_number: currentUser?.phone_number ?? "",
      avatar_url: currentUser?.avatar_url ?? "",
      crmv: currentUser?.crmv ?? "",
    },
  });

  useEffect(() => {
    reset({
      first_name: currentUser?.first_name ?? "",
      last_name: currentUser?.last_name ?? "",
      phone_number: currentUser?.phone_number ?? "",
      avatar_url: currentUser?.avatar_url ?? "",
      crmv: currentUser?.crmv ?? "",
    });
  }, [currentUser, reset]);

  const mutation = useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: (next) => {
      queryClient.setQueryData(currentUserQueryKey, next);
      toast.success("Perfil atualizado com sucesso.");
      setSubmitError(null);
    },
    onError: (error) => {
      setSubmitError(
        extractErrorMessage(error, "Não foi possível atualizar o perfil."),
      );
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    mutation.mutate({
      first_name: values.first_name?.trim() || null,
      last_name: values.last_name?.trim() || null,
      phone_number: values.phone_number?.trim() || null,
      avatar_url: values.avatar_url?.trim() || null,
      crmv: values.crmv?.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-2xl gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="first_name">Nome</Label>
          <Input id="first_name" {...register("first_name")} />
          {errors.first_name ? (
            <p className="text-xs text-destructive">
              {errors.first_name.message}
            </p>
          ) : null}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="last_name">Sobrenome</Label>
          <Input id="last_name" {...register("last_name")} />
          {errors.last_name ? (
            <p className="text-xs text-destructive">
              {errors.last_name.message}
            </p>
          ) : null}
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="phone_number">Telefone</Label>
        <Input id="phone_number" {...register("phone_number")} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="crmv">CRMV</Label>
        <Input id="crmv" placeholder="Ex.: SP-12345" {...register("crmv")} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="avatar_url">URL do avatar</Label>
        <Input
          id="avatar_url"
          placeholder="https://..."
          {...register("avatar_url")}
        />
      </div>
      {submitError ? (
        <Alert variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      ) : null}
      <div>
        <Button
          type="submit"
          disabled={!isDirty || mutation.isPending}
          variant="cta"
        >
          {mutation.isPending ? <Spinner /> : null}
          Salvar alterações
        </Button>
      </div>
    </form>
  );
}

function PasswordForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (values: PasswordFormValues) => {
    setSubmitError(null);
    try {
      await changeCurrentUserPassword({
        current_password: values.current_password,
        new_password: values.new_password,
      });
      reset({ current_password: "", new_password: "", confirm_password: "" });
      toast.success("Senha atualizada com sucesso.");
    } catch (error) {
      setSubmitError(
        extractErrorMessage(error, "Não foi possível atualizar a senha."),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-md gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="current_password">Senha atual</Label>
        <Input
          id="current_password"
          type="password"
          autoComplete="current-password"
          {...register("current_password")}
        />
        {errors.current_password ? (
          <p className="text-xs text-destructive">
            {errors.current_password.message}
          </p>
        ) : null}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="new_password">Nova senha</Label>
        <Input
          id="new_password"
          type="password"
          autoComplete="new-password"
          {...register("new_password")}
        />
        {errors.new_password ? (
          <p className="text-xs text-destructive">
            {errors.new_password.message}
          </p>
        ) : null}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="confirm_password">Confirmar nova senha</Label>
        <Input
          id="confirm_password"
          type="password"
          autoComplete="new-password"
          {...register("confirm_password")}
        />
        {errors.confirm_password ? (
          <p className="text-xs text-destructive">
            {errors.confirm_password.message}
          </p>
        ) : null}
      </div>
      {submitError ? (
        <Alert variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      ) : null}
      <div>
        <Button type="submit" disabled={isSubmitting} variant="cta">
          {isSubmitting ? <Spinner /> : null}
          Atualizar senha
        </Button>
      </div>
    </form>
  );
}

function SessionPanel({ onSignOut }: { onSignOut: () => Promise<void> }) {
  const [pending, setPending] = useState(false);

  const handleSignOut = async () => {
    setPending(true);
    try {
      await onSignOut();
      globalThis.location.href = "/sign-in";
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="grid gap-4 max-w-md">
      <p className="text-sm text-muted-foreground">
        Encerrar a sessão neste navegador. Outras sessões continuam ativas até
        que sejam revogadas.
      </p>
      <div>
        <Button
          variant="outline"
          onClick={() => void handleSignOut()}
          disabled={pending}
        >
          {pending ? <Spinner /> : <LogoutIcon />}
          Sair desta sessão
        </Button>
      </div>
    </div>
  );
}
