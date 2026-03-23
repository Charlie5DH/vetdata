import type { UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  let ownerSummary = (
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
          {step && <span className="mr-2 text-muted-foreground">{step}.</span>}
          Resumo
        </CardTitle>
        <CardDescription>
          Confirme as informações antes de criar o paciente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Owner Summary */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            Tutor
          </h4>
          {ownerSummary}
        </div>

        <Separator />

        {/* Patient Summary */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            Paciente
          </h4>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
            <div>
              <span className="text-muted-foreground">Nome:</span>{" "}
              {values.name || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Espécie:</span>{" "}
              {values.species || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Raça:</span>{" "}
              {values.breed || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Peso:</span>{" "}
              {values.weight_kg ? `${values.weight_kg} kg` : "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Idade:</span>{" "}
              {values.age_years ? `${values.age_years}a` : ""}
              {values.age_months ? ` ${values.age_months}m` : ""}
              {!values.age_years && !values.age_months ? "—" : ""}
            </div>
          </div>
        </div>

        <Separator />

        {/* Treatment Summary */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            Tratamento
          </h4>
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-muted-foreground">Motivo:</span>{" "}
              {values.motive || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Notas:</span>{" "}
              {values.notes || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Modelo:</span>{" "}
              {selectedTemplate ? selectedTemplate.name : "Nenhum"}
            </div>
          </div>
        </div>

        <Separator />
      </CardContent>
    </Card>
  );
}
