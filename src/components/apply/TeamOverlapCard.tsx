import { Card } from "@/components/ui/Card";
import { TeamOverlapEntry } from "@/types/domain";

export function TeamOverlapCard({ entries }: { entries: TeamOverlapEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <Card className="p-[18px]">
      <div className="mb-[12px] text-[12px] font-semibold tracking-[0.05em] text-muted uppercase">
        Your team, same window
      </div>
      <div className="flex flex-col gap-[11px]">
        {entries.map((entry) => {
          const initials = entry.name
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("");
          return (
            <div key={entry.employeeId} className="flex items-center gap-[10px]">
              <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-surface text-[11px] font-semibold text-[#4E5359]">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-medium">{entry.name}</div>
                <div className="font-mono text-[10.5px] text-muted">{entry.dates}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-[13px] text-[11.5px] leading-relaxed text-muted">
        Shown so you can avoid clashing with cover. It does not block your request.
      </div>
    </Card>
  );
}
