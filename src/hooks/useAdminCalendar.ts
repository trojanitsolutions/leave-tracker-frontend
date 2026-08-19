"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { TeamCalendarResult } from "@/types/domain";

interface UseAdminCalendarResult {
  data: TeamCalendarResult | null;
  isLoading: boolean;
  error: string | null;
}

export function useAdminCalendar(enabled: boolean, month: string, department: string): UseAdminCalendarResult {
  const [data, setData] = useState<TeamCalendarResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({ month });
    if (department) params.set("department", department);

    apiRequest<TeamCalendarResult>(`/admin/calendar?${params.toString()}`)
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
  }, [enabled, month, department]);

  return { data: enabled ? data : null, isLoading: enabled && isLoading, error: enabled ? error : null };
}
