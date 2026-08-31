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
  const [isLoading, setIsLoading] = useState(enabled);
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

interface UseTeamCalendarYearResult {
  data: (TeamCalendarResult | null)[];
  isLoading: boolean;
  error: string | null;
}

const EMPTY_YEAR = Array<TeamCalendarResult | null>(12).fill(null);

/** Fetches all 12 months of a year in parallel, reusing the same per-month endpoint. */
export function useTeamCalendarYear(enabled: boolean, year: number): UseTeamCalendarYearResult {
  const [data, setData] = useState<(TeamCalendarResult | null)[]>(EMPTY_YEAR);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    const monthKeys = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`);
    Promise.all(monthKeys.map((m) => apiRequest<TeamCalendarResult>(`/leave-requests/manager/calendar?month=${m}`)))
      .then((results) => {
        if (!cancelled) setData(results);
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
  }, [enabled, year]);

  return { data: enabled ? data : EMPTY_YEAR, isLoading: enabled && isLoading, error: enabled ? error : null };
}
