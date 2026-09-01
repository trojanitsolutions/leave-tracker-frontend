import Link from "next/link";

interface ManagerOverviewStatCardsProps {
  teamSize: number;
  currentlyOnLeave: number;
  pendingApprovals: number;
  peopleOutNextWeek: number;
  notReturnedAsExpected: number;
}

export function ManagerOverviewStatCards({
  teamSize,
  currentlyOnLeave,
  pendingApprovals,
  peopleOutNextWeek,
  notReturnedAsExpected,
}: ManagerOverviewStatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-[12px] sm:grid-cols-3 lg:grid-cols-5">
      <div className="flex-1 rounded-[12px] border border-line bg-card px-[16px] py-[14px]">
        <div className="font-mono text-[9.5px] tracking-[0.07em] text-muted">TEAM SIZE</div>
        <div className="mt-1 text-[26px] font-semibold tabular-nums">{teamSize}</div>
      </div>
      <div className="flex-1 rounded-[12px] border border-line bg-card px-[16px] py-[14px]">
        <div className="font-mono text-[9.5px] tracking-[0.07em] text-muted">CURRENTLY ON LEAVE</div>
        <div className="mt-1 text-[26px] font-semibold tabular-nums">{currentlyOnLeave}</div>
      </div>
      <div className="flex-1 rounded-[12px] border border-line bg-card px-[16px] py-[14px]">
        <div className="font-mono text-[9.5px] tracking-[0.07em] text-muted">PEOPLE OUT NEXT WEEK</div>
        <div className="mt-1 text-[26px] font-semibold tabular-nums">{peopleOutNextWeek}</div>
      </div>
      <div className="flex-1 rounded-[12px] border border-[#FCD9A6] bg-[#FFFBF3] px-[16px] py-[14px]">
        <div className="font-mono text-[9.5px] tracking-[0.07em] text-[#92400E]">
          NOT RETURNED AS EXPECTED
        </div>
        <div className="mt-1 text-[26px] font-semibold tabular-nums text-[#92400E]">
          {notReturnedAsExpected}
        </div>
      </div>
      <Link
        href="/approvals"
        className={`flex-1 rounded-[12px] border px-[16px] py-[14px] transition-colors ${
          pendingApprovals > 0
            ? "border-[#FCD9A6] bg-[#FFFBF3] hover:border-[#F5C57E]"
            : "border-line bg-card hover:bg-surface"
        }`}
      >
        <div
          className={`font-mono text-[9.5px] tracking-[0.07em] ${
            pendingApprovals > 0 ? "text-[#92400E]" : "text-muted"
          }`}
        >
          PENDING APPROVALS
        </div>
        <div
          className={`mt-1 flex items-baseline gap-[6px] text-[26px] font-semibold tabular-nums ${
            pendingApprovals > 0 ? "text-[#92400E]" : ""
          }`}
        >
          {pendingApprovals}
          <span className="text-[11.5px] font-medium text-muted">review →</span>
        </div>
      </Link>
    </div>
  );
}
