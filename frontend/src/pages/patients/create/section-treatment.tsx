import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Check, ChevronsUpDown } from "lucide-react";
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
          className="h-12 w-full justify-between px-3 font-normal"
        >
          <span className="truncate">
            {selectedTemplate?.name ||
              "Selecione um modelo para iniciar imediatamente"}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
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
                <Check
                  className={cn(
                    "size-4",
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
                  <Check
                    className={cn(
                      "size-4",
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
          {step && <span className="mr-2 text-muted-foreground">{step}.</span>}
          Tratamento
        </CardTitle>
        <CardDescription>
          Informações sobre o motivo da visita e tratamento inicial.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="motive">Motivo</Label>
            <Input
              id="motive"
              {...register("motive")}
              placeholder="Motivo da visita"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Notas adicionais..."
            />
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="template_id">Iniciar Tratamento (Opcional)</Label>
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
