"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { AdminOverview } from "@/types/domain";

interface UseAdminOverviewResult {
  data: AdminOverview | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/** Fetches the real admin overview — only when `enabled`. */
export function useAdminOverview(enabled: boolean): UseAdminOverviewResult {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    // Standard fetch-in-effect loading pattern, not derivable from props.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    apiRequest<AdminOverview>("/admin/overview")
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
