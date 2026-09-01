"use client";

import { useState } from "react";
import { BackToWorkRow } from "@/types/domain";

const STATUS_STYLES: Record<BackToWorkRow["status"], string> = {
  Returned: "bg-status-approved-bg text-status-approved-fg",
  Upcoming: "bg-status-cancelled-bg text-status-cancelled-fg",
  Overdue: "bg-status-pending-bg text-status-pending-fg",
};

const GRID_COLS = "grid-cols-[1.4fr_1fr_1fr_1.05fr]";

interface BackToWorkWatchlistProps {
  rows: BackToWorkRow[];
}

export function BackToWorkWatchlist({ rows: rowsProp }: BackToWorkWatchlistProps) {
  const [filter, setFilter] = useState<"exceptions" | "all">("exceptions");
  const rows = rowsProp.filter((row) => filter === "all" || row.status === "Overdue");

  return (
    <div className="flex h-full flex-col overflow-x-auto rounded-[14px] border border-line bg-card shadow-card">
      <div className="flex items-center justify-between px-[20px] py-[15px] pb-[13px]">
        <div>
          <div className="text-[13.5px] font-semibold">Back-to-work watchlist</div>
          <div className="mt-[2px] text-[11.5px] text-muted">
            Expected vs. actual return, next 10 days
          </div>
        </div>
        <div className="flex gap-[6px]">
          <button
            onClick={() => setFilter("exceptions")}
            className={`rounded-[7px] px-[10px] py-[5px] text-[11.5px] font-semibold transition-colors ${
              filter === "exceptions" ? "bg-primary text-white" : "border border-line text-[#4E5359] hover:bg-surface"
            }`}
          >
            Exceptions
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`rounded-[7px] px-[10px] py-[5px] text-[11.5px] font-medium transition-colors ${
              filter === "all" ? "bg-primary text-white" : "border border-line text-[#4E5359] hover:bg-surface"
            }`}
          >
            All
          </button>
        </div>
      </div>

      <div
        className={`grid min-w-[600px] ${GRID_COLS} gap-[12px] border-y border-line bg-surface px-[20px] py-2 font-mono text-[9.5px] tracking-[0.07em] text-muted`}
      >
        <div>EMPLOYEE</div>
        <div>EXPECTED BTW</div>
        <div>ACTUAL BTW</div>
        <div className="text-right">STATUS</div>
      </div>

      <div className="flex-1">
        {rows.length === 0 ? (
          <div className="flex h-full items-center justify-center px-[20px] py-[24px] text-center text-[12.5px] text-muted">
            No exceptions — everyone is on track.
          </div>
        ) : (
          rows.map((row, index) => (
            <div
              key={row.id}
              className={`grid min-w-[600px] ${GRID_COLS} items-center gap-[12px] border-b border-[#EFF0F2] px-[20px] py-[12px] transition-colors hover:bg-[#F9FAFB] ${
                index % 2 === 1 ? "bg-surface" : ""
              }`}
            >
              <div className="flex min-w-0 items-center gap-[10px]">
                <div className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full bg-surface text-[10.5px] font-semibold text-[#4E5359]">
                  {row.initials}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[12.5px] font-medium">{row.name}</div>
                  <div className="text-[10.5px] text-muted">{row.department}</div>
                </div>
              </div>
              <div className="font-mono text-[11.5px] text-[#4E5359]">{row.expectedBackToWork}</div>
              <div
                className={`font-mono text-[11.5px] ${row.actualBackToWork ? "text-[#4E5359]" : "text-muted-2"}`}
              >
                {row.actualBackToWork ?? "—"}
              </div>
              <div className="flex justify-end">
                <span
                  className={`rounded-full px-[10px] py-[3px] text-[11px] font-semibold ${STATUS_STYLES[row.status]}`}
                >
                  {row.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
