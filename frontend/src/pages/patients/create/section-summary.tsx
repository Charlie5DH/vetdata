import type { UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { formatAgeShort, formatWeight } from "@/components/patients/patient-format";
import { useOwners } from "@/api/owners";
import { useTemplates } from "@/api/templates";
import type { PatientCreateFormValues } from "./schema";

interface SectionSummaryProps {
  form: UseFormReturn<PatientCreateFormValues>;
  step?: string;
}

export function SectionSummary({ form, step }: SectionSummaryProps) {
  const values = useWatch({ control: form.control });
  const { data: owners } = useOwners();
  const { data: templates } = useTemplates();

  const selectedOwner = owners?.find((o) => String(o.id) === values.owner_id);
  const selectedTemplate = templates?.find(
    (t) => String(t.id) === values.template_id && values.template_id !== "none",
  );
  let ownerSummary: React.ReactNode = (
    <p className="text-sm text-muted-foreground">Nenhum tutor selecionado</p>
  );

  if (values.owner_mode === "existing" && selectedOwner) {
    ownerSummary = (
      <p className="text-sm">
        {selectedOwner.first_name} {selectedOwner.last_name} (
        {selectedOwner.email})
      </p>
    );
  }

  if (values.owner_mode === "new") {
    ownerSummary = (
      <p className="text-sm">
        {values.new_owner_first_name || "—"} {values.new_owner_last_name || ""}{" "}
        {values.new_owner_email ? `(${values.new_owner_email})` : ""}
        <span className="ml-2 text-xs text-muted-foreground">(novo)</span>
      </p>
    );
  }

  return (
    <Card id="resumo">
      <CardHeader>
        <CardTitle>
          {step && (
            <span className="mr-2 font-medium text-muted-foreground tabular-nums">
              {step}.
            </span>
          )}
          Resumo
        </CardTitle>
        <CardDescription>
          Confirme as informações antes de criar o paciente.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-border">
        <SummaryGroup title="Tutor">{ownerSummary}</SummaryGroup>

        <SummaryGroup title="Paciente">
          <SummaryRow label="Nome">{values.name || "—"}</SummaryRow>
          <SummaryRow label="Espécie">{values.species || "—"}</SummaryRow>
          <SummaryRow label="Raça">{values.breed || "—"}</SummaryRow>
          <SummaryRow label="Peso">
            {formatWeight(values.weight_kg) ? (
              <span className="tabular-nums">
                {formatWeight(values.weight_kg)} kg
              </span>
            ) : (
              "—"
            )}
          </SummaryRow>
          <SummaryRow label="Idade">
            {formatAgeShort(values.age_years, values.age_months)}
          </SummaryRow>
        </SummaryGroup>

        <SummaryGroup title="Tratamento">
          <SummaryRow label="Motivo">{values.motive || "—"}</SummaryRow>
          <SummaryRow label="Notas">{values.notes || "—"}</SummaryRow>
          <SummaryRow label="Modelo">
            {selectedTemplate ? selectedTemplate.name : "Nenhum"}
          </SummaryRow>
        </SummaryGroup>
      </CardContent>
    </Card>
  );
}

function SummaryGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 py-3.5 first:pt-0 last:pb-0">
      <h4 className="text-[13px] font-semibold text-foreground">{title}</h4>
      {children}
    </div>
  );
}

function SummaryRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[96px_1fr] gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words text-foreground">{children}</span>
    </div>
  );
}
