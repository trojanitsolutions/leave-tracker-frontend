"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { TeamHistoryRow } from "@/types/domain";

interface UseTeamHistoryResult {
  rows: TeamHistoryRow[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useTeamHistory(enabled: boolean): UseTeamHistoryResult {
  const [rows, setRows] = useState<TeamHistoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    apiRequest<TeamHistoryRow[]>("/leave-requests/manager/history")
      .then((data) => {
        if (!cancelled) setRows(data);
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

  return { rows: enabled ? rows : [], isLoading: enabled && isLoading, error: enabled ? error : null, refresh };
}
