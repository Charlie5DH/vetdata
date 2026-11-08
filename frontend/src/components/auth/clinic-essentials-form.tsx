import { useEffect, useState } from "react";
import { Loader2Icon } from "lucide-react";

import { ArrowLIcon } from "@/components/icons/vetdata-icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const BR_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export type ClinicEssentialsValues = {
  name: string;
  contact_email: string;
  contact_phone: string;
  city: string;
  state: string;
};

export const emptyClinicEssentials = (
  overrides: Partial<ClinicEssentialsValues> = {},
): ClinicEssentialsValues => ({
  name: "",
  contact_email: "",
  contact_phone: "",
  city: "",
  state: "",
  ...overrides,
});

type Errors = Partial<Record<keyof ClinicEssentialsValues, string>>;

export function validateClinicEssentials(values: ClinicEssentialsValues): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Informe o nome da clínica";
  if (
    values.contact_email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contact_email)
  ) {
    errors.contact_email = "E-mail inválido";
  }
  if (values.state && !BR_STATES.includes(values.state.toUpperCase())) {
    errors.state = "UF inválida";
  }
  return errors;
}

type Props = {
  initial?: Partial<ClinicEssentialsValues>;
  prefilledEmail?: string | null;
  submitLabel?: string;
  submitPendingLabel?: string;
  onSubmit: (values: ClinicEssentialsValues) => Promise<void> | void;
  onBack?: () => void;
  backDisabled?: boolean;
  submitting?: boolean;
  externalError?: string | null;
};

export function ClinicEssentialsForm({
  initial,
  prefilledEmail,
  submitLabel = "Criar clínica",
  submitPendingLabel = "Criando…",
  onSubmit,
  onBack,
  backDisabled,
  submitting,
  externalError,
}: Props) {
  const [values, setValues] = useState<ClinicEssentialsValues>(() =>
    emptyClinicEssentials({
      contact_email: prefilledEmail ?? "",
      ...initial,
    }),
  );
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (prefilledEmail && !values.contact_email) {
      setValues((prev) => ({ ...prev, contact_email: prefilledEmail }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledEmail]);

  const handleChange =
    (key: keyof ClinicEssentialsValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      const next = key === "state" ? raw.toUpperCase().slice(0, 2) : raw;
      setValues((prev) => ({ ...prev, [key]: next }));
      if (errors[key]) {
        setErrors((prev) => ({ ...prev, [key]: undefined }));
      }
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateClinicEssentials(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    await onSubmit(values);
  };

  const submitButton = (
    <Button
      type="submit"
      variant="cta"
      className="h-10 w-full"
      disabled={submitting}
    >
      {submitting ? (
        <>
          <Loader2Icon className="animate-spin" /> {submitPendingLabel}
        </>
      ) : (
        submitLabel
      )}
    </Button>
  );

  return (
    <form
      className="flex flex-col gap-3 text-left"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <label className="sr-only" htmlFor="clinic-name">
          Nome da clínica
        </label>
        <Input
          id="clinic-name"
          aria-invalid={Boolean(errors.name)}
          value={values.name}
          onChange={handleChange("name")}
          placeholder="Nome da clínica"
          autoFocus
        />
        {errors.name ? <FieldError>{errors.name}</FieldError> : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="sr-only" htmlFor="clinic-email">
          E-mail de contato
        </label>
        <Input
          id="clinic-email"
          type="email"
          aria-invalid={Boolean(errors.contact_email)}
          value={values.contact_email}
          onChange={handleChange("contact_email")}
          placeholder="E-mail de contato"
        />
        {errors.contact_email ? (
          <FieldError>{errors.contact_email}</FieldError>
        ) : prefilledEmail ? (
          <p className="px-5 text-xs text-muted-foreground">
            Preenchido com o e-mail da sua conta
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="sr-only" htmlFor="clinic-phone">
          Telefone (opcional)
        </label>
        <Input
          id="clinic-phone"
          type="tel"
          value={values.contact_phone}
          onChange={handleChange("contact_phone")}
          placeholder="Telefone (opcional)"
        />
      </div>

      <div className="grid grid-cols-[1fr_96px] gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="sr-only" htmlFor="clinic-city">
            Cidade
          </label>
          <Input
            id="clinic-city"
            value={values.city}
            onChange={handleChange("city")}
            placeholder="Cidade"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="sr-only" htmlFor="clinic-state">
            UF
          </label>
          <Input
            id="clinic-state"
            aria-invalid={Boolean(errors.state)}
            className="text-center tracking-[0.08em] uppercase"
            value={values.state}
            onChange={handleChange("state")}
            placeholder="UF"
            maxLength={2}
          />
        </div>
      </div>
      {errors.state ? (
        <FieldError className="text-right">{errors.state}</FieldError>
      ) : null}

      <p className="rounded-lg bg-muted px-3.5 py-2.5 text-xs leading-normal text-muted-foreground">
        CNPJ, endereço completo e razão social podem ser preenchidos depois nas
        configurações da clínica.
      </p>

      {externalError ? (
        <Alert variant="destructive">{externalError}</Alert>
      ) : null}

      {onBack ? (
        <div className="grid grid-cols-[auto_1fr] gap-2.5">
          <Button
            type="button"
            variant="outline"
            className="h-10"
            onClick={onBack}
            disabled={submitting || backDisabled}
          >
            <ArrowLIcon />
            Voltar
          </Button>
          {submitButton}
        </div>
      ) : (
        submitButton
      )}
    </form>
  );
}

function FieldError({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p className={cn("px-5 text-xs text-destructive", className)}>{children}</p>
  );
}
