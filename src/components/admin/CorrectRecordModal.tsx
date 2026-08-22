"use client";

import { FormEvent, useState } from "react";
import { apiRequest, ApiClientError } from "@/lib/api";
import { AdminLeaveRecord } from "@/types/domain";

interface CorrectRecordModalProps {
  record: AdminLeaveRecord;
  onClose: () => void;
  onSaved: () => void;
}

const showReturnToggle = (record: AdminLeaveRecord) => record.kind === "leave" && record.status === "approved";

export function CorrectRecordModal({ record, onClose, onSaved }: CorrectRecordModalProps) {
  const [startDate, setStartDate] = useState(record.startDate);
  const [endDate, setEndDate] = useState(record.endDate);
  const [reason, setReason] = useState(record.reason ?? "");
  const [isReturned, setIsReturned] = useState(Boolean(record.actualBackToWorkDate));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canToggleReturn = showReturnToggle(record);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await apiRequest(`/admin/leave-records/${record.id}`, {
        method: "PATCH",
        body: { startDate, endDate, reason: reason.trim() || null },
      });

      const wasReturned = Boolean(record.actualBackToWorkDate);
      if (canToggleReturn && isReturned !== wasReturned) {
        await apiRequest(`/admin/leave-records/${record.id}/back-to-work`, {
          method: "POST",
          body: { actualBackToWorkDate: isReturned ? record.actualBackToWorkDate ?? endDate : null },
        });
      }

      onSaved();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't save this correction.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(14,15,17,0.42)] p-8">
      <div className="w-full max-w-[480px] overflow-auto rounded-[16px] border border-line bg-card shadow-[0_24px_64px_-24px_rgba(14,15,17,0.45)]">
        <div className="flex items-start gap-4 border-b border-line px-[24px] py-[20px] pb-[16px]">
          <div>
            <div className="text-[17px] font-semibold tracking-[-0.02em]">Correct record</div>
            <div className="mt-[3px] text-[12.5px] text-muted">
              {record.employeeName} — {record.leaveTypeName}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-auto flex h-7 w-7 flex-none items-center justify-center rounded-[8px] text-[15px] text-muted transition-colors hover:bg-surface"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-[16px] px-[24px] py-[20px] sm:grid-cols-2">
            <div>
              <div className="mb-[6px] text-[12px] font-medium">Start date</div>
              <input
                required
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-[9px] border border-line px-3 py-[9px] font-mono text-[13px] transition-colors hover:border-line-hover"
              />
            </div>
            <div>
              <div className="mb-[6px] text-[12px] font-medium">End date</div>
              <input
                required
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-[9px] border border-line px-3 py-[9px] font-mono text-[13px] transition-colors hover:border-line-hover"
              />
            </div>
            <div className="sm:col-span-2">
              <div className="mb-[6px] text-[12px] font-medium">Reason</div>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-[9px] border border-line px-3 py-[9px] text-[13px] transition-colors hover:border-line-hover"
              />
            </div>

            {canToggleReturn ? (
              <div className="sm:col-span-2">
                <div className="mb-[6px] text-[12px] font-medium">Return status</div>
                <div className="inline-flex rounded-[9px] border border-line bg-surface p-[3px]">
                  <button
                    type="button"
                    onClick={() => setIsReturned(false)}
                    className={`rounded-[7px] px-[12px] py-[6px] text-[12px] font-medium transition-colors ${
                      !isReturned ? "bg-card shadow-sm" : "text-muted hover:text-ink"
                    }`}
                  >
                    Not returned
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsReturned(true)}
                    className={`rounded-[7px] px-[12px] py-[6px] text-[12px] font-medium transition-colors ${
                      isReturned
                        ? "bg-status-approved-bg text-status-approved-fg"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    Returned
                  </button>
                </div>
                <div className="mt-[6px] text-[11px] text-muted">
                  Recorded automatically once a back-to-work date is set — toggle here to correct it
                  manually{isReturned ? `, using ${endDate || "the leave's end date"} if no date is on file.` : "."}
                </div>
              </div>
            ) : null}
          </div>

          <div className="mx-[24px] mb-[16px] rounded-[10px] bg-surface px-[14px] py-[12px] text-[12px] leading-relaxed text-[#4E5359]">
            Corrections fix factual details only — dates and reason. Approving or rejecting a request is the
            assigned manager&rsquo;s decision, not something HR can override here.
          </div>

          {error ? (
            <div className="mx-[24px] mb-[16px] rounded-[10px] border border-status-rejected-fg/25 bg-status-rejected-bg/40 px-[13px] py-[10px] text-[12.5px] text-status-rejected-fg">
              {error}
            </div>
          ) : null}

          <div className="flex items-center gap-[10px] rounded-b-[16px] border-t border-line bg-surface px-[24px] py-[14px]">
            <div className="text-[11.5px] text-muted">Corrections are recorded in the audit history.</div>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-[8px] border border-line bg-card px-[14px] py-2 text-[12.5px] font-medium text-[#4E5359] transition-colors hover:bg-surface"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-[8px] border-0 bg-primary px-4 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting ? "Saving…" : "Save correction"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
