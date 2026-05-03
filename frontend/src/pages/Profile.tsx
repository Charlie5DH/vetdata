import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { LoaderCircleIcon, ShieldCheckIcon, SparklesIcon, UserIcon } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    new_password: z.string().min(8, "A nova senha precisa ter ao menos 8 caracteres."),
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
      <div className="mx-auto flex w-full max-w-[1536px] flex-col gap-8 px-1 pb-8 xl:px-2">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)]">
          <Card className="sticky top-6 overflow-hidden border-border/70 bg-card/88 shadow-sm backdrop-blur">
            <div className="h-32 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--primary)_22%,transparent),transparent_60%),linear-gradient(135deg,color-mix(in_oklch,var(--chart-2)_26%,transparent),color-mix(in_oklch,var(--chart-5)_18%,transparent))]" />
            <CardContent className="-mt-11 space-y-6 p-6">
              <Avatar className="h-24 w-24 rounded-[28px] border-4 border-background shadow-lg">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="rounded-[28px] text-xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1.5">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  {displayName}
                </h2>
                <p className="break-all text-sm text-muted-foreground">
                  {email}
                </p>
                <p className="text-sm text-muted-foreground">
                  {phoneNumber ?? "Nenhum telefone configurado."}
                </p>
              </div>
              <div className="grid gap-3">
                <div className="rounded-[20px] border border-border/70 bg-background/80 p-3 text-sm text-muted-foreground">
                  Métodos de login:{" "}
                  <span className="font-medium text-foreground">
                    {(currentUser?.auth_methods ?? []).join(", ") || "—"}
                  </span>
                </div>
                {currentUser?.last_sign_in_at ? (
                  <div className="rounded-[20px] border border-border/70 bg-background/80 p-3 text-sm text-muted-foreground">
                    Último acesso:{" "}
                    <span className="font-medium text-foreground">
                      {new Date(currentUser.last_sign_in_at).toLocaleString(
                        "pt-BR",
                      )}
                    </span>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border/70 bg-card/90 shadow-sm backdrop-blur">
            <CardHeader className="space-y-3 border-b border-border/60 px-6 py-6 sm:px-8 sm:py-7">
              <CardTitle className="text-2xl tracking-tight">
                Gerencie sua identidade
              </CardTitle>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                Edite seus dados de acesso, troque sua senha e encerre sua
                sessão.
              </p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Tabs defaultValue="dados" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="dados">
                    <SparklesIcon className="size-4" />
                    Dados pessoais
                  </TabsTrigger>
                  <TabsTrigger value="seguranca">
                    <ShieldCheckIcon className="size-4" />
                    Segurança
                  </TabsTrigger>
                  <TabsTrigger value="sessao">
                    <UserIcon className="size-4" />
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
                    <Alert>
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
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 max-w-2xl">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">Nome</Label>
          <Input id="first_name" {...register("first_name")} />
          {errors.first_name ? (
            <p className="text-xs text-destructive">
              {errors.first_name.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Sobrenome</Label>
          <Input id="last_name" {...register("last_name")} />
          {errors.last_name ? (
            <p className="text-xs text-destructive">
              {errors.last_name.message}
            </p>
          ) : null}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone_number">Telefone</Label>
        <Input id="phone_number" {...register("phone_number")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="crmv">CRMV</Label>
        <Input id="crmv" placeholder="Ex.: SP-12345" {...register("crmv")} />
      </div>
      <div className="space-y-2">
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
          className="rounded-full px-6"
        >
          {mutation.isPending ? (
            <LoaderCircleIcon className="size-4 animate-spin" />
          ) : null}
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
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 max-w-md">
      <div className="space-y-2">
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
      <div className="space-y-2">
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
      <div className="space-y-2">
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
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full px-6"
        >
          {isSubmitting ? (
            <LoaderCircleIcon className="size-4 animate-spin" />
          ) : null}
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
          className="rounded-full px-6"
        >
          {pending ? <LoaderCircleIcon className="size-4 animate-spin" /> : null}
          Sair desta sessão
        </Button>
      </div>
    </div>
  );
}
