"use client";

import { getConjunctionsWithFallback, queryKeys } from "@sdmps/api-client";
import { useQuery } from "@tanstack/react-query";

export function useConjunctions() {
  const query = useQuery({
    queryKey: queryKeys.conjunctions,
    queryFn: getConjunctionsWithFallback
  });

  return {
    ...query,
    data: query.data?.data ?? [],
    isFallback: query.data?.isFallback ?? false
  };
}
