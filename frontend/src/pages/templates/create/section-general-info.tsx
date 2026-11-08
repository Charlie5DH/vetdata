import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { TemplateCreateFormValues } from "./schema";

interface SectionGeneralInfoProps {
  form: UseFormReturn<TemplateCreateFormValues>;
  step?: string;
}

export function SectionGeneralInfo({ form, step }: SectionGeneralInfoProps) {
  const {
    control,
    formState: { errors },
  } = form;

  return (
    <Card id="informacoes">
      <CardHeader>
        <CardTitle>
          {step && <span className="mr-2 text-muted-foreground">{step}.</span>}
          Informações gerais
        </CardTitle>
        <CardDescription>
          Nome e descrição do modelo de tratamento.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nome *</Label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input id="name" placeholder="Ex: Padrão Felino" {...field} />
            )}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
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
      </CardContent>
    </Card>
  );
}
