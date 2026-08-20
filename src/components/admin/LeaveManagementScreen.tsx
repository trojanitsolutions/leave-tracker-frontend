"use client";

import { useMemo, useState } from "react";
import { CorrectRecordModal } from "@/components/admin/CorrectRecordModal";
import { RecordBackToWorkModal } from "@/components/admin/RecordBackToWorkModal";
import { LoadingState } from "@/components/ui/Spinner";
import { useAdminLeaveRecords } from "@/hooks/useAdminLeaveRecords";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { formatShortDate, parseISODateOnly, todayUTC } from "@/lib/date";
import { AdminLeaveRecord, LeaveDecisionStatus } from "@/types/domain";

const GRID_COLS = "grid-cols-[1.4fr_1fr_1fr_1.1fr_0.8fr_1fr_190px]";

const STATUS_STYLES: Record<LeaveDecisionStatus, string> = {
  pending: "bg-status-pending-bg text-status-pending-fg",
  approved: "bg-status-approved-bg text-status-approved-fg",
  rejected: "bg-status-rejected-bg text-status-rejected-fg",
  cancelled: "bg-status-cancelled-bg text-status-cancelled-fg",
};

type ReturnStatus = "Returned" | "Overdue" | "Upcoming";

const RETURN_STATUS_STYLES: Record<ReturnStatus, string> = {
  Returned: "bg-status-approved-bg text-status-approved-fg",
  Overdue: "bg-status-pending-bg text-status-pending-fg",
  Upcoming: "bg-status-cancelled-bg text-status-cancelled-fg",
};

/** Has the employee actually come back yet? Only meaningful for approved leave (not extensions/pending/rejected). */
function getReturnStatus(record: AdminLeaveRecord): ReturnStatus | null {
  if (record.kind !== "leave" || record.status !== "approved") return null;
  if (record.actualBackToWorkDate) return "Returned";
  if (!record.expectedBackToWorkDate) return null;
  return parseISODateOnly(record.expectedBackToWorkDate) < todayUTC() ? "Overdue" : "Upcoming";
}

