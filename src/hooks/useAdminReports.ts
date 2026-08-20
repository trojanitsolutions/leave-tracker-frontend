"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { AdminReportsResult } from "@/types/domain";

interface UseAdminReportsResult {
  data: AdminReportsResult | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useAdminReports(enabled: boolean, year?: number, department?: string): UseAdminReportsResult {
  const [data, setData] = useState<AdminReportsResult | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (year) params.set("year", String(year));
    if (department) params.set("department", department);
    const query = params.toString();

    apiRequest<AdminReportsResult>(`/admin/reports${query ? `?${query}` : ""}`)
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
  }, [enabled, year, department, nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  return {
    data: enabled ? data : null,
    isLoading: enabled && isLoading,
    error: enabled ? error : null,
    refresh,
  };
}
