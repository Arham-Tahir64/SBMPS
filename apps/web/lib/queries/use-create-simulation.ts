"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSimulation, queryKeys, type CreateSimulationInput } from "@sdmps/api-client";

export function useCreateSimulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSimulationInput) => createSimulation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.simulations });
    },
  });
}
