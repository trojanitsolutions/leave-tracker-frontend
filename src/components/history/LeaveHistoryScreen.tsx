"use client";

import { useMemo, useState } from "react";
import { StatusPill } from "@/components/ui/StatusPill";
import { LoadingState } from "@/components/ui/Spinner";
import { useLeaveHistory } from "@/hooks/useLeaveHistory";
import { formatRangeLabelUpper, formatShortDate } from "@/lib/date";
import { LeaveDecisionStatus } from "@/types/domain";

type FilterKey = "all" | LeaveDecisionStatus;

const GRID_COLS = "grid-cols-[0.6fr_1.2fr_1.4fr_0.5fr_0.9fr_0.9fr_0.85fr]";

export function LeaveHistoryScreen() {
  const { entries, isLoading, error } = useLeaveHistory(true);
  const [filter, setFilter] = useState<FilterKey>("all");

  const counts = useMemo(() => {
    const base: Record<FilterKey, number> = { all: entries.length, pending: 0, approved: 0, rejected: 0, cancelled: 0 };
    for (const entry of entries) base[entry.status] += 1;
    return base;
  }, [entries]);

  const filtered = useMemo(
    () => (filter === "all" ? entries : entries.filter((e) => e.status === filter)),
    [entries, filter],
  );

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: `All ${counts.all}` },
    { key: "pending", label: `Pending ${counts.pending}` },
    { key: "approved", label: `Approved ${counts.approved}` },
    { key: "rejected", label: `Rejected ${counts.rejected}` },
  ];

  return (
    <div className="flex w-full flex-col gap-[14px]">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((option) => (
          <button
            key={option.key}
            onClick={() => setFilter(option.key)}
            className={`rounded-[8px] px-[13px] py-[6px] text-[12.5px] font-semibold transition-colors ${
              filter === option.key
                ? "bg-primary text-white"
                : "border border-line bg-card font-medium text-[#4E5359] hover:bg-surface"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-[14px] border border-line bg-card shadow-card">
        <div
          className={`grid min-w-[900px] ${GRID_COLS} gap-[12px] border-b border-line bg-surface px-[20px] py-[9px] font-mono text-[9.5px] tracking-[0.07em] text-muted`}
        >
          <div>REF</div>
          <div>TYPE</div>
          <div>DATES</div>
          <div>DAYS</div>
          <div>EXPECTED BTW</div>
          <div>ACTUAL BTW</div>
          <div className="text-right">STATUS</div>
        </div>

        {isLoading ? (
          <LoadingState label="Loading your leave history…" />
        ) : error ? (
          <div className="px-[20px] py-[24px] text-center text-[12.5px] text-status-rejected-fg">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="px-[20px] py-[24px] text-center text-[12.5px] text-muted">
            No requests match this filter.
          </div>
        ) : (
          filtered.map((entry, index) => (
            <div
              key={`${entry.kind}-${entry.id}`}
              className={`grid min-w-[900px] ${GRID_COLS} items-center gap-[12px] border-b border-[#EFF0F2] px-[20px] py-[13px] transition-colors hover:bg-[#F9FAFB] ${
                index % 2 === 1 ? "bg-surface" : ""
              }`}
            >
              <div className="font-mono text-[11px] text-muted">
                {entry.kind === "extension" ? "EXT" : "LR"}-{String(entry.id).padStart(3, "0")}
              </div>
              <div className="flex items-center gap-2 text-[13px] font-medium">
                {entry.kind === "extension" ? (
                  <span className="font-mono text-[13px] text-[#7C5CD6]">↳</span>
                ) : null}
                {entry.leaveTypeName}
              </div>
              <div className="font-mono text-[11.5px] text-[#4E5359]">
                {formatRangeLabelUpper(entry.startDate, entry.endDate)}
              </div>
              <div className="text-[13px] tabular-nums">{entry.numberOfDays}</div>
              <div className="text-[12.5px] text-[#4E5359]">{formatShortDate(entry.backToWorkDate)}</div>
              <div className="text-[12.5px] text-[#4E5359]">
                {entry.actualBackToWorkDate ? formatShortDate(entry.actualBackToWorkDate) : "—"}
              </div>
              <div className="flex justify-end">
                <StatusPill status={entry.status} />
              </div>
            </div>
          ))
        )}

        <div className="flex items-center justify-between px-[20px] py-[12px] text-[12px] text-muted">
          <div>Extensions are listed as their own record, indented under the leave they extend.</div>
          <div className="font-mono text-[11px]">
            {filtered.length} OF {entries.length}
          </div>
        </div>
      </div>
    </div>
  );
}
