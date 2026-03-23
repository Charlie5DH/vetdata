import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Controller, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useMeasures } from "@/api/templates";
import { IconLoader2, IconSearch } from "@tabler/icons-react";
import type { TemplateCreateFormValues } from "./schema";

interface SectionMeasuresProps {
  form: UseFormReturn<TemplateCreateFormValues>;
  step?: string;
}

function getLimitPlaceholder(limit?: number | null) {
  if (limit === null || limit === undefined) {
    return "Herda da medida";
  }

  return `Padrão: ${limit}`;
}

export function SectionMeasures({ form, step }: SectionMeasuresProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: measures, isLoading } = useMeasures();
  const { control } = form;
  const selectedMeasureIds =
    useWatch({
      control,
      name: "measure_ids",
    }) || [];

  const filteredMeasures = measures?.filter((measure) =>
    measure.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleMeasureSelection = (
    currentValue: string[],
    measureId: string,
    checked: boolean | "indeterminate",
  ) => {
    if (checked) {
      return [...currentValue, measureId];
    }

    return currentValue.filter((id) => id !== measureId);
  };

  return (
    <Card id="medidas">
      <CardHeader>
        <CardTitle>
          {step && <span className="mr-2 text-muted-foreground">{step}.</span>}
          Medidas Associadas
        </CardTitle>
        <CardDescription>
          Selecione as medidas que fazem parte deste modelo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar medidas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <ScrollArea className="rounded-md border p-4 h-75">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <IconLoader2 className="animate-spin h-4 w-4" />
            </div>
          ) : (
            <div className="space-y-4">
              <Controller
                name="measure_ids"
                control={control}
                render={({ field }) => (
                  <>
                    {filteredMeasures?.map((measure) => {
                      const isChecked = field.value?.includes(measure.id);

                      return (
                        <div key={measure.id} className="rounded-md border p-3">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id={`measure-${measure.id}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                field.onChange(
                                  toggleMeasureSelection(
                                    field.value || [],
                                    measure.id,
                                    checked,
                                  ),
                                );
                              }}
                            />
                            <div className="flex-1">
                              <Label
                                htmlFor={`measure-${measure.id}`}
                                className="cursor-pointer text-sm font-normal"
                              >
                                {measure.name}
                                {measure.unit && (
                                  <span className="ml-1 text-muted-foreground">
                                    ({measure.unit})
                                  </span>
                                )}
                              </Label>
                              {measure.data_type === "number" && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Opcional: defina limites específicos deste
                                  modelo ou deixe em branco para usar os limites
                                  padrão da medida.
                                </p>
                              )}
                            </div>
                          </div>

                          {selectedMeasureIds.includes(measure.id) &&
                            measure.data_type === "number" && (
                              <div className="mt-3 grid grid-cols-1 gap-3 pl-7 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`measure-${measure.id}-lower`}
                                  >
                                    Limite inferior do modelo
                                  </Label>
                                  <Input
                                    id={`measure-${measure.id}-lower`}
                                    type="number"
                                    inputMode="decimal"
                                    placeholder={getLimitPlaceholder(
                                      measure.lower_limit,
                                    )}
                                    {...form.register(
                                      `thresholds.${measure.id}.lower_limit` as const,
                                    )}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`measure-${measure.id}-upper`}
                                  >
                                    Limite superior do modelo
                                  </Label>
                                  <Input
                                    id={`measure-${measure.id}-upper`}
                                    type="number"
                                    inputMode="decimal"
                                    placeholder={getLimitPlaceholder(
                                      measure.upper_limit,
                                    )}
                                    {...form.register(
                                      `thresholds.${measure.id}.upper_limit` as const,
                                    )}
                                  />
                                </div>
                              </div>
                            )}
                        </div>
                      );
                    })}
                    {filteredMeasures?.length === 0 && (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        Nenhuma medida encontrada.
                      </div>
                    )}
                  </>
                )}
              />
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
