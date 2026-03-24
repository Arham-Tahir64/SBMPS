"use client";

import { getConjunctionWithFallback, queryKeys } from "@sdmps/api-client";
import { useQuery } from "@tanstack/react-query";

export function useConjunctionDetail(conjunctionId?: string) {
  const query = useQuery({
    queryKey: conjunctionId ? queryKeys.conjunctionDetail(conjunctionId) : ["conjunctions", "unselected"],
    queryFn: () => getConjunctionWithFallback(conjunctionId!),
    enabled: Boolean(conjunctionId)
  });

  return {
    ...query,
    data: query.data?.data,
    isFallback: query.data?.isFallback ?? false
  };
}
