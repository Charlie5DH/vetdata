import { Navigate } from "react-router-dom";
import { SignIn, useAuth } from "@clerk/clerk-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthShell
      eyebrow="Acesse a central clínica do VetData"
      title="A sua clínica veterinária digital"
      description="O VetData reúne cadastros, tratamentos, alertas e evolução do atendimento em uma interface única para a rotina da clínica."
      alternateHref="/sign-up"
      alternateLabel="Primeiro acesso"
      alternateText="Ative a conta da clínica para começar a organizar pacientes, tutores, modelos de tratamento e sessões monitoradas."
    >
      <SignIn
        appearance={clerkAppearance}
        forceRedirectUrl="/"
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
      />
    </AuthShell>
  );
}
