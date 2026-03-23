import type { UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useMeasures } from "@/api/templates";
import { IconLoader2 } from "@tabler/icons-react";
import type { TemplateCreateFormValues } from "./schema";

interface SectionSummaryProps {
  form: UseFormReturn<TemplateCreateFormValues>;
  isSubmitting: boolean;
  step?: string;
}

export function SectionSummary({
  form,
  isSubmitting,
  step,
}: SectionSummaryProps) {
  const values = useWatch({ control: form.control });
  const { data: measures } = useMeasures();

  const selectedMeasures = measures?.filter((m) =>
    values.measure_ids?.includes(m.id),
  );

  return (
    <Card id="resumo">
      <CardHeader>
        <CardTitle>
          {step && <span className="mr-2 text-muted-foreground">{step}.</span>}
          Resumo
        </CardTitle>
        <CardDescription>
          Confirme as informações antes de criar o modelo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            Informações Gerais
          </h4>
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-muted-foreground">Nome:</span>{" "}
              {values.name || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Descrição:</span>{" "}
              {values.description || "—"}
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            Medidas ({selectedMeasures?.length || 0})
          </h4>
          {selectedMeasures && selectedMeasures.length > 0 ? (
            <div className="space-y-3">
              {selectedMeasures.map((measure) => (
                <div
                  key={measure.id}
                  className="flex flex-wrap items-center gap-2 rounded-md border p-3"
                >
                  <Badge variant="secondary">
                    {measure.name}
                    {measure.unit && (
                      <span className="text-muted-foreground ml-1">
                        ({measure.unit})
                      </span>
                    )}
                  </Badge>
                  {measure.data_type === "number" && (
                    <span className="text-sm text-muted-foreground">
                      Limites do modelo:{" "}
                      {values.thresholds?.[measure.id]?.lower_limit?.trim() ||
                        "padrão"}
                      {" - "}
                      {values.thresholds?.[measure.id]?.upper_limit?.trim() ||
                        "padrão"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma medida selecionada.
            </p>
          )}
        </div>

        <Separator />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && (
            <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Criar Modelo
        </Button>
      </CardContent>
    </Card>
  );
}
