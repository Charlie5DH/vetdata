import { useForm, type Resolver } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CreatePageLayout } from "@/components/layout/create-page-layout";
import { useCreateTemplate } from "@/api/templates";
import { SectionGeneralInfo } from "./section-general-info";
import { SectionMeasures } from "./section-measures";
import { SectionSummary } from "./section-summary";
import {
  templateCreateSchema,
  templateCreateDefaults,
  type TemplateCreateFormValues,
} from "./schema";
import { useClinicPath } from "@/lib/clinic-routes";

function toOptionalNumber(value?: string) {
  if (!value?.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

const steps = [
  { id: "informacoes", label: "Informações" },
  { id: "medidas", label: "Medidas" },
  { id: "resumo", label: "Resumo" },
];

export default function TemplateCreate() {
  const navigate = useNavigate();
  const createTemplate = useCreateTemplate();
  const { clinicPath } = useClinicPath();

  const form = useForm<TemplateCreateFormValues>({
    resolver: zodResolver(
      templateCreateSchema,
    ) as unknown as Resolver<TemplateCreateFormValues>,
    defaultValues: templateCreateDefaults,
  });

  const onSubmit = async (data: TemplateCreateFormValues) => {
    const templateMeasures = data.measure_ids.map((measureId, index) => {
      const override = data.thresholds[measureId];
      const lowerLimit = toOptionalNumber(override?.lower_limit);
      const upperLimit = toOptionalNumber(override?.upper_limit);

      if (
        lowerLimit !== undefined &&
        upperLimit !== undefined &&
        lowerLimit > upperLimit
      ) {
        throw new Error(
          "O limite inferior do modelo não pode ser maior que o limite superior.",
        );
      }

      return {
        measure_id: measureId,
        display_order: index,
        lower_limit: lowerLimit,
        upper_limit: upperLimit,
      };
    });

    try {
      await createTemplate.mutateAsync({
        name: data.name,
        description: data.description,
        template_measures: templateMeasures,
      });
      toast.success("Modelo criado com sucesso!");
      navigate(clinicPath("/templates"));
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar modelo",
      );
    }
  };

  return (
    <CreatePageLayout
      title="Novo Modelo"
      steps={steps}
      backTo={clinicPath("/templates")}
      showSidebar={false}
      className="max-w-5xl"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <SectionGeneralInfo form={form} step="1" />
        <SectionMeasures form={form} step="2" />
        <SectionSummary
          form={form}
          isSubmitting={form.formState.isSubmitting}
          step="3"
        />
      </form>
    </CreatePageLayout>
  );
}
