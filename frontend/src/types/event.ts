import type { Patient } from "./patient";

export interface EventDetails {
  [key: string]: unknown;
}

export interface Event {
  id: string;
  patient_id: string;
  event_type: string;
  source_type: string;
  source_id?: string | null;
  title: string;
  description?: string | null;
  details?: EventDetails | null;
  occurred_at: string;
  created_at: string;
  patient?: Patient | null;
}
