"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { ManagerQueueResult } from "@/types/domain";

interface UseManagerQueueResult {
  data: ManagerQueueResult | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/** Fetches the real manager approval queue — only when `enabled`. */
export function useManagerQueue(enabled: boolean): UseManagerQueueResult {
  const [data, setData] = useState<ManagerQueueResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    // Standard fetch-in-effect loading pattern, not derivable from props.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    apiRequest<ManagerQueueResult>("/leave-requests/manager/queue")
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
