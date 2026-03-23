import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  TreatmentSession,
  TreatmentSessionCreate,
  TreatmentLog,
  TreatmentLogCreate,
} from "@/types";

// --- Treatment Sessions ---

export const useTreatmentSessions = () => {
  return useQuery({
    queryKey: ["treatment-sessions"],
    queryFn: async () => {
      const { data } = await api.get<TreatmentSession[]>("/sessions/");
      return data;
    },
  });
};

export const useTreatmentSession = (id: string) => {
  return useQuery({
    queryKey: ["treatment-sessions", id],
    queryFn: async () => {
      const { data } = await api.get<TreatmentSession>(`/sessions/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateTreatmentSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newSession: TreatmentSessionCreate) => {
      const { data } = await api.post<TreatmentSession>(
        "/sessions/",
        newSession,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

// --- Treatment Logs ---

export const useCreateTreatmentLog = (sessionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newLog: TreatmentLogCreate) => {
      const { data } = await api.post<TreatmentLog>(
        `/sessions/${sessionId}/logs`,
        newLog,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["treatment-sessions", sessionId],
      });
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

export const useDeleteTreatmentLog = (sessionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (logId: string) => {
      await api.delete(`/sessions/${sessionId}/logs/${logId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["treatment-sessions", sessionId],
      });
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
