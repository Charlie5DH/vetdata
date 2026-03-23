import * as z from "zod";

export interface TemplateThresholdOverride {
  lower_limit?: string;
  upper_limit?: string;
}

export interface TemplateCreateFormValues {
  name: string;
  description?: string;
  measure_ids: string[];
  thresholds: Record<string, TemplateThresholdOverride>;
}

const thresholdOverrideSchema = z.object({
  lower_limit: z.string().optional(),
  upper_limit: z.string().optional(),
});

export const templateCreateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  measure_ids: z.array(z.string()).default([]),
  thresholds: z.record(z.string(), thresholdOverrideSchema).default({}),
});

export const templateCreateDefaults: TemplateCreateFormValues = {
  name: "",
  description: "",
  measure_ids: [],
  thresholds: {},
};
