import * as z from "zod";

export interface PatientCreateFormValues {
  name: string;
  species: string;
  breed?: string;
  age_years?: number;
  age_months?: number;
  weight_kg?: number;
  notes?: string;
  motive?: string;
  template_id?: string;
  owner_mode: "existing" | "new";
  owner_id?: string;
  new_owner_first_name?: string;
  new_owner_last_name?: string;
  new_owner_email?: string;
  new_owner_phone?: string;
  new_owner_cpf?: string;
}

const optionalNumber = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "number" && Number.isNaN(value)) {
    return undefined;
  }

  return value;
}, z.number().min(0).optional());

const optionalMonthNumber = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "number" && Number.isNaN(value)) {
    return undefined;
  }

  return value;
}, z.number().min(0).max(11).optional());

export const patientCreateSchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório"),
    species: z.string().min(1, "Espécie é obrigatória"),
    breed: z.string().optional(),
    age_years: optionalNumber,
    age_months: optionalMonthNumber,
    weight_kg: optionalNumber,
    notes: z.string().optional(),
    motive: z.string().optional(),
    template_id: z.string().optional(),
    owner_mode: z.enum(["existing", "new"]),
    owner_id: z.string().optional(),
    new_owner_first_name: z.string().optional(),
    new_owner_last_name: z.string().optional(),
    new_owner_email: z
      .union([z.email("Email inválido"), z.literal("")])
      .optional(),
    new_owner_phone: z.string().optional(),
    new_owner_cpf: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.owner_mode === "existing") {
      if (!data.owner_id) {
        ctx.addIssue({
          code: "custom",
          message: "Tutor é obrigatório",
          path: ["owner_id"],
        });
      }
    } else {
      if (!data.new_owner_first_name) {
        ctx.addIssue({
          code: "custom",
          message: "Nome é obrigatório",
          path: ["new_owner_first_name"],
        });
      }
      if (!data.new_owner_last_name) {
        ctx.addIssue({
          code: "custom",
          message: "Sobrenome é obrigatório",
          path: ["new_owner_last_name"],
        });
      }
      if (!data.new_owner_email) {
        ctx.addIssue({
          code: "custom",
          message: "Email é obrigatório",
          path: ["new_owner_email"],
        });
      }
      if (!data.new_owner_cpf) {
        ctx.addIssue({
          code: "custom",
          message: "CPF é obrigatório",
          path: ["new_owner_cpf"],
        });
      }
    }
  });

export const patientCreateStepFields = {
  ownerExisting: ["owner_id"] as const,
  ownerNew: [
    "new_owner_first_name",
    "new_owner_last_name",
    "new_owner_email",
    "new_owner_phone",
    "new_owner_cpf",
  ] as const,
  patient: [
    "name",
    "species",
    "breed",
    "weight_kg",
    "age_years",
    "age_months",
  ] as const,
  treatment: ["motive", "notes", "template_id"] as const,
};

export const patientCreateDefaults: PatientCreateFormValues = {
  name: "",
  species: "",
  breed: "",
  age_years: undefined,
  age_months: undefined,
  weight_kg: undefined,
  notes: "",
  motive: "",
  owner_mode: "new",
  owner_id: "",
  new_owner_first_name: "",
  new_owner_last_name: "",
  new_owner_email: "",
  new_owner_phone: "",
  new_owner_cpf: "",
  template_id: "none",
};
