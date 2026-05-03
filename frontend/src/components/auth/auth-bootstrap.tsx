import type { ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AlertCircleIcon, LoaderCircleIcon } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { useCurrentUser } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildClinicPath,
  getCanonicalClinicPath,
  slugifyClinicName,
} from "@/lib/clinic-routes";

type AuthBootstrapProps = {
  children: ReactNode;
};

function AuthStatusCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--primary)_14%,white)_0,transparent_38%),linear-gradient(135deg,color-mix(in_oklch,var(--card)_90%,var(--primary)_10%),color-mix(in_oklch,var(--background)_88%,var(--chart-1)_12%))] px-6 py-10">
      <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_center,color-mix(in_oklch,var(--chart-2)_18%,transparent),transparent_72%)]" />
      <Card className="relative w-full max-w-lg border-white/50 bg-background/92 backdrop-blur">
        <CardHeader className="space-y-3">
          <CardTitle className="font-(--theme-font-sans) text-2xl">
            {title}
          </CardTitle>
          <p className="text-muted-foreground">{description}</p>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}

export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { status, signOut } = useAuth();

  const isAuthenticated = status === "authenticated";
  const currentUserQuery = useCurrentUser(isAuthenticated);

  if (status === "loading") {
    return (
      <AuthStatusCard
        title="Carregando sua sessão"
        description="Estamos preparando o ambiente da clínica."
      >
        <div className="flex items-center gap-3 text-muted-foreground">
          <LoaderCircleIcon className="size-5 animate-spin text-primary" />
          Validando identidade...
        </div>
      </AuthStatusCard>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        replace
        to={`/sign-in?redirect_url=${encodeURIComponent(
          `${location.pathname}${location.search}${location.hash}`,
        )}`}
      />
    );
  }

  if (currentUserQuery.isLoading) {
    return (
      <AuthStatusCard
        title="Sincronizando seu perfil"
        description="Carregando os dados da sua clínica antes de liberar o painel."
      >
        <div className="flex items-center gap-3 text-muted-foreground">
          <LoaderCircleIcon className="size-5 animate-spin text-primary" />
          Carregando perfil...
        </div>
      </AuthStatusCard>
    );
  }

  if (currentUserQuery.isError) {
    return (
      <AuthStatusCard
        title="Não foi possível concluir a autenticação"
        description="Sua sessão foi aberta, mas não conseguimos carregar o perfil interno."
      >
        <Alert variant="destructive">
          <AlertCircleIcon className="size-4" />
          <AlertTitle>Falha ao carregar perfil</AlertTitle>
          <AlertDescription>
            Verifique sua conexão e tente novamente. Se o problema continuar,
            contate o responsável pela clínica.
          </AlertDescription>
        </Alert>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => currentUserQuery.refetch()}>
            Tentar novamente
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              void signOut().then(() => navigate("/sign-in", { replace: true }));
            }}
          >
            Encerrar sessão
          </Button>
        </div>
      </AuthStatusCard>
    );
  }

  const currentUser = currentUserQuery.data;
  const isClinicSetupRoute = location.pathname.startsWith("/clinic/setup");
  const clinicSlug = currentUser?.clinic?.name
    ? slugifyClinicName(currentUser.clinic.name)
    : null;

  if (currentUser && !currentUser.has_clinic && !isClinicSetupRoute) {
    return <Navigate replace to="/clinic/setup" />;
  }

  if (currentUser?.has_clinic && isClinicSetupRoute && clinicSlug) {
    return <Navigate replace to={buildClinicPath(clinicSlug)} />;
  }

  if (currentUser?.has_clinic && clinicSlug) {
    const canonicalPath = getCanonicalClinicPath(location.pathname, clinicSlug);

    if (canonicalPath) {
      return (
        <Navigate
          replace
          to={`${canonicalPath}${location.search}${location.hash}`}
        />
      );
    }
  }

  return <>{children}</>;
}
