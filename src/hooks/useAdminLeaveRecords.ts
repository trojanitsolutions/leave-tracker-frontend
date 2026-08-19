"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { AdminLeaveRecord, LeaveDecisionStatus } from "@/types/domain";

export interface AdminLeaveRecordFilter {
  employeeId?: number;
  department?: string;
  managerId?: number;
  kind?: "leave" | "extension";
  status?: LeaveDecisionStatus;
  from?: string;
  to?: string;
}

function toQueryString(filter: AdminLeaveRecordFilter): string {
  const params = new URLSearchParams();
  if (filter.employeeId !== undefined) params.set("employeeId", String(filter.employeeId));
  if (filter.department) params.set("department", filter.department);
  if (filter.managerId !== undefined) params.set("managerId", String(filter.managerId));
  if (filter.kind) params.set("kind", filter.kind);
  if (filter.status) params.set("status", filter.status);
  if (filter.from) params.set("from", filter.from);
  if (filter.to) params.set("to", filter.to);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

interface UseAdminLeaveRecordsResult {
  rows: AdminLeaveRecord[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useAdminLeaveRecords(filter: AdminLeaveRecordFilter): UseAdminLeaveRecordsResult {
  const [rows, setRows] = useState<AdminLeaveRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const filterKey = JSON.stringify(filter);

  useEffect(() => {
    let cancelled = false;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    apiRequest<AdminLeaveRecord[]>(`/admin/leave-records${toQueryString(filter)}`)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  return { rows, isLoading, error, refresh };
}
