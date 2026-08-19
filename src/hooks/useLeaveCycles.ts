"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { LeaveCycleRecord } from "@/types/domain";

interface UseLeaveCyclesResult {
  cycles: LeaveCycleRecord[];
  isLoading: boolean;
  error: string | null;
}

export function useLeaveCycles(enabled: boolean): UseLeaveCyclesResult {
  const [cycles, setCycles] = useState<LeaveCycleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    apiRequest<LeaveCycleRecord[]>("/leave-requests/cycles")
      .then((data) => {
        if (!cancelled) setCycles(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { cycles: enabled ? cycles : [], isLoading: enabled && isLoading, error: enabled ? error : null };
}
