import { LeaveDecisionStatus } from "@/types/domain";

const STATUS_CLASSES: Record<LeaveDecisionStatus, string> = {
  pending: "bg-status-pending-bg text-status-pending-fg",
  approved: "bg-status-approved-bg text-status-approved-fg",
  rejected: "bg-status-rejected-bg text-status-rejected-fg",
  cancelled: "bg-status-cancelled-bg text-status-cancelled-fg",
};

const STATUS_LABELS: Record<LeaveDecisionStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export function StatusPill({ status }: { status: LeaveDecisionStatus }) {
  return (
    <span
      className={`rounded-full px-2.5 py-[3px] text-[11px] font-semibold whitespace-nowrap ${STATUS_CLASSES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
