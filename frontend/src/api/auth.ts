import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { AppUser } from "@/types";

export const currentUserQueryKey = ["auth", "me"] as const;

export type UpdateProfilePayload = {
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  avatar_url?: string | null;
  crmv?: string | null;
};

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
};

export async function fetchCurrentUser() {
  const { data } = await api.get<AppUser>("/auth/me");
  return data;
}

export async function updateCurrentUser(payload: UpdateProfilePayload) {
  const { data } = await api.patch<AppUser>("/auth/me", payload);
  return data;
}

export async function changeCurrentUserPassword(payload: ChangePasswordPayload) {
  await api.post("/auth/change-password", payload);
}

export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: fetchCurrentUser,
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
