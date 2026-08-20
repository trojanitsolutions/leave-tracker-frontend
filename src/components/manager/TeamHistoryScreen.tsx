"use client";

import { useMemo, useState } from "react";
import { StatusPill } from "@/components/ui/StatusPill";
import { LoadingState } from "@/components/ui/Spinner";
import { useTeamHistory } from "@/hooks/useTeamHistory";
import { formatRangeLabelUpper } from "@/lib/date";

const GRID_COLS = "grid-cols-[1.4fr_1.1fr_1.4fr_0.5fr_1.1fr_0.85fr]";

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TeamHistoryScreen() {
  const { rows, isLoading, error } = useTeamHistory(true);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => row.employeeName.toLowerCase().includes(term));
  }, [rows, search]);

  return (
    <div className="flex w-full flex-col gap-[14px]">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search employee…"
        className="w-[260px] rounded-[9px] border border-line px-[13px] py-2 text-[12.5px] transition-colors hover:border-line-hover"
      />

      <div className="overflow-x-auto rounded-[14px] border border-line bg-card shadow-card">
        <div
          className={`grid min-w-[920px] ${GRID_COLS} gap-[12px] border-b border-line bg-surface px-[20px] py-[9px] font-mono text-[9.5px] tracking-[0.07em] text-muted`}
        >
          <div>EMPLOYEE</div>
          <div>TYPE</div>
          <div>DATES</div>
          <div>DAYS</div>
          <div>DECIDED BY</div>
          <div className="text-right">STATUS</div>
        </div>

        {isLoading ? (
          <LoadingState label="Loading your team’s history…" />
        ) : error ? (
          <div className="px-[20px] py-[24px] text-center text-[12.5px] text-status-rejected-fg">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="px-[20px] py-[24px] text-center text-[12.5px] text-muted">
            No team leave history yet.
          </div>
        ) : (
          filtered.map((row, index) => (
            <div
              key={`${row.kind}-${row.employeeId}-${row.startDate}-${index}`}
              className={`grid min-w-[920px] ${GRID_COLS} items-center gap-[12px] border-b border-[#EFF0F2] px-[20px] py-[12px] transition-colors hover:bg-[#F9FAFB] ${
                index % 2 === 1 ? "bg-surface" : ""
              }`}
            >
              <div className="flex min-w-0 items-center gap-[10px]">
                <div className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full bg-surface text-[10.5px] font-semibold text-[#4E5359]">
                  {getInitials(row.employeeName)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[12.5px] font-medium">{row.employeeName}</div>
                  <div className="text-[10.5px] text-muted">{row.department ?? "—"}</div>
                </div>
              </div>
              <div className="text-[12.5px]">{row.type}</div>
              <div className="font-mono text-[11.5px] text-[#4E5359]">
                {formatRangeLabelUpper(row.startDate, row.endDate)}
              </div>
              <div className="text-[12.5px] tabular-nums">{row.numberOfDays}</div>
              <div className="text-[12.5px] text-[#4E5359]">{row.decidedByName ?? "—"}</div>
              <div className="flex justify-end">
                <StatusPill status={row.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
