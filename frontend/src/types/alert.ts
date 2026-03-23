import type { Measure } from "./template";

export interface Alert {
  id: string;
  patient_id: string;
  treatment_session_id: string;
  treatment_log_id: string;
  measure_id: string;
  template_measure_id?: string | null;
  threshold_type: string;
  threshold_value: number;
  triggered_value: number;
  message: string;
  status: string;
  created_at: string;
  measure?: Measure | null;
}
