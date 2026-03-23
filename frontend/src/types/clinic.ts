export interface Clinic {
  id: string;
  name: string;
  legal_name?: string | null;
  registration_document?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClinicCreatePayload {
  name: string;
  legal_name?: string;
  registration_document?: string;
  contact_email?: string;
  contact_phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  notes?: string;
}

export interface ClinicUpdatePayload {
  name?: string;
  legal_name?: string;
  registration_document?: string;
  contact_email?: string;
  contact_phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  notes?: string;
}

export interface ClinicMember {
  id: string;
  clinic_id: string;
  user_id: string;
  role: string;
  created_at: string;
  user_display_name: string;
  user_email: string;
}

export interface ClinicInvitation {
  id: string;
  clinic_id: string;
  inviter_user_id: string;
  email: string;
  role: string;
  status: string;
  clerk_invitation_id?: string | null;
  expires_at?: string | null;
  accepted_at?: string | null;
  created_at: string;
}

export interface ClinicInvitationCreatePayload {
  email: string;
  redirect_url?: string;
}

export interface ClinicInvitationResendPayload {
  redirect_url?: string;
}
