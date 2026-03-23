import type { Owner } from "./owner";

export interface PatientBase {
  name: string;
  species: string;
  breed?: string | null;
  age_years?: number | null;
  age_months?: number | null;
  weight_kg?: number | null;
  notes?: string | null;
  motive?: string | null;
  owner_id: string;
}

export type PatientCreate = PatientBase;

export interface Patient extends PatientBase {
  id: string;
  created_at: string;
  owner?: Owner | null;
  total_sessions?: number;
  active_sessions?: number;
  last_session_at?: string | null;
  monitored_measures?: string[];
  active_templates?: string[];
}
