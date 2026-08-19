"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { EmployeeDirectoryRow } from "@/types/domain";

export interface EmployeeDirectoryFilter {
  search?: string;
  department?: string;
  managerId?: number;
  role?: string;
  isActive?: boolean;
}

function toQueryString(filter: EmployeeDirectoryFilter): string {
  const params = new URLSearchParams();
  if (filter.search) params.set("search", filter.search);
  if (filter.department) params.set("department", filter.department);
  if (filter.managerId !== undefined) params.set("managerId", String(filter.managerId));
  if (filter.role) params.set("role", filter.role);
  if (filter.isActive !== undefined) params.set("isActive", String(filter.isActive));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

interface UseEmployeeDirectoryResult {
  rows: EmployeeDirectoryRow[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useEmployeeDirectory(filter: EmployeeDirectoryFilter): UseEmployeeDirectoryResult {
  const [rows, setRows] = useState<EmployeeDirectoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const filterKey = JSON.stringify(filter);

  useEffect(() => {
    let cancelled = false;

    // Standard fetch-in-effect loading pattern, not derivable from props.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    apiRequest<EmployeeDirectoryRow[]>(`/employees${toQueryString(filter)}`)
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
