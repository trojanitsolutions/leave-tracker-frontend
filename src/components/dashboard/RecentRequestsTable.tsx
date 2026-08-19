import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { EMPLOYEE_RECENT_REQUESTS } from "@/data/mock";
import { RecentLeaveRow } from "@/types/domain";

const GRID_COLS = "grid-cols-[1.4fr_1.5fr_0.5fr_1fr_0.9fr]";

interface RecentRequestsTableProps {
  rows?: RecentLeaveRow[];
}

export function RecentRequestsTable({ rows = EMPLOYEE_RECENT_REQUESTS }: RecentRequestsTableProps = {}) {
  return (
    <Card className="overflow-x-auto">
      <div className="flex items-center justify-between px-[20px] py-[15px] pb-[13px]">
        <div className="text-[12px] font-semibold tracking-[0.05em] text-muted uppercase">
          Recent requests
        </div>
        <Link href="/history" className="text-[12.5px] font-medium text-accent">
          View all →
        </Link>
      </div>

      <div
        className={`grid min-w-[700px] ${GRID_COLS} gap-[12px] border-y border-line bg-surface px-[20px] py-2 font-mono text-[9.5px] tracking-[0.07em] text-muted`}
      >
        <div>TYPE</div>
        <div>DATES</div>
        <div>DAYS</div>
        <div>BACK TO WORK</div>
        <div className="text-right">STATUS</div>
      </div>

      {rows.length === 0 ? (
        <div className="px-[20px] py-[24px] text-center text-[12.5px] text-muted">
          No leave requests yet.
        </div>
      ) : null}

      {rows.map((row, index) => (
        <div
          key={row.id}
          className={`grid min-w-[700px] ${GRID_COLS} items-center gap-[12px] border-b border-[#EFF0F2] px-[20px] py-[13px] transition-colors hover:bg-[#F9FAFB] ${
            index % 2 === 1 ? "bg-surface" : ""
          }`}
        >
          <div className="flex items-center gap-2 text-[13px] font-medium">
            {row.isChild ? <span className="font-mono text-[13px] text-muted-2">↳</span> : null}
            {row.type}
          </div>
          <div className="font-mono text-[11.5px] text-[#4E5359]">{row.dates}</div>
          <div className="text-[13px] tabular-nums">{row.days}</div>
          <div className="text-[12.5px] text-[#4E5359]">{row.backToWork}</div>
          <div className="flex justify-end">
            <StatusPill status={row.status} />
          </div>
        </div>
      ))}
    </Card>
  );
}
