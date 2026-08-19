import { Card } from "@/components/ui/Card";
import { MANAGER_SUMMARY } from "@/data/mock";

interface AwaitingDecisionCardProps {
  managerName?: string;
  managerRole?: string;
  pendingCount?: number;
  oldestPendingDays?: number;
}

export function AwaitingDecisionCard({
  managerName = MANAGER_SUMMARY.managerName,
  managerRole = MANAGER_SUMMARY.managerRole,
  pendingCount = MANAGER_SUMMARY.pendingCount,
  oldestPendingDays = MANAGER_SUMMARY.oldestPendingDays,
}: AwaitingDecisionCardProps = {}) {
  const initials = managerName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <Card className="p-[18px]">
      <div className="mb-[12px] text-[12px] font-semibold tracking-[0.05em] text-muted uppercase">
        Awaiting decision
      </div>
      <div className="flex items-center gap-[11px]">
        <div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full bg-accent-tint text-[12px] font-semibold text-accent">
          {initials}
        </div>
        <div className="flex-1">
          <div className="text-[13.5px] font-semibold">{managerName}</div>
          <div className="text-[11.5px] text-muted">{managerRole}</div>
        </div>
      </div>
      <div className="mt-[13px] flex justify-between border-t border-line pt-[12px] text-[12.5px]">
        {pendingCount > 0 ? (
          <>
            <div className="text-muted">{pendingCount} of your requests pending</div>
            <div className="font-semibold">oldest {oldestPendingDays} days</div>
          </>
        ) : (
          <div className="text-muted">Nothing pending with your manager right now.</div>
        )}
      </div>
    </Card>
  );
}
