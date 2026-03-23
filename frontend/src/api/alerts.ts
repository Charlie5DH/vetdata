import * as React from "react";
import { useQueries, useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Alert } from "@/types";

export const useSessionAlerts = (sessionId: string, limit = 50) => {
  return useQuery({
    queryKey: ["alerts", "sessions", sessionId, limit],
    queryFn: async () => {
      const { data } = await api.get<Alert[]>(`/sessions/${sessionId}/alerts`, {
        params: { limit },
      });
      return data;
    },
    enabled: !!sessionId,
  });
};

export const useSessionsAlerts = (sessionIds: string[], limit = 50) => {
  const uniqueSessionIds = React.useMemo(
    () =>
      Array.from(new Set(sessionIds.filter(Boolean))).sort((left, right) =>
        left.localeCompare(right, "pt-BR"),
      ),
    [sessionIds],
  );

  const queries = useQueries({
    queries: uniqueSessionIds.map((sessionId: string) => ({
      queryKey: ["alerts", "sessions", sessionId, limit],
      queryFn: async () => {
        const { data } = await api.get<Alert[]>(
          `/sessions/${sessionId}/alerts`,
          {
            params: { limit },
          },
        );
        return data;
      },
      enabled: uniqueSessionIds.length > 0,
    })),
  });

  const data = React.useMemo(
    () => queries.flatMap((query) => query.data ?? []),
    [queries],
  );

  return {
    data,
    isLoading: queries.some((query) => query.isLoading),
    isFetching: queries.some((query) => query.isFetching),
  };
};
