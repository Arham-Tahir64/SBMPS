"use client";

import { getFeedStatusWithFallback, queryKeys } from "@sdmps/api-client";
import { useQuery } from "@tanstack/react-query";

export function useFeedStatus() {
  const query = useQuery({
    queryKey: queryKeys.feeds,
    queryFn: getFeedStatusWithFallback
  });

  return {
    ...query,
    data: query.data?.data ?? [],
    isFallback: query.data?.isFallback ?? false
  };
}
