"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { BalanceAfterCard } from "@/components/apply/BalanceAfterCard";
import { CheckList } from "@/components/apply/CheckList";
import { TeamOverlapCard } from "@/components/apply/TeamOverlapCard";
import { Button } from "@/components/ui/Button";
import { useLeaveTypes } from "@/hooks/useLeaveTypes";
import { apiRequest, uploadAttachment, ApiClientError } from "@/lib/api";
import { ApplyPrecheckResult } from "@/types/domain";

const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;

const PRESETS = [
  { label: "3 days", days: 3 },
  { label: "1 week", days: 7 },
  { label: "2 weeks", days: 14 },
];

function toInputDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function presetRange(days: number): { start: string; end: string } {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  const end = new Date(start);
  end.setDate(end.getDate() + days - 1);
  return { start: toInputDate(start), end: toInputDate(end) };
}

/** Leave must start at least a day out — mirrors the backend's own cutoff. */
function tomorrowInputDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toInputDate(d);
}

export function ApplyForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);
  const { types: leaveTypes } = useLeaveTypes();
  const selectableTypes = leaveTypes.filter((t) => t.isActive && !t.isChildType);

  const [leaveTypeId, setLeaveTypeId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  useEffect(() => {
    if (leaveTypeId !== null || selectableTypes.length === 0) return;
    const annual = selectableTypes.find((t) => t.code === "annual");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLeaveTypeId((annual ?? selectableTypes[0]).id);
  }, [selectableTypes, leaveTypeId]);

  const [precheck, setPrecheck] = useState<ApplyPrecheckResult | null>(null);
  const [isCalcing, setIsCalcing] = useState(false);
  const [precheckError, setPrecheckError] = useState<string | null>(null);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasDateRange = Boolean(startDate && endDate);
  const effectiveIsCalcing = hasDateRange && isCalcing;
  const effectivePrecheck = hasDateRange ? precheck : null;
  const effectivePrecheckError = hasDateRange ? precheckError : null;

  useEffect(() => {
    if (!hasDateRange || leaveTypeId === null) return;

    // Standard fetch-in-effect loading pattern, not derivable from props.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsCalcing(true);
    setPrecheckError(null);

    const timer = setTimeout(() => {
      const requestId = ++requestIdRef.current;
      apiRequest<ApplyPrecheckResult>("/leave-requests/precheck", {
        method: "POST",
        body: { startDate, endDate, leaveTypeId },
      })
        .then((result) => {
          if (requestIdRef.current === requestId) setPrecheck(result);
        })
        .catch((err) => {
          if (requestIdRef.current !== requestId) return;
          setPrecheck(null);
          setPrecheckError(err instanceof ApiClientError ? err.message : "Couldn't check these dates.");
        })
        .finally(() => {
          if (requestIdRef.current === requestId) setIsCalcing(false);
        });
    }, 400);

    return () => clearTimeout(timer);
  }, [startDate, endDate, hasDateRange, leaveTypeId]);

  function applyPreset(days: number) {
    const range = presetRange(days);
    setStartDate(range.start);
    setEndDate(range.end);
  }

  function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (file && file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      setAttachmentError("File is too large — the limit is 5 MB.");
      setAttachmentFile(null);
      event.target.value = "";
      return;
    }
    setAttachmentError(null);
    setAttachmentFile(file);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    if (!effectivePrecheck || !effectivePrecheck.canSubmit) {
      setSubmitError("Fix the checks above before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      let attachmentName: string | null = null;
      let attachmentUrl: string | null = null;
      if (attachmentFile) {
        const uploaded = await uploadAttachment(attachmentFile);
        attachmentName = uploaded.name;
        attachmentUrl = uploaded.url;
      }
      await apiRequest("/leave-requests", {
        method: "POST",
        body: { startDate, endDate, reason: reason.trim() || null, attachmentName, attachmentUrl, leaveTypeId },
      });
      router.push("/dashboard");
    } catch (err) {
      setSubmitError(
        err instanceof ApiClientError ? err.message : "Something went wrong submitting your request.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid w-full items-start gap-[20px] lg:grid-cols-[1.5fr_1fr]">
      <div className="overflow-hidden rounded-[14px] border border-line bg-card shadow-float">
        <div className="border-b border-line px-[24px] py-[20px] pb-[16px]">
          <div className="text-[16px] font-semibold tracking-[-0.015em]">Apply for annual leave</div>
          <div className="mt-[3px] text-[12.5px] text-muted">
            Goes to your manager for approval. You can cancel it any time before they decide.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[18px] px-[24px] py-[20px] pb-[24px]">
          <div>
            <div className="mb-[6px] text-[12.5px] font-medium">Leave type</div>
            <select
              value={leaveTypeId ?? ""}
              onChange={(e) => setLeaveTypeId(Number(e.target.value))}
              className="w-full rounded-[9px] border border-line bg-card px-3 py-[9px] text-[13.5px] transition-colors hover:border-line-hover"
            >
              {selectableTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 items-end gap-[14px] sm:grid-cols-[1fr_1fr_118px]">
            <div>
              <div className="mb-[6px] text-[12.5px] font-medium">Start date</div>
              <input
                type="date"
                value={startDate}
                min={tomorrowInputDate()}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-[9px] border border-line bg-card px-3 py-[9px] font-mono text-[13.5px] transition-colors hover:border-line-hover"
              />
            </div>
            <div>
              <div className="mb-[6px] text-[12.5px] font-medium">End date</div>
              <input
                type="date"
                value={endDate}
                min={startDate || tomorrowInputDate()}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-[9px] border border-line bg-card px-3 py-[9px] font-mono text-[13.5px] transition-colors hover:border-line-hover"
              />
            </div>
            <div className="col-span-2 w-full rounded-[9px] border border-line bg-surface px-3 py-2 sm:col-span-1 sm:w-[118px]">
              <div className="font-mono text-[9px] tracking-[0.07em] text-muted">DAYS</div>
              {effectiveIsCalcing ? (
                <div className="animate-mz-shimmer mt-[3px] h-[26px] w-[52px] rounded-[6px] bg-gradient-to-r from-line via-surface to-line" />
              ) : (
                <div className="animate-mz-in mt-[3px] text-[23px] font-semibold leading-[1.15] tabular-nums">
                  {effectivePrecheck?.days ?? "–"}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset.days)}
                className="rounded-full border border-line bg-card px-[11px] py-[5px] text-[12px] text-[#4E5359] transition-colors hover:border-accent hover:bg-accent-tint hover:text-accent"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {effectivePrecheckError ? (
            <div className="rounded-[10px] border border-status-rejected-fg/25 bg-status-rejected-bg/40 px-[13px] py-[10px] text-[12.5px] text-status-rejected-fg">
              {effectivePrecheckError}
            </div>
          ) : null}

          {effectivePrecheck && !effectiveIsCalcing ? <CheckList checks={effectivePrecheck.checks} /> : null}

          <div>
            <div className="mb-[6px] flex items-baseline justify-between">
              <div className="text-[12.5px] font-medium">Reason / remarks</div>
              <div className="text-[11px] text-muted-2">Optional · visible to your manager and HR</div>
            </div>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Family visit to Muscat. Handover notes shared with Omar."
              className="w-full resize-y rounded-[9px] border border-line px-3 py-[10px] text-[13px] leading-relaxed transition-colors hover:border-line-hover"
            />
          </div>

          <div>
            <div className="mb-[6px] text-[12.5px] font-medium">Attachment</div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleAttachmentChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center gap-3 rounded-[10px] border border-dashed border-[#C9CDD2] bg-[#FAFBFB] px-[15px] py-[13px] text-left transition-colors hover:border-accent hover:bg-accent-tint"
            >
              <div className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[8px] border border-line bg-card text-[14px] text-muted">
                ↑
              </div>
              <div className="flex-1">
                <div className="text-[12.5px] font-medium">
                  {attachmentFile?.name ?? "Drop a file or browse"}
                </div>
                <div className="text-[11.5px] text-muted">
                  PDF, JPG or PNG · up to 5 MB · e.g. flight confirmation
                </div>
              </div>
            </button>
            {attachmentError ? (
              <div className="mt-[6px] text-[12px] text-status-rejected-fg">{attachmentError}</div>
            ) : null}
          </div>

          {submitError ? (
            <div className="rounded-[10px] border border-status-rejected-fg/25 bg-status-rejected-bg/40 px-[13px] py-[10px] text-[12.5px] text-status-rejected-fg">
              {submitError}
            </div>
          ) : null}

          <div className="mt-[2px] flex items-center gap-[10px] border-t border-line pt-[18px]">
            <Button type="submit" variant="primary" disabled={isSubmitting || !effectivePrecheck?.canSubmit}>
              {isSubmitting ? (attachmentFile ? "Uploading & submitting…" : "Submitting…") : "Submit request"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.push("/dashboard")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>

      <div className="flex flex-col gap-[16px]">
        <BalanceAfterCard projection={effectivePrecheck?.balanceAfter ?? null} />
        {effectivePrecheck ? <TeamOverlapCard entries={effectivePrecheck.teamOverlap} /> : null}
      </div>
    </div>
  );
}
