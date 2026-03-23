export interface AppUser {
  id: string;
  clerk_user_id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  display_name: string;
  avatar_url?: string | null;
  is_active: boolean;
  last_sign_in_at?: string | null;
  has_clinic: boolean;
  clinic_role?: string | null;
  clinic?: {
    id: string;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
}
