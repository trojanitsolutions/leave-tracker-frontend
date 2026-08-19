"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { NotificationRecord } from "@/types/domain";

interface UseNotificationsResult {
  notifications: NotificationRecord[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  dismiss: (id: number) => Promise<void>;
}

const POLL_INTERVAL_MS = 30000;

/** Fetches the signed-in employee's notifications, polling for updates — only when `enabled`. */
export function useNotifications(enabled: boolean): UseNotificationsResult {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function load(showLoading: boolean) {
      if (showLoading) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoading(true);
        setError(null);
      }
      try {
        const [list, unread] = await Promise.all([
          apiRequest<NotificationRecord[]>("/notifications"),
          apiRequest<{ count: number }>("/notifications/unread-count"),
        ]);
        if (!cancelled) {
          setNotifications(list);
          setUnreadCount(unread.count);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load(true);
    const interval = setInterval(() => load(false), POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [enabled, nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  const markRead = useCallback(
    async (id: number) => {
      await apiRequest(`/notifications/${id}/read`, { method: "POST" });
      refresh();
    },
    [refresh],
  );

  const markAllRead = useCallback(async () => {
    await apiRequest("/notifications/read-all", { method: "POST" });
    refresh();
  }, [refresh]);

  const dismiss = useCallback(
    async (id: number) => {
      await apiRequest(`/notifications/${id}`, { method: "DELETE" });
      refresh();
    },
    [refresh],
  );

  return {
    notifications: enabled ? notifications : [],
    unreadCount: enabled ? unreadCount : 0,
    isLoading: enabled && isLoading,
    error: enabled ? error : null,
    refresh,
    markRead,
    markAllRead,
    dismiss,
  };
}
