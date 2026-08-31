"use client";

import { useMemo, useState } from "react";
import { QueueRow } from "@/components/manager/QueueRow";
import { LoadingState } from "@/components/ui/Spinner";
import { useLeaveTypes } from "@/hooks/useLeaveTypes";
import { apiRequest, ApiClientError } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { formatRangeLabelUpper } from "@/lib/date";
import { LeaveTypeSummary, ManagerQueueItemRecord, QueueDecisionStatus, QueueItem } from "@/types/domain";

function compositeKey(record: ManagerQueueItemRecord): string {
  return `${record.kind}-${record.id}`;
}

function mapToQueueItem(
  record: ManagerQueueItemRecord,
  status: QueueDecisionStatus,
  leaveTypesById: Map<number, LeaveTypeSummary>,
): QueueItem {
  const initials = record.employeeName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
  const { entitlement, used, pending, remaining } = record.balance;
  const usedPct = entitlement ? (used / entitlement) * 100 : 0;
  const pendingPct = entitlement ? (pending / entitlement) * 100 : 0;
  const cover =
    record.teamOverlap.length === 0
      ? "No one else on the team is out during this window."
      : record.teamOverlap.map((entry) => `${entry.name} (${entry.dates})`).join("; ");
  // Unpaid types (today: Unpaid Extension, but any future standalone unpaid type too) never
  // touch a balance — everything else shows the real remaining count for its own pool.
  const isPaidType = leaveTypesById.get(record.leaveTypeId)?.isPaid ?? true;

  return {
    id: compositeKey(record),
    initials,
    name: record.employeeName,
    roleLine: record.department ?? "—",
    leaveTypeId: record.leaveTypeId,
    leaveTypeName: record.leaveTypeName,
    dates: formatRangeLabelUpper(record.startDate, record.endDate),
    days: record.numberOfDays,
    balanceAfterLabel: isPaidType ? `${remaining} remaining` : "unaffected (unpaid)",
    balanceIsNegative: isPaidType && remaining < 0,
    reason: record.reason ?? "No reason given.",
    attachment: record.attachmentName ?? undefined,
    attachmentUrl: record.attachmentUrl ?? undefined,
    cover,
    backToWork: record.backToWorkDate,
    balUsedPct: usedPct,
    balPendingPct: pendingPct,
    balanceDetail: `${used} used, ${pending} pending — ${remaining} left of ${entitlement} entitlement.`,
    status,
  };
}

interface RealQueueListProps {
  queue: ManagerQueueItemRecord[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function RealQueueList({ queue, isLoading, error, onRefresh }: RealQueueListProps) {
  const toast = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Record<string, QueueDecisionStatus>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const { types: leaveTypes } = useLeaveTypes();

  const leaveTypesById = useMemo(() => new Map(leaveTypes.map((t) => [t.id, t])), [leaveTypes]);
  const recordByKey = useMemo(() => new Map(queue.map((r) => [compositeKey(r), r])), [queue]);
  const items = useMemo(
    () =>
      queue.map((record) =>
        mapToQueueItem(record, decisions[compositeKey(record)] ?? "pending", leaveTypesById),
      ),
    [queue, decisions, leaveTypesById],
  );

  async function handleAction(key: string, action: "approve" | "reject" | "undo") {
    const record = recordByKey.get(key);
    if (!record) return;

    setActionError(null);
    const basePath = record.kind === "extension" ? "/extensions" : "/leave-requests";
    const ACTION_LABEL: Record<typeof action, string> = {
      approve: "approved",
      reject: "rejected",
      undo: "reverted to pending",
    };
    try {
      await apiRequest(`${basePath}/${record.id}/${action}`, { method: "POST" });
      setDecisions((prev) => ({
        ...prev,
        [key]: action === "approve" ? "approved" : action === "reject" ? "rejected" : "pending",
      }));
      toast.success(`${record.employeeName}'s request was ${ACTION_LABEL[action]}.`);
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Something went wrong.";
      setActionError(message);
      toast.error(message);
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading your team’s requests…" />;
  }

  if (error) {
    return (
      <div className="rounded-[12px] border border-status-rejected-fg/20 bg-status-rejected-bg px-4 py-3 text-[13px] text-status-rejected-fg">
        Couldn&rsquo;t load the queue: {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[13px] border border-dashed border-[#C9CDD2] bg-card px-6 py-[52px] text-center">
        <div className="mx-auto mb-[14px] flex h-10 w-10 items-center justify-center rounded-[12px] bg-accent-tint text-[18px] text-accent">
          ✓
        </div>
        <div className="text-[15px] font-semibold">Queue clear</div>
        <div className="mx-auto mt-[5px] max-w-[340px] text-[13px] leading-[1.55] text-muted">
          Nothing is waiting on you right now. New requests appear here as your team submits them.
        </div>
        <button
          onClick={onRefresh}
          className="mt-4 rounded-[8px] border border-line bg-card px-[15px] py-2 text-[12.5px] font-medium transition-colors hover:bg-surface"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[10px]">
      {actionError ? (
        <div className="rounded-[10px] border border-status-rejected-fg/25 bg-status-rejected-bg/40 px-[13px] py-[10px] text-[12.5px] text-status-rejected-fg">
          {actionError}
        </div>
      ) : null}
      {items.map((item) => (
        <QueueRow
          key={item.id}
          item={item}
          expanded={expandedId === item.id}
          onToggle={() => setExpandedId((current) => (current === item.id ? null : item.id))}
          onApprove={() => handleAction(item.id, "approve")}
          onReject={() => handleAction(item.id, "reject")}
          onUndo={() => handleAction(item.id, "undo")}
        />
      ))}
    </div>
  );
}
