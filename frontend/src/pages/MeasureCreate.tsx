import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useCreateMeasure } from "@/api/templates";
import { MeasureForm } from "@/components/measures/measure-form";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { useClinicPath } from "@/lib/clinic-routes";

export default function MeasureCreate() {
  const navigate = useNavigate();
  const createMeasure = useCreateMeasure();
  const { clinicPath } = useClinicPath();

  return (
    <PageLayout
      title="Medida"
      actions={
        <Button variant="outline" asChild>
          <Link to={clinicPath("/measures")}>Voltar para medidas</Link>
        </Button>
      }
    >
      <MeasureForm
        submitLabel="Criar Medida"
        isSubmitting={createMeasure.isPending}
        onCancel={() => navigate(-1)}
        onSubmit={async (payload) => {
          try {
            await createMeasure.mutateAsync(payload);
            toast.success("Medida criada com sucesso!");
            navigate(clinicPath("/measures"));
          } catch (error) {
            console.error(error);
            toast.error("Erro ao criar medida. Tente novamente.");
          }
        }}
      />
    </PageLayout>
  );
}
