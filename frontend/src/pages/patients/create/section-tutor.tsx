import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { IconArrowRight, IconPlus, IconUserSearch } from "@tabler/icons-react";

import { useOwners } from "@/api/owners";
import { OwnerSelectionTable } from "@/components/patients/owner-selection-table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import type { PatientCreateFormValues } from "./schema";

interface StageCardProps {
  step?: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

function StageCard({ step, title, description, children }: StageCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {step && <span className="mr-2 text-muted-foreground">{step}.</span>}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

interface TutorSectionBaseProps {
  form: UseFormReturn<PatientCreateFormValues>;
  step?: string;
}

interface SectionTutorChoiceProps extends TutorSectionBaseProps {
  onChooseMode: (mode: PatientCreateFormValues["owner_mode"]) => void;
}

export function SectionTutorChoice({
  form,
  onChooseMode,
  step,
}: SectionTutorChoiceProps) {
  const ownerMode = form.watch("owner_mode");

  return (
    <StageCard
      step={step}
      title="Tutor"
      description="Escolha se você vai vincular um tutor já cadastrado ou registrar um novo tutor antes de criar o paciente."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onChooseMode("existing")}
          className={cn(
            "flex flex-col items-start gap-4 rounded-md border p-5 text-left transition-colors hover:border-primary/50 hover:bg-primary/5",
            ownerMode === "existing" && "border-primary bg-primary/5",
          )}
        >
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <IconUserSearch className="size-5" />
            </div>
            <div>
              <div className="font-medium">Selecionar tutor existente</div>
              <p className="text-sm text-muted-foreground">
                Use um tutor já cadastrado e siga direto para os dados do pet.
              </p>
            </div>
          </div>
          <Badge variant="secondary">Mais rapido</Badge>
          <div className="mt-auto flex items-center gap-2 text-sm font-medium text-primary">
            Continuar
            <IconArrowRight className="size-4" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChooseMode("new")}
          className={cn(
            "flex flex-col items-start gap-4 rounded-md border p-5 text-left transition-colors hover:border-primary/50 hover:bg-primary/5",
            ownerMode === "new" && "border-primary bg-primary/5",
          )}
        >
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <IconPlus className="size-5" />
            </div>
            <div>
              <div className="font-medium">Cadastrar novo tutor</div>
              <p className="text-sm text-muted-foreground">
                Crie o tutor agora e vincule o paciente no mesmo fluxo.
              </p>
            </div>
          </div>
          <Badge variant="outline">Cadastro completo</Badge>
          <div className="mt-auto flex items-center gap-2 text-sm font-medium text-primary">
            Continuar
            <IconArrowRight className="size-4" />
          </div>
        </button>
      </div>
    </StageCard>
  );
}

export function SectionTutorExisting({ form, step }: TutorSectionBaseProps) {
  const {
    control,
    formState: { errors },
  } = form;
  const { data: owners } = useOwners();

  return (
    <StageCard
      step={step}
      title="Selecionar tutor"
      description="Pesquise um tutor existente e confirme a vinculação com o novo paciente."
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="owner_id">Tutor *</Label>
          <p className="text-sm text-muted-foreground">
            Selecione um tutor da lista para continuar.
          </p>
        </div>

        <Controller
          name="owner_id"
          control={control}
          render={({ field }) => (
            <OwnerSelectionTable
              owners={owners || []}
              selectedOwnerId={field.value || ""}
              onSelect={field.onChange}
            />
          )}
        />

        {errors.owner_id && (
          <p className="text-sm text-destructive">{errors.owner_id.message}</p>
        )}
      </div>
    </StageCard>
  );
}

export function SectionTutorNew({ form, step }: TutorSectionBaseProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <StageCard
      step={step}
      title="Novo tutor"
      description="Preencha os dados do tutor responsável antes de seguir para o cadastro do paciente."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="new_owner_first_name">Nome *</Label>
          <Input
            id="new_owner_first_name"
            {...register("new_owner_first_name")}
            placeholder="Joao"
          />
          {errors.new_owner_first_name && (
            <p className="text-sm text-destructive">
              {errors.new_owner_first_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="new_owner_last_name">Sobrenome *</Label>
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

        <div className="space-y-2 md:col-span-2">
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

        <div className="space-y-2">
          <Label htmlFor="new_owner_phone">Telefone</Label>
          <Input
            id="new_owner_phone"
            type="tel"
            {...register("new_owner_phone")}
            placeholder="(00) 00000-0000"
          />
          {errors.new_owner_phone && (
            <p className="text-sm text-destructive">
              {errors.new_owner_phone.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="new_owner_cpf">CPF *</Label>
          <Input
            id="new_owner_cpf"
            {...register("new_owner_cpf")}
            placeholder="000.000.000-00"
          />
          {errors.new_owner_cpf && (
            <p className="text-sm text-destructive">
              {errors.new_owner_cpf.message}
            </p>
          )}
        </div>
      </div>
    </StageCard>
  );
}
