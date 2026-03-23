import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OwnerSelectionTable } from "./owner-selection-table";
import { Textarea } from "@/components/ui/textarea";
import { useOwners, useCreateOwner } from "@/api/owners";
import { useTemplates } from "@/api/templates";
import { useCreatePatient } from "@/api/patients";
import { useCreateTreatmentSession } from "@/api/treatments";
import { toast } from "sonner";
import { IconLoader2 } from "@tabler/icons-react";

const formSchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório"),
    species: z.string().min(1, "Espécie é obrigatória"),
    breed: z.string().optional(),
    age_years: z.number().min(0).optional(),
    age_months: z.number().min(0).max(11).optional(),
    weight_kg: z.number().min(0).optional(),
    notes: z.string().optional(),
    motive: z.string().optional(),
    template_id: z.string().optional(),
    // Owner fields
    owner_mode: z.enum(["existing", "new"]),
    owner_id: z.string().optional(),
    new_owner_first_name: z.string().optional(),
    new_owner_last_name: z.string().optional(),
    new_owner_email: z
      .union([z.string().email({ message: "Email inválido" }), z.literal("")])
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.owner_mode === "existing") {
      if (!data.owner_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Tutor é obrigatório",
          path: ["owner_id"],
        });
      }
    } else {
      if (!data.new_owner_first_name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nome é obrigatório",
          path: ["new_owner_first_name"],
        });
      }
      if (!data.new_owner_last_name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sobrenome é obrigatório",
          path: ["new_owner_last_name"],
        });
      }
      if (!data.new_owner_email) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Email é obrigatório",
          path: ["new_owner_email"],
        });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;

