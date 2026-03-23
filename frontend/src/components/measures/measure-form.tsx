import { useMemo } from "react";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconCheck,
  IconLoader2,
  IconPlus,
  IconRuler,
} from "@tabler/icons-react";
import * as z from "zod";

import type { Measure, MeasureCreate } from "@/types/template";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { themeAccentClasses } from "@/lib/theme-styles";

const measureTypeValues = ["number", "text", "select", "boolean"] as const;

const measureTypes = [
  { value: "number", label: "Número" },
  { value: "text", label: "Texto" },
  { value: "select", label: "Seleção" },
  { value: "boolean", label: "Booleano" },
] as const;

type MeasureFormValues = {
  name: string;
  unit: string;
  data_type: (typeof measureTypeValues)[number];
  options_text: string;
  lower_limit: string;
  upper_limit: string;
};

const measureFormSchema = z
  .object({
    name: z.string().trim().min(1, "Nome da medida é obrigatório."),
    unit: z.string(),
    data_type: z.enum(measureTypeValues),
    options_text: z.string(),
    lower_limit: z.string(),
    upper_limit: z.string(),
  })
  .superRefine((values, ctx) => {
    if (
      values.data_type === "select" &&
      parseMeasureOptions(values.options_text).length === 0
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Informe ao menos uma opção para medidas do tipo seleção.",
        path: ["options_text"],
      });
    }

    const lowerLimit = parseOptionalNumber(values.lower_limit);
    const upperLimit = parseOptionalNumber(values.upper_limit);

    if (
      values.data_type === "number" &&
      values.lower_limit &&
      lowerLimit === undefined
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Informe um número válido para o limite inferior.",
        path: ["lower_limit"],
      });
    }

    if (
      values.data_type === "number" &&
      values.upper_limit &&
      upperLimit === undefined
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Informe um número válido para o limite superior.",
        path: ["upper_limit"],
      });
    }

    if (
      values.data_type === "number" &&
      lowerLimit !== undefined &&
      upperLimit !== undefined &&
      lowerLimit > upperLimit
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "O limite superior deve ser maior ou igual ao limite inferior.",
        path: ["upper_limit"],
      });
    }
  });

