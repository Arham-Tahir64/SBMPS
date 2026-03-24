"use client";

import { useQuery } from "@tanstack/react-query";
import { getObjectTrajectoryWithFallback, queryKeys } from "@sdmps/api-client";

export function useObjectTrajectory(objectId: string | undefined, minutes = 90) {
  const query = useQuery({
    queryKey: queryKeys.trajectory(objectId ?? ""),
    queryFn: () => getObjectTrajectoryWithFallback(objectId!, minutes),
    enabled: Boolean(objectId),
    staleTime: 5 * 60 * 1000, // trajectory is valid for 5 min
  });
  return {
    ...query,
    data: query.data?.data ?? null,
  };
}
