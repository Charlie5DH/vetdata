import type { Patient } from "./patient";

export interface VaccineBase {
  name: string;
  species: string;
  diseases?: string[] | null;
  description?: string | null;
  manufacturer?: string | null;
  recommended_age_weeks?: number | null;
  booster_interval_days?: number | null;
  doses_in_series?: number | null;
  is_mandatory?: boolean;
}

export type VaccineCreate = VaccineBase;

export type VaccineUpdate = Partial<VaccineBase>;

export interface Vaccine extends VaccineBase {
  id: string;
  is_seed: boolean;
  clinic_id?: string | null;
  created_at: string;
}

export interface PatientVaccinationBase {
  patient_id: string;
  vaccine_id: string;
  applied_at: string;
  dose_number?: number | null;
  batch?: string | null;
  manufacturer?: string | null;
  next_due_at?: string | null;
  applied_by?: string | null;
  notes?: string | null;
  status?: string;
}

export type PatientVaccinationCreate = PatientVaccinationBase;

export type PatientVaccinationUpdate = Partial<Omit<PatientVaccinationBase, "patient_id">>;

export interface PatientVaccination extends PatientVaccinationBase {
  id: string;
  created_at: string;
  is_overdue: boolean;
  days_until_due?: number | null;
  vaccine?: Vaccine | null;
  patient?: Patient | null;
}

export interface InitialVaccinationCreate {
  vaccine_id: string;
  applied_at: string;
  dose_number?: number | null;
  batch?: string | null;
  manufacturer?: string | null;
  next_due_at?: string | null;
  applied_by?: string | null;
  notes?: string | null;
}
