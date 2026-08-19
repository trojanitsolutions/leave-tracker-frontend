"use client";

import { FormEvent, useState } from "react";
import { apiRequest, ApiClientError } from "@/lib/api";
import { AdminLeaveRecord } from "@/types/domain";

interface RecordBackToWorkModalProps {
  record: AdminLeaveRecord;
  onClose: () => void;
  onSaved: () => void;
}

export function RecordBackToWorkModal({ record, onClose, onSaved }: RecordBackToWorkModalProps) {
  const [actualBackToWorkDate, setActualBackToWorkDate] = useState(
    record.actualBackToWorkDate ?? record.endDate,
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(record.actualBackToWorkDate);

  async function save(dateValue: string | null) {
    setError(null);
    setIsSubmitting(true);
    try {
      await apiRequest(`/admin/leave-records/${record.id}/back-to-work`, {
        method: "POST",
        body: { actualBackToWorkDate: dateValue },
      });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't record the back-to-work date.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await save(actualBackToWorkDate);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(14,15,17,0.42)] p-8"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] overflow-auto rounded-[16px] border border-line bg-card shadow-[0_24px_64px_-24px_rgba(14,15,17,0.45)]"
      >
        <div className="border-b border-line px-[24px] py-[20px] pb-[16px]">
          <div className="text-[17px] font-semibold tracking-[-0.02em]">
            {isEditing ? "Edit back-to-work date" : "Record back-to-work date"}
          </div>
          <div className="mt-[3px] text-[12.5px] text-muted">
            {record.employeeName} — expected {record.expectedBackToWorkDate ?? "—"}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-[24px] py-[20px]">
            <div className="mb-[6px] text-[12px] font-medium">Actual back-to-work date</div>
            <input
              required
              type="date"
              value={actualBackToWorkDate}
              onChange={(e) => setActualBackToWorkDate(e.target.value)}
              className="w-full rounded-[9px] border border-line px-3 py-[9px] font-mono text-[13px] transition-colors hover:border-line-hover"
            />
            <div className="mt-[10px] text-[11.5px] leading-relaxed text-muted">
              {isEditing
                ? "You can update this if the wrong date was recorded — e.g. the employee actually requested an unpaid extension instead of returning."
                : "This is stored permanently in the employee's leave history and generates their next leave cycle."}
            </div>
          </div>

          {error ? (
            <div className="mx-[24px] mb-[16px] rounded-[10px] border border-status-rejected-fg/25 bg-status-rejected-bg/40 px-[13px] py-[10px] text-[12.5px] text-status-rejected-fg">
              {error}
            </div>
          ) : null}

          <div className="flex items-center gap-[10px] rounded-b-[16px] border-t border-line bg-surface px-[24px] py-[14px]">
            {isEditing ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => save(null)}
                className="text-[12px] font-medium text-status-rejected-fg hover:underline disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear (not yet returned)
              </button>
            ) : null}
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
                {isSubmitting ? "Saving…" : isEditing ? "Save changes" : "Record"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
