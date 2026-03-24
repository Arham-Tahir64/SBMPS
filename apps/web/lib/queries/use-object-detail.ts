"use client";

import { getObjectWithFallback, queryKeys } from "@sdmps/api-client";
import { useQuery } from "@tanstack/react-query";

export function useObjectDetail(objectId?: string) {
  const query = useQuery({
    queryKey: objectId ? queryKeys.objectDetail(objectId) : ["objects", "unselected"],
    queryFn: () => getObjectWithFallback(objectId!),
    enabled: Boolean(objectId)
  });

  return {
    ...query,
    data: query.data?.data,
    isFallback: query.data?.isFallback ?? false
  };
}
