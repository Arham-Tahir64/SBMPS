"use client";

import { getLiveSnapshotWithFallback, queryKeys, sampleLiveSnapshot } from "@sdmps/api-client";
import { useQuery } from "@tanstack/react-query";

const emptyLiveSnapshot = {
  ...sampleLiveSnapshot,
  objects: [],
  conjunctions: [],
  feeds: []
};

export function useLiveSnapshot() {
  const query = useQuery({
    queryKey: queryKeys.live,
    queryFn: getLiveSnapshotWithFallback,
    refetchInterval: 30_000,
  });

  return {
    ...query,
    data: query.data?.data ?? emptyLiveSnapshot,
    isFallback: query.data?.isFallback ?? false
  };
}
