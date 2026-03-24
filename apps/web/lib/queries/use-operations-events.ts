"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { isApiBaseUrlConfigured, queryKeys } from "@sdmps/api-client";

export type ConnectionState = "connecting" | "open" | "closed";

export function useOperationsEvents() {
  const queryClient = useQueryClient();
  const [connectionState, setConnectionState] = useState<ConnectionState>("closed");
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!isApiBaseUrlConfigured()) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
    const es = new EventSource(`${baseUrl}/v1/live/operations/events`);
    esRef.current = es;
    setConnectionState("connecting");

    es.addEventListener("open", () => {
      setConnectionState("open");
    });

    es.addEventListener("operations", () => {
      // Invalidate live snapshot and dashboard so they refetch with fresh data.
      void queryClient.invalidateQueries({ queryKey: queryKeys.live });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    });

    es.addEventListener("error", () => {
      setConnectionState("closed");
    });

    return () => {
      es.close();
      esRef.current = null;
      setConnectionState("closed");
    };
  }, [queryClient]);

  return { connectionState };
}
