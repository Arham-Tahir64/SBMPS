"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardSummaryWithFallback, queryKeys } from "@sdmps/api-client";

export function useDashboard() {
  const query = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: getDashboardSummaryWithFallback,
    refetchInterval: 30_000,
  });
  return {
    ...query,
    data: query.data?.data,
    isFallback: query.data?.isFallback ?? false,
  };
}
