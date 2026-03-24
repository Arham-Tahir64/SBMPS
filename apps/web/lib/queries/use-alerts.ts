"use client";

import { getAlertsWithFallback, queryKeys } from "@sdmps/api-client";
import { useQuery } from "@tanstack/react-query";

export function useAlerts() {
  const query = useQuery({
    queryKey: queryKeys.alerts,
    queryFn: getAlertsWithFallback
  });

  return {
    ...query,
    data: query.data?.data ?? [],
    isFallback: query.data?.isFallback ?? false
  };
}
