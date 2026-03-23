import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Bird, Cat, Dog, PawPrint } from "lucide-react";

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
import type { PatientCreateFormValues } from "./schema";

const speciesOptions = [
  { label: "Cachorro", value: "Cachorro", icon: Dog },
  { label: "Gato", value: "Gato", icon: Cat },
  { label: "Cavalo", value: "Cavalo", icon: PawPrint },
  { label: "Pássaro", value: "Pássaro", icon: Bird },
  { label: "Outro", value: "Outro", icon: PawPrint },
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
          {step && <span className="mr-2 text-muted-foreground">{step}.</span>}
          Informações do Paciente
        </CardTitle>
        <CardDescription>Dados básicos do animal.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" {...register("name")} placeholder="Nome do pet" />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="species">Espécie *</Label>
            <Controller
              name="species"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="species">
                    {selectedSpecies ? (
                      <span className="flex items-center gap-2">
                        <selectedSpecies.icon className="size-4 text-muted-foreground" />
                        <span>{selectedSpecies.label}</span>
                      </span>
                    ) : (
                      <SelectValue placeholder="Selecione a espécie" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {speciesOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <option.icon className="size-4 text-muted-foreground" />
                        <span>{option.label}</span>
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

          <div className="space-y-2">
            <Label htmlFor="breed">Raça</Label>
            <Input
              id="breed"
              {...register("breed")}
              placeholder="ex. Golden Retriever"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight_kg">Peso (kg)</Label>
            <Input
              id="weight_kg"
              type="number"
              step="0.1"
              {...register("weight_kg", { valueAsNumber: true })}
            />
          </div>

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
      </CardContent>
    </Card>
  );
}
