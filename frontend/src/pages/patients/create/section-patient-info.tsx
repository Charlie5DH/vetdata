import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import {
  BirdIcon,
  CatIcon,
  DogIcon,
  PawIcon,
} from "@/components/icons/vetdata-icons";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FieldError } from "./field-error";
import type { PatientCreateFormValues } from "./schema";

const speciesOptions = [
  { label: "Cachorro", value: "Cachorro", icon: DogIcon },
  { label: "Gato", value: "Gato", icon: CatIcon },
  { label: "Cavalo", value: "Cavalo", icon: PawIcon },
  { label: "Pássaro", value: "Pássaro", icon: BirdIcon },
  { label: "Outro", value: "Outro", icon: PawIcon },
] as const;

interface SectionPatientInfoProps {
  form: UseFormReturn<PatientCreateFormValues>;
  step?: string;
}

export function SectionPatientInfo({ form, step }: SectionPatientInfoProps) {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const selectedSpecies = speciesOptions.find(
    (option) => option.value === form.watch("species"),
  );

  return (
    <Card id="paciente">
      <CardHeader>
        <CardTitle>
          {step && (
            <span className="mr-2 font-medium text-muted-foreground tabular-nums">
              {step}.
            </span>
          )}
          Informações do paciente
        </CardTitle>
        <CardDescription>Dados básicos do animal.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" {...register("name")} placeholder="Nome do pet" />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="species">Espécie *</Label>
            <Controller
              name="species"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="species">
                    {selectedSpecies ? (
                      <span className="flex items-center gap-2">
                        <selectedSpecies.icon size={16} className="text-muted-foreground" />
                        <span>{selectedSpecies.label}</span>
                      </span>
                    ) : (
                      <SelectValue placeholder="Selecione a espécie" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {speciesOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <option.icon size={16} className="text-muted-foreground" />
                        <span>{option.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.species?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="breed">Raça</Label>
            <Input
              id="breed"
              {...register("breed")}
              placeholder="ex. Golden Retriever"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="weight_kg">Peso</Label>
            <div className="relative">
              <Input
                id="weight_kg"
                type="number"
                step="0.1"
                className="pr-12 tabular-nums"
                {...register("weight_kg", { valueAsNumber: true })}
              />
              <span className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-[13px] text-muted-foreground">
                kg
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="age_years">Idade (anos)</Label>
            <Input
              id="age_years"
              type="number"
              {...register("age_years", { valueAsNumber: true })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="age_months">Idade (meses)</Label>
            <Input
              id="age_months"
              type="number"
              max={11}
              {...register("age_months", { valueAsNumber: true })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
