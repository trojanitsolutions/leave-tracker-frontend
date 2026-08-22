"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { LeaveTypeSummary } from "@/types/domain";

// Module-level cache shared across every component on the page — this list is read from
// many places at once (queue rows, calendar legends, reports chart, admin screen, apply
// form), so each mount reuses the same in-flight fetch instead of firing N redundant ones.
let cache: LeaveTypeSummary[] | null = null;
let inflight: Promise<LeaveTypeSummary[]> | null = null;
const subscribers = new Set<() => void>();

function fetchTypes(): Promise<LeaveTypeSummary[]> {
  if (!inflight) {
    inflight = apiRequest<LeaveTypeSummary[]>("/leave-types").finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

interface UseLeaveTypesResult {
  types: LeaveTypeSummary[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/** Every leave type, active or not, including the child (extension) type — see leaveTypeStyles.ts for why. */
export function useLeaveTypes(): UseLeaveTypesResult {
  const [types, setTypes] = useState<LeaveTypeSummary[]>(cache ?? []);
  const [isLoading, setIsLoading] = useState(cache === null);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    const notify = () => setTypes(cache ?? []);
    subscribers.add(notify);

    // Cache already warm and this isn't an explicit refresh — nothing to fetch, just
    // stay subscribed so a refresh triggered by another component still reaches us.
    if (cache !== null && nonce === 0) {
      return () => {
        subscribers.delete(notify);
      };
    }

    let cancelled = false;

    // Standard fetch-in-effect loading pattern — matches every other data hook in this codebase.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    fetchTypes()
      .then((result) => {
        cache = result;
        subscribers.forEach((n) => n());
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load leave types");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      subscribers.delete(notify);
    };
  }, [nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  return { types, isLoading, error, refresh };
}
