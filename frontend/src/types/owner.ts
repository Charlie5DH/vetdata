import type { Patient } from "./patient";

export interface OwnerBase {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  cpf?: string;
}

export type OwnerCreate = OwnerBase;

export interface Owner extends OwnerBase {
  id: string;
  created_at: string;
  patients?: Patient[];
}
