import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Event } from "@/types";

export const useRecentEvents = (limit = 8) => {
  return useQuery({
    queryKey: ["events", "recent", limit],
    queryFn: async () => {
      const { data } = await api.get<Event[]>("/events", {
        params: { limit },
      });
      return data;
    },
  });
};

export const usePatientEvents = (patientId: string, limit = 50) => {
  return useQuery({
    queryKey: ["events", "patients", patientId, limit],
    queryFn: async () => {
      const { data } = await api.get<Event[]>(`/patients/${patientId}/events`, {
        params: { limit },
      });
      return data;
    },
    enabled: !!patientId,
  });
};
