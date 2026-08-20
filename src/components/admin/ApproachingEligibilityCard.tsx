import { Card } from "@/components/ui/Card";
import { EligibilityItem } from "@/types/domain";

interface ApproachingEligibilityCardProps {
  items: EligibilityItem[];
}

export function ApproachingEligibilityCard({ items }: ApproachingEligibilityCardProps) {
  return (
    <Card className="p-[18px]">
      <div className="text-[13.5px] font-semibold">Approaching eligibility</div>
      <div className="mt-[2px] mb-[14px] text-[11.5px] text-muted">
        Completing one year within 60 days
      </div>
      {items.length === 0 ? (
        <div className="text-[12.5px] text-muted">No one is approaching their first year right now.</div>
      ) : (
      <div className="flex flex-col gap-[12px]">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-[11px]">
            <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-accent-tint text-[11px] font-semibold text-accent">
              {item.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12.5px] font-medium">{item.name}</div>
              <div className="font-mono text-[10.5px] text-muted">JOINED {item.joinedLabel}</div>
            </div>
            <div className="text-right">
              <div className="text-[12.5px] font-semibold tabular-nums">
                {item.daysUntilEligible}
              </div>
              <div className="text-[10.5px] text-muted">days</div>
            </div>
          </div>
        ))}
      </div>
      )}
    </Card>
  );
}
