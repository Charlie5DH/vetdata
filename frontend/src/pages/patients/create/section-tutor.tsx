import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import {
  ChevRIcon,
  OwnerIcon,
  PlusIcon,
} from "@/components/icons/vetdata-icons";

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

import { FieldError } from "./field-error";
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
          {step && (
            <span className="mr-2 font-medium text-muted-foreground tabular-nums">
              {step}.
            </span>
          )}
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
      <div className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onChooseMode("existing")}
          className={cn(
            "flex flex-col items-start gap-3 rounded-lg border border-input p-4 text-left transition-colors duration-150 hover:border-forest-500 hover:bg-muted",
            ownerMode === "existing" && "border-primary bg-muted",
          )}
        >
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-foreground">
              <OwnerIcon size={18} />
            </span>
            <div>
              <div className="text-sm font-semibold">Selecionar tutor existente</div>
              <p className="text-[13px] text-muted-foreground">
                Use um tutor já cadastrado e siga direto para os dados do pet.
              </p>
            </div>
          </div>
          <Badge variant="secondary">Mais rápido</Badge>
          <div className="mt-auto flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
            Continuar
            <ChevRIcon size={14} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChooseMode("new")}
          className={cn(
            "flex flex-col items-start gap-3 rounded-lg border border-input p-4 text-left transition-colors duration-150 hover:border-forest-500 hover:bg-muted",
            ownerMode === "new" && "border-primary bg-muted",
          )}
        >
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-foreground">
              <PlusIcon size={18} />
            </span>
            <div>
              <div className="text-sm font-semibold">Cadastrar novo tutor</div>
              <p className="text-[13px] text-muted-foreground">
                Crie o tutor agora e vincule o paciente no mesmo fluxo.
              </p>
            </div>
          </div>
          <Badge variant="outline">Cadastro completo</Badge>
          <div className="mt-auto flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
            Continuar
            <ChevRIcon size={14} />
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
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="owner_id">Tutor *</Label>
          <p className="text-xs text-muted-foreground">
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

        <FieldError message={errors.owner_id?.message} />
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
      <div className="grid gap-x-4 gap-y-3 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new_owner_first_name">Nome *</Label>
          <Input
            id="new_owner_first_name"
            {...register("new_owner_first_name")}
            placeholder="João"
          />
          <FieldError message={errors.new_owner_first_name?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new_owner_last_name">Sobrenome *</Label>
          <Input
            id="new_owner_last_name"
            {...register("new_owner_last_name")}
            placeholder="Silva"
          />
          <FieldError message={errors.new_owner_last_name?.message} />
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <Label htmlFor="new_owner_email">Email *</Label>
          <Input
            id="new_owner_email"
            type="email"
            {...register("new_owner_email")}
            placeholder="joao.silva@exemplo.com"
          />
          <FieldError message={errors.new_owner_email?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new_owner_phone">Telefone</Label>
          <Input
            id="new_owner_phone"
            type="tel"
            {...register("new_owner_phone")}
            placeholder="(00) 00000-0000"
          />
          <FieldError message={errors.new_owner_phone?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new_owner_cpf">CPF *</Label>
          <Input
            id="new_owner_cpf"
            {...register("new_owner_cpf")}
            placeholder="000.000.000-00"
          />
          <FieldError message={errors.new_owner_cpf?.message} />
        </div>
      </div>
    </StageCard>
  );
}