function parseOptionalNumber(value?: string) {
  if (!value?.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseMeasureOptions(optionsText?: string) {
  return (optionsText ?? "")
    .split(/\r?\n|,/)
    .map((option) => option.trim())
    .filter(Boolean);
}

function stringifyMeasureOptions(options?: Measure["options"]) {
  if (!options) {
    return "";
  }

  if (Array.isArray(options)) {
    return options.join("\n");
  }

  if (typeof options === "string") {
    return options;
  }

  return JSON.stringify(options, null, 2);
}

function toFormValues(initialMeasure?: Partial<Measure>): MeasureFormValues {
  const normalizedType =
    initialMeasure?.data_type &&
    measureTypeValues.includes(
      initialMeasure.data_type as (typeof measureTypeValues)[number],
    )
      ? (initialMeasure.data_type as (typeof measureTypeValues)[number])
      : "number";

  return {
    name: initialMeasure?.name ?? "",
    unit: initialMeasure?.unit ?? "",
    data_type: normalizedType,
    options_text: stringifyMeasureOptions(initialMeasure?.options),
    lower_limit:
      initialMeasure?.lower_limit === null ||
      initialMeasure?.lower_limit === undefined
        ? ""
        : String(initialMeasure.lower_limit),
    upper_limit:
      initialMeasure?.upper_limit === null ||
      initialMeasure?.upper_limit === undefined
        ? ""
        : String(initialMeasure.upper_limit),
  };
}

function toPayload(values: MeasureFormValues): MeasureCreate {
  const options = parseMeasureOptions(values.options_text);

  return {
    name: values.name.trim(),
    unit: values.unit.trim() || undefined,
    data_type: values.data_type,
    options: values.data_type === "select" ? options : undefined,
    lower_limit:
      values.data_type === "number"
        ? parseOptionalNumber(values.lower_limit)
        : undefined,
    upper_limit:
      values.data_type === "number"
        ? parseOptionalNumber(values.upper_limit)
        : undefined,
  };
}

interface MeasureFormProps {
  initialMeasure?: Partial<Measure>;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (payload: MeasureCreate) => Promise<void> | void;
  onCancel?: () => void;
  cancelLabel?: string;
}

export function MeasureForm({
  initialMeasure,
  submitLabel,
  isSubmitting = false,
  onSubmit,
  onCancel,
  cancelLabel = "Cancelar",
}: MeasureFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MeasureFormValues>({
    resolver: zodResolver(measureFormSchema) as Resolver<MeasureFormValues>,
    defaultValues: toFormValues(initialMeasure),
  });

  const selectedType = useWatch({ control, name: "data_type" });
  const optionsText = useWatch({ control, name: "options_text" });
  const parsedOptions = useMemo(
    () => parseMeasureOptions(optionsText),
    [optionsText],
  );
  const showNumericLimits = selectedType === "number";
  const showOptions = selectedType === "select";

  const submitHandler = handleSubmit(async (values: MeasureFormValues) => {
    await onSubmit(toPayload(values));
  });

  return (
    <form onSubmit={submitHandler} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${themeAccentClasses.chart3.icon}`}>
              <IconRuler className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Informações da medida</CardTitle>
              <CardDescription>
                Defina o nome, tipo e os parâmetros usados para monitoramento.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="measure-name">Nome *</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="measure-name"
                    placeholder="Ex.: Frequência Cardíaca"
                    aria-invalid={Boolean(errors.name)}
                  />
                )}
              />
              {errors.name ? (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="measure-type">Tipo *</Label>
              <Controller
                name="data_type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="measure-type"
                      className="w-full"
                      aria-invalid={Boolean(errors.data_type)}
                    >
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {measureTypes.map((measureType) => (
                        <SelectItem
                          key={measureType.value}
                          value={measureType.value}
                        >
                          {measureType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.data_type ? (
                <p className="text-sm text-destructive">
                  {errors.data_type.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="measure-unit">Unidade</Label>
              <Controller
                name="unit"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="measure-unit"
                    placeholder="Ex.: bpm, °C, mmHg"
                  />
                )}
              />
            </div>

            {showNumericLimits ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="lower-limit">Limite inferior</Label>
                  <Controller
                    name="lower_limit"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="lower-limit"
                        type="number"
                        inputMode="decimal"
                        placeholder="Opcional"
                        aria-invalid={Boolean(errors.lower_limit)}
                      />
                    )}
                  />
                  {errors.lower_limit ? (
                    <p className="text-sm text-destructive">
                      {errors.lower_limit.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upper-limit">Limite superior</Label>
                  <Controller
                    name="upper_limit"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="upper-limit"
                        type="number"
                        inputMode="decimal"
                        placeholder="Opcional"
                        aria-invalid={Boolean(errors.upper_limit)}
                      />
                    )}
                  />
                  {errors.upper_limit ? (
                    <p className="text-sm text-destructive">
                      {errors.upper_limit.message}
                    </p>
                  ) : null}
                </div>
              </>
            ) : null}

            {showOptions ? (
              <div className="space-y-3 md:col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="measure-options">Opções *</Label>
                  <Controller
                    name="options_text"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        id="measure-options"
                        placeholder="Uma opção por linha ou separadas por vírgula"
                        aria-invalid={Boolean(errors.options_text)}
                      />
                    )}
                  />
                  {errors.options_text ? (
                    <p className="text-sm text-destructive">
                      {errors.options_text.message}
                    </p>
                  ) : null}
                </div>
                <Alert>
                  <IconPlus />
                  <AlertTitle>Pré-visualização das opções</AlertTitle>
                  <AlertDescription>
                    {parsedOptions.length > 0
                      ? parsedOptions.join(", ")
                      : "As opções aparecerão aqui conforme forem digitadas."}
                  </AlertDescription>
                </Alert>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-end gap-3">
            {onCancel ? (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                {cancelLabel}
              </Button>
            ) : null}
            <Button type="submit" disabled={isSubmitting} className="min-w-36">
              {isSubmitting ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <IconCheck className="mr-2 h-4 w-4" />
                  {submitLabel}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
