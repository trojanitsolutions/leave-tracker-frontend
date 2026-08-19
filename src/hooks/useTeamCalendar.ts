"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { TeamCalendarResult } from "@/types/domain";

interface UseTeamCalendarResult {
  data: TeamCalendarResult | null;
  isLoading: boolean;
  error: string | null;
}

export function useTeamCalendar(enabled: boolean, month: string): UseTeamCalendarResult {
  const [data, setData] = useState<TeamCalendarResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    apiRequest<TeamCalendarResult>(`/leave-requests/manager/calendar?month=${month}`)
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
  }, [enabled, month]);

  return { data: enabled ? data : null, isLoading: enabled && isLoading, error: enabled ? error : null };
}
