"use client";

import { getObjectsWithFallback, queryKeys } from "@sdmps/api-client";
import { useQuery } from "@tanstack/react-query";

export function useObjects() {
  const query = useQuery({
    queryKey: queryKeys.objects,
    queryFn: getObjectsWithFallback
  });

  return {
    ...query,
    data: query.data?.data ?? [],
    isFallback: query.data?.isFallback ?? false
  };
}
