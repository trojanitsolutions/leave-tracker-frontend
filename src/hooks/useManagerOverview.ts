"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { ManagerOverview } from "@/types/domain";

interface UseManagerOverviewResult {
  data: ManagerOverview | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/** Fetches the real manager team overview — only when `enabled`. */
export function useManagerOverview(enabled: boolean): UseManagerOverviewResult {
  const [data, setData] = useState<ManagerOverview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    apiRequest<ManagerOverview>("/leave-requests/manager/overview")
      .then((result) => {
        if (!cancelled) setData(result);
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
  }, [enabled, nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  return {
    data: enabled ? data : null,
    isLoading: enabled && isLoading,
    error: enabled ? error : null,
    refresh,
  };
}
