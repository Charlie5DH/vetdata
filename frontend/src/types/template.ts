export interface MeasureBase {
  name: string;
  unit?: string | null;
  data_type: string;
  options?: Record<string, unknown> | string[] | string | null;
  lower_limit?: number | null;
  upper_limit?: number | null;
}

export type MeasureCreate = MeasureBase;

export type MeasureUpdate = MeasureBase;

export interface Measure extends MeasureBase {
  id: string;
  created_at: string;
}

export interface TemplateMeasureBase {
  measure_id: string;
  display_order: number;
  lower_limit?: number | null;
  upper_limit?: number | null;
}

export type TemplateMeasureCreate = TemplateMeasureBase;

export interface TemplateMeasure extends TemplateMeasureBase {
  id: string;
  template_id: string;
  measure?: Measure | null;
}

export interface TemplateBase {
  name: string;
  description?: string | null;
}

export interface TemplateCreate extends TemplateBase {
  measure_ids?: string[]; // List of measure IDs to associate
  template_measures?: TemplateMeasureCreate[];
}

export type TemplateUpdate = TemplateCreate;

export interface Template extends TemplateBase {
  id: string;
  created_at: string;
  template_measures?: TemplateMeasure[];
}
