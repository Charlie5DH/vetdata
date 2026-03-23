import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Patient, PatientCreate } from "@/types";

export const usePatients = () => {
  return useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data } = await api.get<Patient[]>("/patients/");
      return data;
    },
  });
};

export const usePatient = (id: string) => {
  return useQuery({
    queryKey: ["patients", id],
    queryFn: async () => {
      const { data } = await api.get<Patient>(`/patients/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newPatient: PatientCreate) => {
      const { data } = await api.post<Patient>("/patients/", newPatient);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patient }: PatientCreate & { id: string }) => {
      const { data } = await api.put<Patient>(`/patients/${id}`, patient);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

export const useDeletePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/patients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
};
