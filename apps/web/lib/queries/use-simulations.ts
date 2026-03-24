"use client";

import { getSimulationsWithFallback, queryKeys } from "@sdmps/api-client";
import { useQuery } from "@tanstack/react-query";

export function useSimulations(enabled = true) {
  const query = useQuery({
    queryKey: queryKeys.simulations,
    queryFn: getSimulationsWithFallback,
    enabled
  });

  return {
    ...query,
    data: query.data?.data ?? [],
    isFallback: query.data?.isFallback ?? false
  };
}
