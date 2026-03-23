import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Owner, OwnerCreate } from "@/types";

export const useOwners = () => {
  return useQuery({
    queryKey: ["owners"],
    queryFn: async () => {
      const { data } = await api.get<Owner[]>("/owners/");
      return data;
    },
  });
};

export const useOwner = (id: string) => {
  return useQuery({
    queryKey: ["owners", id],
    queryFn: async () => {
      const { data } = await api.get<Owner>(`/owners/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateOwner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newOwner: OwnerCreate) => {
      const { data } = await api.post<Owner>("/owners/", newOwner);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owners"] });
    },
  });
};

export const useUpdateOwner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...owner }: OwnerCreate & { id: string }) => {
      const { data } = await api.put<Owner>(`/owners/${id}`, owner);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owners"] });
    },
  });
};

export const useDeleteOwner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/owners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owners"] });
    },
  });
};