interface PatientCreateDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PatientCreateDialog({
  children,
  open: controlledOpen,
  onOpenChange,
}: PatientCreateDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [step, setStep] = useState(1);

  // Use controlled open if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const { data: owners } = useOwners();
  const { data: templates } = useTemplates();
  const createPatient = useCreatePatient();
  const createOwner = useCreateOwner();
  const createSession = useCreateTreatmentSession();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      species: "",
      breed: "",
      age_years: 0,
      age_months: 0,
      weight_kg: 0,
      notes: "",
      motive: "",
      owner_mode: "new",
      owner_id: "",
      new_owner_first_name: "",
      new_owner_last_name: "",
      new_owner_email: "",
      template_id: "none", // Use "none" to represent no selection if needed, or just empty string
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = form;

  const nextStep = async () => {
    let valid = false;
    if (step === 1) {
      valid = await trigger([
        "owner_mode",
        "owner_id",
        "new_owner_first_name",
        "new_owner_last_name",
        "new_owner_email",
      ]);
    } else if (step === 2) {
      valid = await trigger([
        "name",
        "species",
        "breed",
        "weight_kg",
        "age_years",
        "age_months",
      ]);
    }

    if (valid) {
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    setStep((s) => s - 1);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      let ownerId = values.owner_id;

      // 1. Create Owner if needed
      if (values.owner_mode === "new") {
        const newOwner = await createOwner.mutateAsync({
          first_name: values.new_owner_first_name!,
          last_name: values.new_owner_last_name!,
          email: values.new_owner_email!,
        });
        ownerId = newOwner.id;
      }

      if (!ownerId) {
        toast.error("Tutor é obrigatório");
        return;
      }

      // 2. Create Patient
      const patientData = {
        name: values.name,
        species: values.species,
        breed: values.breed || null,
        age_years: values.age_years || 0,
        age_months: values.age_months || 0,
        weight_kg: values.weight_kg || 0,
        notes: values.notes || null,
        motive: values.motive || null,
        owner_id: ownerId,
      };

      const newPatient = await createPatient.mutateAsync(patientData);

      // 3. Create Session if template selected
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

      setOpen(false);
      setStep(1);
      reset();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar paciente");
    }
  };

  const speciesOptions = ["Cachorro", "Gato", "Cavalo", "Pássaro", "Outro"];

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) {
          setTimeout(() => setStep(1), 300); // Reset step after animation
          reset();
        }
      }}
    >
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Paciente</DialogTitle>
          <DialogDescription>
            Siga os passos para criar um novo registro de paciente.
          </DialogDescription>
        </DialogHeader>

        {/* Steps Indicator */}
        <div className="flex items-center justify-between px-2 py-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                  step === s
                    ? "bg-primary text-primary-foreground"
                    : step > s
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {s}
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  step === s ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {s === 1 ? "Tutor" : s === 2 ? "Paciente" : "Tratamento"}
              </span>
              {s < 3 && <div className="h-[1px] w-8 bg-border mx-2" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Step 1: Owner */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="col-span-2 space-y-4">
                <Label>Tutor</Label>
                <Controller
                  name="owner_mode"
                  control={control}
                  render={({ field }) => (
                    <Tabs
                      value={field.value}
                      onValueChange={field.onChange}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="existing">
                          Selecionar Existente
                        </TabsTrigger>
                        <TabsTrigger value="new">Criar Novo</TabsTrigger>
                      </TabsList>
                      <TabsContent value="existing" className="space-y-4 mt-4">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="owner_id">Selecionar Tutor *</Label>
                          <p className="text-xs text-muted-foreground">
                            Pesquise e selecione um tutor existente na lista
                            abaixo.
                          </p>
                        </div>
                        <Controller
                          name="owner_id"
                          control={control}
                          render={({ field: selectField }) => (
                            <OwnerSelectionTable
                              owners={owners || []}
                              selectedOwnerId={selectField.value || ""}
                              onSelect={selectField.onChange}
                            />
                          )}
                        />
                        {errors.owner_id && (
                          <p className="text-sm text-destructive">
                            {errors.owner_id.message}
                          </p>
                        )}
                      </TabsContent>
                      <TabsContent value="new" className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="new_owner_first_name">Nome *</Label>
                            <Input
                              id="new_owner_first_name"
                              {...register("new_owner_first_name")}
                              placeholder="João"
                            />
                            {errors.new_owner_first_name && (
                              <p className="text-sm text-destructive">
                                {errors.new_owner_first_name.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new_owner_last_name">
                              Sobrenome *
                            </Label>
                            <Input
                              id="new_owner_last_name"
                              {...register("new_owner_last_name")}
                              placeholder="Silva"
                            />
                            {errors.new_owner_last_name && (
                              <p className="text-sm text-destructive">
                                {errors.new_owner_last_name.message}
                              </p>
                            )}
                          </div>
                          <div className="col-span-2 space-y-2">
                            <Label htmlFor="new_owner_email">Email *</Label>
                            <Input
                              id="new_owner_email"
                              type="email"
                              {...register("new_owner_email")}
                              placeholder="joao.silva@exemplo.com"
                            />
                            {errors.new_owner_email && (
                              <p className="text-sm text-destructive">
                                {errors.new_owner_email.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  )}
                />
              </div>
            </div>
          )}

          {/* Step 2: Patient */}
          {step === 2 && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Name */}
              <div className="col-span-1 space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Nome do pet"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Species */}
              <div className="col-span-1 space-y-2">
                <Label htmlFor="species">Espécie *</Label>
                <Controller
                  name="species"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="species">
                        <SelectValue placeholder="Selecione a espécie" />
                      </SelectTrigger>
                      <SelectContent>
                        {speciesOptions.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.species && (
                  <p className="text-sm text-destructive">
                    {errors.species.message}
                  </p>
                )}
              </div>

              {/* Breed */}
              <div className="col-span-1 space-y-2">
                <Label htmlFor="breed">Raça</Label>
                <Input
                  id="breed"
                  {...register("breed")}
                  placeholder="ex. Golden Retriever"
                />
              </div>

              {/* Weight */}
              <div className="col-span-1 space-y-2">
                <Label htmlFor="weight_kg">Peso (kg)</Label>
                <Input
                  id="weight_kg"
                  type="number"
                  step="0.1"
                  {...register("weight_kg", { valueAsNumber: true })}
                />
              </div>

              {/* Age */}
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age_years">Idade (Anos)</Label>
                  <Input
                    id="age_years"
                    type="number"
                    {...register("age_years", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age_months">Idade (Meses)</Label>
                  <Input
                    id="age_months"
                    type="number"
                    max={11}
                    {...register("age_months", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Treatment */}
          {step === 3 && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Motive */}
              <div className="col-span-2 space-y-2">
                <Label htmlFor="motive">Motivo</Label>
                <Input
                  id="motive"
                  {...register("motive")}
                  placeholder="Motivo da visita"
                />
              </div>

              {/* Notes */}
              <div className="col-span-2 space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  placeholder="Notas adicionais..."
                />
              </div>

              {/* Template Selection */}
              <div className="col-span-2 space-y-2 pt-4 border-t">
                <Label htmlFor="template_id">
                  Iniciar Tratamento (Opcional)
                </Label>
                <Controller
                  name="template_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "none"}
                    >
                      <SelectTrigger id="template_id">
                        <SelectValue placeholder="Selecione um modelo para iniciar imediatamente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {templates?.map((template) => (
                          <SelectItem
                            key={template.id}
                            value={String(template.id)}
                          >
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Selecionar um modelo criará automaticamente uma sessão de
                  tratamento ativa.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between sm:justify-between">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep}>
                Voltar
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
            )}

            {step < 3 ? (
              <Button type="button" onClick={nextStep}>
                Próximo
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Criar Paciente
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
