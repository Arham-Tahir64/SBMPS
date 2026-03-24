"use client";

import { useQuery } from "@tanstack/react-query";
import { getAltitudeHeatmapWithFallback, queryKeys } from "@sdmps/api-client";

export function useAltitudeHeatmap() {
  const query = useQuery({
    queryKey: queryKeys.heatmap,
    queryFn: getAltitudeHeatmapWithFallback,
    refetchInterval: 60_000,
  });
  return {
    ...query,
    data: query.data?.data ?? [],
    isFallback: query.data?.isFallback ?? false,
  };
}
