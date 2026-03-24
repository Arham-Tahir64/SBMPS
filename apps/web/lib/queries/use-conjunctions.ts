"use client";

import { getConjunctionsWithFallback, queryKeys, sampleConjunctions } from "@sdmps/api-client";
import { useQuery } from "@tanstack/react-query";

export function useConjunctions() {
  const query = useQuery({
    queryKey: queryKeys.conjunctions,
    queryFn: getConjunctionsWithFallback
  });

  return {
    ...query,
    data: query.data?.data ?? sampleConjunctions,
    isFallback: query.data?.isFallback ?? true
  };
}
