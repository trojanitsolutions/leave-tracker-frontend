import Link from "next/link";

interface AdminTopStatsProps {
  totalEmployees: number;
  departmentCount: number;
  currentlyOnLeave: number;
  upcomingThisMonth: number;
  notReturnedAsExpected: number;
  pendingApprovals: number;
  pendingOver3DaysOld: number;
  pendingUnpaidExtensions: number;
  pendingApproachingEligibility: number;
}

export function AdminTopStats({
  totalEmployees,
  departmentCount,
  currentlyOnLeave,
  upcomingThisMonth,
  notReturnedAsExpected,
  pendingApprovals,
  pendingOver3DaysOld,
  pendingUnpaidExtensions,
  pendingApproachingEligibility,
}: AdminTopStatsProps) {
  return (
    <div className="grid gap-[14px] lg:grid-cols-3">
      <div className="relative overflow-hidden rounded-[14px] bg-deep p-[18px_20px] text-white">
        <div
          className="absolute top-[-70px] right-[-70px] h-[220px] w-[220px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(11,150,175,0.35) 0%, rgba(11,150,175,0) 70%)" }}
        />
        <div className="relative font-mono text-[9.5px] tracking-[0.08em] text-white/[0.5]">
          HEADCOUNT · DOHA OFFICE
        </div>
        <div className="relative mt-[10px] flex items-end gap-[14px]">
          <div className="text-[40px] leading-[0.9] font-semibold tracking-[-0.035em] tabular-nums">
            {totalEmployees}
          </div>
          <div className="pb-1 text-[12.5px] text-white/[0.6]">
            total employees
            <br />
            across {departmentCount} departments
          </div>
        </div>
        <div className="relative mt-[18px] flex gap-[20px] border-t border-white/[0.12] pt-[14px]">
          <div>
            <div className="text-[19px] font-semibold tabular-nums text-[#5CD3E8]">
              {currentlyOnLeave}
            </div>
            <div className="text-[11.5px] text-white/[0.55]">currently on leave</div>
          </div>
          <div>
            <div className="text-[19px] font-semibold tabular-nums">{upcomingThisMonth}</div>
            <div className="text-[11.5px] text-white/[0.55]">upcoming this month</div>
          </div>
        </div>
      </div>

      <Link
        href="/leave-management"
        className="rounded-[14px] border border-[#FCD9A6] bg-[#FFFBF3] p-[18px_20px] transition-[border-color,box-shadow] hover:border-[#F0B45E] hover:shadow-[0_12px_30px_-24px_rgba(146,64,14,0.8)]"
      >
        <div className="flex items-center justify-between">
          <div className="font-mono text-[9.5px] tracking-[0.08em] text-[#92400E]">
            NOT RETURNED AS EXPECTED
          </div>
          <span className="inline-block h-[7px] w-[7px] rounded-full bg-[#D97706]" />
        </div>
        <div className="mt-[10px] text-[40px] leading-[0.9] font-semibold tracking-[-0.035em] tabular-nums text-[#92400E]">
          {notReturnedAsExpected}
        </div>
        <div className="mt-[9px] text-[12.5px] leading-[1.5] text-[#7C4A12]">
          Expected back before today, no return confirmed. Needs an HR call.
        </div>
        <div className="mt-3 text-[12.5px] font-semibold text-[#92400E]">Review now →</div>
      </Link>

      <div className="rounded-[14px] border border-line bg-card p-[18px_20px]">
        <div className="font-mono text-[9.5px] tracking-[0.08em] text-muted">
          PENDING APPROVALS
        </div>
        <div className="mt-[10px] text-[40px] leading-[0.9] font-semibold tracking-[-0.035em] tabular-nums">
          {pendingApprovals}
        </div>
        <div className="mt-3 flex flex-col gap-[6px]">
          <div className="flex justify-between text-[12px]">
            <span className="text-muted">Over 3 days old</span>
            <b className="text-[#92400E]">{pendingOver3DaysOld}</b>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-muted">Unpaid extensions</span>
            <b>{pendingUnpaidExtensions}</b>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-muted">Approaching eligibility</span>
            <b>{pendingApproachingEligibility}</b>
          </div>
        </div>
      </div>
    </div>
  );
}
