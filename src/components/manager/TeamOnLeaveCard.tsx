import { Card } from "@/components/ui/Card";
import { OnLeaveRow } from "@/types/domain";

interface TeamOnLeaveCardProps {
  rows: OnLeaveRow[];
}

export function TeamOnLeaveCard({ rows }: TeamOnLeaveCardProps) {
  return (
    <Card className="p-[18px]">
      <div className="mb-[14px] text-[13.5px] font-semibold">Currently on leave</div>
      {rows.length === 0 ? (
        <div className="text-[12px] text-muted">No one on your team is on leave right now.</div>
      ) : (
        <div className="flex flex-col gap-[10px]">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center gap-[10px]">
              <div className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full bg-surface text-[10.5px] font-semibold text-[#4E5359]">
                {row.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-medium">{row.name}</div>
                <div className="text-[10.5px] text-muted">
                  {row.department} · {row.type}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[11px] text-[#4E5359]">{row.dates}</div>
                <div className="text-[10.5px] text-muted">Back {row.backToWork}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
