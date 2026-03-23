import { useEffect, useState } from "react";
import { Building2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import type { Clinic, ClinicCreatePayload } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface ClinicFormValues {
  name: string;
  legal_name: string;
  registration_document: string;
  contact_email: string;
  contact_phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  notes: string;
}

interface ClinicFormProps {
  initialValues: ClinicFormValues;
  onSubmit: (payload: ClinicCreatePayload) => Promise<void> | void;
  isSubmitting?: boolean;
  submitLabel: string;
  submitPendingLabel: string;
  canEdit?: boolean;
  readOnlyMessage?: string;
  additionalInfoCollapsible?: boolean;
}

export function emptyClinicFormValues(): ClinicFormValues {
  return {
    name: "",
    legal_name: "",
    registration_document: "",
    contact_email: "",
    contact_phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    notes: "",
  };
}

export function clinicToFormValues(clinic?: Clinic | null): ClinicFormValues {
  return {
    name: clinic?.name ?? "",
    legal_name: clinic?.legal_name ?? "",
    registration_document: clinic?.registration_document ?? "",
    contact_email: clinic?.contact_email ?? "",
    contact_phone: clinic?.contact_phone ?? "",
    address_line1: clinic?.address_line1 ?? "",
    address_line2: clinic?.address_line2 ?? "",
    city: clinic?.city ?? "",
    state: clinic?.state ?? "",
    postal_code: clinic?.postal_code ?? "",
    notes: clinic?.notes ?? "",
  };
}

function optionalValue(value: string) {
  const normalized = value.trim();
  return normalized || undefined;
}

function hasAdditionalInformation(values: ClinicFormValues) {
  return [
    values.legal_name,
    values.registration_document,
    values.contact_email,
    values.contact_phone,
    values.address_line1,
    values.address_line2,
    values.city,
    values.state,
    values.postal_code,
    values.notes,
  ].some((value) => value.trim().length > 0);
}

function getAdditionalInfoSectionValue(
  initialValues: ClinicFormValues,
  additionalInfoCollapsible: boolean,
) {
  if (!additionalInfoCollapsible) {
    return "additional-info";
  }

  return hasAdditionalInformation(initialValues)
    ? "additional-info"
    : undefined;
}

export function buildClinicPayload(
  values: ClinicFormValues,
): ClinicCreatePayload {
  return {
    name: values.name.trim(),
    legal_name: optionalValue(values.legal_name),
    registration_document: optionalValue(values.registration_document),
    contact_email: optionalValue(values.contact_email),
    contact_phone: optionalValue(values.contact_phone),
    address_line1: optionalValue(values.address_line1),
    address_line2: optionalValue(values.address_line2),
    city: optionalValue(values.city),
    state: optionalValue(values.state),
    postal_code: optionalValue(values.postal_code),
    notes: optionalValue(values.notes),
  };
}

export function ClinicForm({
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitLabel,
  submitPendingLabel,
  canEdit = true,
  readOnlyMessage,
  additionalInfoCollapsible = true,
}: ClinicFormProps) {
  const [values, setValues] = useState<ClinicFormValues>(initialValues);
  const [expandedSection, setExpandedSection] = useState<string | undefined>(
    getAdditionalInfoSectionValue(initialValues, additionalInfoCollapsible),
  );

  useEffect(() => {
    setValues(initialValues);
    setExpandedSection(
      getAdditionalInfoSectionValue(initialValues, additionalInfoCollapsible),
    );
  }, [additionalInfoCollapsible, initialValues]);

  const handleChange = (field: keyof ClinicFormValues, nextValue: string) => {
    setValues((current) => ({
      ...current,
      [field]: nextValue,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = buildClinicPayload(values);
    if (!payload.name) {
      toast.error("Informe o nome da clínica para continuar.");
      return;
    }

    await onSubmit(payload);
  };

  const additionalInfoFields = (
    <div className="grid gap-6 pb-2 lg:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="clinic-legal-name">Razão social</Label>
        <Input
          id="clinic-legal-name"
          value={values.legal_name}
          onChange={(event) => handleChange("legal_name", event.target.value)}
          placeholder="Nome jurídico da clínica"
          disabled={!canEdit || isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clinic-registration-document">CNPJ ou registro</Label>
        <Input
          id="clinic-registration-document"
          value={values.registration_document}
          onChange={(event) =>
            handleChange("registration_document", event.target.value)
          }
          placeholder="CNPJ, CRMV ou outro documento"
          disabled={!canEdit || isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clinic-contact-email">E-mail da clínica</Label>
        <Input
          id="clinic-contact-email"
          type="email"
          value={values.contact_email}
          onChange={(event) =>
            handleChange("contact_email", event.target.value)
          }
          placeholder="contato@clinica.com"
          disabled={!canEdit || isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clinic-contact-phone">Telefone</Label>
        <Input
          id="clinic-contact-phone"
          value={values.contact_phone}
          onChange={(event) =>
            handleChange("contact_phone", event.target.value)
          }
          placeholder="(11) 99999-9999"
          disabled={!canEdit || isSubmitting}
        />
      </div>

      <div className="space-y-2 lg:col-span-2">
        <Label htmlFor="clinic-address-line1">Endereço principal</Label>
        <Input
          id="clinic-address-line1"
          value={values.address_line1}
          onChange={(event) =>
            handleChange("address_line1", event.target.value)
          }
          placeholder="Rua, número e bairro"
          disabled={!canEdit || isSubmitting}
        />
      </div>

      <div className="space-y-2 lg:col-span-2">
        <Label htmlFor="clinic-address-line2">Complemento</Label>
        <Input
          id="clinic-address-line2"
          value={values.address_line2}
          onChange={(event) =>
            handleChange("address_line2", event.target.value)
          }
          placeholder="Sala, bloco, referência"
          disabled={!canEdit || isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clinic-city">Cidade</Label>
        <Input
          id="clinic-city"
          value={values.city}
          onChange={(event) => handleChange("city", event.target.value)}
          placeholder="Cidade"
          disabled={!canEdit || isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clinic-state">Estado</Label>
        <Input
          id="clinic-state"
          value={values.state}
          onChange={(event) => handleChange("state", event.target.value)}
          placeholder="UF"
          disabled={!canEdit || isSubmitting}
        />
      </div>

      <div className="space-y-2 lg:max-w-xs">
        <Label htmlFor="clinic-postal-code">CEP</Label>
        <Input
          id="clinic-postal-code"
          value={values.postal_code}
          onChange={(event) => handleChange("postal_code", event.target.value)}
          placeholder="00000-000"
          disabled={!canEdit || isSubmitting}
        />
      </div>

      <div className="space-y-2 lg:col-span-2">
        <Label htmlFor="clinic-notes">Observações</Label>
        <Textarea
          id="clinic-notes"
          value={values.notes}
          onChange={(event) => handleChange("notes", event.target.value)}
          placeholder="Horários, especialidades, referências internas ou instruções para a equipe"
          disabled={!canEdit || isSubmitting}
        />
      </div>
    </div>
  );

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="clinic-name">Nome da clínica</Label>
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Obrigatório
            </span>
          </div>
          <Input
            id="clinic-name"
            value={values.name}
            onChange={(event) => handleChange("name", event.target.value)}
            placeholder="Ex.: Clínica Veterinária São Francisco"
            autoFocus
            disabled={!canEdit || isSubmitting}
          />
        </div>
      </div>

      {additionalInfoCollapsible ? (
        <Accordion
          type="single"
          collapsible
          value={expandedSection}
          onValueChange={(value) => setExpandedSection(value || undefined)}
          className="overflow-visible border-none bg-transparent"
        >
          <AccordionItem
            value="additional-info"
            className="overflow-hidden border border-border/70 bg-muted/20 shadow-sm transition-all duration-200 hover:border-primary/30 hover:bg-muted/35 hover:shadow-md data-open:border-border/70 data-open:bg-muted/28 data-open:shadow-sm"
          >
            <AccordionTrigger className="w-full cursor-pointer px-5 py-4 hover:no-underline focus-visible:outline-none">
              <div className="flex items-start gap-3">
                <div>
                  <p className="font-medium text-foreground">
                    Mais informações
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Todos os campos abaixo são opcionais e podem ser preenchidos
                    depois.
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5">
              {additionalInfoFields}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : (
        <section className="space-y-5 rounded-2xl border border-border/70 bg-muted/20 p-5 shadow-sm">
          <div>
            <p className="font-medium text-foreground">Mais informações</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Todos os campos abaixo são opcionais e podem ser preenchidos ou
              atualizados a qualquer momento.
            </p>
          </div>
          {additionalInfoFields}
        </section>
      )}

      {canEdit ? (
        <div className="flex items-center justify-end gap-3">
          <Button type="submit" disabled={isSubmitting} className="min-w-44">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {submitPendingLabel}
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                {submitLabel}
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
          <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
            <Building2 className="size-4 text-primary" />
            Cadastro da clínica em modo de visualização
          </div>
          <p>
            {readOnlyMessage ??
              "Somente o responsável pela clínica pode atualizar estas informações."}
          </p>
        </div>
      )}
    </form>
  );
}
