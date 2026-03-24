"use client";

import { getLiveSnapshotWithFallback, queryKeys, sampleLiveSnapshot } from "@sdmps/api-client";
import { useQuery } from "@tanstack/react-query";

export function useLiveSnapshot() {
  const query = useQuery({
    queryKey: queryKeys.live,
    queryFn: getLiveSnapshotWithFallback
  });

  return {
    ...query,
    data: query.data?.data ?? sampleLiveSnapshot,
    isFallback: query.data?.isFallback ?? true
  };
}