export function LeaveManagementScreen() {
  const [department, setDepartment] = useState("");
  const [kind, setKind] = useState<"" | "leave" | "extension">("");
  const [status, setStatus] = useState<"" | LeaveDecisionStatus>("");
  const [modal, setModal] = useState<
    { type: "correct" | "backToWork"; record: AdminLeaveRecord } | null
  >(null);

  const filter = useMemo(
    () => ({
      department: department || undefined,
      kind: kind || undefined,
      status: status || undefined,
    }),
    [department, kind, status],
  );

  const { rows, isLoading, error, refresh } = useAdminLeaveRecords(filter);
  const { rows: directoryRows } = useEmployeeDirectory({});

  const departments = useMemo(
    () => [...new Set(directoryRows.map((r) => r.employee.department).filter((d): d is string => Boolean(d)))],
    [directoryRows],
  );

  function closeModal() {
    setModal(null);
  }
  function handleSaved() {
    closeModal();
    refresh();
  }

  return (
    <div className="flex w-full flex-col gap-[14px]">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="rounded-[8px] border border-line bg-card px-3 py-[7px] text-[12.5px] text-[#4E5359]"
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as typeof kind)}
          className="rounded-[8px] border border-line bg-card px-3 py-[7px] text-[12.5px] text-[#4E5359]"
        >
          <option value="">All types</option>
          <option value="leave">Annual Leave</option>
          <option value="extension">Unpaid Extension</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="rounded-[8px] border border-line bg-card px-3 py-[7px] text-[12.5px] text-[#4E5359]"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-[14px] border border-line bg-card shadow-card">
        <div
          className={`grid min-w-[1140px] ${GRID_COLS} gap-[12px] border-b border-line bg-surface px-[20px] py-[9px] font-mono text-[9.5px] tracking-[0.07em] text-muted`}
        >
          <div>EMPLOYEE</div>
          <div>TYPE</div>
          <div>DATES</div>
          <div>BACK TO WORK</div>
          <div>DAYS</div>
          <div>DECISION</div>
          <div />
        </div>

        {isLoading ? (
          <LoadingState label="Loading leave records…" />
        ) : error ? (
          <div className="px-[20px] py-[24px] text-center text-[12.5px] text-status-rejected-fg">{error}</div>
        ) : rows.length === 0 ? (
          <div className="px-[20px] py-[24px] text-center text-[12.5px] text-muted">
            No records match these filters.
          </div>
        ) : (
          rows.map((record) => {
            const returnStatus = getReturnStatus(record);
            return (
            <div
              key={`${record.kind}-${record.id}`}
              className={`grid min-w-[1140px] ${GRID_COLS} items-center gap-[12px] border-b border-[#EFF0F2] px-[20px] py-[12px] transition-colors hover:bg-[#F9FAFB]`}
            >
              <div className="min-w-0">
                <div className="truncate text-[12.5px] font-medium">{record.employeeName}</div>
                <div className="text-[10.5px] text-muted">{record.department ?? "—"}</div>
              </div>
              <div className="text-[12.5px]">{record.type}</div>
              <div className="font-mono text-[11px] text-[#4E5359]">
                {formatShortDate(record.startDate)} – {formatShortDate(record.endDate)}
              </div>
              <div className="flex flex-col gap-[4px]">
                <div className="font-mono text-[11px] text-[#4E5359]">
                  {record.actualBackToWorkDate
                    ? formatShortDate(record.actualBackToWorkDate)
                    : record.expectedBackToWorkDate
                      ? `Expected ${formatShortDate(record.expectedBackToWorkDate)}`
                      : "—"}
                </div>
                {returnStatus ? (
                  <span
                    className={`inline-flex w-fit rounded-full px-[7px] py-[1px] text-[10px] font-medium ${RETURN_STATUS_STYLES[returnStatus]}`}
                  >
                    {returnStatus}
                  </span>
                ) : null}
              </div>
              <div className="text-[13px] font-semibold tabular-nums">{record.numberOfDays}</div>
              <div>
                <span
                  className={`rounded-full px-[9px] py-[3px] text-[11px] font-medium ${STATUS_STYLES[record.status]}`}
                >
                  {record.status[0].toUpperCase() + record.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-end gap-[6px]">
                {record.kind === "leave" && record.status === "approved" ? (
                  <button
                    onClick={() => setModal({ type: "backToWork", record })}
                    className="rounded-[7px] border border-line bg-card px-[10px] py-[5px] text-[11.5px] font-medium text-[#4E5359] transition-colors hover:border-line-hover hover:bg-surface"
                  >
                    {record.actualBackToWorkDate ? "Edit BTW" : "Record BTW"}
                  </button>
                ) : null}
                <button
                  onClick={() => setModal({ type: "correct", record })}
                  className="rounded-[7px] border border-line bg-card px-[10px] py-[5px] text-[11.5px] font-medium text-[#4E5359] transition-colors hover:border-line-hover hover:bg-surface"
                >
                  Correct
                </button>
              </div>
            </div>
            );
          })
        )}

        <div className="flex items-center justify-between px-[20px] py-[12px] text-[12px] text-muted">
          <div>Corrections and back-to-work dates are recorded in the audit history.</div>
          <div className="font-mono text-[11px]">
            {rows.length} RECORD{rows.length === 1 ? "" : "S"}
          </div>
        </div>
      </div>

      {modal?.type === "correct" ? (
        <CorrectRecordModal record={modal.record} onClose={closeModal} onSaved={handleSaved} />
      ) : null}
      {modal?.type === "backToWork" ? (
        <RecordBackToWorkModal record={modal.record} onClose={closeModal} onSaved={handleSaved} />
      ) : null}
    </div>
  );
}
