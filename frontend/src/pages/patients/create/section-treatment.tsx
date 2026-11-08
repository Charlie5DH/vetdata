import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { CheckIcon, ChevUdIcon } from "@/components/icons/vetdata-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useTemplates } from "@/api/templates";
import { cn } from "@/lib/utils";
import type { Template } from "@/types/template";
import type { PatientCreateFormValues } from "./schema";

const NO_TEMPLATE_VALUE = "none";

interface SearchableTemplateSelectProps {
  templates: Template[];
  value?: string;
  onChange: (value: string) => void;
}

function SearchableTemplateSelect({
  templates,
  value,
  onChange,
}: SearchableTemplateSelectProps) {
  const [open, setOpen] = useState(false);
  const selectedValue = value || NO_TEMPLATE_VALUE;
  const selectedTemplate = templates.find(
    (template) => String(template.id) === selectedValue,
  );

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="template_id"
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {selectedTemplate?.name ||
              "Selecione um modelo para iniciar imediatamente"}
          </span>
          <ChevUdIcon className="ml-2 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Buscar tratamento..." />
          <CommandList>
            <CommandEmpty>Nenhum tratamento encontrado.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="Nenhum"
                onSelect={() => handleSelect(NO_TEMPLATE_VALUE)}
              >
                <CheckIcon
                  className={cn(
                    "size-3.5",
                    selectedValue === NO_TEMPLATE_VALUE
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
                Nenhum
              </CommandItem>
              {templates.map((template) => (
                <CommandItem
                  key={template.id}
                  value={`${template.name} ${template.description ?? ""}`}
                  onSelect={() => handleSelect(String(template.id))}
                >
                  <CheckIcon
                    className={cn(
                      "size-3.5",
                      selectedValue === String(template.id)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <div className="min-w-0">
                    <div className="truncate">{template.name}</div>
                    {template.description ? (
                      <div className="text-muted-foreground truncate text-xs">
                        {template.description}
                      </div>
                    ) : null}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface SectionTreatmentProps {
  form: UseFormReturn<PatientCreateFormValues>;
  step?: string;
}

export function SectionTreatment({ form, step }: SectionTreatmentProps) {
  const { register, control } = form;
  const { data: templates } = useTemplates();

  return (
    <Card id="tratamento">
      <CardHeader>
        <CardTitle>
          {step && (
            <span className="mr-2 font-medium text-muted-foreground tabular-nums">
              {step}.
            </span>
          )}
          Tratamento
        </CardTitle>
        <CardDescription>
          Informações sobre o motivo da visita e tratamento inicial.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="motive">Motivo</Label>
            <Input
              id="motive"
              {...register("motive")}
              placeholder="Motivo da visita"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Notas adicionais..."
            />
          </div>

          <div className="mt-1 flex flex-col gap-1.5 border-t border-border pt-4">
            <Label htmlFor="template_id">Iniciar tratamento (opcional)</Label>
            <Controller
              name="template_id"
              control={control}
              render={({ field }) => (
                <SearchableTemplateSelect
                  templates={templates ?? []}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <p className="text-xs text-muted-foreground">
              Selecionar um modelo criará automaticamente uma sessão de
              tratamento ativa.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
