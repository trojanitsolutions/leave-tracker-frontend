"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { CheckList } from "@/components/apply/CheckList";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { useEmployeeOverview } from "@/hooks/useEmployeeOverview";
import { useLeaveHistory } from "@/hooks/useLeaveHistory";
import { apiRequest, ApiClientError } from "@/lib/api";
import { formatRangeLabelUpper, formatShortDate, parseISODateOnly, todayUTC } from "@/lib/date";
import { ExtensionPrecheckResult, LeaveDecisionStatus } from "@/types/domain";

const EXTENSION_STATUS_PILL: Record<LeaveDecisionStatus, string> = {
  pending: "bg-status-pending-bg text-status-pending-fg",
  approved: "bg-status-approved-bg text-status-approved-fg",
  rejected: "bg-status-rejected-bg text-status-rejected-fg",
  cancelled: "bg-status-cancelled-bg text-status-cancelled-fg",
};

function toInputDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Day after the given ISO date — used for the *original* leave's own back-to-work date, which must
 * stay fixed to the leave's own end date even after an extension shifts the employee's effective
 * back-to-work date (that mutation lives on the leave record itself, so we recompute here instead). */
function nextDayISO(iso: string): string {
  const d = parseISODateOnly(iso);
  d.setUTCDate(d.getUTCDate() + 1);
  return toInputDate(d);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${Math.round(bytes / 1024)} KB`;
}

export function ApplyExtensionForm() {
  const router = useRouter();
  const { employee } = useAuth();
  const { overview, isLoading: isOverviewLoading } = useEmployeeOverview(Boolean(employee));
  const { entries: history, isLoading: isHistoryLoading } = useLeaveHistory(Boolean(employee));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);
  const prefillDone = useRef(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [attachment, setAttachment] = useState<{ name: string; size: number } | null>(null);

  const [precheck, setPrecheck] = useState<ExtensionPrecheckResult | null>(null);
  const [isCalcing, setIsCalcing] = useState(false);
  const [precheckError, setPrecheckError] = useState<string | null>(null);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentLeave = overview?.currentLeave ?? null;
  const linkedExtensions = currentLeave
    ? history.filter((e) => e.kind === "extension" && e.parentLeaveRequestId === currentLeave.id)
    : [];
  const pendingExtension = linkedExtensions.find((e) => e.status === "pending") ?? null;
  const approvedExtensions = linkedExtensions
    .filter((e) => e.status === "approved")
    .sort((a, b) => b.endDate.localeCompare(a.endDate));
  const latestApprovedExtension = approvedExtensions[0] ?? null;
  // What the comparison card's right panel shows — the pending one if there's a decision still
  // outstanding, otherwise the most recent approved one so the panel always reflects reality
  // instead of jumping straight to a blank draft the moment the last one is decided.
  const displayExtension = pendingExtension ?? latestApprovedExtension;
  // Approved extensions not already visible in the panel above (the latest approved one is shown
  // there directly when there's no pending request; a pending one takes that slot instead).
  const priorApprovedCount = pendingExtension ? approvedExtensions.length : approvedExtensions.length - 1;
  // Where the next extension must pick up — the latest approved extension's end if the employee
  // has already chained one onto this leave, otherwise the original leave's own end date.
  const anchorEndDate = latestApprovedExtension ? latestApprovedExtension.endDate : currentLeave?.endDate;

  useEffect(() => {
    if (prefillDone.current || isHistoryLoading || !currentLeave || !anchorEndDate) return;
    prefillDone.current = true;
    const start = parseISODateOnly(anchorEndDate);
    start.setUTCDate(start.getUTCDate() + 1);
    // Only the (fixed, readonly) start date is prefilled — end date starts empty so the
    // comparison card doesn't imply a specific extension before the employee has chosen one.
    setStartDate(toInputDate(start));
  }, [currentLeave, anchorEndDate, isHistoryLoading]);

  const hasDateRange = Boolean(startDate && endDate);
  const effectiveIsCalcing = hasDateRange && isCalcing;
  const effectivePrecheck = hasDateRange ? precheck : null;
  const effectivePrecheckError = hasDateRange ? precheckError : null;

  useEffect(() => {
    if (!hasDateRange) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsCalcing(true);
    setPrecheckError(null);

    const timer = setTimeout(() => {
      const requestId = ++requestIdRef.current;
      apiRequest<ExtensionPrecheckResult>("/extensions/precheck", {
        method: "POST",
        body: { startDate, endDate },
      })
        .then((result) => {
          if (requestIdRef.current === requestId) setPrecheck(result);
        })
        .catch((err) => {
          if (requestIdRef.current !== requestId) return;
          setPrecheck(null);
          setPrecheckError(
            err instanceof ApiClientError ? err.message : "Couldn't check these dates.",
          );
        })
        .finally(() => {
          if (requestIdRef.current === requestId) setIsCalcing(false);
        });
    }, 400);

    return () => clearTimeout(timer);
  }, [startDate, endDate, hasDateRange]);

  function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setAttachment(file ? { name: file.name, size: file.size } : null);
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
      await apiRequest("/extensions", {
        method: "POST",
        body: { startDate, endDate, reason: reason.trim() || null, attachmentName: attachment?.name ?? null },
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

  if (isOverviewLoading || overview === null) {
    return <LoadingState label="Loading your leave details…" />;
  }

  const notOnLeave = !currentLeave;

  if (notOnLeave) {
    return (
      <div className="rounded-[13px] border border-dashed border-[#C9CDD2] bg-card px-6 py-[52px] text-center">
        <div className="text-[15px] font-semibold">You&rsquo;re not currently on leave</div>
        <div className="mx-auto mt-[8px] max-w-[360px] text-[13px] leading-relaxed text-muted">
          Extensions are only available while you&rsquo;re on approved annual leave.
        </div>
      </div>
    );
  }

  const totalDays = currentLeave?.numberOfDays ?? 0;
  const elapsedDays = currentLeave
    ? Math.min(
        totalDays,
        Math.max(
          0,
          Math.round(
            (todayUTC().getTime() - parseISODateOnly(currentLeave.startDate).getTime()) /
              (24 * 60 * 60 * 1000),
          ),
        ),
      )
    : 0;

  return (
    <div className="flex w-full flex-col gap-[16px]">
      <div className="flex items-start gap-[12px] rounded-[12px] border border-[#DCD3F2] bg-[#F3F0FA] px-[18px] py-[14px]">
        <div className="mt-[1px] flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full bg-[#7C5CD6] text-[11px] font-bold text-white">
          !
        </div>
        <div>
          <div className="text-[13px] font-semibold text-[#4A2E8F]">
            This extension will be recorded as unpaid leave
          </div>
          <div className="mt-[3px] text-[12.5px] leading-relaxed text-[#5B3FA8]">
            These days are unpaid and are not deducted from your annual balance. They&rsquo;re tracked as a
            separate record linked to your current leave — your original leave is never changed.
          </div>
        </div>
      </div>

      {currentLeave ? (
        <div className="grid overflow-hidden rounded-[14px] border border-line bg-card shadow-card sm:grid-cols-2">
          <div className="border-b border-line px-[22px] py-[20px] sm:border-b-0 sm:border-r">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[9.5px] tracking-[0.08em] text-muted">
                ORIGINAL LEAVE · REQ-{currentLeave.id}
              </div>
              <span className="rounded-full bg-status-approved-bg px-[10px] py-[3px] text-[11px] font-semibold text-status-approved-fg">
                Approved
              </span>
            </div>
            <div className="mt-[12px] text-[15px] font-semibold">Annual Leave</div>
            <div className="mt-[5px] font-mono text-[12.5px] text-[#4E5359]">
              {formatRangeLabelUpper(currentLeave.startDate, currentLeave.endDate)}
            </div>
            <div className="mt-[16px] flex gap-[26px]">
              <div>
                <div className="text-[22px] font-semibold tabular-nums">{totalDays}</div>
                <div className="text-[11.5px] text-muted">days, paid</div>
              </div>
              <div>
                <div className="text-[22px] font-semibold tabular-nums">{elapsedDays}</div>
                <div className="text-[11.5px] text-muted">days elapsed</div>
              </div>
            </div>
            <div className="mt-[16px] border-t border-line pt-[14px] text-[12px] text-muted">
              Original back to work{" "}
              <b className="text-ink">{formatShortDate(nextDayISO(currentLeave.endDate))}</b>
            </div>
          </div>

          <div className="relative bg-[#FBFAFE] px-[22px] py-[20px]">
            <div className="absolute top-[20px] -left-[9px] hidden h-[18px] w-[18px] items-center justify-center rounded-full bg-[#7C5CD6] text-[11px] font-bold text-white sm:flex">
              ↳
            </div>
            {displayExtension ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[9.5px] tracking-[0.08em] text-[#5B3FA8]">
                    EXTENSION · REQ-{displayExtension.id}
                  </div>
                  <span
                    className={`rounded-full px-[10px] py-[3px] text-[11px] font-semibold ${EXTENSION_STATUS_PILL[displayExtension.status]}`}
                  >
                    {displayExtension.status[0].toUpperCase() + displayExtension.status.slice(1)}
                  </span>
                </div>
                <div className="mt-[12px] text-[15px] font-semibold text-[#4A2E8F]">Unpaid Extension</div>
                <div className="mt-[5px] font-mono text-[12.5px] text-[#5B3FA8]">
                  {formatRangeLabelUpper(displayExtension.startDate, displayExtension.endDate)}
                </div>
                <div className="mt-[16px] flex gap-[26px]">
                  <div>
                    <div className="text-[22px] font-semibold tabular-nums text-[#4A2E8F]">
                      {displayExtension.numberOfDays}
                    </div>
                    <div className="text-[11.5px] text-muted">days, unpaid</div>
                  </div>
                  <div>
                    <div className="text-[22px] font-semibold tabular-nums text-[#4A2E8F]">0</div>
                    <div className="text-[11.5px] text-muted">deducted from balance</div>
                  </div>
                </div>
                <div className="mt-[16px] border-t border-[#E9E4F7] pt-[14px] text-[12px] text-muted">
                  {displayExtension.status === "approved" ? "New" : "Expected"} back to work{" "}
                  <b className="text-ink">{formatShortDate(displayExtension.backToWorkDate)}</b>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[9.5px] tracking-[0.08em] text-[#5B3FA8]">
                    EXTENSION · NEW RECORD
                  </div>
                  <span className="rounded-full bg-[#F3F0FA] px-[10px] py-[3px] text-[11px] font-semibold text-[#5B3FA8]">
                    Unpaid
                  </span>
                </div>
                <div className="mt-[12px] text-[15px] font-semibold text-[#4A2E8F]">Unpaid Extension</div>
                <div className="mt-[5px] font-mono text-[12.5px] text-[#5B3FA8]">
                  {hasDateRange ? formatRangeLabelUpper(startDate, endDate) : "—"}
                </div>
                <div className="mt-[16px] flex gap-[26px]">
                  <div>
                    <div className="text-[22px] font-semibold tabular-nums text-[#4A2E8F]">
                      {effectivePrecheck?.days ?? 0}
                    </div>
                    <div className="text-[11.5px] text-muted">days, unpaid</div>
                  </div>
                  <div>
                    <div className="text-[22px] font-semibold tabular-nums text-[#4A2E8F]">0</div>
                    <div className="text-[11.5px] text-muted">deducted from balance</div>
                  </div>
                </div>
                <div className="mt-[16px] border-t border-[#E9E4F7] pt-[14px] text-[12px] text-muted">
                  New back to work{" "}
                  <b className="text-ink">
                    {effectivePrecheck?.newBackToWorkDate
                      ? formatShortDate(effectivePrecheck.newBackToWorkDate)
                      : "—"}
                  </b>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {priorApprovedCount > 0 ? (
        <div className="rounded-[12px] border border-line bg-surface px-[16px] py-[11px] text-[12px] leading-relaxed text-[#4E5359]">
          You&rsquo;ve extended this leave {approvedExtensions.length}{" "}
          time{approvedExtensions.length === 1 ? "" : "s"} in total — {priorApprovedCount} earlier one
          {priorApprovedCount === 1 ? "" : "s"} approved besides the one shown above.
        </div>
      ) : null}

      {pendingExtension ? (
        <div className="rounded-[14px] border border-line bg-card px-[22px] py-[20px] text-[12.5px] leading-relaxed text-[#4E5359] shadow-card">
          You already have a pending unpaid extension linked to this leave — wait for it to be decided
          before requesting another. Check{" "}
          <button
            type="button"
            onClick={() => router.push("/history")}
            className="font-semibold text-primary hover:underline"
          >
            your leave history
          </button>{" "}
          for details.
        </div>
      ) : (
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-[18px] rounded-[14px] border border-line bg-card px-[22px] py-[20px] shadow-card"
      >
        <div className="flex flex-col gap-[6px]">
          <div className="grid grid-cols-1 items-start gap-[14px] sm:grid-cols-[1fr_1fr_118px]">
            <div>
              <div className="mb-[6px] text-[12.5px] font-medium">Extension start date</div>
              <input
                readOnly
                type="date"
                value={startDate}
                className="w-full rounded-[9px] border border-line bg-surface px-3 py-[9px] font-mono text-[13.5px] text-[#4E5359]"
              />
            </div>
            <div>
              <div className="mb-[6px] text-[12.5px] font-medium">Extension end date</div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-[9px] border border-line bg-card px-3 py-[9px] font-mono text-[13.5px] transition-colors hover:border-line-hover"
              />
            </div>
            <div className="rounded-[9px] border border-[#DCD3F2] bg-[#F3F0FA] px-3 py-2">
              <div className="font-mono text-[9px] tracking-[0.07em] text-[#5B3FA8]">UNPAID DAYS</div>
              <div className="text-[23px] font-semibold leading-[1.15] tabular-nums text-[#4A2E8F]">
                {effectivePrecheck?.days ?? 0}
              </div>
            </div>
          </div>
          <div className="text-[11px] text-muted">
            Fixed to the day after your current leave ends. No gap is allowed.
          </div>
        </div>

        {effectivePrecheckError ? (
          <div className="rounded-[10px] border border-status-rejected-fg/25 bg-status-rejected-bg/40 px-[13px] py-[10px] text-[12.5px] text-status-rejected-fg">
            {effectivePrecheckError}
          </div>
        ) : null}

        {effectivePrecheck && !effectiveIsCalcing ? <CheckList checks={effectivePrecheck.checks} /> : null}

        <div>
          <div className="mb-[6px] text-[12.5px] font-medium">Reason for extension</div>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Flight rescheduled, need an extra week before returning."
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
          {attachment ? (
            <div className="inline-flex items-center gap-[10px] rounded-[9px] border border-line bg-card px-[13px] py-[9px] text-[12.5px]">
              <span className="rounded-[4px] bg-surface px-[5px] py-[2px] font-mono text-[10px] text-muted">
                {attachment.name.split(".").pop()?.toUpperCase() ?? "FILE"}
              </span>
              {attachment.name}
              <span className="text-[11.5px] text-muted">{formatFileSize(attachment.size)}</span>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                aria-label="Remove attachment"
                className="pl-[4px] text-[11.5px] text-muted-2 hover:text-ink"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center gap-3 rounded-[10px] border border-dashed border-[#C9CDD2] bg-[#FAFBFB] px-[15px] py-[13px] text-left transition-colors hover:border-accent hover:bg-accent-tint"
            >
              <div className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[8px] border border-line bg-card text-[14px] text-muted">
                ↑
              </div>
              <div className="flex-1">
                <div className="text-[12.5px] font-medium">Drop a file or browse</div>
                <div className="text-[11.5px] text-muted">PDF, JPG or PNG · up to 5 MB</div>
              </div>
            </button>
          )}
        </div>

        {submitError ? (
          <div className="rounded-[10px] border border-status-rejected-fg/25 bg-status-rejected-bg/40 px-[13px] py-[10px] text-[12.5px] text-status-rejected-fg">
            {submitError}
          </div>
        ) : null}

        <div className="flex items-center gap-[10px] border-t border-line pt-[18px]">
          <Button type="submit" variant="primary" disabled={isSubmitting || !effectivePrecheck?.canSubmit}>
            {isSubmitting ? "Submitting…" : "Submit extension request"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard")}>
            Cancel
          </Button>
          <div className="ml-auto text-[11.5px] text-muted">Your manager is notified when you submit</div>
        </div>
      </form>
      )}
    </div>
  );
}
