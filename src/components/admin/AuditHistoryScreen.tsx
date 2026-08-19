"use client";

import { useMemo, useState } from "react";
import { useAuditHistory } from "@/hooks/useAuditHistory";
import { formatDateTimeUpper } from "@/lib/date";
import { AuditHistoryRow } from "@/types/domain";

type FilterKey = "all" | "corrections" | "system";

const CORRECTION_ACTIONS = new Set(["employee_created", "employee_updated"]);

const DOT_COLORS: Record<string, string> = {
  leave_submitted: "#0B96AF",
  leave_approved: "#166534",
  leave_rejected: "#991B1B",
  leave_decision_undone: "#92400E",
  employee_created: "#17191D",
  employee_updated: "#6C7076",
};

const ROLE_LABELS: Record<string, string> = {
  employee: "EMPLOYEE",
  manager: "MANAGER",
  admin: "ADMIN",
};

function matchesFilter(row: AuditHistoryRow, filter: FilterKey): boolean {
  if (filter === "all") return true;
  const isCorrection = CORRECTION_ACTIONS.has(row.action);
  return filter === "corrections" ? isCorrection : !isCorrection;
}

function targetLabel(row: AuditHistoryRow): string {
  if (row.leaveRequestSummary) {
    return `${row.employeeName} · ${row.leaveRequestSummary}`;
  }
  return `Employee record: ${row.employeeName}`;
}

export function AuditHistoryScreen() {
  const { rows, isLoading, error } = useAuditHistory();
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => rows.filter((row) => matchesFilter(row, filter)), [rows, filter]);

  return (
    <div className="flex w-full flex-col gap-[14px]">
      <div className="flex items-center gap-2">
        {(
          [
            { key: "all" as const, label: "All actions" },
            { key: "corrections" as const, label: "Corrections only" },
            { key: "system" as const, label: "System" },
          ]
        ).map((option) => (
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
        <div className="ml-auto text-[12px] text-muted">Entries cannot be edited or deleted</div>
      </div>

      <div className="rounded-[14px] border border-line bg-card px-[22px] py-[6px] pb-[18px] shadow-card">
        {isLoading ? (
          <div className="py-[24px] text-center text-[12.5px] text-muted">Loading…</div>
        ) : error ? (
          <div className="py-[24px] text-center text-[12.5px] text-status-rejected-fg">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="py-[24px] text-center text-[12.5px] text-muted">No matching audit entries.</div>
        ) : (
          filtered.map((row, index) => (
            <div
              key={row.id}
              className="grid grid-cols-[90px_20px_1fr] items-start gap-[14px] border-b border-[#EFF0F2] py-[14px] last:border-b-0"
            >
              <div className="pt-[2px] font-mono text-[10.5px] text-muted">
                {formatDateTimeUpper(row.performedAt)}
              </div>
              <div className="flex flex-col items-center pt-[4px]">
                <span
                  className="h-[8px] w-[8px] flex-none rounded-full"
                  style={{ background: DOT_COLORS[row.action] ?? "#6C7076" }}
                />
                {index < filtered.length - 1 ? (
                  <span className="mt-[5px] min-h-[22px] w-px flex-1 bg-[#EFF0F2]" />
                ) : null}
              </div>
              <div>
                <div className="text-[13px]">
                  <b className="font-semibold">{row.performedByName}</b>{" "}
                  <span className="text-muted">·</span> {row.actionLabel}
                </div>
                <div className="mt-[3px] text-[12.5px] text-[#4E5359]">{targetLabel(row)}</div>
                <div className="mt-[5px] font-mono text-[9.5px] tracking-[0.06em] text-muted-2">
                  {ROLE_LABELS[row.performedByRole] ?? row.performedByRole.toUpperCase()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
