import { useMemo, useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconArrowLeft,
  IconChevronLeft,
  IconChevronRight,
  IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { useCreateOwner } from "@/api/owners";
import { useCreatePatient } from "@/api/patients";
import { useCreateTreatmentSession } from "@/api/treatments";
import { StepTracker, type Step } from "@/components/layout/step-tracker";
import { Button } from "@/components/ui/button";
import { useClinicPath } from "@/lib/clinic-routes";
import { cn } from "@/lib/utils";
import { SectionPatientInfo } from "./section-patient-info";
import { SectionTreatment } from "./section-treatment";
import { SectionSummary } from "./section-summary";
import {
  SectionTutorChoice,
  SectionTutorExisting,
  SectionTutorNew,
} from "./section-tutor";
import {
  patientCreateSchema,
  patientCreateDefaults,
  patientCreateStepFields,
  type PatientCreateFormValues,
} from "./schema";

type WizardStepId =
  | "owner-choice"
  | "owner-existing"
  | "owner-new"
  | "patient"
  | "treatment"
  | "summary";

function getFooterPrimaryLabel(step: WizardStepId) {
  switch (step) {
    case "owner-existing":
    case "owner-new":
    case "patient":
      return "Proximo";
    case "treatment":
      return "Revisar resumo";
    case "summary":
      return "Criar paciente";
    default:
      return "Continuar";
  }
}

export default function PatientCreate() {
  const navigate = useNavigate();
  const { clinicPath } = useClinicPath();
  const createOwner = useCreateOwner();
  const createPatient = useCreatePatient();
  const createSession = useCreateTreatmentSession();
  const [currentStep, setCurrentStep] = useState<WizardStepId>("owner-choice");

  const form = useForm<PatientCreateFormValues>({
    resolver: zodResolver(
      patientCreateSchema,
    ) as unknown as Resolver<PatientCreateFormValues>,
    defaultValues: patientCreateDefaults,
  });
  const ownerMode = useWatch({ control: form.control, name: "owner_mode" });

  const steps = useMemo<Step[]>(
    () => [
      { id: "owner-choice", label: "Tipo de tutor" },
      {
        id: ownerMode === "existing" ? "owner-existing" : "owner-new",
        label: "Tutor",
      },
      { id: "patient", label: "Paciente" },
      { id: "treatment", label: "Tratamento" },
      { id: "summary", label: "Resumo" },
    ],
    [ownerMode],
  );

  const currentIndex = steps.findIndex((step) => step.id === currentStep);
  const completedSteps = steps
    .slice(0, Math.max(currentIndex, 0))
    .map((step) => step.id);
  const clickableSteps = new Set([...completedSteps, currentStep]);
  const currentStepNumber = currentIndex + 1;
  const isFirstStep = currentStep === "owner-choice";
  const isSummaryStep = currentStep === "summary";

  const onSubmit = async (values: PatientCreateFormValues) => {
    try {
      let ownerId = values.owner_id;

      if (values.owner_mode === "new") {
        const newOwner = await createOwner.mutateAsync({
          first_name: values.new_owner_first_name!,
          last_name: values.new_owner_last_name!,
          email: values.new_owner_email!,
          phone: values.new_owner_phone || undefined,
          cpf: values.new_owner_cpf || undefined,
        });
        ownerId = newOwner.id;
      }

      if (!ownerId) {
        toast.error("Tutor é obrigatório");
        return;
      }

      const newPatient = await createPatient.mutateAsync({
        name: values.name,
        species: values.species,
        breed: values.breed || null,
        age_years: values.age_years || 0,
        age_months: values.age_months || 0,
        weight_kg: values.weight_kg || 0,
        notes: values.notes || null,
        motive: values.motive || null,
        owner_id: ownerId,
      });

      if (values.template_id && values.template_id !== "none") {
        await createSession.mutateAsync({
          patient_id: newPatient.id,
          template_id: values.template_id,
          status: "active",
        });
        toast.success("Paciente e tratamento criados com sucesso!");
      } else {
        toast.success("Paciente criado com sucesso!");
      }

      navigate(`/patients/${newPatient.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar paciente");
    }
  };

  const goToStep = (step: WizardStepId) => {
    setCurrentStep(step);
  };

  const handleChooseOwnerMode = (
    mode: PatientCreateFormValues["owner_mode"],
  ) => {
    form.setValue("owner_mode", mode, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    goToStep(mode === "existing" ? "owner-existing" : "owner-new");
  };

  const handlePrevious = () => {
    if (isFirstStep) {
      navigate(clinicPath("/patients"));
      return;
    }

    if (currentStep === "owner-existing" || currentStep === "owner-new") {
      goToStep("owner-choice");
      return;
    }

    const previousStep = steps[currentIndex - 1];

    if (previousStep) {
      goToStep(previousStep.id as WizardStepId);
    }
  };

  const handleNext = async () => {
    if (currentStep === "owner-existing") {
      const isValid = await form.trigger(patientCreateStepFields.ownerExisting);

      if (isValid) {
        goToStep("patient");
      }

      return;
    }

    if (currentStep === "owner-new") {
      const isValid = await form.trigger(patientCreateStepFields.ownerNew);

      if (isValid) {
        goToStep("patient");
      }

      return;
    }

    if (currentStep === "patient") {
      const isValid = await form.trigger(patientCreateStepFields.patient);

      if (isValid) {
        goToStep("treatment");
      }

      return;
    }

    if (currentStep === "treatment") {
      await form.trigger(patientCreateStepFields.treatment);
      goToStep("summary");
    }
  };

  const handleTrackerStepClick = (stepId: string) => {
    if (!clickableSteps.has(stepId)) {
      return;
    }

    goToStep(stepId as WizardStepId);
  };

  const renderCurrentStep = () => {
    const stepValue = String(currentStepNumber);

    switch (currentStep) {
      case "owner-choice":
        return (
          <SectionTutorChoice
            form={form}
            step={stepValue}
            onChooseMode={handleChooseOwnerMode}
          />
        );
      case "owner-existing":
        return <SectionTutorExisting form={form} step={stepValue} />;
      case "owner-new":
        return <SectionTutorNew form={form} step={stepValue} />;
      case "patient":
        return <SectionPatientInfo form={form} step={stepValue} />;
      case "treatment":
        return <SectionTreatment form={form} step={stepValue} />;
      case "summary":
        return <SectionSummary form={form} step={stepValue} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(clinicPath("/patients"))}
          >
            <IconArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Novo Paciente</h1>
            <p className="text-sm text-muted-foreground">
              Crie o paciente em etapas curtas, sem uma pagina longa de rolagem.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        <div className="border-b p-4 lg:hidden">
          <StepTracker
            steps={steps}
            activeStep={currentStep}
            interactive={true}
            onStepClick={handleTrackerStepClick}
            completedSteps={completedSteps}
          />
        </div>

        <aside className="hidden w-72 shrink-0 border-r lg:block">
          <div className="sticky top-4 p-4">
            <StepTracker
              steps={steps}
              activeStep={currentStep}
              interactive={true}
              onStepClick={handleTrackerStepClick}
              completedSteps={completedSteps}
            />
          </div>
        </aside>

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 sm:p-6">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto flex h-full w-full max-w-5xl flex-1 flex-col"
          >
            <div
              className={cn(
                "flex-1",
                currentStep === "owner-choice" && "max-w-4xl",
              )}
            >
              {renderCurrentStep()}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 border-t pt-6">
              <Button type="button" variant="outline" onClick={handlePrevious}>
                <IconChevronLeft data-icon="inline-start" />
                {isFirstStep ? "Cancelar" : "Voltar"}
              </Button>

              {currentStep !== "owner-choice" &&
                (isSummaryStep ? (
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && (
                      <IconLoader2
                        data-icon="inline-start"
                        className="animate-spin"
                      />
                    )}
                    Criar paciente
                  </Button>
                ) : (
                  <Button type="button" onClick={handleNext}>
                    {getFooterPrimaryLabel(currentStep)}
                    <IconChevronRight data-icon="inline-end" />
                  </Button>
                ))}
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
