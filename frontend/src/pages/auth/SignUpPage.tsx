import { Navigate } from "react-router-dom";
import { SignUp, useAuth } from "@clerk/clerk-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthShell
      eyebrow="Prepare sua operação no VetData"
      title="Acompanhamento personalizado e em tempo real."
      description="Depois do cadastro, sua equipe já pode centralizar tutores, abrir sessões de tratamento e acompanhar a evolução clínica sem planilhas paralelas."
      alternateHref="/sign-in"
      alternateLabel="Já possui conta"
      alternateText="Entre com sua conta para voltar ao painel, revisar alertas e seguir com os atendimentos em andamento."
    >
      <SignUp
        appearance={clerkAppearance}
        forceRedirectUrl="/"
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
      />
    </AuthShell>
  );
}
