import { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Controller, useFieldArray, useWatch } from "react-hook-form";
import { IconPlus, IconTrash } from "@tabler/icons-react";

import { useVaccineCatalog } from "@/api/vaccines";
import { speciesMatches } from "@/lib/species";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { PatientCreateFormValues } from "./schema";

interface SectionVaccinesProps {
  form: UseFormReturn<PatientCreateFormValues>;
  step?: string;
}

export function SectionVaccines({ form, step }: SectionVaccinesProps) {
  const { register, control } = form;
  const species = useWatch({ control, name: "species" });
  const { data: catalog } = useVaccineCatalog();

  const filteredCatalog = useMemo(() => {
    if (!catalog) return [];
    if (!species) return catalog;
    return catalog.filter((v) => speciesMatches(v.species, species));
  }, [catalog, species]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "initial_vaccinations",
  });

  return (
    <Card id="vacinas">
      <CardHeader>
        <CardTitle>
          {step && <span className="mr-2 text-muted-foreground">{step}.</span>}
          Vacinas
        </CardTitle>
        <CardDescription>
          Registre o histórico de vacinação do paciente — opcional. Você poderá
          adicionar mais depois.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="vaccine_notes">Histórico de vacinas (texto livre)</Label>
          <Textarea
            id="vaccine_notes"
            {...register("vaccine_notes")}
            placeholder="Ex: V10 aplicada em 2025; antirrábica em dia."
          />
        </div>

        <div className="space-y-2 border-t pt-4">
          <div className="flex items-center justify-between">
            <Label>Vacinas já aplicadas (selecionar do catálogo)</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                append({
                  vaccine_id: "",
                  applied_at: new Date().toISOString().slice(0, 10),
                })
              }
              disabled={!filteredCatalog.length}
            >
              <IconPlus className="mr-1 h-4 w-4" />
              Adicionar vacina
            </Button>
          </div>

          {fields.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Nenhuma vacina selecionada. Use o botão acima para adicionar uma do
              catálogo {species ? `de ${species}` : ""}.
            </p>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-2 rounded-md border bg-card/50 p-3 sm:grid-cols-[1fr_180px_auto] sm:items-end"
                >
                  <div className="space-y-1">
                    <Label htmlFor={`initial_vaccinations.${index}.vaccine_id`}>
                      Vacina
                    </Label>
                    <Controller
                      control={control}
                      name={`initial_vaccinations.${index}.vaccine_id`}
                      render={({ field: ctrl }) => (
                        <Select value={ctrl.value} onValueChange={ctrl.onChange}>
                          <SelectTrigger
                            id={`initial_vaccinations.${index}.vaccine_id`}
                          >
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredCatalog.map((v) => (
                              <SelectItem key={v.id} value={v.id}>
                                {v.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`initial_vaccinations.${index}.applied_at`}>
                      Aplicada em
                    </Label>
                    <Input
                      id={`initial_vaccinations.${index}.applied_at`}
                      type="date"
                      {...register(
                        `initial_vaccinations.${index}.applied_at` as const,
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    aria-label="Remover vacina"
                  >
                    <IconTrash className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
