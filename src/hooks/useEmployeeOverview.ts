"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { EmployeeOverview } from "@/types/domain";

interface UseEmployeeOverviewResult {
  overview: EmployeeOverview | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/** Fetches the real balance/status/recent-requests overview — only when `enabled`. */
export function useEmployeeOverview(enabled: boolean): UseEmployeeOverviewResult {
  const [overview, setOverview] = useState<EmployeeOverview | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    // Standard fetch-in-effect loading pattern — the setState calls here start
    // the request's loading/error state, not something derivable from props.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    apiRequest<EmployeeOverview>("/leave-requests/me")
      .then((data) => {
        if (!cancelled) setOverview(data);
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
    overview: enabled ? overview : null,
    isLoading: enabled && isLoading,
    error: enabled ? error : null,
    refresh,
  };
}
