"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { TeamCalendarResult } from "@/types/domain";

interface UseTeamCalendarResult {
  data: TeamCalendarResult | null;
  isLoading: boolean;
  error: string | null;
}

export function useTeamCalendar(enabled: boolean, month: string, department: string): UseTeamCalendarResult {
  const [data, setData] = useState<TeamCalendarResult | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({ month });
    if (department) params.set("department", department);

    apiRequest<TeamCalendarResult>(`/leave-requests/manager/calendar?${params.toString()}`)
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

interface UseTeamCalendarYearResult {
  data: (TeamCalendarResult | null)[];
  isLoading: boolean;
  error: string | null;
}

const EMPTY_YEAR = Array<TeamCalendarResult | null>(12).fill(null);

/** Fetches all 12 months of a year in parallel, reusing the same per-month endpoint. */
export function useTeamCalendarYear(enabled: boolean, year: number, department: string): UseTeamCalendarYearResult {
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
    Promise.all(
      monthKeys.map((m) => {
        const params = new URLSearchParams({ month: m });
        if (department) params.set("department", department);
        return apiRequest<TeamCalendarResult>(`/leave-requests/manager/calendar?${params.toString()}`);
      }),
    )
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
  }, [enabled, year, department]);

  return { data: enabled ? data : EMPTY_YEAR, isLoading: enabled && isLoading, error: enabled ? error : null };
}
