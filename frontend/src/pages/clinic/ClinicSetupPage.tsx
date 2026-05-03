import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useState } from "react";

import { currentUserQueryKey, useCurrentUser } from "@/api/auth";
import { createClinic } from "@/api/clinics";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  ClinicEssentialsForm,
  type ClinicEssentialsValues,
} from "@/components/auth/clinic-essentials-form";
import { buildClinicPath, slugifyClinicName } from "@/lib/clinic-routes";

function extractErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
  }
  return fallback;
}

export default function ClinicSetupPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createClinicMutation = useMutation({
    mutationFn: createClinic,
    onSuccess: async (clinic) => {
      await queryClient.invalidateQueries({ queryKey: currentUserQueryKey });
      navigate(buildClinicPath(slugifyClinicName(clinic.name)), {
        replace: true,
      });
    },
  });

  const handleSubmit = async (values: ClinicEssentialsValues) => {
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

  return (
    <AuthShell swap={null} wide>
      <div className="auth-mode-fade">
        <div className="auth-heading">
          <h1>
            Sua <em>clínica</em>
          </h1>
          <p>
            {currentUser?.first_name
              ? `Olá, ${currentUser.first_name}. Vamos cadastrar sua clínica.`
              : "Apenas o essencial — você pode completar o resto depois."}
          </p>
        </div>

        <ClinicEssentialsForm
          prefilledEmail={currentUser?.email ?? null}
          submitting={createClinicMutation.isPending}
          submitLabel="Criar clínica"
          submitPendingLabel="Criando…"
          onSubmit={handleSubmit}
          externalError={submitError}
        />
      </div>
    </AuthShell>
  );
}
