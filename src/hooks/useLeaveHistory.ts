"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { LeaveHistoryEntry } from "@/types/domain";

interface UseLeaveHistoryResult {
  entries: LeaveHistoryEntry[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useLeaveHistory(enabled: boolean): UseLeaveHistoryResult {
  const [entries, setEntries] = useState<LeaveHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    apiRequest<LeaveHistoryEntry[]>("/leave-requests/history")
      .then((data) => {
        if (!cancelled) setEntries(data);
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
    entries: enabled ? entries : [],
    isLoading: enabled && isLoading,
    error: enabled ? error : null,
    refresh,
  };
}
