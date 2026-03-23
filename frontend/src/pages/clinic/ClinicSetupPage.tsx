import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { toast } from "sonner";

import { useCurrentUser } from "@/api/auth";
import { useCreateClinic } from "@/api/clinics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClinicForm, emptyClinicFormValues } from "@/pages/clinic/clinic-form";
import type { ClinicCreatePayload } from "@/types";
import { buildClinicPath, slugifyClinicName } from "@/lib/clinic-routes";

export default function ClinicSetupPage() {
  const navigate = useNavigate();
  const currentUserQuery = useCurrentUser();
  const createClinic = useCreateClinic();
  const initialValues = useMemo(() => emptyClinicFormValues(), []);

  const handleSubmit = async (payload: ClinicCreatePayload) => {
    try {
      const clinic = await createClinic.mutateAsync(payload);
      toast.success("Clínica criada com sucesso.");
      navigate(buildClinicPath(slugifyClinicName(clinic.name), "/clinic"), {
        replace: true,
      });
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível concluir o cadastro da clínica.");
    }
  };

  const user = currentUserQuery.data;

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--primary)_14%,white)_0,transparent_38%),linear-gradient(135deg,color-mix(in_oklch,var(--card)_90%,var(--primary)_10%),color-mix(in_oklch,var(--background)_88%,var(--chart-1)_12%))] px-6 py-10">
      <Card className="w-full max-w-4xl border-white/50 bg-background/92 backdrop-blur">
        <CardHeader className="space-y-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Building2 className="size-6" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl">Cadastre sua clínica</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Antes de liberar o painel, precisamos registrar os dados
              principais da clínica para estruturar sua operação no VetData.
              {user ? ` Esta conta será vinculada a ${user.email}.` : ""}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
              Você será definido como responsável inicial da clínica e poderá
              convidar outros veterinários depois. Todos esses dados poderão ser
              atualizados mais tarde na página da clínica.
            </div>

            <ClinicForm
              initialValues={initialValues}
              onSubmit={handleSubmit}
              isSubmitting={createClinic.isPending}
              submitLabel="Criar clínica"
              submitPendingLabel="Criando clínica..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
