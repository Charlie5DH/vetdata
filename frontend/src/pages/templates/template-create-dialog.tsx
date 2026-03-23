import { useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { MeasureForm } from "@/components/measures/measure-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateMeasure,
  useCreateTemplate,
  useMeasures,
} from "@/api/templates";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconLoader2, IconPlus, IconSearch } from "@tabler/icons-react";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  measure_ids: z.array(z.string()).default([]),
  thresholds: z
    .record(
      z.string(),
      z.object({
        lower_limit: z.string().optional(),
        upper_limit: z.string().optional(),
      }),
    )
    .default({}),
});

type FormValues = z.infer<typeof formSchema>;

function toOptionalNumber(value?: string) {
  if (!value?.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

interface TemplateCreateDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function getLimitPlaceholder(limit?: number | null) {
  if (limit === null || limit === undefined) {
    return "Herda da medida";
  }

  return `Padrão: ${limit}`;
}

export function TemplateCreateDialog({
  children,
  open: controlledOpen,
  onOpenChange,
}: TemplateCreateDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMeasureSheetOpen, setIsMeasureSheetOpen] = useState(false);

  // Use controlled open if provided, otherwise use internal state
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const { data: measures, isLoading: isLoadingMeasures } = useMeasures();
  const createTemplate = useCreateTemplate();
  const createMeasure = useCreateMeasure();

  const {
    control,
    handleSubmit,
    reset,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      name: "",
      description: "",
      measure_ids: [],
      thresholds: {},
    },
  });

  const onSubmit = (data: FormValues) => {
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

    createTemplate.mutate(
      {
        name: data.name,
        description: data.description,
        template_measures: templateMeasures,
      },
      {
        onSuccess: () => {
          toast.success("Modelo criado com sucesso!");
          setOpen(false);
          reset();
        },
        onError: (error: unknown) => {
          toast.error(
            error instanceof Error ? error.message : "Erro ao criar modelo",
          );
          console.error(error);
        },
      },
    );
  };

  const filteredMeasures = measures?.filter((measure) =>
    measure.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const selectedMeasureIds = watch("measure_ids") || [];

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
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Criar Novo Modelo</DialogTitle>
          <DialogDescription>
            Crie um novo modelo e selecione as medidas associadas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input id="name" placeholder="Ex: Padrão Felino" {...field} />
              )}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="description"
                  placeholder="Descrição opcional..."
                  {...field}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label>Medidas Associadas</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsMeasureSheetOpen(true)}
              >
                <IconPlus className="h-4 w-4" />
                Criar medida
              </Button>
            </div>
            <div className="relative">
              <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar medidas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <ScrollArea className="h-50 rounded-md border p-4">
              {isLoadingMeasures ? (
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
                            <div
                              key={measure.id}
                              className="rounded-md border p-3"
                            >
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  id={measure.id}
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
                                    htmlFor={measure.id}
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
                                      Opcional: sobrescreva os limites desta
                                      medida apenas para este modelo.
                                    </p>
                                  )}
                                </div>
                              </div>

                              {selectedMeasureIds.includes(measure.id) &&
                                measure.data_type === "number" && (
                                  <div className="mt-3 grid grid-cols-1 gap-3 pl-7 sm:grid-cols-2">
                                    <div className="space-y-2">
                                      <Label htmlFor={`${measure.id}-lower`}>
                                        Limite inferior do modelo
                                      </Label>
                                      <Input
                                        id={`${measure.id}-lower`}
                                        type="number"
                                        inputMode="decimal"
                                        placeholder={getLimitPlaceholder(
                                          measure.lower_limit,
                                        )}
                                        {...register(
                                          `thresholds.${measure.id}.lower_limit` as const,
                                        )}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor={`${measure.id}-upper`}>
                                        Limite superior do modelo
                                      </Label>
                                      <Input
                                        id={`${measure.id}-upper`}
                                        type="number"
                                        inputMode="decimal"
                                        placeholder={getLimitPlaceholder(
                                          measure.upper_limit,
                                        )}
                                        {...register(
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
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createTemplate.isPending}>
              {createTemplate.isPending && (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Criar Modelo
            </Button>
          </DialogFooter>
        </form>

        <Sheet open={isMeasureSheetOpen} onOpenChange={setIsMeasureSheetOpen}>
          <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
            <SheetHeader>
              <SheetTitle>Criar medida</SheetTitle>
              <SheetDescription>
                Cadastre uma nova medida sem sair da criação do modelo.
              </SheetDescription>
            </SheetHeader>
            <div className="p-6 pt-0">
              <MeasureForm
                submitLabel="Criar Medida"
                isSubmitting={createMeasure.isPending}
                onCancel={() => setIsMeasureSheetOpen(false)}
                onSubmit={async (payload) => {
                  try {
                    const measure = await createMeasure.mutateAsync(payload);
                    const currentMeasureIds = watch("measure_ids") || [];

                    setValue(
                      "measure_ids",
                      currentMeasureIds.includes(measure.id)
                        ? currentMeasureIds
                        : [...currentMeasureIds, measure.id],
                    );
                    setSearchTerm("");
                    setIsMeasureSheetOpen(false);
                    toast.success("Medida criada e adicionada ao modelo!");
                  } catch (error) {
                    console.error(error);
                    toast.error("Erro ao criar medida. Tente novamente.");
                  }
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      </DialogContent>
    </Dialog>
  );
}
