"use client";

import { queryKeys, refreshFeeds } from "@sdmps/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useFeedRefresh() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshFeeds,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.live }),
        queryClient.invalidateQueries({ queryKey: queryKeys.objects }),
        queryClient.invalidateQueries({ queryKey: queryKeys.feeds }),
        queryClient.invalidateQueries({ queryKey: queryKeys.alerts })
      ]);
    }
  });
}
