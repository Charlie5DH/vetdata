import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { AppUser } from "@/types";

export const currentUserQueryKey = ["auth", "me"] as const;

export async function fetchCurrentUser() {
  const { data } = await api.get<AppUser>("/auth/me");
  return data;
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
