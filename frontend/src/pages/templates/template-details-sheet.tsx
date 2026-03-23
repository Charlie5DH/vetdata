import { useMemo, useState } from "react";
import { IconEdit, IconLoader2, IconX } from "@tabler/icons-react";
import { toast } from "sonner";

import { useMeasures, useUpdateTemplate } from "@/api/templates";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { Template } from "@/types/template";

const DATA_TYPE_LABELS: Record<string, string> = {
  number: "Number",
  text: "Text",
  boolean: "Boolean",
  select: "Select",
};

type ThresholdDraft = {
  lower_limit?: string;
  upper_limit?: string;
};

interface TemplateDetailsSheetProps {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getLimitPlaceholder(limit?: number | null) {
  if (limit === null || limit === undefined) {
    return "Herda da medida";
  }

  return `Padrão: ${limit}`;
}

function toOptionalNumber(value?: string) {
  if (!value?.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function buildThresholdState(template: Template) {
  return Object.fromEntries(
    (template.template_measures ?? []).map((item) => [
      item.measure_id,
      {
        lower_limit:
          item.lower_limit !== null && item.lower_limit !== undefined
            ? String(item.lower_limit)
            : "",
        upper_limit:
          item.upper_limit !== null && item.upper_limit !== undefined
            ? String(item.upper_limit)
            : "",
      },
    ]),
  ) as Record<string, ThresholdDraft>;
}

function buildSelectedMeasureIds(template: Template) {
  return [...(template.template_measures ?? [])]
    .sort(
      (left, right) => (left.display_order || 0) - (right.display_order || 0),
    )
    .map((item) => item.measure_id);
}

function TemplateDetailsSheetEditor({
  template,
  open,
  onOpenChange,
}: {
  template: Template;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: measures = [] } = useMeasures();
  const updateTemplate = useUpdateTemplate(template.id);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description || "");
  const [selectedMeasureIds, setSelectedMeasureIds] = useState<string[]>(
    buildSelectedMeasureIds(template),
  );
  const [thresholds, setThresholds] = useState<Record<string, ThresholdDraft>>(
    buildThresholdState(template),
  );

  const sortedTemplateMeasures = useMemo(
    () =>
      [...(template.template_measures ?? [])].sort(
        (left, right) => (left.display_order || 0) - (right.display_order || 0),
      ),
    [template.template_measures],
  );

  const filteredMeasures = useMemo(
    () =>
      measures.filter((measure) =>
        measure.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [measures, searchTerm],
  );

  const resetEditorState = () => {
    setIsEditing(false);
    setSearchTerm("");
    setName(template.name);
    setDescription(template.description || "");
    setSelectedMeasureIds(buildSelectedMeasureIds(template));
    setThresholds(buildThresholdState(template));
  };

  const toggleMeasureSelection = (
    measureId: string,
    checked: boolean | "indeterminate",
  ) => {
    setSelectedMeasureIds((current) => {
      if (checked) {
        return current.includes(measureId) ? current : [...current, measureId];
      }

      return current.filter((id) => id !== measureId);
    });
  };

  const updateThreshold = (
    measureId: string,
    key: keyof ThresholdDraft,
    value: string,
  ) => {
    setThresholds((current) => ({
      ...current,
      [measureId]: {
        ...current[measureId],
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      const templateMeasures = selectedMeasureIds.map((measureId, index) => {
        const override = thresholds[measureId];
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

      await updateTemplate.mutateAsync({
        name,
        description,
        template_measures: templateMeasures,
      });

      toast.success("Modelo atualizado com sucesso!");
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar modelo",
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full pl-20 sm:w-[50vw] sm:max-w-[50vw]">
        <SheetHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <SheetTitle className="text-xl">
                {isEditing ? "Editar modelo" : template.name}
              </SheetTitle>
              {!isEditing && template.description ? (
                <SheetDescription>{template.description}</SheetDescription>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={resetEditorState}>
                    <IconX data-icon="inline-start" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={updateTemplate.isPending}
                  >
                    {updateTemplate.isPending ? (
                      <IconLoader2
                        data-icon="inline-start"
                        className="animate-spin"
                      />
                    ) : null}
                    Salvar
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <IconEdit data-icon="inline-start" />
                  Editar
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Nome</Label>
                <Input
                  id="template-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-description">Descrição</Label>
                <Textarea
                  id="template-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-search">Medidas associadas</Label>
                <Input
                  id="template-search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar medidas..."
                />
              </div>
              <ScrollArea className="h-80 rounded-md border p-4">
                <div className="space-y-4">
                  {filteredMeasures.map((measure) => (
                    <div key={measure.id} className="rounded-md border p-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`template-edit-${measure.id}`}
                          checked={selectedMeasureIds.includes(measure.id)}
                          onCheckedChange={(checked) =>
                            toggleMeasureSelection(measure.id, checked)
                          }
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={`template-edit-${measure.id}`}
                            className="cursor-pointer text-sm font-normal"
                          >
                            {measure.name}
                            {measure.unit ? (
                              <span className="ml-1 text-muted-foreground">
                                ({measure.unit})
                              </span>
                            ) : null}
                          </Label>
                          {measure.data_type === "number" ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Opcional: sobrescreva os limites desta medida
                              apenas para este modelo.
                            </p>
                          ) : null}
                        </div>
                      </div>

                      {selectedMeasureIds.includes(measure.id) &&
                      measure.data_type === "number" ? (
                        <div className="mt-3 grid grid-cols-1 gap-3 pl-7 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label
                              htmlFor={`template-edit-${measure.id}-lower`}
                            >
                              Limite inferior do modelo
                            </Label>
                            <Input
                              id={`template-edit-${measure.id}-lower`}
                              type="number"
                              inputMode="decimal"
                              value={thresholds[measure.id]?.lower_limit || ""}
                              onChange={(event) =>
                                updateThreshold(
                                  measure.id,
                                  "lower_limit",
                                  event.target.value,
                                )
                              }
                              placeholder={getLimitPlaceholder(
                                measure.lower_limit,
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor={`template-edit-${measure.id}-upper`}
                            >
                              Limite superior do modelo
                            </Label>
                            <Input
                              id={`template-edit-${measure.id}-upper`}
                              type="number"
                              inputMode="decimal"
                              value={thresholds[measure.id]?.upper_limit || ""}
                              onChange={(event) =>
                                updateThreshold(
                                  measure.id,
                                  "upper_limit",
                                  event.target.value,
                                )
                              }
                              placeholder={getLimitPlaceholder(
                                measure.upper_limit,
                              )}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : null}

          <div>
            <h3 className="mb-3 text-sm font-medium">Medidas Associadas</h3>
            <ScrollArea
              className="pr-4"
              style={{ height: "calc(100vh - 200px)" }}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {!template.template_measures ||
                template.template_measures.length === 0 ? (
                  <p className="col-span-full text-sm text-muted-foreground">
                    Nenhuma medida associada.
                  </p>
                ) : (
                  sortedTemplateMeasures.map((templateMeasure) => (
                    <div
                      key={templateMeasure.id}
                      className="flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm"
                    >
                      <span className="font-medium">
                        {templateMeasure.measure?.name || "Medida desconhecida"}
                      </span>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {templateMeasure.measure?.unit ? (
                          <span>Unidade: {templateMeasure.measure.unit}</span>
                        ) : null}
                        <div className="flex items-center gap-1">
                          <span>Tipo:</span>
                          <span>
                            {DATA_TYPE_LABELS[
                              templateMeasure.measure?.data_type || ""
                            ] || templateMeasure.measure?.data_type}
                          </span>
                        </div>
                        {templateMeasure.lower_limit !== null &&
                        templateMeasure.lower_limit !== undefined ? (
                          <span>
                            Limite inferior: {templateMeasure.lower_limit}
                          </span>
                        ) : null}
                        {templateMeasure.upper_limit !== null &&
                        templateMeasure.upper_limit !== undefined ? (
                          <span>
                            Limite superior: {templateMeasure.upper_limit}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <Separator />

          <div className="text-xs text-muted-foreground">
            Criado em: {new Date(template.created_at).toLocaleDateString()}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function TemplateDetailsSheet({
  template,
  open,
  onOpenChange,
}: TemplateDetailsSheetProps) {
  if (!template) {
    return null;
  }

  return (
    <TemplateDetailsSheetEditor
      key={`${template.id}-${open ? "open" : "closed"}`}
      template={template}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
