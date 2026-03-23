import type { Patient } from "./patient";
import type { Template } from "./template";

export interface LogValueBase {
  measure_id: string;
  value?: string | null;
}

export type LogValueCreate = LogValueBase;

export interface LogValue extends LogValueBase {
  id: string;
  treatment_log_id: string;
}

export interface TreatmentLogBase {
  notes?: string | null;
}

export interface TreatmentLogCreate extends TreatmentLogBase {
  values?: LogValueCreate[];
  logged_at?: string | null;
}

export interface TreatmentLog extends TreatmentLogBase {
  id: string;
  treatment_session_id: string;
  logged_at: string;
  values?: LogValue[];
}

export interface TreatmentSessionBase {
  patient_id: string;
  template_id: string;
  status?: string | null; // e.g., 'active'
  notes?: string | null;
}

export type TreatmentSessionCreate = TreatmentSessionBase;

export interface TreatmentSession extends TreatmentSessionBase {
  id: string;
  started_at: string;
  completed_at?: string | null;
  logs?: TreatmentLog[];
  patient?: Patient | null;
  template?: Template | null;
}
