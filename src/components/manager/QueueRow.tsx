import { getLeaveTypeStyle } from "@/lib/leaveTypeStyles";
import { QueueItem } from "@/types/domain";

const DECISION_PILL: Record<"approved" | "rejected", string> = {
  approved: "bg-status-approved-bg text-status-approved-fg",
  rejected: "bg-status-rejected-bg text-status-rejected-fg",
};

interface QueueRowProps {
  item: QueueItem;
  expanded: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onReject: () => void;
  onUndo: () => void;
}

export function QueueRow({ item, expanded, onToggle, onApprove, onReject, onUndo }: QueueRowProps) {
  const decided = item.status !== "pending";

  return (
    <div className="overflow-hidden rounded-[13px] border border-line bg-card shadow-card transition-shadow hover:shadow-[0_2px_4px_rgba(14,15,17,0.07),0_14px_32px_-26px_rgba(14,15,17,0.5)]">
      <div
        onClick={onToggle}
        className="grid grid-cols-1 items-center gap-3 px-[18px] py-[14px] md:grid-cols-[1.6fr_1.3fr_0.6fr_0.9fr_1fr] cursor-pointer"
      >
        <div className="flex min-w-0 items-center gap-[11px]">
          <div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full bg-surface text-[12px] font-semibold text-[#4E5359]">
            {item.initials}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-semibold">{item.name}</div>
            <div className="text-[11.5px] text-muted">{item.roleLine}</div>
          </div>
        </div>

        <div>
          <span
            className={`rounded-[6px] px-2 py-[2px] text-[11px] font-semibold ${getLeaveTypeStyle(item.leaveTypeId).chip}`}
          >
            {item.leaveTypeName}
          </span>
          <div className="mt-1 font-mono text-[11.5px] text-[#4E5359]">{item.dates}</div>
        </div>

        <div>
          <div className="text-[18px] font-semibold tabular-nums">{item.days}</div>
          <div className="text-[11px] text-muted">days</div>
        </div>

        <div>
          <div
            className={`text-[12.5px] font-semibold ${item.balanceIsNegative ? "text-status-rejected-fg" : ""}`}
          >
            {item.balanceAfterLabel}
          </div>
          <div className="text-[11px] text-muted">balance after</div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-self-end">
          {!decided ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReject();
                }}
                className="rounded-[8px] border border-line bg-card px-[14px] py-2 text-[12.5px] font-semibold text-[#4E5359] transition-colors hover:border-[#F2B8B5] hover:bg-[#FEF2F2] hover:text-status-rejected-fg"
              >
                Reject
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove();
                }}
                className="rounded-[8px] border-0 bg-primary px-4 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-black active:translate-y-px"
              >
                Approve
              </button>
            </>
          ) : (
            <>
              <span
                className={`rounded-full px-3 py-[5px] text-[11.5px] font-semibold ${DECISION_PILL[item.status as "approved" | "rejected"]}`}
              >
                {item.status === "approved" ? "Approved" : "Rejected"}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUndo();
                }}
                className="text-[12px] font-semibold text-accent"
              >
                Undo
              </button>
            </>
          )}
        </div>
      </div>

      {expanded ? (
        <div className="grid grid-cols-1 gap-[22px] border-t border-[#EFF0F2] bg-[#FAFBFB] px-[18px] py-[16px] md:grid-cols-3">
          <div>
            <div className="mb-[6px] font-mono text-[9.5px] tracking-[0.07em] text-muted">
              REASON
            </div>
            <div className="text-[13px] leading-[1.55] text-[#2A2E33]">{item.reason}</div>
            {item.attachment ? (
              item.attachmentUrl ? (
                <a
                  href={item.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-[11px] inline-flex items-center gap-2 rounded-[8px] border border-line bg-card px-[11px] py-[6px] text-[12px] text-accent transition-colors hover:border-accent hover:bg-accent-tint"
                >
                  <span className="font-mono text-[10px] text-muted">FILE</span>
                  {item.attachment}
                  <span className="text-[11px]">View →</span>
                </a>
              ) : (
                <div className="mt-[11px] inline-flex items-center gap-2 rounded-[8px] border border-line bg-card px-[11px] py-[6px] text-[12px]">
                  <span className="font-mono text-[10px] text-muted">FILE</span>
                  {item.attachment}
                  <span className="text-[11px] text-muted-2">(uploaded before file storage was added)</span>
                </div>
              )
            ) : null}
          </div>
          <div>
            <div className="mb-[6px] font-mono text-[9.5px] tracking-[0.07em] text-muted">
              CURRENT BALANCE
            </div>
            <div className="flex h-[10px] overflow-hidden rounded-[5px] bg-line">
              <div className="bg-primary" style={{ width: `${item.balUsedPct}%` }} />
              <div
                className="border-l-2 border-[#FAFBFB]"
                style={{
                  width: `${item.balPendingPct}%`,
                  background: "repeating-linear-gradient(135deg, #0B96AF 0 3px, #EAF6F9 3px 7px)",
                }}
              />
            </div>
            <div className="mt-2 text-[12.5px] leading-relaxed text-[#4E5359]">
              {item.balanceDetail}
            </div>
          </div>
          <div>
            <div className="mb-[6px] font-mono text-[9.5px] tracking-[0.07em] text-muted">
              COVER &amp; OVERLAP
            </div>
            <div className="text-[13px] leading-[1.55] text-[#2A2E33]">{item.cover}</div>
            <div className="mt-2 text-[12px] text-muted">
              Back to work <b className="text-ink">{item.backToWork}</b>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
