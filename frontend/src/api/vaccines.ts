import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  PatientVaccination,
  PatientVaccinationCreate,
  PatientVaccinationUpdate,
  Vaccine,
  VaccineCreate,
  VaccineUpdate,
} from "@/types";

// --- Catalog ---

export const useVaccineCatalog = (species?: string) => {
  return useQuery({
    queryKey: ["vaccine-catalog", species ?? "all"],
    queryFn: async () => {
      const { data } = await api.get<Vaccine[]>("/vaccines/catalog", {
        params: species ? { species } : undefined,
      });
      return data;
    },
  });
};

export const useCreateCatalogVaccine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vaccine: VaccineCreate) => {
      const { data } = await api.post<Vaccine>("/vaccines/catalog", vaccine);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccine-catalog"] });
    },
  });
};

export const useUpdateCatalogVaccine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...update }: VaccineUpdate & { id: string }) => {
      const { data } = await api.put<Vaccine>(`/vaccines/catalog/${id}`, update);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccine-catalog"] });
    },
  });
};

export const useDeleteCatalogVaccine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/vaccines/catalog/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccine-catalog"] });
    },
  });
};

// --- Records ---

export interface VaccinationFilters {
  patient_id?: string;
  status?: string;
  overdue_only?: boolean;
}

export const useVaccinations = (filters?: VaccinationFilters) => {
  return useQuery({
    queryKey: ["vaccinations", filters ?? {}],
    queryFn: async () => {
      const { data } = await api.get<PatientVaccination[]>("/vaccines", {
        params: filters,
      });
      return data;
    },
  });
};

export const useVaccination = (id: string) => {
  return useQuery({
    queryKey: ["vaccinations", id],
    queryFn: async () => {
      const { data } = await api.get<PatientVaccination>(`/vaccines/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const usePatientVaccinations = (patientId: string) => {
  return useQuery({
    queryKey: ["vaccinations", "patient", patientId],
    queryFn: async () => {
      const { data } = await api.get<PatientVaccination[]>(
        `/patients/${patientId}/vaccines`,
      );
      return data;
    },
    enabled: !!patientId,
  });
};

export const useCreateVaccination = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vaccination: PatientVaccinationCreate) => {
      const { data } = await api.post<PatientVaccination>(
        "/vaccines",
        vaccination,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccinations"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
};

export const useUpdateVaccination = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...update
    }: PatientVaccinationUpdate & { id: string }) => {
      const { data } = await api.patch<PatientVaccination>(
        `/vaccines/${id}`,
        update,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccinations"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

export const useDeleteVaccination = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/vaccines/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccinations"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
