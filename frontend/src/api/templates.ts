import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  Template,
  TemplateCreate,
  TemplateUpdate,
  Measure,
  MeasureCreate,
  MeasureUpdate,
} from "@/types/template";

// --- Templates ---

export const useTemplates = () => {
  return useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data } = await api.get<Template[]>("/templates");
      return data;
    },
  });
};

export const useTemplate = (id: string) => {
  return useQuery({
    queryKey: ["templates", id],
    queryFn: async () => {
      const { data } = await api.get<Template>(`/templates/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newTemplate: TemplateCreate) => {
      const { data } = await api.post<Template>("/templates", newTemplate);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
};

export const useUpdateTemplate = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: TemplateUpdate) => {
      const { data } = await api.put<Template>(`/templates/${id}`, updates);
      return data;
    },
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["templates", template.id] });
    },
  });
};

// --- Measures ---

export const useMeasures = () => {
  return useQuery({
    queryKey: ["measures"],
    queryFn: async () => {
      const { data } = await api.get<Measure[]>("/measures");
      return data;
    },
  });
};

export const useMeasure = (id: string) => {
  return useQuery({
    queryKey: ["measures", id],
    queryFn: async () => {
      const { data } = await api.get<Measure>(`/measures/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateMeasure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newMeasure: MeasureCreate) => {
      const { data } = await api.post<Measure>("/measures/", newMeasure);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measures"] });
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
};

export const useUpdateMeasure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: MeasureUpdate;
    }) => {
      const { data } = await api.put<Measure>(`/measures/${id}`, updates);
      return data;
    },
    onSuccess: (measure) => {
      queryClient.invalidateQueries({ queryKey: ["measures"] });
      queryClient.invalidateQueries({ queryKey: ["measures", measure.id] });
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
};

export const useDeleteMeasure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/measures/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measures"] });
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
};
