"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { AuditHistoryRow } from "@/types/domain";

interface UseAuditHistoryResult {
  rows: AuditHistoryRow[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useAuditHistory(): UseAuditHistoryResult {
  const [rows, setRows] = useState<AuditHistoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    // Standard fetch-in-effect loading pattern, not derivable from props.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    apiRequest<AuditHistoryRow[]>("/admin/audit-history")
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
  }, [nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  return { rows, isLoading, error, refresh };
}
