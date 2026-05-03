import { useEffect, useState } from "react";

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

type ArrowLeftProps = { className?: string };

function ArrowLeft({ className }: ArrowLeftProps) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 12H5" />
      <path d="M11 18l-6-6 6-6" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
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

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-field">
        <label className="auth-field-label" htmlFor="clinic-name">
          Nome da clínica
        </label>
        <input
          id="clinic-name"
          className={"auth-input" + (errors.name ? " auth-input--error" : "")}
          value={values.name}
          onChange={handleChange("name")}
          placeholder="Clínica Veterinária Bem Estar"
          autoFocus
        />
        {errors.name ? (
          <div className="auth-field-error">{errors.name}</div>
        ) : null}
      </div>

      <div className="auth-field">
        <label className="auth-field-label" htmlFor="clinic-email">
          E-mail de contato
          {prefilledEmail ? (
            <span className="auth-field-hint"> · prefilled</span>
          ) : null}
        </label>
        <input
          id="clinic-email"
          type="email"
          className={
            "auth-input" + (errors.contact_email ? " auth-input--error" : "")
          }
          value={values.contact_email}
          onChange={handleChange("contact_email")}
          placeholder="contato@clinica.com"
        />
        {errors.contact_email ? (
          <div className="auth-field-error">{errors.contact_email}</div>
        ) : null}
      </div>

      <div className="auth-field">
        <label className="auth-field-label" htmlFor="clinic-phone">
          Telefone <span className="auth-field-hint">· opcional</span>
        </label>
        <input
          id="clinic-phone"
          type="tel"
          className="auth-input"
          value={values.contact_phone}
          onChange={handleChange("contact_phone")}
          placeholder="(11) 99999-9999"
        />
      </div>

      <div className="auth-row auth-row--32">
        <div className="auth-field">
          <label className="auth-field-label" htmlFor="clinic-city">
            Cidade
          </label>
          <input
            id="clinic-city"
            className="auth-input"
            value={values.city}
            onChange={handleChange("city")}
            placeholder="São Paulo"
          />
        </div>
        <div className="auth-field">
          <label className="auth-field-label" htmlFor="clinic-state">
            UF
          </label>
          <input
            id="clinic-state"
            className={
              "auth-input auth-input--uf" +
              (errors.state ? " auth-input--error" : "")
            }
            value={values.state}
            onChange={handleChange("state")}
            placeholder="SP"
            maxLength={2}
          />
          {errors.state ? (
            <div className="auth-field-error">{errors.state}</div>
          ) : null}
        </div>
      </div>

      <p className="auth-defer-note">
        CNPJ, endereço completo e razão social podem ser preenchidos depois nas
        configurações da clínica.
      </p>

      {externalError ? (
        <div className="auth-error-banner" role="alert">
          {externalError}
        </div>
      ) : null}

      {onBack ? (
        <div className="auth-actions">
          <button
            type="button"
            className="auth-btn-ghost"
            onClick={onBack}
            disabled={submitting || backDisabled}
          >
            <ArrowLeft />
            Voltar
          </button>
          <button
            type="submit"
            className="auth-btn-primary"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="auth-spinner" /> {submitPendingLabel}
              </>
            ) : (
              <>
                {submitLabel} <ArrowRight />
              </>
            )}
          </button>
        </div>
      ) : (
        <button
          type="submit"
          className="auth-btn-primary"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="auth-spinner" /> {submitPendingLabel}
            </>
          ) : (
            <>
              {submitLabel} <ArrowRight />
            </>
          )}
        </button>
      )}
    </form>
  );
}
