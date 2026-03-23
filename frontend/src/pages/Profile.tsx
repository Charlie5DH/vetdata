import { useEffect, useRef } from "react";
import { UserProfile, useUser } from "@clerk/clerk-react";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldCheckIcon, SmartphoneIcon, SparklesIcon } from "lucide-react";

import { currentUserQueryKey, useCurrentUser } from "@/api/auth";
import { PageLayout } from "@/components/layout/page-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clerkProfileAppearance } from "@/lib/clerk-appearance";
import { useClinicPath } from "@/lib/clinic-routes";

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

export default function Profile() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { data: currentUser } = useCurrentUser();
  const { clinicPath } = useClinicPath();
  const lastKnownUpdateAtRef = useRef<number | null>(null);

  useEffect(() => {
    const nextUpdatedAt = user?.updatedAt?.getTime() ?? null;

    if (lastKnownUpdateAtRef.current === null) {
      lastKnownUpdateAtRef.current = nextUpdatedAt;
      return;
    }

    if (nextUpdatedAt !== lastKnownUpdateAtRef.current) {
      lastKnownUpdateAtRef.current = nextUpdatedAt;
      void queryClient.invalidateQueries({ queryKey: currentUserQueryKey });
    }
  }, [queryClient, user?.updatedAt?.getTime()]);

  const displayName =
    currentUser?.display_name ??
    user?.fullName ??
    user?.firstName ??
    "Equipe VetData";
  const email =
    currentUser?.email ?? user?.primaryEmailAddress?.emailAddress ?? "";
  const avatarUrl = currentUser?.avatar_url ?? user?.imageUrl ?? "";
  const phoneNumber =
    currentUser?.phone_number ?? user?.primaryPhoneNumber?.phoneNumber ?? null;
  const initials = buildInitials(displayName);

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
                  {phoneNumber ?? "Nenhum telefone principal configurado."}
                </p>
              </div>
              <div className="grid gap-4">
                <div className="rounded-[24px] border border-border/70 bg-background/80 p-4 shadow-sm">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <SparklesIcon className="size-4" />
                    </span>
                    <span>Dados pessoais</span>
                  </div>
                  <p className="pl-10 text-sm leading-6 text-muted-foreground">
                    Atualize nome, foto e dados principais sem sair da
                    plataforma.
                  </p>
                </div>
                <div className="rounded-[24px] border border-border/70 bg-background/80 p-4 shadow-sm">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <SmartphoneIcon className="size-4" />
                    </span>
                    <span>Telefone verificado</span>
                  </div>
                  <p className="pl-10 text-sm leading-6 text-muted-foreground">
                    O fluxo de telefone segue a verificação segura do Clerk.
                  </p>
                </div>
                <div className="rounded-[24px] border border-border/70 bg-background/80 p-4 shadow-sm">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <ShieldCheckIcon className="size-4" />
                    </span>
                    <span>Segurança</span>
                  </div>
                  <p className="pl-10 text-sm leading-6 text-muted-foreground">
                    Senha e fatores de acesso continuam centralizados no
                    provedor de identidade.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border/70 bg-card/90 shadow-sm backdrop-blur">
            <CardHeader className="space-y-3 border-b border-border/60 px-6 py-6 sm:px-8 sm:py-7">
              <CardTitle className="text-2xl tracking-tight">
                Gerencie sua identidade
              </CardTitle>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                Edite seus dados de acesso, imagem, telefone e segurança usando
                a central de perfil integrada ao VetData.
              </p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="rounded-[32px] border border-border/60 bg-background/70 p-2 shadow-sm sm:p-3">
                <UserProfile
                  appearance={clerkProfileAppearance}
                  path={clinicPath("/perfil")}
                  routing="path"
                  fallback={
                    <div className="space-y-4 p-6">
                      <div className="h-10 w-52 animate-pulse rounded-full bg-muted/60" />
                      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                        <div className="h-96 animate-pulse rounded-3xl bg-muted/50" />
                        <div className="h-96 animate-pulse rounded-3xl bg-muted/50" />
                      </div>
                    </div>
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
