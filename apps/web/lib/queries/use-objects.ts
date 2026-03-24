"use client";

import { getObjectsWithFallback, queryKeys, sampleObjects } from "@sdmps/api-client";
import { useQuery } from "@tanstack/react-query";

export function useObjects() {
  const query = useQuery({
    queryKey: queryKeys.objects,
    queryFn: getObjectsWithFallback
  });

  return {
    ...query,
    data: query.data?.data ?? sampleObjects,
    isFallback: query.data?.isFallback ?? true
  };
}
