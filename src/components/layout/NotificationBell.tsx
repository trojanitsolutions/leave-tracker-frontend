"use client";

import { useEffect, useRef, useState } from "react";
import { LoadingState } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDateTimeUpper } from "@/lib/date";

export function NotificationBell() {
  const { employee } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, isLoading, error, markRead, markAllRead, dismiss } = useNotifications(
    Boolean(employee),
  );

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!employee) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative flex h-9 w-9 flex-none items-center justify-center rounded-[9px] border border-line bg-card text-[#4E5359] transition-colors hover:border-line-hover hover:bg-surface"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path
            d="M18 8a6 6 0 1 0-12 0c0 4-1.5 5.5-1.5 6.5 0 .5.5 1 1 1h13c.5 0 1-.5 1-1 0-1-1.5-2.5-1.5-6.5Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M9.5 18.5a2.5 2.5 0 0 0 5 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute top-[3px] right-[3px] flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-status-rejected-fg px-[4px] font-mono text-[9.5px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute top-[calc(100%+8px)] right-0 z-30 w-[340px] overflow-hidden rounded-[14px] border border-line bg-card shadow-[0_24px_64px_-24px_rgba(14,15,17,0.45)]">
          <div className="flex items-center justify-between border-b border-line px-[16px] py-[12px]">
            <div className="text-[13px] font-semibold">Notifications</div>
            {unreadCount > 0 ? (
              <button
                onClick={() => markAllRead()}
                className="text-[11.5px] font-medium text-primary hover:underline"
              >
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {isLoading ? (
              <LoadingState label="Loading notifications…" />
            ) : error ? (
              <div className="px-[16px] py-[24px] text-center text-[12.5px] text-status-rejected-fg">
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-[16px] py-[24px] text-center text-[12.5px] text-muted">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markRead(n.id)}
                  className={`group flex w-full items-start gap-[10px] border-b border-[#EFF0F2] px-[16px] py-[12px] text-left transition-colors hover:bg-surface ${
                    n.isRead ? "" : "cursor-pointer bg-[#F4FAFB]"
                  }`}
                >
                  <span
                    className={`mt-[5px] h-[7px] w-[7px] flex-none rounded-full ${
                      n.isRead ? "bg-transparent" : "bg-accent"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] leading-snug">{n.message}</div>
                    <div className="mt-[3px] font-mono text-[10px] text-muted">
                      {formatDateTimeUpper(n.createdAt)}
                    </div>
                  </div>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      dismiss(n.id);
                    }}
                    aria-label="Dismiss notification"
                    className="flex-none rounded-[6px] px-[4px] text-[13px] text-muted opacity-0 transition-opacity hover:text-ink group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
