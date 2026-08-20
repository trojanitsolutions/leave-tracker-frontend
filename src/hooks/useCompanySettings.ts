"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { CompanySettings } from "@/types/domain";

interface UseCompanySettingsResult {
  data: CompanySettings | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  save: (input: Partial<CompanySettings>) => Promise<void>;
}

export function useCompanySettings(enabled: boolean): UseCompanySettingsResult {
  const [data, setData] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    apiRequest<CompanySettings>("/admin/settings")
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
  }, [enabled, nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  const save = useCallback(async (input: Partial<CompanySettings>) => {
    const updated = await apiRequest<CompanySettings>("/admin/settings", { method: "PATCH", body: input });
    setData(updated);
  }, []);

  return {
    data: enabled ? data : null,
    isLoading: enabled && isLoading,
    error: enabled ? error : null,
    refresh,
    save,
  };
}
