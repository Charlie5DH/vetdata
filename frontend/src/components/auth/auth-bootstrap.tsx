import type { ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LoaderCircleIcon } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { useCurrentUser } from "@/api/auth";
import { VetDataLogo } from "@/components/brand/vetdata-logo";
import { AlertIcon } from "@/components/icons/vetdata-icons";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
    <div className="min-h-svh bg-forest-900 p-2">
      <main className="flex min-h-[calc(100svh-1rem)] items-center justify-center rounded-xl bg-background px-6 py-10">
        <div className="flex w-full max-w-[420px] flex-col gap-3">
          <VetDataLogo size={40} aria-hidden="true" />
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.02em]">
            {title}
          </h1>
          <p className="text-muted-foreground">{description}</p>
          {children ? <div className="mt-3">{children}</div> : null}
        </div>
      </main>
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
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <LoaderCircleIcon className="size-4 animate-spin text-primary" />
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
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <LoaderCircleIcon className="size-4 animate-spin text-primary" />
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
          <AlertIcon />
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
